import { prisma } from "@/lib/prisma";
import { getGrowthWorkspaceStep, type GrowthWorkspaceStepKey } from "@/lib/growth-workspace-step";
import type { FunnelMetricSelection } from "@/lib/metric-setup";

export type FounderCoachContext = {
  product: {
    id: string;
    name: string;
    description: string | null;
    category: string | null;
    targetAudience: string | null;
    businessModel: string | null;
    website: string | null;
    launchStatus: string | null;
    status: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
  };
  execution: {
    launchChecklist: { total: number; completed: number; blockers: number };
    growthChecklist: { total: number; completed: number };
    tasks: { open: number; done: number };
    goals: number;
    routines: number;
    integrationsConnected: number;
  };
  growthWorkspace: {
    metricSetupComplete: boolean;
    selectedMetricCount: number;
    entryCount: number;
    nextFocus: GrowthWorkspaceStepKey;
  };
  metrics: {
    hasActivationMetric: boolean;
    hasRevenueMetric: boolean;
    hasRetentionMetric: boolean;
    latest: { dau?: number | null; mrr?: number | null; activationRate?: number | null } | null;
    lastUpdatedAt: string | null;
  };
  storeReadiness: {
    platforms: string[];
    loginRequired: boolean | null;
    socialLogin: boolean | null;
    hasSubscription: boolean | null;
    hasPrivacyPolicy: boolean | null;
    hasTerms: boolean | null;
    hasReviewAccount: boolean | null;
  };
  recentEvent?: { type: string; at?: string };
};

function inferPlatforms(product: {
  website: string | null;
  launchStatus: string | null;
  category: string | null;
}, storedPlatforms: string[]) {
  const haystack = `${product.launchStatus ?? ""} ${product.category ?? ""} ${product.website ?? ""}`.toLowerCase();
  if (storedPlatforms.length > 0) return storedPlatforms;
  const inferred: string[] = [];
  if (/ios|app store|apple/.test(haystack)) inferred.push("iOS");
  if (/android|play store|google play/.test(haystack)) inferred.push("Android");
  if (/mobil uygulama|mobile app/.test(haystack) && inferred.length === 0) {
    inferred.push("iOS", "Android");
  }
  if (!inferred.length) inferred.push("Web");
  return inferred;
}

function inferSubscription(product: { businessModel: string | null; description: string | null }) {
  const haystack = `${product.businessModel ?? ""} ${product.description ?? ""}`.toLowerCase();
  return /subscription|abonelik|monthly|yearly|saas|recurring/.test(haystack);
}

function inferLoginRequired(product: { targetAudience: string | null; description: string | null; businessModel: string | null }) {
  const haystack = `${product.targetAudience ?? ""} ${product.description ?? ""} ${product.businessModel ?? ""}`.toLowerCase();
  if (/dashboard|workspace|account|team|saas|kullanıcı|giriş/.test(haystack)) return true;
  return null;
}

export async function getFounderCoachContext(productId: string, recentEvent?: { type: string; at?: string }): Promise<FounderCoachContext> {
  const [product, metricSetup] = await Promise.all([
    prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        description: true,
        category: true,
        targetAudience: true,
        businessModel: true,
        website: true,
        launchStatus: true,
        status: true,
      },
    }),
    prisma.metricSetup.findUnique({
      where: { productId },
      include: {
        entries: { orderBy: { date: "desc" }, take: 1 },
      },
    }),
  ]);

  if (!product) throw new Error("Product not found");
  const selections = (metricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
  const ignoredLaunchChecklistIds = metricSetup?.ignoredChecklistIds ?? [];
  const selectedMetricCount = selections.reduce(
    (total, selection) => total + selection.selectedMetricKeys.length,
    0
  );
  const metricEntryCount = await prisma.metricEntry.count({ where: { productId } });
  const latestSavedEntry = metricSetup?.entries[0] ?? null;
  const latestSavedValues = latestSavedEntry
    ? (latestSavedEntry.values as Partial<Record<string, number>>)
    : null;

  const [
    launchTotal,
    launchCompleted,
    launchBlockers,
    growthTotal,
    growthCompleted,
    openTasks,
    doneTasks,
    goals,
    routines,
    integrationsConnected,
    latestMetric,
    latestRetention,
    latestActivation,
  ] = await Promise.all([
    prisma.launchChecklist.count({
      where: {
        productId,
        ...(ignoredLaunchChecklistIds.length > 0
          ? { id: { notIn: ignoredLaunchChecklistIds } }
          : {}),
      },
    }),
    prisma.launchChecklist.count({
      where: {
        productId,
        completed: true,
        ...(ignoredLaunchChecklistIds.length > 0
          ? { id: { notIn: ignoredLaunchChecklistIds } }
          : {}),
      },
    }),
    prisma.launchChecklist.count({
      where: {
        productId,
        completed: false,
        priority: "HIGH",
        ...(ignoredLaunchChecklistIds.length > 0
          ? { id: { notIn: ignoredLaunchChecklistIds } }
          : {}),
      },
    }),
    prisma.growthChecklist.count({ where: { productId } }),
    prisma.growthChecklist.count({ where: { productId, completed: true } }),
    prisma.task.count({ where: { productId, status: { not: "DONE" } } }),
    prisma.task.count({ where: { productId, status: "DONE" } }),
    prisma.goal.count({ where: { productId } }),
    prisma.growthRoutine.count({ where: { productId } }),
    prisma.integration.count({ where: { productId, status: "CONNECTED" } }),
    prisma.metric.findFirst({ where: { productId }, orderBy: { date: "desc" } }),
    prisma.retentionCohort.findFirst({ where: { productId }, orderBy: { cohortDate: "desc" } }),
    prisma.activationFunnel.findFirst({ where: { productId, step: "ACTIVATED" }, orderBy: { date: "desc" } }),
  ]);
  const nextGrowthStep = getGrowthWorkspaceStep({
    hasSetup: selectedMetricCount > 0,
    hasMetricEntries: metricEntryCount > 0,
    hasGoals: goals > 0,
    completedGrowthItems: growthCompleted,
    totalGrowthItems: growthTotal,
  });

  return {
    product,
    execution: {
      launchChecklist: { total: launchTotal, completed: launchCompleted, blockers: launchBlockers },
      growthChecklist: { total: growthTotal, completed: growthCompleted },
      tasks: { open: openTasks, done: doneTasks },
      goals,
      routines,
      integrationsConnected,
    },
    growthWorkspace: {
      metricSetupComplete: selectedMetricCount > 0,
      selectedMetricCount,
      entryCount: metricEntryCount,
      nextFocus: nextGrowthStep.key,
    },
    metrics: {
      hasActivationMetric:
        !!latestActivation ||
        !!latestMetric?.activationRate ||
        selections.some(
          (selection) =>
            selection.stage === "Activation" && selection.selectedMetricKeys.length > 0
        ),
      hasRevenueMetric:
        latestMetric?.mrr != null ||
        latestSavedValues?.Revenue != null ||
        selections.some(
          (selection) =>
            selection.stage === "Revenue" && selection.selectedMetricKeys.length > 0
        ),
      hasRetentionMetric:
        !!latestRetention ||
        latestSavedValues?.Retention != null ||
        selections.some(
          (selection) =>
            selection.stage === "Retention" && selection.selectedMetricKeys.length > 0
        ),
      latest: latestMetric
        ? {
            dau: latestMetric.dau,
            mrr: latestMetric.mrr,
            activationRate: latestMetric.activationRate,
          }
        : latestSavedValues
          ? {
              dau: latestSavedValues.Acquisition ?? null,
              mrr: latestSavedValues.Revenue ?? null,
              activationRate: latestSavedValues.Activation ?? null,
            }
        : null,
      lastUpdatedAt: latestMetric?.date?.toISOString() ?? latestSavedEntry?.date?.toISOString() ?? null,
    },
    storeReadiness: {
      platforms: inferPlatforms(product, metricSetup?.platforms ?? []),
      loginRequired: inferLoginRequired(product),
      socialLogin: null,
      hasSubscription: inferSubscription(product),
      hasPrivacyPolicy: null,
      hasTerms: null,
      hasReviewAccount: null,
    },
    recentEvent,
  };
}
