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
        <div className="lg:col-span-2">
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
