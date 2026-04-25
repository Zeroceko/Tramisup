import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { executeIntegrationSync } from "@/lib/integration-sync";
import type { MetricSyncMode } from "@/lib/sync-to-metric-entry";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Next.js 15: awaiting params
    const params = await context.params;
    const { id } = params;

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { product: true }
    });

    if (!integration || integration.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    if (integration.status !== "CONNECTED") {
      return NextResponse.json({ error: "Integration is not connected" }, { status: 400 });
    }

    if (!integration.config) {
      return NextResponse.json({ error: "Missing integration configuration" }, { status: 400 });
    }

    let syncMode: MetricSyncMode = "merge";
    let historyDays = 365;
    try {
      const body = await request.json();
      if (body?.syncMode === "overwrite" || body?.syncMode === "missing_dates" || body?.syncMode === "merge") {
        syncMode = body.syncMode;
      }
      if (typeof body?.historyDays === "number" && Number.isFinite(body.historyDays)) {
        historyDays = Math.max(30, Math.min(Math.floor(body.historyDays), 1095));
      }
    } catch {
      // No body provided
    }

    const result = await executeIntegrationSync(integration, { syncMode, historyDays });
    if (!result.success) {
      return NextResponse.json({ error: "Failed during provider data pull", details: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, recordsSynced: result.recordsSynced });
  } catch (error) {
    console.error("Sync route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
