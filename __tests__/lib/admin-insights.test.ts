import { PlanTier, ProductStatus, SubStatus } from "@prisma/client";
import { describe, expect, it } from "vitest";
import {
  formatStageSummary,
  getGrowthReadinessState,
  hasMetricSetupSelections,
  resolveCurrentPlan,
} from "@/lib/admin/insights";

describe("admin insights helpers", () => {
  it("treats canceled subscriptions as free for current plan reporting", () => {
    expect(resolveCurrentPlan(null)).toBe(PlanTier.FREE);
    expect(resolveCurrentPlan({ plan: PlanTier.PRO, status: SubStatus.CANCELED })).toBe(PlanTier.FREE);
    expect(resolveCurrentPlan({ plan: PlanTier.STARTER, status: SubStatus.ACTIVE })).toBe(PlanTier.STARTER);
  });

  it("detects whether metric setup includes selected keys", () => {
    expect(hasMetricSetupSelections(null)).toBe(false);
    expect(hasMetricSetupSelections([{ stage: "Acquisition", selectedMetricKeys: [] }])).toBe(false);
    expect(hasMetricSetupSelections([{ stage: "Acquisition", selectedMetricKeys: ["new-users"] }])).toBe(true);
  });

  it("computes growth readiness states for launched products", () => {
    expect(
      getGrowthReadinessState({
        status: ProductStatus.LAUNCHED,
        additionalContext: null,
        selections: null,
        metricEntryCount: 0,
      }),
    ).toBe("missing_checkin");

    expect(
      getGrowthReadinessState({
        status: ProductStatus.GROWING,
        additionalContext: JSON.stringify({
          version: 1,
          legacyText: null,
          growthCheckin: { version: 1, completedAt: "2026-04-13T10:00:00.000Z", answers: {} },
        }),
        selections: [{ stage: "Activation", selectedMetricKeys: ["activation-rate"] }],
        metricEntryCount: 0,
      }),
    ).toBe("missing_baseline");

    expect(
      getGrowthReadinessState({
        status: ProductStatus.GROWING,
        additionalContext: JSON.stringify({
          version: 1,
          legacyText: null,
          growthCheckin: { version: 1, completedAt: "2026-04-13T10:00:00.000Z", answers: {} },
        }),
        selections: [{ stage: "Activation", selectedMetricKeys: ["activation-rate"] }],
        metricEntryCount: 1,
      }),
    ).toBe("missing_baseline");

    expect(
      getGrowthReadinessState({
        status: ProductStatus.GROWING,
        additionalContext: JSON.stringify({
          version: 1,
          legacyText: null,
          growthCheckin: { version: 1, completedAt: "2026-04-13T10:00:00.000Z", answers: {} },
        }),
        selections: [{ stage: "Activation", selectedMetricKeys: ["activation-rate"] }],
        metricEntryCount: 5,
      }),
    ).toBe("diagnosis_ready");
  });

  it("formats stage summaries for user rows", () => {
    expect(formatStageSummary({ PRE_LAUNCH: 1, GROWING: 2 }, "en")).toBe("1 pre-launch · 2 growing");
    expect(formatStageSummary({}, "tr")).toBe("Ürün yok");
  });
});
