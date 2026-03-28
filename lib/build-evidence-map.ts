/**
 * Evidence Map Builder (V1 — Lightweight)
 *
 * Combines normalized product context with system state
 * to build the evidence map defined in the AI Agent System Playbook (§6).
 *
 * V1 scope: deterministic, rule-based, no AI calls.
 * Consumes data already available in the DB.
 */

import type { NormalizedProductContext, ConfidenceLevel } from "./normalize-product-context";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface EvidenceMap {
  known_facts: string[];
  inferred_facts: string[];
  unknown_facts: string[];
  checklist_state: ChecklistState;
  task_state: TaskState;
  source_state: SourceState;
  metric_state: MetricState;
  launch_state: LaunchState;
  recommendation_readiness: RecommendationReadiness;
}

export interface ChecklistState {
  total: number;
  completed: number;
  high_blockers_remaining: number;
}

export interface TaskState {
  total: number;
  done: number;
  open: number; // not done (TODO + IN_PROGRESS)
}

export interface SourceState {
  connected_providers: string[];
  has_validated_source: boolean;
  has_synced_data: boolean;
}

export interface MetricState {
  has_setup: boolean;
  selected_metric_count: number;
  entry_count: number;
  has_recent_entry: boolean; // entry in last 48h
}

export interface LaunchState {
  status: string; // PRE_LAUNCH, LAUNCHED, GROWING
  has_launch_date: boolean;
  days_until_launch: number | null;
}

export interface RecommendationReadiness {
  launch: ConfidenceLevel;
  metrics: ConfidenceLevel;
  growth: ConfidenceLevel;
  source_setup: ConfidenceLevel;
}

// ─── Input from DB queries ──────────────────────────────────────────────────

export interface EvidenceInput {
  normalizedContext: NormalizedProductContext;
  productStatus: string; // PRE_LAUNCH | LAUNCHED | GROWING
  checklist: { total: number; completed: number; highBlockers: number };
  tasks: { total: number; done: number; inProgress: number };
  sources: { providers: string[]; hasValidated: boolean; hasSynced: boolean };
  metrics: { hasSetup: boolean; selectedCount: number; entryCount: number; lastEntryDate: Date | null };
  launchDate: Date | null;
}

// ─── Build evidence map ─────────────────────────────────────────────────────

export function buildEvidenceMap(input: EvidenceInput): EvidenceMap {
  const { normalizedContext: ctx } = input;

  const known: string[] = [];
  const inferred: string[] = [];
  const unknown: string[] = [];

  // Known facts from structured input
  if (ctx.product_name) known.push(`Product name: ${ctx.product_name}`);
  if (ctx.categories.length > 0) known.push(`Category: ${ctx.categories.join(", ")}`);
  if (ctx.platforms.length > 0) known.push(`Platforms: ${ctx.platforms.join(", ")}`);
  if (ctx.primary_audience) known.push(`Primary audience: ${ctx.primary_audience}`);
  if (ctx.business_model) known.push(`Business model: ${ctx.business_model}`);
  if (ctx.stage) known.push(`Stage: ${ctx.stage}`);
  if (ctx.primary_goal) known.push(`Primary goal: ${ctx.primary_goal}`);
  if (ctx.planned_launch_date) known.push(`Planned launch date: ${ctx.planned_launch_date}`);

  // Known from system state
  if (input.checklist.total > 0) known.push(`Checklist: ${input.checklist.completed}/${input.checklist.total} complete`);
  if (input.tasks.total > 0) known.push(`Tasks: ${input.tasks.done}/${input.tasks.total} done`);
  if (input.sources.providers.length > 0) known.push(`Connected sources: ${input.sources.providers.join(", ")}`);
  if (input.metrics.hasSetup) known.push(`Metric setup complete with ${input.metrics.selectedCount} metrics`);
  if (input.metrics.entryCount > 0) known.push(`${input.metrics.entryCount} metric entries recorded`);

  // Inferred facts
  if (ctx.product_summary) {
    inferred.push(`Product focus (from description): ${ctx.product_summary.slice(0, 100)}`);
  }
  if (ctx.stage === "live" && input.metrics.entryCount === 0) {
    inferred.push("Product is live but has no metric data — measurement not yet active");
  }
  if (ctx.stage === "launch_prep" && input.checklist.highBlockers > 0) {
    inferred.push(`Launch readiness blocked: ${input.checklist.highBlockers} HIGH priority items remain`);
  }

  // Unknown facts
  for (const field of ctx.missing_fields) {
    unknown.push(`Missing: ${field}`);
  }
  if (!input.sources.hasValidated && input.sources.providers.length > 0) {
    unknown.push("Connected sources exist but none validated");
  }
  if (input.metrics.hasSetup && input.metrics.entryCount === 0) {
    unknown.push("Metrics configured but no data entered yet");
  }
  if (ctx.product_url === "") {
    unknown.push("No product URL provided");
  }

  // Checklist state
  const checklist_state: ChecklistState = {
    total: input.checklist.total,
    completed: input.checklist.completed,
    high_blockers_remaining: input.checklist.highBlockers,
  };

  // Task state
  const task_state: TaskState = {
    total: input.tasks.total,
    done: input.tasks.done,
    open: Math.max(0, input.tasks.total - input.tasks.done),
  };

  // Source state
  const source_state: SourceState = {
    connected_providers: input.sources.providers,
    has_validated_source: input.sources.hasValidated,
    has_synced_data: input.sources.hasSynced,
  };

  // Metric state
  const hasRecentEntry = input.metrics.lastEntryDate
    ? Date.now() - new Date(input.metrics.lastEntryDate).getTime() < 48 * 60 * 60 * 1000
    : false;
  const metric_state: MetricState = {
    has_setup: input.metrics.hasSetup,
    selected_metric_count: input.metrics.selectedCount,
    entry_count: input.metrics.entryCount,
    has_recent_entry: hasRecentEntry,
  };

  // Launch state
  const daysUntilLaunch = input.launchDate
    ? Math.ceil((new Date(input.launchDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;
  const launch_state: LaunchState = {
    status: input.productStatus,
    has_launch_date: !!input.launchDate,
    days_until_launch: daysUntilLaunch,
  };

  // Recommendation readiness
  const recommendation_readiness = computeReadiness(input, ctx);

  return {
    known_facts: known,
    inferred_facts: inferred,
    unknown_facts: unknown,
    checklist_state,
    task_state,
    source_state,
    metric_state,
    launch_state,
    recommendation_readiness,
  };
}

// ─── Readiness computation (from evidence threshold matrix §8) ──────────────

function computeReadiness(
  input: EvidenceInput,
  ctx: NormalizedProductContext
): RecommendationReadiness {
  return {
    launch: computeLaunchReadiness(input, ctx),
    metrics: computeMetricsReadiness(input, ctx),
    growth: computeGrowthReadiness(input, ctx),
    source_setup: computeSourceReadiness(input, ctx),
  };
}

function computeLaunchReadiness(input: EvidenceInput, ctx: NormalizedProductContext): ConfidenceLevel {
  // §8.1: needs stage, checklist, tasks, category
  const hasBasics = ctx.stage && ctx.categories.length > 0;
  const hasChecklist = input.checklist.total > 0;
  const hasTasks = input.tasks.total > 0;

  if (hasBasics && hasChecklist && hasTasks && ctx.platforms.length > 0) return "high";
  if (hasBasics && (hasChecklist || hasTasks)) return "medium";
  return "low";
}

function computeMetricsReadiness(input: EvidenceInput, ctx: NormalizedProductContext): ConfidenceLevel {
  // §8.4: needs category, audience, business_model, stage, platform
  const hasContext = ctx.categories.length > 0 && ctx.primary_audience && ctx.business_model && ctx.stage && ctx.platforms.length > 0;
  const hasSetup = input.metrics.hasSetup;
  const hasData = input.metrics.entryCount > 0;

  if (hasContext && hasSetup && hasData) return "high";
  if (hasContext && hasSetup) return "medium";
  return "low";
}

function computeGrowthReadiness(input: EvidenceInput, ctx: NormalizedProductContext): ConfidenceLevel {
  // §8.5-8.7: needs metrics, stage, source trust
  const hasMetrics = input.metrics.hasSetup && input.metrics.entryCount >= 3;
  const hasSource = input.sources.hasValidated;

  const isGrowthStage = ctx.stage === "live" || ctx.stage === "early_growth";
  if (hasMetrics && hasSource && isGrowthStage) return "high";
  if (input.metrics.hasSetup && input.metrics.entryCount > 0) return "medium";
  return "low";
}

function computeSourceReadiness(input: EvidenceInput, ctx: NormalizedProductContext): ConfidenceLevel {
  // §8.3: needs platform, selected metrics or goal, source state
  const hasContext = ctx.platforms.length > 0 && (input.metrics.hasSetup || ctx.primary_goal);

  if (hasContext && input.sources.hasValidated) return "high";
  if (hasContext && input.sources.providers.length > 0) return "medium";
  return "low";
}
