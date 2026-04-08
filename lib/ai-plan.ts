import { z } from "zod";
import { generateStructuredFallback } from "../BrandLib/ai-client";
import type { LaunchCategory, GrowthCategory, Priority, TaskStatus } from "@prisma/client";
import { loadProjectSkill } from "@/lib/project-skill-loader";
import { mergeMobileLaunchBaseline } from "@/lib/mobile-launch-baseline";
import { normalizeProductContext, type NormalizedProductContext } from "@/lib/normalize-product-context";
import { tasksAreNearDuplicate } from "@/lib/task-parsing";
import { filterValidCandidates, type Locale, type TaskCandidate } from "@/lib/task-validator";

export type AiLaunchItem = {
  category: LaunchCategory;
  title: string;
  description?: string;
  whyItMatters?: string;
  doneCriteria?: string;
  nextAction?: string;
  priority: Priority;
  order: number;
};

export type AiGrowthItem = {
  category: GrowthCategory;
  title: string;
  description?: string;
  whyItMatters?: string;
  doneCriteria?: string;
  nextAction?: string;
  order: number;
};

export type AiTask = {
  title: string;
  description?: string;
  whyItMatters?: string;
  doneCriteria?: string;
  nextAction?: string;
  /** PRODUCT|MARKETING|LEGAL|TECH|ACQUISITION|ACTIVATION|RETENTION|REVENUE|MEASUREMENT */
  category?: string;
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
  locale?: string;
  category?: string;
  targetAudience?: string;
  businessModel?: string;
  launchStatus?: string;
  goalKey?: string;
  growthGoal?: string;
  website?: string;
  mobilePlatforms?: string[];
  websiteContent?: string;
  stageContext?: string;
  storeGuidance?: string;
};

// Structured fields are required at the schema level so the model literally
// cannot return shallow items. Validator + parser still run as a second guard.
const StructuredFields = {
  whyItMatters: z.string().min(10).max(220),
  doneCriteria: z.string().min(10).max(220),
  nextAction: z.string().min(10).max(220),
};

const MAX_LAUNCH_ITEMS = 15;
const MAX_GROWTH_ITEMS = 15;
const MAX_TASK_ITEMS = 8;

const TASK_CATEGORY_ENUM = z.enum([
  "PRODUCT",
  "MARKETING",
  "LEGAL",
  "TECH",
  "ACQUISITION",
  "ACTIVATION",
  "RETENTION",
  "REVENUE",
  "MEASUREMENT",
]);

const LaunchChecklistItemSchema = z.object({
  category: z.enum(["PRODUCT", "MARKETING", "LEGAL", "TECH"]),
  title: z.string().min(12).max(80),
  description: z.string(),
  ...StructuredFields,
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
});

const GrowthChecklistItemSchema = z.object({
  category: z.enum(["ACQUISITION", "ACTIVATION", "RETENTION", "REVENUE"]),
  title: z.string().min(12).max(80),
  description: z.string(),
  ...StructuredFields,
});

const TaskItemSchema = z.object({
  title: z.string().min(12).max(80),
  description: z.string(),
  ...StructuredFields,
  category: TASK_CATEGORY_ENUM,
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["TODO"]),
});

const PlanSchema = z.object({
  launchChecklist: z.array(LaunchChecklistItemSchema).min(5).max(MAX_LAUNCH_ITEMS),
  growthChecklist: z.array(GrowthChecklistItemSchema).min(4).max(MAX_GROWTH_ITEMS),
  tasks: z.array(TaskItemSchema).min(3).max(MAX_TASK_ITEMS),
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
  // Semantic dedupe: uses normalized token-set, not raw lowercase, so
  // "Set up GA4 analytics" and "Configure GA4 tracking" merge.
  const kept: T[] = [];
  for (const item of items) {
    const isDup = kept.some((k) => tasksAreNearDuplicate(k.title, item.title));
    if (!isDup) kept.push(item);
  }
  return kept;
}

function trimPlanText<T extends Record<string, unknown>>(item: T): T {
  return Object.fromEntries(
    Object.entries(item).map(([key, value]) => [
      key,
      typeof value === "string" ? value.trim() : value,
    ]),
  ) as T;
}

function sanitizeStructuredItems<T extends { title: string }>(
  input: unknown,
  schema: z.ZodType<T>,
  limit: number,
): T[] {
  if (!Array.isArray(input)) return [];
  const valid: T[] = [];
  for (const item of input) {
    const parsed = schema.safeParse(
      item && typeof item === "object" ? trimPlanText(item as Record<string, unknown>) : item,
    );
    if (!parsed.success) continue;
    valid.push(parsed.data);
  }
  return dedupeByTitle(valid).slice(0, limit);
}

export function sanitizeAiPlanOutput(
  raw: unknown,
  locale: Locale,
  isLaunchedStage: boolean,
): AiPlan | null {
  const source = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const launchChecklist = isLaunchedStage
    ? []
    : assignOrder(
        sanitizeStructuredItems(source.launchChecklist, LaunchChecklistItemSchema, MAX_LAUNCH_ITEMS),
      );
  const growthChecklist = assignOrder(
    sanitizeStructuredItems(source.growthChecklist, GrowthChecklistItemSchema, MAX_GROWTH_ITEMS),
  );

  const rawTasks = sanitizeStructuredItems(source.tasks, TaskItemSchema, MAX_TASK_ITEMS).map((task) => ({
    title: task.title,
    description: task.description,
    whyItMatters: task.whyItMatters,
    doneCriteria: task.doneCriteria,
    nextAction: task.nextAction,
    category: task.category,
    priority: task.priority,
  }));
  const { valid: validTasks, rejected } = filterValidCandidates(rawTasks, locale);
  if (rejected.length > 0) {
    console.warn(
      `[ai-plan] Rejected ${rejected.length}/${rawTasks.length} tasks during sanitization:`,
      rejected.map((r) => `${r.reason}${r.detail ? `:${r.detail}` : ""}`).join(", "),
    );
  }

  const tasks = isLaunchedStage
    ? dedupeByTitle(
        growthChecklist.slice(0, 4).map<AiTask>((item, index) => ({
          title: item.title,
          description: item.description,
          whyItMatters: item.whyItMatters,
          doneCriteria: item.doneCriteria,
          nextAction: item.nextAction,
          category: item.category,
          priority: index === 0 ? "HIGH" : "MEDIUM",
          status: "TODO",
        })),
      )
    : dedupeByTitle(
        validTasks.map<AiTask>((task) => ({
          title: task.title,
          description: task.description ?? undefined,
          whyItMatters: task.whyItMatters,
          doneCriteria: task.doneCriteria,
          nextAction: task.nextAction,
          category: task.category,
          priority: task.priority as Priority,
          status: "TODO",
        })),
      ).slice(0, MAX_TASK_ITEMS);

  if (isLaunchedStage && growthChecklist.length === 0) return null;
  if (!isLaunchedStage && launchChecklist.length === 0 && tasks.length === 0) return null;

  return {
    launchChecklist,
    growthChecklist,
    tasks,
  };
}

function buildSkillBackedFallbackPlan(input: WizardInput): AiPlan {
  const context = inferContext(input);
  const productName = input.name;
  const audience = input.targetAudience || "hedef kitlen";
  const launchChecklist: AiLaunchItem[] = [];
  const growthChecklist: AiGrowthItem[] = [];

  if (!context.isLaunched) {
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

  const dedupedLaunch = context.isLaunched ? [] : dedupeByTitle(launchChecklist).slice(0, 12);
  const dedupedGrowth = dedupeByTitle(growthChecklist).slice(0, 8);
  const tasks = dedupeByTitle([
    ...(!context.isLaunched
      ? dedupedLaunch.slice(0, 2).map<AiTask>((item) => ({ title: item.title, description: item.description, priority: item.priority, status: "TODO" }))
      : []),
    ...dedupedGrowth.slice(0, context.isLaunched ? 4 : 3).map<AiTask>((item, index) => ({
      title: item.title,
      description: item.description,
      priority: index === 0 ? "HIGH" : "MEDIUM",
      status: "TODO",
    })),
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

const PROMPT = (input: WizardInput, normalizedCtx?: NormalizedProductContext) => {
  const outputLocale = (input.locale ?? "en").toLowerCase().startsWith("tr") ? "tr" : "en";
  const langRule =
    outputLocale === "tr"
      ? `OUTPUT LANGUAGE: All visible content (titles, descriptions) MUST be in Turkish. Use perfect Turkish characters (ç, ş, ğ, ı, ö, ü). Never produce broken or transliterated Turkish (e.g. write "İlk" not "Ilk", "değer" not "deger"). Never mix English words into the output.`
      : `OUTPUT LANGUAGE: All visible content (titles, descriptions) MUST be in English. Never produce Turkish words or phrases inside the output, even when the product name or website is Turkish.`;

  return `You are the Founder Coach and Planning Agent inside Tiramisup. You read a founder's product context and generate a working system, checklist, and tasks that are specifically tailored to that product — never generic.

PRODUCT INFO:
- Name: ${input.name}
- Description: ${input.description}
- Category: ${input.category || "SaaS"}
- Target audience: ${input.targetAudience || "unspecified"}
- Business model: ${input.businessModel || "unspecified"}
- Current stage: ${input.launchStatus || "unspecified"}
${input.stageContext ? `- Stage details: ${input.stageContext}` : ""}
${normalizedCtx ? `\nNORMALIZED CONTEXT (structured):
- Stage: ${normalizedCtx.stage}
- Primary goal: ${normalizedCtx.primary_goal}
- Platforms: ${normalizedCtx.platforms.join(", ") || "unspecified"}
- Problem summary: ${normalizedCtx.description_understanding.problem_summary || "unspecified"}
- User signals from description: ${normalizedCtx.description_understanding.user_segments.join(", ") || "unspecified"}
- Use-case signals from description: ${normalizedCtx.description_understanding.use_cases.join(", ") || "unspecified"}
- Context confidence: ${normalizedCtx.context_confidence}
${normalizedCtx.missing_fields.length > 0 ? `- Missing fields: ${normalizedCtx.missing_fields.join(", ")}` : ""}
${normalizedCtx.ambiguity_flags.length > 0 ? `- Ambiguity flags: ${normalizedCtx.ambiguity_flags.join("; ")}` : ""}` : ""}
${input.storeGuidance ? `\nSTORE GUIDANCE:\n${input.storeGuidance}\n` : ""}
${input.websiteContent ? `\nCRITICAL — FOUNDER'S WEBSITE CONTENT:\n${input.websiteContent}\n(IMPORTANT: Read the founder's actual website. Reference real features and promises in your output. Do not invent generic items.)\n` : ""}

YOUR JOB:
Build the founder's first real operating system for this product.
- Pre-launch: produce the critical launch checklist and this week's technical tasks.
- Launched / growing: skip launch checklist; focus on growth, measurement, activation, retention, revenue.

STAGE RULE:
- If the current stage is "launched" or "growing", DO NOT produce launch checklist items.
- In those stages, tasks must serve growth, measurement, activation, retention, or revenue — not launch prep.
- If the stage is pre-launch, DO NOT produce growth scaling tasks.

PRIORITY RULE (CRITICAL):
Be very selective with HIGH. Most items must be MEDIUM or LOW.
- HIGH = the product CANNOT ship or there is a serious legal/security risk. Examples: GDPR/KVKK obligations, critical security holes, app store reject reasons. Max 2-3 HIGH items per plan.
- MEDIUM = important, but the product can still launch without it. Most checklist items belong here. Examples: UX improvements, performance, edge-case handling.
- LOW = polish or nice-to-have. Examples: dashboard refinements, extra integrations, bonus features.

CATEGORY RULE (CRITICAL):
- Every launch item MUST be assigned a category from the strict enum: PRODUCT, MARKETING, LEGAL, TECH.
- Every growth item MUST be assigned a category from: ACQUISITION, ACTIVATION, RETENTION, REVENUE.
- Every task MUST be assigned a category from the union: PRODUCT, MARKETING, LEGAL, TECH, ACQUISITION, ACTIVATION, RETENTION, REVENUE, MEASUREMENT.
- Pick the single category that best matches the actual outcome the item drives. Do not default to PRODUCT for everything. Categories are how the founder navigates work. There is no "OTHER" — if you cannot pick a real category, drop the item entirely.

STRUCTURED FIELD RULE (CRITICAL — applies to every checklist item AND every task):
Every item MUST include three additional fields next to title/description:
- whyItMatters: one sentence on why this matters for THIS specific product, referencing its real features or audience.
- doneCriteria: one sentence on the concrete observable state when the item is finished.
- nextAction: one sentence on the very first action the founder should take to start.

Each field MUST be at least 10 characters, MUST be a real product-specific sentence in the OUTPUT LANGUAGE defined below, MUST NOT be a placeholder ("TODO", "TBD"), and MUST NOT contain markdown or bullets. The description field should be a one-sentence summary or empty — do not duplicate the structured fields inside it.

DEDUPE RULE:
Two items must never describe the same outcome with different phrasings. If you find yourself writing two items that share an objective, merge them into one.

ANTI-GENERIC RULE: Never write rote or generic items that could apply to any product. Always reference actual features or audience pulled from the website content or normalized context.
GROUNDING RULE: Never mention any other founder, product, app, or company name besides "${input.name}". If you are unsure, omit the name rather than inventing or borrowing one.

${langRule}

Use the product name "${input.name}" frequently inside titles and descriptions.`;
};

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const hasKey = !!(process.env.QWEN_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY || process.env.GEMINI_API_KEY);

  if (!hasKey) {
    console.warn("[ai-plan] No AI API key configured (checked QWEN, GOOGLE_GENERATIVE_AI, GEMINI) — using static fallback");
    return null;
  }

  let storeGuidance = "";
  let launchGuidance = "";
  try {
    storeGuidance = await loadStoreGuidance(input);
    launchGuidance = await loadLaunchAndAnalyticsGuidance(input);
  } catch (err) {
    console.warn("[ai-plan] Skill loading failed (non-blocking):", err);
  }

  const finalInput = {
    ...input,
    storeGuidance,
    stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
  };

  // Build normalized context for structured AI consumption
  const normalizedCtx = normalizeProductContext({
    name: input.name,
    description: input.description,
    category: input.category,
    targetAudience: input.targetAudience,
    businessModel: input.businessModel,
    launchStatus: input.launchStatus,
    launchGoals:
      input.goalKey || input.growthGoal
        ? JSON.stringify({ goalKey: input.goalKey, growthGoal: input.growthGoal })
        : undefined,
    platforms: input.mobilePlatforms ?? [],
  });

  try {
    // We use generateStructuredFallback because AI SDK's generateObject
    // often fails with JSON parsing errors on Alibaba MaaS via compatibility mode.
    const object = await generateStructuredFallback<any>(
      PROMPT(finalInput, normalizedCtx),
      PlanSchema,
      "ai-plan"
    );

    const isLaunchedStage = ["yayında", "büyüme aşamasında"].includes((input.launchStatus ?? "").toLowerCase());
    const validatorLocale: Locale = (input.locale ?? "en").toLowerCase().startsWith("tr") ? "tr" : "en";
    const sanitized = sanitizeAiPlanOutput(object, validatorLocale, isLaunchedStage);
    if (!sanitized) {
      console.warn("[ai-plan] Sanitized plan was empty or invalid — using skill-backed fallback");
      return mergeMobileLaunchBaseline(buildSkillBackedFallbackPlan(finalInput), finalInput);
    }

    console.log(
      `[ai-plan] SUCCESS: ${sanitized.launchChecklist.length} launch / ${sanitized.growthChecklist.length} growth / ` +
      `${sanitized.tasks.length} tasks after sanitization`,
    );

    return mergeMobileLaunchBaseline(sanitized, finalInput);
  } catch (error) {
    console.error("[ai-plan] AI SDK generation failed, using static fallback plan:", error);
    return mergeMobileLaunchBaseline(buildSkillBackedFallbackPlan(finalInput), finalInput);
  }
}
