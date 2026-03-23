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
import AdvisorCard from "@/components/AdvisorCard";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getGrowthWorkspaceStep } from "@/lib/growth-workspace-step";
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
  const hasMetricEntries = (savedMetricSetup?.entries?.length ?? 0) > 0;
  const hasGoals = goals.length > 0;
  const completedGrowthItems = growthChecklists.filter((item) => item.completed).length;
  const isLaunched = product.status === "LAUNCHED" || product.status === "GROWING";
  const nextStep = getGrowthWorkspaceStep({
    hasSetup,
    hasMetricEntries,
    hasGoals,
    completedGrowthItems,
    totalGrowthItems: growthChecklists.length,
    locale,
  });

  if (!isLaunched) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow={t("eyebrow")}
          title="Growth"
          description="Bu ürün henüz launch öncesi aşamada. Growth alanı burada ama bir sonraki aşama olarak konumlanıyor."
        />

        <section className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Next stage</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                Growth burada kilitli değil, sıradaki aşama olarak bekliyor
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#5e6678]">
                Launch hazırlığını tamamladığında burası senin metrik setup, günlük veri girişi ve growth checklist çalışma alanına dönüşecek.
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-[16px] bg-[#f8fbfb] px-4 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">Şimdi ne yapmalısın?</p>
                  <p className="mt-1 text-[14px] leading-6 text-[#3d4658]">
                    Önce `Launch` tarafındaki kritik maddeleri kapat. Yayına yaklaştığında Growth için takip edeceğin AARRR metriklerini seçmeye başlayabilirsin.
                  </p>
                </div>
                <div className="rounded-[16px] border border-dashed border-[#e8e8e8] bg-[#fcfcfc] px-4 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">Growth açılınca</p>
                  <p className="mt-1 text-[14px] leading-6 text-[#3d4658]">
                    Önce tracking seçimi, sonra ilk günlük veri girişi, sonra trend görünümü, en son optimizasyon önerileri.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#eef1f2] bg-[#fbfcfc] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Launch readiness link</p>
              <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">Buradan launch board&apos;a geçebilirsin</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                Launch tarafı tamamlandığında growth sekmesi otomatik olarak ana çalışma alanına dönüşür.
              </p>
              <a
                href={`/${locale}/pre-launch`}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                Launch board&apos;a git
              </a>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={hasSetup ? "Neyi takip ettiğini yönet" : "Önce hangi sayıları takip edeceğini seç"}
        description={
          hasSetup
            ? "Growth ekranı seçimini ve odak alanını yönetir. Günlük sayı girişi ve değişimi görmek için bir sonraki adım Metrics ekranıdır."
            : "Burada amacımız optimizasyon yapmak değil. Önce her adım için tek bir ana sayı seçiyoruz."
        }
      />

      <div className="space-y-4">
        <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Growth durumu</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {hasSetup ? "Setup net" : "Setup bekliyor"}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                {hasSetup
                  ? "Hangi sayıları takip edeceğin tanımlı."
                  : "AARRR boyunca her adım için tek ana metriği seçmen gerekiyor."}
              </p>
            </div>
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Metrics durumu</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {hasMetricEntries ? "İlk veri var" : "İlk veri bekliyor"}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                {hasMetricEntries
                  ? "Artık hangi sayının hareket ettiğini gün gün görebilirsin."
                  : "Setup sonrası ilk gerçek sayıları girince growth kararları anlam kazanır."}
              </p>
            </div>
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Execution durumu</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {completedGrowthItems}/{growthChecklists.length || 0} growth işi tamam
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                Hedefler, checklist ve rutinler burada; yani sayıyı görmekle işi yapmak aynı yüzeyde birleşiyor.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Growth burada ne yapar?</p>
              <p className="mt-1 text-[14px] leading-6 text-[#0d0d12]">
                Hangi sayıları takip edeceğini seçer, odak alanını netleştirir ve sonraki growth aksiyonlarını planlar.
              </p>
            </div>
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Metrics ne yapar?</p>
              <p className="mt-1 text-[14px] leading-6 text-[#0d0d12]">
                Seçtiğin sayılar için bugünkü değerleri girer, son durumunu ve trendi görürsün.
              </p>
            </div>
          </div>
        </div>

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
              <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">{nextStep.title}</h2>
              <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
                {nextStep.description}
              </p>
              <a
                href={nextStep.href}
                className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                {nextStep.cta}
              </a>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="space-y-4 lg:col-span-2">
                <div id="growth-checklist">
                  <GrowthChecklistSection items={growthChecklists} />
                </div>
                <div id="goals">
                  <GoalsSection goals={goals} productId={product.id} metricSetup={savedMetricSetup} />
                </div>
                <GrowthRoutines routines={routines} productId={product.id} />
              </div>
              <div>
                <div id="coach" className="mb-4">
                  <AdvisorCard productId={product.id} productName={product.name} eventType="GROWTH_VIEW" />
                </div>
                <TimelineFeed events={timelineEvents} productId={product.id} />
              </div>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
