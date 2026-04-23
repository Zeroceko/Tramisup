import {
  PlanTier,
  Prisma,
  ProductStatus,
  SubStatus,
  UsageResource,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  formatStageSummary,
  getCurrentMonthStart,
  getGrowthReadinessState,
  maxDate,
  resolveCurrentPlan,
} from "@/lib/admin/insights";

type UserFilters = {
  q?: string;
  plan?: string;
  subscriptionStatus?: string;
  emailVerified?: string;
  stage?: string;
};

type ProductFilters = {
  q?: string;
  status?: string;
  growthState?: string;
};

function normalizeValue(value?: string | null) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : "";
}

function toOptionalPlan(value?: string | null) {
  const normalized = normalizeValue(value).toUpperCase();
  return normalized === "FREE" || normalized === "STARTER" || normalized === "PRO"
    ? normalized
    : "";
}

function toOptionalSubStatus(value?: string | null) {
  const normalized = normalizeValue(value).toUpperCase();
  return normalized === "ACTIVE" || normalized === "CANCELED" || normalized === "PAST_DUE"
    ? normalized
    : "";
}

function toOptionalProductStatus(value?: string | null) {
  const normalized = normalizeValue(value).toUpperCase();
  return normalized === "PRE_LAUNCH" || normalized === "LAUNCHED" || normalized === "GROWING"
    ? normalized
    : "";
}

function toOptionalGrowthState(value?: string | null) {
  const normalized = normalizeValue(value).toLowerCase();
  return normalized === "missing_checkin" ||
    normalized === "missing_setup" ||
    normalized === "missing_baseline" ||
    normalized === "diagnosis_ready"
    ? normalized
    : "";
}

function getRollingWindowStart(days: number, now = new Date()) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function minDate(values: Array<Date | null | undefined>) {
  return values.reduce<Date | null>((earliest, value) => {
    if (!value) return earliest;
    if (!earliest || value.getTime() < earliest.getTime()) return value;
    return earliest;
  }, null);
}

const PRODUCT_FUNNEL_EVENT_TYPES = [
  "PRODUCT_CREATED",
  "ONBOARDING_COMPLETED",
  "APP_SESSION",
  "GROWTH_CHECKIN_COMPLETED",
  "METRIC_SETUP_COMPLETED",
  "FIRST_METRIC_ENTRY_CREATED",
  "GROWTH_DIAGNOSIS_READY",
] as const;

const AI_BRIDGE_EVENT_TYPES = [
  "AI_SUGGESTIONS_SHOWN",
  "AI_SUGGESTION_TASK_ACTIVATED",
] as const;

type ProductFunnelEventType = (typeof PRODUCT_FUNNEL_EVENT_TYPES)[number];
type AiSurfaceKey = "overview" | "launch" | "growth";

function createAiSurfaceBreakdown() {
  return {
    overview: { loads: 0, activations: 0 },
    launch: { loads: 0, activations: 0 },
    growth: { loads: 0, activations: 0 },
  } as Record<AiSurfaceKey, { loads: number; activations: number }>;
}

export async function getAdminOverviewData() {
  const monthStart = getCurrentMonthStart();
  const cohortStart = getRollingWindowStart(30);

  const [users, products, subscriptionCounts, usageCounts, waitlistCounts, aiTasks, productEvents, aiBridgeEvents] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        createdAt: true,
        emailVerified: true,
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
    }),
    prisma.product.findMany({
      select: {
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        status: true,
        additionalContext: true,
        metricSetup: {
          select: {
            selections: true,
          },
        },
        _count: {
          select: {
            metricEntries: true,
            tasks: true,
          },
        },
      },
    }),
    prisma.subscription.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.usageEvent.groupBy({
      by: ["resource"],
      where: { createdAt: { gte: monthStart } },
      _count: { _all: true },
    }),
    prisma.waitlist.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.task.findMany({
      where: {
        source: {
          in: ["AI_PLAN", "AGENT_CHAT", "FOUNDER_COACH"],
        },
      },
      select: {
        id: true,
        source: true,
        events: {
          select: {
            eventType: true,
          },
        },
      },
    }),
    prisma.productEvent.findMany({
      where: {
        createdAt: { gte: cohortStart },
        eventType: { in: [...PRODUCT_FUNNEL_EVENT_TYPES] },
      },
      select: {
        productId: true,
        userId: true,
        eventType: true,
        createdAt: true,
      },
      orderBy: { createdAt: "asc" },
    }),
    prisma.productEvent.findMany({
      where: {
        createdAt: { gte: cohortStart },
        eventType: { in: [...AI_BRIDGE_EVENT_TYPES] },
      },
      select: {
        eventType: true,
        metadata: true,
      },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  const planCounts: Record<PlanTier, number> = { FREE: 0, STARTER: 0, PRO: 0 };
  for (const user of users) {
    planCounts[resolveCurrentPlan(user.subscription)] += 1;
  }

  const stageCounts: Record<ProductStatus, number> = {
    PRE_LAUNCH: 0,
    LAUNCHED: 0,
    GROWING: 0,
  };
  const growthReadiness = {
    missing_checkin: 0,
    missing_setup: 0,
    missing_baseline: 0,
    diagnosis_ready: 0,
  };

  for (const product of products) {
    stageCounts[product.status] += 1;
    const state = getGrowthReadinessState({
      status: product.status,
      additionalContext: product.additionalContext,
      selections: product.metricSetup?.selections,
      metricEntryCount: product._count.metricEntries,
    });
    if (state) {
      growthReadiness[state] += 1;
    }
  }

  const subscriptionStatusCounts: Record<SubStatus, number> = {
    ACTIVE: 0,
    CANCELED: 0,
    PAST_DUE: 0,
  };
  for (const row of subscriptionCounts) {
    subscriptionStatusCounts[row.status] = row._count._all;
  }

  const usageTotals = {
    aiMessages: 0,
    aiSuggestions: 0,
  };
  for (const row of usageCounts) {
    if (row.resource === UsageResource.AI_MESSAGE) usageTotals.aiMessages = row._count._all;
    if (row.resource === UsageResource.AI_SUGGESTION) usageTotals.aiSuggestions = row._count._all;
  }

  const waitlist = {
    total: 0,
    pending: 0,
    approved: 0,
    invited: 0,
    rejected: 0,
  };
  for (const row of waitlistCounts) {
    waitlist.total += row._count._all;
    if (row.status === "PENDING") waitlist.pending = row._count._all;
    if (row.status === "APPROVED") waitlist.approved = row._count._all;
    if (row.status === "INVITED") waitlist.invited = row._count._all;
    if (row.status === "REJECTED") waitlist.rejected = row._count._all;
  }

  const recentProducts = products.filter((product) => product.createdAt >= cohortStart);
  const recentProductIds = new Set(recentProducts.map((product) => product.id));
  const recentUserIds = new Set(recentProducts.map((product) => product.userId));
  const usersById = new Map(users.map((user) => [user.id, user]));

  const returningCohortUsers = Array.from(recentUserIds).filter((userId) => {
    const user = usersById.get(userId);
    if (!user) return false;

    const userProducts = recentProducts.filter((product) => product.userId === userId);
    const firstProductAt = minDate(userProducts.map((product) => product.createdAt));
    const latestProductActivity = maxDate(userProducts.map((product) => product.updatedAt));

    if (!firstProductAt || !latestProductActivity) return false;
    return latestProductActivity.getTime() - firstProductAt.getTime() >= 24 * 60 * 60 * 1000;
  });

  const funnelEventsByProduct = new Map<
    string,
    Partial<Record<ProductFunnelEventType, Date>>
  >();
  const onboardingEventByProduct = new Map<string, { userId: string; createdAt: Date }>();
  const appSessionsByProduct = new Map<string, Date[]>();
  for (const event of productEvents) {
    const productEventsForProduct = funnelEventsByProduct.get(event.productId) ?? {};
    const typedEventType = event.eventType as ProductFunnelEventType;
    const currentEventAt = productEventsForProduct[typedEventType];
    if (!currentEventAt || event.createdAt.getTime() < currentEventAt.getTime()) {
      productEventsForProduct[typedEventType] = event.createdAt;
      funnelEventsByProduct.set(event.productId, productEventsForProduct);
    }

    if (event.eventType === "ONBOARDING_COMPLETED" && !onboardingEventByProduct.has(event.productId)) {
      onboardingEventByProduct.set(event.productId, {
        userId: event.userId,
        createdAt: event.createdAt,
      });
    }
    if (event.eventType === "APP_SESSION") {
      const current = appSessionsByProduct.get(event.productId) ?? [];
      current.push(event.createdAt);
      appSessionsByProduct.set(event.productId, current);
    }
  }

  const eventCohort = Array.from(onboardingEventByProduct.entries());
  const returnedEventUsers = new Set<string>();
  for (const [productId, onboardingEvent] of eventCohort) {
    const sessions = appSessionsByProduct.get(productId) ?? [];
    const hasReturned = sessions.some(
      (sessionAt) => sessionAt.getTime() - onboardingEvent.createdAt.getTime() >= 24 * 60 * 60 * 1000,
    );
    if (hasReturned) {
      returnedEventUsers.add(onboardingEvent.userId);
    }
  }

  const onboardingToValue = {
    created: recentProducts.length,
    growthCheckin: 0,
    metricSetup: 0,
    firstMetricEntry: 0,
    diagnosisReady: 0,
    mode: "event" as "event" | "hybrid",
  };

  for (const product of recentProducts) {
    const readiness = getGrowthReadinessState({
      status: product.status,
      additionalContext: product.additionalContext,
      selections: product.metricSetup?.selections,
      metricEntryCount: product._count.metricEntries,
    });

    const funnelEvents = funnelEventsByProduct.get(product.id);

    const inferredHasCheckin = readiness !== null && readiness !== "missing_checkin";
    const inferredHasSetup = readiness === "missing_baseline" || readiness === "diagnosis_ready";
    const inferredHasFirstMetricEntry = product._count.metricEntries > 0;
    const inferredHasDiagnosis = readiness === "diagnosis_ready";

    const hasCheckin = !!funnelEvents?.GROWTH_CHECKIN_COMPLETED || inferredHasCheckin;
    const hasSetup = !!funnelEvents?.METRIC_SETUP_COMPLETED || inferredHasSetup;
    const hasFirstMetricEntry =
      !!funnelEvents?.FIRST_METRIC_ENTRY_CREATED || inferredHasFirstMetricEntry;
    const hasDiagnosis =
      !!funnelEvents?.GROWTH_DIAGNOSIS_READY || inferredHasDiagnosis;

    if (
      !funnelEvents?.GROWTH_CHECKIN_COMPLETED ||
      !funnelEvents?.METRIC_SETUP_COMPLETED ||
      !funnelEvents?.FIRST_METRIC_ENTRY_CREATED ||
      !funnelEvents?.GROWTH_DIAGNOSIS_READY
    ) {
      onboardingToValue.mode = "hybrid";
    }

    if (hasCheckin) onboardingToValue.growthCheckin += 1;
    if (hasSetup) onboardingToValue.metricSetup += 1;
    if (hasFirstMetricEntry) onboardingToValue.firstMetricEntry += 1;
    if (hasDiagnosis) onboardingToValue.diagnosisReady += 1;
  }

  const aiEffectiveness = {
    totalAiTasks: aiTasks.length,
    coachTasks: aiTasks.filter((task) => task.source === "FOUNDER_COACH").length,
    actedOnTasks: 0,
    completedTasks: 0,
    suggestionLoads: 0,
    suggestionActivations: 0,
    suggestionDedupedActivations: 0,
    bySurface: createAiSurfaceBreakdown(),
  };

  for (const task of aiTasks) {
    const eventTypes = new Set(task.events.map((event) => event.eventType));
    if (eventTypes.has("STARTED") || eventTypes.has("COMPLETED")) {
      aiEffectiveness.actedOnTasks += 1;
    }
    if (eventTypes.has("COMPLETED")) {
      aiEffectiveness.completedTasks += 1;
    }
  }

  for (const event of aiBridgeEvents) {
    let surface: AiSurfaceKey | null = null;
    try {
      const metadata =
        typeof event.metadata === "string" && event.metadata
          ? JSON.parse(event.metadata) as { deduped?: boolean; agentType?: AiSurfaceKey }
          : null;
      if (metadata?.agentType === "overview" || metadata?.agentType === "launch" || metadata?.agentType === "growth") {
        surface = metadata.agentType;
      }

      if (event.eventType === "AI_SUGGESTION_TASK_ACTIVATED" && metadata?.deduped) {
        aiEffectiveness.suggestionDedupedActivations += 1;
      }
    } catch {
      // Ignore malformed metadata; admin should still see aggregate counts.
    }

    if (event.eventType === "AI_SUGGESTIONS_SHOWN") {
      aiEffectiveness.suggestionLoads += 1;
      if (surface) aiEffectiveness.bySurface[surface].loads += 1;
      continue;
    }

    if (event.eventType === "AI_SUGGESTION_TASK_ACTIVATED") {
      aiEffectiveness.suggestionActivations += 1;
      if (surface) aiEffectiveness.bySurface[surface].activations += 1;
    }
  }

  return {
    users: {
      total: users.length,
      verified: users.filter((user) => !!user.emailVerified).length,
      planCounts,
    },
    products: {
      total: products.length,
      stageCounts,
      growthReadiness,
    },
    subscriptions: subscriptionStatusCounts,
    usageTotals,
    waitlist,
    aiEffectiveness: {
      ...aiEffectiveness,
      actedOnRate:
        aiEffectiveness.totalAiTasks > 0
          ? aiEffectiveness.actedOnTasks / aiEffectiveness.totalAiTasks
          : 0,
      completedRate:
        aiEffectiveness.totalAiTasks > 0
          ? aiEffectiveness.completedTasks / aiEffectiveness.totalAiTasks
          : 0,
      suggestionActivationRate:
        aiEffectiveness.suggestionLoads > 0
          ? aiEffectiveness.suggestionActivations / aiEffectiveness.suggestionLoads
          : 0,
      bySurface: Object.fromEntries(
        Object.entries(aiEffectiveness.bySurface).map(([surface, stats]) => [
          surface,
          {
            ...stats,
            activationRate: stats.loads > 0 ? stats.activations / stats.loads : 0,
          },
        ]),
      ) as Record<AiSurfaceKey, { loads: number; activations: number; activationRate: number }>,
    },
    founderReturn:
      eventCohort.length > 0
        ? {
            cohortUsers: new Set(eventCohort.map(([, event]) => event.userId)).size,
            returnedUsers: returnedEventUsers.size,
            returnedRate:
              eventCohort.length > 0
                ? returnedEventUsers.size / new Set(eventCohort.map(([, event]) => event.userId)).size
                : 0,
            windowDays: 30,
            mode: "event" as const,
          }
        : {
            cohortUsers: recentUserIds.size,
            returnedUsers: returningCohortUsers.length,
            returnedRate:
              recentUserIds.size > 0 ? returningCohortUsers.length / recentUserIds.size : 0,
            windowDays: 30,
            mode: "proxy" as const,
          },
    onboardingToValue: {
      ...onboardingToValue,
      windowDays: 30,
      trackedProducts: recentProductIds.size,
    },
  };
}

export async function getAdminUsersData(filters: UserFilters, locale: string) {
  const q = normalizeValue(filters.q);
  const plan = toOptionalPlan(filters.plan);
  const subscriptionStatus = toOptionalSubStatus(filters.subscriptionStatus);
  const emailVerified = normalizeValue(filters.emailVerified);
  const stage = toOptionalProductStatus(filters.stage);

  const where: Prisma.UserWhereInput = {
    AND: [
      q
        ? {
            OR: [
              { email: { contains: q, mode: "insensitive" } },
              { name: { contains: q, mode: "insensitive" } },
            ],
          }
        : {},
      emailVerified === "verified"
        ? { emailVerified: { not: null } }
        : emailVerified === "unverified"
          ? { emailVerified: null }
          : {},
      subscriptionStatus
        ? { subscription: { is: { status: subscriptionStatus as SubStatus } } }
        : {},
      stage
        ? { products: { some: { status: stage as ProductStatus } } }
        : {},
      plan === "FREE"
        ? {
            OR: [
              { subscription: { is: null } },
              { subscription: { is: { status: SubStatus.CANCELED } } },
              { subscription: { is: { plan: PlanTier.FREE } } },
            ],
          }
        : plan
          ? {
              subscription: {
                is: {
                  plan: plan as PlanTier,
                  NOT: { status: SubStatus.CANCELED },
                },
              },
            }
          : {},
    ],
  };

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      emailVerified: true,
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
      products: {
        select: {
          id: true,
          status: true,
          updatedAt: true,
        },
      },
    },
  });

  if (users.length === 0) {
    return [];
  }

  const monthStart = getCurrentMonthStart();
  const userIds = users.map((user) => user.id);
  const productIds = users.flatMap((user) => user.products.map((product) => product.id));

  const [usageCounts, usageLatest, taskLatestByProduct] = await Promise.all([
    prisma.usageEvent.groupBy({
      by: ["userId", "resource"],
      where: {
        userId: { in: userIds },
        createdAt: { gte: monthStart },
      },
      _count: { _all: true },
    }),
    prisma.usageEvent.groupBy({
      by: ["userId"],
      where: {
        userId: { in: userIds },
      },
      _max: { createdAt: true },
    }),
    productIds.length > 0
      ? prisma.task.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds } },
          _max: { updatedAt: true },
        })
      : Promise.resolve([]),
  ]);

  const usageByUser = new Map<string, { aiMessages: number; aiSuggestions: number }>();
  for (const row of usageCounts) {
    const current = usageByUser.get(row.userId) ?? { aiMessages: 0, aiSuggestions: 0 };
    if (row.resource === UsageResource.AI_MESSAGE) current.aiMessages = row._count._all;
    if (row.resource === UsageResource.AI_SUGGESTION) current.aiSuggestions = row._count._all;
    usageByUser.set(row.userId, current);
  }

  const latestUsageByUser = new Map(usageLatest.map((row) => [row.userId, row._max.createdAt ?? null]));
  const latestTaskByProduct = new Map(taskLatestByProduct.map((row) => [row.productId, row._max.updatedAt ?? null]));

  return users.map((user) => {
    const stageCounts: Partial<Record<ProductStatus, number>> = {};
    for (const product of user.products) {
      stageCounts[product.status] = (stageCounts[product.status] ?? 0) + 1;
    }

    const usage = usageByUser.get(user.id) ?? { aiMessages: 0, aiSuggestions: 0 };
    const latestProductUpdate = maxDate(user.products.map((product) => product.updatedAt));
    const latestTaskUpdate = maxDate(
      user.products.map((product) => latestTaskByProduct.get(product.id) ?? null),
    );
    const lastActivityAt = maxDate([
      latestProductUpdate,
      latestTaskUpdate,
      latestUsageByUser.get(user.id) ?? null,
    ]);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      emailVerified: user.emailVerified,
      currentPlan: resolveCurrentPlan(user.subscription),
      subscriptionStatus: user.subscription?.status ?? null,
      productCount: user.products.length,
      stageSummary: formatStageSummary(stageCounts, locale),
      aiMessagesThisMonth: usage.aiMessages,
      aiSuggestionsThisMonth: usage.aiSuggestions,
      lastActivityAt,
    };
  });
}

export async function getAdminProductsData(filters: ProductFilters) {
  const q = normalizeValue(filters.q);
  const status = toOptionalProductStatus(filters.status);
  const growthState = toOptionalGrowthState(filters.growthState);

  const products = await prisma.product.findMany({
    where: {
      AND: [
        q
          ? {
              OR: [
                { name: { contains: q, mode: "insensitive" } },
                { user: { email: { contains: q, mode: "insensitive" } } },
              ],
            }
          : {},
        status ? { status: status as ProductStatus } : {},
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      createdAt: true,
      additionalContext: true,
      user: {
        select: {
          email: true,
        },
      },
      metricSetup: {
        select: {
          selections: true,
        },
      },
    },
  });

  if (products.length === 0) {
    return [];
  }

  const productIds = products.map((product) => product.id);
  const [metricEntries, integrationCounts, taskCounts] = await Promise.all([
    prisma.metricEntry.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _count: { _all: true },
      _max: { date: true },
    }),
    prisma.integration.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds } },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["productId", "status"],
      where: { productId: { in: productIds } },
      _count: { _all: true },
    }),
  ]);

  const metricEntryMap = new Map(
    metricEntries.map((row) => [
      row.productId,
      { count: row._count._all, latestDate: row._max.date ?? null },
    ]),
  );
  const integrationCountMap = new Map(
    integrationCounts.map((row) => [row.productId, row._count._all]),
  );
  const taskCountMap = new Map<
    string,
    { todo: number; inProgress: number; done: number }
  >();
  for (const row of taskCounts) {
    const current = taskCountMap.get(row.productId) ?? { todo: 0, inProgress: 0, done: 0 };
    if (row.status === "TODO") current.todo = row._count._all;
    if (row.status === "IN_PROGRESS") current.inProgress = row._count._all;
    if (row.status === "DONE") current.done = row._count._all;
    taskCountMap.set(row.productId, current);
  }

  const rows = products.map((product) => {
    const metricStats = metricEntryMap.get(product.id) ?? { count: 0, latestDate: null };
    const readiness = getGrowthReadinessState({
      status: product.status,
      additionalContext: product.additionalContext,
      selections: product.metricSetup?.selections,
      metricEntryCount: metricStats.count,
    });

    return {
      id: product.id,
      name: product.name,
      ownerEmail: product.user.email,
      status: product.status,
      createdAt: product.createdAt,
      hasGrowthCheckin: readiness !== null && readiness !== "missing_checkin",
      hasMetricSetup: readiness === "missing_baseline" || readiness === "diagnosis_ready",
      hasMetricEntries: metricStats.count > 0,
      diagnosisReady: readiness === "diagnosis_ready",
      growthState: readiness,
      metricEntryCount: metricStats.count,
      latestMetricEntryDate: metricStats.latestDate,
      connectedIntegrationCount: integrationCountMap.get(product.id) ?? 0,
      taskCounts: taskCountMap.get(product.id) ?? { todo: 0, inProgress: 0, done: 0 },
    };
  });

  return growthState
    ? rows.filter((row) => row.growthState === growthState)
    : rows;
}

export async function getAdminBillingData() {
  const [users, subscriptions] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        subscription: {
          select: {
            plan: true,
            status: true,
          },
        },
      },
    }),
    prisma.subscription.findMany({
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        userId: true,
        plan: true,
        interval: true,
        status: true,
        currentPeriodEnd: true,
        stripeCustomerId: true,
        stripeSubId: true,
        user: {
          select: {
            email: true,
          },
        },
      },
    }),
  ]);

  const planCounts: Record<PlanTier, number> = { FREE: 0, STARTER: 0, PRO: 0 };
  for (const user of users) {
    planCounts[resolveCurrentPlan(user.subscription)] += 1;
  }

  const paidUsers = planCounts.STARTER + planCounts.PRO;
  const freeUsers = planCounts.FREE;

  return {
    planCounts,
    paidUsers,
    freeUsers,
    subscriptions,
  };
}

export async function getAdminAiUsageData() {
  const monthStart = getCurrentMonthStart();

  const usageRows = await prisma.usageEvent.groupBy({
    by: ["userId", "resource"],
    where: {
      createdAt: { gte: monthStart },
    },
    _count: { _all: true },
  });

  const totals = {
    aiMessages: 0,
    aiSuggestions: 0,
  };

  const byUser = new Map<string, { aiMessages: number; aiSuggestions: number }>();
  for (const row of usageRows) {
    const current = byUser.get(row.userId) ?? { aiMessages: 0, aiSuggestions: 0 };
    if (row.resource === UsageResource.AI_MESSAGE) {
      current.aiMessages = row._count._all;
      totals.aiMessages += row._count._all;
    }
    if (row.resource === UsageResource.AI_SUGGESTION) {
      current.aiSuggestions = row._count._all;
      totals.aiSuggestions += row._count._all;
    }
    byUser.set(row.userId, current);
  }

  const userIds = Array.from(byUser.keys());
  if (userIds.length === 0) {
    return {
      totals,
      rows: [],
    };
  }

  const users = await prisma.user.findMany({
    where: {
      id: { in: userIds },
    },
    select: {
      id: true,
      name: true,
      email: true,
      subscription: {
        select: {
          plan: true,
          status: true,
        },
      },
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  const rows = users
    .map((user) => {
      const usage = byUser.get(user.id) ?? { aiMessages: 0, aiSuggestions: 0 };
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        currentPlan: resolveCurrentPlan(user.subscription),
        productCount: user._count.products,
        aiMessagesThisMonth: usage.aiMessages,
        aiSuggestionsThisMonth: usage.aiSuggestions,
        totalUsageThisMonth: usage.aiMessages + usage.aiSuggestions,
      };
    })
    .sort((left, right) => right.totalUsageThisMonth - left.totalUsageThisMonth);

  return {
    totals,
    rows,
  };
}
