import { generateText } from "ai";
import { ProductStatus } from "@prisma/client";
import { withFallback } from "@/BrandLib/ai-client";
import type { FounderCoachContext } from "@/lib/founder-coach-context";
import { buildFounderCoachDecision } from "@/lib/founder-coach-agent";
import { getMetricSetup, type FunnelStageKey } from "@/lib/metric-setup";
import type { NormalizedProductContext } from "@/lib/normalize-product-context";
import type { EvidenceMap } from "@/lib/build-evidence-map";
import { generateConnectedAITextForProduct } from "@/lib/connected-ai-runtime";

// ─── Recommendation output contract (AI Agent System Playbook §13) ──────────

export type RecommendationType =
  | "launch_blocker"
  | "readiness_next_step"
  | "source_setup"
  | "metric_selection"
  | "daily_action"
  | "weak_link"
  | "data_collection"
  | "weekly_focus";

export type RecommendationPriority = "high" | "medium" | "low";
export type RecommendationConfidence = "high" | "medium" | "low";

export type ImpactArea =
  | "launch"
  | "acquisition"
  | "activation"
  | "retention"
  | "revenue"
  | "measurement";

export type CriticStatus = "approved" | "revised" | "fallback";

export interface Recommendation {
  title: string;
  type: RecommendationType;
  priority: RecommendationPriority;
  impact_area: ImpactArea;
  why_now: string;
  supporting_evidence: string[];
  assumptions: string[];
  missing_data: string[];
  confidence: RecommendationConfidence;
  expected_outcome: string;
  user_action: string;
}

export interface CoachRecommendationOutput {
  primary_recommendation: Recommendation;
  supporting_recommendations: Recommendation[];
  missing_information_for_better_guidance: string[];
  critic_status: CriticStatus;
}

export interface PreviousCoachAnswer {
  title?: string;
  why_now?: string;
  user_action?: string;
}


// ─── Context serialization for prompts ──────────────────────────────────────

function serializeNormalizedContext(ctx: NormalizedProductContext): string {
  return JSON.stringify({
    product_name: ctx.product_name,
    product_summary: ctx.product_summary,
    product_url: ctx.product_url,
    categories: ctx.categories,
    platforms: ctx.platforms,
    primary_audience: ctx.primary_audience,
    business_model: ctx.business_model,
    stage: ctx.stage,
    primary_goal: ctx.primary_goal,
    planned_launch_date: ctx.planned_launch_date,
    description_understanding: ctx.description_understanding,
    context_confidence: ctx.context_confidence,
    missing_fields: ctx.missing_fields,
    ambiguity_flags: ctx.ambiguity_flags,
  }, null, 2);
}

function serializeEvidenceMap(em: EvidenceMap): string {
  return JSON.stringify({
    known_facts: em.known_facts,
    inferred_facts: em.inferred_facts,
    unknown_facts: em.unknown_facts,
    checklist_state: em.checklist_state,
    task_state: em.task_state,
    source_state: em.source_state,
    metric_state: em.metric_state,
    launch_state: em.launch_state,
    recommendation_readiness: em.recommendation_readiness,
  }, null, 2);
}

// ──�� AARRR metric data (structured, secondary signal) ───────────────────────

async function buildAARRRDataContext(productId: string): Promise<string> {
  try {
    const setup = await getMetricSetup(productId);
    if (!setup || setup.selections.length === 0) return "";

    const selectedStages = setup.selections
      .filter((s) => s.selectedMetricKeys.length > 0)
      .map((s) => s.stage);

    if (setup.entries.length === 0) return "";

    const parts: string[] = [];
    const recent = setup.entries.slice(-7);
    parts.push(`AARRR entries (last ${recent.length}):`);
    for (const entry of recent) {
      const vals = Object.entries(entry.values)
        .map(([stage, val]) => `${stage}: ${val}`)
        .join(", ");
      parts.push(`  ${entry.date}: ${vals}`);
    }

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
          const dir = change > 0 ? "up" : change < 0 ? "down" : "stable";
          trends.push(`  ${stage}: ${dir} (${pct}%)`);
        }
      }
      if (trends.length > 0) {
        parts.push("Trends:");
        parts.push(...trends);
      }
    }

    return parts.join("\n");
  } catch {
    return "";
  }
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

function stageDirective(stage: string): string {
  switch (stage) {
    case "idea":
    case "development":
      return "STAGE: development — product is not built yet. Focus only on product definition, validation planning, and MVP scope. Do not suggest analytics, integrations, growth tools, or metric tracking.";
    case "testing":
      return "STAGE: testing — product is in beta. Focus on validation signals, early user feedback quality, and activation definition. Do not suggest scaling, paid acquisition, or revenue optimization.";
    case "launch_prep":
      return "STAGE: launch_prep — product is preparing to launch. Focus on launch blockers, checklist completion, and readiness. Do not suggest growth tools, integrations (GA4, Stripe), or metric tracking as high-priority.";
    case "live":
      return "STAGE: live — product just launched. Focus on metric setup, first data entry, initial goals. Integrations are relevant only after metric setup is complete.";
    case "early_growth":
      return "STAGE: early_growth — product has traction. Focus on growth execution, routines, goal progress. Suggest integrations only if they unblock a specific tracked metric.";
    default:
      return "STAGE: unknown — be conservative, focus on setup completion.";
  }
}

async function buildReactivePrompt(
  context: FounderCoachContext,
  message: string,
  previousAnswer?: PreviousCoachAnswer | null
) {
  const nCtx = context.normalizedContext;
  const evidence = context.evidenceMap;

  const [decision, aarrData] = await Promise.all([
    buildFounderCoachDecision({
      context,
      message,
      mode: "REACTIVE_ANSWER",
    }),
    buildAARRRDataContext(context.product.id),
  ]);
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  const outputLanguage = context.locale === "tr" ? "Turkish" : "English";
  const langRule =
    context.locale === "tr"
      ? "All visible content (title, why_now, expected_outcome, user_action) must be in Turkish, with perfect Turkish characters (ç, ş, ğ, ı, ö, ü). Never produce broken or transliterated Turkish."
      : "All visible content (title, why_now, expected_outcome, user_action) must be in English. Never insert Turkish words even if the product name or website is Turkish.";

  return `You are Founder Coach inside Tiramisup.
Answer only from the normalized context and evidence map provided below.
Do not invent unsupported context. If information is listed as unknown, do not treat it as known.
Prioritize what matters now. Prefer specific, founder-friendly, stage-aware guidance.

${stageDirective(nCtx.stage)}

NORMALIZED PRODUCT CONTEXT:
${serializeNormalizedContext(nCtx)}

EVIDENCE MAP:
${serializeEvidenceMap(evidence)}

${aarrData ? `AARRR METRIC DATA (secondary signal):\n${aarrData}` : ""}

${advisoryKnowledge ? `RELEVANT ADVISORY KNOWLEDGE:\n${advisoryKnowledge}` : ""}

USER QUESTION:
${message}

${previousAnswer
  ? `PREVIOUS ANSWER TO AVOID REPEATING:
${JSON.stringify(previousAnswer, null, 2)}`
  : ""}

Return valid JSON only in this shape:
{
  "primary_recommendation": {
    "title": "short ${outputLanguage} headline",
    "type": "launch_blocker" | "readiness_next_step" | "source_setup" | "metric_selection" | "daily_action" | "weak_link" | "data_collection" | "weekly_focus",
    "priority": "high" | "medium" | "low",
    "impact_area": "launch" | "acquisition" | "activation" | "retention" | "revenue" | "measurement",
    "why_now": "1-2 sentence ${outputLanguage} explanation tied to evidence",
    "supporting_evidence": ["fact from evidence map"],
    "assumptions": ["assumption if any"],
    "missing_data": ["missing field if any"],
    "confidence": "high" | "medium" | "low",
    "expected_outcome": "what changes if founder acts",
    "user_action": "concrete next step"
  },
  "supporting_recommendations": [
    { ...same shape as primary, max 2 items }
  ],
  "missing_information_for_better_guidance": ["field or data point"],
  "critic_status": "approved"
}

Rules:
- primary_recommendation is required, supporting_recommendations max 2
- OUTPUT LANGUAGE: ${langRule}
- no markdown
- no generic startup fluff
- tie advice to known_facts and inferred_facts from the evidence map
- respect the stage directive above when choosing type and priority
- if context_confidence is "low", set confidence to "low" and acknowledge uncertainty
- if missing_fields exist, list them in missing_information_for_better_guidance
- if advisory skill knowledge is loaded, use it deliberately
- supporting_evidence must reference actual facts from the evidence map, not invented ones
- if PREVIOUS ANSWER TO AVOID REPEATING is present, do not repeat the same title, the same user_action, or the same recommendation framing
- choose the next best actionable recommendation instead of rephrasing the previous one
`;
}

async function buildProactivePrompt(context: FounderCoachContext) {
  const nCtx = context.normalizedContext;
  const evidence = context.evidenceMap;

  const [decision, aarrData] = await Promise.all([
    buildFounderCoachDecision({
      context,
      mode: "PROACTIVE_SUGGESTION",
    }),
    buildAARRRDataContext(context.product.id),
  ]);
  const advisoryKnowledge = decision.skills
    .map(
      (skill) => `SKILL: ${skill.name}\nWHY LOADED: ${skill.reason}\n${skill.content}`
    )
    .join("\n\n---\n\n");

  const outputLanguage = context.locale === "tr" ? "Turkish" : "English";
  const langRule =
    context.locale === "tr"
      ? "All visible content (title, why_now, expected_outcome, user_action) must be in Turkish, with perfect Turkish characters (ç, ş, ğ, ı, ö, ü). Never produce broken or transliterated Turkish."
      : "All visible content (title, why_now, expected_outcome, user_action) must be in English. Never insert Turkish words even if the product name or website is Turkish.";

  return `You are Founder Coach inside Tiramisup.
You are generating one short proactive suggestion card.
Do not invent unsupported context. Suggest one high-value next step only.
Base your suggestion on the evidence map and normalized context below.

${stageDirective(nCtx.stage)}

NORMALIZED PRODUCT CONTEXT:
${serializeNormalizedContext(nCtx)}

EVIDENCE MAP:
${serializeEvidenceMap(evidence)}

${aarrData ? `AARRR METRIC DATA (secondary signal):\n${aarrData}` : ""}

${advisoryKnowledge ? `RELEVANT ADVISORY KNOWLEDGE:\n${advisoryKnowledge}` : ""}

Return valid JSON only in this shape:
{
  "primary_recommendation": {
    "title": "short ${outputLanguage} suggestion",
    "type": "launch_blocker" | "readiness_next_step" | "source_setup" | "metric_selection" | "daily_action" | "weak_link" | "data_collection" | "weekly_focus",
    "priority": "high" | "medium" | "low",
    "impact_area": "launch" | "acquisition" | "activation" | "retention" | "revenue" | "measurement",
    "why_now": "1-2 sentence ${outputLanguage} explanation tied to evidence",
    "supporting_evidence": ["fact from evidence map"],
    "assumptions": [],
    "missing_data": [],
    "confidence": "high" | "medium" | "low",
    "expected_outcome": "what changes if founder acts",
    "user_action": "concrete next step"
  },
  "supporting_recommendations": [],
  "missing_information_for_better_guidance": ["field or data point"],
  "critic_status": "approved"
}

Rules:
- OUTPUT LANGUAGE: ${langRule}
- one primary recommendation, no supporting for proactive cards
- strictly follow the stage directive above
- use recommendation_readiness scores to calibrate confidence
- if context_confidence is "low", set confidence to "low" and suggest setup completion
- if unknown_facts list is long, prefer type "data_collection"
- use loaded advisory knowledge when it sharpens the recommendation
- supporting_evidence must reference actual facts from the evidence map
`;
}

function parseJson<T>(text: string): T {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  return JSON.parse(cleaned) as T;
}

async function callCoachModel<T>(
  prompt: string,
  context: FounderCoachContext
): Promise<T | null> {
  const connectedModelText = await generateConnectedAITextForProduct({
    productId: context.product.id,
    userId: context.product.userId,
    prompt,
  });

  if (connectedModelText) {
    try {
      return parseJson<T>(connectedModelText);
    } catch (error) {
      console.warn("[founder-coach] Connected model returned invalid JSON, falling back:", error);
    }
  }

  try {
    const result = await withFallback(
      (model) =>
        generateText({
          model,
          prompt,
          temperature: 0.4,
        }),
      "founder-coach"
    );
    return parseJson<T>(result.text);
  } catch (err) {
    console.error("[founder-coach] AI call failed completely:", err);
    return null;
  }
}

// ─── Evidence-readiness gating ──────────────────────────────────────────────

function getRelevantReadinessDomain(stage: string): "launch" | "metrics" | "growth" | "source_setup" {
  switch (stage) {
    case "idea":
    case "development":
    case "testing":
    case "launch_prep":
      return "launch";
    case "live":
      return "metrics";
    case "early_growth":
      return "growth";
    default:
      return "launch";
  }
}

function shouldReturnDataCollectionFallback(context: FounderCoachContext): boolean {
  const nCtx = context.normalizedContext;
  const evidence = context.evidenceMap;

  // Low context confidence → always fallback
  if (nCtx.context_confidence === "low") return true;

  // Check relevant readiness domain
  const domain = getRelevantReadinessDomain(nCtx.stage);
  if (evidence.recommendation_readiness[domain] === "low") return true;

  return false;
}

// ─── Data-collection fallback (playbook §12.3, §19) ─────────────────────────

function makeDataCollectionFallback(context: FounderCoachContext): CoachRecommendationOutput {
  const nCtx = context.normalizedContext;
  const evidence = context.evidenceMap;
  const missing = nCtx.missing_fields;

  // Determine what the user should do to improve context
  let title: string;
  let userAction: string;
  let impactArea: ImpactArea = "measurement";

  if (missing.includes("product_description") || missing.includes("category")) {
    title = "Ürün profilini tamamla";
    userAction = "Onboarding bilgilerini gözden geçir ve eksik alanları doldur.";
  } else if (evidence.metric_state.has_setup && evidence.metric_state.entry_count === 0) {
    title = "İlk metrik verini gir";
    userAction = "Metrics ekranında bugünkü değerleri kaydet.";
    impactArea = "measurement";
  } else if (!evidence.metric_state.has_setup && (nCtx.stage === "live" || nCtx.stage === "early_growth")) {
    title = "Takip edeceğin metrikleri seç";
    userAction = "Growth ekranında AARRR metrik kurulumunu tamamla.";
    impactArea = "measurement";
  } else if (evidence.checklist_state.total === 0 && (nCtx.stage === "launch_prep" || nCtx.stage === "development")) {
    title = "Launch checklist henüz oluşmamış";
    userAction = "Ürün profilini kontrol et — checklist otomatik oluşturulmalıydı.";
    impactArea = "launch";
  } else {
    title = "Daha güçlü öneriler için ek bilgi gerekiyor";
    userAction = "Eksik alanları tamamla: " + (missing.length > 0 ? missing.join(", ") : "metrik verisi veya kaynak bağlantısı");
  }

  return {
    primary_recommendation: {
      title,
      type: "data_collection",
      priority: "high",
      impact_area: impactArea,
      why_now: "Yeterli veri olmadan güçlü öneriler üretmek mümkün değil. Önce eksik bilgiyi tamamla.",
      supporting_evidence: evidence.unknown_facts.slice(0, 3),
      assumptions: [],
      missing_data: missing.length > 0 ? missing : ["metric_data", "source_connection"],
      confidence: "high",
      expected_outcome: "Eksik bilgi tamamlandığında daha isabetli ve güvenilir öneriler alırsın.",
      user_action: userAction,
    },
    supporting_recommendations: [],
    missing_information_for_better_guidance: [
      ...missing,
      ...evidence.unknown_facts.filter((f) => !missing.some((m) => f.includes(m))).slice(0, 3),
    ],
    critic_status: "fallback",
  };
}

// ─── Stage-aware fallback (when AI call fails but readiness is ok) ──────────

function buildStageFallback(context: FounderCoachContext): CoachRecommendationOutput {
  const nCtx = context.normalizedContext;
  const evidence = context.evidenceMap;
  const stage = nCtx.stage;

  let primary: Recommendation;
  const supporting: Recommendation[] = [];

  if (stage === "idea" || stage === "development" || stage === "testing" || stage === "launch_prep") {
    // Pre-launch fallback
    const hasBlockers = evidence.checklist_state.high_blockers_remaining > 0;
    primary = {
      title: hasBlockers ? "Kritik launch blokajlarını kapat" : "Launch checklist'i ilerlet",
      type: hasBlockers ? "launch_blocker" : "readiness_next_step",
      priority: "high",
      impact_area: "launch",
      why_now: hasBlockers
        ? `${evidence.checklist_state.high_blockers_remaining} yüksek öncelikli madde açık. Bunlar kapanmadan launch riski yüksek.`
        : "Checklist ilerledikçe launch hazırlığı netleşir.",
      supporting_evidence: evidence.known_facts.filter((f) => f.includes("Checklist") || f.includes("Stage")),
      assumptions: [],
      missing_data: nCtx.missing_fields,
      confidence: evidence.recommendation_readiness.launch === "high" ? "high" : "medium",
      expected_outcome: "Launch hazırlık skoru yükselir ve kalan riskler azalır.",
      user_action: "Pre-launch ekranında sıradaki açık maddeyi tamamla.",
    };
  } else if (stage === "live") {
    // Just launched
    if (!evidence.metric_state.has_setup) {
      primary = {
        title: "Takip edeceğin metrikleri seç",
        type: "metric_selection",
        priority: "high",
        impact_area: "measurement",
        why_now: "Ürün yayında ama hangi sayıları izleyeceğin belli değil.",
        supporting_evidence: evidence.known_facts.filter((f) => f.includes("Stage") || f.includes("Metric")),
        assumptions: [],
        missing_data: ["metric_setup"],
        confidence: "high",
        expected_outcome: "Growth kararlarını veriye dayandırmaya başlarsın.",
        user_action: "Growth ekranında AARRR metrik kurulumunu tamamla.",
      };
    } else if (evidence.metric_state.entry_count === 0) {
      primary = {
        title: "İlk metrik girişini yap",
        type: "data_collection",
        priority: "high",
        impact_area: "measurement",
        why_now: "Metrikler seçili ama henüz veri yok. İlk baz çizgi olmadan trend göremezsin.",
        supporting_evidence: evidence.known_facts.filter((f) => f.includes("Metric")),
        assumptions: [],
        missing_data: ["metric_entries"],
        confidence: "high",
        expected_outcome: "İlk baz çizgi oluşur ve karşılaştırma yapılabilir hale gelir.",
        user_action: "Metrics ekranında bugünkü değerleri kaydet.",
      };
    } else {
      primary = {
        title: "İlk growth hedefini koy",
        type: "readiness_next_step",
        priority: "medium",
        impact_area: "activation",
        why_now: "Veri girişi başlamış. Sıradaki adım, hangi sonuca ulaşmak istediğini netleştirmek.",
        supporting_evidence: evidence.known_facts.filter((f) => f.includes("Metric") || f.includes("entries")),
        assumptions: [],
        missing_data: [],
        confidence: "medium",
        expected_outcome: "Hedefe göre ilerlemeyi ölçebilirsin.",
        user_action: "Goals bölümünde ilk 30 günlük hedefini tanımla.",
      };
    }
  } else {
    // early_growth
    primary = {
      title: "Growth checklist'teki sıradaki maddeyi kapat",
      type: "daily_action",
      priority: "medium",
      impact_area: "acquisition",
      why_now: "Temel setup tamam. Şimdi metrikleri hareket ettirecek execution zamanı.",
      supporting_evidence: evidence.known_facts.filter((f) => f.includes("Checklist") || f.includes("Goal") || f.includes("Metric")),
      assumptions: [],
      missing_data: nCtx.missing_fields,
      confidence: evidence.recommendation_readiness.growth === "high" ? "high" : "medium",
      expected_outcome: "Growth döngüsü somut adımlarla ilerler.",
      user_action: "Growth checklist veya tasks ekranında sıradaki maddeyi tamamla.",
    };

    if (evidence.source_state.connected_providers.length === 0 && evidence.metric_state.has_setup) {
      supporting.push({
        title: "Bir veri kaynağı bağla",
        type: "source_setup",
        priority: "low",
        impact_area: "measurement",
        why_now: "Manuel veri girişi çalışıyor ama otomatik kaynak daha güvenilir.",
        supporting_evidence: ["No connected sources"],
        assumptions: ["Product has web or mobile platform that supports GA4 or Stripe"],
        missing_data: ["validated_source"],
        confidence: "medium",
        expected_outcome: "Metrik verisi otomatik güncellenir.",
        user_action: "Kaynaklar ekranından GA4 veya Stripe bağla.",
      });
    }
  }

  return {
    primary_recommendation: primary,
    supporting_recommendations: supporting.slice(0, 3),
    missing_information_for_better_guidance: nCtx.missing_fields.length > 0
      ? nCtx.missing_fields
      : evidence.unknown_facts.slice(0, 3),
    critic_status: "fallback",
  };
}

// ─── AI response validation ─────────────────────────────────────────────────

function isValidRecommendation(rec: unknown): rec is Recommendation {
  if (!rec || typeof rec !== "object") return false;
  const r = rec as Record<string, unknown>;
  return typeof r.title === "string" && typeof r.type === "string" && typeof r.confidence === "string";
}

function sanitizeRecommendationOutput(data: unknown): CoachRecommendationOutput | null {
  if (!data || typeof data !== "object") return null;
  const obj = data as Record<string, unknown>;

  // Hard gate: primary must have title + type + confidence
  if (!isValidRecommendation(obj.primary_recommendation)) return null;

  const primary = obj.primary_recommendation as Recommendation;

  // Soft fix: ensure missing_data is array
  if (!Array.isArray(primary.missing_data)) {
    primary.missing_data = [];
  }

  // Soft fix: filter malformed supporting recs
  const rawSupporting = Array.isArray(obj.supporting_recommendations) ? obj.supporting_recommendations : [];
  const validSupporting = rawSupporting.filter(isValidRecommendation).slice(0, 3) as Recommendation[];
  for (const rec of validSupporting) {
    if (!Array.isArray(rec.missing_data)) rec.missing_data = [];
  }

  // Soft fix: ensure root missing_information is array
  const missingInfo = Array.isArray(obj.missing_information_for_better_guidance)
    ? obj.missing_information_for_better_guidance as string[]
    : [];

  return {
    primary_recommendation: primary,
    supporting_recommendations: validSupporting,
    missing_information_for_better_guidance: missingInfo,
    critic_status: obj.critic_status === "approved" || obj.critic_status === "revised" || obj.critic_status === "fallback"
      ? obj.critic_status
      : "approved",
  };
}

function normalizeText(value: string | undefined) {
  return (value ?? "")
    .toLocaleLowerCase("tr-TR")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function similarityByContainment(a: string, b: string) {
  if (!a || !b) return false;
  return a === b || a.includes(b) || b.includes(a);
}

function isTooSimilarToPrevious(
  rec: Recommendation,
  previousAnswer?: PreviousCoachAnswer | null
) {
  if (!previousAnswer) return false;

  const prevTitle = normalizeText(previousAnswer.title);
  const prevAction = normalizeText(previousAnswer.user_action);
  const nextTitle = normalizeText(rec.title);
  const nextAction = normalizeText(rec.user_action);

  return (
    similarityByContainment(nextTitle, prevTitle) ||
    similarityByContainment(nextAction, prevAction)
  );
}

function avoidRepeatWithPrevious(
  output: CoachRecommendationOutput,
  previousAnswer?: PreviousCoachAnswer | null,
  context?: FounderCoachContext
): CoachRecommendationOutput {
  if (!previousAnswer || !isTooSimilarToPrevious(output.primary_recommendation, previousAnswer)) {
    return output;
  }

  const alternative = output.supporting_recommendations.find(
    (rec) => !isTooSimilarToPrevious(rec, previousAnswer)
  );

  if (!alternative) {
    if (!context) {
      return output;
    }

    const fallback = buildStageFallback(context);
    if (!isTooSimilarToPrevious(fallback.primary_recommendation, previousAnswer)) {
      return {
        ...fallback,
        critic_status: "fallback",
      };
    }

    const deterministicAlternative = buildDeterministicAlternative(context);
    if (deterministicAlternative && !isTooSimilarToPrevious(deterministicAlternative, previousAnswer)) {
      return {
        primary_recommendation: deterministicAlternative,
        supporting_recommendations: output.supporting_recommendations.filter(
          (rec) => !isTooSimilarToPrevious(rec, previousAnswer)
        ).slice(0, 3),
        missing_information_for_better_guidance:
          output.missing_information_for_better_guidance,
        critic_status: "fallback",
      };
    }

    return output;
  }

  return {
    ...output,
    primary_recommendation: alternative,
    supporting_recommendations: [
      output.primary_recommendation,
      ...output.supporting_recommendations.filter((rec) => rec.title !== alternative.title),
    ].slice(0, 3),
    critic_status: output.critic_status === "fallback" ? "fallback" : "revised",
  };
}

function buildDeterministicAlternative(
  context: FounderCoachContext
): Recommendation | null {
  const stage = context.normalizedContext.stage;
  const missing = context.normalizedContext.missing_fields;
  const evidence = context.evidenceMap;

  if (stage === "idea" || stage === "development" || stage === "testing" || stage === "launch_prep") {
    return {
      title: "Eksik ürün bağlamını netleştir",
      type: "readiness_next_step",
      priority: "medium",
      impact_area: "launch",
      why_now:
        missing.length > 0
          ? `Daha iyi yönlendirme için hâlâ eksik bağlam var: ${missing.slice(0, 3).join(", ")}.`
          : "Launch öncesinde net ürün bağlamı sonraki önerilerin kalitesini yükseltir.",
      supporting_evidence: evidence.known_facts.filter((fact) => fact.includes("Stage")).slice(0, 2),
      assumptions: [],
      missing_data: missing,
      confidence: missing.length > 0 ? "high" : "medium",
      expected_outcome: "Sonraki AI önerileri daha somut ve ürününe özel hale gelir.",
      user_action: "Settings > Product altında eksik ürün bilgilerini tamamla.",
    };
  }

  if (stage === "live") {
    if (!evidence.metric_state.has_setup) {
      return {
        title: "İlk veri kaynağını bağla",
        type: "source_setup",
        priority: "medium",
        impact_area: "measurement",
        why_now: "Metrik setup'tan hemen sonra otomatik veri akışı kurmak karar kalitesini artırır.",
        supporting_evidence: ["No connected sources"],
        assumptions: [],
        missing_data: ["connected_source"],
        confidence: "medium",
        expected_outcome: "Metrik akışı manuel girişe daha az bağımlı olur.",
        user_action: "Sources altında GA4, Stripe veya uygun store kaynağını bağla.",
      };
    }

    return {
      title: "İlk haftalık hedefini yaz",
      type: "weekly_focus",
      priority: "medium",
      impact_area: "activation",
      why_now: "Tekrarlayan öneri yerine haftalık odak belirlemek execution'ı netleştirir.",
      supporting_evidence: evidence.known_facts.filter((fact) => fact.includes("Metric")).slice(0, 2),
      assumptions: [],
      missing_data: [],
      confidence: "medium",
      expected_outcome: "Bu hafta hangi metriği ileri taşıyacağını netleştirirsin.",
      user_action: "Goals veya Tasks tarafında bu haftanın tek growth hedefini yaz.",
    };
  }

  return {
    title: "Bir veri kaynağı bağla",
    type: "source_setup",
    priority: "medium",
    impact_area: "measurement",
    why_now: "Tekrar eden öneri yerine veri akışını güçlendirmek sonraki kararları keskinleştirir.",
    supporting_evidence: evidence.source_state.connected_providers.length === 0 ? ["No connected sources"] : evidence.known_facts.slice(0, 2),
    assumptions: [],
    missing_data: evidence.source_state.connected_providers.length === 0 ? ["connected_source"] : [],
    confidence: "medium",
    expected_outcome: "AI ve growth yüzeyleri daha güncel verilere dayanır.",
    user_action: "Settings > Sources altında bir veri kaynağı bağla.",
  };
}

// ─── Rule-based critic pass (Playbook §12) ─────────────────────────────────

/** Types that are only valid in pre-launch stages */
const PRE_LAUNCH_ONLY_TYPES: Set<RecommendationType> = new Set(["launch_blocker", "readiness_next_step"]);
/** Types that require a live/growing product */
const POST_LAUNCH_ONLY_TYPES: Set<RecommendationType> = new Set(["metric_selection", "weak_link", "weekly_focus", "daily_action"]);
const PRE_LAUNCH_STAGES: Set<string> = new Set(["idea", "development", "testing", "launch_prep"]);
const POST_LAUNCH_STAGES: Set<string> = new Set(["live", "early_growth"]);

function isTypeStageMismatch(type: RecommendationType, stage: string): boolean {
  if (PRE_LAUNCH_ONLY_TYPES.has(type) && POST_LAUNCH_STAGES.has(stage)) return true;
  if (POST_LAUNCH_ONLY_TYPES.has(type) && PRE_LAUNCH_STAGES.has(stage)) return true;
  // source_setup too early for idea/development
  if (type === "source_setup" && (stage === "idea" || stage === "development")) return true;
  return false;
}

function applyCriticPass(
  output: CoachRecommendationOutput,
  context: FounderCoachContext
): CoachRecommendationOutput | null {
  const stage = context.normalizedContext.stage;
  const primary = output.primary_recommendation;
  let revised = false;

  // ── Reject: stage mismatch on primary ──
  if (isTypeStageMismatch(primary.type as RecommendationType, stage)) {
    return null; // caller falls back to buildStageFallback
  }

  // ── Reject: low confidence + high priority blocker (§9) ──
  if (primary.confidence === "low" && primary.priority === "high") {
    return null;
  }

  // ── Reject: no supporting evidence at all ──
  if (!primary.supporting_evidence || primary.supporting_evidence.length === 0) {
    return null;
  }

  // ── Reject: title too short / generic-AI-filler indicator ──
  // A title under 12 characters is almost always a placeholder ("Set up GA4")
  // without enough specificity for the founder to act on.
  if (primary.title.trim().length < 12) {
    return null;
  }

  // ── Revise: confidence overstated — many missing_data items but high confidence ──
  if (primary.confidence === "high" && primary.missing_data.length >= 3) {
    primary.confidence = "medium";
    revised = true;
  }

  // ── Revise: medium confidence should not carry high priority (§9 spirit) ──
  if (primary.confidence === "medium" && primary.priority === "high") {
    primary.priority = "medium";
    revised = true;
  }

  // ── Revise: drop supporting recs that have stage mismatch ──
  const beforeCount = output.supporting_recommendations.length;
  output.supporting_recommendations = output.supporting_recommendations.filter(
    (rec) => !isTypeStageMismatch(rec.type as RecommendationType, stage)
  );
  if (output.supporting_recommendations.length < beforeCount) revised = true;

  // ── Revise: drop supporting recs that duplicate primary title ──
  const primaryTitle = primary.title.toLocaleLowerCase("tr-TR");
  const beforeDedup = output.supporting_recommendations.length;
  output.supporting_recommendations = output.supporting_recommendations.filter(
    (rec) => rec.title.toLocaleLowerCase("tr-TR") !== primaryTitle
  );
  if (output.supporting_recommendations.length < beforeDedup) revised = true;

  // ── Revise: downgrade supporting rec confidence if missing_data >= 3 ──
  for (const rec of output.supporting_recommendations) {
    if (rec.confidence === "high" && rec.missing_data.length >= 3) {
      rec.confidence = "medium";
      revised = true;
    }
  }

  // ── Revise: drop supporting recs with title too short (filler heuristic) ──
  const beforeShort = output.supporting_recommendations.length;
  output.supporting_recommendations = output.supporting_recommendations.filter(
    (rec) => rec.title.trim().length >= 12
  );
  if (output.supporting_recommendations.length < beforeShort) revised = true;

  // ── Revise: dedupe supporting recs by impact_area ──
  // Prevents the founder from seeing two "metric_selection" recs at once.
  // Keeps the first occurrence per impact_area.
  const seenAreas = new Set<string>();
  const beforeArea = output.supporting_recommendations.length;
  output.supporting_recommendations = output.supporting_recommendations.filter((rec) => {
    if (!rec.impact_area) return true;
    const key = String(rec.impact_area).toLowerCase();
    if (seenAreas.has(key)) return false;
    seenAreas.add(key);
    return true;
  });
  if (output.supporting_recommendations.length < beforeArea) revised = true;

  // ── Revise: hard cap supporting recs to 2 (was 3) for focus discipline ──
  // Three competing alternatives is a recommendation rail, not a recommendation.
  if (output.supporting_recommendations.length > 2) {
    output.supporting_recommendations = output.supporting_recommendations.slice(0, 2);
    revised = true;
  }

  if (revised) {
    output.critic_status = "revised";
  }

  return output;
}

// ─── Exported functions ─────────────────────────────────────────────────────

export async function getFounderCoachAnswer(
  context: FounderCoachContext,
  userMessage: string,
  previousAnswer?: PreviousCoachAnswer | null
): Promise<CoachRecommendationOutput> {
  // Evidence-readiness gate
  if (shouldReturnDataCollectionFallback(context)) {
    return makeDataCollectionFallback(context);
  }

  const prompt = await buildReactivePrompt(context, userMessage, previousAnswer);
  const raw = await callCoachModel<unknown>(prompt, context);
  const sanitized = sanitizeRecommendationOutput(raw);
  if (sanitized) {
    const critiqued = applyCriticPass(sanitized, context);
    if (critiqued) return avoidRepeatWithPrevious(critiqued, previousAnswer, context);
  }
  return buildStageFallback(context);
}

export async function getFounderCoachSuggestion(context: FounderCoachContext): Promise<CoachRecommendationOutput | null> {
  // Evidence-readiness gate
  if (shouldReturnDataCollectionFallback(context)) {
    return makeDataCollectionFallback(context);
  }

  const prompt = await buildProactivePrompt(context);
  const raw = await callCoachModel<unknown>(prompt, context);
  const sanitized = sanitizeRecommendationOutput(raw);
  if (sanitized) {
    const critiqued = applyCriticPass(sanitized, context);
    if (critiqued) return critiqued;
  }
  return buildStageFallback(context);
}
