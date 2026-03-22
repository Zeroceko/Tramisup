import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

export type WeeklyAdvice = {
  focus: string;        // one-sentence this week's focus
  actions: {
    title: string;      // max 60 chars, specific action
    why: string;        // why this matters now, 1 sentence
    priority: "high" | "medium";
  }[];
  encouragement: string; // 1 sentence motivational based on progress
};

export type ProductContext = {
  name: string;
  launchStatus: string;     // "Fikir aşamasında" | "Geliştirme aşamasında" | etc.
  checklistTotal: number;
  checklistCompleted: number;
  highPriorityBlocked: number;  // HIGH priority items not completed
  daysSinceMetric: number | null; // null if no metrics yet
  hasWebsite: boolean;
};

const ADVICE_PROMPT = (ctx: ProductContext) => `Sen ${ctx.name} ürününün kişisel startup danışmanısın.

ÜRÜN DURUMU:
- Aşama: ${ctx.launchStatus}
- Launch checklist: ${ctx.checklistCompleted}/${ctx.checklistTotal} tamamlandı
- Kritik engeller: ${ctx.highPriorityBlocked} tamamlanmamış HIGH öncelikli madde
- Son metrik girişi: ${ctx.daysSinceMetric === null ? "Henüz yok" : ctx.daysSinceMetric + " gün önce"}
- Web sitesi: ${ctx.hasWebsite ? "Var" : "Yok"}

${stageContext(ctx.launchStatus)}

Bu haftaki odak noktası ve spesifik aksiyonlar neler olmalı?

SADECE JSON döndür:
{
  "focus": "bu haftanın tek cümlelik odak noktası",
  "actions": [
    {
      "title": "spesifik aksiyon başlığı (max 60 karakter)",
      "why": "neden şimdi önemli, 1 cümle",
      "priority": "high" | "medium"
    }
  ],
  "encouragement": "ilerlemeye göre motive edici 1 cümle, ${ctx.name} adını kullan"
}

Kurallar:
- actions: tam olarak 3-5 madde
- Genel tavsiye verme — "${ctx.name}" ve mevcut aşamasına özgü ol
- Türkçe yaz`;

function stageContext(launchStatus: string): string {
  const contexts: Record<string, string> = {
    "Fikir aşamasında": "Henüz ürün yok. Önce validasyon. Müşteri görüşmesi ve problem doğrulama en kritik.",
    "Geliştirme aşamasında": "Ürün yapılıyor. Beta kullanıcı bul, erken feedback topla, scope'u koru.",
    "Beta'da": "Ürün var, test ediliyor. Feedback'i ürüne yansıt, launch hazırlığı yap, ödeme almaya hazırlan.",
    "Yakında launch": "Launch çok yakın. Pazarlama altyapısını kur, launch günü planla, ilk kullanıcı kitlesini hazırla.",
    "Launch oldu": "Ürün canlıda. Kullanıcı edinimi ve aktivasyona odaklan, churn'ü takip et.",
    "Büyüme aşamasında": "Büyüme fazı. Ölçeklenebilir kanalları test et, retansiyonu optimize et, geliri büyüt.",
  };
  return contexts[launchStatus] || "Ürününü büyütmeye odaklan.";
}

async function callAI(prompt: string): Promise<WeeklyAdvice | null> {
  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
      const res = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      const parsed = JSON.parse(res.choices[0]?.message?.content || "{}");
      if (parsed.focus && parsed.actions?.length) return parsed as WeeklyAdvice;
    } catch (err) {
      console.warn("[advice] DeepSeek failed:", (err as Error).message);
    }
  }
  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      const text = result.response.text().trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
      const parsed = JSON.parse(text);
      if (parsed.focus && parsed.actions?.length) return parsed as WeeklyAdvice;
    } catch (err) {
      console.warn("[advice] Gemini failed:", (err as Error).message);
    }
  }
  return null;
}

function staticFallback(ctx: ProductContext): WeeklyAdvice {
  return {
    focus: `${ctx.name} için bu hafta en kritik adımı at`,
    actions: [
      { title: "Launch checklistini gözden geçir", why: "İlerlemeyi görmek motivasyon sağlar", priority: "high" },
      { title: "Bir kullanıcıyla konuş", why: "Gerçek geri bildirim her şeyin önünde gelir", priority: "high" },
      { title: "Bu haftanın metriklerini gir", why: "Veri olmadan karar alınamaz", priority: "medium" },
    ],
    encouragement: `${ctx.name} doğru yolda, devam et.`,
  };
}

export async function generateWeeklyAdvice(ctx: ProductContext): Promise<WeeklyAdvice> {
  const prompt = ADVICE_PROMPT(ctx);
  const advice = await callAI(prompt);
  return advice ?? staticFallback(ctx);
}
