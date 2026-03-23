import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import MetricEntryForm from "@/components/MetricEntryForm";
import MetricsTrendChart from "@/components/MetricsTrendChart";
import PageHeader from "@/components/PageHeader";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { parseSavedMetricSetup } from "@/lib/metric-setup";

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
  const savedSetup = parseSavedMetricSetup(product.launchGoals);
  const selectedMetrics = metricPlan.sections.flatMap((section) => {
    const selectedKeys = savedSetup?.selections.find((item) => item.stage === section.stage)?.selectedMetricKeys ?? [];
    return section.metrics
      .filter((metric) => selectedKeys.includes(metric.key))
      .map((metric) => ({ stage: section.stage, metricKey: metric.key, metricName: metric.name }));
  });
  const latestEntry = savedSetup?.entries.at(-1) ?? null;
  const previousEntry = savedSetup && savedSetup.entries.length > 1
    ? savedSetup.entries[savedSetup.entries.length - 2]
    : null;
  const recentEntries = [...(savedSetup?.entries ?? [])].reverse().slice(0, 7);
  const chartEntries = (savedSetup?.entries ?? []).slice(-14).map((entry) => ({
    date: entry.date.slice(5),
    ...entry.values,
  }));

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={selectedMetrics.length > 0 ? "Günlük metrik takibi" : t("title")}
        description={
          selectedMetrics.length > 0
            ? "Sadece seçtiğin ana AARRR metriklerini gir ve gidişatı gün gün izle."
            : "Önce growth sayfasında hangi metrikleri takip edeceğini seç."
        }
      />

      {selectedMetrics.length === 0 ? (
        <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-8 text-center">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Metrics ne işe yarıyor?</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Girdiğin sayıların yeri burası</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-[12px] bg-[#fafafa] p-4">
                  <p className="text-[12px] font-semibold text-[#0d0d12]">1. Bugünkü değerleri gir</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">Sağdaki formdan sadece seçtiğin sayıları girersin.</p>
                </div>
                <div className="rounded-[12px] bg-[#fafafa] p-4">
                  <p className="text-[12px] font-semibold text-[#0d0d12]">2. Son durumu gör</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">Aşağıdaki kartlarda son girilen değer hemen görünür.</p>
                </div>
                <div className="rounded-[12px] bg-[#fafafa] p-4">
                  <p className="text-[12px] font-semibold text-[#0d0d12]">3. Değişimi takip et</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">Yeterli veri girince trend grafiği ve geçmiş tablo oluşur.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Takip edilen metrikler</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Seçtiğin ana set</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {selectedMetrics.map((metric) => (
                  <div key={metric.stage} className="rounded-[12px] bg-[#fafafa] p-4">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666d80]">{metric.stage}</p>
                    <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">{metric.metricName}</p>
                    <p className="mt-2 text-[24px] font-bold tracking-[-0.02em] text-[#0d0d12]">
                      {latestEntry?.values?.[metric.stage] ?? "—"}
                    </p>
                    <p className="mt-1 text-[12px] text-[#666d80]">
                      {previousEntry?.values?.[metric.stage] != null && latestEntry?.values?.[metric.stage] != null
                        ? `Önceki girişe göre ${Number(latestEntry.values[metric.stage]) - Number(previousEntry.values[metric.stage]) >= 0 ? "+" : ""}${Number(latestEntry.values[metric.stage]) - Number(previousEntry.values[metric.stage])}`
                        : "Son girilen değer"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Gidişat</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Trend görünümü</h2>
              {chartEntries.length < 2 ? (
                <p className="mt-4 text-[13px] text-[#666d80]">
                  Grafik en az 2 günlük girişten sonra görünür. Şimdilik aşağıda son girişlerini tablo halinde tutuyorum.
                </p>
              ) : (
                <div className="mt-4">
                  <MetricsTrendChart entries={chartEntries} series={selectedMetrics} />
                </div>
              )}
            </div>

            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Geçmiş</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Son girişler</h2>
              {recentEntries.length === 0 ? (
                <p className="mt-4 text-[13px] text-[#666d80]">Henüz veri girişi yok. Sağdaki formdan ilk gününü gir.</p>
              ) : (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full text-left text-[13px]">
                    <thead>
                      <tr className="border-b border-[#f0f0f0] text-[#666d80]">
                        <th className="py-2 pr-4 font-medium">Tarih</th>
                        {selectedMetrics.map((metric) => (
                          <th key={metric.stage} className="py-2 pr-4 font-medium">{metric.stage}</th>
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

            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Bir sonraki adım</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Sayıyı girdikten sonra işi ilerlet</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
                Metrics burada neyin değiştiğini gösterir. Bu değişime göre bugün hangi işi ele alacağını görmek için görevler yüzeyine geç.
              </p>
              <a
                href={`/${locale}/tasks`}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full border border-[#e8e8e8] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6]"
              >
                Görevlere geç
              </a>
            </div>
          </div>

          <div>
            <MetricEntryForm productId={product.id} selectedMetrics={selectedMetrics} latestEntry={latestEntry} />
          </div>
        </div>
      )}
    </div>
  );
}
