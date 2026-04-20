import {
  buildMetricSelectionsFromMap,
  getOnboardingPostCreateDestination,
  hasCompleteMetricSelections,
  mergeRecommendedMetricSelections,
} from "@/lib/onboarding-growth";

describe("onboarding growth helpers", () => {
  it("fills missing selections from recommendations without overwriting chosen values", () => {
    expect(
      mergeRecommendedMetricSelections(
        {
          Awareness: "manual_choice",
          Activation: "first_session",
        },
        {
          Awareness: "recommended_awareness",
          Acquisition: "recommended_acquisition",
          Activation: "recommended_activation",
        }
      )
    ).toEqual({
      Awareness: "manual_choice",
      Acquisition: "recommended_acquisition",
      Activation: "first_session",
    });
  });

  it("requires all six stages for a complete growing setup", () => {
    expect(
      hasCompleteMetricSelections({
        Awareness: "a",
        Acquisition: "b",
      })
    ).toBe(false);

    expect(
      hasCompleteMetricSelections({
        Awareness: "a",
        Acquisition: "b",
        Activation: "c",
        Retention: "d",
        Referral: "e",
        Revenue: "f",
      })
    ).toBe(true);
  });

  it("builds metric setup payloads in canonical stage order", () => {
    expect(
      buildMetricSelectionsFromMap({
        Awareness: "sessions",
        Revenue: "mrr",
      })
    ).toEqual([
      { stage: "Awareness", selectedMetricKeys: ["sessions"] },
      { stage: "Acquisition", selectedMetricKeys: [] },
      { stage: "Activation", selectedMetricKeys: [] },
      { stage: "Retention", selectedMetricKeys: [] },
      { stage: "Referral", selectedMetricKeys: [] },
      { stage: "Revenue", selectedMetricKeys: ["mrr"] },
    ]);
  });

  it("routes growing founders to growth kickoff after onboarding", () => {
    expect(
      getOnboardingPostCreateDestination({
        locale: "tr",
        useMetrics: true,
        connectableSources: [],
        launchStatus: "GROWING",
        productId: "prod_123",
      })
    ).toBe("/tr/growth?onboarding=1");
  });

  it("preserves the integrations detour and growth return target for growing founders", () => {
    expect(
      getOnboardingPostCreateDestination({
        locale: "en",
        useMetrics: true,
        connectableSources: ["GA4", "STRIPE"],
        launchStatus: "GROWING",
        productId: "prod_123",
      })
    ).toBe(
      "/en/integrations?onboarding=1&connect=GA4&returnTo=onboarding_growth&queued=STRIPE"
    );
  });
});
