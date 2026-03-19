import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedProductData } from "@/lib/seed";

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const product = await prisma.product.findFirst({
      where: { userId: session.user.id },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Clear existing demo data
    await prisma.metric.deleteMany({ where: { productId: product.id } });
    await prisma.launchChecklist.deleteMany({ where: { productId: product.id } });
    await prisma.growthChecklist.deleteMany({ where: { productId: product.id } });
    await prisma.task.deleteMany({ where: { productId: product.id } });
    await prisma.retentionCohort.deleteMany({ where: { productId: product.id } });
    await prisma.activationFunnel.deleteMany({ where: { productId: product.id } });
    await prisma.goal.deleteMany({ where: { productId: product.id } });
    await prisma.growthRoutine.deleteMany({ where: { productId: product.id } });
    await prisma.timelineEvent.deleteMany({ where: { productId: product.id } });

    await seedProductData(product.id);

    return NextResponse.json({ message: "Demo data seeded successfully!" });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json({ error: "Failed to seed data" }, { status: 500 });
  }
}
