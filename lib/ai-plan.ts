import { generateObject } from "ai";
import { z } from "zod";
import { defaultModel } from "../BrandLib/ai-client";
import type { LaunchCategory, GrowthCategory, Priority, TaskStatus } from "@prisma/client";
import { loadProjectSkill } from "@/lib/project-skill-loader";
import { mergeMobileLaunchBaseline } from "@/lib/mobile-launch-baseline";

export type AiLaunchItem = {
  category: LaunchCategory;
  title: string;
  description?: string;
  priority: Priority;
  order: number;
};

export type AiGrowthItem = {
  category: GrowthCategory;
  title: string;
  description?: string;
  order: number;
};

export type AiTask = {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
};

export type AiPlan = {
  launchChecklist: AiLaunchItem[];
  growthChecklist: AiGrowthItem[];
  tasks: AiTask[];
};

export type WizardInput = {
  name: string;
  description: string;
  category?: string;
  targetAudience?: string;
  businessModel?: string;
  launchStatus?: string;
  website?: string;
  mobilePlatforms?: string[];
  websiteContent?: string;
  stageContext?: string;
  storeGuidance?: string;
};

const PlanSchema = z.object({
  launchChecklist: z.array(
    z.object({
      category: z.enum(["PRODUCT", "MARKETING", "LEGAL", "TECH"]),
      title: z.string().max(80),
      description: z.string(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
    })
  ).min(5).max(15),
  growthChecklist: z.array(
    z.object({
      category: z.enum(["ACQUISITION", "ACTIVATION", "RETENTION", "REVENUE"]),
      title: z.string().max(80),
      description: z.string(),
    })
  ).min(4).max(15),
  tasks: z.array(
    z.object({
      title: z.string().max(80),
      description: z.string(),
      priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
      status: z.enum(["TODO"]),
    })
  ).min(3).max(8)
});

function inferContext(input: WizardInput) {
  const launchStage = (input.launchStatus ?? "").toLowerCase();
  const isLaunched = ["yayında", "büyüme aşamasında"].includes(launchStage);
  const platforms = Array.from(new Set(input.mobilePlatforms ?? []));
  const haystack = `${input.category ?? ""} ${input.targetAudience ?? ""} ${input.businessModel ?? ""} ${input.description ?? ""} ${input.websiteContent ?? ""}`.toLowerCase();

  return {
    launchStage,
    isLaunched,
    isMobile: platforms.length > 0 || /mobil uygulama|mobile app|app store|play store|ios|android/.test(haystack),
    platforms,
    isB2B: /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(haystack),
    isContent: /content|newsletter|media|community|creator|blog/.test(haystack),
    isSubscription: /subscription|abonelik|recurring|monthly|yearly|trial|freemium|paywall/.test(haystack),
  };
}

function makeLaunchItem(category: LaunchCategory, title: string, description: string, priority: Priority): AiLaunchItem {
  return { category, title, description, priority, order: 0 };
}
function makeGrowthItem(category: GrowthCategory, title: string, description: string): AiGrowthItem {
  return { category, title, description, order: 0 };
}
function assignOrder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}
function dedupeByTitle<T extends { title: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSkillBackedFallbackPlan(input: WizardInput): AiPlan {
  const context = inferContext(input);
  const productName = input.name;
  const audience = input.targetAudience || "hedef kitlen";
  const launchChecklist: AiLaunchItem[] = [];
  const growthChecklist: AiGrowthItem[] = [];

  if (context.isLaunched) {
    launchChecklist.push(
      makeLaunchItem("MARKETING", "Store veya landing mesajini gercek degerle hizala", `${productName} icin ilk gorulen mesaj ile gercek deneyim arasinda kopukluk varsa acquisition kalitesi dusurur.`, "HIGH"),
      makeLaunchItem("PRODUCT", "Ilk deger anina giden akis kopuslerini not et", `${audience} urunu gordukten sonra ilk faydali aksiyona ne kadar rahat gidiyor, gozden gecir.`, "HIGH")
    );
  } else {
    launchChecklist.push(
      makeLaunchItem("PRODUCT", "Ilk deger anini launch oncesi netlestir", `${productName} yayina ciktiginda ${audience} hangi ilk aksiyonla deger gordugunu anlamali.`, "HIGH"),
      makeLaunchItem("MARKETING", "Launch gunu mesajini ve dagitim planini hazirla", `Ilk trafik dalgasi geldigi anda hangi kanalda ne soylenecegi net olmali.`, "HIGH")
    );
  }

  growthChecklist.push(
    makeGrowthItem("ACQUISITION", "Ilk trafik veya install kaynagini netlestir", `Yeni kullanicilarin hangi kanaldan geldigini ayirmadan growth karari bulanir.`),
    makeGrowthItem("ACTIVATION", "Ilk deger aksiyonunu tek metrikte sabitle", `${productName} icin aha moment noktasini tek sayiyla izle.`),
    makeGrowthItem("RETENTION", "Geri donen kullanici ritmini olc", `Ilk haftada tekrar gelen kullanici davranisi urunun kaliciligini gosterir.`),
    makeGrowthItem("REVENUE", "Ucretliye gecis veya gelir ritmini izle", `Gelir davranisi acquisition kadar net okunmali.`)
  );

  const dedupedLaunch = dedupeByTitle(launchChecklist).slice(0, 12);
  const dedupedGrowth = dedupeByTitle(growthChecklist).slice(0, 8);
  const tasks = dedupeByTitle([
    ...dedupedLaunch.slice(0, 2).map<AiTask>((item) => ({ title: item.title, description: item.description, priority: item.priority, status: "TODO" })),
    ...dedupedGrowth.slice(0, 3).map<AiTask>((item, index) => ({ title: item.title, description: item.description, priority: index === 0 ? "HIGH" : "MEDIUM", status: "TODO" })),
  ]).slice(0, 5);

  return {
    launchChecklist: assignOrder(dedupedLaunch),
    growthChecklist: assignOrder(dedupedGrowth),
    tasks,
  };
}

function extractGuidanceSection(skill: string) {
  const lines = skill.split("\n");
  const start = lines.findIndex((line) => line.trim() === "## Required Recommendation Areas");
  const end = lines.findIndex((line) => line.trim() === "## Output Style");
  if (start === -1) return skill;
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

async function loadStoreGuidance(input: WizardInput) {
  const category = (input.category ?? "").toLowerCase();
  const platforms = input.mobilePlatforms ?? [];
  const stage = (input.launchStatus ?? "").toLowerCase();
  const isLaunched = ["yayında", "büyüme aşamasında"].includes(stage);
  const shouldLoadAppStore = platforms.includes("iOS") || /mobil uygulama|mobile app|ios|apple|app store/.test(category);
  const shouldLoadPlayStore = platforms.includes("Android") || /mobil uygulama|mobile app|android|google play|play store/.test(category);
  
  const parts: string[] = [];
  if (shouldLoadAppStore || shouldLoadPlayStore) {
    const skill = await loadProjectSkill("aso-advisor");
    parts.push(`ASO ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  return parts.join("\n\n---\n\n");
}

async function loadLaunchAndAnalyticsGuidance(input: WizardInput) {
  const stage = (input.launchStatus ?? "").toLowerCase();
  const parts: string[] = [];

  if (!["yayında", "büyüme aşamasında"].includes(stage)) {
    const skill = await loadProjectSkill("launch-readiness-advisor");
    parts.push(`LAUNCH READINESS ADVISOR\n${extractGuidanceSection(skill)}`);
  }

  if (["yayında", "büyüme aşamasında"].includes(stage)) {
    const skill = await loadProjectSkill("analytics-instrumentation-advisor");
    parts.push(`ANALYTICS INSTRUMENTATION ADVISOR\n${extractGuidanceSection(skill)}`);
  }

  return parts.join("\n\n---\n\n");
}

const PROMPT = (input: WizardInput) => `Sen Tiramisup içindeki Founder Coach ve Planlama Ajanısın. Bir kurucunun ürün bağlamını okuyup onun için tamamen o ürüne ÖZEL ilk çalışma sistemini, checklistini ve görevlerini yaratıyorsun.

ÜRÜN BİLGİLERİ:
- Ad: ${input.name}
- Açıklama: ${input.description}
- Kategori: ${input.category || "SaaS"}
- Hedef kitle: ${input.targetAudience || "belirtilmemiş"}
- İş modeli: ${input.businessModel || "belirtilmemiş"}
- Mevcut aşama: ${input.launchStatus || "belirtilmemiş"}
${input.stageContext ? `- Aşama detayları: ${input.stageContext}` : ""}
${input.storeGuidance ? `\nSTORE-GUIDANCE:\n${input.storeGuidance}\n` : ""}
${input.websiteContent ? `\n🔥 CRITICAL - FOUNDER'S WEBSITE CONTENT:\n${input.websiteContent}\n(IMPORTANT: Analyze this text. Read what problem the product actually solves and its features. Formulate all task and checklist items STRICTLY by referring to this content, the product's features, and promises!)\n` : ""}

GÖREVİN:
Bu ürün için kurucunun ilk gerçek çalışma sistemini kur:
- Launch öncesi ise: Kurucunun kritik launch checklistlerini ve bu haftaki teknik görevlerini oluştur.
- Launch olduysa veya büyüme aşamasındaysa: Growth hazırlığını kur, AARRR hunisindeki her metrik ölçülebilir olsun.

ÖZEL KURAL: Asla ezber veya jenerik (her projeye uyan) maddeler yazma. Mutlaka web sitedeki özelliklere atıf yap.
DİL KURALI (ÖNEMLİ): Çıktıyı SADECE TÜRKÇE ver. Ancak kusursuz ve profesyonel Türkçe karakterler (ç, ş, ğ, ı, ö, ü) kullan. Asla bozuk (İngilizce karakterli) Türkçe kullanma. "${input.name}" adını sıkça geçir.`;

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const hasKey = !!process.env.OPENAI_API_KEY || !!process.env.QWEN_API_KEY || !!process.env.DEEPSEEK_API_KEY || !!process.env.GEMINI_API_KEY;

  if (!hasKey) {
    console.warn("[ai-plan] No AI API key configured — using static fallback");
    return null;
  }

  const storeGuidance = await loadStoreGuidance(input);
  const launchGuidance = await loadLaunchAndAnalyticsGuidance(input);

  const finalInput = {
    ...input,
    storeGuidance,
    stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
  };

  try {
    const { object } = await generateObject({
      model: defaultModel,
      schema: PlanSchema,
      prompt: PROMPT(finalInput),
      temperature: 0.7,
    });

    const orderedLaunch = assignOrder(dedupeByTitle(object.launchChecklist as AiLaunchItem[]));
    const orderedGrowth = assignOrder(dedupeByTitle(object.growthChecklist as AiGrowthItem[]));

    console.log("[ai-plan] Generated structured Checklist via Vercel AI SDK");
    const aiGeneratedPlan: AiPlan = {
      launchChecklist: orderedLaunch,
      growthChecklist: orderedGrowth,
      tasks: dedupeByTitle(object.tasks as AiTask[]),
    };
    return mergeMobileLaunchBaseline(aiGeneratedPlan, finalInput);
  } catch (error) {
    console.error("[ai-plan] AI SDK generation failed, using static fallback plan:", error);
    return mergeMobileLaunchBaseline(buildSkillBackedFallbackPlan(finalInput), finalInput);
  }
}
