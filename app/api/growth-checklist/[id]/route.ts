import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { completed } = body;

    // Verify ownership via product
    const item = await prisma.growthChecklist.findFirst({
      where: { id },
      include: { product: { select: { userId: true } } },
    });

    if (!item || item.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const updated = await prisma.growthChecklist.update({
      where: { id },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update growth checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
