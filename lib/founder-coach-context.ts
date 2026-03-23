import { prisma } from "@/lib/prisma";
import { getGrowthWorkspaceStep, type GrowthWorkspaceStepKey } from "@/lib/growth-workspace-step";
import { parseSavedMetricSetup } from "@/lib/metric-setup";

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
  launchGoals: string | null;
}) {
  const haystack = `${product.launchStatus ?? ""} ${product.category ?? ""} ${product.website ?? ""}`.toLowerCase();
  const savedSetup = parseSavedMetricSetup(product.launchGoals);
  const storedPlatforms = Array.from(new Set(savedSetup?.platforms ?? []));
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
  const product = await prisma.product.findUnique({
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
      launchGoals: true,
      status: true,
    },
  });

  if (!product) throw new Error("Product not found");
  const savedSetup = parseSavedMetricSetup(product.launchGoals);
  const ignoredLaunchChecklistIds = savedSetup?.ignoredLaunchChecklistIds ?? [];
  const selectedMetricCount = (savedSetup?.selections ?? []).reduce(
    (total, selection) => total + selection.selectedMetricKeys.length,
    0
  );
  const latestSavedEntry = savedSetup?.entries.at(-1) ?? null;

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
    hasMetricEntries: (savedSetup?.entries.length ?? 0) > 0,
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
      entryCount: savedSetup?.entries.length ?? 0,
      nextFocus: nextGrowthStep.key,
    },
    metrics: {
      hasActivationMetric:
        !!latestActivation ||
        !!latestMetric?.activationRate ||
        (savedSetup?.selections.some(
          (selection) =>
            selection.stage === "Activation" && selection.selectedMetricKeys.length > 0
        ) ??
          false),
      hasRevenueMetric:
        latestMetric?.mrr != null ||
        latestSavedEntry?.values?.Revenue != null ||
        (savedSetup?.selections.some(
          (selection) =>
            selection.stage === "Revenue" && selection.selectedMetricKeys.length > 0
        ) ??
          false),
      hasRetentionMetric:
        !!latestRetention ||
        latestSavedEntry?.values?.Retention != null ||
        (savedSetup?.selections.some(
          (selection) =>
            selection.stage === "Retention" && selection.selectedMetricKeys.length > 0
        ) ??
          false),
      latest: latestMetric
        ? {
            dau: latestMetric.dau,
            mrr: latestMetric.mrr,
            activationRate: latestMetric.activationRate,
          }
        : latestSavedEntry
          ? {
              dau: latestSavedEntry.values.Acquisition ?? null,
              mrr: latestSavedEntry.values.Revenue ?? null,
              activationRate: latestSavedEntry.values.Activation ?? null,
            }
        : null,
      lastUpdatedAt: latestMetric?.date?.toISOString() ?? latestSavedEntry?.date ?? null,
    },
    storeReadiness: {
      platforms: inferPlatforms(product),
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
