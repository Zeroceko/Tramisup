import type { FunnelMetricSelection } from "@/lib/metric-setup";

export const ONBOARDING_GROWTH_STAGES = [
  "Awareness",
  "Acquisition",
  "Activation",
  "Retention",
  "Referral",
  "Revenue",
] as const;

export type OnboardingGrowthStageKey = (typeof ONBOARDING_GROWTH_STAGES)[number];

export type OnboardingMetricSelectionMap = Partial<
  Record<OnboardingGrowthStageKey, string>
>;

export function isGrowingOnboardingStage(launchStatus?: string | null) {
  return launchStatus === "GROWING";
}

export function mergeRecommendedMetricSelections(
  current: OnboardingMetricSelectionMap | null | undefined,
  recommended: OnboardingMetricSelectionMap | null | undefined
): OnboardingMetricSelectionMap {
  const merged: OnboardingMetricSelectionMap = { ...(current ?? {}) };

  for (const stage of ONBOARDING_GROWTH_STAGES) {
    if (!merged[stage] && recommended?.[stage]) {
      merged[stage] = recommended[stage];
    }
  }

  return merged;
}

export function hasCompleteMetricSelections(
  selected: OnboardingMetricSelectionMap | null | undefined
) {
  return ONBOARDING_GROWTH_STAGES.every((stage) => {
    const value = selected?.[stage];
    return typeof value === "string" && value.trim().length > 0;
  });
}

export function buildMetricSelectionsFromMap(
  selected: OnboardingMetricSelectionMap | null | undefined
): FunnelMetricSelection[] {
  return ONBOARDING_GROWTH_STAGES.map((stage) => ({
    stage,
    selectedMetricKeys: selected?.[stage] ? [selected[stage] as string] : [],
  }));
}

export function getOnboardingPostCreateDestination(args: {
  locale: string;
  useMetrics: boolean;
  connectableSources: string[];
  launchStatus?: string | null;
  productId: string;
}) {
  const { locale, useMetrics, connectableSources, launchStatus, productId } = args;

  if (useMetrics && connectableSources.length > 0) {
    const params = new URLSearchParams({
      onboarding: "1",
      connect: connectableSources[0],
    });
    if (isGrowingOnboardingStage(launchStatus)) {
      params.set("returnTo", "onboarding_growth");
    }
    if (connectableSources.length > 1) {
      params.set("queued", connectableSources.slice(1).join(","));
    }
    return `/${locale}/integrations?${params.toString()}`;
  }

  if (isGrowingOnboardingStage(launchStatus) && useMetrics) {
    return `/${locale}/growth?onboarding=1`;
  }

  return `/${locale}/products/${productId}/overview?onboarding=continue`;
}
