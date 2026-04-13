import { PrismaClient } from "@prisma/client";

async function main() {
  const databaseUrl = process.env.DATABASE_URL || process.env.DIRECT_URL;
  if (!databaseUrl) {
    throw new Error("Set DATABASE_URL or DIRECT_URL before running this script.");
  }

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

  console.log("🚀 Testing production database connectivity...");

  try {
    // Find a user to attach the product to
    const user = await prisma.user.findFirst();
    if (!user) {
      console.error("❌ No users found in database. Create a user first.");
      return;
    }

    console.log(`✅ Found user: ${user.email} (ID: ${user.id})`);

    const mockProduct = await prisma.product.create({
      data: {
        userId: user.id,
        name: "Mock Tiramisu 1.0",
        description: "A delicious mock product created for stability testing.",
        status: "PRE_LAUNCH",
        launchStatus: "Fikir Aşamasında",
        category: "SaaS",
        targetAudience: "Early stage founders",
        businessModel: "Subscription",
      },
    });

    console.log("✅ Mock product created successfully!");
    console.log("Product ID:", mockProduct.id);

    // Create a dummy metric setup for it
    await prisma.metricSetup.create({
      data: {
        productId: mockProduct.id,
        selections: [],
        platforms: [],
        founderSummary: {
          headline: "Mock Launch Strategy",
          summary: "Focus on stability and basic user flow first.",
          nextStep: "Run another stability test.",
          strengths: ["Clean code", "Stable DB"],
          focusAreas: ["UX", "Monitoring"],
        },
      },
    });

    console.log("✅ MetricSetup created successfully!");

  } catch (error) {
    console.error("❌ Database operation failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
