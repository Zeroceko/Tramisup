import { getServerSession } from "next-auth";
import { ProductStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import { getMetricSetup } from "@/lib/metric-setup";
import type { FunnelMetricSelection } from "@/lib/metric-setup";
import { normalizeStoredLaunchChecklistPriorities } from "@/lib/launch-checklist-priority";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import PendingOnboardingRetryCard from "@/components/PendingOnboardingRetryCard";
import PrimaryAction from "@/components/today/PrimaryAction";
import BlockerAlert from "@/components/today/BlockerAlert";
import TodayTasks from "@/components/today/TodayTasks";
import SourceHealth from "@/components/today/SourceHealth";
import LaunchMomentBanner from "@/components/today/LaunchMomentBanner";
import TaskProgressChart, { type TaskChartDay } from "@/components/today/TaskProgressChart";
import MetricSparklinePanel from "@/components/today/MetricSparklinePanel";
import ReadinessPanel from "@/components/today/ReadinessPanel";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type PhaseKey = "pre-launch" | "launched";

function derivePhase(status: string): PhaseKey {
  if (status === ProductStatus.LAUNCHED || status === ProductStatus.GROWING) return "launched";
  return "pre-launch";
}

async function ensureHighPriorityBlockersAreTasks(productId: string) {
  const unlinked = await prisma.launchChecklist.findMany({
    where: {
      productId,
      completed: false,
      priority: "HIGH",
      linkedTaskId: null,
    },
    select: {
      id: true,
      title: true,
      description: true,
      priority: true,
    },
  });

  for (const item of unlinked) {
    await prisma.$transaction(async (tx) => {
      const fresh = await tx.launchChecklist.findUnique({
        where: { id: item.id },
        select: { id: true, linkedTaskId: true },
      });
      if (!fresh || fresh.linkedTaskId) return;

      const task = await tx.task.create({
        data: {
          productId,
          title: item.title,
          description: item.description
            ? `From launch blocker: ${item.description}`
            : `From launch blocker: ${item.title}`,
          priority: "HIGH",
          status: "TODO",
        },
      });

      await tx.launchChecklist.update({
        where: { id: item.id },
        data: { linkedTaskId: task.id },
      });
    });
  }
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
    if (launchStatus === "Fikir aşamasında") {
      return isEn
        ? "Idea phase — validate the problem before you scale preparation."
        : "Fikir aşaması — hazırlığı büyütmeden önce problemi doğrula.";
    }
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
      title: isEn ? "Open Growth and choose your metrics" : "Growth'a geç ve metriklerini seç",
      description: isEn
        ? "Growth should point you to Metrics first. Select one key metric per AARRR stage so the system knows what to read."
        : "Önce Growth tarafına geç, sonra Metrics ekranında her AARRR aşaması için 1 ana metrik seç. Sistem neyi okuyacağını böyle anlar.",
      why: isEn ? "First step after launch" : "Launch sonrası ilk adım",
      cta: isEn ? "Open Growth" : "Growth'a git →",
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
  const uiLocale = locale;
  const isEn = uiLocale === "en";

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
        <div className="mb-6">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
            {isEn ? "Welcome" : "Hoş geldin"}{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="mt-1.5 text-[13px] text-[#6f7482]">
            {isEn ? "Create your first product to get started." : "Başlamak için ilk ürününü oluştur."}
          </p>
        </div>
        <FirstRunOnboarding locale={uiLocale} />
        <PendingOnboardingRetryCard locale={uiLocale} />
      </div>
    );
  }

  await normalizeStoredLaunchChecklistPriorities(product.id);
  await ensureHighPriorityBlockersAreTasks(product.id);

  // ---- Data fetching (parallel) ----
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 6);
  const fourteenDaysAgo = new Date(today);
  fourteenDaysAgo.setDate(today.getDate() - 13);

  const isLaunchedProduct = product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;

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
    recentTasksRaw,
    recentMetricEntriesRaw,
  ] = await Promise.all([
    prisma.launchChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.growthChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.launchChecklist.findMany({
      where: { productId: product.id, completed: false, priority: "HIGH" },
      select: { id: true, title: true, category: true, linkedTaskId: true },
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
    prisma.task.findMany({
      where: {
        productId: product.id,
        OR: [
          { createdAt: { gte: sevenDaysAgo } },
          { status: "DONE", updatedAt: { gte: sevenDaysAgo } },
        ],
      },
      select: { createdAt: true, updatedAt: true, status: true },
    }),
    isLaunchedProduct
      ? prisma.metricEntry.findMany({
          where: { productId: product.id, date: { gte: fourteenDaysAgo } },
          orderBy: { date: "asc" },
          select: { date: true, values: true },
        })
      : Promise.resolve([]),
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
  const doneTasks = taskCountsRaw.find((t) => t.status === "DONE")?._count?.status ?? 0;
  const totalTasks = taskCountsRaw.reduce((sum, t) => sum + (t._count?.status ?? 0), 0);
  const totalPending = pendingTasks + inProgressTasks;

  const selections = (savedMetricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
  const selectedMetricCount = selections.reduce((sum, s) => sum + s.selectedMetricKeys.length, 0);
  const enteredToday = !!todayMetricEntry;

  const connectedCount = product._count.integrations ?? 0;
  const errorCount = errorIntegrations.length;

  const founderSummary = savedMetricSetup?.founderSummary as { headline?: string; summary?: string; nextStep?: string } | null;

  // ---- Chart data ----
  const taskChartData: TaskChartDay[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dayStart = new Date(d);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(d);
    dayEnd.setHours(23, 59, 59, 999);
    taskChartData.push({
      date: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString(isEn ? "en-US" : "tr-TR", { weekday: "short" }),
      created: recentTasksRaw.filter((t) => t.createdAt >= dayStart && t.createdAt <= dayEnd).length,
      completed: recentTasksRaw.filter((t) => t.status === "DONE" && t.updatedAt >= dayStart && t.updatedAt <= dayEnd).length,
    });
  }
  const chartTotalCreated = taskChartData.reduce((s, d) => s + d.created, 0);
  const chartTotalCompleted = taskChartData.reduce((s, d) => s + d.completed, 0);

  type SparkEntry = { date: string; value: number };
  let metricSparkData: SparkEntry[] = [];
  let metricSparkLabel = "";
  if (isLaunched && recentMetricEntriesRaw.length >= 2 && selections.length > 0) {
    const primaryKey = selections[0]?.selectedMetricKeys?.[0] ?? null;
    if (primaryKey) {
      metricSparkData = (recentMetricEntriesRaw as Array<{ date: Date; values: unknown }>)
        .map((e) => ({
          date: e.date.toISOString().slice(0, 10),
          value: ((e.values as Record<string, number>)[primaryKey]) ?? 0,
        }))
        .filter((e) => e.value > 0);
      metricSparkLabel = primaryKey;
    }
  }

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
      href: b.linkedTaskId ? `/${locale}/tasks` : `/${locale}/pre-launch`,
      taskId: b.linkedTaskId ?? undefined,
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
        locale: uiLocale,
      });

  // ---- Primary action ----
  const primaryAction = buildPrimaryAction(phase, uiLocale, {
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
  const indicators = buildIndicators(phase, uiLocale, {
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

  // ---- Render helpers ----
  const greeting = (() => {
    const hour = new Date().getHours();
    if (isEn) return hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
    return hour < 12 ? "Günaydın" : hour < 18 ? "İyi günler" : "İyi akşamlar";
  })();

  const phaseLabel = isEn
    ? (phase === "launched" ? "Launched" : "Pre-launch")
    : (phase === "launched" ? "Yayında" : "Launch hazırlığı");
  const phaseDot = phase === "launched" ? "bg-[#34d399]" : "bg-[#f6c342]";
  const phaseBg = phase === "launched" ? "bg-[#e8faf4]" : "bg-[#fff8e1]";

  // ---- Render ----
  return (
    <div className="space-y-5">
      {/* 1. Compact hero — inline greeting + product name + badge */}
      <div>
        <p className="text-[13px] font-medium text-[#6f7482]">
          {greeting}{session?.user?.name ? `, ${session.user.name}` : ""}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-3">
          <h1 className="text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
            {product.name}
          </h1>
          <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold ${phaseBg}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${phaseDot}`} />
            {phaseLabel}
          </span>
        </div>
        <p className="mt-1.5 text-[13px] text-[#6f7482] max-w-xl">{statusLine}</p>
      </div>

      {/* 2. Launch moment banner */}
      {justLaunched && (
        <LaunchMomentBanner locale={uiLocale} productName={product.name} />
      )}

      {/* 3. Stat cards — prominent numbers first */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label={isEn ? "Total Tasks" : "Toplam Görev"}
          value={String(totalTasks)}
          hint={`${doneTasks} ${isEn ? "completed" : "tamamlandı"}`}
          color="blue"
        />
        <StatCard
          label={isEn ? "Pending" : "Bekleyen"}
          value={String(totalPending)}
          hint={`${inProgressTasks} ${isEn ? "in progress" : "devam ediyor"}`}
          color={totalPending > 0 ? "amber" : "green"}
        />
        <StatCard
          label={isEn ? "Completed" : "Tamamlanan"}
          value={String(doneTasks)}
          hint={totalTasks > 0 ? `%${Math.round((doneTasks / totalTasks) * 100)}` : "—"}
          color="green"
        />
        <StatCard
          label={isEn ? "Blockers" : "Blokajlar"}
          value={String(blockers.length)}
          hint={blockers.length > 0 ? (isEn ? "need attention" : "dikkat bekliyor") : (isEn ? "all clear" : "sorun yok")}
          color={blockers.length > 0 ? "red" : "green"}
        />
      </div>

      {/* 4. Chart row — task progress + metric/readiness panel */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <TaskProgressChart
          data={taskChartData}
          locale={uiLocale}
          totalCreated={chartTotalCreated}
          totalCompleted={chartTotalCompleted}
        />
        {metricSparkData.length >= 2 ? (
          <MetricSparklinePanel
            data={metricSparkData}
            label={metricSparkLabel}
            locale={uiLocale}
            href={`/${uiLocale}/metrics`}
          />
        ) : (
          <ReadinessPanel
            phase={phase}
            readinessScore={readinessScore}
            daysUntilLaunch={daysUntilLaunch}
            locale={uiLocale}
          />
        )}
      </div>

      {/* 5. Two-column: Primary Action + Decision Strip */}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_1fr]">
        {/* Primary action — compact */}
        <PrimaryAction
          title={primaryAction.title}
          description={primaryAction.description}
          why={primaryAction.why}
          cta={primaryAction.cta}
          href={primaryAction.href}
          accent={primaryAction.accent}
          progress={primaryAction.progress}
        />

        {/* Quick indicators */}
        <div className="grid grid-cols-2 gap-3">
          {indicators.map((ind) => (
            <DecisionCard key={ind.label} indicator={ind} />
          ))}
        </div>
      </div>

      {/* 6. Blockers — only if they exist */}
      <BlockerAlert blockers={blockers} locale={uiLocale} productId={product.id} />

      {/* 7. Board layout — tasks + workspace pulse */}
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <TodayTasks tasks={taskItems} totalPending={totalPending} locale={locale} />

        <div className="space-y-4">
          {isLaunched && selectedMetricCount > 0 ? (
            <SourceHealth
              connectedCount={connectedCount}
              errorCount={errorCount}
              totalMetrics={selectedMetricCount}
              automatedMetrics={0}
              enteredToday={enteredToday}
              locale={uiLocale}
            />
          ) : (
            <div className="rounded-[20px] border border-[#e8e4de] bg-white p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                {uiLocale === "en" ? "Workspace pulse" : "Çalışma alanı özeti"}
              </p>
              <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                {uiLocale === "en" ? "Your board is taking shape" : "Çalışma alanın şekilleniyor"}
              </h3>
              <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
                {uiLocale === "en"
                  ? "Launch, tasks, and growth surfaces stay lightweight until the product context fills in."
                  : "Ürün bağlamın doldukça launch, görev ve büyüme yüzeyleri daha zengin hale gelecek."}
              </p>
            </div>
          )}
        </div>
      </div>
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

// ---------------------------------------------------------------------------
// Stat Card — big number with label
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  hint,
  color,
}: {
  label: string;
  value: string;
  hint: string;
  color: "blue" | "amber" | "green" | "red";
}) {
  const colorMap = {
    blue: { value: "text-[#0d0d12]", bar: "bg-[#95dbda]" },
    amber: { value: "text-[#92400e]", bar: "bg-[#fbbf24]" },
    green: { value: "text-[#065f46]", bar: "bg-[#34d399]" },
    red: { value: "text-[#991b1b]", bar: "bg-[#f87171]" },
  };
  const c = colorMap[color];

  return (
    <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
      <p className="text-[11px] font-medium text-[#737988] uppercase tracking-[0.08em]">{label}</p>
      <p className={`mt-2 text-[32px] font-bold tracking-[-0.03em] leading-none ${c.value}`}>
        {value}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className={`h-1 w-6 rounded-full ${c.bar}`} />
        <p className="text-[11px] text-[#98a0ae]">{hint}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Decision Card — small indicator card for the grid
// ---------------------------------------------------------------------------

function DecisionCard({
  indicator,
}: {
  indicator: {
    label: string;
    value: string;
    status: "healthy" | "warning" | "neutral" | "empty";
    hint?: string;
    href?: string;
  };
}) {
  const statusDot: Record<string, string> = {
    healthy: "bg-[#34d399]",
    warning: "bg-[#f59e0b]",
    neutral: "bg-[#94a3b8]",
    empty: "bg-[#d1d5db]",
  };
  const statusColor: Record<string, string> = {
    healthy: "text-[#0d0d12]",
    warning: "text-[#92400e]",
    neutral: "text-[#0d0d12]",
    empty: "text-[#94a3b8]",
  };

  const content = (
    <>
      <div className="flex items-center gap-1.5">
        <span className={`h-1.5 w-1.5 rounded-full ${statusDot[indicator.status]}`} />
        <span className="text-[11px] font-medium text-[#737988]">{indicator.label}</span>
        {indicator.href && <span className="ml-auto text-[10px] text-[#c8ccd6]">&#8599;</span>}
      </div>
      <p className={`mt-1.5 text-[22px] font-bold tracking-[-0.02em] leading-tight ${statusColor[indicator.status]}`}>
        {indicator.value}
      </p>
      {indicator.hint && <p className="mt-1 text-[10px] text-[#98a0ae]">{indicator.hint}</p>}
    </>
  );

  const cls = "rounded-[16px] border border-[#e8e4de] bg-white px-3.5 py-3 transition hover:-translate-y-0.5 hover:shadow-md";

  if (indicator.href) {
    return (
      <a href={indicator.href} className={`${cls} block`}>
        {content}
      </a>
    );
  }
  return <div className={cls}>{content}</div>;
}
