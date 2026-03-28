/**
 * sync-to-metric-entry.ts
 *
 * Bridge between the legacy Metric model (written by GA4/Stripe syncs) and
 * the AARRR MetricEntry model (read by the metrics dashboard).
 *
 * After every sync we call syncMetricToEntry() which:
 *   1. Reads the just-synced Metric row for the product+date
 *   2. Reads the product's MetricSetup to see which AARRR keys are selected
 *   3. Maps legacy fields → AARRR stage values
 *   4. Upserts the MetricEntry row for that date
 *
 * Mapping:
 *   GA4:    dau         → Retention  (wau-mau key)
 *           mau         → Awareness  (website-visits proxy)
 *           newSignups  → Acquisition (visitor-to-signup proxy)
 *   Stripe: mrr         → Revenue    (mrr key)
 *           churnedUsers→ Retention  (churn key)
 *           activeSubscriptions → Revenue (any revenue key present)
 */

import { prisma } from "@/lib/prisma";
import { getOrCreateMetricSetup } from "@/lib/metric-setup";
import type { FunnelStageKey, FunnelMetricSelection } from "@/lib/metric-setup";

// ─── Mapping table ────────────────────────────────────────────────────────────

// Legacy Metric field → which AARRR stage it feeds
const FIELD_TO_STAGE: Record<string, FunnelStageKey> = {
  dau: "Retention",
  mau: "Awareness",
  newSignups: "Acquisition",
  mrr: "Revenue",
  churnedUsers: "Retention",
  activeSubscriptions: "Revenue",
};

// Legacy field → which metric keys we consider a match for that field
// (if the user selected one of these keys in the stage, we write to it)
const FIELD_TO_KEYS: Record<string, string[]> = {
  dau: ["wau-mau", "d1-d7-d30"],
  mau: ["website-visits", "reach"],
  newSignups: ["visitor-to-signup", "waitlist-joins"],
  mrr: ["mrr", "arpu"],
  churnedUsers: ["churn"],
  activeSubscriptions: ["mrr", "trial-to-paid", "arpu"],
};

// ─── Core bridge ─────────────────────────────────────────────────────────────

export async function syncMetricToEntry(
  productId: string,
  date: Date
): Promise<void> {
  // 1. Get the legacy Metric row for this product + date
  const metric = await prisma.metric.findUnique({
    where: { productId_date: { productId, date } },
  });

  if (!metric) return;

  // 2. Get the MetricSetup to know which AARRR keys are selected
  const setup = await prisma.metricSetup.findUnique({
    where: { productId },
  });

  if (!setup) return;

  const selections = (setup.selections as FunnelMetricSelection[]) ?? [];
  if (selections.length === 0) return;

  // Build a lookup: stage → selected keys
  const stageKeys = new Map<FunnelStageKey, Set<string>>();
  for (const s of selections) {
    stageKeys.set(s.stage, new Set(s.selectedMetricKeys));
  }

  // 3. Build the values object — only write stages that have a selected key
  //    that maps to a synced legacy field
  const values: Partial<Record<FunnelStageKey, number>> = {};

  const legacyFields: Array<{ field: keyof typeof FIELD_TO_STAGE; value: number | null }> = [
    { field: "dau", value: metric.dau },
    { field: "mau", value: metric.mau },
    { field: "newSignups", value: metric.newSignups },
    { field: "mrr", value: metric.mrr },
    { field: "churnedUsers", value: metric.churnedUsers },
    { field: "activeSubscriptions", value: metric.activeSubscriptions },
  ];

  for (const { field, value } of legacyFields) {
    if (value === null || value === undefined) continue;

    const targetStage = FIELD_TO_STAGE[field];
    const matchingKeys = FIELD_TO_KEYS[field] ?? [];
    const selectedInStage = stageKeys.get(targetStage);

    if (!selectedInStage) continue;

    // If the user selected any of the matching keys for this stage, write the value
    const hasMatch = matchingKeys.some((k) => selectedInStage.has(k));
    if (!hasMatch) continue;

    // Don't overwrite a stage that was already written by a higher-priority field
    // (e.g. dau and churnedUsers both map to Retention — dau wins if both present)
    if (values[targetStage] !== undefined) continue;

    values[targetStage] = value;
  }

  if (Object.keys(values).length === 0) return;

  // 4. Upsert MetricEntry — merge with any existing manual values (manual wins)
  const existingEntry = await prisma.metricEntry.findUnique({
    where: { productId_date: { productId, date } },
  });

  const mergedValues = existingEntry
    ? {
        ...(values as Record<string, number>),
        // Manual entries already present take precedence
        ...(existingEntry.values as Record<string, number>),
      }
    : values;

  const metricSetup = await getOrCreateMetricSetup(productId);

  await prisma.metricEntry.upsert({
    where: { productId_date: { productId, date } },
    update: { values: mergedValues },
    create: {
      productId,
      metricSetupId: metricSetup.id,
      date,
      values: mergedValues,
    },
  });
}
