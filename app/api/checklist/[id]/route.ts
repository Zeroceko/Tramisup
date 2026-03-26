import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateIgnoredChecklistIds } from "@/lib/metric-setup";

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
    const { completed, ignored } = await request.json();

    const existingItem = await prisma.launchChecklist.findFirst({
      where: { id },
      include: { product: true },
    });

    if (!existingItem || existingItem.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (typeof ignored === "boolean") {
      const setup = await prisma.metricSetup.findUnique({
        where: { productId: existingItem.productId },
      });
      const ignoredIds = new Set<string>(setup?.ignoredChecklistIds ?? []);

      if (ignored) {
        ignoredIds.add(id);
      } else {
        ignoredIds.delete(id);
      }

      await updateIgnoredChecklistIds(existingItem.productId, Array.from(ignoredIds));

      return NextResponse.json({ id, ignored });
    }

    const item = await prisma.launchChecklist.update({
      where: { id },
      data: {
        completed,
        completedAt: completed ? new Date() : null,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error updating checklist item:", error);
    return NextResponse.json(
      { error: "Failed to update checklist item" },
      { status: 500 }
    );
  }
}
