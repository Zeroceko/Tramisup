import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan } from "@/lib/ai-plan";
import { buildFounderSummary } from "@/lib/founder-summary";
import { seedAiPlan, seedMetricsData } from "@/lib/seed";
import { scrapeUrl } from "@/lib/url-scraper";

function extractCandidateLinks(input: Array<string | undefined | null>) {
  const urlRegex = /https?:\/\/[^\s)]+/gi;
  const found = new Set<string>();

  for (const value of input) {
    if (!value) continue;
    const matches = value.match(urlRegex) ?? [];
    for (const match of matches) {
      const normalized = match.replace(/[.,;]+$/, "");
      found.add(normalized);
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

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      mobilePlatforms,
      targetAudience,
      businessModel,
      launchStatus,
      launchDate,
      website,
      stageContext,
      seedData = false,
    } = body;

    if (!name || !category || !targetAudience || !businessModel) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const normalizedMobilePlatforms = Array.isArray(mobilePlatforms)
      ? mobilePlatforms.filter((platform): platform is string => typeof platform === "string" && platform.trim().length > 0)
      : [];
    const isMobileApp = /mobil uygulama|mobile app/i.test(category ?? "");
    if (isMobileApp && normalizedMobilePlatforms.length === 0) {
      return NextResponse.json(
        { error: "Mobil uygulama için platform seçmelisin" },
        { status: 400 }
      );
    }
    const storeContext = isMobileApp
      ? ["Yayında", "Büyüme aşamasında"].includes(launchStatus)
        ? `Mobil uygulama platformlari: ${normalizedMobilePlatforms.length > 0 ? normalizedMobilePlatforms.join(", ") : "belirtilmemiş"}. Urun yayinda; store listing ve ASO tarafini growth sinyali gibi yorumla, submission-ready checklist'e donme.`
        : `Mobil uygulama platformlari: ${normalizedMobilePlatforms.length > 0 ? normalizedMobilePlatforms.join(", ") : "belirtilmemiş"}. App Store ve Google Play icin submission-ready checklist olustur.`
      : "";

    // 1. Generate AI plan BEFORE transaction (Gemini call, non-blocking on failure)
    const candidateLinks = extractCandidateLinks([website, description, stageContext]);
    const websiteContent = await scrapeProductLinks(candidateLinks);
    const aiPlan = await generateAiPlan({
      name,
      description,
      category,
      targetAudience,
      businessModel,
      launchStatus,
      website,
      mobilePlatforms: normalizedMobilePlatforms,
      websiteContent: websiteContent ?? undefined,
      stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
    });
    const founderSummary = buildFounderSummary({
      name,
      description,
      category,
      targetAudience,
      businessModel,
      launchStatus,
      website,
      mobilePlatforms: normalizedMobilePlatforms,
      websiteContent: websiteContent ?? undefined,
      stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
    }, aiPlan);

    if (!aiPlan) {
      return NextResponse.json(
        {
          error: "Tiramisup su anda ilk onerileri hazirlayamadi. Urun olusturma akisi bu adim tamamlanmadan devam etmemeli. Lutfen tekrar dene.",
        },
        { status: 503 }
      );
    }

    // 2. Create product + seed data in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const productStatus = ["Yayında", "Büyüme aşamasında"].includes(launchStatus)
        ? "LAUNCHED"
        : "PRE_LAUNCH";

      const newProduct = await tx.product.create({
        data: {
          userId: session.user.id,
          name,
          status: productStatus,
          launchStatus,
          category,
          description,
          targetAudience,
          businessModel,
          website,
          launchDate: launchDate ? new Date(launchDate) : undefined,
          launchGoals: JSON.stringify({
            version: 3,
            selections: [],
            entries: [],
            platforms: normalizedMobilePlatforms,
            founderSummary,
          }),
        },
      });

      await seedAiPlan(newProduct.id, aiPlan, tx);

      // Seed demo metrics only if user opted in
      if (seedData) {
        await seedMetricsData(newProduct.id, tx);
      }

      return newProduct;
    });

    const response = NextResponse.json(product, { status: 201 });
    response.cookies.set("activeProductId", product.id, {
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
