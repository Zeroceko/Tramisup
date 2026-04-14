import { describe, expect, it } from "vitest";
import {
  sanitizeAgentSuggestion,
  sanitizeAgentSuggestions,
} from "@/lib/agent-suggestion-sanitize";

describe("sanitizeAgentSuggestion", () => {
  it("keeps a valid suggestion preview-safe", () => {
    const result = sanitizeAgentSuggestion({
      label: "Define the first metrics for Komşu Kahve",
      title: "Define the first metrics for Komşu Kahve",
      description: "Pick the smallest signal set.",
      whyItMatters: "This keeps the team aligned on what to measure first.",
      doneCriteria: "One metric per stage is chosen and visible.",
      nextAction: "Write down the first six metrics today.",
      category: "MEASUREMENT",
      priority: "HIGH",
      confidence: "high",
      source: "ai",
    });

    expect(result?.title).toBe("Define the first metrics for Komşu Kahve");
    expect(result?.category).toBe("MEASUREMENT");
    expect(result?.priority).toBe("HIGH");
  });

  it("drops malformed objects that do not contain a usable label", () => {
    expect(sanitizeAgentSuggestion({ foo: "bar" })).toBeNull();
  });

  it("normalizes malformed preview fields instead of passing them through", () => {
    const result = sanitizeAgentSuggestion({
      label: "Review onboarding drop-off",
      description: { bad: true },
      whyItMatters: ["not", "a", "string"],
      category: "UNKNOWN",
      priority: "URGENT",
      confidence: "VERY_HIGH",
    });

    expect(result?.description).toBeNull();
    expect(result?.whyItMatters).toBeUndefined();
    expect(result?.category).toBeUndefined();
    expect(result?.priority).toBe("MEDIUM");
    expect(result?.confidence).toBeUndefined();
  });
});

describe("sanitizeAgentSuggestions", () => {
  it("filters invalid suggestions from a list", () => {
    const result = sanitizeAgentSuggestions([
      { label: "Good suggestion" },
      { foo: "bar" },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0]?.label).toBe("Good suggestion");
  });
});
