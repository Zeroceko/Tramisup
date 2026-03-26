import { PrismaClient, LaunchCategory, GrowthCategory, Priority, TaskStatus, MetricSource, ProductStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

async function main() {
  const PROD_URL = "postgresql://postgres.ojecebxxcbxrofnbkaae:IxK8QJnDQNjc7Zpf@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1";
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

  console.log(`🚀 Starting COMPREHENSIVE SEEDING for: ${email}...`);

  try {
    // 1. User
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash: hashedPassword },
      create: {
        email,
        passwordHash: hashedPassword,
        name: "M User",
      },
    });
    console.log(`✅ User updated: ${user.id}`);

    // Clean up existing products for this user to start fresh (for testing)
    const existingProducts = await prisma.product.findMany({ where: { userId: user.id } });
    for (const p of existingProducts) {
      await prisma.product.delete({ where: { id: p.id } });
    }
    console.log("🧹 Cleaned up old products.");

    // 2. Product
    const product = await prisma.product.create({
      data: {
        userId: user.id,
        name: "Tiramisup",
        status: ProductStatus.PRE_LAUNCH,
        launchStatus: "Yakında Yayında",
        launchDate: new Date("2026-04-30T00:00:00Z"),
        description: "Founders için fırlatma ve büyüme odağı sağlayan AI mentor sistemi.",
        category: "SaaS, Developer Tools",
        targetAudience: "Indie Hackers, Solo Founders",
        businessModel: "Subscription",
      },
    });
    console.log(`✅ Product created: ${product.id}`);

    // 3. Launch Checklist (10 items)
    const launchItems = [
      { title: "Landing page tasarımı", completed: true, category: LaunchCategory.MARKETING },
      { title: "Waitlist entegrasyonu", completed: true, category: LaunchCategory.TECH },
      { title: "Kullanıcı sözleşmesi (EULA)", completed: false, category: LaunchCategory.LEGAL },
      { title: "Stripe hesabı açılışı", completed: true, category: LaunchCategory.TECH },
      { title: "Product Hunt sayfası hazırlığı", completed: false, category: LaunchCategory.MARKETING },
      { title: "Twitter/X duyurusu", completed: true, category: LaunchCategory.MARKETING },
      { title: "Beta kullanıcıları için onboarding", completed: false, category: LaunchCategory.PRODUCT },
      { title: "Analytics (GA4) kurulumu", completed: false, category: LaunchCategory.TECH },
      { title: "Hata takip sistemi (Sentry)", completed: false, category: LaunchCategory.TECH },
      { title: "Pricing tablosu netleştirme", completed: false, category: LaunchCategory.PRODUCT },
    ];

    await prisma.launchChecklist.createMany({
      data: launchItems.map((item, i) => ({
        productId: product.id,
        ...item,
        order: i,
        priority: i % 3 === 0 ? Priority.HIGH : Priority.MEDIUM,
      })),
    });
    console.log("✅ Launch Checklist seeded.");

    // 4. Growth Checklist (5 items)
    const growthItems = [
      { title: "Haftalık bülten gönderimi", category: GrowthCategory.RETENTION },
      { title: "SEO için anahtar kelime analizi", category: GrowthCategory.ACQUISITION },
      { title: "Retargeting reklamları", category: GrowthCategory.ACQUISITION },
      { title: "Referral sistemi kurulumu", category: GrowthCategory.REVENUE },
      { title: "Onboarding drop-off analizi", category: GrowthCategory.ACTIVATION },
    ];

    await prisma.growthChecklist.createMany({
      data: growthItems.map((item, i) => ({
        productId: product.id,
        ...item,
        order: i,
        completed: false,
      })),
    });
    console.log("✅ Growth Checklist seeded.");

    // 5. Metrics (7 days of data for trends)
    const metricsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      metricsData.push({
        productId: product.id,
        date,
        mrr: 100 + (6 - i) * 20, // MRR increasing
        dau: 50 + (6 - i) * 5,   // DAU increasing
        mau: 1500,
        newSignups: 10 + (6 - i),
        activeSubscriptions: 5 + (6 - i),
        source: MetricSource.MANUAL,
      });
    }

    await prisma.metric.createMany({ data: metricsData });
    console.log("✅ Metrics (7 days) seeded.");

    // 6. Tasks (10 items)
    const tasks = [
      { title: "Bug: Logo responsive değil", status: TaskStatus.TODO, priority: Priority.HIGH },
      { title: "Yeni metrik girişi yap", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "Stripe webhook testleri", status: TaskStatus.DONE, priority: Priority.HIGH },
      { title: "User Interview #1", status: TaskStatus.DONE, priority: Priority.LOW },
      { title: "Twitter'da fırlatma tarihi duyurusu", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "Database backup kontrolü", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH },
      { title: "Copywriting revizyonu", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "Demo videosu çek", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "GA4 Dashboard kurulumu", status: TaskStatus.TODO, priority: Priority.LOW },
      { title: "Open Graph tagleri ekle", status: TaskStatus.DONE, priority: Priority.MEDIUM },
    ];

    await prisma.task.createMany({
      data: tasks.map((t, i) => ({
        productId: product.id,
        ...t,
        order: i,
      })),
    });
    console.log("✅ Tasks seeded.");

    // 7. MetricSetup & Founder Summary
    await prisma.metricSetup.create({
      data: {
        productId: product.id,
        selections: [],
        platforms: ["iOS", "Web"],
        founderSummary: {
          headline: "Tiramisup Fırlatma Planın Aktif! 🚀",
          summary: "Harika bir başlangıç yaptın. Ürünün şu an %40 fırlatma hazırlığı puanında. MRR ve DAU trendlerin yukarı yönlü, bu da fırlatma öncesi topluluğun ısındığını gösteriyor.",
          nextStep: "Checklist'teki 'App Store Connect' maddesini tamamlayarak teknik hazırlığı bitir.",
          strengths: ["Güçlü MRR büyümesi", "Net fırlatma takvimi"],
          focusAreas: ["Onboarding hızı", "Kitle genişletme"],
        },
      },
    });
    console.log("✅ MetricSetup and Summary seeded.");

    console.log("\n💎 CRYSTAL CLEAR SEEDING COMPLETE! User m@m.com is 100% ready.");

  } catch (error) {
    console.error("❌ Deep Seeding failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
