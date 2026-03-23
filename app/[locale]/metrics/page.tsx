import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import MetricsOverview from "@/components/MetricsOverview";
import MetricEntryForm from "@/components/MetricEntryForm";
import RetentionCohortTable from "@/components/RetentionCohortTable";
import ActivationFunnelChart from "@/components/ActivationFunnelChart";
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
      <div className="text-center py-20 text-[#666d80]">Ürün bulunamadı</div>
    );
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const metrics = await prisma.metric.findMany({
    where: { productId: product.id, date: { gte: thirtyDaysAgo } },
    orderBy: { date: "asc" },
  });

  const retentionCohorts = await prisma.retentionCohort.findMany({
    where: { productId: product.id },
    orderBy: { cohortDate: "desc" },
    take: 10,
  });

  const latestMetric = await prisma.metric.findFirst({
    where: { productId: product.id },
    orderBy: { date: "desc" },
  });

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
      .map((metric) => ({ stage: section.stage, name: metric.name }));
  });

  const kpiItems = [
    { label: "Günlük Aktif Kullanıcı", value: latestMetric?.dau?.toLocaleString() || "—" },
    { label: "Aylık Aktif Kullanıcı",  value: latestMetric?.mau?.toLocaleString() || "—" },
    { label: "MRR",                     value: latestMetric?.mrr ? `$${latestMetric.mrr.toLocaleString()}` : "—" },
    { label: "Aktivasyon Oranı",        value: latestMetric?.activationRate ? `${latestMetric.activationRate}%` : "—" },
  ];

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
        <div className="lg:col-span-2 space-y-4">
          {selectedMetrics.length > 0 ? (
            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Takip edilen funnel metrikleri</p>
              <h2 className="text-[16px] font-semibold text-[#0d0d12]">Seçtiğin metrik seti</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedMetrics.map((metric) => (
                  <span
                    key={`${metric.stage}-${metric.name}`}
                    className="inline-flex rounded-full bg-[#f6f6f6] px-3 py-1.5 text-[12px] text-[#0d0d12]"
                  >
                    {metric.stage}: {metric.name}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
          <MetricsOverview metrics={metrics} />
        </div>
        <div>
          <MetricEntryForm productId={product.id} latestMetric={latestMetric} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ActivationFunnelChart productId={product.id} />
        <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Anlık</p>
          <h2 className="text-[16px] font-semibold text-[#0d0d12] mb-5">Temel Metrikler</h2>
          {latestMetric ? (
            <div className="space-y-4">
              {kpiItems.map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-[#f0f0f0] last:border-0">
                  <p className="text-[13px] text-[#666d80]">{label}</p>
                  <p className="text-[18px] font-bold text-[#0d0d12] tracking-[-0.02em]">{value}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[13px] text-[#9ca3af] text-center py-10">Henüz metrik verisi yok</p>
          )}
        </div>
      </div>

      <RetentionCohortTable cohorts={retentionCohorts} />
    </div>
  );
}
