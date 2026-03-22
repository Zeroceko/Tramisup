import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan } from "@/lib/ai-plan";
import { seedAiPlan, seedStaticChecklists, seedMetricsData } from "@/lib/seed";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      targetAudience,
      businessModel,
      website,
      launchGoals,
      seedData = false,
      // Extended wizard fields for AI plan
      launchDate,
      launchStatus,
      pricingStrategy,
      growthChannels,
      successMetric,
      trackingMetrics,
      teamSize,
      userRole,
      firstTask,
    } = body;

    if (!name || !category || !targetAudience || !businessModel) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    // 1. Generate AI plan BEFORE transaction (Gemini call, non-blocking on failure)
    const aiPlan = await generateAiPlan({
      name,
      description,
      category,
      targetAudience,
      launchStatus,
      businessModel,
      pricingStrategy,
      launchGoals: Array.isArray(launchGoals)
        ? launchGoals
        : launchGoals
        ? JSON.parse(launchGoals)
        : [],
      growthChannels,
      successMetric,
      trackingMetrics,
      teamSize,
      userRole,
      website,
      launchDate,
      firstTask,
    });

    // 2. Create product + seed data in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          userId: session.user.id,
          name,
          status: "PRE_LAUNCH",
          category,
          description,
          targetAudience,
          businessModel,
          website: website || null,
          launchGoals: launchGoals ? JSON.stringify(launchGoals) : null,
        },
      });

      // Always seed checklists: AI-generated if available, static fallback otherwise
      if (aiPlan) {
        await seedAiPlan(newProduct.id, aiPlan, tx);
      } else {
        await seedStaticChecklists(newProduct.id, tx);
      }

      // Seed demo metrics only if user opted in
      if (seedData) {
        await seedMetricsData(newProduct.id, tx);
      }

      return newProduct;
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
