import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { getActiveProductId } from "@/lib/activeProduct";
import GrowthRoutines from "@/components/GrowthRoutines";
import GoalsSection from "@/components/GoalsSection";
import TimelineFeed from "@/components/TimelineFeed";
import PageHeader from "@/components/PageHeader";
import GrowthChecklistSection from "@/components/GrowthChecklistSection";
import AdvisorCard from "@/components/AdvisorCard";
import GrowthTacticsPanel from "@/components/GrowthTacticsPanel";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getGrowthTacticsPlan } from "@/lib/growth-tactics";
import { getGrowthWorkspaceStep } from "@/lib/growth-workspace-step";
import { getMetricSetup } from "@/lib/metric-setup";
import { buildFunnelHealthSummary } from "@/lib/funnel-health";

const GROWTH_ACTION_HINTS = {
  Awareness: "Trafik kaynağını ve dağıtımı güçlendirecek tek hamleyi seç.",
  Acquisition: "Signup veya ilk deneme sürtüşmesini azaltacak değişikliği öne al.",
  Activation: "İlk değere giden adımı kısaltacak onboarding iyileştirmesini yap.",
  Retention: "Geri gelme sebebini netleştir; alışkanlık ve kullanım tekrarını artır.",
  Referral: "Davet veya paylaşım akışını görünür ve sürtünmesiz hale getir.",
  Revenue: "Ücretliye geçişteki ana friksiyonu bul ve tek noktaya odaklan.",
} as const;

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
  const integrations = await prisma.integration.findMany({
    where: { productId: product.id, status: "CONNECTED" },
    select: { provider: true },
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
  const savedMetricSetup = await getMetricSetup(product.id);
  const hasSetup = !!savedMetricSetup?.selections?.length;
  const hasMetricEntries = (savedMetricSetup?.entries?.length ?? 0) > 0;
  const hasGoals = goals.length > 0;
  const completedGrowthItems = growthChecklists.filter((item) => item.completed).length;
  const isLaunched = product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;
  const nextStep = getGrowthWorkspaceStep({
    hasSetup,
    hasMetricEntries,
    hasGoals,
    completedGrowthItems,
    totalGrowthItems: growthChecklists.length,
    locale,
  });
  const selectedMetrics = metricPlan.sections.flatMap((section) => {
    const selectedKeys =
      savedMetricSetup?.selections.find((item) => item.stage === section.stage)?.selectedMetricKeys ?? [];
    return section.metrics
      .filter((metric) => selectedKeys.includes(metric.key))
      .map((metric) => ({
        stage: section.stage,
        metricKey: metric.key,
        metricName: metric.name,
      }));
  });
  const funnelHealth =
    hasSetup && hasMetricEntries
      ? buildFunnelHealthSummary({
          product: {
            category: product.category,
            targetAudience: product.targetAudience,
            businessModel: product.businessModel,
            description: product.description,
            website: product.website,
          },
          selectedMetrics,
          entries: savedMetricSetup?.entries ?? [],
        })
      : null;
  const atRiskStage = funnelHealth?.stages.find((item) => item.status === "AT_RISK") ?? null;
  const primaryGrowthTitle = !hasSetup
    ? "Önce ölçüm sistemini kur"
    : !hasMetricEntries
      ? "İlk baz çizgisini oluştur"
      : atRiskStage
        ? `${atRiskStage.stageLabel} şu an en zayıf halka`
        : !hasGoals
          ? "Takip ettiğin sayıyı hedefe bağla"
          : completedGrowthItems < growthChecklists.length
            ? "Şimdi execution tarafını ilerlet"
            : "Büyüme ritmini koru ve tekrar eden darboğazı izle";
  const primaryGrowthDescription = !hasSetup
    ? "Growth tarafında güvenilir öneri verebilmemiz için önce metrics ekranında hangi sinyalleri takip ettiğini netleştirmen gerekiyor."
    : !hasMetricEntries
      ? "Metrikler seçili ama henüz gerçek veri akışı yok. İlk girişler gelmeden growth tarafı sadece varsayım üretir."
      : atRiskStage
        ? `${funnelHealth?.nextFocus ?? ""} ${GROWTH_ACTION_HINTS[atRiskStage.stage] ?? ""}`.trim()
        : !hasGoals
          ? "Veriyi yorumlamak için artık hedef değer tanımlama zamanı. Ölçtüğün sayıyı neye taşımaya çalıştığını netleştir."
          : completedGrowthItems < growthChecklists.length
            ? "Ölçüm sistemi çalışıyor. Bundan sonraki iş, metriği gerçekten hareket ettirecek growth işlerini tamamlamak."
            : "Temel kurulum oturdu. Şimdi haftalık ritimde zayıf halkayı izleyip yeni problem belirdiğinde hızlı aksiyon almak önemli.";
  const primaryGrowthHref = !hasSetup || !hasMetricEntries ? `/${locale}/metrics` : nextStep.href;
  const primaryGrowthCta = !hasSetup
    ? "Ölçüm sistemine git"
    : !hasMetricEntries
      ? "İlk metriği gir"
      : nextStep.cta;
  const goalKey = (() => {
    try {
      const parsed = product.launchGoals ? JSON.parse(product.launchGoals) : null;
      return typeof parsed?.goalKey === "string" ? parsed.goalKey : null;
    } catch {
      return null;
    }
  })();
  const tacticsPlan = getGrowthTacticsPlan({
    product: {
      status: product.status,
      category: product.category,
      description: product.description,
      targetAudience: product.targetAudience,
      businessModel: product.businessModel,
      website: product.website,
      platforms: savedMetricSetup?.platforms ?? [],
      goalKey,
    },
    hasMetricSetup: hasSetup,
    hasMetricEntries,
    connectedSourceCount: integrations.length,
    funnelHealth,
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Sıradaki aşama</p>
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
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Launch bağlantısı</p>
              <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">Buradan launch sayfasına dönebilirsin</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                Launch tarafı tamamlandığında growth sekmesi otomatik olarak ana çalışma alanına dönüşür.
              </p>
              <a
                href={`/${locale}/pre-launch`}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                Launch sayfasına git
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
        title="Growth odağın"
        description={
          "Burası yorum, öncelik ve execution yüzeyi. Neyi ölçtüğünü ve veri akışını Metrics ekranında yönet; burada ise neyin sıkıştığını ve sıradaki hamleyi gör."
        }
      />

      <div className="space-y-4">
        <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Bugünkü durum</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {!hasSetup
                  ? "Ölçüm sistemi eksik"
                  : !hasMetricEntries
                    ? "İlk veri bekleniyor"
                    : funnelHealth?.headline ?? "Growth ritmi okunuyor"}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                {!hasSetup
                  ? "Güvenilir growth önerisi için önce hangi sinyalleri takip ettiğini netleştir."
                  : !hasMetricEntries
                    ? "Veri gelince Tiramisup zayıf halkayı ve öncelikli growth aksiyonunu daha net söyleyebilir."
                    : funnelHealth?.summary ?? "Growth tarafı düzenli olarak izleniyor."}
              </p>
            </div>
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Ölçüm sistemi</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {hasSetup ? `${selectedMetrics.length} sinyal seçili` : "Kurulum yapılmadı"}
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                {hasSetup
                  ? `${integrations.length} bağlı kaynak var. Ölçüm seçimlerini, veri akışını ve günlük girişleri Metrics tarafında yönetirsin.`
                  : "Metrik seçimi ve kaynak uyumu Metrics ekranında kurulur."}
              </p>
            </div>
            <div className="rounded-[12px] bg-[#fafafa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Execution durumu</p>
              <p className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                {completedGrowthItems}/{growthChecklists.length || 0} büyüme işi tamamlandı
              </p>
              <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
                Hedefler, checklist ve rutinler burada; yani sayıyı görmekle işi yapmak aynı yüzeyde birleşiyor.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
          <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Bugünün growth odağı</p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">{primaryGrowthTitle}</h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">
              {primaryGrowthDescription}
            </p>
            <a
              href={primaryGrowthHref}
              className="mt-5 inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {primaryGrowthCta}
            </a>
          </div>

          <div id="coach">
            <AdvisorCard productId={product.id} productName={product.name} eventType="GROWTH_VIEW" />
          </div>
        </div>

        <GrowthTacticsPanel plan={tacticsPlan} />

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
          <div className="space-y-4">
            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#666d80]">Ölçüm sistemi</p>
              <h3 className="mt-2 text-[17px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                {hasSetup ? "Takip ettiğin metrikleri gözden geçir" : "Önce metrikleri tanımla"}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                Growth tarafında yorum ve öncelik var. Hangi metriği seçtiğin, veri girişi ve kaynak bağlantıları ise Metrics ekranında yönetilir.
              </p>
              <a
                href={`/${locale}/metrics`}
                className="mt-4 inline-flex h-10 items-center rounded-full border border-[#0d0d12] bg-white px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#0d0d12] hover:text-white"
              >
                Metrics ekranına git
              </a>
            </div>
            <TimelineFeed events={timelineEvents} productId={product.id} />
          </div>
        </div>
      </div>
    </div>
  );
}
