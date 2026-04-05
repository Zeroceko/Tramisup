import { describe, expect, it } from "vitest";
import {
  normalizeLaunchChecklistPriority,
  shouldStayHighPriority,
} from "@/lib/launch-checklist-priority";

describe("launch checklist priority normalization", () => {
  it("keeps legal compliance items as HIGH", () => {
    const item = {
      title: "KVKK ve privacy policy eksik",
      description: "Launch öncesi zorunlu compliance maddelerini tamamla.",
      category: "LEGAL",
      priority: "HIGH",
    };

    expect(shouldStayHighPriority(item)).toBe(true);
    expect(normalizeLaunchChecklistPriority(item)).toBe("HIGH");
  });

  it("downgrades generic UX improvements from HIGH to MEDIUM", () => {
    const item = {
      title: "Dashboard'ta üçlü adımı göster",
      description: "Overview hero düzenini daha anlaşılır yap.",
      category: "PRODUCT",
      priority: "HIGH",
    };

    expect(shouldStayHighPriority(item)).toBe(false);
    expect(normalizeLaunchChecklistPriority(item)).toBe("MEDIUM");
  });
});

