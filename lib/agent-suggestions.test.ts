import { describe, expect, it } from "vitest";
import { buildDeterministicSuggestionFallback } from "@/lib/agent-suggestions";

describe("buildDeterministicSuggestionFallback", () => {
  it("uses the real launch blocker title instead of a generic launch placeholder", () => {
    const suggestions = buildDeterministicSuggestionFallback({
      agentType: "launch",
      locale: "en",
      product: {
        id: "prod_1",
        name: "Bakkal Amca",
        status: "PRE_LAUNCH",
        description: "A marketplace for local grocery delivery.",
        category: "Marketplace",
        businessModel: "Commission",
        targetAudience: "Busy families",
        launchGoals: JSON.stringify({ goalKey: "get_first_users" }),
      },
      contextSummary: "{}",
      contextData: {
        high_priority_blockers: ["Clarify the first-value promise on the landing page"],
      },
      openTasks: [],
      checklistItems: [
        {
          id: "chk_1",
          title: "Clarify the first-value promise on the landing page",
          category: "PRODUCT",
          completed: false,
          priority: "HIGH",
        },
      ],
    });

    expect(suggestions[0]?.title).toBe("Clarify the first-value promise on the landing page");
    expect(suggestions.some((item) => /advance launch items/i.test(item.title))).toBe(false);
  });

  it("keeps growth fallback metric-led when setup is missing", () => {
    const suggestions = buildDeterministicSuggestionFallback({
      agentType: "growth",
      locale: "en",
      product: {
        id: "prod_2",
        name: "FitBuddy",
        status: "LAUNCHED",
        description: "A mobile fitness app.",
        category: "Mobile",
        businessModel: "Subscription",
        targetAudience: "Consumers",
        launchGoals: JSON.stringify({ goalKey: "build_growth_rhythm" }),
      },
      contextSummary: "{}",
      contextData: {
        metric_setup: { has_setup: false },
        data_entries_last_14_days: 0,
      },
      openTasks: [],
      checklistItems: [],
    });

    expect(suggestions.some((item) => item.category === "MEASUREMENT")).toBe(true);
    expect(suggestions.some((item) => /launch/i.test(item.title))).toBe(false);
  });

  it("marks suggestions that already exist on the board", () => {
    const suggestions = buildDeterministicSuggestionFallback({
      agentType: "overview",
      locale: "en",
      product: {
        id: "prod_3",
        name: "SignalPad",
        status: "GROWING",
        description: "A product analytics workspace.",
        category: "SaaS",
        businessModel: "Subscription",
        targetAudience: "Product teams",
        launchGoals: null,
      },
      contextSummary: "{}",
      contextData: {
        tasks: { done: 0 },
        metric_setup: { has_setup: true },
      },
      openTasks: [
        {
          id: "task_1",
          title: "Finish one small task this week to unlock momentum for SignalPad",
          status: "TODO",
          priority: "MEDIUM",
          category: "PRODUCT",
        },
      ],
      checklistItems: [],
    });

    const duplicate = suggestions.find((item) => item.existingTaskId === "task_1");
    expect(duplicate).toBeTruthy();
    expect(duplicate?.existingTaskTitle).toContain("unlock momentum");
  });
});
