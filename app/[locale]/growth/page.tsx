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
import GrowthMetricRecommendations from "@/components/GrowthMetricRecommendations";
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

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="space-y-4">
        <GrowthMetricRecommendations plan={metricPlan} />
        <MetricSetupSelector
          productId={product.id}
          plan={metricPlan}
          initialSetup={savedMetricSetup}
        />

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
      </div>
    </div>
  );
}
