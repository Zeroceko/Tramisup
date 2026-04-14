import { describe, expect, it } from "vitest";
import { buildDeterministicSuggestionFallback } from "@/lib/agent-suggestions";

describe("buildDeterministicSuggestionFallback", () => {
  it("keeps overview suggestions non-empty for launched products with setup but no data", () => {
    const suggestions = buildDeterministicSuggestionFallback({
      agentType: "overview",
      locale: "en",
      product: {
        id: "product_1",
        name: "Komsu Kahve",
        status: "LAUNCHED",
        description: "Coffee preorder workflow for neighborhood cafes.",
        category: "SaaS",
        businessModel: "Subscription",
        targetAudience: "SMBs",
        launchGoals: JSON.stringify({ goalKey: "build_growth_rhythm" }),
      },
      contextSummary: "{}",
      contextData: {
        tasks: { total: 0, done: 0, in_progress: 0, high_priority_open: 0 },
        metric_setup: {
          has_setup: true,
          selected_metrics: ["website-visits", "visitor-to-signup"],
        },
        data_entries_last_7_days: 0,
      },
      openTasks: [],
      checklistItems: [],
    });

    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((item) => /baseline/i.test(item.title))).toBe(true);
  });

  it("suggests a numeric target once launched products have real data", () => {
    const suggestions = buildDeterministicSuggestionFallback({
      agentType: "overview",
      locale: "en",
      product: {
        id: "product_2",
        name: "Komsu Kahve",
        status: "GROWING",
        description: "Coffee preorder workflow for neighborhood cafes.",
        category: "SaaS",
        businessModel: "Subscription",
        targetAudience: "SMBs",
        launchGoals: JSON.stringify({ goalKey: "build_growth_rhythm" }),
      },
      contextSummary: "{}",
      contextData: {
        tasks: { total: 0, done: 0, in_progress: 0, high_priority_open: 0 },
        metric_setup: {
          has_setup: true,
          selected_metrics: ["website-visits", "visitor-to-signup"],
        },
        data_entries_last_7_days: 3,
      },
      openTasks: [],
      checklistItems: [],
    });

    expect(suggestions.some((item) => /target/i.test(item.title))).toBe(true);
  });
});
