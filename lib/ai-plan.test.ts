import { describe, expect, it } from "vitest";
import { buildSkillBackedFallbackPlan, sanitizeAiPlanOutput } from "@/lib/ai-plan";

function makeLaunchItem(index: number) {
  return {
    category: "PRODUCT",
    title: `Komşu Kahve launch maddesi ${index}`,
    description: `Komşu Kahve için launch hazırlık maddesi ${index}.`,
    whyItMatters: `Komşu Kahve müşterilerinin ilk deneyimini korumak için ${index} önemli.`,
    doneCriteria: `Kurucu ${index} maddesini tamamladığında ekran ve süreç güncel olur.`,
    nextAction: `Kurucu bugün ${index} maddesi için ilk somut adımı atsın.`,
    priority: "MEDIUM",
  };
}

function makeGrowthItem(index: number) {
  return {
    category: "ACQUISITION",
    title: `Komşu Kahve growth odağı ${index}`,
    description: `Komşu Kahve için growth maddesi ${index}.`,
    whyItMatters: `Komşu Kahve için edinim sinyalini netleştirmek adına ${index} gerekli.`,
    doneCriteria: `Kurucu ${index} maddesi için tek bir ölçüm ve kanal seçmiş olur.`,
    nextAction: `Kurucu bugün ${index} maddesiyle ilgili ilk testi planlasın.`,
  };
}

function makeTask(index: number) {
  return {
    title: `Komşu Kahve görev başlığı ${index}`,
    description: `Komşu Kahve görevi ${index}.`,
    whyItMatters: `Komşu Kahve için bu görev ${index} gerçek kullanıcı sinyali toplar.`,
    doneCriteria: `Kurucu görev ${index} için ölçülebilir çıktıyı üretmiş olur.`,
    nextAction: `Kurucu bugün görev ${index} için ilk görüşmeyi veya kurulumu yapsın.`,
    category: "MEASUREMENT",
    priority: "MEDIUM",
    status: "TODO",
  };
}

describe("sanitizeAiPlanOutput", () => {
  it("caps and dedupes pre-launch output before seeding", () => {
    const raw = {
      launchChecklist: [
        ...Array.from({ length: 20 }, (_, index) => makeLaunchItem(index + 1)),
        makeLaunchItem(1),
      ],
      growthChecklist: Array.from({ length: 18 }, (_, index) => makeGrowthItem(index + 1)),
      tasks: [
        ...Array.from({ length: 10 }, (_, index) => makeTask(index + 1)),
        makeTask(1),
      ],
    };

    const plan = sanitizeAiPlanOutput(raw, "tr", false);
    expect(plan).not.toBeNull();
    expect(plan?.launchChecklist).toHaveLength(15);
    expect(plan?.growthChecklist).toHaveLength(15);
    expect(plan?.tasks).toHaveLength(8);
    expect(new Set(plan?.tasks.map((task) => task.title)).size).toBe(plan?.tasks.length);
  });

  it("never keeps launch checklist items for launched products", () => {
    const raw = {
      launchChecklist: Array.from({ length: 8 }, (_, index) => makeLaunchItem(index + 1)),
      growthChecklist: Array.from({ length: 6 }, (_, index) => makeGrowthItem(index + 1)),
      tasks: Array.from({ length: 6 }, (_, index) => makeTask(index + 1)),
    };

    const plan = sanitizeAiPlanOutput(raw, "tr", true);
    expect(plan).not.toBeNull();
    expect(plan?.launchChecklist).toHaveLength(0);
    expect(plan?.growthChecklist).toHaveLength(6);
    expect(plan?.tasks).toHaveLength(4);
    expect(plan?.tasks[0]?.title).toBe(plan?.growthChecklist[0]?.title);
  });
});

describe("buildSkillBackedFallbackPlan", () => {
  it("creates a non-trivial Turkish pre-launch fallback plan", () => {
    const plan = buildSkillBackedFallbackPlan({
      locale: "tr",
      name: "MasaPulse",
      description: "Mahalle restoranlari icin rezervasyon ve masa doluluk yazilimi.",
      targetAudience: "KOBİ'ler",
      launchStatus: "Yakında yayında",
    });

    expect(plan.launchChecklist).toHaveLength(5);
    expect(plan.growthChecklist).toHaveLength(4);
    expect(plan.tasks).toHaveLength(5);
    expect(plan.launchChecklist.map((item) => item.category)).toEqual([
      "PRODUCT",
      "MARKETING",
      "TECH",
      "LEGAL",
      "PRODUCT",
    ]);
    expect(plan.launchChecklist[0]?.title).toContain("İlk değer");
    expect(plan.launchChecklist.every((item) => typeof item.whyItMatters === "string" && item.whyItMatters.length > 10)).toBe(true);
  });

  it("avoids injecting noisy mixed-locale audience text into English fallback copy", () => {
    const plan = buildSkillBackedFallbackPlan({
      locale: "en",
      name: "StackSignal",
      description: "Async standup replacement for remote engineering teams.",
      targetAudience: "Startup ekipleri, KOBİ'ler",
      launchStatus: "PREPARING",
    });

    expect(plan.launchChecklist[0]?.description).toContain("new users");
    expect(plan.launchChecklist[0]?.description).not.toContain("Startup ekipleri");
    expect(plan.launchChecklist[0]?.whyItMatters).toContain("new users");
  });

  it("avoids injecting single-value Turkish audience text into English fallback copy", () => {
    const plan = buildSkillBackedFallbackPlan({
      locale: "en",
      name: "StackSignal",
      description: "Async standup replacement for remote engineering teams.",
      targetAudience: "Startup ekipleri",
      launchStatus: "PREPARING",
    });

    expect(plan.launchChecklist[0]?.description).toContain("new users");
    expect(plan.launchChecklist[0]?.description).not.toContain("Startup ekipleri");
    expect(plan.launchChecklist[0]?.whyItMatters).toContain("new users");
  });
});
