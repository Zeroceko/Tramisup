import type { IntegrationProvider } from "@prisma/client";
import { syncAppStoreConnect } from "@/BrandLib/sync/app-store-connect";
import { syncGa4 } from "@/BrandLib/sync/ga4";
import { syncGooglePlay } from "@/BrandLib/sync/google-play";
import { syncStripe } from "@/BrandLib/sync/stripe";
import { prisma } from "@/lib/prisma";
import type { MetricSyncMode } from "@/lib/sync-to-metric-entry";

type SyncableIntegration = {
  id: string;
  productId: string;
  provider: IntegrationProvider;
  config: string | null;
};

export type IntegrationSyncResult = {
  success: boolean;
  recordsSynced: number;
  error?: string;
};

export async function executeIntegrationSync(
  integration: SyncableIntegration,
  options: {
    syncMode?: MetricSyncMode;
    historyDays?: number;
  } = {},
): Promise<IntegrationSyncResult> {
  if (!integration.config) {
    return { success: false, recordsSynced: 0, error: "Missing integration configuration" };
  }

  const syncJob = await prisma.syncJob.create({
    data: {
      integrationId: integration.id,
      status: "RUNNING",
    },
  });

  try {
    let recordsSynced = 0;

    if (integration.provider === "STRIPE") {
      recordsSynced = await syncStripe(integration.productId, integration.config);
    } else if (integration.provider === "GA4") {
      recordsSynced = await syncGa4(
        integration.productId,
        integration.config,
        options.syncMode ?? "merge",
        options.historyDays ?? 365,
      );
    } else if (integration.provider === "APP_STORE_CONNECT") {
      recordsSynced = await syncAppStoreConnect(integration.productId, integration.config);
    } else if (integration.provider === "GOOGLE_PLAY") {
      recordsSynced = await syncGooglePlay(integration.productId, integration.config);
    } else {
      throw new Error(`Provider sync not implemented for: ${integration.provider}`);
    }

    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: { status: "SUCCESS", completedAt: new Date(), recordsSynced },
    });

    await prisma.integration.update({
      where: { id: integration.id },
      data: { lastSyncAt: new Date() },
    });

    return { success: true, recordsSynced };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[integration-sync] Provider sync execution error:", message);

    await prisma.syncJob.update({
      where: { id: syncJob.id },
      data: { status: "FAILED", completedAt: new Date(), error: message },
    });

    return { success: false, recordsSynced: 0, error: message };
  }
}
