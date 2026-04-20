import { describe, expect, it } from "vitest";
import {
  MIN_GROWTH_DIAGNOSIS_ENTRY_COUNT,
  hasAnyMetricEntries,
  hasGrowthDiagnosisData,
  hasMetricSetupSelections,
} from "@/lib/growth-readiness";

describe("growth readiness helpers", () => {
  it("detects whether any metric entries exist", () => {
    expect(hasAnyMetricEntries(0)).toBe(false);
    expect(hasAnyMetricEntries(1)).toBe(true);
  });

  it("requires a stable entry history before diagnosis is considered ready", () => {
    expect(hasGrowthDiagnosisData(MIN_GROWTH_DIAGNOSIS_ENTRY_COUNT - 1)).toBe(false);
    expect(hasGrowthDiagnosisData(MIN_GROWTH_DIAGNOSIS_ENTRY_COUNT)).toBe(true);
  });

  it("treats setup as ready only when at least one stage has a selected key", () => {
    expect(hasMetricSetupSelections(null)).toBe(false);
    expect(hasMetricSetupSelections([{ stage: "Acquisition", selectedMetricKeys: [] }])).toBe(false);
    expect(hasMetricSetupSelections([{ stage: "Acquisition", selectedMetricKeys: ["visitor-to-signup"] }])).toBe(true);
  });
});
