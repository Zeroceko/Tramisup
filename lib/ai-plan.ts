import OpenAI from "openai";
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

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn("[ai-plan] OPENAI_API_KEY not set — skipping AI plan");
    return null;
  }

  try {
    const client = new OpenAI({ apiKey });

    const prompt = `Sen deneyimli bir startup danışmanısın. Bir kurucunun ürününü analiz edip onun için önceliklendirilmiş bir eylem planı hazırlıyorsun.

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
- Bu iş modelini büyütmek için hangi aktivasyonu ve retansiyonu sağlamalı?

AŞAMA BAZLI DÜŞÜN:
${input.launchStatus === "Fikir aşamasında" ? "Henüz ürün yok. Önce validasyon ve MVP. Hiç pazarlama yapma, önce var ol." : ""}
${input.launchStatus === "Geliştirme aşamasında" ? "Ürün yapılıyor. Beta kullanıcılar bul, erken feedback topla, launch hazırlığı yap." : ""}
${input.launchStatus === "Beta'da" ? "Ürün var, kullanıcılar var. Feedback'i ürüne yansıt, launch için hazırlan, ilk ödeme yapan müşterileri bul." : ""}
${input.launchStatus === "Yakında launch" ? "Launch çok yakın. Pazarlama altyapısını kur, launch kampanyasını hazırla, ilk kullanıcı kitlesini oluştur." : ""}
${input.launchStatus === "Launch oldu" ? "Ürün canlıda. Müşteri edinme ve aktivasyona odaklan, churn'ü takip et, growth kanallarını test et." : ""}
${input.launchStatus === "Büyüme aşamasında" ? "Büyüme fazı. Ölçeklendirilebilir büyüme kanallarına odaklan, retansiyon ve geliri optimize et." : ""}

Türkçe yaz. Gerçekten bu ürüne özgü şeyler söyle — "${input.name}" adını ve context'i kullan. Generic tavsiye verme.

SADECE geçerli JSON döndür, hiç açıklama ekleme:

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
- launchChecklist: 10-14 madde. PRODUCT, MARKETING, LEGAL, TECH kategorilerini dengeli dağıt
- growthChecklist: 8-12 madde. ACQUISITION, ACTIVATION, RETENTION, REVENUE kategorilerini dengeli dağıt
- tasks: 4-6 madde. Bu hafta başlanabilecek, spesifik işler
- Her madde "${input.name}" ürününe ve "${input.targetAudience}" kitlesine özgü olsun
- Aşamaya göre önceliklendirme yap`;

    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const text = response.choices[0]?.message?.content || "{}";
    const plan: AiPlan = JSON.parse(text);

    if (!plan.launchChecklist || !plan.growthChecklist || !plan.tasks) {
      throw new Error("Invalid AI plan structure");
    }

    return plan;
  } catch (err) {
    console.error("[ai-plan] Generation failed:", err);
    return null;
  }
}
