import { getServerSession } from "next-auth";
import { ProductStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import { getMetricSetup } from "@/lib/metric-setup";
import type { FunnelMetricSelection } from "@/lib/metric-setup";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import TodayHero from "@/components/today/TodayHero";
import PrimaryAction from "@/components/today/PrimaryAction";
import DecisionStrip from "@/components/today/DecisionStrip";
import BlockerAlert from "@/components/today/BlockerAlert";
import TodayTasks from "@/components/today/TodayTasks";
import SourceHealth from "@/components/today/SourceHealth";
import CoachInsight from "@/components/today/CoachInsight";
import LaunchMomentBanner from "@/components/today/LaunchMomentBanner";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type PhaseKey = "pre-launch" | "launched";

function derivePhase(status: string): PhaseKey {
  if (status === ProductStatus.LAUNCHED || status === ProductStatus.GROWING) return "launched";
  return "pre-launch";
}

/** Build a human-readable status line based on product state. */
function buildStatusLine(
  phase: PhaseKey,
  launchStatus: string | null,
  opts: {
    readinessScore: number;
    blockerCount: number;
    daysUntilLaunch: number | null;
    selectedMetricCount: number;
    enteredToday: boolean;
    funnelOverall: string | null;
    locale: string;
  }
): string {
  const { readinessScore, blockerCount, daysUntilLaunch, selectedMetricCount, enteredToday, funnelOverall, locale } = opts;
  const isEn = locale === "en";

  if (phase === "pre-launch") {
    if (blockerCount > 0 && daysUntilLaunch != null && daysUntilLaunch > 0) {
      return isEn
        ? `${daysUntilLaunch} days to launch. ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} remaining.`
        : `Launch'a ${daysUntilLaunch} gün kaldı. ${blockerCount} kritik blokaj kaldı.`;
    }
    if (blockerCount > 0) {
      return isEn
        ? `${readinessScore}% ready. ${blockerCount} blocker${blockerCount > 1 ? "s" : ""} need attention.`
        : `%${readinessScore} hazır. ${blockerCount} kritik blokaj dikkatini bekliyor.`;
    }
    if (readinessScore >= 100) {
      return isEn ? "All checklist items complete. Ready to launch." : "Tüm hazırlık maddeleri tamam. Launch'a hazırsın.";
    }
    // Sub-phase nuance from launchStatus
    if (launchStatus === "Geliştirme aşamasında") {
      return isEn
        ? `Building phase — ${readinessScore}% of launch checklist done.`
        : `Geliştirme aşaması — launch checklist'in %${readinessScore}'i tamamlandı.`;
    }
    if (launchStatus === "Test kullanıcıları var") {
      return isEn
        ? `Testing phase — ${readinessScore}% of launch checklist done.`
        : `Test aşaması — launch checklist'in %${readinessScore}'i tamamlandı.`;
    }
    return isEn
      ? `${readinessScore}% of launch preparation complete.`
      : `Launch hazırlığının %${readinessScore}'i tamamlandı.`;
  }

  if (phase === "launched") {
    if (selectedMetricCount === 0) {
      return isEn
        ? "Launched! Set up your metrics to start tracking growth."
        : "Yayında! Büyüme takibini başlatmak için metrik setup'ını tamamla.";
    }
    if (!enteredToday) {
      return isEn
        ? "Metrics are set up. Enter today's values to build your baseline."
        : "Metrikler hazır. Bugünkü değerleri girerek baz çizgini oluştur.";
    }
    // Funnel health nuance (when enough data exists)
    if (funnelOverall === "STRONG") {
      return isEn
        ? "Growth is on track. Keep the daily rhythm."
        : "Büyüme sağlıklı ilerliyor. Günlük ritmi koru.";
    }
    if (funnelOverall === "MIXED") {
      return isEn
        ? "Some funnel stages need attention. Check the weak link."
        : "Bazı funnel halkaları dikkat istiyor. Zayıf halkayı kontrol et.";
    }
    return isEn
      ? "Tracking active. Review your funnel health and keep the rhythm."
      : "Takip aktif. Funnel sağlığını kontrol et ve ritmi koru.";
  }

  // Exhaustive fallback (unreachable with current PhaseKey)
  return "";
}

/** Build the primary action card content from product state. */
function buildPrimaryAction(
  phase: PhaseKey,
  locale: string,
  opts: {
    readinessScore: number;
    launchCompleted: number;
    launchTotal: number;
    blockerCount: number;
    selectedMetricCount: number;
    enteredToday: boolean;
    hasGoals: boolean;
    growthCompleted: number;
    growthTotal: number;
  }
) {
  const isEn = locale === "en";

  if (phase === "pre-launch") {
    if (opts.readinessScore >= 100) {
      return {
        title: isEn ? "Ready to launch" : "Launch'a hazırsın",
        description: isEn
          ? "All critical items are done. Review your final checklist and press launch."
          : "Tüm kritik maddeler tamamlandı. Son kontrolleri yap ve launch butonuna bas.",
        why: isEn ? "All blockers cleared" : "Tüm blokajlar kapandı",
        cta: isEn ? "Go to launch review" : "Launch kontrolüne git →",
        href: `/${locale}/pre-launch`,
        accent: "teal" as const,
        progress: 100,
      };
    }
    return {
      title: isEn ? "Complete your launch preparation" : "Launch hazırlığını tamamla",
      description: isEn
        ? `${opts.launchCompleted}/${opts.launchTotal} items done. ${opts.blockerCount > 0 ? `${opts.blockerCount} critical blocker${opts.blockerCount > 1 ? "s" : ""} need resolution.` : "Keep going."}`
        : `${opts.launchCompleted}/${opts.launchTotal} madde tamamlandı. ${opts.blockerCount > 0 ? `${opts.blockerCount} kritik blokaj çözülmeli.` : "Devam et."}`,
      why: isEn ? "Next step toward launch" : "Launch'a giden bir sonraki adım",
      cta: isEn ? "Go to launch checklist" : "Launch checklist'e git →",
      href: `/${locale}/pre-launch`,
      accent: "amber" as const,
      progress: opts.readinessScore,
    };
  }

  if (opts.selectedMetricCount === 0) {
    return {
      title: isEn ? "Set up growth tracking" : "Büyüme takibini kur",
      description: isEn
        ? "Select one key metric per AARRR category. This becomes your daily pulse."
        : "Her AARRR kategorisi için 1 ana metrik seç. Bu senin günlük nabzın olacak.",
      why: isEn ? "First step after launch" : "Launch sonrası ilk adım",
      cta: isEn ? "Go to growth setup" : "Growth setup'a git →",
      href: `/${locale}/growth`,
      accent: "teal" as const,
    };
  }

  if (!opts.enteredToday) {
    return {
      title: isEn ? "Enter today's metrics" : "Bugünkü metrikleri gir",
      description: isEn
        ? "Your metrics are configured. Enter today's values to keep your growth rhythm."
        : "Metriklerin hazır. Bugünkü değerleri girerek büyüme ritmini koru.",
      why: isEn ? "Daily operating rhythm" : "Günlük çalışma ritmi",
      cta: isEn ? "Enter metrics" : "Metrikleri gir →",
      href: `/${locale}/metrics`,
      accent: "pink" as const,
    };
  }

  if (!opts.hasGoals) {
    return {
      title: isEn ? "Set your first goal" : "İlk hedefini belirle",
      description: isEn
        ? "Data is flowing. Now define a numeric target to work toward."
        : "Veri akıyor. Şimdi çalışacağın sayısal bir hedef tanımla.",
      why: isEn ? "Turn data into direction" : "Veriyi yöne çevir",
      cta: isEn ? "Set a goal" : "Hedef koy →",
      href: `/${locale}/growth#goals`,
      accent: "teal" as const,
    };
  }

  if (opts.growthTotal > 0 && opts.growthCompleted < opts.growthTotal) {
    return {
      title: isEn ? "Advance your growth checklist" : "Growth checklist'ini ilerlet",
      description: isEn
        ? `${opts.growthCompleted}/${opts.growthTotal} growth items done. Keep pushing the metrics.`
        : `${opts.growthCompleted}/${opts.growthTotal} growth maddesi tamamlandı. Metrikleri hareket ettirecek işlere devam et.`,
      why: isEn ? "Structured growth execution" : "Yapılandırılmış büyüme uygulaması",
      cta: isEn ? "Go to growth checklist" : "Growth checklist'e git →",
      href: `/${locale}/growth#growth-checklist`,
      accent: "teal" as const,
      progress: opts.growthTotal > 0 ? Math.round((opts.growthCompleted / opts.growthTotal) * 100) : undefined,
    };
  }

  // Default: daily review
  return {
    title: isEn ? "Review today's performance" : "Bugünkü performansı kontrol et",
    description: isEn
      ? "Metrics entered. Check your funnel health and goal progress."
      : "Metrikler girildi. Funnel sağlığını ve hedef ilerlemeni kontrol et.",
    why: isEn ? "Daily operating rhythm" : "Günlük çalışma ritmi",
    cta: isEn ? "View metrics" : "Metrikleri gör →",
    href: `/${locale}/metrics`,
    accent: "pink" as const,
  };
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function DashboardPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ justLaunched?: string }>;
}) {
  const { locale } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const justLaunched = resolvedSearch.justLaunched === "1";
  const session = await getServerSession(authOptions);
  const isEn = locale === "en";

  // ---- Product resolution ----
  const activeId = await getActiveProductId();
  const productInclude = {
    _count: {
      select: {
        launchChecklists: true,
        growthChecklists: true,
        tasks: true,
        goals: true,
        integrations: { where: { status: "CONNECTED" } },
      },
    },
  } as const;

  let product = await prisma.product.findFirst({
    where: { userId: session?.user?.id, ...(activeId ? { id: activeId } : {}) },
    include: productInclude,
  });

  if (!product && activeId) {
    product = await prisma.product.findFirst({
      where: { userId: session?.user?.id },
      include: productInclude,
    });
  }

  // ---- Empty state: no product ----
  if (!product) {
    return (
      <div>
        <TodayHero
          userName={session?.user?.name}
          productName={isEn ? "Welcome" : "Hoş geldin"}
          phase="pre-launch"
          statusLine={isEn ? "Create your first product to get started." : "Başlamak için ilk ürününü oluştur."}
          locale={locale}
        />
        <FirstRunOnboarding locale={locale} userName={session?.user?.name} userEmail={session?.user?.email} />
      </div>
    );
  }

  // ---- Data fetching (parallel) ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    completedLaunchChecklists,
    completedGrowthChecklists,
    highPriorityBlockers,
    priorityTasks,
    taskCountsRaw,
    errorIntegrations,
    todayMetricEntry,
    goalCount,
    savedMetricSetup,
  ] = await Promise.all([
    prisma.launchChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.growthChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.launchChecklist.findMany({
      where: { productId: product.id, completed: false, priority: "HIGH" },
      select: { id: true, title: true, category: true },
      orderBy: { order: "asc" },
      take: 5,
    }),
    prisma.task.findMany({
      where: { productId: product.id, status: { not: "DONE" } },
      orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "asc" }],
      select: { id: true, title: true, priority: true, status: true, dueDate: true },
      take: 3,
    }),
    prisma.task.groupBy({
      by: ["status"],
      where: { productId: product.id },
      _count: { status: true },
    }),
    prisma.integration.findMany({
      where: { productId: product.id, status: "ERROR" },
      select: { id: true, provider: true },
    }),
    prisma.metricEntry.findFirst({
      where: { productId: product.id, date: today },
    }),
    prisma.goal.count({ where: { productId: product.id, completed: false } }),
    getMetricSetup(product.id),
  ]);

  // ---- Derived values ----
  const phase = derivePhase(product.status);
  const isLaunched = phase === "launched";

  const launchTotal = product._count.launchChecklists || 0;
  const growthTotal = product._count.growthChecklists || 0;
  const readinessScore = launchTotal > 0 ? Math.round((completedLaunchChecklists / launchTotal) * 100) : 0;
  const growthScore = growthTotal > 0 ? Math.round((completedGrowthChecklists / growthTotal) * 100) : 0;

  const pendingTasks = taskCountsRaw.find((t) => t.status === "TODO")?._count?.status ?? 0;
  const inProgressTasks = taskCountsRaw.find((t) => t.status === "IN_PROGRESS")?._count?.status ?? 0;
  const totalPending = pendingTasks + inProgressTasks;

  const selections = (savedMetricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
  const selectedMetricCount = selections.reduce((sum, s) => sum + s.selectedMetricKeys.length, 0);
  const enteredToday = !!todayMetricEntry;

  const connectedCount = product._count.integrations ?? 0;
  const errorCount = errorIntegrations.length;

  const founderSummary = savedMetricSetup?.founderSummary as { headline?: string; summary?: string; nextStep?: string } | null;

  // Days until launch (if launchDate is set and in future)
  let daysUntilLaunch: number | null = null;
  if (product.launchDate) {
    const diff = new Date(product.launchDate).getTime() - Date.now();
    if (diff > 0) daysUntilLaunch = Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  // Blockers: high-priority incomplete checklist items + error integrations
  const blockers = [
    ...highPriorityBlockers.map((b) => ({
      id: b.id,
      title: b.title,
      href: `/${locale}/pre-launch`,
      source: isEn ? `Launch · ${b.category}` : `Launch · ${b.category}`,
    })),
    ...errorIntegrations.map((e) => ({
      id: e.id,
      title: isEn ? `${e.provider} connection error` : `${e.provider} bağlantı hatası`,
      href: `/${locale}/integrations`,
      source: isEn ? "Integration" : "Entegrasyon",
    })),
  ];

  // ---- Status line ----
  const statusLine = founderSummary?.summary
    ? founderSummary.summary
    : buildStatusLine(phase, product.launchStatus, {
        readinessScore,
        blockerCount: highPriorityBlockers.length,
        daysUntilLaunch,
        selectedMetricCount,
        enteredToday,
        funnelOverall: null, // TODO: wire buildFunnelHealthSummary when entries exist
        locale,
      });

  // ---- Primary action ----
  const primaryAction = buildPrimaryAction(phase, locale, {
    readinessScore,
    launchCompleted: completedLaunchChecklists,
    launchTotal,
    blockerCount: highPriorityBlockers.length,
    selectedMetricCount,
    enteredToday,
    hasGoals: goalCount > 0,
    growthCompleted: completedGrowthChecklists,
    growthTotal,
  });

  // ---- Decision strip indicators ----
  const indicators = buildIndicators(phase, locale, {
    readinessScore,
    growthScore,
    totalPending,
    selectedMetricCount,
    enteredToday,
    connectedCount,
    errorCount,
    goalCount,
  });

  // ---- Tasks for component ----
  const taskItems = priorityTasks.map((t) => ({
    id: t.id,
    title: t.title,
    priority: t.priority as "HIGH" | "MEDIUM" | "LOW",
    status: t.status as "TODO" | "IN_PROGRESS",
    dueDate: t.dueDate?.toISOString() ?? null,
  }));

  // ---- Render ----
  return (
    <div className="space-y-5">
      {/* 1. Hero */}
      <TodayHero
        userName={session?.user?.name}
        productName={product.name}
        phase={product.status === ProductStatus.GROWING ? "growing" : phase}
        statusLine={statusLine}
        locale={locale}
      />

      {/* 2. Launch moment banner — shown once after launch */}
      {justLaunched && (
        <LaunchMomentBanner locale={locale} productName={product.name} />
      )}

      {/* 3. Primary Action — the dominant card */}
      <PrimaryAction
        title={primaryAction.title}
        description={primaryAction.description}
        why={primaryAction.why}
        cta={primaryAction.cta}
        href={primaryAction.href}
        accent={primaryAction.accent}
        progress={primaryAction.progress}
      />

      {/* 3. Decision Strip — compact health indicators */}
      <DecisionStrip indicators={indicators} />

      {/* 4. Blockers — only if they exist */}
      <BlockerAlert blockers={blockers} locale={locale} />

      {/* 5. Today's Focus — split layout */}
      <section className="grid gap-4 lg:grid-cols-[1fr_340px]">
        {/* Left: priority tasks */}
        <TodayTasks tasks={taskItems} totalPending={totalPending} locale={locale} />

        {/* Right: source health (only post-launch with metrics) */}
        {isLaunched && selectedMetricCount > 0 && (
          <SourceHealth
            connectedCount={connectedCount}
            errorCount={errorCount}
            totalMetrics={selectedMetricCount}
            automatedMetrics={0}
            enteredToday={enteredToday}
            locale={locale}
          />
        )}
      </section>

      {/* 6. Coach — collapsed by default, user triggers it */}
      <CoachInsight
        productId={product.id}
        stage={product.launchStatus || product.status?.replace("_", " ") || "PRE_LAUNCH"}
        locale={locale}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decision Strip Builder
// ---------------------------------------------------------------------------

function buildIndicators(
  phase: PhaseKey,
  locale: string,
  opts: {
    readinessScore: number;
    growthScore: number;
    totalPending: number;
    selectedMetricCount: number;
    enteredToday: boolean;
    connectedCount: number;
    errorCount: number;
    goalCount: number;
  }
) {
  const isEn = locale === "en";
  type Indicator = {
    label: string;
    value: string;
    status: "healthy" | "warning" | "neutral" | "empty";
    hint?: string;
    href?: string;
  };

  const indicators: Indicator[] = [];

  if (phase === "pre-launch") {
    indicators.push({
      label: isEn ? "Readiness" : "Hazırlık",
      value: `%${opts.readinessScore}`,
      status: opts.readinessScore >= 100 ? "healthy" : opts.readinessScore >= 60 ? "neutral" : "warning",
      hint: isEn ? "Launch checklist" : "Launch checklist",
      href: `/${locale}/pre-launch`,
    });

    indicators.push({
      label: isEn ? "Tasks" : "Görevler",
      value: String(opts.totalPending),
      status: opts.totalPending === 0 ? "healthy" : "neutral",
      hint: isEn ? "pending" : "bekliyor",
      href: `/${locale}/tasks`,
    });

    indicators.push({
      label: isEn ? "Metrics" : "Metrikler",
      value: "—",
      status: "empty",
      hint: isEn ? "After launch" : "Launch sonrası",
    });

    indicators.push({
      label: isEn ? "Sources" : "Kaynaklar",
      value: "—",
      status: "empty",
      hint: isEn ? "After launch" : "Launch sonrası",
    });
  } else {
    indicators.push({
      label: isEn ? "Growth" : "Büyüme",
      value: `%${opts.growthScore}`,
      status: opts.growthScore >= 80 ? "healthy" : opts.growthScore >= 40 ? "neutral" : "warning",
      hint: isEn ? "Growth checklist" : "Growth checklist",
      href: `/${locale}/growth`,
    });

    indicators.push({
      label: isEn ? "Tasks" : "Görevler",
      value: String(opts.totalPending),
      status: opts.totalPending === 0 ? "healthy" : "neutral",
      hint: isEn ? "pending" : "bekliyor",
      href: `/${locale}/tasks`,
    });

    indicators.push({
      label: isEn ? "Metrics" : "Metrikler",
      value: opts.selectedMetricCount > 0
        ? opts.enteredToday
          ? (isEn ? "Current" : "Güncel")
          : (isEn ? "Waiting" : "Bekliyor")
        : "—",
      status: opts.selectedMetricCount === 0
        ? "empty"
        : opts.enteredToday
          ? "healthy"
          : "warning",
      hint: opts.selectedMetricCount > 0
        ? `${opts.selectedMetricCount} ${isEn ? "tracked" : "takipte"}`
        : (isEn ? "Not set up" : "Kurulmadı"),
      href: `/${locale}/metrics`,
    });

    indicators.push({
      label: isEn ? "Sources" : "Kaynaklar",
      value: opts.connectedCount > 0 ? String(opts.connectedCount) : "—",
      status: opts.errorCount > 0 ? "warning" : opts.connectedCount > 0 ? "healthy" : "empty",
      hint: opts.errorCount > 0
        ? `${opts.errorCount} ${isEn ? "error" : "hata"}`
        : opts.connectedCount > 0
          ? (isEn ? "connected" : "bağlı")
          : (isEn ? "None connected" : "Bağlı değil"),
      href: `/${locale}/integrations`,
    });
  }

  return indicators;
}
