import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import GrowthRoutines from "@/components/GrowthRoutines";
import GoalsSection from "@/components/GoalsSection";
import TimelineFeed from "@/components/TimelineFeed";
import PageHeader from "@/components/PageHeader";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
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
      <div className="text-center py-20 text-[#666d80]">Ürün bulunamadı</div>
    );
  }

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

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <GoalsSection goals={goals} productId={product.id} />
          <GrowthRoutines routines={routines} productId={product.id} />
        </div>
        <div>
          <TimelineFeed events={timelineEvents} productId={product.id} />
        </div>
      </div>
    </div>
  );
}
