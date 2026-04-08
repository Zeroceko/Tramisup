import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  computeCompletionEffects,
  reverseCompletionEffects,
} from "@/lib/task-completion-effects";
import { emitTaskLifecycleEvent } from "@/lib/task-events";

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
      include: {
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
    const wasInProgress = existing.status === "IN_PROGRESS";
    const isNowDone = body.status === "DONE";
    const isNowInProgress = body.status === "IN_PROGRESS";

    const task = await prisma.task.update({
      where: { id },
      data: { status: body.status },
    });

    // ── Lifecycle instrumentation ──
    // STARTED: anything → IN_PROGRESS (excluding the redundant IN_PROGRESS→IN_PROGRESS)
    if (isNowInProgress && !wasInProgress) {
      await emitTaskLifecycleEvent({
        taskId: task.id,
        productId: task.productId,
        eventType: "STARTED",
        metadata: { from: existing.status },
      });
    }
    // COMPLETED / REOPENED handled below alongside the cascade.

    // ── Forward cascade: task completed ──
    if (isNowDone && !wasDone) {
      await emitTaskLifecycleEvent({
        taskId: task.id,
        productId: task.productId,
        eventType: "COMPLETED",
        metadata: { from: existing.status, hadChecklistLink: !!existing.launchChecklistItem },
      });
      const effects = await computeCompletionEffects(
        existing.productId,
        existing.launchChecklistItem
      );
      return NextResponse.json({ task, effects, reversed: false });
    }

    // ── Reverse cascade: task un-completed ──
    if (!isNowDone && wasDone) {
      await emitTaskLifecycleEvent({
        taskId: task.id,
        productId: task.productId,
        eventType: "REOPENED",
        metadata: { to: body.status },
      });
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
