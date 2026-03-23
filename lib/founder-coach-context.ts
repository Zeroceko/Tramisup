import { prisma } from "@/lib/prisma";

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
}) {
  const haystack = `${product.launchStatus ?? ""} ${product.category ?? ""} ${product.website ?? ""}`.toLowerCase();
  const platforms: string[] = [];
  if (/ios|app store|apple/.test(haystack)) platforms.push("iOS");
  if (/android|play store|google play/.test(haystack)) platforms.push("Android");
  if (!platforms.length) platforms.push("Web");
  return platforms;
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
      status: true,
    },
  });

  if (!product) throw new Error("Product not found");

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
    prisma.launchChecklist.count({ where: { productId } }),
    prisma.launchChecklist.count({ where: { productId, completed: true } }),
    prisma.launchChecklist.count({ where: { productId, completed: false, priority: "HIGH" } }),
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
    metrics: {
      hasActivationMetric: !!latestActivation || !!latestMetric?.activationRate,
      hasRevenueMetric: latestMetric?.mrr != null,
      hasRetentionMetric: !!latestRetention,
      latest: latestMetric
        ? {
            dau: latestMetric.dau,
            mrr: latestMetric.mrr,
            activationRate: latestMetric.activationRate,
          }
        : null,
      lastUpdatedAt: latestMetric?.date?.toISOString() ?? null,
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
