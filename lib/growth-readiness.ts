export const MIN_GROWTH_DIAGNOSIS_ENTRY_COUNT = 5;

export function hasMetricSetupSelections(selections: unknown) {
  if (!Array.isArray(selections)) return false;

  return selections.some((item) => {
    if (!item || typeof item !== "object") return false;
    const selectedMetricKeys = (item as { selectedMetricKeys?: unknown }).selectedMetricKeys;
    return Array.isArray(selectedMetricKeys) && selectedMetricKeys.length > 0;
  });
}

export function hasAnyMetricEntries(metricEntryCount: number) {
  return metricEntryCount > 0;
}

export function hasGrowthDiagnosisData(metricEntryCount: number) {
  return metricEntryCount >= MIN_GROWTH_DIAGNOSIS_ENTRY_COUNT;
}
