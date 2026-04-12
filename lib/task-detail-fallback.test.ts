import { describe, expect, it } from "vitest";
import { buildTaskDetailFallback } from "@/lib/task-detail-fallback";

describe("buildTaskDetailFallback", () => {
  it("creates task-specific english fallback copy", () => {
    const detail = buildTaskDetailFallback({
      title: "Finalize store screenshots",
      category: "MARKETING",
      linkedChecklistTitle: "Prepare store visuals",
      locale: "en",
    });

    expect(detail.why).toContain("Finalize store screenshots");
    expect(detail.why).toContain("Prepare store visuals");
    expect(detail.doneCriteria).toContain("finalize store screenshots");
    expect(detail.nextAction).toContain("Finalize store screenshots");
  });

  it("creates localized turkish fallback copy", () => {
    const detail = buildTaskDetailFallback({
      title: "Store görsellerini bitir",
      category: "MARKETING",
      locale: "tr",
    });

    expect(detail.why).toContain("Store görsellerini bitir");
    expect(detail.doneCriteria).toContain("launch");
    expect(detail.nextAction).toContain("tek bir sorumlu");
  });
});
