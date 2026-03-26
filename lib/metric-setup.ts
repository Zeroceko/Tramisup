import { prisma } from "@/lib/prisma";

export type FunnelStageKey = "Awareness" | "Acquisition" | "Activation" | "Retention" | "Referral" | "Revenue";

export type FunnelMetricSelection = {
  stage: FunnelStageKey;
  selectedMetricKeys: string[];
};

export type MetricEntryRow = {
  date: string;
  values: Partial<Record<FunnelStageKey, number>>;
};

export type FounderSummaryData = {
  headline: string;
  summary: string;
  nextStep: string;
  strengths: string[];
  focusAreas: string[];
};

export type SavedMetricSetup = {
  version: 2 | 3;
  selections: FunnelMetricSelection[];
  entries: MetricEntryRow[];
  platforms?: string[];
  ignoredLaunchChecklistIds?: string[];
  founderSummary?: FounderSummaryData;
};

// ---------------------------------------------------------------------------
// Legacy JSON helpers — kept for migration compatibility
// ---------------------------------------------------------------------------

export function parseSavedMetricSetup(value: string | null | undefined): SavedMetricSetup | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as SavedMetricSetup | { version: 1; selections: FunnelMetricSelection[] };
    if (parsed?.version === 1 && Array.isArray(parsed?.selections)) {
      return {
        version: 2,
        selections: parsed.selections,
        entries: [],
      };
    }

    if (![2, 3].includes(parsed?.version as number) || !Array.isArray((parsed as SavedMetricSetup)?.selections) || !Array.isArray((parsed as SavedMetricSetup)?.entries)) {
      return null;
    }

    return parsed as SavedMetricSetup;
  } catch {
    return null;
  }
}

export function buildSavedMetricSetupValue(
  current: string | null | undefined,
  updater: (setup: SavedMetricSetup) => SavedMetricSetup
) {
  const parsed = parseSavedMetricSetup(current);
  const base: SavedMetricSetup = parsed ?? {
    version: 3,
    selections: [],
    entries: [],
  };

  return JSON.stringify(updater(base));
}

// ---------------------------------------------------------------------------
// New DB-backed helpers
// ---------------------------------------------------------------------------

/** Fetch metric setup from the MetricSetup table, returning the same shape as the legacy JSON. */
export async function getMetricSetup(productId: string): Promise<SavedMetricSetup | null> {
  const setup = await prisma.metricSetup.findUnique({
    where: { productId },
    include: {
      entries: {
        orderBy: { date: "asc" },
      },
    },
  });

  if (!setup) return null;

  const selections = setup.selections as FunnelMetricSelection[];
  const entries: MetricEntryRow[] = setup.entries.map((e) => ({
    date: e.date.toISOString().slice(0, 10),
    values: e.values as Partial<Record<FunnelStageKey, number>>,
  }));

  const result: SavedMetricSetup = {
    version: 3,
    selections,
    entries,
    platforms: setup.platforms,
    ignoredLaunchChecklistIds: setup.ignoredChecklistIds,
  };

  if (setup.founderSummary) {
    result.founderSummary = setup.founderSummary as FounderSummaryData;
  }

  return result;
}

/** Get or create MetricSetup for a product — returns the setup record. */
export async function getOrCreateMetricSetup(productId: string) {
  let setup = await prisma.metricSetup.findUnique({ where: { productId } });
  if (!setup) {
    setup = await prisma.metricSetup.create({
      data: {
        productId,
        selections: [],
      },
    });
  }
  return setup;
}

/** Save AARRR metric selections for a product. */
export async function saveMetricSelections(
  productId: string,
  selections: FunnelMetricSelection[]
) {
  return prisma.metricSetup.upsert({
    where: { productId },
    update: { selections },
    create: {
      productId,
      selections,
    },
  });
}

/** Save a daily metric entry. */
export async function saveMetricEntry(
  productId: string,
  date: string,
  values: Partial<Record<FunnelStageKey, number>>
) {
  const setup = await getOrCreateMetricSetup(productId);
  const dateObj = new Date(date);

  return prisma.metricEntry.upsert({
    where: {
      productId_date: { productId, date: dateObj },
    },
    update: { values },
    create: {
      productId,
      metricSetupId: setup.id,
      date: dateObj,
      values,
    },
  });
}

/** Update ignored checklist IDs in MetricSetup. */
export async function updateIgnoredChecklistIds(
  productId: string,
  ignoredChecklistIds: string[]
) {
  return prisma.metricSetup.upsert({
    where: { productId },
    update: { ignoredChecklistIds },
    create: {
      productId,
      selections: [],
      ignoredChecklistIds,
    },
  });
}

/** Update founder summary in MetricSetup. */
export async function updateFounderSummary(
  productId: string,
  founderSummary: FounderSummaryData
) {
  return prisma.metricSetup.upsert({
    where: { productId },
    update: { founderSummary },
    create: {
      productId,
      selections: [],
      founderSummary,
    },
  });
}
