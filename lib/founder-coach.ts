import { generateText } from "ai";
import { defaultModel } from "@/BrandLib/ai-client";
import type { FounderCoachContext } from "@/lib/founder-coach-context";
import { buildFounderCoachDecision } from "@/lib/founder-coach-agent";
import { getMetricContext } from "@/lib/metric-context";
import { getMetricSetup, type FunnelStageKey } from "@/lib/metric-setup";

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

function summarizeContext(context: FounderCoachContext) {
  return JSON.stringify(context, null, 2);
}

async function buildMetricDataContext(productId: string): Promise<string> {
  const parts: string[] = [];

  // Integration metrics (GA4, Stripe synced data)
  try {
    const metricCtx = await getMetricContext(productId);
    if (metricCtx.contextString) {
      parts.push(metricCtx.contextString);
    }
  } catch {}

  // AARRR funnel entries (user-entered data from MetricSetup/MetricEntry)
  try {
    const setup = await getMetricSetup(productId);
    if (setup && setup.selections.length > 0) {
      const selectedStages = setup.selections
        .filter((s) => s.selectedMetricKeys.length > 0)
        .map((s) => s.stage);

      parts.push(`\nAARRR FUNNEL SETUP: ${selectedStages.join(", ")} adimlari icin metrik secilmis.`);

      if (setup.entries.length > 0) {
        const recent = setup.entries.slice(-7);
        parts.push(`AARRR FUNNEL VERİSİ (Son ${recent.length} giris):`);
        for (const entry of recent) {
          const vals = Object.entries(entry.values)
            .map(([stage, val]) => `${stage}: ${val}`)
            .join(", ");
          parts.push(`  ${entry.date}: ${vals}`);
        }

        // Compute simple trends for selected stages
        if (recent.length >= 2) {
          const first = recent[0];
          const last = recent[recent.length - 1];
          const trends: string[] = [];
          for (const stage of selectedStages) {
            const key = stage as FunnelStageKey;
            const firstVal = first.values[key];
            const lastVal = last.values[key];
            if (firstVal != null && lastVal != null) {
              const change = lastVal - firstVal;
              const pct = firstVal !== 0 ? ((change / Math.abs(firstVal)) * 100).toFixed(1) : "N/A";
              const dir = change > 0 ? "yukari" : change < 0 ? "asagi" : "stabil";
              trends.push(`  ${stage}: ${dir} (%${pct})`);
            }
          }
          if (trends.length > 0) {
            parts.push("AARRR TREND ANALİZİ:");
            parts.push(...trends);
          }
        }
      } else {
        parts.push("AARRR FUNNEL VERİSİ: Henuz giris yapilmamis. Kurucuya ilk veri girisini onermelisin.");
      }
    }
  } catch {}

  return parts.join("\n");
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
  const [decision, metricData] = await Promise.all([
    buildFounderCoachDecision({
      context,
      message,
      mode: "REACTIVE_ANSWER",
    }),
    buildMetricDataContext(context.product.id),
  ]);
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  const stage = context.product.status;
  const stageContext =
    stage === "PRE_LAUNCH"
      ? "This product is PRE_LAUNCH — not live yet. Prioritize launch blockers and checklist completion. Do not suggest growth tools, integrations (GA4, Stripe), or metric tracking as high-priority items for this stage."
      : stage === "LAUNCHED"
      ? "This product is LAUNCHED but early. Focus on metric setup, first data entry, and initial goals before integrations."
      : "This product is GROWING. Growth execution, routines, and integrations that unblock specific metrics are relevant.";

  return `You are Founder Coach inside Tiramisup.
Answer only from the verified product state provided below. Do not invent unsupported context.
If context is incomplete, state assumptions briefly.
Prioritize what matters now. Prefer specific, founder-friendly, stage-aware guidance.
If advisory skill knowledge is loaded, treat it as relevant guidance and use it deliberately.

STAGE CONTEXT: ${stageContext}

VERIFIED PRODUCT STATE:
${summarizeContext(context)}

${metricData ? `LIVE METRIC DATA:\n${metricData}` : ""}

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
- respect the stage context above when ranking priorities
- if store readiness, legal risk, metric interpretation, or prioritization is relevant, use the loaded skill guidance instead of guessing
`;
}

async function buildProactivePrompt(context: FounderCoachContext) {
  const [decision, metricData] = await Promise.all([
    buildFounderCoachDecision({
      context,
      mode: "PROACTIVE_SUGGESTION",
    }),
    buildMetricDataContext(context.product.id),
  ]);
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  const stage = context.product.status;

  const stageRules =
    stage === "PRE_LAUNCH"
      ? `STAGE: PRE_LAUNCH — product is NOT live yet.
STRICT RULES FOR THIS STAGE:
- Focus ONLY on launch checklist completion and launch blockers.
- NEVER suggest GA4, analytics integrations, growth tools, metric setup, or AARRR tracking.
- NEVER suggest Stripe, revenue tracking, or retention analysis.
- The single most valuable thing is closing launch blockers and getting to launch.`
      : stage === "LAUNCHED"
      ? `STAGE: LAUNCHED — product is live but early.
STRICT RULES FOR THIS STAGE:
- If metric setup is not complete, suggest that first.
- If metric setup is complete but no entries, suggest first data entry.
- If data exists but no goals, suggest setting first goal.
- Integrations (GA4, Stripe) are relevant ONLY if metric setup is complete and there are 0 connected integrations.`
      : `STAGE: GROWING — product has traction.
STRICT RULES FOR THIS STAGE:
- Focus on growth checklist execution, routines, and goal progress.
- Suggest integrations if they would unblock a specific tracked metric.`;

  return `You are Founder Coach inside Tiramisup.
You are generating one short proactive suggestion card from verified product state.
Do not invent unsupported context. Suggest one high-value next step only.

${stageRules}

VERIFIED PRODUCT STATE:
${summarizeContext(context)}

${metricData ? `LIVE METRIC DATA:\n${metricData}` : ""}

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
- strictly follow the stage rules above — they override everything else
- if the state is too weak or noisy, still choose the highest-confidence next step for the current stage
- use loaded advisory knowledge when it sharpens the next-step recommendation
`;
}

function parseJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as T;
}

async function callGemini<T>(prompt: string): Promise<T | null> {
  try {
    const result = await generateText({
      model: defaultModel,
      prompt,
      temperature: 0.4,
    });
    return parseJson<T>(result.text);
  } catch (err) {
    console.error("[founder-coach] Gemini call failed:", err);
    return null;
  }
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

  if (!context.growthWorkspace.metricSetupComplete) {
    return {
      title: "Önce growth için hangi sayıları takip edeceğini seç",
      summary: "Ürün launch sonrası aşamada görünüyor ama henüz net bir metric setup oluşmamış. Önce her AARRR adımı için tek ana metriği seçmek, sonraki growth kararlarını sağlamlaştırır.",
      priorities: [
        { title: "Her AARRR adımı için 1 ana metrik seç", why: "Hangi sayıya bakacağını netleştirmeden growth işi dağılır.", priority: "CRITICAL" },
        { title: "Activation metriğini özellikle netleştir", why: "İlk değer anını anlamadan acquisition veya retention yorumları zayıf kalır.", priority: "IMPORTANT" }
      ],
      whatCanWait: ["Detaylı deney listeleri", "İleri seviye raporlama"]
    };
  }

  if (context.growthWorkspace.entryCount === 0) {
    return {
      title: "Şimdi ilk gerçek metrik girişini yapma zamanı",
      summary: "Metric setup hazır ama henüz sayılar sisteme girilmemiş. İlk veri gelmeden hangi aksiyonun işe yaradığını ayırt etmek zor olur.",
      priorities: [
        { title: "Bugünkü ana metrik değerlerini gir", why: "İlk baz çizgiyi görmeden ilerlemeyi ölçemezsin.", priority: "CRITICAL" },
        { title: "Revenue ve activation tarafında başlangıç seviyesini not et", why: "İlk haftanın yorum çerçevesi bu başlangıç noktasına dayanır.", priority: "IMPORTANT" }
      ],
      whatCanWait: ["Yeni kanal açmak", "Geniş kapsamlı optimizasyon listesi"]
    };
  }

  if (context.execution.goals === 0) {
    return {
      title: "Takip ettiğin sayılar için hedef koyma zamanı",
      summary: "Artık veri girişi var. Sıradaki eksik halka, bu sayıların hangi seviyeye gelmesini istediğini net bir hedefe bağlamak.",
      priorities: [
        { title: "İlk 30 günlük hedefini yaz", why: "Hedef olmadan sayı takibi sadece gözlemde kalır.", priority: "CRITICAL" },
        { title: "Tek bir ana başarı metriğini hedefe çevir", why: "Odak alanını daraltmak execution kalitesini yükseltir.", priority: "IMPORTANT" }
      ],
      whatCanWait: ["Paralel çok sayıda growth deneyi", "Detaylı vanity metric kıyasları"]
    };
  }

  // Has data, has goals — check for metric health signals
  if (context.metrics.latest?.mrr != null || context.metrics.latest?.dau != null) {
    const priorities: FounderCoachResponse["priorities"] = [];
    if (context.metrics.latest.dau != null && context.metrics.latest.dau < 10) {
      priorities.push({ title: "Günlük aktif kullanıcı sayısı düşük — acquisition odağını artır", why: "DAU tek haneli seviyede. Yeni kullanıcı kazanımı öncelikli.", priority: "CRITICAL" });
    }
    if (context.execution.integrationsConnected === 0) {
      priorities.push({ title: "Stripe veya GA4 bağla", why: "Manuel veri girişi yerine otomatik veri akışı daha güvenilir.", priority: "IMPORTANT" });
    }
    if (priorities.length === 0) {
      priorities.push({ title: "Mevcut metrikleri haftalık gözden geçir", why: "Düzenli veri kontrolü trendleri erken yakalar.", priority: "IMPORTANT" });
    }
    return {
      title: "Growth döngüsü aktif, metrikleri takip et",
      summary: "Ürün yayında ve veri akışı var. Şimdi en önemli konu metriklerdeki hareketi düzenli okuyup büyüme döngüsünü güçlendirmek.",
      priorities,
      whatCanWait: ["Yeni entegrasyon araştırması", "Büyük çaplı refactoring"]
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

  if (!context.growthWorkspace.metricSetupComplete) {
    return {
      suggestedNextStep: "Growth ekranında metric setup'ı tamamla",
      whyNow: "Launch sonrası dönemde hangi sayılarla karar vereceğin net değilse diğer growth işleri dağınık kalır.",
      whatCanWait: "Detaylı growth checklist maddelerinin tamamı",
      confidence: "HIGH"
    };
  }

  if (context.growthWorkspace.entryCount === 0) {
    return {
      suggestedNextStep: "Metrics ekranında ilk günlük veri girişini yap",
      whyNow: "Setup hazır ama henüz baz çizgi yok. İlk gerçek değerler gelmeden neyin hareket ettiğini anlayamazsın.",
      whatCanWait: "Yeni deneyler açmak",
      confidence: "HIGH"
    };
  }

  if (context.execution.goals === 0) {
    return {
      suggestedNextStep: "İlk growth hedefini sayı bazlı tanımla",
      whyNow: "Veri girişi başladıysa sıradaki ihtiyaç, hangi sonuca ulaşmaya çalıştığını netleştirmek.",
      whatCanWait: "İkinci seviye dashboard detayları",
      confidence: "HIGH"
    };
  }

  if (context.execution.growthChecklist.total > context.execution.growthChecklist.completed) {
    return {
      suggestedNextStep: "Growth checklist'teki bir sonraki execution maddesini kapat",
      whyNow: "Veriyi görüp hedef koyduktan sonra metrikleri oynatacak gerçek işler execution checklist tarafında duruyor.",
      whatCanWait: "Yeni araç veya rapor eklemek",
      confidence: "HIGH"
    };
  }

  return {
    suggestedNextStep: "Tiramisup önerisine göre tek bir growth hamlesine odaklan",
    whyNow: "Temel setup ve execution yüzeyi oturduysa artık en önemli konu hangi hamlenin metriği hareket ettireceğini seçmek.",
    whatCanWait: "Paralel çok sayıda optimizasyon denemesi",
    confidence: "HIGH"
  };
}

export async function getFounderCoachAnswer(context: FounderCoachContext, userMessage: string): Promise<FounderCoachResponse> {
  const prompt = await buildReactivePrompt(context, userMessage);
  const result = await callGemini<FounderCoachResponse>(prompt);
  if (result?.title && result?.summary && Array.isArray(result?.priorities)) return result;
  return fallbackReactive(context);
}

export async function getFounderCoachSuggestion(context: FounderCoachContext): Promise<FounderCoachSuggestion | null> {
  const prompt = await buildProactivePrompt(context);
  const result = await callGemini<FounderCoachSuggestion>(prompt);
  if (result?.suggestedNextStep && result?.whyNow && result?.confidence) return result;
  return fallbackSuggestion(context);
}
