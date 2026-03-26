import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
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

function formatMetricValue(value: number | null | undefined) {
  if (value == null) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function formatDelta(current: number | null | undefined, previous: number | null | undefined) {
  if (current == null || previous == null) return "İlk kayıt";
  const delta = Number(current) - Number(previous);
  if (delta === 0) return "Değişim yok";
  return `${delta > 0 ? "+" : ""}${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(delta)}`;
}

const STATUS_STYLES = {
  AHEAD: "bg-[#f0fffe] text-[#1d8b89] border-[#95dbda]",
  ON_TRACK: "bg-[#fff8dd] text-[#8a6a00] border-[#fee74e]/60",
  AT_RISK: "bg-[#fff1f0] text-[#c13f3f] border-[#ffccc7]",
  NEEDS_BASELINE: "bg-[#f5f5f5] text-[#667085] border-[#e5e7eb]",
} as const;

const STATUS_LABELS = {
  AHEAD: "Hızlı gidiyor",
  ON_TRACK: "Takipte",
  AT_RISK: "Zayıf halka",
  NEEDS_BASELINE: "Daha çok veri",
} as const;

export default async function MetricsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const t = await getTranslations("metrics");

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center text-[#666d80]">Ürün bulunamadı</div>
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
  const funnelHealth = buildFunnelHealthSummary({
    product: {
      category: product.category,
      targetAudience: product.targetAudience,
      businessModel: product.businessModel,
      description: product.description,
      website: product.website,
    },
    selectedMetrics,
    entries: savedSetup?.entries ?? [],
  });

  const stageSnapshots = selectedMetrics.map((metric) => {
    const healthStage = funnelHealth?.stages.find((item) => item.stage === metric.stage);
    return {
      ...metric,
      currentValue: latestEntry?.values?.[metric.stage] ?? null,
      previousValue: previousEntry?.values?.[metric.stage] ?? null,
      status: healthStage?.status ?? "NEEDS_BASELINE",
      conversionFromPrevious: healthStage?.conversionFromPrevious ?? null,
      targetRate: healthStage?.targetRate ?? funnelHealth?.baseTargetRate ?? 5,
    };
  });

  const riskyStage =
    funnelHealth?.stages.find((stage) => stage.status === "AT_RISK") ??
    funnelHealth?.stages.find((stage) => stage.status === "NEEDS_BASELINE") ??
    funnelHealth?.stages[0];

  const latestEntryDate = latestEntry?.date
    ? new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short" }).format(
        new Date(latestEntry.date)
      )
    : "Henüz yok";

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={selectedMetrics.length > 0 ? "Funnel ritmini gör" : t("title")}
        description={
          selectedMetrics.length > 0
            ? "Metrics artık tek tek kutular değil; funnel ritmini, zayıf halkayı ve bugünkü sayıları aynı board içinde gösteriyor."
            : "Önce growth sayfasında hangi metrikleri takip edeceğini seç."
        }
      />

      {selectedMetrics.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
          <p className="text-[15px] font-semibold text-[#0d0d12]">Henüz metrik setup&apos;ı yok</p>
          <p className="mt-2 text-[13px] text-[#666d80]">
            Önce growth ekranında her kategori için 1 ana metrik seç. Sonra burada günlük değer gireceksin.
          </p>
          <a
            href={`/${locale}/growth`}
            className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            Büyüme setup&apos;ına git
          </a>
        </div>
      ) : (
        <div className="space-y-5">
          <section className="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
            <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_24px_80px_rgba(13,13,18,0.05)]">
              <p className="text-[15px] text-[#6b7280]">Ürünün şu anda nerede duruyor?</p>
              <h2 className="mt-2 text-[38px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                Metrics Overview
              </h2>
              <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#667085]">
                Seçtiğin AARRR metriklerini aynı hikâyenin parçaları gibi okuyorsun. Bu yüzey sayı girmekten çok ritmi, dönüşümü ve en zayıf halkayı bir bakışta göstermek için tasarlandı.
              </p>

              <div className="mt-6 grid gap-3 md:grid-cols-4">
                <div className="rounded-[24px] border border-[#f0f0f0] bg-[#fcfcfc] p-5">
                  <p className="text-[13px] text-[#667085]">Takip edilen halka</p>
                  <p className="mt-4 text-[46px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                    {selectedMetrics.length}
                  </p>
                  <div className="mt-3 h-2 rounded-full bg-[#f3f4f6]">
                    <div
                      className="h-2 rounded-full bg-[#111111]"
                      style={{ width: `${Math.min(100, selectedMetrics.length * 16)}%` }}
                    />
                  </div>
                </div>

                <div className="rounded-[24px] border border-[#f0f0f0] bg-[#fcfcfc] p-5">
                  <p className="text-[13px] text-[#667085]">Son kayıt</p>
                  <p className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                    {latestEntryDate}
                  </p>
                  <p className="mt-3 text-[12px] text-[#98a2b3]">
                    {latestEntry ? "En son girilen veri tarihi" : "İlk sayıları girmen gerekiyor"}
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#f0f0f0] bg-[#fcfcfc] p-5">
                  <p className="text-[13px] text-[#667085]">Hedef ritim</p>
                  <p className="mt-4 text-[34px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                    %{funnelHealth?.baseTargetRate ?? 5}
                  </p>
                  <p className="mt-3 text-[12px] text-[#98a2b3]">
                    {funnelHealth?.cadenceLabel ?? "haftalık"} büyüme temposu
                  </p>
                </div>

                <div className="rounded-[24px] border border-[#f0f0f0] bg-[#fcfcfc] p-5">
                  <p className="text-[13px] text-[#667085]">Bugünün odak halkası</p>
                  <p className="mt-4 text-[28px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                    {riskyStage?.stageLabel ?? "Funnel dengede"}
                  </p>
                  <p className="mt-3 text-[12px] text-[#98a2b3]">
                    {riskyStage?.metricName ?? "Henüz yeterli veri yok"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[30px] bg-[#0d0d12] p-6 text-white shadow-[0_24px_80px_rgba(13,13,18,0.18)]">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-white/10 px-3 py-1 text-[12px] font-medium text-white/72">
                  Tiramisup yorumu
                </span>
                <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-white/55">
                  {funnelHealth?.profileLabel ?? "Genel ürün"}
                </span>
              </div>

              <h3 className="mt-6 text-[32px] font-semibold tracking-[-0.04em] leading-[1.05]">
                {funnelHealth?.headline ?? "Funnel ritmini birlikte okuyalım"}
              </h3>
              <p className="mt-4 text-[14px] leading-7 text-white/70">
                {funnelHealth?.summary ??
                  "Tiramisup burada hangi halkada yavaşladığını ve hangi ritmin sağlıklı sayıldığını özetler."}
              </p>

              <div className="mt-6 rounded-[26px] bg-white px-5 py-5 text-[#0d0d12]">
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#6b7280]">
                  Şimdi neye bakmalı?
                </p>
                <p className="mt-3 text-[28px] font-semibold tracking-[-0.04em] leading-[1.08]">
                  {funnelHealth?.nextFocus ?? "Önce birkaç gün veri girip baz çizgiyi oturt."}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {stageSnapshots.slice(0, 3).map((metric) => (
                    <span
                      key={metric.stage}
                      className={`rounded-full border px-3 py-1 text-[12px] font-medium ${STATUS_STYLES[metric.status]}`}
                    >
                      {metric.stage}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-[13px] text-[#667085]">Funnel görünümü</p>
                  <h3 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#0d0d12]">
                    Trend ve akış aynı yüzeyde
                  </h3>
                </div>
                <div className="rounded-full bg-[#f7f7f8] px-4 py-2 text-[12px] font-medium text-[#525866]">
                  Son 14 giriş
                </div>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {stageSnapshots.slice(0, 3).map((metric) => (
                  <div key={metric.stage} className="rounded-[22px] bg-[#fbfbfb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b93a6]">{metric.stage}</p>
                        <p className="mt-1 text-[14px] font-medium text-[#0d0d12]">{metric.metricName}</p>
                      </div>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[metric.status]}`}>
                        {STATUS_LABELS[metric.status]}
                      </span>
                    </div>
                    <p className="mt-5 text-[32px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                      {formatMetricValue(metric.currentValue)}
                    </p>
                    <p className="mt-2 text-[12px] text-[#7a8294]">
                      Önceki kayda göre {formatDelta(metric.currentValue, metric.previousValue)}
                    </p>
                  </div>
                ))}
              </div>

              {chartEntries.length < 2 ? (
                <p className="mt-8 text-[13px] text-[#666d80]">
                  Grafik en az 2 günlük girişten sonra görünür. Şimdilik aşağıda son girişlerini tablo halinde tutuyorum.
                </p>
              ) : (
                <div className="mt-8 rounded-[28px] bg-[#fcfcfc] p-4">
                  <MetricsTrendChart entries={chartEntries} series={selectedMetrics} />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <MetricEntryForm
                productId={product.id}
                selectedMetrics={selectedMetrics}
                latestEntry={latestEntry}
              />

              <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[13px] text-[#667085]">Hızlı durum</p>
                    <h3 className="mt-1 text-[24px] font-semibold tracking-[-0.04em] text-[#0d0d12]">
                      Funnel board
                    </h3>
                  </div>
                  <span className="rounded-full bg-[#f7f7f8] px-3 py-1 text-[12px] font-medium text-[#525866]">
                    {funnelHealth?.cadenceLabel ?? "haftalık"}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  {stageSnapshots.map((metric, index) => (
                    <div
                      key={metric.stage}
                      className={`rounded-[20px] border px-4 py-4 transition ${
                        index === 0
                          ? "border-[#ffd7ef] bg-[#fff4fb]"
                          : "border-[#efefef] bg-[#fbfbfb]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-[12px] font-semibold text-[#0d0d12] shadow-[0_8px_20px_rgba(13,13,18,0.08)]">
                            {index + 1}
                          </div>
                          <div>
                            <p className="text-[14px] font-semibold text-[#0d0d12]">{metric.metricName}</p>
                            <p className="text-[12px] text-[#8a8fa0]">{metric.stage} halkası</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[16px] font-semibold text-[#0d0d12]">{formatMetricValue(metric.currentValue)}</p>
                          <p className="text-[11px] text-[#8a8fa0]">Hedef +%{metric.targetRate}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[#667085]">Funnel halkaları</p>
                  <h3 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#0d0d12]">
                    Bugünkü snapshot
                  </h3>
                </div>
                <span className="rounded-full bg-[#f7f7f8] px-4 py-2 text-[12px] font-medium text-[#525866]">
                  {funnelHealth?.profileLabel ?? "Genel ürün"}
                </span>
              </div>

              <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {stageSnapshots.map((metric) => (
                  <div key={metric.stage} className="rounded-[24px] border border-[#efefef] bg-[#fbfbfb] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-[#8b93a6]">{metric.stage}</p>
                      <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${STATUS_STYLES[metric.status]}`}>
                        {STATUS_LABELS[metric.status]}
                      </span>
                    </div>
                    <p className="mt-2 text-[15px] font-semibold text-[#0d0d12]">{metric.metricName}</p>
                    <div className="mt-5 flex items-end justify-between gap-3">
                      <p className="text-[34px] font-semibold tracking-[-0.05em] text-[#0d0d12]">
                        {formatMetricValue(metric.currentValue)}
                      </p>
                      <div className="text-right">
                        <p className="text-[12px] text-[#8a8fa0]">Önceki halka</p>
                        <p className="text-[15px] font-semibold text-[#0d0d12]">
                          {metric.conversionFromPrevious != null ? `%${metric.conversionFromPrevious}` : "—"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-[#667085]">Geçmiş</p>
                  <h3 className="mt-1 text-[28px] font-semibold tracking-[-0.04em] text-[#0d0d12]">
                    Son girişler
                  </h3>
                </div>
                <a
                  href={`/${locale}/tasks`}
                  className="rounded-full bg-[#111111] px-4 py-2 text-[12px] font-semibold text-white transition hover:bg-[#2b2b2f]"
                >
                  Görevlere geç
                </a>
              </div>

              {recentEntries.length === 0 ? (
                <p className="mt-4 text-[13px] text-[#666d80]">
                  Henüz veri girişi yok. Sağdaki formdan ilk gününü gir.
                </p>
              ) : (
                <div className="mt-6 overflow-x-auto">
                  <table className="min-w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#f1f1f2] text-[#8b93a6]">
                        <th className="py-2 pr-4 font-medium">Tarih</th>
                        {selectedMetrics.map((metric) => (
                          <th key={metric.stage} className="py-2 pr-4 font-medium">
                            {metric.stage}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentEntries.map((entry) => (
                        <tr key={entry.date} className="border-b border-[#f7f7f7] last:border-0">
                          <td className="py-3 pr-4 text-[#0d0d12]">{entry.date}</td>
                          {selectedMetrics.map((metric) => (
                            <td key={`${entry.date}-${metric.stage}`} className="py-3 pr-4 text-[#0d0d12]">
                              {entry.values?.[metric.stage] ?? "—"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
