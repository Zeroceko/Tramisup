import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import IntegrationsWorkspace from "@/components/IntegrationsWorkspace";
import type { ExistingIntegration, IntegrationDef } from "@/components/IntegrationCard";
import { getAvailableIntegrations } from "@/lib/integrations-catalog";
import { getMetricSetup } from "@/lib/metric-setup";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getRecommendedIntegrationsForSetup } from "@/lib/integration-recommendations";
import {
  readGrowthCheckinFromAdditionalContext,
  summarizeGrowthCheckinForSetup,
} from "@/lib/growth-transition-checkin";

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
  const connectedProviders = existingIntegrations
    .filter((integration) => integration.status === "CONNECTED")
    .map((integration) => integration.provider);
  const storedAdditionalContext = readGrowthCheckinFromAdditionalContext(product.additionalContext);
  const growthCheckinAnswers = storedAdditionalContext.growthCheckin?.answers ?? null;
  const growthSetupContext = summarizeGrowthCheckinForSetup({
    answers: growthCheckinAnswers,
    locale,
  });
  const metricSetup = await getMetricSetup(product.id);
  const metricPlan = getGrowthMetricRecommendations({
    name: product.name,
    status: product.status,
    category: product.category,
    description: product.description,
    targetAudience: product.targetAudience,
    businessModel: product.businessModel,
    website: product.website,
    locale,
    growthCheckinAnswers,
  });
  const integrationRecommendations = getRecommendedIntegrationsForSetup({
    setup: metricSetup,
    plan: metricPlan,
    connectedProviders,
  });
  const recommendedProviderNames = Array.from(
    new Set(
      integrationRecommendations.metricRecommendations.flatMap((recommendation) =>
        recommendation.providers.map((provider) => provider.name),
      ),
    ),
  );
  const sourceContext =
    growthSetupContext || recommendedProviderNames.length > 0
      ? {
          title:
            locale === "en"
              ? "Why sources matter now"
              : "Kaynaklar neden şimdi önemli",
          body:
            growthSetupContext?.description ??
            (locale === "en"
              ? "The measurement system is taking shape. Connecting the right sources now reduces manual entry and makes Growth diagnosis more reliable."
              : "Ölçüm sistemi şekilleniyor. Doğru kaynakları şimdi bağlamak manuel girişi azaltır ve Growth teşhisini daha az tahmine dayalı hale getirir."),
          note:
            recommendedProviderNames.length > 0
              ? locale === "en"
                ? `Based on your current metric setup, ${recommendedProviderNames.join(", ")} would cover the most important source gaps first.`
                : `Mevcut metric setup'ına göre önce ${recommendedProviderNames.join(", ")} kaynakları en önemli kapsama boşluklarını kapatır.`
              : null,
        }
      : null;

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
      locale={locale}
      productName={product.name}
      integrations={integrations}
      availableIntegrations={getAvailableIntegrations(locale) as IntegrationDef[]}
      productId={product.id}
      manualEntryCount={manualEntryCount}
      success={resolvedSearchParams.success}
      error={resolvedSearchParams.error}
      onboarding={resolvedSearchParams.onboarding}
      connect={resolvedSearchParams.connect}
      queued={resolvedSearchParams.queued}
      sourceContext={sourceContext}
    />
  );
}
