import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, title, dueDate, priority } = await request.json();

    const action = await prisma.preLaunchAction.create({
      data: {
        projectId,
        title,
        dueDate: dueDate ? new Date(dueDate) : null,
        priority,
      },
    });

    return NextResponse.json(action, { status: 201 });
  } catch (error) {
    console.error("Error creating action:", error);
    return NextResponse.json(
      { error: "Failed to create action" },
      { status: 500 }
    );
  }
}
