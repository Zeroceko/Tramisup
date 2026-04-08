import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateAiPlan } from "@/lib/ai-plan";
import { buildFounderSummary } from "@/lib/founder-summary";
import { checkLimit } from "@/lib/plan-limits";
import { seedAiPlan, seedMetricsData } from "@/lib/seed";
import { scrapeUrl } from "@/lib/url-scraper";
import { Prisma } from "@prisma/client";

function deriveProductStatus(launchStatus?: string) {
  if (launchStatus === "Büyüme aşamasında") return "GROWING" as const;
  if (launchStatus === "Yayında") return "LAUNCHED" as const;
  return "PRE_LAUNCH" as const;
}

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

async function resolveProductOwner(sessionUser: {
  id?: string | null;
  email?: string | null;
  name?: string | null;
}) {
  if (!sessionUser.id) return null;

  const byId = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true },
  });
  if (byId) return byId;

  const normalizedEmail = typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase() : null;
  if (normalizedEmail) {
    const byEmail = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (byEmail) return byEmail;
  }

  if (!normalizedEmail) return null;

  // Session may reference an id from a different DB snapshot.
  // Recreate a compatible local row so product creation does not fail on FK.
  return prisma.user.create({
    data: {
      id: sessionUser.id,
      email: normalizedEmail,
      name: sessionUser.name || normalizedEmail.split("@")[0],
      passwordHash: await bcrypt.hash(randomUUID(), 10),
    },
    select: { id: true },
  });
}

async function ensureProductOwnerInTx(
  tx: Prisma.TransactionClient,
  sessionUser: { id?: string | null; email?: string | null; name?: string | null },
) {
  if (!sessionUser.id) return null;

  const byId = await tx.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true },
  });
  if (byId) return byId;

  const normalizedEmail =
    typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase() : null;
  if (normalizedEmail) {
    const byEmail = await tx.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true },
    });
    if (byEmail) return byEmail;
  }

  const fallbackEmail = normalizedEmail ?? `session-${sessionUser.id}@local.tiramisup`;
  const fallbackName =
    (typeof sessionUser.name === "string" && sessionUser.name.trim().length > 0
      ? sessionUser.name
      : fallbackEmail.split("@")[0]);

  try {
    return await tx.user.create({
      data: {
        id: sessionUser.id,
        email: fallbackEmail,
        name: fallbackName,
        passwordHash: await bcrypt.hash(randomUUID(), 10),
      },
      select: { id: true },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002" &&
      normalizedEmail
    ) {
      const byEmailRetry = await tx.user.findUnique({
        where: { email: normalizedEmail },
        select: { id: true },
      });
      if (byEmailRetry) return byEmailRetry;
    }
    throw error;
  }
}

async function forceEnsureOwner(
  sessionUser: { id?: string | null; email?: string | null; name?: string | null },
) {
  if (!sessionUser.id) return null;
  const normalizedEmail =
    typeof sessionUser.email === "string" ? sessionUser.email.toLowerCase() : null;
  const fallbackEmail = normalizedEmail ?? `session-${sessionUser.id}@local.tiramisup`;
  const fallbackName =
    (typeof sessionUser.name === "string" && sessionUser.name.trim().length > 0
      ? sessionUser.name
      : fallbackEmail.split("@")[0]);

  return prisma.user.upsert({
    where: { id: sessionUser.id },
    create: {
      id: sessionUser.id,
      email: fallbackEmail,
      name: fallbackName,
      passwordHash: await bcrypt.hash(randomUUID(), 10),
    },
    update: {
      email: fallbackEmail,
      name: fallbackName,
    },
    select: { id: true },
  });
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await resolveProductOwner({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
    if (!user) {
      return NextResponse.json(
        { error: "Session user not found. Please sign out and sign in again.", code: "USER_NOT_FOUND" },
        { status: 401 },
      );
    }

    const products = await prisma.product.findMany({
      where: { userId: user.id },
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

    const user = await resolveProductOwner({
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
    });
    if (!user) {
      return NextResponse.json(
        {
          error: "Session user not found. Please sign out and sign in again.",
          code: "USER_NOT_FOUND",
        },
        { status: 401 },
      );
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
      launchDate,
      website,
      growthGoal,
      goalKey,
      stageContext,
      locale,
      seedData = false,
    } = body;

    if (!name || !category || !targetAudience || !businessModel) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    const productLimit = await checkLimit(user.id, "products", 1);
    if (!productLimit.allowed) {
      return NextResponse.json(
        {
          error: `Product limit reached (${productLimit.used}/${productLimit.limit}). Upgrade to create another product.`,
          code: "PRODUCT_LIMIT_REACHED",
          resource: "products",
          used: productLimit.used,
          limit: productLimit.limit,
          upgradeUrl: `/${locale === "tr" ? "tr" : "en"}/pricing`,
        },
        { status: 403 }
      );
    }

    // Normalize platforms: prefer new universal `platforms` field, fallback to legacy `mobilePlatforms`
    const normalizedPlatforms = Array.isArray(platforms)
      ? platforms.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
      : Array.isArray(mobilePlatforms)
        ? mobilePlatforms.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
        : [];
    const isMobileApp = /mobil uygulama|mobile app/i.test(category ?? "");
    const hasMobilePlatform = normalizedPlatforms.some((p) => ["iOS", "Android"].includes(p));
    const storeContext = isMobileApp || hasMobilePlatform
      ? ["Yayında", "Büyüme aşamasında"].includes(launchStatus)
        ? `Mobil uygulama platformlari: ${normalizedPlatforms.filter((p) => ["iOS", "Android"].includes(p)).join(", ") || "belirtilmemiş"}. Urun yayinda; store listing ve ASO tarafini growth sinyali gibi yorumla, submission-ready checklist'e donme.`
        : `Mobil uygulama platformlari: ${normalizedPlatforms.filter((p) => ["iOS", "Android"].includes(p)).join(", ") || "belirtilmemiş"}. App Store ve Google Play icin submission-ready checklist olustur.`
      : "";

    const dbUrl = process.env.DATABASE_URL || "";
    console.log(`[api/products] DB_URL_PREFIX: ${dbUrl.slice(0, 20)}... (Length: ${dbUrl.length})`);

    // 1. Generate AI plan BEFORE transaction (Gemini call, non-blocking on failure)
    const candidateLinks = extractCandidateLinks([website, description, stageContext]);
    const websiteContent = await scrapeProductLinks(candidateLinks);
    console.log("[api/products] Generating AI plan...");
    const aiPlan = await generateAiPlan({
      name,
      description,
      locale,
      category,
      targetAudience,
      businessModel,
      launchStatus,
      goalKey,
      growthGoal,
      website,
      mobilePlatforms: normalizedPlatforms,
      websiteContent: websiteContent ?? undefined,
      stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
    });
    console.log("[api/products] AI plan result:", aiPlan ? "SUCCESS (object generated)" : "FALLBACK / NULL");

    console.log("[api/products] Building founder summary...");
    const founderSummary = await buildFounderSummary({
      name,
      description,
      locale,
      category,
      targetAudience,
      businessModel,
      launchStatus,
      website,
      mobilePlatforms: normalizedPlatforms,
      websiteContent: websiteContent ?? undefined,
      stageContext: [stageContext, storeContext].filter(Boolean).join(" "),
    }, aiPlan);

    // 2. Create product + seed data in a transaction
    // If AI plan failed, product still gets created (AI enrichment is non-blocking)
    console.log("[api/products] Starting DB transaction...");
    const createProductTx = async () =>
      prisma.$transaction(async (tx) => {
        const owner = await ensureProductOwnerInTx(tx, {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });
        if (!owner) {
          throw new Error("SESSION_OWNER_MISSING");
        }

        const productStatus = deriveProductStatus(launchStatus);

        console.log("[api/products] Creating Product record...");
        const newProduct = await tx.product.create({
          data: {
            userId: owner.id,
            name,
            status: productStatus,
            launchStatus,
            category,
            description,
            targetAudience,
            businessModel,
            website,
            launchGoals: goalKey ? JSON.stringify({ goalKey, growthGoal }) : undefined,
            launchDate: (() => {
              if (!launchDate) return undefined;
              const d = new Date(launchDate);
              if (isNaN(d.getTime())) {
                console.warn(`[api/products] Invalid launchDate provided: ${launchDate}. Skipping date field.`);
                return undefined;
              }
              return d;
            })(),
          },
        });

        // Create MetricSetup record with platforms and founderSummary
        await tx.metricSetup.create({
          data: {
            productId: newProduct.id,
            selections: [],
            platforms: normalizedPlatforms,
            founderSummary,
          },
        });

        if (aiPlan) {
          await seedAiPlan(
            newProduct.id,
            aiPlan,
            tx,
            (locale ?? "en").toLowerCase().startsWith("tr") ? "tr" : "en",
          );
        }

        // Seed demo metrics only if user opted in
        if (seedData) {
          await seedMetricsData(newProduct.id, tx);
        }

        return newProduct;
      });

    let product;
    try {
      product = await createProductTx();
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2003"
      ) {
        console.warn("[api/products] FK mismatch detected. Attempting owner self-heal + retry.");
        await forceEnsureOwner({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        });
        product = await createProductTx();
      } else {
        throw error;
      }
    }

    const response = NextResponse.json(product, { status: 201 });
    response.cookies.set("activeProductId", product.id, {
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch (error: any) {
    console.error("❌ [api/products] CRITICAL FAILURE:", error);
    if (error.stack) console.error(error.stack);

    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2003"
    ) {
      return NextResponse.json(
        {
          error: "User session and database user record are out of sync. Please sign out and sign in again.",
          code: "USER_DB_SYNC_REQUIRED",
        },
        { status: 409 },
      );
    }
    
    return NextResponse.json(
      { error: `Failed to create product: ${error.message || "Unknown error"}` },
      { status: 500 }
    );
  }
}
