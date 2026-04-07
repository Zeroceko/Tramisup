import { PlanTier, UsageResource } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { PLAN_LIMITS, PLAN_PRICES, type LimitKey } from "@/lib/plan-config";

export { PlanTier };
export { PLAN_LIMITS, PLAN_PRICES, type LimitKey };
type LimitUsageResource = Extract<LimitKey, "aiMessages" | "aiSuggestions">;

export type LimitSnapshot = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: PlanTier;
  isNearLimit: boolean;
};

export async function getUserPlan(userId: string): Promise<PlanTier> {
  if (!userId) return PlanTier.FREE;
  const sub = await prisma.subscription.findUnique({
    where: { userId },
    select: { plan: true, status: true },
  });
  if (!sub || sub.status === "CANCELED") return PlanTier.FREE;
  return sub.plan;
}

function getCurrentPeriodStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

function getUsageResource(resource: LimitUsageResource): UsageResource {
  return resource === "aiMessages" ? UsageResource.AI_MESSAGE : UsageResource.AI_SUGGESTION;
}

export async function getUsageCount(userId: string, resource: LimitKey): Promise<number> {
  if (!userId) return 0;

  if (resource === "products") {
    return prisma.product.count({ where: { userId } });
  }

  if (resource === "tasks") {
    return prisma.task.count({ where: { product: { userId } } });
  }

  if (resource === "metrics") {
    const setups = await prisma.metricSetup.findMany({
      where: { product: { userId } },
      select: { selections: true },
    });
    const keys = new Set<string>();
    for (const setup of setups) {
      const selections = setup.selections as Array<{ selectedMetricKeys?: string[] }>;
      for (const sel of selections) {
        for (const key of sel.selectedMetricKeys ?? []) keys.add(key);
      }
    }
    return keys.size;
  }

  if (resource === "aiMessages" || resource === "aiSuggestions") {
    return prisma.usageEvent.count({
      where: {
        userId,
        resource: getUsageResource(resource),
        createdAt: { gte: getCurrentPeriodStart() },
      },
    });
  }

  return 0;
}

export async function checkLimit(
  userId: string,
  resource: LimitKey,
  increment = 1,
): Promise<LimitSnapshot> {
  const plan = await getUserPlan(userId);
  const limit = PLAN_LIMITS[plan][resource];
  const used = await getUsageCount(userId, resource);
  const nextUsed = used + Math.max(0, increment);
  const remaining = limit === Infinity ? Infinity : Math.max(0, limit - used);
  const allowed = limit === Infinity || nextUsed <= limit;
  const isNearLimit =
    limit !== Infinity &&
    limit > 0 &&
    used >= Math.max(limit - 5, Math.ceil(limit * 0.9));

  return { allowed, used, limit, remaining, plan, isNearLimit };
}

export async function recordUsageEvent(
  userId: string,
  resource: LimitUsageResource,
) {
  if (!userId) return;

  await prisma.usageEvent.create({
    data: {
      userId,
      resource: getUsageResource(resource),
    },
  });
}
