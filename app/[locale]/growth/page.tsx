import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import GrowthRoutines from "@/components/GrowthRoutines";
import GoalsSection from "@/components/GoalsSection";
import TimelineFeed from "@/components/TimelineFeed";
import PageHeader from "@/components/PageHeader";
import GrowthChecklistSection from "@/components/GrowthChecklistSection";
import MetricSetupSelector from "@/components/MetricSetupSelector";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { parseSavedMetricSetup } from "@/lib/metric-setup";

export default async function GrowthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const t = await getTranslations("growth");

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

  const growthChecklists = await prisma.growthChecklist.findMany({
    where: { productId: product.id },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const routines = await prisma.growthRoutine.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
  });

  const goals = await prisma.goal.findMany({
    where: { productId: product.id },
    orderBy: { endDate: "asc" },
  });

  const timelineEvents = await prisma.timelineEvent.findMany({
    where: { productId: product.id },
    orderBy: { date: "desc" },
    take: 20,
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
  const savedMetricSetup = parseSavedMetricSetup(product.launchGoals);
  const hasSetup = !!savedMetricSetup?.selections?.length;

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={hasSetup ? "Büyüme takibini yönet" : "Önce neyi takip edeceğini seç"}
        description={
          hasSetup
            ? "Metric setup'ın hazır. Şimdi günlük veri girişi, hedefler ve growth ritmi tarafını ilerletebilirsin."
            : "Sana her şeyi aynı anda yüklemiyorum. Önce her kategori için tek bir ana metrik seçelim."
        }
      />

      <div className="space-y-4">
        <MetricSetupSelector
          productId={product.id}
          plan={metricPlan}
          initialSetup={savedMetricSetup}
          locale={locale}
        />

        {hasSetup ? (
          <>
            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Bir sonraki adım</p>
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">Şimdi günlük metrik girişini başlat</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
                Setup tamam. Bundan sonra metrics ekranında gün gün veri girip AARRR performansının nasıl gittiğini görebilirsin.
              </p>
              <a
                href={`/${locale}/metrics`}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                Metrik girişine git
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <GrowthChecklistSection items={growthChecklists} />
                <GoalsSection goals={goals} productId={product.id} />
                <GrowthRoutines routines={routines} productId={product.id} />
              </div>
              <div>
                <TimelineFeed events={timelineEvents} productId={product.id} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
