/**
 * Data migration script: Product.launchGoals JSON → MetricSetup + MetricEntry tables
 *
 * Usage:
 *   npx tsx scripts/migrate-launch-goals.ts
 *
 * This script:
 * 1. Reads all products that have a non-null launchGoals JSON field
 * 2. Parses the JSON and creates MetricSetup + MetricEntry records
 * 3. Skips products that already have a MetricSetup record
 * 4. Reports results
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type FunnelMetricSelection = {
  stage: string;
  selectedMetricKeys: string[];
};

type MetricEntryRow = {
  date: string;
  values: Record<string, number>;
};

type SavedMetricSetup = {
  version: number;
  selections: FunnelMetricSelection[];
  entries: MetricEntryRow[];
  platforms?: string[];
  ignoredLaunchChecklistIds?: string[];
  founderSummary?: {
    headline: string;
    summary: string;
    nextStep: string;
    strengths: string[];
    focusAreas: string[];
  };
};

function parseLaunchGoals(value: string | null): SavedMetricSetup | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed?.version === 1 && Array.isArray(parsed?.selections)) {
      return { version: 2, selections: parsed.selections, entries: [] };
    }
    if (![2, 3].includes(parsed?.version) || !Array.isArray(parsed?.selections) || !Array.isArray(parsed?.entries)) {
      return null;
    }
    return parsed as SavedMetricSetup;
  } catch {
    return null;
  }
}

async function main() {
  console.log("Starting launchGoals → MetricSetup migration...\n");

  const products = await prisma.product.findMany({
    where: { launchGoals: { not: null } },
    select: { id: true, name: true, launchGoals: true },
  });

  console.log(`Found ${products.length} products with launchGoals data.\n`);

  let migrated = 0;
  let skipped = 0;
  let failed = 0;

  for (const product of products) {
    const existing = await prisma.metricSetup.findUnique({
      where: { productId: product.id },
    });

    if (existing) {
      console.log(`  SKIP: ${product.name} (${product.id}) — MetricSetup already exists`);
      skipped++;
      continue;
    }

    const parsed = parseLaunchGoals(product.launchGoals);
    if (!parsed) {
      console.log(`  SKIP: ${product.name} (${product.id}) — invalid launchGoals JSON`);
      skipped++;
      continue;
    }

    try {
      const setup = await prisma.metricSetup.create({
        data: {
          productId: product.id,
          selections: parsed.selections,
          platforms: parsed.platforms ?? [],
          ignoredChecklistIds: parsed.ignoredLaunchChecklistIds ?? [],
          founderSummary: parsed.founderSummary ?? undefined,
        },
      });

      if (parsed.entries.length > 0) {
        await prisma.metricEntry.createMany({
          data: parsed.entries.map((entry) => ({
            productId: product.id,
            metricSetupId: setup.id,
            date: new Date(entry.date),
            values: entry.values,
          })),
          skipDuplicates: true,
        });
      }

      console.log(`  OK: ${product.name} (${product.id}) — ${parsed.selections.length} selections, ${parsed.entries.length} entries`);
      migrated++;
    } catch (error) {
      console.error(`  FAIL: ${product.name} (${product.id})`, error);
      failed++;
    }
  }

  console.log(`\n--- Migration complete ---`);
  console.log(`Migrated: ${migrated}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Failed:   ${failed}`);

  await prisma.$disconnect();
}

main().catch((error) => {
  console.error("Migration failed:", error);
  process.exit(1);
});
