import { PlanTier } from "@prisma/client";

export type LimitKey = "products" | "tasks" | "aiMessages" | "aiSuggestions" | "metrics";

type PlanPrice = {
  monthly: number;
  yearly: number;
};

type PlanFeatures = {
  launchChecklist: boolean;
  integrations: "none" | "core" | "all";
  growthTactics: boolean;
  csvExport: boolean;
  prioritySupport: boolean;
};

type PlanDefinition = {
  prices: PlanPrice;
  limits: Record<LimitKey, number>;
  features: PlanFeatures;
};

// Adjust plan packaging from this single object.
export const PLAN_CONFIG: Record<PlanTier, PlanDefinition> = {
  FREE: {
    prices: { monthly: 0, yearly: 0 },
    limits: {
      products: 1,
      tasks: 20,
      aiMessages: 12,
      aiSuggestions: 8,
      metrics: 6,
    },
    features: {
      launchChecklist: true,
      integrations: "none",
      growthTactics: false,
      csvExport: false,
      prioritySupport: false,
    },
  },
  STARTER: {
    prices: { monthly: 9, yearly: 6.75 },
    limits: {
      products: 3,
      tasks: 150,
      aiMessages: 90,
      aiSuggestions: 30,
      metrics: 20,
    },
    features: {
      launchChecklist: true,
      integrations: "core",
      growthTactics: true,
      csvExport: false,
      prioritySupport: false,
    },
  },
  PRO: {
    prices: { monthly: 19, yearly: 14.25 },
    limits: {
      products: 10,
      tasks: 600,
      aiMessages: 300,
      aiSuggestions: 100,
      metrics: 60,
    },
    features: {
      launchChecklist: true,
      integrations: "all",
      growthTactics: true,
      csvExport: true,
      prioritySupport: true,
    },
  },
};

export const PLAN_LIMITS = Object.fromEntries(
  Object.entries(PLAN_CONFIG).map(([plan, config]) => [plan, config.limits]),
) as Record<PlanTier, Record<LimitKey, number>>;

export const PLAN_PRICES = Object.fromEntries(
  Object.entries(PLAN_CONFIG).map(([plan, config]) => [plan, config.prices]),
) as Record<PlanTier, PlanPrice>;

function getLimitFeatureCopy(plan: PlanTier, locale: string) {
  const limits = PLAN_CONFIG[plan].limits;
  const isEn = locale === "en";

  return [
    {
      text: isEn
        ? `${limits.products} product${limits.products === 1 ? "" : "s"}`
        : `${limits.products} ürün`,
      included: true,
    },
    {
      text: isEn
        ? `${limits.tasks} task${limits.tasks === 1 ? "" : "s"}`
        : `${limits.tasks} görev`,
      included: true,
    },
    {
      text: isEn
        ? `${limits.aiSuggestions} AI suggestions / month`
        : `Ayda ${limits.aiSuggestions} AI önerisi`,
      included: true,
    },
    {
      text: isEn
        ? `${limits.aiMessages} agent chat messages / month`
        : `Ayda ${limits.aiMessages} agent chat mesajı`,
      included: true,
    },
    {
      text: isEn
        ? `${limits.metrics} metrics tracked`
        : `${limits.metrics} metrik takibi`,
      included: true,
    },
  ];
}

export function getPlanFeatureList(plan: PlanTier, locale: string) {
  const isEn = locale === "en";
  const features = PLAN_CONFIG[plan].features;

  return [
    ...getLimitFeatureCopy(plan, locale),
    {
      text: "Launch checklist",
      included: features.launchChecklist,
    },
    {
      text:
        features.integrations === "all"
          ? isEn
            ? "All integrations"
            : "Tüm entegrasyonlar"
          : isEn
            ? "Core integrations (GA4, Stripe)"
            : "Temel entegrasyonlar (GA4, Stripe)",
      included: features.integrations !== "none",
    },
    {
      text: isEn ? "Growth tactics" : "Growth taktikleri",
      included: features.growthTactics,
    },
    {
      text: features.prioritySupport
        ? isEn
          ? "CSV export + priority support"
          : "CSV export + öncelikli destek"
        : "CSV export",
      included: features.csvExport,
    },
  ];
}

export function getPlanUpsellSummary(plan: PlanTier, locale: string) {
  const isEn = locale === "en";
  const limits = PLAN_CONFIG[plan].limits;

  return isEn
    ? `${plan === PlanTier.STARTER ? "Starter" : "Pro"} gives you ${limits.tasks} tasks, ${limits.aiMessages} AI messages, and ${limits.products} products.`
    : `${plan === PlanTier.STARTER ? "Starter" : "Pro"} ile ${limits.tasks} görev, ${limits.aiMessages} AI mesajı ve ${limits.products} ürün alırsın.`;
}
