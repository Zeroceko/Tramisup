/**
 * Canonical task creation. Every surface that produces a Task must go through
 * this function — ai-plan, agent chat, manual UI add, completion-effects
 * follow-ups, founder coach. The point is to enforce the same quality contract
 * (validation, dedupe, schema completeness, category, instrumentation) in
 * exactly one place instead of five.
 *
 * Behavior:
 *   1. Validate the candidate against task-validator rules. Failure = throw
 *      TaskCreationError so the caller can decide whether to fall back.
 *   2. Look up existing OPEN tasks for the product. If a near-duplicate exists,
 *      return that existing task and emit a DEDUPED TaskEvent — DO NOT create
 *      a second row. This is what kills the "ai-plan and founder-coach both
 *      created 'Set up GA4'" failure mode.
 *   3. Create the Task with the structured columns populated and a CREATED
 *      TaskEvent for instrumentation.
 *
 * Manual user-typed tasks may opt out of validation via skipValidation, since
 * the founder might legitimately add a one-word reminder. Even then, dedupe
 * still runs.
 */

import type { PrismaClient, Prisma, Task } from "@prisma/client";
import { prisma as defaultPrisma } from "@/lib/prisma";
import {
  validateTaskCandidate,
  type Locale,
  type TaskCandidate,
  type ValidationFailureReason,
} from "@/lib/task-validator";
import { tasksAreNearDuplicate } from "@/lib/task-parsing";
import type { TaskLifecycleEvent } from "@/lib/task-events";

export type TaskSource =
  | "AI_PLAN"
  | "AGENT_CHAT"
  | "MANUAL"
  | "CHECKLIST"
  | "COMPLETION_EFFECT"
  | "FOUNDER_COACH";

export type CreateTaskInput = TaskCandidate & {
  productId: string;
  source: TaskSource;
  locale: Locale;
  dueDate?: Date | null;
  /** Manual entry from a human — bypass strict validation, keep dedupe. */
  skipValidation?: boolean;
  /** Optional checklist linkage (for follow-ups generated from launch items). */
  linkedChecklistId?: string;
};

export type CreateTaskResult = {
  task: Task;
  /** True when an existing matching task was returned instead of creating a new one. */
  deduped: boolean;
  /** Title of the task that absorbed this candidate, if deduped. */
  dedupedAgainst?: string;
};

export class TaskCreationError extends Error {
  constructor(
    public reason: ValidationFailureReason | "unauthorized" | "missing_fields",
    public detail?: string,
  ) {
    super(`Task creation failed: ${reason}${detail ? ` (${detail})` : ""}`);
    this.name = "TaskCreationError";
  }
}

type TxLike = PrismaClient | Prisma.TransactionClient;

async function emitTaskEvent(
  db: TxLike,
  args: { taskId: string; productId: string; eventType: TaskLifecycleEvent; metadata?: Record<string, unknown> },
) {
  // Local emit so we can write inside the same transaction the task was
  // created in. lib/task-events.emitTaskLifecycleEvent is the equivalent
  // for non-transactional contexts.
  try {
    await db.taskEvent.create({
      data: {
        taskId: args.taskId,
        productId: args.productId,
        eventType: args.eventType,
        metadata: args.metadata ? JSON.stringify(args.metadata) : null,
      },
    });
  } catch (err) {
    // Instrumentation must never break the write path.
    console.error("[task-create] Failed to emit TaskEvent:", err);
  }
}

export async function createTaskWithGuards(
  input: CreateTaskInput,
  db: TxLike = defaultPrisma,
): Promise<CreateTaskResult> {
  if (!input.productId) {
    throw new TaskCreationError("missing_fields", "productId required");
  }
  if (!input.title || !input.title.trim()) {
    throw new TaskCreationError("missing_fields", "title required");
  }

  // ── 1. Validate (unless this is a manual entry from a human) ───────────────
  let normalized:
    | Extract<ReturnType<typeof validateTaskCandidate>, { valid: true }>["normalized"]
    | null = null;

  if (!input.skipValidation) {
    const result = validateTaskCandidate(input, input.locale);
    if (!result.valid) {
      throw new TaskCreationError(result.reason, result.detail);
    }
    normalized = result.normalized;
  }

  const titleForCheck = (normalized?.title ?? input.title).trim();

  // ── 2. Dedupe against existing open tasks for this product ─────────────────
  const existingOpen = await db.task.findMany({
    where: {
      productId: input.productId,
      status: { in: ["TODO", "IN_PROGRESS"] },
    },
    select: { id: true, title: true },
  });

  const dupe = existingOpen.find((t) => tasksAreNearDuplicate(t.title, titleForCheck));
  if (dupe) {
    await emitTaskEvent(db, {
      taskId: dupe.id,
      productId: input.productId,
      eventType: "DEDUPED",
      metadata: { incomingTitle: titleForCheck, source: input.source },
    });
    const fullTask = await db.task.findUnique({ where: { id: dupe.id } });
    return {
      task: fullTask!,
      deduped: true,
      dedupedAgainst: dupe.title,
    };
  }

  // ── 3. Create the row with structured columns + CREATED event ──────────────
  const created = await db.task.create({
    data: {
      productId: input.productId,
      title: normalized?.title ?? titleForCheck,
      description: normalized?.description ?? input.description ?? null,
      whyItMatters: normalized?.whyItMatters ?? input.whyItMatters ?? null,
      doneCriteria: normalized?.doneCriteria ?? input.doneCriteria ?? null,
      nextAction: normalized?.nextAction ?? input.nextAction ?? null,
      category: normalized?.category ?? input.category ?? null,
      priority: normalized?.priority ?? input.priority ?? "MEDIUM",
      status: "TODO",
      source: input.source,
      dueDate: input.dueDate ?? null,
    },
  });

  await emitTaskEvent(db, {
    taskId: created.id,
    productId: input.productId,
    eventType: "CREATED",
    metadata: { source: input.source, category: created.category },
  });

  return { task: created, deduped: false };
}

/**
 * Best-effort variant: validates, dedupes, and either returns the result or
 * null on failure (no throw). Used by surfaces that need to silently skip
 * bad candidates rather than abort the whole batch (e.g. AI plan seeding).
 */
export async function tryCreateTaskWithGuards(
  input: CreateTaskInput,
  db: TxLike = defaultPrisma,
): Promise<CreateTaskResult | null> {
  try {
    return await createTaskWithGuards(input, db);
  } catch (err) {
    if (err instanceof TaskCreationError) {
      console.warn(
        `[task-create] Skipped task "${input.title}" — reason: ${err.reason}${err.detail ? ` (${err.detail})` : ""}`,
      );
      return null;
    }
    throw err;
  }
}
