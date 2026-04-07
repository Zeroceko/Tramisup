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
import GrowthTacticsPanel from "@/components/GrowthTacticsPanel";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getGrowthTacticsPlan } from "@/lib/growth-tactics";
import { getGrowthWorkspaceStep } from "@/lib/growth-workspace-step";
import { getMetricSetup } from "@/lib/metric-setup";
import { buildFunnelHealthSummary } from "@/lib/funnel-health";

export default async function GrowthPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const t = await getTranslations("growth");
  const isEn = locale === "en";
  const growthActionHints = {
    Awareness: isEn
      ? "Choose the one move that strengthens distribution and traffic quality."
      : "Trafik kaynağını ve dağıtımı güçlendirecek tek hamleyi seç.",
    Acquisition: isEn
      ? "Prioritize the change that removes signup or trial friction."
      : "Signup veya ilk deneme sürtüşmesini azaltacak değişikliği öne al.",
    Activation: isEn
      ? "Improve onboarding so users reach first value faster."
      : "İlk değere giden adımı kısaltacak onboarding iyileştirmesini yap.",
    Retention: isEn
      ? "Clarify why users should come back and reinforce repeat usage."
      : "Geri gelme sebebini netleştir; alışkanlık ve kullanım tekrarını artır.",
    Referral: isEn
      ? "Make the invite or sharing flow visible and low-friction."
      : "Davet veya paylaşım akışını görünür ve sürtünmesiz hale getir.",
    Revenue: isEn
      ? "Find the one blocker that prevents users from moving to paid."
      : "Ücretliye geçişteki ana friksiyonu bul ve tek noktaya odaklan.",
  } as const;

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center text-[#666d80]">{isEn ? "Product not found" : "Ürün bulunamadı"}</div>
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
    locale,
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
    ? isEn ? "Set up your measurement system first" : "Önce ölçüm sistemini kur"
    : !hasMetricEntries
        ? isEn ? "Create the first baseline" : "İlk baz çizgisini oluştur"
      : atRiskStage
        ? isEn ? `${atRiskStage.stageLabel} is the weak link right now` : `${atRiskStage.stageLabel} şu an en zayıf halka`
        : !hasGoals
          ? isEn ? "Connect the metric you track to a goal" : "Takip ettiğin sayıyı hedefe bağla"
          : completedGrowthItems < growthChecklists.length
            ? isEn ? "Push the execution side forward" : "Şimdi execution tarafını ilerlet"
            : isEn ? "Protect your growth rhythm and watch for repeated bottlenecks" : "Büyüme ritmini koru ve tekrar eden darboğazı izle";
  const primaryGrowthDescription = !hasSetup
    ? isEn
      ? "Before Growth can give you reliable guidance, you need to define which signals you track on the Metrics screen."
      : "Growth tarafında güvenilir öneri verebilmemiz için önce metrics ekranında hangi sinyalleri takip ettiğini netleştirmen gerekiyor."
    : !hasMetricEntries
      ? isEn
        ? "Your metrics are selected, but there is no real data flow yet. Before the first entries land, Growth can only guess."
        : "Metrikler seçili ama henüz gerçek veri akışı yok. İlk girişler gelmeden growth tarafı sadece varsayım üretir."
      : atRiskStage
        ? `${funnelHealth?.nextFocus ?? ""} ${growthActionHints[atRiskStage.stage] ?? ""}`.trim()
        : !hasGoals
          ? isEn
            ? "Now it is time to define a target value. Clarify what you are trying to move that metric toward."
            : "Veriyi yorumlamak için artık hedef değer tanımlama zamanı. Ölçtüğün sayıyı neye taşımaya çalıştığını netleştir."
          : completedGrowthItems < growthChecklists.length
            ? isEn
              ? "The measurement system is running. From here, the job is to finish the growth work that will actually move the metric."
              : "Ölçüm sistemi çalışıyor. Bundan sonraki iş, metriği gerçekten hareket ettirecek growth işlerini tamamlamak."
            : isEn
              ? "The foundation is set. Now keep a weekly rhythm, watch the weak link, and react fast when a new problem appears."
              : "Temel kurulum oturdu. Şimdi haftalık ritimde zayıf halkayı izleyip yeni problem belirdiğinde hızlı aksiyon almak önemli.";
  const primaryGrowthHref = !hasSetup || !hasMetricEntries ? `/${locale}/metrics` : nextStep.href;
  const primaryGrowthCta = !hasSetup
    ? isEn ? "Go to Metrics" : "Ölçüm sistemine git"
    : !hasMetricEntries
      ? isEn ? "Enter the first metrics" : "İlk metriği gir"
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
    locale,
  });

  if (!isLaunched) {
    return (
      <div className="space-y-4">
        <PageHeader
          eyebrow={t("eyebrow")}
          title="Growth"
          description={isEn
            ? "This product is still pre-launch. Growth exists here, but it becomes the active workspace only after launch."
            : "Bu ürün henüz launch öncesi aşamada. Growth alanı burada ama bir sonraki aşama olarak konumlanıyor."}
        />

        <section className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{isEn ? "Next stage" : "Sıradaki aşama"}</p>
              <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                {isEn ? "Growth is queued as the next workspace" : "Growth burada kilitli değil, sıradaki aşama olarak bekliyor"}
              </h2>
              <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#5e6678]">
                {isEn
                  ? "Once launch preparation is complete, this becomes your metric setup, daily input, and growth checklist workspace."
                  : "Launch hazırlığını tamamladığında burası senin metrik setup, günlük veri girişi ve growth checklist çalışma alanına dönüşecek."}
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-[16px] bg-[#f8fbfb] px-4 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">{isEn ? "What should you do now?" : "Şimdi ne yapmalısın?"}</p>
                  <p className="mt-1 text-[14px] leading-6 text-[#3d4658]">
                    {isEn
                      ? "First, close the critical items on the Launch side. As you get closer to launch, you can start selecting the AARRR metrics you will track in Growth."
                      : "Önce `Launch` tarafındaki kritik maddeleri kapat. Yayına yaklaştığında Growth için takip edeceğin AARRR metriklerini seçmeye başlayabilirsin."}
                  </p>
                </div>
                <div className="rounded-[16px] border border-dashed border-[#e8e8e8] bg-[#fcfcfc] px-4 py-4">
                  <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">{isEn ? "Once Growth opens" : "Growth açılınca"}</p>
                  <p className="mt-1 text-[14px] leading-6 text-[#3d4658]">
                    {isEn
                      ? "First metric selection, then the first daily entry, then trend visibility, and only after that optimization suggestions."
                      : "Önce tracking seçimi, sonra ilk günlük veri girişi, sonra trend görünümü, en son optimizasyon önerileri."}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[18px] border border-[#eef1f2] bg-[#fbfcfc] p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{isEn ? "Launch link" : "Launch bağlantısı"}</p>
              <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">{isEn ? "Return to the launch workspace" : "Buradan launch sayfasına dönebilirsin"}</h3>
              <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                {isEn
                  ? "Once launch is complete, the Growth tab becomes one of your main operating surfaces."
                  : "Launch tarafı tamamlandığında growth sekmesi otomatik olarak ana çalışma alanına dönüşür."}
              </p>
              <a
                href={`/${locale}/pre-launch`}
                className="mt-5 inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                {isEn ? "Go to Launch" : "Launch sayfasına git"}
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
        title={isEn ? "Growth focus" : "Growth odağın"}
        description={
          isEn
            ? "This is the diagnosis, priority, and execution surface. Manage what you measure and how data arrives in Metrics; use Growth to see what is blocked and what to do next."
            : "Burası yorum, öncelik ve execution yüzeyi. Neyi ölçtüğünü ve veri akışını Metrics ekranında yönet; burada ise neyin sıkıştığını ve sıradaki hamleyi gör."
        }
      />

      <div className="space-y-4">
        {/* PRIMARY: Today's growth focus — single weak-link callout, the only thing that matters above the fold */}
        <div id="coach" className="rounded-[18px] border border-[#e8e8e8] bg-white p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
            {isEn ? "Today's growth focus" : "Bugünün growth odağı"}
          </p>
          <h2 className="mt-2 text-[24px] font-semibold leading-tight tracking-[-0.02em] text-[#0d0d12]">
            {primaryGrowthTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#5e6678]">
            {primaryGrowthDescription}
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={primaryGrowthHref}
              className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {primaryGrowthCta}
            </a>
            {hasSetup && (
              <span className="text-[12px] text-[#8a8fa0]">
                {isEn
                  ? `${selectedMetrics.length} signals · ${integrations.length} sources · ${completedGrowthItems}/${growthChecklists.length || 0} done`
                  : `${selectedMetrics.length} sinyal · ${integrations.length} kaynak · ${completedGrowthItems}/${growthChecklists.length || 0} tamamlandı`}
              </span>
            )}
          </div>
        </div>

        {/* EXECUTION: checklist is the action surface */}
        <div id="growth-checklist">
          <GrowthChecklistSection items={growthChecklists} locale={locale} />
        </div>

        {/* SECONDARY: tactics, goals, routines, timeline — all collapsed by default */}
        <CollapsibleSection label={isEn ? "Growth tactics" : "Growth taktikleri"} defaultCollapsed>
          <GrowthTacticsPanel plan={tacticsPlan} locale={locale} />
        </CollapsibleSection>

        <CollapsibleSection label={isEn ? "Goals" : "Hedefler"} defaultCollapsed>
          <div id="goals">
            <GoalsSection goals={goals} productId={product.id} metricSetup={savedMetricSetup} locale={locale} />
          </div>
        </CollapsibleSection>

        <CollapsibleSection label={isEn ? "Routines" : "Rutinler"} defaultCollapsed>
          <GrowthRoutines routines={routines} productId={product.id} locale={locale} />
        </CollapsibleSection>

        <CollapsibleSection label={isEn ? "Timeline" : "Zaman tüneli"} defaultCollapsed>
          <TimelineFeed events={timelineEvents} productId={product.id} locale={locale} />
        </CollapsibleSection>
      </div>
    </div>
  );
}
