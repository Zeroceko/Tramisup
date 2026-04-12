/**
 * Agent Context Builders
 *
 * Each agent type pulls its own slice of product data to include in the
 * system prompt. Keeps prompts focused and avoids over-fetching.
 */

import { prisma } from "@/lib/prisma";
import type { AgentType } from "@/lib/agent-types";
import {
  normalizeLaunchChecklistPriority,
  normalizeStoredLaunchChecklistPriorities,
} from "@/lib/launch-checklist-priority";

// ─── Types ───────────────────────────────────────────────────────────────────

export type { AgentType } from "@/lib/agent-types";

export interface AgentContext {
  agentType: AgentType;
  productName: string;
  productDescription: string;
  productStage: string;
  contextSummary: string; // serialized for the system prompt
  locale: string; // user's preferred language: "en" | "tr"
}

// ─── Overview Agent ──────────────────────────────────────────────────────────

async function buildOverviewContext(productId: string): Promise<string> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, description: true, status: true, launchGoals: true },
  });

  const isPreLaunch = product?.status === "PRE_LAUNCH";

  const [tasks, checklist, metricSetup, recentEntries] = await Promise.all([
    prisma.task.findMany({
      where: { productId },
      select: { status: true, priority: true },
    }),
    isPreLaunch
      ? prisma.launchChecklist.findMany({
          where: { productId },
          select: { completed: true, priority: true },
        })
      : Promise.resolve([]),
    isPreLaunch
      ? Promise.resolve(null)
      : prisma.metricSetup.findFirst({
          where: { productId },
          select: { selections: true },
        }),
    isPreLaunch
      ? Promise.resolve([])
      : prisma.metricEntry.findMany({
          where: { productId },
          orderBy: { date: "desc" },
          take: 7,
          select: { values: true },
        }),
  ]);

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const highPriorityOpen = tasks.filter(
    (t) => t.priority === "HIGH" && t.status !== "DONE"
  ).length;

  if (isPreLaunch) {
    const totalChecklist = checklist.length;
    const doneChecklist = checklist.filter((c) => c.completed).length;
    const highBlockers = checklist.filter(
      (c) => normalizeLaunchChecklistPriority(c) === "HIGH" && !c.completed
    ).length;

    return JSON.stringify({
      product_status: product?.status ?? "unknown",
      tasks: {
        total: totalTasks,
        done: doneTasks,
        in_progress: inProgressTasks,
        high_priority_open: highPriorityOpen,
      },
      launch_checklist: {
        total: totalChecklist,
        completed: doneChecklist,
        completion_rate:
          totalChecklist > 0
            ? Math.round((doneChecklist / totalChecklist) * 100)
            : 0,
        high_blockers_remaining: highBlockers,
      },
    });
  }

  // LAUNCHED / GROWING — return growth-focused context, no launch checklist
  const selections = metricSetup?.selections as { stage: string; selectedMetricKeys: string[] }[] | null;
  const selectedMetricKeys = Array.isArray(selections)
    ? selections.flatMap((s) => s.selectedMetricKeys ?? []).filter(Boolean)
    : [];

  const metricTrends: Record<string, { latest: number; prev: number | null }> = {};
  for (const entry of recentEntries) {
    const vals = entry.values as Record<string, number>;
    for (const [key, value] of Object.entries(vals)) {
      if (typeof value !== "number") continue;
      if (!metricTrends[key]) {
        metricTrends[key] = { latest: value, prev: null };
      } else if (metricTrends[key].prev === null) {
        metricTrends[key].prev = value;
      }
    }
  }

  return JSON.stringify({
    product_status: product?.status ?? "unknown",
    tasks: {
      total: totalTasks,
      done: doneTasks,
      in_progress: inProgressTasks,
      high_priority_open: highPriorityOpen,
    },
    metric_setup: {
      has_setup: selectedMetricKeys.length > 0,
      selected_metrics: selectedMetricKeys,
    },
    recent_metric_trends: metricTrends,
    data_entries_last_7_days: recentEntries.length,
  });
}

// ─── Launch Agent ────────────────────────────────────────────────────────────

async function buildLaunchContext(productId: string): Promise<string> {
  const checklist = await prisma.launchChecklist.findMany({
    where: { productId },
    select: {
      title: true,
      completed: true,
      priority: true,
      category: true,
      linkedTask: { select: { title: true, status: true } },
    },
    orderBy: [{ priority: "asc" }, { order: "asc" }],
  });

  // Group by category
  const byCategory: Record<
    string,
    { total: number; completed: number; items: { title: string; completed: boolean; priority: string }[] }
  > = {};

  for (const item of checklist) {
    const cat = item.category ?? "General";
    if (!byCategory[cat]) byCategory[cat] = { total: 0, completed: 0, items: [] };
    byCategory[cat].total += 1;
    if (item.completed) byCategory[cat].completed += 1;
    byCategory[cat].items.push({
      title: item.title,
      completed: item.completed,
      priority: normalizeLaunchChecklistPriority(item),
    });
  }

  const highBlockers = checklist
    .filter((c) => normalizeLaunchChecklistPriority(c) === "HIGH" && !c.completed)
    .map((c) => c.title);

  return JSON.stringify({
    categories: byCategory,
    high_priority_blockers: highBlockers,
    overall_completion_rate:
      checklist.length > 0
        ? Math.round(
            (checklist.filter((c) => c.completed).length / checklist.length) * 100
          )
        : 0,
  });
}

// ─── Growth Agent ────────────────────────────────────────────────────────────

async function buildGrowthContext(productId: string): Promise<string> {
  const [metricSetup, recentEntries, integrations] = await Promise.all([
    prisma.metricSetup.findFirst({
      where: { productId },
      select: { selections: true },
    }),
    prisma.metricEntry.findMany({
      where: { productId },
      orderBy: { date: "desc" },
      take: 14,
      select: { date: true, values: true },
    }),
    prisma.integration.findMany({
      where: { productId },
      select: { provider: true, status: true, lastSyncAt: true },
    }),
  ]);

  // values is Record<FunnelStageKey, number> stored as JSON
  // Summarize by picking first two entries per key for trend
  const metricTrends: Record<string, { latest: number; prev: number | null }> = {};
  for (const entry of recentEntries) {
    const vals = entry.values as Record<string, number>;
    for (const [key, value] of Object.entries(vals)) {
      if (typeof value !== "number") continue;
      if (!metricTrends[key]) {
        metricTrends[key] = { latest: value, prev: null };
      } else if (metricTrends[key].prev === null) {
        metricTrends[key].prev = value;
      }
    }
  }

  const connectedIntegrations = integrations
    .filter((i) => i.status === "CONNECTED")
    .map((i) => i.provider);

  // selections is FunnelMetricSelection[] stored as JSON
  const selections = metricSetup?.selections as { stage: string; selectedMetricKeys: string[] }[] | null;
  const selectedMetricKeys = Array.isArray(selections)
    ? selections.flatMap((s) => s.selectedMetricKeys ?? []).filter(Boolean)
    : [];

  return JSON.stringify({
    metric_setup: {
      has_setup: selectedMetricKeys.length > 0,
      selected_metrics: selectedMetricKeys,
    },
    recent_metric_trends: metricTrends,
    data_entries_last_14_days: recentEntries.length,
    connected_integrations: connectedIntegrations,
  });
}

// ─── Main builder ────────────────────────────────────────────────────────────

export async function buildAgentContext(
  agentType: AgentType,
  productId: string,
  locale = "en"
): Promise<AgentContext> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { name: true, description: true, status: true },
  });

  if (!product) throw new Error(`Product ${productId} not found`);
  await normalizeStoredLaunchChecklistPriorities(productId);

  let contextSummary: string;
  switch (agentType) {
    case "overview":
      contextSummary = await buildOverviewContext(productId);
      break;
    case "launch":
      contextSummary = await buildLaunchContext(productId);
      break;
    case "growth":
      contextSummary = await buildGrowthContext(productId);
      break;
  }

  return {
    agentType,
    productName: product.name,
    productDescription: product.description ?? "",
    productStage: product.status,
    contextSummary,
    locale,
  };
}
