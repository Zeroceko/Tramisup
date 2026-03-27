import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

    // Verify ownership via product; include linked checklist item
    const existing = await prisma.task.findFirst({
      where: { id },
      include: {
        product: { select: { userId: true } },
        launchChecklistItem: { select: { id: true, completed: true } },
      },
    });
    if (!existing || existing.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const task = await prisma.task.update({
      where: { id },
      data: { status: body.status },
    });

    // Auto-complete the linked launch checklist item when task → DONE
    if (
      body.status === "DONE" &&
      existing.launchChecklistItem &&
      !existing.launchChecklistItem.completed
    ) {
      await prisma.launchChecklist.update({
        where: { id: existing.launchChecklistItem.id },
        data: { completed: true },
      });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json(
      { error: "Failed to update task" },
      { status: 500 }
    );
  }
}
