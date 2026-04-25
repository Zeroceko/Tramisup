import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { executeIntegrationSync } from "@/lib/integration-sync";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const MIN_HOURS_BETWEEN_CRON_SYNCS = 20;
const CRON_HISTORY_DAYS = 30;

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  return Boolean(
    process.env.CRON_SECRET &&
      authHeader === `Bearer ${process.env.CRON_SECRET}`,
  );
}

function hasSelectedGa4Property(config: string | null) {
  if (!config) return false;
  try {
    const parsed = JSON.parse(config) as { propertyId?: unknown };
    return typeof parsed.propertyId === "string" && parsed.propertyId.length > 0;
  } catch {
    return false;
  }
}

function shouldSync(lastSyncAt: Date | null, now: Date) {
  if (!lastSyncAt) return true;
  return now.getTime() - lastSyncAt.getTime() >= MIN_HOURS_BETWEEN_CRON_SYNCS * 60 * 60 * 1000;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();
  const integrations = await prisma.integration.findMany({
    where: {
      status: "CONNECTED",
      config: { not: null },
      provider: { in: ["GA4", "STRIPE"] },
    },
    select: {
      id: true,
      productId: true,
      provider: true,
      config: true,
      lastSyncAt: true,
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: { updatedAt: "asc" },
  });

  const results: Array<{
    integrationId: string;
    provider: string;
    productName: string;
    status: "skipped" | "success" | "failed";
    reason?: string;
    recordsSynced?: number;
  }> = [];

  for (const integration of integrations) {
    if (!shouldSync(integration.lastSyncAt, now)) {
      results.push({
        integrationId: integration.id,
        provider: integration.provider,
        productName: integration.product.name,
        status: "skipped",
        reason: "recently_synced",
      });
      continue;
    }

    if (integration.provider === "GA4" && !hasSelectedGa4Property(integration.config)) {
      results.push({
        integrationId: integration.id,
        provider: integration.provider,
        productName: integration.product.name,
        status: "skipped",
        reason: "missing_ga4_property",
      });
      continue;
    }

    const result = await executeIntegrationSync(integration, {
      syncMode: "merge",
      historyDays: CRON_HISTORY_DAYS,
    });

    results.push({
      integrationId: integration.id,
      provider: integration.provider,
      productName: integration.product.name,
      status: result.success ? "success" : "failed",
      reason: result.error,
      recordsSynced: result.recordsSynced,
    });
  }

  return NextResponse.json({
    success: true,
    checked: integrations.length,
    synced: results.filter((result) => result.status === "success").length,
    failed: results.filter((result) => result.status === "failed").length,
    skipped: results.filter((result) => result.status === "skipped").length,
    results,
  });
}
