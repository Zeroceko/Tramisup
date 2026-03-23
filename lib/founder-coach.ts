import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FounderCoachContext } from "@/lib/founder-coach-context";
import { buildFounderCoachDecision } from "@/lib/founder-coach-agent";

export type FounderCoachResponse = {
  title: string;
  summary: string;
  priorities: Array<{
    title: string;
    why: string;
    priority: "CRITICAL" | "IMPORTANT" | "NICE";
  }>;
  whatCanWait?: string[];
};

export type FounderCoachSuggestion = {
  suggestedNextStep: string;
  whyNow: string;
  whatCanWait?: string;
  confidence: "LOW" | "MEDIUM" | "HIGH";
};

const QWEN_BASE_URL = "https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-model/v1";

function summarizeContext(context: FounderCoachContext) {
  return JSON.stringify(context, null, 2);
}

function detectStoreNeed(message: string, context: FounderCoachContext) {
  const lower = message.toLowerCase();
  const platformText = context.storeReadiness.platforms.join(" ").toLowerCase();
  return {
    appStore:
      /app store|ios|apple|eula|sign in with apple|subscription|abonelik|review/i.test(lower) ||
      platformText.includes("ios"),
    playStore:
      /play store|google play|android|data safety|permissions|billing/i.test(lower) ||
      platformText.includes("android"),
  };
}

async function buildReactivePrompt(context: FounderCoachContext, message: string) {
  const decision = await buildFounderCoachDecision({
    context,
    message,
    mode: "REACTIVE_ANSWER",
  });
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  return `You are Founder Coach inside Tiramisup.
Answer only from the verified product state provided below. Do not invent unsupported context.
If context is incomplete, state assumptions briefly.
Prioritize what matters now. Prefer specific, founder-friendly, stage-aware guidance.
If advisory skill knowledge is loaded, treat it as relevant guidance and use it deliberately.

VERIFIED PRODUCT STATE:
${summarizeContext(context)}

${advisoryKnowledge ? `RELEVANT ADVISORY KNOWLEDGE:\n${advisoryKnowledge}` : ""}

USER QUESTION:
${message}

Return valid JSON only in this shape:
{
  "title": "short answer headline",
  "summary": "2-3 sentence summary in Turkish",
  "priorities": [
    {
      "title": "action title",
      "why": "why this matters now",
      "priority": "CRITICAL" | "IMPORTANT" | "NICE"
    }
  ],
  "whatCanWait": ["item", "item"]
}

Rules:
- priorities: 2 to 5 items
- Turkish output
- no markdown
- no generic startup fluff
- tie advice to actual stage/status and known state
- if store readiness, legal risk, metric interpretation, or prioritization is relevant, use the loaded skill guidance instead of guessing
`;
}

async function buildProactivePrompt(context: FounderCoachContext) {
  const decision = await buildFounderCoachDecision({
    context,
    mode: "PROACTIVE_SUGGESTION",
  });
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  return `You are Founder Coach inside Tiramisup.
You are generating one short proactive suggestion card from verified product state.
Do not invent unsupported context. Suggest one high-value next step only.

VERIFIED PRODUCT STATE:
${summarizeContext(context)}

${advisoryKnowledge ? `RELEVANT ADVISORY KNOWLEDGE:\n${advisoryKnowledge}` : ""}

Return valid JSON only in this shape:
{
  "suggestedNextStep": "short Turkish suggestion",
  "whyNow": "1-2 sentence explanation in Turkish",
  "whatCanWait": "short Turkish deprioritization note",
  "confidence": "LOW" | "MEDIUM" | "HIGH"
}

Rules:
- Turkish only
- one suggestion only
- if the state is too weak or noisy, still choose the highest-confidence next step
- prefer launch blockers in PRE_LAUNCH
- prefer activation/metric clarity in LAUNCHED
- prefer suggestion over broad checklist
- use loaded advisory knowledge when it sharpens the next-step recommendation
`;
}

function parseJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as T;
}

async function callModels<T>(prompt: string): Promise<T | null> {
  if (process.env.QWEN_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.QWEN_API_KEY, baseURL: QWEN_BASE_URL });
      const res = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });
      return parseJson<T>(res.choices[0]?.message?.content || "{}");
    } catch {}
  }

  if (process.env.DEEPSEEK_API_KEY) {
    try {
      const client = new OpenAI({ apiKey: process.env.DEEPSEEK_API_KEY, baseURL: "https://api.deepseek.com" });
      const res = await client.chat.completions.create({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        temperature: 0.4,
      });
      return parseJson<T>(res.choices[0]?.message?.content || "{}");
    } catch {}
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent(prompt);
      return parseJson<T>(result.response.text());
    } catch {}
  }

  return null;
}

function fallbackReactive(context: FounderCoachContext): FounderCoachResponse {
  if (context.product.status === "PRE_LAUNCH") {
    return {
      title: "Şu an launch öncesi netleştirme zamanı",
      summary: "Ürünün hâlâ launch öncesi aşamada. Önce kritik checklist blokajlarını kapat, sonra ilk başarı metriğini tanımla.",
      priorities: [
        { title: "Yüksek öncelikli launch blokajlarını kapat", why: "Açık blocker varken launch riski artar.", priority: "CRITICAL" },
        { title: "İlk aktivasyon anını tanımla", why: "Launch sonrası neyin çalıştığını anlamak için buna ihtiyacın var.", priority: "IMPORTANT" }
      ],
      whatCanWait: ["Detaylı growth deneyleri", "Gelişmiş retention raporları"]
    };
  }

  return {
    title: "Şu an launch sonrası sinyalleri netleştirme zamanı",
    summary: "Ürün launch edilmiş görünüyor. Şimdi en önemli konu ilk kullanıcı davranışını ve aktivasyonu neyle ölçeceğini netleştirmek.",
    priorities: [
      { title: "Aktivasyon metriğini netleştir", why: "Kullanıcının gerçekten değer gördüğü anı ölçmeden ilerleme belirsiz kalır.", priority: "CRITICAL" },
      { title: "İlk haftanın ana metriğini seç", why: "Tek odak metriği karar kalitesini artırır.", priority: "IMPORTANT" }
    ],
    whatCanWait: ["Kapsamlı çok-kanallı optimizasyon", "Detaylı vanity metric takibi"]
  };
}

function fallbackSuggestion(context: FounderCoachContext): FounderCoachSuggestion {
  if (context.product.status === "PRE_LAUNCH") {
    return {
      suggestedNextStep: "Kritik launch blokajlarını kapat",
      whyNow: "Ürün hâlâ launch öncesi durumda ve açık checklist blokajları varsa sonraki adımlar bulanık kalır.",
      whatCanWait: "Şimdilik ileri seviye growth denemeleri",
      confidence: "HIGH"
    };
  }

  return {
    suggestedNextStep: "İlk aktivasyon metriğini tanımla",
    whyNow: "Launch sonrası neyin çalıştığını anlamak için önce başarıyı hangi davranışın temsil ettiğini netleştirmen gerekiyor.",
    whatCanWait: "Detaylı performans dashboard genişletmeleri",
    confidence: "HIGH"
  };
}

export async function getFounderCoachAnswer(context: FounderCoachContext, userMessage: string): Promise<FounderCoachResponse> {
  const prompt = await buildReactivePrompt(context, userMessage);
  const result = await callModels<FounderCoachResponse>(prompt);
  if (result?.title && result?.summary && Array.isArray(result?.priorities)) return result;
  return fallbackReactive(context);
}

export async function getFounderCoachSuggestion(context: FounderCoachContext): Promise<FounderCoachSuggestion | null> {
  const prompt = await buildProactivePrompt(context);
  const result = await callModels<FounderCoachSuggestion>(prompt);
  if (result?.suggestedNextStep && result?.whyNow && result?.confidence) return result;
  return fallbackSuggestion(context);
}
