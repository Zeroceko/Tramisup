import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from "bcryptjs";
import { LaunchCategory, GrowthCategory, Priority, TaskStatus, MetricSource, ProductStatus } from "@prisma/client";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');

  if (secret !== 'tiramisu_shakalaka_123') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const email = "m@m.com";
  const password = "1234";
  const hashedPassword = await bcrypt.hash(password, 10);

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

    // 2. Product (Start fresh for this user)
    await prisma.product.deleteMany({ where: { userId: user.id } });

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

    // 3. Launch Checklist
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

    // 4. Growth Checklist
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

    // 5. Metrics
    const metricsData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      metricsData.push({
        productId: product.id,
        date,
        mrr: 100 + (6 - i) * 20,
        dau: 50 + (6 - i) * 5,
        mau: 1500,
        newSignups: 10 + (6 - i),
        activeSubscriptions: 5 + (6 - i),
        source: MetricSource.MANUAL,
      });
    }
    await prisma.metric.createMany({ data: metricsData });

    // 6. Tasks
    const tasks = [
      { title: "Bug: Logo responsive değil", status: TaskStatus.TODO, priority: Priority.HIGH },
      { title: "Yeni metrik girişi yap", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "Stripe webhook testleri", status: TaskStatus.DONE, priority: Priority.HIGH },
      { title: "User Interview #1", status: TaskStatus.DONE, priority: Priority.LOW },
      { title: "Twitter'da fırlatma tarihi duyurusu", status: TaskStatus.TODO, priority: Priority.MEDIUM },
      { title: "Database backup kontrolü", status: TaskStatus.IN_PROGRESS, priority: Priority.HIGH },
    ];

    await prisma.task.createMany({
      data: tasks.map((t, i) => ({
        productId: product.id,
        ...t,
        order: i,
      })),
    });

    // 7. MetricSetup & Summary
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

    return NextResponse.json({ success: true, message: 'Deep seeding complete for m@m.com' });
  } catch (error: any) {
    console.error('Seeding API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
