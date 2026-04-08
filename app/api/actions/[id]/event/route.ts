import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emitTaskLifecycleEvent, type TaskLifecycleEvent } from "@/lib/task-events";

/**
 * Client-emitted task lifecycle events. Used for things the server can't
 * observe directly: DETAIL_OPENED (modal open), DISMISSED (founder closed
 * a suggested task without acting on it).
 *
 * STARTED / COMPLETED / REOPENED are NOT accepted here — those are emitted
 * by the PATCH endpoint where the actual status transition happens.
 */

const CLIENT_EMITTED: ReadonlySet<TaskLifecycleEvent> = new Set([
  "DETAIL_OPENED",
  "DISMISSED",
]);

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json().catch(() => ({}));
    const eventType = String(body?.eventType ?? "") as TaskLifecycleEvent;

    if (!CLIENT_EMITTED.has(eventType)) {
      return NextResponse.json({ error: "Invalid event type" }, { status: 400 });
    }

    const task = await prisma.task.findFirst({
      where: { id },
      select: { id: true, productId: true, product: { select: { userId: true } } },
    });
    if (!task || task.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await emitTaskLifecycleEvent({
      taskId: task.id,
      productId: task.productId,
      eventType,
      metadata: body?.metadata && typeof body.metadata === "object" ? body.metadata : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[task event] Failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
