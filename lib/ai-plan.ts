import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LaunchCategory, GrowthCategory, Priority, TaskStatus } from "@prisma/client";

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
};

const PROMPT = (input: WizardInput) => `Sen deneyimli bir startup danışmanısın. Bir kurucunun ürününü analiz edip onun için önceliklendirilmiş bir eylem planı hazırlıyorsun.

ÜRÜN BİLGİLERİ:
- Ad: ${input.name}
- Açıklama: ${input.description}
- Kategori: ${input.category || "SaaS"}
- Hedef kitle: ${input.targetAudience || "belirtilmemiş"}
- İş modeli: ${input.businessModel || "belirtilmemiş"}
- Mevcut aşama: ${input.launchStatus || "belirtilmemiş"}

GÖREVIN:
Bu ürünü analiz et ve gerçekten yapılması gerekenleri belirle. Kullanıcıya sormak yerine SEN karar ver:
- Bu aşamada en kritik launch engelleri neler?
- Hangi growth kanalları bu kategori ve iş modeli için en mantıklı?
- Bu hedef kitleye ulaşmak için ne yapılmalı?
- Bu iş modelini büyütmek için hangi aktivasyon ve retansiyon adımları gerekli?

AŞAMA BAZLI DÜŞÜN:
${input.launchStatus === "Fikir aşamasında" ? "Henüz ürün yok. Önce validasyon ve MVP. Pazarlama değil, önce var ol." : ""}
${input.launchStatus === "Geliştirme aşamasında" ? "Ürün yapılıyor. Beta kullanıcılar bul, erken feedback topla, launch hazırlığı yap." : ""}
${input.launchStatus === "Beta'da" ? "Ürün var, kullanıcılar var. Feedback'i ürüne yansıt, launch için hazırlan, ilk ödeme yapan müşterileri bul." : ""}
${input.launchStatus === "Yakında launch" ? "Launch çok yakın. Pazarlama altyapısını kur, launch kampanyasını hazırla, ilk kullanıcı kitlesini oluştur." : ""}
${input.launchStatus === "Launch oldu" ? "Ürün canlıda. Müşteri edinme ve aktivasyona odaklan, churn'ü takip et, growth kanallarını test et." : ""}
${input.launchStatus === "Büyüme aşamasında" ? "Büyüme fazı. Ölçeklendirilebilir growth kanallarına odaklan, retansiyon ve geliri optimize et." : ""}

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
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasDeepSeek && !hasGemini) {
    console.warn("[ai-plan] No AI API key configured — using static fallback");
    return null;
  }

  // Try DeepSeek first, fallback to Gemini
  if (hasDeepSeek) {
    try {
      const plan = await tryDeepSeek(input);
      console.log("[ai-plan] Generated via DeepSeek");
      return plan;
    } catch (err) {
      console.warn("[ai-plan] DeepSeek failed, trying Gemini:", (err as Error).message);
    }
  }

  if (hasGemini) {
    try {
      const plan = await tryGemini(input);
      console.log("[ai-plan] Generated via Gemini (fallback)");
      return plan;
    } catch (err) {
      console.error("[ai-plan] Gemini fallback also failed:", (err as Error).message);
    }
  }

  return null;
}
