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

export async function getAdminOverviewData() {
  const monthStart = getCurrentMonthStart();

  const [users, products, subscriptionCounts, usageCounts, waitlistCounts] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
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
