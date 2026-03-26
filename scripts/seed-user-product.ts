import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const PROD_URL = "postgresql://postgres.ojecebxxcbxrofnbkaae:IxK8QJnDQNjc7Zpf@aws-1-eu-west-3.pooler.supabase.com:5432/postgres";
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: PROD_URL,
      },
    },
  });

  const email = "m@m.com";
  const password = "1234";
  const hashedPassword = await bcrypt.hash(password, 10);

  console.log(`🚀 Seeding user: ${email}...`);

  try {
    // 1. Create or Update User
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hashedPassword },
      create: {
        email,
        passwordHash: hashedPassword,
        name: "M User",
      },
    });

    console.log(`✅ User ${user.email} ready (ID: ${user.id})`);

    // 2. Create Product
    const launchDate = new Date("2026-04-30T00:00:00Z");
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: "Tiramisup",
        description: "Launch Operating System for Founders",
        status: "PRE_LAUNCH",
        launchStatus: "Yakında Yayında",
        launchDate: launchDate,
        category: "SaaS, Developer Tools",
        targetAudience: "Solo Founders, Indie Hackers",
        businessModel: "Subscription",
      },
    });

    console.log(`✅ Product created: ${product.name} (ID: ${product.id})`);

    // 3. Create MetricSetup with a mock Founder Summary to avoid AI fallback message
    await prisma.metricSetup.create({
      data: {
        productId: product.id,
        selections: [],
        platforms: [],
        founderSummary: {
          headline: "Tiramisup için fırlatma stratejisi hazır!",
          summary: "Ürünün 'Yakında Yayında' aşamasında. 30 Nisan 2026 fırlatma tarihin için kritik hazırlıkları buradan takip edeceğiz.",
          nextStep: "Checklist ekranına giderek ilk 3 hazırlık maddesini tamamla.",
          strengths: ["Net hedef kitle", "Büyüme odaklı mimari"],
          focusAreas: ["Market validation", "Pre-launch momentum"],
        },
      },
    });

    console.log("✅ MetricSetup and Founder Summary seeded.");

    // 4. Create some mock tasks
    await prisma.task.createMany({
      data: [
        {
          productId: product.id,
          title: "Landing page'i optimize et",
          status: "TODO",
          priority: "HIGH",
        },
        {
          productId: product.id,
          title: "Waitlist sistemini kur",
          status: "TODO",
          priority: "MEDIUM",
        }
      ]
    });

    console.log("✅ Mock tasks added.");
    console.log("\n💥 SEEDING COMPLETE! User can now log in with m@m.com / 1234");

  } catch (error) {
    console.error("❌ Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
