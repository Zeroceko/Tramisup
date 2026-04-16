import { getTranslations } from "next-intl/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import GrowthRoutines from "@/components/GrowthRoutines";
import GoalsSection from "@/components/GoalsSection";
import TimelineFeed from "@/components/TimelineFeed";
import PageHeader from "@/components/PageHeader";
import GrowthChecklistSection from "@/components/GrowthChecklistSection";
import GrowthTacticsPanel from "@/components/GrowthTacticsPanel";
import GrowthTransitionCheckin from "@/components/GrowthTransitionCheckin";
import CollapsibleSection from "@/components/CollapsibleSection";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { getGrowthTacticsPlan } from "@/lib/growth-tactics";
import { getGrowthWorkspaceStep } from "@/lib/growth-workspace-step";
import { getMetricSetup } from "@/lib/metric-setup";
import { buildFunnelHealthSummary } from "@/lib/funnel-health";
import {
  readGrowthCheckinFromAdditionalContext,
  selectGrowthCheckinQuestions,
} from "@/lib/growth-transition-checkin";
import { getRequestActiveProductId, getRequestSession } from "@/lib/request-cache";
import { startServerTiming } from "@/lib/server-perf";

type GrowthWorkspaceMode =
  | "intake_needed"
  | "metric_setup_needed"
  | "baseline_needed"
  | "diagnosis_ready";

function getGrowthWorkspaceMode({
  hasIntake,
  hasSetup,
  hasMetricEntries,
}: {
  hasIntake: boolean;
  hasSetup: boolean;
  hasMetricEntries: boolean;
}): GrowthWorkspaceMode {
  if (!hasIntake) return "intake_needed";
  if (!hasSetup) return "metric_setup_needed";
  if (!hasMetricEntries) return "baseline_needed";
  return "diagnosis_ready";
}

function mapStageToGrowthCategory(stage?: string | null) {
  if (stage === "Awareness" || stage === "Acquisition") return "ACQUISITION";
  if (stage === "Activation") return "ACTIVATION";
  if (stage === "Retention" || stage === "Referral") return "RETENTION";
  if (stage === "Revenue") return "REVENUE";
  return undefined;
}

export default async function GrowthPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ baseline?: string; onboarding?: string; sourceSetup?: string }>;
}) {
  const perf = startServerTiming("growth-page");
  const { locale } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const [session, t, activeId] = await Promise.all([
    getRequestSession(),
    getTranslations("growth"),
    getRequestActiveProductId(),
  ]);
  if (!session?.user?.id) redirect(`/${locale}/login`);
  const isEn = locale === "en";
  let perfProductId: string | null = null;
  try {
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

  const product = await prisma.product.findFirst({
    where: {
      userId: session.user.id,
      ...(activeId ? { id: activeId } : {}),
    },
    select: {
      id: true,
      name: true,
      status: true,
      category: true,
      description: true,
      targetAudience: true,
      businessModel: true,
      website: true,
      additionalContext: true,
      launchGoals: true,
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center text-[#666d80]">{isEn ? "Product not found" : "Ürün bulunamadı"}</div>
    );
  }
  perfProductId = product.id;

  const [growthChecklists, routines, goals, integrations, timelineEvents, savedMetricSetup] =
    await Promise.all([
      prisma.growthChecklist.findMany({
        where: { productId: product.id },
        orderBy: [{ category: "asc" }, { order: "asc" }],
      }),
      prisma.growthRoutine.findMany({
        where: { productId: product.id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.goal.findMany({
        where: { productId: product.id },
        orderBy: { endDate: "asc" },
      }),
      prisma.integration.findMany({
        where: { productId: product.id, status: "CONNECTED" },
        select: { provider: true },
      }),
      prisma.timelineEvent.findMany({
        where: { productId: product.id },
        orderBy: { date: "desc" },
        take: 20,
      }),
      getMetricSetup(product.id),
    ]);
  const connectedSourceCount = integrations.length;

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
  const storedAdditionalContext = readGrowthCheckinFromAdditionalContext(product.additionalContext);
  const hasGrowthCheckin = Boolean(storedAdditionalContext.growthCheckin?.completedAt);
  const hasSetup = !!savedMetricSetup?.selections?.length;
  const hasMetricEntries = (savedMetricSetup?.entries?.length ?? 0) > 0;
  const workspaceMode = getGrowthWorkspaceMode({
    hasIntake: hasGrowthCheckin,
    hasSetup,
    hasMetricEntries,
  });
  const hasGoals = goals.length > 0;
  const completedGrowthItems = growthChecklists.filter((item) => item.completed).length;
  const isLaunched = product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;
  const growthCheckinQuestions = selectGrowthCheckinQuestions({
    product,
    locale,
    connectedSourceCount,
  });
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
          locale,
        })
      : null;
  const atRiskStage = funnelHealth?.stages.find((item) => item.status === "AT_RISK") ?? null;
  const initialChecklistCategory = mapStageToGrowthCategory(atRiskStage?.stage);
  const checklistFocusNote =
    workspaceMode === "diagnosis_ready"
      ? atRiskStage
        ? funnelHealth?.nextFocus ?? null
        : hasGoals
          ? isEn
            ? "Your tracking system is live. Use the checklist to remove the next execution bottleneck."
            : "Takip sistemi çalışıyor. Şimdi checklist üzerinden sıradaki execution darboğazını kapat."
          : isEn
            ? "Your signals are visible now. Finish the checklist items that make those signals easier to move."
            : "Artık sinyaller görünür. Bu sayıları oynatmayı kolaylaştıracak checklist maddelerini tamamla."
      : null;
  const primaryGrowthTitle = !hasSetup
    ? !hasGrowthCheckin
      ? isEn ? "Start with a short growth check-in" : "Önce kısa bir growth değerlendirmesi yap"
      : isEn ? "Set up your measurement system first" : "Önce ölçüm sistemini kur"
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
    ? !hasGrowthCheckin
      ? isEn
        ? "Before metric setup starts, Tiramisup should learn a little more about this product's growth shape. Keep it short and specific."
        : "Metric setup başlamadan önce Tiramisup'ın bu ürünün growth yapısını biraz daha net anlaması gerekiyor. Kısa ve spesifik kal."
      : isEn
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
  const primaryGrowthHref = !hasGrowthCheckin
    ? "#growth-intake"
    : !hasSetup || !hasMetricEntries
      ? `/${locale}/metrics`
      : nextStep.href;
  const primaryGrowthCta = !hasGrowthCheckin
    ? isEn ? "Complete check-in" : "Değerlendirmeyi tamamla"
    : !hasSetup
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
  const pageHeaderTitle =
    workspaceMode === "intake_needed"
      ? isEn ? "Growth intake" : "Growth başlangıcı"
      : workspaceMode === "metric_setup_needed"
      ? isEn ? "Growth setup" : "Growth kurulumu"
      : workspaceMode === "baseline_needed"
        ? isEn ? "Record the baseline" : "Baz çizgisini kaydet"
        : isEn ? "Growth focus" : "Growth odağı";
  const baselineJustSaved = resolvedSearch.baseline === "ready";
  const onboardingKickoff = resolvedSearch.onboarding === "1";
  const sourceSetupJustFinished = resolvedSearch.sourceSetup === "1";
  const selectedMetricSummary = selectedMetrics.map((metric) => ({
    stage: metric.stage,
    metricName: metric.metricName,
  }));
  const pageHeaderDescription =
    workspaceMode === "intake_needed" && onboardingKickoff && hasSetup
      ? isEn
        ? "Your AARRR setup is already in place. Finish the short check-in so Growth can interpret those signals and open the baseline step."
        : "AARRR setup'ın zaten hazır. Growth'ün bu sinyalleri doğru yorumlaması ve baseline adımını açması için kısa check-in'i tamamla."
      : workspaceMode === "intake_needed"
      ? isEn
        ? "Before setup begins, answer a few focused questions so Growth can fit this product instead of falling back to a generic template."
        : "Setup başlamadan önce birkaç odaklı soruyu cevapla; böylece Growth genel bir şablona değil, bu ürünün gerçek bağlamına göre çalışsın."
      : workspaceMode === "metric_setup_needed"
      ? isEn
        ? "Growth should not start with guesswork. First define the signals you will trust, then move into diagnosis and execution."
        : "Growth tahminle başlamamalı. Önce güveneceğin sinyalleri tanımla, sonra teşhis ve execution tarafına geç."
      : workspaceMode === "baseline_needed"
        ? isEn
          ? "Your metric setup exists now. The next job is giving it the first real numbers so Growth can stop guessing."
          : "Metrik setup artık var. Sıradaki iş, Growth'ün tahmin etmeyi bırakması için ilk gerçek sayıları girmek."
        : isEn
          ? "This is the diagnosis, priority, and execution surface. Metrics decides what you track; Growth decides what to act on next."
          : "Burası teşhis, öncelik ve execution yüzeyi. Metrics neyi takip ettiğini netleştirir; Growth ise sıradaki doğru hamleyi seçtirir.";
  const workspaceStages = [
    {
      key: "intake",
      title: isEn ? "Growth intake" : "Growth başlangıcı",
      description: isEn
        ? "Answer a few product-specific questions so setup fits the real growth motion."
        : "Setup'ın gerçek growth hareketine uyması için ürüne özel birkaç soruyu cevapla.",
      state: hasGrowthCheckin ? "done" : "active",
    },
    {
      key: "setup",
      title: isEn ? "Signals to track" : "Takip edeceğin sinyaller",
      description: isEn
        ? "Choose the metrics that define healthy progress for this product."
        : "Bu ürün için sağlıklı ilerlemeyi tanımlayan metrikleri seç.",
      state: hasSetup ? "done" : hasGrowthCheckin ? "active" : "locked",
    },
    {
      key: "baseline",
      title: isEn ? "First baseline" : "İlk baz çizgisi",
      description: isEn
        ? "Enter the first real values so the product has a starting point."
        : "Ürünün referans noktası olması için ilk gerçek değerleri gir.",
      state: hasMetricEntries ? "done" : hasGrowthCheckin && hasSetup ? "active" : "locked",
    },
    {
      key: "diagnosis",
      title: isEn ? "Diagnosis & execution" : "Teşhis ve aksiyon",
      description: isEn
        ? "See the weak link, open the checklist, and turn insight into work."
        : "Zayıf halkayı gör, checklist'i aç ve içgörüyü işe çevir.",
      state: hasGrowthCheckin && hasSetup && hasMetricEntries ? "active" : "locked",
    },
  ] as const;

  if (!isLaunched) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f0f0]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8a8fa0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <h2 className="text-[20px] font-semibold text-[#0d0d12]">
            {isEn ? "Growth unlocks after launch" : "Growth, launch sonrası açılır"}
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
            {isEn
              ? "Complete your launch preparation first. Growth becomes your metric setup and execution workspace once the product is live."
              : "Önce launch hazırlığını tamamla. Ürün yayına geçtiğinde Growth, metrik ve execution çalışma alanın olur."}
          </p>
          <a
            href={`/${locale}/pre-launch`}
            className="mt-5 inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {isEn ? "Go to Launch" : "Launch sayfasına git"}
          </a>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={pageHeaderTitle}
        description={pageHeaderDescription}
      />

      <div className="space-y-4">
        {baselineJustSaved ? (
          <div className="rounded-[18px] border border-[#d7efdf] bg-[#f5fcf7] px-5 py-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#166534]">
              {isEn ? "Baseline saved" : "Baz çizgisi kaydedildi"}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#0d0d12]">
              {isEn
                ? "Growth is now reading real numbers instead of guesses. The next move is to turn that signal into a target and a concrete weekly action."
                : "Growth artık tahmin yerine gerçek sayıları okuyor. Sıradaki adım, bu sinyali hedefe ve somut bir haftalık aksiyona çevirmek."}
            </p>
          </div>
        ) : null}

        {/* PRIMARY: one card that changes by workspace mode */}
        <div id="coach" className="rounded-[18px] border border-[#e8e8e8] bg-white p-7">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
            {workspaceMode === "diagnosis_ready"
              ? isEn ? "Today's growth focus" : "Bugünün growth odağı"
              : isEn ? "Next growth step" : "Sıradaki growth adımı"}
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

        {workspaceMode === "intake_needed" ? (
          <>
            {onboardingKickoff && hasSetup ? (
              <div className="rounded-[18px] border border-[#d7efef] bg-[#f4fcfc] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1f6f6e]">
                      {isEn ? "Growth kickoff" : "Growth başlangıcı"}
                    </p>
                    <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                      {isEn
                        ? "Your growth workspace is almost ready"
                        : "Growth workspace'in neredeyse hazır"}
                    </h2>
                    <p className="mt-2 text-[14px] leading-6 text-[#35596a]">
                      {isEn
                        ? "You already chose the six AARRR signals Growth will read. Finish this short check-in so Tiramisup can interpret those metrics in the right product context, then move directly into your first baseline."
                        : "Growth'ün okuyacağı altı AARRR sinyalini zaten seçtin. Şimdi bu kısa değerlendirmeyi tamamla; Tiramisup metrikleri doğru ürün bağlamında yorumlasın ve seni doğrudan ilk baseline adımına taşısın."}
                    </p>
                  </div>
                  <div className="rounded-[16px] border border-[#d9efee] bg-white px-4 py-3 text-left lg:max-w-[260px]">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      {isEn ? "Already done" : "Tamamlananlar"}
                    </p>
                    <ul className="mt-2 space-y-1.5 text-[12px] leading-5 text-[#0d0d12]">
                      <li>{isEn ? "Product workspace created" : "Ürün workspace'i oluşturuldu"}</li>
                      <li>{isEn ? "Growth-stage path selected" : "Growth aşaması seçildi"}</li>
                      <li>{isEn ? "AARRR setup completed" : "AARRR kurulumu tamamlandı"}</li>
                      {sourceSetupJustFinished || integrations.length > 0 ? (
                        <li>{isEn ? "At least one source setup started" : "En az bir kaynak kurulumu başlatıldı"}</li>
                      ) : null}
                    </ul>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
                  <div className="rounded-[16px] border border-[#d9efee] bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      {isEn ? "Selected AARRR signals" : "Seçilen AARRR sinyalleri"}
                    </p>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                      {selectedMetricSummary.map((item) => (
                        <div key={item.stage} className="rounded-[14px] border border-[#edf2f7] bg-[#fafcfd] p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                            {item.stage}
                          </p>
                          <p className="mt-1 text-[13px] font-semibold text-[#0d0d12]">
                            {item.metricName}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[16px] border border-[#d9efee] bg-white p-5">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                      {isEn ? "What happens next?" : "Sıradaki net adım"}
                    </p>
                    <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                      {isEn ? "Finish the short check-in, then record your first baseline" : "Kısa check-in'i bitir, sonra ilk baseline'ı kaydet"}
                    </h3>
                    <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                      {isEn
                        ? "You will not have to choose metrics again. The next screen after this check-in is your first real Growth baseline."
                        : "Metrikleri yeniden seçmeyeceksin. Bu değerlendirmeden sonraki ekran doğrudan ilk gerçek Growth baseline adımın olacak."}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <a
                        href="#growth-intake"
                        className="inline-flex h-10 items-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#23252b]"
                      >
                        {isEn ? "Start the check-in" : "Check-in'i başlat"}
                      </a>
                      {(sourceSetupJustFinished || integrations.length > 0) ? (
                        <a
                          href={`/${locale}/integrations`}
                          className="inline-flex h-10 items-center rounded-full border border-[#e5e7eb] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-white"
                        >
                          {isEn ? "Review sources" : "Kaynakları gözden geçir"}
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div id="growth-intake">
              <GrowthTransitionCheckin
                productId={product.id}
                locale={locale}
                questions={growthCheckinQuestions}
                initialAnswers={storedAdditionalContext.growthCheckin?.answers ?? {}}
                nextHref={
                  hasSetup
                    ? onboardingKickoff
                      ? `/${locale}/growth?onboarding=1`
                      : `/${locale}/growth`
                    : `/${locale}/metrics`
                }
                setupAlreadyComplete={hasSetup}
              />
            </div>

            <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-6">
              <div className="flex items-start justify-between gap-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                    {isEn ? "Growth workflow" : "Growth akışı"}
                  </p>
                  <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                    {isEn ? "Start with context, then build the system" : "Önce bağlamı netleştir, sonra sistemi kur"}
                  </h2>
                  <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#5e6678]">
                    {isEn
                      ? "This step keeps Growth from forcing the same setup on every product. Once the short intake is complete, we move into Metrics to choose the right signals."
                      : "Bu adım, Growth'ün her ürüne aynı setup'ı zorlamasını engeller. Kısa değerlendirme tamamlandığında doğru sinyalleri seçmek için Metrics tarafına geçeriz."}
                  </p>
                </div>
                <div className="hidden shrink-0 rounded-[16px] border border-[#edf0f3] bg-[#fafbfc] px-4 py-3 text-right lg:block">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">
                    {isEn ? "Current mode" : "Geçerli mod"}
                  </p>
                  <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">
                    {isEn ? "Context first" : "Önce bağlam"}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 md:grid-cols-4">
                {workspaceStages.map((stage) => {
                  const isActiveStage = stage.state === "active";
                  const isDoneStage = stage.state === "done";
                  return (
                    <div
                      key={stage.key}
                      className={`rounded-[16px] border px-4 py-4 ${
                        isActiveStage
                          ? "border-[#0d0d12] bg-[#0d0d12] text-white"
                          : isDoneStage
                            ? "border-[#d9f1ee] bg-[#f4fffd]"
                            : "border-[#eceff2] bg-[#fafbfc]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className={`text-[13px] font-semibold ${isActiveStage ? "text-white" : "text-[#0d0d12]"}`}>
                          {stage.title}
                        </p>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                            isActiveStage
                              ? "bg-white/15 text-white"
                              : isDoneStage
                                ? "bg-[#dcfce7] text-[#166534]"
                                : "bg-[#f1f5f9] text-[#64748b]"
                          }`}
                        >
                          {isActiveStage
                            ? isEn ? "Now" : "Şimdi"
                            : isDoneStage
                              ? isEn ? "Done" : "Tamam"
                              : isEn ? "Next" : "Sırada"}
                        </span>
                      </div>
                      <p className={`mt-2 text-[12px] leading-5 ${isActiveStage ? "text-white/72" : "text-[#5e6678]"}`}>
                        {stage.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : workspaceMode !== "diagnosis_ready" ? (
          <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-6">
            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                  {isEn ? "Growth workflow" : "Growth akışı"}
                </p>
                <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                  {isEn ? "Keep setup and diagnosis separate" : "Kurulumu ve teşhisi ayır"}
                </h2>
                <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#5e6678]">
                  {workspaceMode === "metric_setup_needed"
                    ? isEn
                      ? "Right now the safest next move is deciding what to measure. The checklist and tactics surface unlock after the tracking system is real."
                      : "Şu anda en güvenli sonraki adım neyi ölçeceğine karar vermek. Checklist ve tactics yüzeyi, takip sistemi gerçek anlamda kurulduktan sonra açılmalı."
                    : isEn
                      ? "The setup exists now. Entering the first baseline is what turns Growth from a planning surface into a real diagnosis surface."
                      : "Setup artık var. İlk baz çizgisini girmek, Growth'ü planlama ekranından gerçek teşhis yüzeyine dönüştüren şey."}
                </p>
              </div>
              <div className="hidden shrink-0 rounded-[16px] border border-[#edf0f3] bg-[#fafbfc] px-4 py-3 text-right lg:block">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">
                  {isEn ? "Current mode" : "Geçerli mod"}
                </p>
                <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">
                  {workspaceMode === "metric_setup_needed"
                    ? isEn ? "Setup first" : "Önce setup"
                    : isEn ? "Baseline first" : "Önce baz çizgisi"}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-4">
              {workspaceStages.map((stage) => {
                const isActiveStage = stage.state === "active";
                const isDoneStage = stage.state === "done";
                return (
                  <div
                    key={stage.key}
                    className={`rounded-[16px] border px-4 py-4 ${
                      isActiveStage
                        ? "border-[#0d0d12] bg-[#0d0d12] text-white"
                        : isDoneStage
                          ? "border-[#d9f1ee] bg-[#f4fffd]"
                          : "border-[#eceff2] bg-[#fafbfc]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className={`text-[13px] font-semibold ${isActiveStage ? "text-white" : "text-[#0d0d12]"}`}>
                        {stage.title}
                      </p>
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                          isActiveStage
                            ? "bg-white/15 text-white"
                            : isDoneStage
                              ? "bg-[#dcfce7] text-[#166534]"
                              : "bg-[#f1f5f9] text-[#64748b]"
                        }`}
                      >
                        {isActiveStage
                          ? isEn ? "Now" : "Şimdi"
                          : isDoneStage
                            ? isEn ? "Done" : "Tamam"
                            : isEn ? "Next" : "Sırada"}
                      </span>
                    </div>
                    <p className={`mt-2 text-[12px] leading-5 ${isActiveStage ? "text-white/72" : "text-[#5e6678]"}`}>
                      {stage.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <div id="goals">
              <CollapsibleSection
                label={isEn ? "Goals" : "Hedefler"}
                defaultCollapsed={goals.length > 0}
              >
                <GoalsSection goals={goals} productId={product.id} metricSetup={savedMetricSetup} locale={locale} />
              </CollapsibleSection>
            </div>

            <div id="growth-checklist">
              <GrowthChecklistSection
                items={growthChecklists}
                locale={locale}
                productId={product.id}
                initialCategory={initialChecklistCategory}
                focusNote={checklistFocusNote}
              />
            </div>

            {tacticsPlan && tacticsPlan.tactics && tacticsPlan.tactics.length > 0 && (
              <CollapsibleSection label={isEn ? "Growth tactics" : "Growth taktikleri"} defaultCollapsed>
                <GrowthTacticsPanel plan={tacticsPlan} locale={locale} />
              </CollapsibleSection>
            )}

            {routines.length > 0 && (
              <CollapsibleSection label={isEn ? "Routines" : "Rutinler"} defaultCollapsed>
                <GrowthRoutines routines={routines} productId={product.id} locale={locale} />
              </CollapsibleSection>
            )}

            {timelineEvents.length > 0 && (
              <CollapsibleSection label={isEn ? "Timeline" : "Zaman tüneli"} defaultCollapsed>
                <TimelineFeed events={timelineEvents} productId={product.id} locale={locale} />
              </CollapsibleSection>
            )}
          </>
        )}
      </div>
    </div>
  );
  } finally {
    perf.end({
      userId: session.user.id,
      productId: perfProductId,
    });
  }
}
