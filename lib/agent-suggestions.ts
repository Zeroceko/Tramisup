import { z } from "zod";
import { generateStructuredFallback } from "@/BrandLib/ai-client";
import type { AgentType } from "@/lib/agent-types";
import { tasksAreNearDuplicate } from "@/lib/task-parsing";
import {
  validateTaskCandidate,
  type Locale,
  type TaskCandidate,
  CATEGORY_VALUES,
} from "@/lib/task-validator";
import { buildTaskDetailFallback } from "@/lib/task-detail-fallback";

type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";
type SuggestionConfidence = "HIGH" | "MEDIUM" | "LOW";
type SuggestionSource = "ai" | "fallback";

type ProductSnapshot = {
  id: string;
  name: string;
  status: string;
  description: string | null;
  category: string | null;
  businessModel: string | null;
  targetAudience: string | null;
  launchGoals: string | null;
};

type OpenTaskSnapshot = {
  id: string;
  title: string;
  status: string;
  priority: string;
  category: string | null;
};

type LaunchChecklistSnapshot = {
  id: string;
  title: string;
  category: string | null;
  completed: boolean;
  priority: "HIGH" | "MEDIUM" | "LOW";
};

export type AgentSuggestionBrief = {
  id: string;
  title: string;
  description: string | null;
  whyItMatters: string;
  doneCriteria: string;
  nextAction: string;
  category: string;
  priority: SuggestionPriority;
  confidence: "high" | "medium" | "low";
  source: SuggestionSource;
  agentType: AgentType;
  existingTaskId?: string;
  existingTaskTitle?: string;
};

export type SuggestionGenerationInput = {
  agentType: AgentType;
  locale: Locale;
  product: ProductSnapshot;
  contextSummary: string;
  contextData: Record<string, unknown>;
  openTasks: OpenTaskSnapshot[];
  checklistItems: LaunchChecklistSnapshot[];
};

type SuggestionCandidate = TaskCandidate & {
  confidence?: SuggestionConfidence;
};

const SuggestionCandidateSchema = z.object({
  title: z.string().min(12).max(96),
  description: z.string().max(240).nullable().optional(),
  whyItMatters: z.string().min(10).max(240),
  doneCriteria: z.string().min(10).max(240),
  nextAction: z.string().min(10).max(240),
  category: z.enum(CATEGORY_VALUES as [string, ...string[]]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  confidence: z.enum(["HIGH", "MEDIUM", "LOW"]).default("MEDIUM"),
});

const SuggestionResponseSchema = z.object({
  suggestions: z.array(SuggestionCandidateSchema).min(3).max(5),
});

function normalizeGoalKey(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as { goalKey?: string };
    return typeof parsed.goalKey === "string" ? parsed.goalKey : null;
  } catch {
    return null;
  }
}

function createSuggestionId(agentType: AgentType, title: string, index: number) {
  return `${agentType}-${index}-${title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/(^-|-$)/g, "").slice(0, 48)}`;
}

function toPriority(value: string | null | undefined): SuggestionPriority {
  return value === "HIGH" || value === "LOW" ? value : "MEDIUM";
}

function confidenceToClient(value: SuggestionConfidence | undefined): AgentSuggestionBrief["confidence"] {
  if (value === "HIGH") return "high";
  if (value === "LOW") return "low";
  return "medium";
}

function uniqueByTitle<T extends { title: string }>(items: T[]) {
  const kept: T[] = [];
  for (const item of items) {
    if (kept.some((existing) => tasksAreNearDuplicate(existing.title, item.title))) continue;
    kept.push(item);
  }
  return kept;
}

function enrichCandidate(
  agentType: AgentType,
  locale: Locale,
  source: SuggestionSource,
  candidate: TaskCandidate & { confidence?: SuggestionConfidence },
  openTasks: OpenTaskSnapshot[],
  index: number,
): AgentSuggestionBrief | null {
  const validation = validateTaskCandidate(candidate, locale);
  if (!validation.valid) return null;
  if (candidate.confidence === "LOW") return null;
  const normalized = validation.normalized;

  const detailFallback = buildTaskDetailFallback({
    title: normalized.title,
    category: normalized.category ?? "PRODUCT",
    locale,
  });
  const normalizedCategory = normalized.category ?? "PRODUCT";
  const normalizedPriority = normalized.priority ?? "MEDIUM";
  const normalizedWhy = normalized.whyItMatters ?? detailFallback.why;
  const normalizedDone = normalized.doneCriteria ?? detailFallback.doneCriteria;
  const normalizedNext = normalized.nextAction ?? detailFallback.nextAction;

  const duplicateTask = openTasks.find((task) => tasksAreNearDuplicate(task.title, normalized.title));

  return {
    id: createSuggestionId(agentType, normalized.title, index),
    title: normalized.title,
    description: normalized.description,
    whyItMatters: normalizedWhy,
    doneCriteria: normalizedDone,
    nextAction: normalizedNext,
    category: normalizedCategory,
    priority: normalizedPriority,
    confidence: confidenceToClient(candidate.confidence),
    source,
    agentType,
    existingTaskId: duplicateTask?.id,
    existingTaskTitle: duplicateTask?.title,
  };
}

function sanitizeAiSuggestions(
  agentType: AgentType,
  locale: Locale,
  raw: SuggestionCandidate[],
  openTasks: OpenTaskSnapshot[],
): AgentSuggestionBrief[] {
  const deduped = uniqueByTitle(raw);
  const briefs = deduped
    .map((candidate, index) => enrichCandidate(agentType, locale, "ai", candidate, openTasks, index))
    .filter((item): item is AgentSuggestionBrief => Boolean(item));
  return briefs.slice(0, 3);
}

function buildPrompt(input: SuggestionGenerationInput) {
  const isEn = input.locale === "en";
  const goalKey = normalizeGoalKey(input.product.launchGoals);
  const checklistPreview = input.checklistItems
    .slice(0, 8)
    .map((item) => ({
      title: item.title,
      category: item.category,
      completed: item.completed,
      priority: item.priority,
    }));
  const compactInput = JSON.stringify(
    {
      product: {
        name: input.product.name,
        stage: input.product.status,
        description: input.product.description,
        category: input.product.category,
        businessModel: input.product.businessModel,
        targetAudience: input.product.targetAudience,
        goalKey,
      },
      context: input.contextData,
      openTasks: input.openTasks.slice(0, 8).map((task) => ({
        title: task.title,
        priority: task.priority,
        category: task.category,
      })),
      checklist: checklistPreview,
    },
    null,
    2,
  );

  const sharedRules = [
    "Generate exactly 3 suggestions.",
    "Every suggestion must be specific to this product and current state.",
    "Do not restate generic checklist management advice.",
    "Titles must describe a concrete output, decision, or founder action.",
    "Avoid filler titles like 'advance launch items', 'review medium-priority items', or 'remove the biggest blocker'.",
    "Do not duplicate existing open tasks.",
    "Use only HIGH or MEDIUM confidence unless evidence is genuinely missing.",
    "If evidence is weak, make the suggestion about collecting or clarifying the missing evidence instead of pretending certainty.",
  ];

  const agentRules: Record<AgentType, string[]> = {
    overview: input.product.status === "PRE_LAUNCH"
      ? [
          "This is PRE_LAUNCH overview. Stay entirely inside launch readiness and founder execution.",
          "Do not suggest growth, GA4, revenue optimization, or post-launch tactics.",
        ]
      : [
          `This product is ${input.product.status}. Do not mention launch checklist or launch readiness.`,
          "Focus on growth execution, tracking gaps, or progress blockers grounded in data.",
        ],
    launch: [
      "Stay entirely inside launch readiness.",
      "Prefer concrete launch outputs over vague project management advice.",
      "Use checklist/category context, but synthesize a better next move than simply repeating the checklist title when possible.",
    ],
    growth: [
      "Stay grounded in real metric or setup state.",
      "Do not produce generic startup tactics with no evidence.",
      "If metrics are missing, suggestions should be about setting up or clarifying the next measurable signal.",
    ],
  };

  return `
You are generating suggestion cards for Tiramisup's ${input.agentType} agent.
Return JSON that matches the requested schema exactly.

Output language: ${isEn ? "English." : "Turkish (natural Turkish, not literal translation)."}

Rules:
${[...sharedRules, ...agentRules[input.agentType]].map((rule) => `- ${rule}`).join("\n")}

Context:
${compactInput}
`.trim();
}

function fallbackCandidate(
  title: string,
  category: string,
  locale: Locale,
  priority: SuggestionPriority = "MEDIUM",
  description?: string | null,
): SuggestionCandidate {
  const fallback = buildTaskDetailFallback({ title, category, locale });
  return {
    title,
    description: description ?? null,
    whyItMatters: fallback.why,
    doneCriteria: fallback.doneCriteria,
    nextAction: fallback.nextAction,
    category,
    priority,
    confidence: "MEDIUM",
  };
}

function mapChecklistCategory(category: string | null | undefined) {
  if (!category) return "PRODUCT";
  if (category === "TECH" || category === "LEGAL" || category === "MARKETING") return category;
  return "PRODUCT";
}

export function buildDeterministicSuggestionFallback(input: SuggestionGenerationInput): AgentSuggestionBrief[] {
  const isEn = input.locale === "en";
  const { product, contextData } = input;
  const suggestions: SuggestionCandidate[] = [];

  if (input.agentType === "launch") {
    const blockers = Array.isArray(contextData.high_priority_blockers)
      ? contextData.high_priority_blockers.filter((value): value is string => typeof value === "string")
      : [];
    const firstIncomplete = input.checklistItems.find((item) => !item.completed);
    const firstMedium = input.checklistItems.find((item) => !item.completed && item.priority === "MEDIUM");

    if (blockers[0]) {
      suggestions.push(
        fallbackCandidate(
          blockers[0],
          mapChecklistCategory(input.checklistItems.find((item) => item.title === blockers[0])?.category),
          input.locale,
          "HIGH",
        ),
      );
    }
    if (firstIncomplete) {
      suggestions.push(
        fallbackCandidate(
          firstIncomplete.title,
          mapChecklistCategory(firstIncomplete.category),
          input.locale,
          firstIncomplete.priority,
        ),
      );
    }
    if (firstMedium) {
      suggestions.push(
        fallbackCandidate(
          firstMedium.title,
          mapChecklistCategory(firstMedium.category),
          input.locale,
          "MEDIUM",
        ),
      );
    }
  } else if (input.agentType === "growth") {
    const setup = (contextData.metric_setup ?? {}) as { has_setup?: boolean };
    const trends = (contextData.recent_metric_trends ?? {}) as Record<string, { latest?: number; prev?: number | null }>;
    const declining = Object.entries(trends).find(([, trend]) => typeof trend.prev === "number" && typeof trend.latest === "number" && trend.latest < trend.prev);

    if (!setup.has_setup) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Define the first metrics ${product.name} will track weekly`
            : `${product.name} için haftalık takip edilecek ilk metrikleri tanımla`,
          "MEASUREMENT",
          input.locale,
          "HIGH",
        ),
      );
    } else if (Number(contextData.data_entries_last_14_days ?? 0) === 0) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Enter the first baseline numbers for ${product.name}`
            : `${product.name} için ilk baz çizgisi sayılarını gir`,
          "MEASUREMENT",
          input.locale,
          "HIGH",
        ),
      );
    }

    if (declining) {
      const [metricKey, trend] = declining;
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Investigate why ${metricKey} dropped from ${trend.prev} to ${trend.latest}`
            : `${metricKey} neden ${trend.prev}'den ${trend.latest}'e düştü, araştır`,
          "RETENTION",
          input.locale,
          "HIGH",
        ),
      );
    }

    suggestions.push(
      fallbackCandidate(
        isEn
          ? `Clarify the single growth move to focus on this week for ${product.name}`
          : `${product.name} için bu hafta odaklanılacak tek growth hamlesini netleştir`,
        "ACQUISITION",
        input.locale,
        "MEDIUM",
      ),
    );
  } else if (product.status === "PRE_LAUNCH") {
    const blocker = input.checklistItems.find((item) => !item.completed && item.priority === "HIGH");
    const inProgressTask = input.openTasks.find((task) => task.status === "IN_PROGRESS");
    const nextTask = input.openTasks.find((task) => task.status !== "DONE");

    if (blocker) {
      suggestions.push(
        fallbackCandidate(
          blocker.title,
          mapChecklistCategory(blocker.category),
          input.locale,
          "HIGH",
        ),
      );
    }
    if (inProgressTask) {
      suggestions.push(
        fallbackCandidate(
          inProgressTask.title,
          inProgressTask.category ?? "PRODUCT",
          input.locale,
          toPriority(inProgressTask.priority),
        ),
      );
    }
    if (nextTask) {
      suggestions.push(
        fallbackCandidate(
          nextTask.title,
          nextTask.category ?? "PRODUCT",
          input.locale,
          toPriority(nextTask.priority),
        ),
      );
    }
  } else {
    const inProgressTask = input.openTasks.find((task) => task.status === "IN_PROGRESS");
    const doneCount = Number((contextData.tasks as { done?: number } | undefined)?.done ?? 0);
    const setup = (contextData.metric_setup ?? {}) as { has_setup?: boolean };
    const dataEntryCount = Number((contextData as { data_entries_last_7_days?: number }).data_entries_last_7_days ?? 0);

    if (inProgressTask) {
      suggestions.push(
        fallbackCandidate(
          inProgressTask.title,
          inProgressTask.category ?? "PRODUCT",
          input.locale,
          toPriority(inProgressTask.priority),
        ),
      );
    }
    if (!setup.has_setup) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Define the first growth signals for ${product.name}`
            : `${product.name} için ilk growth sinyallerini tanımla`,
          "MEASUREMENT",
          input.locale,
          "HIGH",
        ),
      );
    }
    if (setup.has_setup && dataEntryCount === 0) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Enter the first baseline numbers for ${product.name}`
            : `${product.name} için ilk baz çizgisi sayılarını gir`,
          "MEASUREMENT",
          input.locale,
          "HIGH",
        ),
      );
    }
    if (input.openTasks.length === 0) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Turn this week's focus in ${product.name} into one concrete task`
            : `${product.name} için bu haftanın odağını tek bir somut göreve çevir`,
          "PRODUCT",
          input.locale,
          "MEDIUM",
        ),
      );
    }
    if (setup.has_setup && dataEntryCount > 0) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Set the weekly target for the metric you track in ${product.name}`
            : `${product.name} içinde takip ettiğin sayı için haftalık hedefi netleştir`,
          "MEASUREMENT",
          input.locale,
          "MEDIUM",
        ),
      );
    }
    if (doneCount === 0 && input.openTasks.length > 0) {
      suggestions.push(
        fallbackCandidate(
          isEn
            ? `Finish one small task this week to unlock momentum for ${product.name}`
            : `${product.name} için ivme açacak küçük bir işi bu hafta tamamla`,
          "PRODUCT",
          input.locale,
          "MEDIUM",
        ),
      );
    }
  }

  return uniqueByTitle(suggestions)
    .map((candidate, index) => enrichCandidate(input.agentType, input.locale, "fallback", candidate, input.openTasks, index))
    .filter((item): item is AgentSuggestionBrief => Boolean(item))
    .slice(0, 3);
}

export async function generateAgentSuggestions(input: SuggestionGenerationInput): Promise<AgentSuggestionBrief[]> {
  try {
    const prompt = buildPrompt(input);
    const raw = await generateStructuredFallback<z.infer<typeof SuggestionResponseSchema>>(
      prompt,
      SuggestionResponseSchema,
      `agent-suggestions:${input.agentType}`,
    );

    const aiSuggestions = sanitizeAiSuggestions(
      input.agentType,
      input.locale,
      raw.suggestions,
      input.openTasks,
    );

    if (aiSuggestions.length >= 2) {
      return aiSuggestions;
    }

    console.warn(
      `[agent-suggestions] Thin AI output for ${input.agentType} on product ${input.product.id} (${aiSuggestions.length} valid suggestions) — using fallback`,
    );
    return buildDeterministicSuggestionFallback(input);
  } catch (error) {
    console.error(`[agent-suggestions] AI generation failed for ${input.agentType}:`, error);
    return buildDeterministicSuggestionFallback(input);
  }
}
