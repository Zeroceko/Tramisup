/**
 * Normalized Product Context
 *
 * Converts raw product data into the structured context contract
 * defined in the AI Agent System Playbook (§5.2-5.4).
 *
 * Agents should NEVER consume raw user answers directly.
 * They should consume this normalized context.
 */

export type StageEnum =
  | "idea"
  | "development"
  | "testing"
  | "launch_prep"
  | "live"
  | "early_growth";

export type GoalEnum =
  | "prepare_launch"
  | "get_first_users"
  | "validate_product"
  | "reach_first_value_usage"
  | "get_first_revenue"
  | "build_growth_rhythm";

export type ConfidenceLevel = "high" | "medium" | "low";

export interface DescriptionUnderstanding {
  source_quality: ConfidenceLevel;
  problem_summary: string;
  user_segments: string[];
  pain_points: string[];
  value_props: string[];
  use_cases: string[];
  acquisition_channels: string[];
  monetization_hints: string[];
  evidence_phrases: string[];
}

export interface NormalizedProductContext {
  product_name: string;
  product_summary: string;
  product_url: string;
  categories: string[];
  platforms: string[];
  primary_audience: string;
  secondary_audience: string[];
  business_model: string;
  sales_motion: string;
  stage: StageEnum;
  primary_goal: GoalEnum;
  planned_launch_date: string;
  description_understanding: DescriptionUnderstanding;
  context_confidence: ConfidenceLevel;
  missing_fields: string[];
  ambiguity_flags: string[];
}

export interface RawProductInput {
  name: string;
  description?: string | null;
  website?: string | null;
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  launchStatus?: string | null;
  launchDate?: Date | string | null;
  launchGoals?: string | null;
  platforms?: string[];
}

const STAGE_MAP: Record<string, StageEnum> = {
  "Fikir aşamasında": "idea",
  "Idea stage": "idea",
  Idea: "idea",
  "Geliştirme aşamasında": "development",
  Development: "development",
  "Test kullanıcıları var": "testing",
  Testing: "testing",
  "Yakında yayında": "launch_prep",
  "Launching soon": "launch_prep",
  "Launch prep": "launch_prep",
  "Yayında": "live",
  Live: "live",
  "Büyüme aşamasında": "early_growth",
  Growing: "early_growth",
  "Early growth": "early_growth",
};

const GOAL_MAP: Record<string, GoalEnum> = {
  get_first_users: "get_first_users",
  validate_product: "validate_product",
  reach_first_value_usage: "reach_first_value_usage",
  get_first_revenue: "get_first_revenue",
  build_growth_rhythm: "build_growth_rhythm",
  prepare_launch: "prepare_launch",
  "İlk kullanıcıları kazanmak": "get_first_users",
  "Ürünü doğrulamak": "validate_product",
  "İlk tekrar kullanımı sağlamak": "reach_first_value_usage",
  "İlk ödeme yapan müşteriyi bulmak": "get_first_revenue",
  "Büyüme ritmi kurmak": "build_growth_rhythm",
  "Retention'ı güçlendirmek": "reach_first_value_usage",
  "MRR'ı büyütmek": "get_first_revenue",
  "Büyümeyi ölçeklemek": "build_growth_rhythm",
  "Get first users": "get_first_users",
  "Validate product": "validate_product",
  "Reach first value usage": "reach_first_value_usage",
  "Get first revenue": "get_first_revenue",
  "Build growth rhythm": "build_growth_rhythm",
  "Prepare launch": "prepare_launch",
};

const CATEGORY_MAP: Record<string, string> = {
  SaaS: "SaaS",
  "Mobil uygulama": "Mobile App",
  "Mobile App": "Mobile App",
  "E-ticaret": "Ecommerce",
  Ecommerce: "Ecommerce",
  Marketplace: "Marketplace",
  "İçerik/Medya": "Content / Media",
  "Content / Media": "Content / Media",
  Platform: "Developer Tool / Platform",
  "Platform / Tool": "Developer Tool / Platform",
  "Developer Tool / Platform": "Developer Tool / Platform",
  "AI Product": "AI Product",
  "Diğer": "Other",
  Other: "Other",
};

type SignalDefinition = { label: string; pattern: RegExp };

const USER_SEGMENT_SIGNALS: SignalDefinition[] = [
  { label: "consumers", pattern: /\bconsumer|consumers|b2c|individual|personal|tüketici|bireysel\b/i },
  { label: "freelancers", pattern: /\bfreelancer|freelancers|solopreneur|consultant|danışman|bağımsız çalışan\b/i },
  { label: "developers", pattern: /\bdeveloper|developers|engineer|engineers|api consumer|geliştirici|yazılımcı\b/i },
  { label: "founders", pattern: /\bfounder|founders|startup team|startup teams|kurucu|startup ekip/i },
  { label: "smbs", pattern: /\bsmb|smbs|small business|small businesses|kobi|küçük işletme\b/i },
  { label: "enterprise_teams", pattern: /\benterprise|corporate|corporates|kurumsal\b/i },
  { label: "internal_teams", pattern: /\binternal team|internal teams|ops team|operations team|iç ekip|operasyon ekibi\b/i },
  { label: "creators", pattern: /\bcreator|creators|influencer|influencers|newsletter writer|podcaster|içerik üretici\b/i },
  { label: "education", pattern: /\bstudent|students|teacher|teachers|educator|school|öğrenci|eğitimci\b/i },
  { label: "marketers", pattern: /\bmarketer|marketers|growth team|marketing team|pazarlama\b/i },
  { label: "sales_teams", pattern: /\bsales team|sales teams|sales reps|satış ekibi\b/i },
];

const PAIN_POINT_SIGNALS: SignalDefinition[] = [
  { label: "manual_work", pattern: /\bmanual|manually|spreadsheet|copy paste|excel|elle|manuel\b/i },
  { label: "poor_visibility", pattern: /\bno visibility|unclear|can't track|can not track|lack of insight|belirsiz|takip edem/i },
  { label: "slow_workflow", pattern: /\bslow|too many steps|bottleneck|friction|yavaş|sürtünme|çok adım\b/i },
  { label: "retention_drop", pattern: /\bchurn|drop off|retention|geri dönm|elde tutma\b/i },
  { label: "acquisition_gap", pattern: /\btraffic|acquisition|lead generation|top of funnel|trafik|edinim\b/i },
  { label: "coordination_issues", pattern: /\bcollaboration gap|handoff|coordination|alignment|koordinasyon|iletişim kopukluğu\b/i },
  { label: "billing_complexity", pattern: /\bbilling|invoice|payment ops|subscription management|fatura|ödeme operasyonu\b/i },
  { label: "discovery_gap", pattern: /\bfind the right|discovery|matching|discoverability|eşleşme|bulmakta zorlan\b/i },
];

const VALUE_PROP_SIGNALS: SignalDefinition[] = [
  { label: "automation", pattern: /\bautomate|automation|workflow|otomasyon|akış\b/i },
  { label: "analytics", pattern: /\banalytics|dashboard|reporting|insight|ölçüm|analitik|raporlama\b/i },
  { label: "collaboration", pattern: /\bcollaboration|workspace|shared|team inbox|iş birliği|ortak çalışma\b/i },
  { label: "lead_capture", pattern: /\blead|pipeline|crm|deal|müşteri adayı\b/i },
  { label: "payments", pattern: /\bpayment|billing|subscription|checkout|ödeme|abonelik\b/i },
  { label: "scheduling", pattern: /\bschedule|booking|calendar|appointment|randevu|takvim\b/i },
  { label: "content_creation", pattern: /\bcontent|post|newsletter|blog|video|içerik\b/i },
  { label: "learning", pattern: /\blearn|course|lesson|practice|öğren|ders\b/i },
  { label: "market_matching", pattern: /\bmarketplace|buyer|seller|vendor|supply|demand|alıcı|satıcı\b/i },
];

const USE_CASE_SIGNALS: SignalDefinition[] = [
  { label: "onboarding", pattern: /\bonboarding|activation|aha moment|ilk değer\b/i },
  { label: "growth_measurement", pattern: /\bgrowth|funnel|retention|cohort|aarrr|growth loop\b/i },
  { label: "sales_ops", pattern: /\bsales|pipeline|crm|deal flow|teklif\b/i },
  { label: "customer_support", pattern: /\bsupport|ticket|help desk|customer success|destek\b/i },
  { label: "creator_workflow", pattern: /\bnewsletter|creator|social post|content calendar|podcast\b/i },
  { label: "commerce", pattern: /\bshop|checkout|cart|order|inventory|mağaza|sipariş\b/i },
  { label: "mobile_subscription", pattern: /\bapp store|play store|mobile subscription|in-app purchase|uygulama içi satın alma\b/i },
  { label: "developer_infrastructure", pattern: /\bapi|sdk|developer platform|integration|webhook\b/i },
  { label: "matching_marketplace", pattern: /\bmarketplace|booking|match users|directory|listing\b/i },
];

const ACQUISITION_CHANNEL_SIGNALS: SignalDefinition[] = [
  { label: "seo", pattern: /\bseo|search traffic|organic search|arama trafiği\b/i },
  { label: "content", pattern: /\bcontent marketing|newsletter|blog|youtube|podcast|içerik\b/i },
  { label: "community", pattern: /\breddit|discord|slack community|community|topluluk\b/i },
  { label: "social", pattern: /\btwitter|linkedin|tiktok|instagram|x.com\b/i },
  { label: "paid_ads", pattern: /\bmeta ads|google ads|paid acquisition|performance marketing|reklam\b/i },
  { label: "referral", pattern: /\breferral|invite a friend|word of mouth|recommend|davet\b/i },
  { label: "sales", pattern: /\boutbound|sales-led|demo call|cold email|satış\b/i },
  { label: "app_stores", pattern: /\bapp store|play store|aso\b/i },
];

const MONETIZATION_SIGNALS: SignalDefinition[] = [
  { label: "subscription", pattern: /\bsubscription|monthly|yearly|abonelik|aylık|yıllık\b/i },
  { label: "freemium", pattern: /\bfreemium|free trial|trial|ücretsiz plan|deneme\b/i },
  { label: "usage_based", pattern: /\busage based|pay as you go|token|credit based|kullanıma göre\b/i },
  { label: "one_time", pattern: /\bone-time|lifetime|single purchase|tek seferlik\b/i },
  { label: "commission", pattern: /\bcommission|take rate|marketplace fee|komisyon\b/i },
  { label: "ads", pattern: /\bad revenue|sponsorship|advertising|reklam|sponsorluk\b/i },
  { label: "enterprise_sales", pattern: /\benterprise plan|custom quote|sales-led|özel teklif|kurumsal\b/i },
];

function splitList(value?: string | null) {
  return value
    ?.split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

function unique(items: string[]) {
  return Array.from(new Set(items));
}

function collectSignals(text: string, definitions: SignalDefinition[]) {
  return definitions
    .filter((definition) => definition.pattern.test(text))
    .map((definition) => definition.label);
}

function extractEvidencePhrases(text: string) {
  return unique(
    text
      .split(/[\n.!?]+/)
      .map((sentence) => sentence.trim())
      .filter((sentence) => sentence.length >= 18)
  ).slice(0, 3);
}

function extractProblemSummary(text: string) {
  const firstSentence = text
    .split(/[\n.!?]+/)
    .map((sentence) => sentence.trim())
    .find(Boolean);

  return (firstSentence ?? text.trim()).slice(0, 220);
}

function mapAudienceSelection(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("tüketici") || lower.includes("consumer")) return "consumers";
  if (lower.includes("freelancer")) return "freelancers";
  if (lower.includes("geliştirici") || lower.includes("developer")) return "developers";
  if (lower.includes("startup")) return "founders";
  if (lower.includes("kobi") || lower.includes("small business")) return "smbs";
  if (lower.includes("kurumsal") || lower.includes("enterprise")) return "enterprise_teams";
  if (lower.includes("iç ekip") || lower.includes("internal")) return "internal_teams";
  if (lower.includes("içerik üretici") || lower.includes("creator")) return "creators";
  if (lower.includes("eğitim") || lower.includes("education")) return "education";
  return lower;
}

function mapBusinessModelSelection(value: string) {
  const lower = value.toLowerCase();
  if (lower.includes("abonelik") || lower.includes("subscription")) return "subscription";
  if (lower.includes("freemium") || lower.includes("trial")) return "freemium";
  if (lower.includes("kullanım") || lower.includes("usage")) return "usage_based";
  if (lower.includes("tek seferlik") || lower.includes("one-time")) return "one_time";
  if (lower.includes("komisyon") || lower.includes("commission")) return "commission";
  if (lower.includes("reklam") || lower.includes("sponsorluk") || lower.includes("ad")) return "ads";
  if (lower.includes("kurumsal") || lower.includes("özel teklif") || lower.includes("enterprise")) return "enterprise_sales";
  return lower;
}

function extractDescriptionUnderstanding(raw: RawProductInput): DescriptionUnderstanding {
  const description = raw.description?.trim() ?? "";
  const audience = raw.targetAudience ?? "";
  const businessModel = raw.businessModel ?? "";
  const category = raw.category ?? "";
  const combined = [description, audience, businessModel, category].filter(Boolean).join(" ");
  const normalized = combined.toLowerCase();

  if (!combined) {
    return {
      source_quality: "low",
      problem_summary: "",
      user_segments: [],
      pain_points: [],
      value_props: [],
      use_cases: [],
      acquisition_channels: [],
      monetization_hints: [],
      evidence_phrases: [],
    };
  }

  const userSegments = unique([
    ...collectSignals(normalized, USER_SEGMENT_SIGNALS),
    ...splitList(raw.targetAudience).map(mapAudienceSelection),
  ]);
  const painPoints = unique(collectSignals(normalized, PAIN_POINT_SIGNALS));
  const valueProps = unique(collectSignals(normalized, VALUE_PROP_SIGNALS));
  const useCases = unique(collectSignals(normalized, USE_CASE_SIGNALS));
  const acquisitionChannels = unique(collectSignals(normalized, ACQUISITION_CHANNEL_SIGNALS));
  const monetizationHints = unique([
    ...collectSignals(normalized, MONETIZATION_SIGNALS),
    ...splitList(raw.businessModel).map(mapBusinessModelSelection),
  ]);
  const evidencePhrases = extractEvidencePhrases(description);

  const score =
    (description.split(/\s+/).filter(Boolean).length >= 12 ? 1 : 0) +
    (userSegments.length > 0 ? 1 : 0) +
    (painPoints.length > 0 ? 1 : 0) +
    (valueProps.length > 0 ? 1 : 0) +
    (useCases.length > 0 ? 1 : 0);

  return {
    source_quality: score >= 4 ? "high" : score >= 2 ? "medium" : "low",
    problem_summary: extractProblemSummary(description),
    user_segments: userSegments,
    pain_points: painPoints,
    value_props: valueProps,
    use_cases: useCases,
    acquisition_channels: acquisitionChannels,
    monetization_hints: monetizationHints,
    evidence_phrases: evidencePhrases,
  };
}

function detectAmbiguities(ctx: Partial<NormalizedProductContext>, raw: RawProductInput): string[] {
  const flags: string[] = [];
  const understanding = ctx.description_understanding;

  if (ctx.product_summary && ctx.categories?.[0]) {
    const summary = ctx.product_summary.toLowerCase();
    const cat = ctx.categories[0];
    if (cat === "Ecommerce" && (summary.includes("content") || summary.includes("içerik") || summary.includes("automation"))) {
      flags.push("description_category_mismatch: description suggests content or automation but category is Ecommerce");
    }
    if (cat === "SaaS" && (summary.includes("marketplace") || summary.includes("alıcı") || summary.includes("satıcı"))) {
      flags.push("description_category_mismatch: description suggests marketplace but category is SaaS");
    }
  }

  if (ctx.categories?.[0] === "Marketplace" && !/marketplace|buyer|seller|listing|satıcı|alıcı/i.test(ctx.product_summary ?? "")) {
    flags.push("category_needs_marketplace_evidence: category is Marketplace but description lacks buyer or seller language");
  }
  if (ctx.categories?.[0] === "Content / Media" && understanding?.use_cases.includes("developer_infrastructure")) {
    flags.push("description_category_mismatch: description suggests developer tool but category is Content / Media");
  }
  if (ctx.categories?.[0] === "Developer Tool / Platform" && understanding?.use_cases.includes("commerce")) {
    flags.push("description_category_mismatch: description suggests commerce but category is Developer Tool / Platform");
  }

  if (ctx.stage === "development" && ctx.primary_goal === "build_growth_rhythm") {
    flags.push("stage_goal_mismatch: development stage with growth rhythm goal is unusual");
  }
  if (ctx.stage === "early_growth" && ctx.primary_goal === "prepare_launch") {
    flags.push("stage_goal_mismatch: early_growth stage with prepare_launch goal is contradictory");
  }

  if (ctx.stage === "launch_prep" && (!ctx.platforms || ctx.platforms.length === 0)) {
    flags.push("launch_prep_no_platform: launch preparation stage but no platform specified");
  }

  if ((ctx.stage === "live" || ctx.stage === "early_growth") && !ctx.business_model) {
    flags.push("live_no_business_model: product is live but no business model specified");
  }

  if (understanding?.source_quality === "low" && raw.description) {
    flags.push("description_low_signal: description exists but does not provide enough specific product context");
  }

  if (!raw.targetAudience && (understanding?.user_segments.length ?? 0) === 0) {
    flags.push("audience_unclear: no structured audience and no audience signal inferred from description");
  }

  if (
    raw.targetAudience &&
    (understanding?.user_segments.length ?? 0) > 0 &&
    !understanding?.user_segments.some((segment) => raw.targetAudience?.toLowerCase().includes(segment.replaceAll("_", " ")))
  ) {
    flags.push("audience_alignment_needs_review: description suggests a different user segment than the structured audience");
  }

  return flags;
}

export function normalizeProductContext(raw: RawProductInput): NormalizedProductContext {
  const missing: string[] = [];

  if (!raw.name) missing.push("product_name");
  if (!raw.description) missing.push("product_description");
  if (!raw.category) missing.push("category");
  if (!raw.targetAudience) missing.push("target_audience");
  if (!raw.businessModel) missing.push("business_model");
  if (!raw.launchStatus) missing.push("stage");
  if (!raw.platforms || raw.platforms.length === 0) missing.push("platform_type");

  let goalKey: string | undefined;
  let growthGoal: string | undefined;
  if (raw.launchGoals) {
    try {
      const parsed = JSON.parse(raw.launchGoals);
      goalKey = parsed.goalKey;
      growthGoal = parsed.growthGoal;
    } catch {
      growthGoal = raw.launchGoals;
    }
  }
  if (!goalKey && !growthGoal) missing.push("primary_goal");

  const stage: StageEnum = raw.launchStatus
    ? STAGE_MAP[raw.launchStatus] ?? "development"
    : "development";

  const resolvedGoalKey = goalKey ?? growthGoal ?? "";
  const primary_goal: GoalEnum = GOAL_MAP[resolvedGoalKey] ?? deriveGoalFromStage(stage);

  const rawCategories = splitList(raw.category);
  const normalizedCategories = rawCategories.map((item) => CATEGORY_MAP[item] ?? item);
  const audiences = splitList(raw.targetAudience);
  const description_understanding = extractDescriptionUnderstanding(raw);

  const planned_launch_date = raw.launchDate
    ? typeof raw.launchDate === "string"
      ? raw.launchDate
      : raw.launchDate.toISOString().slice(0, 10)
    : "";

  const ctx: NormalizedProductContext = {
    product_name: raw.name,
    product_summary: raw.description ?? "",
    product_url: raw.website ?? "",
    categories: normalizedCategories,
    platforms: raw.platforms ?? [],
    primary_audience: audiences[0] ?? "",
    secondary_audience: audiences.slice(1),
    business_model: raw.businessModel ?? "",
    sales_motion: "",
    stage,
    primary_goal,
    planned_launch_date,
    description_understanding,
    context_confidence: "low",
    missing_fields: missing,
    ambiguity_flags: [],
  };

  ctx.ambiguity_flags = detectAmbiguities(ctx, raw);
  ctx.context_confidence = computeConfidence(
    missing,
    description_understanding.source_quality,
    ctx.ambiguity_flags.length
  );

  return ctx;
}

function computeConfidence(
  missing: string[],
  descriptionQuality: ConfidenceLevel,
  ambiguityCount: number
): ConfidenceLevel {
  if (missing.length === 0 && descriptionQuality === "high" && ambiguityCount === 0) {
    return "high";
  }
  if (missing.length <= 2 && descriptionQuality !== "low" && ambiguityCount <= 2) {
    return "medium";
  }
  if (missing.length <= 3 && descriptionQuality === "high" && ambiguityCount <= 1) {
    return "medium";
  }
  return "low";
}

function deriveGoalFromStage(stage: StageEnum): GoalEnum {
  switch (stage) {
    case "idea":
    case "development":
      return "validate_product";
    case "testing":
      return "validate_product";
    case "launch_prep":
      return "prepare_launch";
    case "live":
      return "get_first_users";
    case "early_growth":
      return "build_growth_rhythm";
  }
}
