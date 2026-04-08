/**
 * Task lifecycle instrumentation. Sprint-3 measurement layer.
 *
 * Every meaningful interaction with a Task emits a TaskEvent row so we can
 * answer the question the founder coach playbook asks: "are users acting on
 * fewer but better tasks?". Without these events, all we have is a count of
 * tasks created — which we already know is too high.
 *
 * Event types in use:
 *   CREATED        — emitted by createTaskWithGuards when a row is written.
 *   DEDUPED        — incoming candidate matched an existing task and was dropped.
 *   DETAIL_OPENED  — founder opened the detail modal.
 *   STARTED        — founder transitioned a task TODO → IN_PROGRESS.
 *   COMPLETED      — founder transitioned to DONE.
 *   REOPENED       — founder transitioned DONE → not-DONE.
 *   DISMISSED      — founder hid or removed a task without completing it.
 *
 * Instrumentation must NEVER block the write path. All emit functions swallow
 * their errors.
 */

import { prisma } from "@/lib/prisma";

export type TaskLifecycleEvent =
  | "CREATED"
  | "DEDUPED"
  | "DETAIL_OPENED"
  | "STARTED"
  | "COMPLETED"
  | "REOPENED"
  | "DISMISSED";

export async function emitTaskLifecycleEvent(args: {
  taskId: string;
  productId: string;
  eventType: TaskLifecycleEvent;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.taskEvent.create({
      data: {
        taskId: args.taskId,
        productId: args.productId,
        eventType: args.eventType,
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      },
    });
  } catch (err) {
    console.error("[task-events] Failed to emit", args.eventType, err);
  }
}

/**
 * Aggregate report for one product. Used by the measurement endpoint to
 * answer "fewer but better": how many tasks created vs completed vs ignored,
 * what the dedupe save rate looks like, and how often the founder actually
 * opens a task detail before acting on it.
 */
export async function getTaskQualityReport(productId: string, daysBack = 30) {
  const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000);
  const events = await prisma.taskEvent.findMany({
    where: { productId, createdAt: { gte: since } },
    select: { eventType: true, taskId: true },
  });

  const counts: Record<TaskLifecycleEvent, number> = {
    CREATED: 0,
    DEDUPED: 0,
    DETAIL_OPENED: 0,
    STARTED: 0,
    COMPLETED: 0,
    REOPENED: 0,
    DISMISSED: 0,
  };
  for (const e of events) {
    if (e.eventType in counts) counts[e.eventType as TaskLifecycleEvent]++;
  }

  const created = counts.CREATED;
  const acted = new Set<string>();
  for (const e of events) {
    if (e.eventType === "STARTED" || e.eventType === "COMPLETED") acted.add(e.taskId);
  }
  const actedCount = acted.size;

  return {
    windowDays: daysBack,
    counts,
    /** Ratio of created tasks that the founder actually started or completed. */
    actionRate: created > 0 ? actedCount / created : 0,
    /** Dedupe save rate: how many candidates collapsed into existing tasks. */
    dedupeSaveRate:
      counts.CREATED + counts.DEDUPED > 0
        ? counts.DEDUPED / (counts.CREATED + counts.DEDUPED)
        : 0,
    /** Completion rate within window. */
    completionRate: created > 0 ? counts.COMPLETED / created : 0,
  };
}
