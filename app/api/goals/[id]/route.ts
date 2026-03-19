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
    const { currentValue } = await request.json();

    const goal = await prisma.goal.findUnique({
      where: { id },
    });

    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const completed = currentValue >= goal.targetValue;

    const updatedGoal = await prisma.goal.update({
      where: { id },
      data: {
        currentValue,
        completed,
      },
    });

    if (completed && !goal.completed) {
      await prisma.timelineEvent.create({
        data: {
          projectId: goal.projectId,
          eventType: "GOAL_COMPLETED",
          title: `Goal achieved: ${goal.title}`,
          description: `Reached ${goal.targetValue} ${goal.unit}`,
          date: new Date(),
        },
      });
    }

    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error("Error updating goal:", error);
    return NextResponse.json(
      { error: "Failed to update goal" },
      { status: 500 }
    );
  }
}
