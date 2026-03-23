export type FunnelStageKey = "Awareness" | "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";

export type FunnelMetricSelection = {
  stage: FunnelStageKey;
  selectedMetricKeys: string[];
};

export type SavedMetricSetup = {
  version: 1;
  selections: FunnelMetricSelection[];
};

export function parseSavedMetricSetup(value: string | null | undefined): SavedMetricSetup | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SavedMetricSetup;
    if (parsed?.version !== 1 || !Array.isArray(parsed?.selections)) return null;
    return parsed;
  } catch {
    return null;
  }
}
