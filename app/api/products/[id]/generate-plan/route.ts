import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan } from "@/lib/ai-plan";
import { buildFounderSummary } from "@/lib/founder-summary";
import { seedAiPlan, seedMetricsData } from "@/lib/seed";
import { scrapeUrl } from "@/lib/url-scraper";
import { getFileBuffer } from "@/lib/supabase-storage";
import { extractFileContent } from "@/lib/extract-file-content";
import { isLaunchedLaunchStage } from "@/lib/launch-stage";

type UploadedFileRef = {
  storagePath: string;
  publicUrl: string;
  filename: string;
  mimeType: string;
};

function extractCandidateLinks(input: Array<string | undefined | null>) {
  const urlRegex = /https?:\/\/[^\s)]+/gi;
  const found = new Set<string>();
  for (const value of input) {
    if (!value) continue;
    const matches = value.match(urlRegex) ?? [];
    for (const match of matches) {
      found.add(match.replace(/[.,;]+$/, ""));
    }
  }
  return Array.from(found).slice(0, 3);
}

async function scrapeProductLinks(links: string[]) {
  const parts = await Promise.all(
    links.map(async (link) => {
      const content = await scrapeUrl(link);
      if (!content) return null;
      return `URL: ${link}\n${content}`;
    })
  );
  return parts.filter(Boolean).join("\n\n---\n\n") || null;
}

async function setStep(productId: string, step: string) {
  await prisma.product.update({
    where: { id: productId },
    data: { planMeta: JSON.stringify({ step }) },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const {
    name,
    category,
    description,
    platforms,
    mobilePlatforms,
    targetAudience,
    businessModel,
    launchStatus,
    website,
    growthGoal,
    goalKey,
    stageContext,
    locale,
    seedData = false,
    uploadedFiles = [] as UploadedFileRef[],
    documentLinks = [] as string[],
  } = body;

  const normalizedPlatforms: string[] = Array.isArray(platforms)
    ? platforms.filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0)
    : Array.isArray(mobilePlatforms)
      ? mobilePlatforms.filter((p: unknown): p is string => typeof p === "string" && p.trim().length > 0)
      : [];

  const isMobileApp = /mobil uygulama|mobile app/i.test(category ?? "");
  const hasMobilePlatform = normalizedPlatforms.some((p) => ["iOS", "Android"].includes(p));
  const storeContext =
    isMobileApp || hasMobilePlatform
      ? isLaunchedLaunchStage(launchStatus)
        ? `Mobil uygulama platformlari: ${normalizedPlatforms.filter((p) => ["iOS", "Android"].includes(p)).join(", ") || "belirtilmemiş"}. Urun yayinda; store listing ve ASO tarafini growth sinyali gibi yorumla, submission-ready checklist'e donme.`
        : `Mobil uygulama platformlari: ${normalizedPlatforms.filter((p) => ["iOS", "Android"].includes(p)).join(", ") || "belirtilmemiş"}. App Store ve Google Play icin submission-ready checklist olustur.`
      : "";

  try {
    // Step 1: Extract file contents
    await setStep(id, "extracting_files");
    let additionalContext = "";
    const fileContextParts: string[] = [];

    if ((uploadedFiles as UploadedFileRef[]).length > 0) {
      await Promise.all(
        (uploadedFiles as UploadedFileRef[]).map(async (f: UploadedFileRef) => {
          try {
            const buffer = await getFileBuffer(f.storagePath);
            const extracted = await extractFileContent(buffer, f.mimeType, f.filename);
            if (extracted.text) {
              fileContextParts.push(`File: ${f.filename}\n${extracted.text}`);
            }
          } catch (err) {
            console.warn(`[generate-plan] Failed to extract ${f.filename}:`, err);
          }
        })
      );
      additionalContext = fileContextParts.join("\n\n---\n\n");
    }

    // Step 2: Scrape URLs
    await setStep(id, "scraping_urls");
    const allLinks = [
      ...extractCandidateLinks([website, description, stageContext]),
      ...(documentLinks as string[]).filter((l: string) => l.startsWith("http")),
    ].slice(0, 5);
    const websiteContent = await scrapeProductLinks(allLinks);

    // Step 3: Generate AI plan
    await setStep(id, "generating_plan");
    const fullContext = [additionalContext, websiteContent].filter(Boolean).join("\n\n---\n\n") || undefined;

    const aiPlanResult = await generateAiPlan({
      name: name ?? product.name,
      description: description ?? product.description ?? "",
      locale,
      category: category ?? product.category ?? undefined,
      targetAudience: targetAudience ?? product.targetAudience ?? undefined,
      businessModel: businessModel ?? product.businessModel ?? undefined,
      launchStatus: launchStatus ?? product.launchStatus ?? undefined,
      goalKey,
      growthGoal,
      website: website ?? product.website ?? undefined,
      mobilePlatforms: normalizedPlatforms,
      websiteContent: fullContext,
      stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
    });
    const { plan: aiPlan, source: aiPlanSource } = aiPlanResult;

    const founderSummary = await buildFounderSummary(
      {
        name: name ?? product.name,
        description: description ?? product.description ?? "",
        locale,
        category: category ?? product.category ?? undefined,
        targetAudience: targetAudience ?? product.targetAudience ?? undefined,
        businessModel: businessModel ?? product.businessModel ?? undefined,
        launchStatus: launchStatus ?? product.launchStatus ?? undefined,
        website: website ?? product.website ?? undefined,
        mobilePlatforms: normalizedPlatforms,
        websiteContent: fullContext,
        stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
      },
      aiPlan,
    );

    // Step 4: Seed tasks + checklists
    await setStep(id, "seeding_tasks");
    const localeStr = (locale ?? "en").toLowerCase().startsWith("tr") ? "tr" : "en";

    await prisma.$transaction(async (tx) => {
      await seedAiPlan(id, aiPlan, tx, localeStr, aiPlanSource);

      if (seedData) {
        await seedMetricsData(id, tx);
      }

      // Update MetricSetup founderSummary + platforms
      await tx.metricSetup.updateMany({
        where: { productId: id },
        data: { founderSummary, platforms: normalizedPlatforms },
      });

      // Save extracted context + file refs
      await tx.product.update({
        where: { id },
        data: {
          additionalContext: additionalContext || null,
          uploadedFiles:
            (uploadedFiles as UploadedFileRef[]).length > 0
              ? JSON.stringify(uploadedFiles)
              : null,
        },
      });
    });

    // Step 5: Mark ready
    await setStep(id, "ready");

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("[generate-plan] Error:", err);
    // Mark as ready anyway so the UI doesn't hang
    await setStep(id, "ready").catch(() => {});
    return NextResponse.json({ error: "Plan generation failed" }, { status: 500 });
  }
}
