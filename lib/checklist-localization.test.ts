import { describe, expect, it } from "vitest";
import { localizeChecklistContent } from "@/lib/checklist-localization";

describe("localizeChecklistContent", () => {
  it("translates known fallback launch checklist content to Turkish", () => {
    const result = localizeChecklistContent(
      {
        title: "Run one last pass on launch-breaking bugs",
        description: [
          "Why: If the core flow breaks on launch day, early users will not come back.",
          "Done when: This is done when signup, login, first key action, and exit paths pass a final smoke test.",
          "Next action: Start by manually testing signup and the first-value flow end-to-end.",
        ].join("\n"),
      },
      "tr",
    );

    expect(result.title).toBe("Temel kullanıcı akışını kıran hataları son kez tara");
    expect(result.description).toContain("Neden:");
    expect(result.description).toContain("Biten hali:");
    expect(result.description).toContain("Sonraki adım:");
    expect(result.description).toContain("Launch günü temel akış kırılırsa");
  });

  it("keeps unknown content unchanged", () => {
    const result = localizeChecklistContent(
      {
        title: "Custom launch item",
        description: "Why: Something custom\nDone when: Something is done\nNext action: Start somewhere",
      },
      "tr",
    );

    expect(result.title).toBe("Custom launch item");
    expect(result.whyItMatters).toBe("Something custom");
  });
});
