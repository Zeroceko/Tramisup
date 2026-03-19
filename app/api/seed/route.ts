import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedProjectData } from "@/lib/seed";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Clear existing demo data
    await prisma.metric.deleteMany({ where: { projectId: project.id } });
    await prisma.preLaunchChecklist.deleteMany({ where: { projectId: project.id } });
    await prisma.preLaunchAction.deleteMany({ where: { projectId: project.id } });
    await prisma.retentionCohort.deleteMany({ where: { projectId: project.id } });
    await prisma.activationFunnel.deleteMany({ where: { projectId: project.id } });
    await prisma.goal.deleteMany({ where: { projectId: project.id } });
    await prisma.growthRoutine.deleteMany({ where: { projectId: project.id } });
    await prisma.timelineEvent.deleteMany({ where: { projectId: project.id } });

    await seedProjectData(project.id);

    return NextResponse.json({ message: "Demo data seeded successfully!" });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
