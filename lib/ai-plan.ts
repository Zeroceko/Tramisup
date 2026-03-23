import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
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
  const shouldLoadAso = shouldLoadAppStore || shouldLoadPlayStore;

  const parts: string[] = [];
  if (shouldLoadAso) {
    const skill = await loadProjectSkill("aso-advisor");
    parts.push(`ASO ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  if (!isLaunched && shouldLoadAppStore) {
    const skill = await loadProjectSkill("app-store-submission-advisor");
    parts.push(`APP STORE SUBMISSION ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  if (!isLaunched && shouldLoadPlayStore) {
    const skill = await loadProjectSkill("play-store-submission-advisor");
    parts.push(`PLAY STORE SUBMISSION ADVISOR\n${extractGuidanceSection(skill)}`);
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

const PROMPT = (input: WizardInput) => `Sen Tiramisup içindeki Founder Coach'sun. Bir kurucunun ürün bağlamını okuyup onun için gerçekten işe yarayacak ilk çalışma sistemini kuruyorsun.

ÜRÜN BİLGİLERİ:
- Ad: ${input.name}
- Açıklama: ${input.description}
- Kategori: ${input.category || "SaaS"}
- Hedef kitle: ${input.targetAudience || "belirtilmemiş"}
- İş modeli: ${input.businessModel || "belirtilmemiş"}
- Mevcut aşama: ${input.launchStatus || "belirtilmemiş"}
${input.stageContext ? `- Aşama detayları: ${input.stageContext}` : ""}
${input.storeGuidance ? `\nSTORE-GUIDANCE:\n${input.storeGuidance}\n\n${["Yayında", "Büyüme aşamasında"].includes(input.launchStatus || "") ? "Bu store rehberini submission checklist gibi degil, listing kalitesi, ASO ve buyume sinyali olarak yorumla." : "Bu store rehberini launch checklist ve gorevlerde acik, kullaniciya donuk maddelere donustur."}` : ""}
${input.websiteContent ? `\nBAGLANTI ICERIGI:\n${input.websiteContent}\n\nVerilen linklerdeki urun veya store metinlerini plana dahil et. Ozellikle yayindaki urunlerde listing vaadi ile growth onceliklerini eslestir.` : ""}

GÖREVİN:
Bu ürün için kurucunun ilk gerçek çalışma sistemini kur:
- Launch öncesi ise: kurucunun kritik checklistlerini ve bu haftaki görevlerini oluştur.
- Launch olduysa veya büyüme aşamasındaysa: growth hazırlığını kur, özellikle acquisition / activation / retention / revenue tarafında neyin önce ölçülmesi gerektiğini netleştir.
- Yayindaki mobil urunlerde App Store / Play Store submission checklist'i yazma. Bunun yerine listing kalitesi, ASO, screenshot hikayesi, rating/review sinyali ve store-page message match odagina gec.
- Kullanıcıya soru sorma. Mevcut bağlama göre karar ver.

AŞAMA BAZLI DÜŞÜN:
${input.launchStatus === "Geliştirme aşamasında" ? "Ürün yapılıyor. Beta/test kullanıcılarını bul, erken feedback topla, launch hazırlığını başlat." : ""}
${input.launchStatus === "Test kullanıcıları var" ? "Ürün test ediliyor. Feedback'i ürüne yansıt, onboarding sürtünmesini azalt, yayına hazırlık yap." : ""}
${input.launchStatus === "Yakında yayında" ? "Yayın çok yakın. Pazarlama altyapısını kur, yayın kampanyasını hazırla, ilk kullanıcı kitlesini oluştur." : ""}
${input.launchStatus === "Yayında" ? "Ürün canlıda. Müşteri edinme, aktivasyon ve ilk gelir sinyallerine odaklan." : ""}
${input.launchStatus === "Büyüme aşamasında" ? "Büyüme fazı. Ölçeklenebilir growth kanalları, retention ve gelir optimizasyonu öncelikli." : ""}

GROWTH CHECKLIST YAZARKEN:
- Acquisition: kullanıcı edinimi için ilk somut denemeleri yaz
- Activation: ilk değerli aksiyonu ve onboarding kalitesini düşün
- Retention: geri dönme ve kullanım devamlılığını düşün
- Revenue: ücretli dönüşüm ve recurring gelir mantığını düşün
- Maddeler soyut olmasın; kurucunun gerçekten uygulayabileceği eylemler yaz

Türkçe yaz. Gerçekten bu ürüne özgü şeyler söyle — "${input.name}" adını kullan. Generic tavsiye verme.

SADECE geçerli JSON döndür:

{
  "launchChecklist": [
    {
      "category": "PRODUCT" | "MARKETING" | "LEGAL" | "TECH",
      "title": "maks 65 karakter, spesifik ve aksiyonable",
      "description": "neden önemli, 1-2 cümle",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "order": 1
    }
  ],
  "growthChecklist": [
    {
      "category": "ACQUISITION" | "ACTIVATION" | "RETENTION" | "REVENUE",
      "title": "maks 65 karakter, spesifik ve aksiyonable",
      "description": "neden önemli, 1-2 cümle",
      "order": 1
    }
  ],
  "tasks": [
    {
      "title": "maks 65 karakter, bu hafta yapılacak",
      "description": "tam olarak ne yapılacak",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "status": "TODO" | "IN_PROGRESS"
    }
  ]
}

Kurallar:
- launchChecklist: 10-14 madde. PRODUCT, MARKETING, LEGAL, TECH dengeli dağıtım
- growthChecklist: 8-12 madde. ACQUISITION, ACTIVATION, RETENTION, REVENUE dengeli dağıtım
- tasks: 4-6 madde. Bu hafta başlanabilecek, spesifik işler
- Her madde "${input.name}" ürününe ve "${input.targetAudience}" kitlesine özgü olsun`;

function parsePlan(text: string): AiPlan {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const plan: AiPlan = JSON.parse(cleaned);
  if (!plan.launchChecklist || !plan.growthChecklist || !plan.tasks) {
    throw new Error("Invalid plan structure");
  }
  return plan;
}

const QWEN_BASE_URL = "https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getQwenErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isQwenLimitError(error: unknown) {
  const message = getQwenErrorMessage(error).toLowerCase();
  return (
    /\b429\b/.test(message) ||
    /limit/.test(message) ||
    /quota/.test(message) ||
    /rate/.test(message) ||
    /insufficient balance/.test(message)
  );
}

function isRetryableQwenError(error: unknown) {
  const message = getQwenErrorMessage(error);
  return /\b(429|500|502|503|504)\b/.test(message) || /system error/i.test(message);
}

async function tryQwen(input: WizardInput): Promise<AiPlan> {
  const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: QWEN_BASE_URL,
  });

  let lastError: unknown;
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [{ role: "user", content: PROMPT(input) }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      return parsePlan(response.choices[0]?.message?.content || "{}");
    } catch (error) {
      lastError = error;
      if (isQwenLimitError(error)) {
        throw error;
      }

      if (!isRetryableQwenError(error) || attempt === maxAttempts) {
        throw error;
      }

      await wait(Math.min(2500, 500 * attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Qwen request failed");
}

async function tryDeepSeek(input: WizardInput): Promise<AiPlan> {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: PROMPT(input) }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return parsePlan(response.choices[0]?.message?.content || "{}");
}

async function tryGemini(input: WizardInput): Promise<AiPlan> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(PROMPT(input));
  return parsePlan(result.response.text());
}

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const hasQwen = !!process.env.QWEN_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasQwen && !hasDeepSeek && !hasGemini) {
    console.warn("[ai-plan] No AI API key configured — using static fallback");
    return null;
  }

  const storeGuidance = await loadStoreGuidance(input);
  const launchGuidance = await loadLaunchAndAnalyticsGuidance(input);

  if (hasQwen) {
    try {
      const plan = await tryQwen({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via Qwen");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.warn("[ai-plan] Qwen failed, trying DeepSeek:", (err as Error).message);
    }
  }

  if (hasDeepSeek) {
    try {
      const plan = await tryDeepSeek({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via DeepSeek");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.warn("[ai-plan] DeepSeek failed, trying Gemini:", (err as Error).message);
    }
  }

  if (hasGemini) {
    try {
      const plan = await tryGemini({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via Gemini (fallback)");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.error("[ai-plan] Gemini fallback also failed:", (err as Error).message);
    }
  }

  return null;
}
