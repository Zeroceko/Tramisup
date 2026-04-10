/**
 * GET /api/admin/plan-quality
 *
 * Admin-only observability endpoint. Returns plan quality metrics across all products:
 * - fallback rate (how many products used static fallback vs AI)
 * - launch item count distribution
 * - thin plan detection (products that still have < 5 launch items)
 * - plan source breakdown
 *
 * Query params:
 *   limit?: number   — max products to scan (default: 200, max: 500)
 */

import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tiramisup";
const THIN_LAUNCH_THRESHOLD = 5;

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") ?? "200", 10), 500);

  // Fetch recent products with their planMeta and checklist counts
  const products = await prisma.product.findMany({
    take: limit,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      planMeta: true,
      createdAt: true,
      _count: {
        select: {
          launchChecklists: true,
          growthChecklists: true,
          tasks: true,
        },
      },
    },
  });

  const sourceCounts: Record<string, number> = { ai: 0, sanitized_ai: 0, fallback: 0, unknown: 0 };
  const thinProducts: Array<{ id: string; name: string; launchCount: number; planMeta: unknown }> = [];
  const launchCountBuckets: Record<string, number> = { "0": 0, "1-4": 0, "5-9": 0, "10-14": 0, "15+": 0 };

  for (const p of products) {
    // Parse planMeta
    let meta: { source?: string } | null = null;
    if (p.planMeta) {
      try {
        meta = JSON.parse(p.planMeta);
      } catch {
        // ignore malformed
      }
    }

    const source = meta?.source ?? "unknown";
    sourceCounts[source in sourceCounts ? source : "unknown"]++;

    // Launch count bucketing (only pre-launch products care about launch items)
    const launchCount = p._count.launchChecklists;
    if (p.status === "PRE_LAUNCH") {
      if (launchCount === 0) launchCountBuckets["0"]++;
      else if (launchCount <= 4) launchCountBuckets["1-4"]++;
      else if (launchCount <= 9) launchCountBuckets["5-9"]++;
      else if (launchCount <= 14) launchCountBuckets["10-14"]++;
      else launchCountBuckets["15+"]++;

      // Flag thin pre-launch products
      if (launchCount < THIN_LAUNCH_THRESHOLD) {
        thinProducts.push({ id: p.id, name: p.name, launchCount, planMeta: meta });
      }
    }
  }

  const total = products.length;
  const fallbackRate = total > 0 ? ((sourceCounts.fallback + sourceCounts.unknown) / total * 100).toFixed(1) : "0";
  const aiRate = total > 0 ? (sourceCounts.ai / total * 100).toFixed(1) : "0";

  return NextResponse.json({
    scanned: total,
    fallbackRate: `${fallbackRate}%`,
    aiSuccessRate: `${aiRate}%`,
    sourceCounts,
    thinPreLaunchProducts: {
      count: thinProducts.length,
      threshold: THIN_LAUNCH_THRESHOLD,
      products: thinProducts.slice(0, 50), // cap list for readability
    },
    launchCountDistribution: launchCountBuckets,
    generatedAt: new Date().toISOString(),
  });
}
