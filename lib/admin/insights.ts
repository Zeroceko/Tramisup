import { PlanTier, ProductStatus, SubStatus } from "@prisma/client";
import { readGrowthCheckinFromAdditionalContext } from "@/lib/growth-transition-checkin";

export type GrowthReadinessState =
  | "missing_checkin"
  | "missing_setup"
  | "missing_baseline"
  | "diagnosis_ready";

type SubscriptionLike = {
  plan: PlanTier;
  status: SubStatus;
} | null | undefined;

type ProductGrowthInput = {
  status: ProductStatus;
  additionalContext?: string | null;
  selections?: unknown;
  metricEntryCount: number;
};

export function getCurrentMonthStart(now = new Date()) {
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function resolveCurrentPlan(subscription: SubscriptionLike): PlanTier {
  if (!subscription || subscription.status === "CANCELED") {
    return PlanTier.FREE;
  }

  return subscription.plan;
}

export function hasMetricSetupSelections(selections: unknown) {
  if (!Array.isArray(selections)) return false;

  return selections.some((item) => {
    if (!item || typeof item !== "object") return false;
    const selectedMetricKeys = (item as { selectedMetricKeys?: unknown }).selectedMetricKeys;
    return Array.isArray(selectedMetricKeys) && selectedMetricKeys.length > 0;
  });
}

export function getGrowthReadinessState(input: ProductGrowthInput): GrowthReadinessState | null {
  const isPostLaunch =
    input.status === ProductStatus.LAUNCHED || input.status === ProductStatus.GROWING;

  if (!isPostLaunch) return null;

  const growthCheckin = readGrowthCheckinFromAdditionalContext(input.additionalContext ?? null).growthCheckin;
  if (!growthCheckin?.completedAt) {
    return "missing_checkin";
  }

  if (!hasMetricSetupSelections(input.selections)) {
    return "missing_setup";
  }

  if (input.metricEntryCount <= 0) {
    return "missing_baseline";
  }

  return "diagnosis_ready";
}

export function formatStageSummary(
  counts: Partial<Record<ProductStatus, number>>,
  locale: string,
) {
  const isEn = locale === "en";
  const parts: string[] = [];

  if (counts.PRE_LAUNCH) {
    parts.push(isEn ? `${counts.PRE_LAUNCH} pre-launch` : `${counts.PRE_LAUNCH} launch hazırlığı`);
  }
  if (counts.LAUNCHED) {
    parts.push(isEn ? `${counts.LAUNCHED} launched` : `${counts.LAUNCHED} yayında`);
  }
  if (counts.GROWING) {
    parts.push(isEn ? `${counts.GROWING} growing` : `${counts.GROWING} büyüyor`);
  }

  return parts.length > 0 ? parts.join(" · ") : isEn ? "No products" : "Ürün yok";
}

export function formatPlanLabel(plan: PlanTier, locale: string) {
  const isEn = locale === "en";

  if (plan === PlanTier.STARTER) return isEn ? "Starter" : "Starter";
  if (plan === PlanTier.PRO) return isEn ? "Pro" : "Pro";
  return isEn ? "Free" : "Ücretsiz";
}

export function formatSubscriptionStatusLabel(
  status: SubStatus | null | undefined,
  locale: string,
) {
  const isEn = locale === "en";

  if (!status) return isEn ? "No subscription" : "Abonelik yok";
  if (status === SubStatus.ACTIVE) return isEn ? "Active" : "Aktif";
  if (status === SubStatus.PAST_DUE) return isEn ? "Past due" : "Gecikmiş";
  return isEn ? "Canceled" : "İptal";
}

export function formatProductStatusLabel(status: ProductStatus, locale: string) {
  const isEn = locale === "en";

  if (status === ProductStatus.GROWING) return isEn ? "Growing" : "Büyüyor";
  if (status === ProductStatus.LAUNCHED) return isEn ? "Launched" : "Yayında";
  return isEn ? "Pre-launch" : "Launch hazırlığı";
}

export function formatGrowthStateLabel(
  state: GrowthReadinessState | null | undefined,
  locale: string,
) {
  const isEn = locale === "en";

  if (state === "missing_checkin") {
    return isEn ? "Missing growth check-in" : "Growth check-in eksik";
  }
  if (state === "missing_setup") {
    return isEn ? "Missing metric setup" : "Metrik kurulumu eksik";
  }
  if (state === "missing_baseline") {
    return isEn ? "Missing baseline entries" : "İlk metrik girişleri eksik";
  }
  if (state === "diagnosis_ready") {
    return isEn ? "Diagnosis ready" : "Tanıya hazır";
  }

  return isEn ? "Not applicable" : "Uygulanamaz";
}

export function formatAdminDate(value: Date | null | undefined, locale: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

export function formatAdminDateTime(value: Date | null | undefined, locale: string) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(value);
}

export function maxDate(values: Array<Date | null | undefined>) {
  return values.reduce<Date | null>((latest, value) => {
    if (!value) return latest;
    if (!latest || value.getTime() > latest.getTime()) return value;
    return latest;
  }, null);
}
