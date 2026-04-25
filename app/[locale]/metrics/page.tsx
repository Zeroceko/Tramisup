import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import MetricEntryForm from "@/components/MetricEntryForm";
import MetricsTrendChart from "@/components/MetricsTrendChart";
import MetricSetupSelector from "@/components/MetricSetupSelector";
import GrowthIntegrationRecommendations from "@/components/GrowthIntegrationRecommendations";
import { buildFunnelHealthSummary } from "@/lib/funnel-health";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getMetricSetup } from "@/lib/metric-setup";
import type { FunnelStageKey } from "@/lib/metric-setup";
import { getRecommendedIntegrationsForSetup } from "@/lib/integration-recommendations";
import { getStageAutomationGuides } from "@/lib/integration-recommendations";
import {
  readGrowthCheckinFromAdditionalContext,
  summarizeGrowthCheckinForSetup,
} from "@/lib/growth-transition-checkin";
import { getRequestActiveProductId, getRequestSession } from "@/lib/request-cache";
import { startServerTiming } from "@/lib/server-perf";

function formatMetricValue(value: number | null | undefined, locale: string) {
  if (value == null) return "—";
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function formatDelta(current: number | null | undefined, previous: number | null | undefined, locale: string) {
  if (current == null || previous == null) return null;
  const delta = Number(current) - Number(previous);
  if (delta === 0) return null;
  return `${delta > 0 ? "+" : ""}${new Intl.NumberFormat(locale === "en" ? "en-US" : "tr-TR", { maximumFractionDigits: 1 }).format(delta)}`;
}

const STATUS_STYLES = {
  AHEAD: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
  ON_TRACK: "bg-[#fefce8] text-[#854d0e] border-[#fef08a]",
  AT_RISK: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
  NEEDS_BASELINE: "bg-[#f6f6f6] text-[#666d80] border-[#e8e8e8]",
} as const;

export default async function MetricsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ setup?: string; entry?: string }>;
}) {
  const perf = startServerTiming("metrics-page");
  const { locale } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const isEn = locale === "en";
  const numberLocale = isEn ? "en-US" : "tr-TR";
  const [session, activeId] = await Promise.all([
    getRequestSession(),
    getRequestActiveProductId(),
  ]);
  if (!session?.user?.id) redirect(`/${locale}/login`);
  let perfProductId: string | null = null;

  try {
    const statusLabels = {
    AHEAD: isEn ? "Ahead" : "Hızlı gidiyor",
    ON_TRACK: isEn ? "On track" : "Takipte",
    AT_RISK: isEn ? "Weak link" : "Zayıf halka",
    NEEDS_BASELINE: isEn ? "Baseline" : "Baz çizgisi",
    } as const;
    const stageActionHints: Partial<Record<FunnelStageKey, string>> = {
    Awareness: isEn ? "Diversify traffic sources or increase content output." : "Trafik kaynağını çeşitlendir veya içerik üretimini artır.",
    Acquisition: isEn ? "Test landing-page conversion and reduce signup friction." : "Landing page dönüşümünü test et. Signup adımlarını azalt.",
    Activation: isEn ? "Review onboarding and shorten the path to the aha moment." : "Onboarding akışını gözden geçir. Aha moment'a giden adımları kısalt.",
    Retention: isEn ? "Talk to your most active users and learn why they return." : "En aktif kullanıcılarla görüş — neden geri geliyor?",
    Referral: isEn ? "Make the referral flow visible and reduce invite friction." : "Referral mekanizması yeterince görünür mü? Davet sürtüşmesini azalt.",
    Revenue: isEn ? "Find the main blocker in the paid conversion step." : "Trial süresi yeterli mi? Ücretli geçişin önündeki engeli bul.",
  };
    const product = await prisma.product.findFirst({
      where: {
        userId: session.user.id,
        ...(activeId ? { id: activeId } : {}),
      },
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
        description: true,
        targetAudience: true,
        businessModel: true,
        website: true,
        additionalContext: true,
      },
    });

    if (!product) {
      return (
        <div className="py-20 text-center text-[14px] text-[#666d80]">{isEn ? "Product not found" : "Ürün bulunamadı"}</div>
      );
    }
    perfProductId = product.id;

    const storedAdditionalContext = readGrowthCheckinFromAdditionalContext(product.additionalContext);
    const growthCheckinAnswers = storedAdditionalContext.growthCheckin?.answers ?? null;
    const hasGrowthCheckin = Boolean(storedAdditionalContext.growthCheckin?.completedAt);
    const isLaunchedProduct = product.status === "LAUNCHED" || product.status === "GROWING";

    if (isLaunchedProduct && !hasGrowthCheckin) {
      redirect(`/${locale}/growth?onboarding=1`);
    }

    const [connectedIntegrations, savedSetup] = await Promise.all([
      prisma.integration.findMany({
        where: {
          productId: product.id,
          status: "CONNECTED",
        },
        select: {
          provider: true,
        },
        }),
      getMetricSetup(product.id),
    ]);
  const connectedSourceCount = connectedIntegrations.length;
  const growthSetupContext = summarizeGrowthCheckinForSetup({
    answers: growthCheckinAnswers,
    locale,
  });

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

  const selectedMetrics = metricPlan.sections.flatMap((section) => {
    const selectedKeys =
      savedSetup?.selections.find((item) => item.stage === section.stage)?.selectedMetricKeys ?? [];
    return section.metrics
      .filter((metric) => selectedKeys.includes(metric.key))
      .map((metric) => ({
        stage: section.stage,
        metricKey: metric.key,
        metricName: metric.name,
      }));
  });

  const automationGuides = getStageAutomationGuides({
    plan: metricPlan,
    connectedProviders: connectedIntegrations.map((integration) => integration.provider),
  });
  const automationGuideByStage = new Map(automationGuides.map((guide) => [guide.stage, guide]));
  const autoTrackedMetrics = selectedMetrics.filter((metric) => {
    const guide = automationGuideByStage.get(metric.stage);
    return !!guide && guide.connectedProviders.length > 0 && guide.supportedMetricKeys.includes(metric.metricKey);
  });
  const manualMetrics = selectedMetrics.filter((metric) => {
    const guide = automationGuideByStage.get(metric.stage);
    return !guide || guide.connectedProviders.length === 0 || !guide.supportedMetricKeys.includes(metric.metricKey);
  });
  const autoTrackedMetricLabels = autoTrackedMetrics.map((metric) => `${metric.stage} · ${metric.metricName}`);
  const manualMetricLabels = manualMetrics.map((metric) => `${metric.stage} · ${metric.metricName}`);
  const hasAutoCoverage = autoTrackedMetrics.length > 0;
  const hasManualEntryNeed = manualMetrics.length > 0;
  const isFullyAutomated = selectedMetrics.length > 0 && manualMetrics.length === 0;

  const entryCount = savedSetup?.entries.length ?? 0;
  const latestEntry = savedSetup?.entries.at(-1) ?? null;
  const previousEntry =
    savedSetup && savedSetup.entries.length > 1
      ? savedSetup.entries[savedSetup.entries.length - 2]
      : null;
  const recentEntries = [...(savedSetup?.entries ?? [])].reverse().slice(0, 7);
  const chartEntries = (savedSetup?.entries ?? []).slice(-14).map((entry) => ({
    date: entry.date.slice(5),
    ...entry.values,
  }));
  const integrationRecommendations = getRecommendedIntegrationsForSetup({
    setup: savedSetup,
    plan: metricPlan,
    connectedProviders: connectedIntegrations.map((integration) => integration.provider),
  });

  const dataState: "no_setup" | "first_entry" | "building" | "active" =
    selectedMetrics.length === 0
      ? "no_setup"
      : entryCount === 0
      ? "first_entry"
      : entryCount < 5
      ? "building"
      : "active";

  const funnelHealth =
    dataState !== "no_setup"
      ? buildFunnelHealthSummary({
          product: {
            category: product.category,
            targetAudience: product.targetAudience,
            businessModel: product.businessModel,
            description: product.description,
            website: product.website,
          },
          selectedMetrics,
          entries: savedSetup?.entries ?? [],
        })
      : null;

  const stageSnapshots = selectedMetrics.map((metric) => {
    const healthStage = funnelHealth?.stages.find((item) => item.stage === metric.stage);
    return {
      ...metric,
      currentValue: latestEntry?.values?.[metric.stage] ?? null,
      previousValue: previousEntry?.values?.[metric.stage] ?? null,
      status: healthStage?.status ?? ("NEEDS_BASELINE" as const),
      conversionFromPrevious: healthStage?.conversionFromPrevious ?? null,
      targetRate: healthStage?.targetRate ?? funnelHealth?.baseTargetRate ?? 5,
    };
  });

  const atRiskStage = funnelHealth?.stages.find((s) => s.status === "AT_RISK") ?? null;

  const headerTitle =
    dataState === "no_setup"
      ? isEn ? "Set up your measurement system" : "Ölçüm sistemini kur"
      : dataState === "first_entry"
      ? isEn ? "Save your first baseline" : "İlk baz çizgisini kaydet"
      : dataState === "building"
      ? isEn ? "Measurement system is taking shape" : "Ölçüm sistemi kuruluyor"
      : isEn ? "Measurement system" : "Ölçüm sistemi";

  const workflowTitle =
    dataState === "no_setup"
      ? isEn ? "Step 1: choose the metrics you will track" : "Adım 1: takip edeceğin metrikleri seç"
      : dataState === "first_entry"
      ? isEn ? "Step 2: save the first baseline" : "Adım 2: ilk baz çizgisini kaydet"
      : dataState === "building"
      ? isEn ? "Step 3: keep feeding the system" : "Adım 3: sistemi veriyle beslemeye devam et"
      : isEn ? "Setup complete: Growth can now read the trend" : "Kurulum tamam: Growth artık trendi okuyabilir";

  const workflowDescription =
    dataState === "no_setup"
      ? isEn
        ? "Pick one core metric for each AARRR stage. Daily entry starts after the setup is clear."
        : "Her AARRR aşaması için bir ana metrik seç. Günlük giriş, setup netleştikten sonra başlar."
      : dataState === "first_entry"
      ? isEn
        ? "Your metric setup is ready. Enter today's numbers once to create the baseline that Growth will use."
        : "Metrik setup'ı hazır. Growth'un kullanacağı baz çizgisini oluşturmak için bugünkü sayıları bir kez gir."
      : dataState === "building"
      ? isEn
        ? "Setup is complete and entries are flowing. A few more saves will make trend and weak-link detection stable."
        : "Setup tamam ve veri akışı başladı. Birkaç giriş daha sonra trend ve zayıf halka tespiti daha stabil olacak."
      : isEn
        ? "Metrics and entries are both active. Use this page for daily inputs, and use Growth for diagnosis and next actions."
        : "Metrikler ve girişler aktif. Bu sayfayı günlük giriş için, Growth'u teşhis ve sonraki aksiyon için kullan.";

  const workflowToneClass =
    dataState === "no_setup"
      ? "border-[#eadfd3] bg-[#fffaf4]"
      : dataState === "first_entry"
      ? "border-[#d7efef] bg-[#f7fcfc]"
      : dataState === "building"
      ? "border-[#efe6d7] bg-[#fffbf5]"
      : "border-[#d7efdf] bg-[#f5fcf7]";
  const setupJustSaved = resolvedSearch.setup === "ready";
  const entryJustSaved = resolvedSearch.entry === "saved";


    return (
      <div className="space-y-5">
      {/* 1. Compact header */}
      <div>
        <p className="text-[13px] font-medium text-[#6f7482]">
          {isEn ? "Measurement system" : "Ölçüm sistemi"}
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {headerTitle}
        </h1>
      </div>

      {setupJustSaved ? (
        <div className="rounded-[18px] border border-[#d7efef] bg-[#f0fafa] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6f6e]">
            {isEn ? "Setup saved" : "Kurulum kaydedildi"}
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[#0d0d12]">
            {isEn
              ? `Your measurement system is locked in. Enter today's ${selectedMetrics.length} numbers once so Growth can start from a real baseline.`
              : `Ölçüm sistemi kaydedildi. Growth'ün gerçek bir baz çizgisinden başlaması için şimdi bugünkü ${selectedMetrics.length} sayıyı bir kez gir.`}
          </p>
        </div>
      ) : null}

      {entryJustSaved ? (
        <div className="rounded-[18px] border border-[#d7efdf] bg-[#f5fcf7] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#166534]">
            {isEn ? "Entry saved" : "Giriş kaydedildi"}
          </p>
          <p className="mt-2 text-[14px] leading-6 text-[#0d0d12]">
            {isEn
              ? "The latest numbers are in. Keep feeding Metrics here or jump into Growth for the next decision."
              : "Son sayılar işlendi. Buradan Metrics'i beslemeye devam edebilir ya da sıradaki kararı görmek için Growth'e geçebilirsin."}
          </p>
        </div>
      ) : null}

      <div className={`rounded-[18px] border px-5 py-4 ${workflowToneClass}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6f7482]">
              {isEn ? "Founder view" : "Founder görünümü"}
            </p>
            <p className="mt-1 text-[18px] font-semibold text-[#0d0d12]">
              {isFullyAutomated
                ? isEn
                  ? "Your metrics are flowing automatically."
                  : "Metriklerin otomatik olarak akıyor."
                : hasAutoCoverage
                ? isEn
                  ? `${autoTrackedMetrics.length} metric is automatic, ${manualMetrics.length} still needs manual care.`
                  : `${autoTrackedMetrics.length} metrik otomatik akıyor, ${manualMetrics.length} metrik hâlâ manuel takip istiyor.`
                : workflowTitle}
            </p>
            <p className="mt-1 text-[13px] leading-5 text-[#666d80]">
              {isFullyAutomated
                ? isEn
                  ? "This page should now help you read the signal, not re-enter numbers. Use the trend and recent entry sections to track what changed."
                  : "Bu ekran artık sayı girdiğin değil, sinyali okuduğun yer olmalı. Değişen şeyi trend ve son girişler alanından takip et."
                : hasAutoCoverage
                ? isEn
                  ? "Keep only the uncovered metrics manual. Everything else should come from your connected sources."
                  : "Sadece kapsanmayan metrikleri manuel takip et. Diğer metrikler bağlı kaynaklarından gelmeli."
                : workflowDescription}
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:min-w-[280px]">
            <div className="rounded-[14px] border border-white/70 bg-white/75 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
                {isEn ? "Tracked" : "Takip"}
              </p>
              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
                {selectedMetrics.length}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/70 bg-white/75 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
                {isEn ? "Auto" : "Otomatik"}
              </p>
              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
                {autoTrackedMetrics.length}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/70 bg-white/75 px-3 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
                {isEn ? "Manual" : "Manuel"}
              </p>
              <p className="mt-1 text-[24px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
                {manualMetrics.length}
              </p>
            </div>
          </div>
        </div>

        {(hasAutoCoverage || hasManualEntryNeed) && (
          <div className="mt-4 grid gap-3 lg:grid-cols-2">
            {hasAutoCoverage && (
              <div className="rounded-[14px] border border-[#d7efdf] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#166534]">
                  {isEn ? "Automatic sources" : "Otomatik gelenler"}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#0d0d12]">
                  {autoTrackedMetricLabels.join(" · ")}
                </p>
              </div>
            )}
            {hasManualEntryNeed && (
              <div className="rounded-[14px] border border-[#efe6d7] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9a3412]">
                  {isEn ? "Still manual" : "Hâlâ manuel"}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#0d0d12]">
                  {manualMetricLabels.join(" · ")}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <MetricSetupSelector
        productId={product.id}
        plan={metricPlan}
        initialSetup={savedSetup}
        locale={locale}
        connectedProviders={connectedIntegrations.map((integration) => integration.provider)}
        setupContext={growthSetupContext}
      />

      {selectedMetrics.length > 0 && (
        <GrowthIntegrationRecommendations
          metricRecommendations={integrationRecommendations.metricRecommendations}
          uncoveredMetricNames={integrationRecommendations.uncoveredMetricNames}
          locale={locale}
        />
      )}

      {/* no_setup state */}
      {dataState === "no_setup" && (
        <div className="rounded-[18px] border border-dashed border-[#e8e4de] bg-white p-6">
          <p className="text-[14px] font-semibold text-[#0d0d12]">{isEn ? "Select metrics to start tracking" : "Takip etmek için metrik seç"}</p>
          <p className="mt-1 text-[13px] text-[#666d80]">
            {isEn
              ? "Choose one key metric per AARRR stage above."
              : "Yukarıdan her AARRR aşaması için 1 ana metrik seç."}
          </p>
        </div>
      )}

      {/* first_entry state: form + compact hint */}
      {dataState === "first_entry" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
          {hasManualEntryNeed ? (
            <MetricEntryForm
              productId={product.id}
              selectedMetrics={manualMetrics}
              latestEntry={latestEntry}
              locale={locale}
            />
          ) : (
            <div className="rounded-[18px] border border-[#d7efdf] bg-[#f5fcf7] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                {isEn ? "Automatic flow" : "Otomatik akış"}
              </p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {isEn ? "Manual entry is no longer needed here." : "Bu ekranda artık manuel giriş gerekmiyor."}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[#5f6b7a]">
                {isEn
                  ? "Your connected sources should bring the selected metrics in automatically. Wait for the first synced values or review the source connection."
                  : "Bağlı kaynakların seçili metrikleri otomatik getirmeli. İlk senkronize değerleri bekle ya da kaynak bağlantını gözden geçir."}
              </p>
            </div>
          )}
          <div className="space-y-3">
            <div className="rounded-[18px] border border-[#e8e4de] bg-white p-4">
              <p className="text-[12px] font-semibold text-[#0d0d12]">{isEn ? "After 5 entries" : "5 giriş sonra"}</p>
              <p className="mt-1 text-[11px] leading-4 text-[#8a8fa0]">
                {isEn ? "Trend chart and weak-link detection become visible." : "Trend grafiği ve zayıf halka tespiti görünür olur."}
              </p>
            </div>
            <div className="rounded-[18px] border border-[#d7efef] bg-[#f7fcfc] p-4">
              <p className="text-[12px] font-semibold text-[#0d0d12]">
                {isEn ? "What happens after this save?" : "Bu kayıttan sonra ne olacak?"}
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#6a7283]">
                {isEn
                  ? "The first save opens Growth with your new baseline so the product can switch from setup mode into real diagnosis."
                  : "İlk kayıt, yeni baz çizginle birlikte Growth'ü açar; ürün setup modundan gerçek teşhis moduna böyle geçer."}
              </p>
            </div>
            {connectedSourceCount === 0 && (
              <a
                href={`/${locale}/integrations`}
                className="group flex items-start gap-3 rounded-[14px] border border-[#d7efef] bg-[#f7fcfc] px-4 py-3 transition hover:bg-[#eef8f8]"
              >
                <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#e7f7f6] text-[#1c6b69]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#1c6b69]">
                    {isEn ? "Tip" : "İpucu"}
                  </p>
                  <p className="mt-1 text-[12px] font-semibold text-[#0d0d12]">
                    {isEn ? "Connect a source when you are ready" : "Hazır olduğunda bir kaynak bağla"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-5 text-[#6a7283]">
                    {isEn
                      ? "Open Integrations to connect GA4 or Stripe and reduce manual entry later."
                      : "Daha sonra manuel girişi azaltmak için Integrations ekranından GA4 veya Stripe bağla."}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] font-semibold text-[#1c6b69] group-hover:text-[#145654]">
                  {isEn ? "Open" : "Aç"}
                </span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* building state: funnel strip + form + mini table */}
      {dataState === "building" && (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
              {isEn ? "Funnel status" : "Funnel durumu"}
            </p>
            <div className="flex flex-wrap gap-2">
              {stageSnapshots.map((metric) => (
                <div
                  key={metric.stage}
                  className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-[12px] font-semibold ${STATUS_STYLES[metric.status]}`}
                >
                  <span>{metric.stage}</span>
                  {metric.currentValue !== null && (
                    <span className="font-normal opacity-70">
                      {formatMetricValue(metric.currentValue, locale)}
                    </span>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-[#f3f4f6]">
              <div
                className="h-1.5 rounded-full bg-[#0d0d12] transition-all"
                style={{ width: `${Math.min(100, (entryCount / 5) * 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-[#8a8fa0]">
              {isEn ? `${5 - entryCount} entries left for trend view` : `Trend grafiği için ${5 - entryCount} giriş kaldı`}
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {hasManualEntryNeed ? (
              <MetricEntryForm
                productId={product.id}
                selectedMetrics={manualMetrics}
                latestEntry={latestEntry}
                locale={locale}
                entryCount={entryCount}
              />
            ) : (
              <div className="rounded-[16px] border border-[#d7efdf] bg-[#f5fcf7] p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                  {isEn ? "Automatic flow" : "Otomatik akış"}
                </p>
                <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                  {isEn ? "Sources are building the baseline for you." : "Kaynaklar baz çizgisini senin yerine oluşturuyor."}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#5f6b7a]">
                  {isEn
                    ? "Keep an eye on the recent entries and trend sections. You should only come back to manual entry if a selected metric is not covered by a source."
                    : "Son girişler ve trend alanını takip et. Sadece seçili bir metrik kaynak tarafından kapsanmıyorsa manuel girişe dönmen gerekir."}
                </p>
              </div>
            )}
            {recentEntries.length > 0 && (
              <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                <p className="mb-3 text-[13px] font-semibold text-[#0d0d12]">{isEn ? "Recent entries" : "Son girişler"}</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#f1f1f2] text-[#8a8fa0]">
                        <th className="py-2 pr-4 font-medium">{isEn ? "Date" : "Tarih"}</th>
                        {selectedMetrics.map((m) => (
                          <th key={m.stage} className="py-2 pr-4 font-medium">
                            {m.stage}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map((entry) => (
                        <tr key={entry.date} className="border-b border-[#f7f7f7] last:border-0">
                          <td className="py-2.5 pr-4 text-[#666d80]">{entry.date.slice(5)}</td>
                          {selectedMetrics.map((m) => (
                            <td
                              key={`${entry.date}-${m.stage}`}
                              className="py-2.5 pr-4 font-semibold text-[#0d0d12]"
                            >
                              {entry.values?.[m.stage] != null
                                ? formatMetricValue(entry.values[m.stage], locale)
                                : "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* active state: full dashboard */}
      {dataState === "active" && (
        <div className="space-y-4">
          {/* Weak link callout */}
          {atRiskStage && (
            <div className="rounded-[16px] border border-orange-100 bg-[#fff7ed] p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c2410c]">
                    {isEn ? "Weak link" : "Zayıf halka"}
                  </p>
                  <p className="mt-1 text-[16px] font-bold text-[#0d0d12]">
                    {atRiskStage.stageLabel} · {atRiskStage.metricName}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#c2410c]">
                    {stageActionHints[atRiskStage.stage] ??
                      (isEn ? "Consider creating a task for this stage." : "Bu aşama için görev oluşturmayı düşün.")}
                  </p>
                </div>
                <a
                  href={`/${locale}/tasks`}
                  className="shrink-0 rounded-full bg-[#c2410c] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#9a3410]"
                >
                  {isEn ? "Create task" : "Görev oluştur"}
                </a>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {/* Stage snapshot cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stageSnapshots.map((metric) => {
                  const delta = formatDelta(metric.currentValue, metric.previousValue, locale);
                  return (
                    <div
                      key={metric.stage}
                      className="rounded-[16px] border border-[#e8e8e8] bg-white p-4"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
                          {metric.stage}
                        </p>
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${STATUS_STYLES[metric.status]}`}
                        >
                          {statusLabels[metric.status]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-[#0d0d12]">
                        {metric.metricName}
                      </p>
                      <p className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                        {formatMetricValue(metric.currentValue, locale)}
                      </p>
                      {delta ? (
                        <p
                          className={`mt-1 text-[12px] font-semibold ${
                            delta.startsWith("+") ? "text-[#15803d]" : "text-[#dc2626]"
                          }`}
                        >
                          {isEn ? `${delta} vs previous entry` : `${delta} önceki girişe göre`}
                        </p>
                      ) : metric.currentValue !== null ? (
                        <p className="mt-1 text-[11px] text-[#8a8fa0]">{isEn ? "No change" : "Değişim yok"}</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-[#8a8fa0]">{isEn ? "No entry yet" : "Henüz giriş yok"}</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Trend chart — only show with enough data for a meaningful trend */}
              {chartEntries.length >= 5 && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#0d0d12]">{isEn ? "Trend" : "Trend"}</p>
                    <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[11px] font-medium text-[#666d80]">
                      {isEn ? `Last ${Math.min(14, chartEntries.length)} entries` : `Son ${Math.min(14, chartEntries.length)} giriş`}
                    </span>
                  </div>
                  <MetricsTrendChart entries={chartEntries} series={selectedMetrics} />
                </div>
              )}

              {/* Recent entries table */}
              {recentEntries.length > 0 && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                  <p className="mb-3 text-[13px] font-semibold text-[#0d0d12]">{isEn ? "Recent entries" : "Son girişler"}</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-[#f1f1f2] text-[#8a8fa0]">
                          <th className="py-2 pr-5 font-medium">{isEn ? "Date" : "Tarih"}</th>
                          {selectedMetrics.map((m) => (
                            <th key={m.stage} className="py-2 pr-5 font-medium">
                              {m.stage}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {recentEntries.map((entry) => (
                          <tr key={entry.date} className="border-b border-[#f7f7f7] last:border-0">
                            <td className="py-2.5 pr-5 text-[#666d80]">{entry.date}</td>
                            {selectedMetrics.map((m) => (
                              <td
                                key={`${entry.date}-${m.stage}`}
                                className="py-2.5 pr-5 font-semibold text-[#0d0d12]"
                              >
                                {entry.values?.[m.stage] != null
                                  ? formatMetricValue(entry.values[m.stage], locale)
                                  : "—"}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Sticky sidebar: entry form + coach summary */}
            <div className="lg:sticky lg:top-6 lg:self-start space-y-4">
              {hasManualEntryNeed ? (
                <MetricEntryForm
                  productId={product.id}
                  selectedMetrics={manualMetrics}
                  latestEntry={latestEntry}
                  locale={locale}
                />
              ) : (
                <div className="rounded-[16px] border border-[#d7efdf] bg-[#f5fcf7] p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#166534]">
                    {isEn ? "Automatic tracking" : "Otomatik takip"}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-[#0d0d12]">
                    {isEn ? "This founder view is now mostly read-only." : "Bu founder görünümü artık ağırlıkla takip odaklı."}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
                    {isEn
                      ? "Your connected sources cover all selected metrics. Use this page to read movement, and use Growth when a weak link appears."
                      : "Bağlı kaynakların seçili metriklerin tamamını kapsıyor. Bu sayfayı hareketi okumak için, Growth'ü ise zayıf halka çıktığında kullan."}
                  </p>
                </div>
              )}
              {funnelHealth && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
                    {isEn ? "Coach summary" : "Koç yorumu"}
                  </p>
                  <p className="mt-2 text-[13px] font-semibold text-[#0d0d12]">
                    {funnelHealth.headline}
                  </p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
                    {funnelHealth.nextFocus}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      </div>
    );
  } finally {
    perf.end({
      userId: session.user.id,
      productId: perfProductId,
    });
  }
}
