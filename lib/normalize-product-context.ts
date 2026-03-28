/**
 * Normalized Product Context
 *
 * Converts raw product data into the structured context contract
 * defined in the AI Agent System Playbook (§5.2-5.4).
 *
 * Agents should NEVER consume raw user answers directly.
 * They should consume this normalized context.
 */

// ─── Types ──────────────────────────────────────────────────────────────────

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
  context_confidence: ConfidenceLevel;
  missing_fields: string[];
  ambiguity_flags: string[];
}

// ─── Raw input type (from Product + MetricSetup DB records) ──────────────

export interface RawProductInput {
  name: string;
  description?: string | null;
  website?: string | null;
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  launchStatus?: string | null;
  launchDate?: Date | string | null;
  launchGoals?: string | null; // JSON: { goalKey, growthGoal }
  platforms?: string[]; // from MetricSetup.platforms
}

// ─── Stage mapping ──────────────────────────────────────────────────────────

const STAGE_MAP: Record<string, StageEnum> = {
  "Geliştirme aşamasında": "development",
  "Test kullanıcıları var": "testing",
  "Yakında yayında": "launch_prep",
  "Yayında": "live",
  "Büyüme aşamasında": "early_growth",
};

// ─── Goal mapping ───────────────────────────────────────────────────────────

const GOAL_MAP: Record<string, GoalEnum> = {
  get_first_users: "get_first_users",
  validate_product: "validate_product",
  reach_first_value_usage: "reach_first_value_usage",
  get_first_revenue: "get_first_revenue",
  build_growth_rhythm: "build_growth_rhythm",
  prepare_launch: "prepare_launch",
  // Fallback from Turkish labels (legacy data)
  "İlk kullanıcıları kazanmak": "get_first_users",
  "Ürünü doğrulamak": "validate_product",
  "İlk tekrar kullanımı sağlamak": "reach_first_value_usage",
  "İlk ödeme yapan müşteriyi bulmak": "get_first_revenue",
  "Büyüme ritmi kurmak": "build_growth_rhythm",
  // Legacy labels
  "Retention'ı güçlendirmek": "reach_first_value_usage",
  "MRR'ı büyütmek": "get_first_revenue",
  "Büyümeyi ölçeklemek": "build_growth_rhythm",
};

// ─── Category normalization ─────────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string> = {
  SaaS: "SaaS",
  "Mobil uygulama": "Mobile App",
  "E-ticaret": "Ecommerce",
  Marketplace: "Marketplace",
  "İçerik/Medya": "Content / Media",
  Platform: "Developer Tool / Platform",
  "Diğer": "Other",
};

// ─── Ambiguity detection (playbook §5.4) ────────────────────────────────────

function detectAmbiguities(ctx: Partial<NormalizedProductContext>, raw: RawProductInput): string[] {
  const flags: string[] = [];

  // Description conflicts with category
  if (ctx.product_summary && ctx.categories?.[0]) {
    const summary = ctx.product_summary.toLowerCase();
    const cat = ctx.categories[0];
    if (cat === "Ecommerce" && (summary.includes("content") || summary.includes("içerik") || summary.includes("automation"))) {
      flags.push("description_category_mismatch: description suggests content/automation but category is Ecommerce");
    }
    if (cat === "SaaS" && (summary.includes("marketplace") || summary.includes("alıcı") || summary.includes("satıcı"))) {
      flags.push("description_category_mismatch: description suggests marketplace but category is SaaS");
    }
  }

  // Stage + goal odd combinations
  if (ctx.stage === "development" && ctx.primary_goal === "build_growth_rhythm") {
    flags.push("stage_goal_mismatch: development stage with growth rhythm goal is unusual");
  }
  if (ctx.stage === "early_growth" && ctx.primary_goal === "prepare_launch") {
    flags.push("stage_goal_mismatch: early_growth stage with prepare_launch goal is contradictory");
  }

  // launch_prep but no platform
  if (ctx.stage === "launch_prep" && (!ctx.platforms || ctx.platforms.length === 0)) {
    flags.push("launch_prep_no_platform: launch preparation stage but no platform specified");
  }

  // live/early_growth but no business model, sources, or metrics context
  if ((ctx.stage === "live" || ctx.stage === "early_growth") && !ctx.business_model) {
    flags.push("live_no_business_model: product is live but no business model specified");
  }

  return flags;
}

// ─── Main normalization function ────────────────────────────────────────────

export function normalizeProductContext(raw: RawProductInput): NormalizedProductContext {
  const missing: string[] = [];

  // Required fields check
  if (!raw.name) missing.push("product_name");
  if (!raw.description) missing.push("product_description");
  if (!raw.category) missing.push("category");
  if (!raw.targetAudience) missing.push("target_audience");
  if (!raw.businessModel) missing.push("business_model");
  if (!raw.launchStatus) missing.push("stage");
  if (!raw.platforms || raw.platforms.length === 0) missing.push("platform_type");

  // Parse goalKey from launchGoals JSON
  let goalKey: string | undefined;
  let growthGoal: string | undefined;
  if (raw.launchGoals) {
    try {
      const parsed = JSON.parse(raw.launchGoals);
      goalKey = parsed.goalKey;
      growthGoal = parsed.growthGoal;
    } catch {
      // Legacy: launchGoals might be a plain string
      growthGoal = raw.launchGoals;
    }
  }
  if (!goalKey && !growthGoal) missing.push("primary_goal");

  // Normalize stage
  const stage: StageEnum = raw.launchStatus
    ? STAGE_MAP[raw.launchStatus] ?? "development"
    : "development";

  // Normalize goal
  const resolvedGoalKey = goalKey ?? growthGoal ?? "";
  const primary_goal: GoalEnum = GOAL_MAP[resolvedGoalKey] ?? deriveGoalFromStage(stage);

  // Normalize category
  const normalizedCategory = raw.category ? CATEGORY_MAP[raw.category] ?? raw.category : "";

  // Normalize launch date
  const planned_launch_date = raw.launchDate
    ? typeof raw.launchDate === "string"
      ? raw.launchDate
      : raw.launchDate.toISOString().slice(0, 10)
    : "";

  const ctx: NormalizedProductContext = {
    product_name: raw.name,
    product_summary: raw.description ?? "",
    product_url: raw.website ?? "",
    categories: normalizedCategory ? [normalizedCategory] : [],
    platforms: raw.platforms ?? [],
    primary_audience: raw.targetAudience ?? "",
    secondary_audience: [],
    business_model: raw.businessModel ?? "",
    sales_motion: "",
    stage,
    primary_goal,
    planned_launch_date,
    context_confidence: computeConfidence(missing),
    missing_fields: missing,
    ambiguity_flags: [],
  };

  ctx.ambiguity_flags = detectAmbiguities(ctx, raw);

  return ctx;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function computeConfidence(missing: string[]): ConfidenceLevel {
  if (missing.length === 0) return "high";
  if (missing.length <= 2) return "medium";
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
