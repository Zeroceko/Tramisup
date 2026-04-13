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

type LocalizedCopy = {
  en: string;
  tr: string;
};

type PlanMarketing = {
  summary: LocalizedCopy;
  bestFor: LocalizedCopy;
  upgradeNote: LocalizedCopy;
};

type PlanDefinition = {
  prices: PlanPrice;
  limits: Record<LimitKey, number>;
  features: PlanFeatures;
  marketing: PlanMarketing;
};

function pick(locale: string, copy: LocalizedCopy) {
  return locale === "en" ? copy.en : copy.tr;
}

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
    marketing: {
      summary: {
        en: "Validate one product with structure before you pay.",
        tr: "Tek bir ürünü ödeme yapmadan önce düzenli biçimde doğrula.",
      },
      bestFor: {
        en: "First-time founders or early-stage products still proving the loop.",
        tr: "İlk ürününü doğrulayan kurucular veya henüz çekirdeği kanıtlamayan erken aşama ürünler.",
      },
      upgradeNote: {
        en: "Move up once one real product needs more tasks, more AI usage, or source integrations.",
        tr: "Gerçek bir ürün daha fazla görev, daha fazla AI kullanımı veya kaynak entegrasyonu istediğinde yükselt.",
      },
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
    marketing: {
      summary: {
        en: "Operate one serious product with enough room for weekly metrics and execution.",
        tr: "Haftalık metrik ve execution ritmi kurmak için tek ciddi ürünü rahatça işlet.",
      },
      bestFor: {
        en: "Solo founders or tiny teams actively running one real product.",
        tr: "Tek gerçek ürünü aktif yöneten solo kurucular veya çok küçük ekipler.",
      },
      upgradeNote: {
        en: "Go Pro when you manage multiple products or need export and support layers.",
        tr: "Birden fazla ürün yönetmeye ya da export ve destek katmanına ihtiyaç duyduğunda Pro'ya geç.",
      },
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
    marketing: {
      summary: {
        en: "Run multiple products with higher usage ceilings and operational extras.",
        tr: "Daha yüksek kullanım limitleri ve operasyonel eklerle birden fazla ürünü yönet.",
      },
      bestFor: {
        en: "Studios, multi-product founders, or small teams who need more operating headroom.",
        tr: "Daha geniş operasyon alanına ihtiyaç duyan stüdyolar, çok ürünlü kurucular veya küçük ekipler.",
      },
      upgradeNote: {
        en: "Best when Tiramisup is becoming part of your weekly operating system, not just a trial workspace.",
        tr: "Tiramisup sadece deneme alanı değil, haftalık işletim sisteminin parçası olmaya başladığında en doğru katman.",
      },
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
    {
      text: isEn ? "Stage-aware launch workspace" : "Aşamaya göre uyarlanan launch workspace",
      included: features.launchChecklist,
    },
    {
      text:
        features.integrations === "none"
          ? isEn
            ? "No source integrations yet"
            : "Henüz kaynak entegrasyonu yok"
          : features.integrations === "all"
            ? isEn
              ? "Core integrations + future integration access"
              : "Temel entegrasyonlar + geldikçe yeni entegrasyon erişimi"
            : isEn
              ? "Core integrations (GA4, Stripe)"
              : "Temel entegrasyonlar (GA4, Stripe)",
      included: true,
    },
    {
      text: isEn ? "Growth tactics layer" : "Growth tactics katmanı",
      included: features.growthTactics,
    },
    {
      text: isEn ? "CSV export" : "CSV export",
      included: features.csvExport,
    },
    {
      text: isEn ? "Priority support" : "Öncelikli destek",
      included: features.prioritySupport,
    },
    ...getLimitFeatureCopy(plan, locale),
    {
      text:
        features.integrations === "all"
          ? isEn
            ? "Built for multi-product operating cadence"
            : "Çok ürünlü operasyon ritmi için uygun"
          : isEn
            ? "Built for one real product"
            : "Tek gerçek ürün odağı için uygun",
      included: true,
    },
  ];
}

export function getPlanMarketingCopy(plan: PlanTier, locale: string) {
  const marketing = PLAN_CONFIG[plan].marketing;
  return {
    summary: pick(locale, marketing.summary),
    bestFor: pick(locale, marketing.bestFor),
    upgradeNote: pick(locale, marketing.upgradeNote),
  };
}

export function getPlanUpsellSummary(plan: PlanTier, locale: string) {
  const marketing = getPlanMarketingCopy(plan, locale);
  return marketing.summary;
}
