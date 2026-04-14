import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getMetricSetup } from "@/lib/metric-setup";
import { checkLimit, getUserPlan, PLAN_LIMITS } from "@/lib/plan-limits";
import { PlanTier, BillingInterval, SubStatus } from "@prisma/client";
import { listAIConnectionsForUser } from "@/lib/ai-connections";
import { getAvailableIntegrations } from "@/lib/integrations-catalog";
import { getProductStatusLabel } from "@/lib/launch-stage";
import PageHeader from "@/components/PageHeader";
import SettingsWorkspace from "@/components/SettingsWorkspace";
import type { ExistingIntegration, IntegrationDef } from "@/components/IntegrationCard";
import { getRequestActiveProductId, getRequestSession } from "@/lib/request-cache";

function parseConfig(value: string | null) {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export default async function SettingsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ section?: string; success?: string; error?: string }>;
}) {
  const { locale } = await params;
  const { section, success, error } = await searchParams;
  const [session, t, activeProductId] = await Promise.all([
    getRequestSession(),
    getTranslations("settings"),
    getRequestActiveProductId(),
  ]);

  const userWithProducts = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { products: true },
  });

  const user = userWithProducts
    ? {
        ...userWithProducts,
        product:
          userWithProducts.products.find((product) => product.id === activeProductId) ||
          userWithProducts.products[0] ||
          null,
      }
    : null;

  const activeProduct = user?.product;
  const isEn = locale === "en";

  const existingIntegrations = activeProduct
    ? await prisma.integration.findMany({
        where: { productId: activeProduct.id },
        orderBy: { updatedAt: "desc" },
      })
    : [];
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
  const manualEntryCount = activeProduct
    ? await prisma.metricEntry.count({ where: { productId: activeProduct.id } })
    : 0;

  const connectedProviders = integrations
    .filter((i) => i.status === "CONNECTED")
    .map((i) => i.provider);

  const metricPlan = activeProduct
    ? getGrowthMetricRecommendations({
        name: activeProduct.name,
        status: activeProduct.status,
        category: activeProduct.category ?? undefined,
        description: activeProduct.description ?? undefined,
        targetAudience: activeProduct.targetAudience ?? undefined,
        businessModel: activeProduct.businessModel ?? undefined,
        website: activeProduct.website ?? undefined,
        locale,
      })
    : null;

  const savedMetricSetup = activeProduct ? await getMetricSetup(activeProduct.id) : null;
  const aiConnections = session?.user?.id
    ? await listAIConnectionsForUser(session.user.id)
    : [];
  const productAISettings = activeProduct
    ? await prisma.productAISettings.findUnique({
        where: { productId: activeProduct.id },
        select: {
          mode: true,
          selectedConnectionId: true,
        },
      })
    : null;
  const connectedAIConnectionCount = aiConnections.filter((item) => item.status === "CONNECTED").length;

  const connectedCount = integrations.filter((i) => i.status === "CONNECTED").length;
  const latestSync = integrations
    .filter((integration) => integration.lastSyncAt)
    .sort((a, b) => new Date(b.lastSyncAt!).getTime() - new Date(a.lastSyncAt!).getTime())[0]
    ?.lastSyncAt;

  const copy = isEn
    ? {
        overviewLabel: "Product settings",
        overviewTitle: "Manage product context, sources, and tracking in one place",
        overviewDesc:
          "This area is for product-related configuration only: onboarding context, source connections, and the measurement system.",
        projectCard: "Active product",
        noProduct: "No active product",
        contextCard: "Context",
        contextReady: "Onboarding inputs editable",
        sourcesLabel: "Sources",
        sourcesTitle: "Manage data sources",
        sourcesWithCountLabel: "source connected. Add new sources or manage existing ones.",
        sourcesEmpty: "No sources connected yet. Connect GA4 or Stripe to pull metrics automatically.",
        lastSync: "Last sync",
        latestSync: "Latest sync",
        noSyncYet: "No sync yet",
        connected: "Connected",
        error: "Error",
        disconnected: "Not connected",
        manageSources: "Manage sources",
        connectSource: "Connect source",
        growthLabel: "Growth tracking",
        growthTitle: "Update growth tracking metrics",
        growthDesc:
          "Metric selection belongs to the Growth workspace. Open that setup from here whenever you want to revise the tracked signals.",
        growthCta: "Open growth tracking",
        navProfile: "Profile",
        navProduct: "Product",
        navAI: "AI Connections",
        navSources: "Sources",
        navTracking: "Tracking Metrics",
        navSecurity: "Security",
        navBilling: "Billing",
      }
    : {
        overviewLabel: "Ürün ayarları",
        overviewTitle: "Ürün bağlamını, kaynakları ve takip sistemini tek yerde yönet",
        overviewDesc:
          "Burası sadece ürünle ilgili ayarlar içindir: onboarding bağlamı, kaynak bağlantıları ve ölçüm sistemi burada yönetilir.",
        projectCard: "Aktif ürün",
        noProduct: "Aktif ürün yok",
        contextCard: "Bağlam",
        contextReady: "Onboarding girdileri düzenlenebilir",
        sourcesLabel: "Kaynaklar",
        sourcesTitle: "Veri kaynaklarını yönet",
        sourcesWithCountLabel: "kaynak bağlı. Yeni kaynak ekle veya mevcut bağlantıları yönet.",
        sourcesEmpty: "Henüz bağlı kaynak yok. GA4 veya Stripe bağlayarak metrik verisini otomatik çek.",
        lastSync: "Son senkron",
        latestSync: "En son senkron",
        noSyncYet: "Henüz senkron yok",
        connected: "Bağlı",
        error: "Hata",
        disconnected: "Bağlı değil",
        manageSources: "Kaynakları yönet",
        connectSource: "Kaynak bağla",
        growthLabel: "Büyüme takibi",
        growthTitle: "Büyüme metriklerini güncelle",
        growthDesc:
          "Takip edilen metriklerin yeri Growth çalışma alanıdır. Buradan istediğin zaman metric setup ekranına geçebilirsin.",
        growthCta: "Büyüme takibini aç",
        navProfile: "Profil",
        navProduct: "Ürün",
        navAI: "AI Bağlantıları",
        navSources: "Kaynaklar",
        navTracking: "Takip Metrikleri",
        navSecurity: "Güvenlik",
        navBilling: "Faturalama",
      };

  const latestSyncLabel = latestSync
    ? new Intl.DateTimeFormat(isEn ? "en-US" : "tr-TR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date(latestSync))
    : copy.noSyncYet;

  // Billing data
  const userId = session?.user?.id ?? "";
  const [currentPlan, subscription] = await Promise.all([
    getUserPlan(userId),
    prisma.subscription.findUnique({
      where: { userId },
      select: { interval: true, status: true, currentPeriodEnd: true },
    }),
  ]);
  const limits = PLAN_LIMITS[currentPlan];
  const [productUsage, taskUsage, aiMessageUsage, metricUsage] = await Promise.all([
    checkLimit(userId, "products", 0),
    checkLimit(userId, "tasks", 0),
    checkLimit(userId, "aiMessages", 0),
    checkLimit(userId, "metrics", 0),
  ]);

  const billingData = {
    plan: currentPlan,
    interval: subscription?.interval ?? BillingInterval.MONTHLY,
    status: subscription?.status ?? SubStatus.ACTIVE,
    currentPeriodEnd: subscription?.currentPeriodEnd ?? null,
    usage: [
      { key: "products" as const, label: isEn ? "Products" : "Ürünler", used: productUsage.used, limit: limits.products },
      { key: "tasks" as const, label: isEn ? "Tasks" : "Görevler", used: taskUsage.used, limit: limits.tasks },
      { key: "aiMessages" as const, label: isEn ? "Agent chat messages" : "Agent chat mesajları", used: aiMessageUsage.used, limit: limits.aiMessages },
      { key: "metrics" as const, label: isEn ? "Metrics tracked" : "Takip edilen metrikler", used: metricUsage.used, limit: limits.metrics },
    ],
  };

  return (
    <div className="max-w-6xl">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <section className="mb-6 overflow-hidden rounded-[24px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffefe_0%,_#fff7fa_100%)]">
        <div className="border-b border-[#f1e5eb] px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
            {copy.overviewLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
            {copy.overviewTitle}
          </h2>
          <p className="mt-2 max-w-2xl text-[14px] leading-7 text-[#666d80]">
            {copy.overviewDesc}
          </p>
        </div>

        <div className="grid gap-3 px-6 py-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.projectCard}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {activeProduct?.name || copy.noProduct}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {getProductStatusLabel(activeProduct?.status, locale) ?? "—"}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.contextCard}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {activeProduct?.category || "—"}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {copy.contextReady}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.sourcesLabel}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">{connectedCount}</p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {copy.latestSync}: {latestSyncLabel}
            </p>
          </div>

          <div className="rounded-[18px] border border-white/70 bg-white/85 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b93a6]">
              {copy.navAI}
            </p>
            <p className="mt-2 text-[17px] font-semibold text-[#0d0d12]">
              {connectedAIConnectionCount}
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              {productAISettings?.mode === "CONNECTED_MODEL"
                ? isEn
                  ? "Connected model active"
                  : "Bağlı model aktif"
                : isEn
                  ? "Tiramisup AI active"
                  : "Tiramisup AI aktif"}
            </p>
          </div>
        </div>
      </section>

      <SettingsWorkspace
        locale={locale}
        user={user}
        activeProduct={activeProduct}
        integrations={integrations}
        connectedCount={connectedCount}
        copy={copy}
        isEn={isEn}
        metricPlan={metricPlan}
        savedMetricSetup={savedMetricSetup}
        connectedProviders={connectedProviders}
        aiConnections={aiConnections}
        productAISettings={productAISettings}
        availableIntegrations={getAvailableIntegrations(locale) as IntegrationDef[]}
        sourceIntegrations={integrations}
        manualEntryCount={manualEntryCount}
        aiSuccess={success}
        aiError={error}
        sourceSuccess={success}
        sourceError={error}
        billingData={billingData}
        initialSection={
          section === "tracking"
            ? "tracking"
            : section === "ai"
              ? "ai"
              : section === "sources"
                ? "sources"
              : section === "billing"
                ? "billing"
              : undefined
        }
      />
    </div>
  );
}
