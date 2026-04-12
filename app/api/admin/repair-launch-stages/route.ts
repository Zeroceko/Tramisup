import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildLaunchStageRepairData,
  isCanonicalLaunchStageKey,
} from "@/lib/launch-stage";

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? "admin@tiramisup";
const MAX_PRODUCTS_PER_CALL = 100;

type RepairResult = {
  productId: string;
  productName: string;
  before: {
    launchStatus: string | null;
    status: string;
  };
  after?: {
    launchStatus: string | null;
    status: string;
  };
  changed: boolean;
  error?: string;
};

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || session.user.email !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { dryRun?: unknown; productIds?: unknown };
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  const dryRun = body.dryRun === true;
  const productIds = Array.isArray(body.productIds)
    ? body.productIds.filter((value): value is string => typeof value === "string")
    : [];

  if (productIds.length > MAX_PRODUCTS_PER_CALL) {
    return NextResponse.json(
      { error: `Max ${MAX_PRODUCTS_PER_CALL} products per call` },
      { status: 400 },
    );
  }

  const products = await prisma.product.findMany({
    where: productIds.length > 0 ? { id: { in: productIds } } : undefined,
    select: {
      id: true,
      name: true,
      launchStatus: true,
      status: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const candidates = products.filter((product) => {
    const repair = buildLaunchStageRepairData(product);
    if (!repair) return false;
    return (
      !isCanonicalLaunchStageKey(product.launchStatus) ||
      product.launchStatus !== repair.launchStatus ||
      product.status !== repair.status
    );
  });

  const results: RepairResult[] = [];

  for (const product of candidates) {
    const repair = buildLaunchStageRepairData(product);
    if (!repair) continue;

    const result: RepairResult = {
      productId: product.id,
      productName: product.name,
      before: {
        launchStatus: product.launchStatus,
        status: product.status,
      },
      changed:
        product.launchStatus !== repair.launchStatus || product.status !== repair.status,
      after: {
        launchStatus: repair.launchStatus,
        status: repair.status,
      },
    };

    if (!dryRun && result.changed) {
      try {
        await prisma.product.update({
          where: { id: product.id },
          data: repair,
        });
      } catch (error) {
        result.error = error instanceof Error ? error.message : "Unknown error";
      }
    }

    results.push(result);
  }

  return NextResponse.json({
    dryRun,
    scanned: products.length,
    matched: results.length,
    repaired: dryRun ? 0 : results.filter((result) => result.changed && !result.error).length,
    results,
  });
}
