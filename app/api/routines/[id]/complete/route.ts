import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const routine = await prisma.growthRoutine.update({
      where: { id },
      data: {
        lastCompletedAt: new Date(),
      },
    });

    await prisma.timelineEvent.create({
      data: {
        productId: routine.productId,
        eventType: "CUSTOM",
        title: `Completed: ${routine.title}`,
        date: new Date(),
      },
    });

    return NextResponse.json(routine);
  } catch (error) {
    console.error("Error completing routine:", error);
    return NextResponse.json(
      { error: "Failed to complete routine" },
      { status: 500 }
    );
  }
}
