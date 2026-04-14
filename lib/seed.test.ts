import { describe, expect, it } from "vitest";
import { filterSeedItemsAgainstExisting } from "@/lib/seed";

describe("filterSeedItemsAgainstExisting", () => {
  it("skips seed items that are near-duplicates of existing items", () => {
    const result = filterSeedItemsAgainstExisting(
      [
        { title: "Set up GA4 tracking" },
        { title: "Write onboarding email copy" },
      ],
      ["GA4 tracking set up"],
      10,
    );

    expect(result).toEqual([{ title: "Write onboarding email copy" }]);
  });

  it("dedupes within the incoming batch while preserving novel items", () => {
    const result = filterSeedItemsAgainstExisting(
      [
        { title: "Prepare launch FAQ" },
        { title: "Prepare FAQ for launch" },
        { title: "Book 5 founder interviews" },
      ],
      [],
      10,
    );

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.title)).toContain("Prepare launch FAQ");
    expect(result.map((item) => item.title)).toContain("Book 5 founder interviews");
  });
});
