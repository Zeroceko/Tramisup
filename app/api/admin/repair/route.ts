/**
 * POST /api/admin/repair
 *
 * Admin-only endpoint to repair one or more historical products with broken/shallow plans.
 *
 * Body:
 *   productIds: string[]   — list of product IDs to repair (max 10 per call)
 *   dryRun?: boolean       — if true, shows before/after counts without changing data (default: false)
 *
 * Response:
 *   results: Array<{
 *     productId: string
 *     productName: string
 *     dryRun: boolean
 *     before: { launch, growth, tasks }
 *     after?: { launch, growth, tasks }   — only present when dryRun=false
 *     source?: PlanSource                 — only present when dryRun=false
 *     error?: string
 *   }>
 *
 * Safety rules (same as /api/products/[id]/regenerate):
 * - Completed checklist items are never deleted.
 * - Only AI_PLAN tasks that are not DONE are replaced.
 * - Max 10 products per request to prevent accidental mass mutation.
 * - dryRun=true is safe to run at any time — it reads but does not write.
 */

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan, type PlanSource } from "@/lib/ai-plan";
import { seedAiPlan } from "@/lib/seed";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tiramisup";
const MAX_PRODUCTS_PER_CALL = 10;

type RepairResult = {
  productId: string;
  productName: string;
  dryRun: boolean;
  before: { launch: number; growth: number; tasks: number };
  after?: { launch: number; growth: number; tasks: number };
  source?: PlanSource;
  error?: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { productIds?: unknown; dryRun?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { productIds, dryRun = false } = body;

  if (!Array.isArray(productIds) || productIds.length === 0) {
    return NextResponse.json({ error: "productIds must be a non-empty array" }, { status: 400 });
  }
  if (productIds.length > MAX_PRODUCTS_PER_CALL) {
    return NextResponse.json(
      { error: `Max ${MAX_PRODUCTS_PER_CALL} products per call` },
      { status: 400 },
    );
  }
  if (!productIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ error: "All productIds must be strings" }, { status: 400 });
  }

  const results: RepairResult[] = [];

  for (const productId of productIds as string[]) {
    try {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, description: true, category: true, targetAudience: true, businessModel: true, launchStatus: true },
      });

      if (!product) {
        results.push({
          productId,
          productName: "(not found)",
          dryRun: !!dryRun,
          before: { launch: 0, growth: 0, tasks: 0 },
          error: "Product not found",
        });
        continue;
      }

      const [launchCount, growthCount, taskCount] = await Promise.all([
        prisma.launchChecklist.count({ where: { productId } }),
        prisma.growthChecklist.count({ where: { productId } }),
        prisma.task.count({ where: { productId } }),
      ]);

      const before = { launch: launchCount, growth: growthCount, tasks: taskCount };

      if (dryRun) {
        results.push({
          productId,
          productName: product.name,
          dryRun: true,
          before,
        });
        continue;
      }

      // Generate new plan
      const { plan: newPlan, source } = await generateAiPlan({
        name: product.name,
        description: product.description ?? "",
        locale: "en",
        category: product.category ?? undefined,
        targetAudience: product.targetAudience ?? undefined,
        businessModel: product.businessModel ?? undefined,
        launchStatus: product.launchStatus ?? undefined,
      });

      // Apply repair in a transaction
      await prisma.$transaction(async (tx) => {
        await tx.launchChecklist.deleteMany({ where: { productId, completed: false } });
        await tx.growthChecklist.deleteMany({ where: { productId, completed: false } });
        await tx.task.deleteMany({ where: { productId, source: "AI_PLAN", status: { not: "DONE" } } });
        await seedAiPlan(productId, newPlan, tx, "en", source);
      });

      const [afterLaunch, afterGrowth, afterTasks] = await Promise.all([
        prisma.launchChecklist.count({ where: { productId } }),
        prisma.growthChecklist.count({ where: { productId } }),
        prisma.task.count({ where: { productId } }),
      ]);

      console.log(
        `[admin/repair] product=${productId} name="${product.name}" source=${source} ` +
        `launch: ${before.launch}->${afterLaunch} growth: ${before.growth}->${afterGrowth} tasks: ${before.tasks}->${afterTasks}`,
      );

      results.push({
        productId,
        productName: product.name,
        dryRun: false,
        before,
        after: { launch: afterLaunch, growth: afterGrowth, tasks: afterTasks },
        source,
      });
    } catch (err) {
      console.error(`[admin/repair] Failed for product ${productId}:`, err);
      results.push({
        productId,
        productName: "(error)",
        dryRun: !!dryRun,
        before: { launch: 0, growth: 0, tasks: 0 },
        error: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  return NextResponse.json({ results });
}
