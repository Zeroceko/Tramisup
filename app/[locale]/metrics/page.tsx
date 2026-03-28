import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import MetricEntryForm from "@/components/MetricEntryForm";
import MetricsTrendChart from "@/components/MetricsTrendChart";
import PageHeader from "@/components/PageHeader";
import { buildFunnelHealthSummary } from "@/lib/funnel-health";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getMetricSetup } from "@/lib/metric-setup";
import type { FunnelStageKey } from "@/lib/metric-setup";

function formatMetricValue(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function formatDelta(current: number | null | undefined, previous: number | null | undefined) {
  if (current == null || previous == null) return null;
  const delta = Number(current) - Number(previous);
  if (delta === 0) return null;
  return `${delta > 0 ? "+" : ""}${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(delta)}`;
}

const STATUS_STYLES = {
  AHEAD: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
  ON_TRACK: "bg-[#fefce8] text-[#854d0e] border-[#fef08a]",
  AT_RISK: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
  NEEDS_BASELINE: "bg-[#f6f6f6] text-[#666d80] border-[#e8e8e8]",
} as const;

const STATUS_LABELS = {
  AHEAD: "Hızlı gidiyor",
  ON_TRACK: "Takipte",
  AT_RISK: "Zayıf halka",
  NEEDS_BASELINE: "Baz çizgisi",
} as const;

const STAGE_ACTION_HINTS: Partial<Record<FunnelStageKey, string>> = {
  Awareness: "Trafik kaynağını çeşitlendir veya içerik üretimini artır.",
  Acquisition: "Landing page dönüşümünü test et. Signup adımlarını azalt.",
  Activation: "Onboarding akışını gözden geçir. Aha moment'a giden adımları kısalt.",
  Retention: "En aktif kullanıcılarla görüş — neden geri geliyor?",
  Referral: "Referral mekanizması yeterince görünür mü? Davet sürtüşmesini azalt.",
  Revenue: "Trial süresi yeterli mi? Ücretli geçişin önündeki engeli bul.",
};

export default async function MetricsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center text-[14px] text-[#666d80]">Ürün bulunamadı</div>
    );
  }

  const metricPlan = getGrowthMetricRecommendations({
    name: product.name,
    status: product.status,
    category: product.category,
    description: product.description,
    targetAudience: product.targetAudience,
    businessModel: product.businessModel,
    website: product.website,
  });

  const savedSetup = await getMetricSetup(product.id);
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
      ? "Metrik kurulumu yok"
      : dataState === "first_entry"
      ? "İlk gününü kaydet"
      : dataState === "building"
      ? "Baz çizgisi kuruluyor"
      : "Funnel ritmi";

  const headerDescription =
    dataState === "no_setup"
      ? "Önce growth ekranında hangi metrikleri takip edeceğini seç."
      : dataState === "first_entry"
      ? `${selectedMetrics.length} metrik seçildi. Bugünkü değerleri gir — bu değerler baz çizgini oluşturacak.`
      : dataState === "building"
      ? `${entryCount} giriş var. ${5 - entryCount} giriş daha sonra trend grafiği açılır.`
      : `${product.name} · ${selectedMetrics.length} metrik, ${entryCount} giriş takip ediliyor.`;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Growth metrikleri"
        title={headerTitle}
        description={headerDescription}
      />

      {/* no_setup state */}
      {dataState === "no_setup" && (
        <div className="rounded-[16px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center">
          <p className="text-[15px] font-semibold text-[#0d0d12]">Henüz metrik setup&apos;ı yok</p>
          <p className="mt-2 text-[13px] leading-5 text-[#666d80]">
            Her AARRR aşaması için bir ana metrik seç. Sonra burada günlük değer gireceksin.
          </p>
          <a
            href={`/${locale}/growth`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
          >
            Büyüme setup&apos;ına git
          </a>
        </div>
      )}

      {/* first_entry state: prominent form + explainer */}
      {dataState === "first_entry" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <MetricEntryForm
            productId={product.id}
            selectedMetrics={selectedMetrics}
            latestEntry={latestEntry}
            locale={locale}
          />
          <div className="rounded-[16px] border border-[#e8e8e8] bg-[#fafafa] p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
              Bunu doldurursan ne göreceksin?
            </p>
            <div className="mt-4 space-y-3">
              {selectedMetrics.map((metric) => (
                <div key={metric.stage} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[10px] font-bold text-[#666d80]">
                    {metric.stage[0]}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#0d0d12]">{metric.metricName}</p>
                    <p className="text-[11px] text-[#8a8fa0]">{metric.stage} · Baz çizgisi kurulacak</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-[12px] bg-white p-4">
              <p className="text-[12px] font-semibold text-[#0d0d12]">5 giriş sonra</p>
              <p className="mt-1 text-[11px] leading-4 text-[#8a8fa0]">
                Trend grafiği, zayıf halka tespiti ve büyüme ritmi görünür hale gelir.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* building state: funnel strip + form + mini table */}
      {dataState === "building" && (
        <div className="space-y-4">
          <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-4">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
              Funnel durumu
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
                      {formatMetricValue(metric.currentValue)}
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
              Trend grafiği için {5 - entryCount} giriş kaldı
            </p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <MetricEntryForm
              productId={product.id}
              selectedMetrics={selectedMetrics}
              latestEntry={latestEntry}
              locale={locale}
              entryCount={entryCount}
            />
            {recentEntries.length > 0 && (
              <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                <p className="mb-3 text-[13px] font-semibold text-[#0d0d12]">Son girişler</p>
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-[#f1f1f2] text-[#8a8fa0]">
                        <th className="py-2 pr-4 font-medium">Tarih</th>
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
                                ? formatMetricValue(entry.values[m.stage])
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
                    Zayıf halka
                  </p>
                  <p className="mt-1 text-[16px] font-bold text-[#0d0d12]">
                    {atRiskStage.stageLabel} · {atRiskStage.metricName}
                  </p>
                  <p className="mt-1 text-[13px] leading-5 text-[#c2410c]">
                    {STAGE_ACTION_HINTS[atRiskStage.stage] ??
                      "Bu aşama için görev oluşturmayı düşün."}
                  </p>
                </div>
                <a
                  href={`/${locale}/tasks`}
                  className="shrink-0 rounded-full bg-[#c2410c] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#9a3410]"
                >
                  Görev oluştur
                </a>
              </div>
            </div>
          )}

          <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
            <div className="space-y-4">
              {/* Stage snapshot cards */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {stageSnapshots.map((metric) => {
                  const delta = formatDelta(metric.currentValue, metric.previousValue);
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
                          {STATUS_LABELS[metric.status]}
                        </span>
                      </div>
                      <p className="mt-1.5 text-[13px] font-semibold text-[#0d0d12]">
                        {metric.metricName}
                      </p>
                      <p className="mt-3 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                        {formatMetricValue(metric.currentValue)}
                      </p>
                      {delta ? (
                        <p
                          className={`mt-1 text-[12px] font-semibold ${
                            delta.startsWith("+") ? "text-[#15803d]" : "text-[#dc2626]"
                          }`}
                        >
                          {delta} önceki girişe göre
                        </p>
                      ) : metric.currentValue !== null ? (
                        <p className="mt-1 text-[11px] text-[#8a8fa0]">Değişim yok</p>
                      ) : (
                        <p className="mt-1 text-[11px] text-[#8a8fa0]">Henüz giriş yok</p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Trend chart */}
              {chartEntries.length >= 2 && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <p className="text-[13px] font-semibold text-[#0d0d12]">Trend</p>
                    <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[11px] font-medium text-[#666d80]">
                      Son {Math.min(14, chartEntries.length)} giriş
                    </span>
                  </div>
                  <MetricsTrendChart entries={chartEntries} series={selectedMetrics} />
                </div>
              )}

              {/* Recent entries table */}
              {recentEntries.length > 0 && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
                  <p className="mb-3 text-[13px] font-semibold text-[#0d0d12]">Son girişler</p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-[12px]">
                      <thead>
                        <tr className="border-b border-[#f1f1f2] text-[#8a8fa0]">
                          <th className="py-2 pr-5 font-medium">Tarih</th>
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
                                  ? formatMetricValue(entry.values[m.stage])
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
              <MetricEntryForm
                productId={product.id}
                selectedMetrics={selectedMetrics}
                latestEntry={latestEntry}
                locale={locale}
              />
              {funnelHealth && (
                <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
                    Koç yorumu
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
}
