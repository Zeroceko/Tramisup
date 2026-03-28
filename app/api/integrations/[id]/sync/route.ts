import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncStripe } from "@/BrandLib/sync/stripe";
import { syncGa4 } from "@/BrandLib/sync/ga4";
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
    try {
      const body = await request.json();
      if (body?.syncMode === "overwrite" || body?.syncMode === "missing_dates" || body?.syncMode === "merge") {
        syncMode = body.syncMode;
      }
    } catch {
      // No body provided
    }

    const syncJob = await prisma.syncJob.create({
      data: {
        integrationId: integration.id,
        status: "RUNNING",
      }
    });

    let recordsSynced = 0;

    try {
      if (integration.provider === "STRIPE") {
        recordsSynced = await syncStripe(integration.productId, integration.config);
      } else if (integration.provider === "GA4") {
        recordsSynced = await syncGa4(integration.productId, integration.config, syncMode);
      } else {
        throw new Error("Provider sync algorithm not implemented");
      }

      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { status: "SUCCESS", completedAt: new Date(), recordsSynced }
      });

      await prisma.integration.update({
        where: { id: integration.id },
        data: { lastSyncAt: new Date() }
      });

      return NextResponse.json({ success: true, recordsSynced });
    } catch (syncError) {
      console.error("Provider sync execution error: ", syncError);
      
      await prisma.syncJob.update({
        where: { id: syncJob.id },
        data: { status: "FAILED", completedAt: new Date(), error: String(syncError) }
      });
      return NextResponse.json({ error: "Failed during provider data pull", details: String(syncError) }, { status: 500 });
    }
  } catch (error) {
    console.error("Sync route error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
