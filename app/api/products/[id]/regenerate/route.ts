/**
 * POST /api/products/[id]/regenerate
 *
 * Safely regenerates the launch plan (checklist + growth checklist + tasks)
 * for a single product owned by the authenticated user.
 *
 * Safety rules:
 * - Only deletes INCOMPLETE checklist items — completed items represent real work done.
 * - Only deletes AI_PLAN tasks that are not DONE.
 * - Regenerates using current product data from the DB (not stale onboarding cache).
 * - Updates planMeta with source + counts + timestamp.
 * - Does NOT touch metric setup, metric entries, goals, routines, or integrations.
 */

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan } from "@/lib/ai-plan";
import { seedAiPlan } from "@/lib/seed";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: productId } = await params;

    // Verify ownership
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Snapshot before counts for the response diff
    const beforeLaunch = await prisma.launchChecklist.count({ where: { productId } });
    const beforeGrowth = await prisma.growthChecklist.count({ where: { productId } });
    const beforeTasks = await prisma.task.count({ where: { productId } });

    // Generate new plan before touching any DB data
    const locale = "en"; // product locale is not stored — default to English
    const { plan: newPlan, source } = await generateAiPlan({
      name: product.name,
      description: product.description ?? "",
      locale,
      category: product.category ?? undefined,
      targetAudience: product.targetAudience ?? undefined,
      businessModel: product.businessModel ?? undefined,
      launchStatus: product.launchStatus ?? undefined,
    });

    // Apply in a transaction: delete incomplete items, seed fresh plan
    await prisma.$transaction(async (tx) => {
      // Delete incomplete launch checklist items only
      await tx.launchChecklist.deleteMany({
        where: { productId, completed: false },
      });

      // Delete incomplete growth checklist items only
      await tx.growthChecklist.deleteMany({
        where: { productId, completed: false },
      });

      // Delete non-DONE AI_PLAN tasks only
      await tx.task.deleteMany({
        where: {
          productId,
          source: "AI_PLAN",
          status: { not: "DONE" },
        },
      });

      await seedAiPlan(productId, newPlan, tx, locale, source);
    });

    const afterLaunch = await prisma.launchChecklist.count({ where: { productId } });
    const afterGrowth = await prisma.growthChecklist.count({ where: { productId } });
    const afterTasks = await prisma.task.count({ where: { productId } });

    console.log(
      `[regenerate] product=${productId} source=${source} ` +
      `launch: ${beforeLaunch}->${afterLaunch} growth: ${beforeGrowth}->${afterGrowth} tasks: ${beforeTasks}->${afterTasks}`,
    );

    return NextResponse.json({
      success: true,
      source,
      diff: {
        launch: { before: beforeLaunch, after: afterLaunch },
        growth: { before: beforeGrowth, after: afterGrowth },
        tasks: { before: beforeTasks, after: afterTasks },
      },
    });
  } catch (error) {
    console.error("[regenerate] Failed:", error);
    return NextResponse.json({ error: "Failed to regenerate plan" }, { status: 500 });
  }
}
