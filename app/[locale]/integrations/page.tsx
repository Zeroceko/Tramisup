import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import IntegrationsWorkspace from "@/components/IntegrationsWorkspace";
import type { ExistingIntegration, IntegrationDef } from "@/components/IntegrationCard";
import { AVAILABLE_INTEGRATIONS } from "@/lib/integrations-catalog";

function parseConfig(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function IntegrationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ success?: string; error?: string; onboarding?: string; connect?: string; queued?: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const resolvedSearchParams = (await searchParams) ?? {};

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center text-[14px] text-[#666d80]">
        {locale === "en" ? "Product not found" : "Ürün bulunamadı"}
      </div>
    );
  }

  const existingIntegrations = await prisma.integration.findMany({
    where: { productId: product.id },
  });
  const manualEntryCount = await prisma.metricEntry.count({
    where: { productId: product.id },
  });

  const integrations: ExistingIntegration[] = existingIntegrations.map((integration) => {
    const config = parseConfig(integration.config);
    return {
      id: integration.id,
      provider: integration.provider,
      status: integration.status,
      lastSyncAt: integration.lastSyncAt?.toISOString() ?? null,
      selectedPropertyId:
        typeof config?.propertyId === "string" ? config.propertyId : null,
      selectedPropertyDisplayName:
        typeof config?.propertyDisplayName === "string"
          ? config.propertyDisplayName
          : null,
      accountDisplayName:
        typeof config?.accountDisplayName === "string"
          ? config.accountDisplayName
          : null,
    };
  });

  return (
    <IntegrationsWorkspace
      productName={product.name}
      integrations={integrations}
      availableIntegrations={AVAILABLE_INTEGRATIONS as IntegrationDef[]}
      productId={product.id}
      manualEntryCount={manualEntryCount}
      success={resolvedSearchParams.success}
      error={resolvedSearchParams.error}
      onboarding={resolvedSearchParams.onboarding}
      connect={resolvedSearchParams.connect}
      queued={resolvedSearchParams.queued}
    />
  );
}
