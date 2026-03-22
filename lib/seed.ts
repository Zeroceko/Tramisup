import { prisma } from "@/lib/prisma";
import type {
  ActivationStep,
  LaunchCategory,
  GrowthCategory,
  EventType,
  Frequency,
  MetricSource,
  Priority,
  TaskStatus,
} from "@prisma/client";
import type { AiPlan } from "@/lib/ai-plan";

// Seed AI-generated plan (launch checklist, growth checklist, tasks)
export async function seedAiPlan(productId: string, plan: AiPlan, tx?: any) {
  const db = tx || prisma;

  for (const item of plan.launchChecklist) {
    await db.launchChecklist.create({
      data: {
        productId,
        category: item.category,
        title: item.title,
        description: item.description,
        priority: item.priority,
        order: item.order,
        completed: false,
      },
    });
  }

  for (const item of plan.growthChecklist) {
    await db.growthChecklist.create({
      data: {
        productId,
        category: item.category,
        title: item.title,
        description: item.description,
        order: item.order,
        completed: false,
      },
    });
  }

  for (const task of plan.tasks) {
    await db.task.create({
      data: {
        productId,
        title: task.title,
        description: task.description,
        priority: task.priority,
        status: task.status,
      },
    });
  }
}

// Seed static fallback checklists (used when AI is unavailable)
export async function seedStaticChecklists(productId: string, tx?: any) {
  const db = tx || prisma;
  const launchItems: Array<{ category: LaunchCategory; title: string; order: number }> = [
    { category: "PRODUCT", title: "Ürün değer önerisi tanımla", order: 1 },
    { category: "PRODUCT", title: "MVP özellikleri geliştir", order: 2 },
    { category: "PRODUCT", title: "Kullanıcı testi tamamla", order: 3 },
    { category: "PRODUCT", title: "Hata düzeltme ve son işlemler", order: 4 },
    { category: "MARKETING", title: "Landing page oluştur", order: 1 },
    { category: "MARKETING", title: "Sosyal medya hesaplarını kur", order: 2 },
    { category: "MARKETING", title: "Launch duyurusunu hazırla", order: 3 },
    { category: "MARKETING", title: "E-posta listesi oluştur", order: 4 },
    { category: "LEGAL", title: "Gizlilik politikası yayınla", order: 1 },
    { category: "LEGAL", title: "Kullanım koşullarını yayınla", order: 2 },
    { category: "LEGAL", title: "Çerez onayını uygula", order: 3 },
    { category: "TECH", title: "Üretim ortamını kur", order: 1 },
    { category: "TECH", title: "Analitiği entegre et", order: 2 },
    { category: "TECH", title: "Performans optimizasyonu", order: 3 },
    { category: "TECH", title: "Güvenlik denetimini tamamla", order: 4 },
  ];

  for (const item of launchItems) {
    await db.launchChecklist.create({
      data: {
        productId,
        category: item.category,
        title: item.title,
        order: item.order,
        completed: Math.random() > 0.6,
      },
    });
  }

  // Growth checklist items
  const growthItems: Array<{ category: GrowthCategory; title: string; order: number }> = [
    { category: "ACQUISITION", title: "SEO stratejisi oluştur", order: 1 },
    { category: "ACQUISITION", title: "Paid ads kampanyası kur", order: 2 },
    { category: "ACQUISITION", title: "Referral programı tasarla", order: 3 },
    { category: "ACTIVATION", title: "Onboarding akışını optimize et", order: 1 },
    { category: "ACTIVATION", title: "İlk değer anını hızlandır", order: 2 },
    { category: "ACTIVATION", title: "Hoş geldin e-posta dizisi kur", order: 3 },
    { category: "RETENTION", title: "Haftalık engagement e-postaları", order: 1 },
    { category: "RETENTION", title: "Push notification stratejisi", order: 2 },
    { category: "RETENTION", title: "Churn analizi ve önleme", order: 3 },
    { category: "REVENUE", title: "Pricing sayfası A/B testi", order: 1 },
    { category: "REVENUE", title: "Upsell fırsatlarını belirle", order: 2 },
    { category: "REVENUE", title: "Annual plan indirimi kur", order: 3 },
  ];

  for (const item of growthItems) {
    await db.growthChecklist.create({
      data: {
        productId,
        category: item.category,
        title: item.title,
        order: item.order,
        completed: Math.random() > 0.7,
      },
    });
  }

  // Tasks (Kanban)
  const tasks: Array<{ title: string; status: TaskStatus; priority: Priority; dueDate: Date }> = [
    { title: "Ürün demo görüşmeleri planla", status: "TODO", priority: "HIGH", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
    { title: "Launch hakkında blog yazısı yaz", status: "TODO", priority: "MEDIUM", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
    { title: "Teknoloji gazetecileriyle iletişime geç", status: "IN_PROGRESS", priority: "MEDIUM", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
    { title: "Yatırımcı güncellemesi hazırla", status: "IN_PROGRESS", priority: "LOW", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    { title: "Landing page kopyasını güncelle", status: "DONE", priority: "HIGH", dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { title: "Analytics entegrasyonu", status: "DONE", priority: "MEDIUM", dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
  ];

  for (const task of tasks) {
    await db.task.create({
      data: { productId, title: task.title, status: task.status, priority: task.priority, dueDate: task.dueDate },
    });
  }
}

// Seed demo metrics/numbers (only when user opts in to demo data)
export async function seedMetricsData(productId: string, tx?: any) {
  const db = tx || prisma;
  const manualSource: MetricSource = "MANUAL";
  for (let i = 30; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dau = 100 + (30 - i) * 5 + Math.floor(Math.random() * 20);
    const mrr = 500 + (30 - i) * 50 + Math.floor(Math.random() * 100);
    await db.metric.create({
      data: {
        productId,
        date,
        dau,
        mau: dau * 10,
        mrr,
        activeSubscriptions: Math.floor(mrr / 29),
        newSignups: Math.floor(Math.random() * 15) + 5,
        churnedUsers: Math.floor(Math.random() * 3),
        activationRate: 60 + Math.random() * 20,
        source: manualSource,
      },
    });
  }

  // Retention cohorts
  for (let i = 5; i >= 0; i--) {
    const cohortDate = new Date();
    cohortDate.setMonth(cohortDate.getMonth() - i);
    await db.retentionCohort.create({
      data: {
        productId,
        cohortDate,
        usersCount: 100 + i * 20,
        retentionDay1: 85 + Math.random() * 10,
        retentionDay7: 65 + Math.random() * 15,
        retentionDay30: 45 + Math.random() * 15,
        retentionDay60: 35 + Math.random() * 10,
        retentionDay90: 28 + Math.random() * 7,
      },
    });
  }

  // Activation funnel
  const funnelSteps: Array<{ step: ActivationStep; count: number; conversionRate: number }> = [
    { step: "SIGNUP", count: 1000, conversionRate: 100 },
    { step: "ONBOARDING", count: 850, conversionRate: 85 },
    { step: "FIRST_ACTION", count: 680, conversionRate: 68 },
    { step: "ACTIVATED", count: 550, conversionRate: 55 },
  ];
  for (const step of funnelSteps) {
    await db.activationFunnel.create({
      data: { productId, date: new Date(), step: step.step, count: step.count, conversionRate: step.conversionRate },
    });
  }

  // Goals
  const goals = [
    {
      title: "1.000 aktif kullanıcıya ulaş",
      targetValue: 1000,
      currentValue: 250,
      unit: "kullanıcı",
      startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
    {
      title: "$5.000 MRR'a ulaş",
      targetValue: 5000,
      currentValue: 1800,
      unit: "$",
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  ];
  for (const goal of goals) {
    await db.goal.create({ data: { productId, ...goal } });
  }

  // Routines
  const routines: Array<{ title: string; description: string; frequency: Frequency }> = [
    { title: "Haftalık metrik incelemesi", description: "DAU, MAU ve dönüşüm oranlarını analiz et", frequency: "WEEKLY" },
    { title: "Aylık yatırımcı güncellemesi", description: "İlerleme raporu gönder", frequency: "MONTHLY" },
    { title: "Haftalık içerik paylaşımı", description: "Sosyal medyada güncellemeleri paylaş", frequency: "WEEKLY" },
  ];
  for (const routine of routines) {
    await db.growthRoutine.create({ data: { productId, ...routine } });
  }

  // Timeline events
  const events: Array<{ eventType: EventType; title: string; date: Date }> = [
    { eventType: "MILESTONE", title: "İlk 100 kullanıcı", date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) },
    { eventType: "LAUNCH", title: "Ürün launch'u", date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    { eventType: "METRIC_THRESHOLD", title: "$1.000 MRR'a ulaşıldı", date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
  ];
  for (const event of events) {
    await db.timelineEvent.create({ data: { productId, eventType: event.eventType, title: event.title, date: event.date } });
  }
}

// Backwards-compatible wrapper (used by tests + old code)
export async function seedProductData(productId: string, tx?: any) {
  await seedStaticChecklists(productId, tx);
  await seedMetricsData(productId, tx);
}
