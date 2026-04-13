import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeCompletionEffects,
  reverseCompletionEffects,
} from "@/lib/task-completion-effects";
import { emitTaskLifecycleEvent } from "@/lib/task-events";
import { buildTaskStatusTransition } from "@/lib/task-status-transition";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Verify ownership; include linked checklist with full metadata
    const existing = await prisma.task.findFirst({
      where: { id },
      select: {
        id: true,
        productId: true,
        status: true,
        startedAt: true,
        completedAt: true,
        product: { select: { userId: true } },
        launchChecklistItem: {
          select: {
            id: true,
            title: true,
            category: true,
            completed: true,
            priority: true,
          },
        },
      },
    });
    if (!existing || existing.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const wasDone = existing.status === "DONE";
    const transition = buildTaskStatusTransition(
      {
        status: existing.status,
        startedAt: existing.startedAt,
        completedAt: existing.completedAt,
      },
      body.status,
    );
    const isNowDone = body.status === "DONE";

    const task = await prisma.task.update({
      where: { id },
      data: transition.data,
    });

    // Lifecycle instrumentation stays explicit so STARTED/REOPENED do not fire twice
    // when completion cascades also run below.
    if (transition.eventType === "STARTED") {
      await emitTaskLifecycleEvent({
        taskId: task.id,
        productId: task.productId,
        eventType: "STARTED",
        metadata: { from: existing.status },
      });
    }

    // ── Forward cascade: task completed ──
    if (isNowDone && !wasDone) {
      if (transition.eventType === "COMPLETED") {
        await emitTaskLifecycleEvent({
          taskId: task.id,
          productId: task.productId,
          eventType: "COMPLETED",
          metadata: { from: existing.status, hadChecklistLink: !!existing.launchChecklistItem },
        });
      }
      const effects = await computeCompletionEffects(
        existing.productId,
        existing.launchChecklistItem
      );
      return NextResponse.json({ task, effects, reversed: false });
    }

    // ── Reverse cascade: task un-completed ──
    if (!isNowDone && wasDone) {
      if (transition.eventType === "REOPENED") {
        await emitTaskLifecycleEvent({
          taskId: task.id,
          productId: task.productId,
          eventType: "REOPENED",
          metadata: { to: body.status },
        });
      }
      const checklistReverted = await reverseCompletionEffects(
        existing.launchChecklistItem
      );
      return NextResponse.json({
        task,
        effects: null,
        reversed: checklistReverted,
      });
    }

    // ── No cascade (e.g. TODO → IN_PROGRESS) ──
    return NextResponse.json({ task, effects: null, reversed: false });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
