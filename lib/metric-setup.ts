export type FunnelStageKey = "Awareness" | "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";

export type FunnelMetricSelection = {
  stage: FunnelStageKey;
  selectedMetricKeys: string[];
};

export type MetricEntryRow = {
  date: string;
  values: Partial<Record<FunnelStageKey, number>>;
};

export type SavedMetricSetup = {
  version: 2 | 3;
  selections: FunnelMetricSelection[];
  entries: MetricEntryRow[];
  platforms?: string[];
  founderSummary?: {
    headline: string;
    summary: string;
    nextStep: string;
    strengths: string[];
    focusAreas: string[];
  };
};

export function parseSavedMetricSetup(value: string | null | undefined): SavedMetricSetup | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SavedMetricSetup | { version: 1; selections: FunnelMetricSelection[] };
    if (parsed?.version === 1 && Array.isArray(parsed?.selections)) {
      return {
        version: 2,
        selections: parsed.selections,
        entries: [],
      };
    }

    if (![2, 3].includes(parsed?.version as number) || !Array.isArray((parsed as SavedMetricSetup)?.selections) || !Array.isArray((parsed as SavedMetricSetup)?.entries)) {
      return null;
    }

    return parsed as SavedMetricSetup;
  } catch {
    return null;
  }
}
