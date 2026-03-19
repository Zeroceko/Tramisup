import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Clear existing demo data
    await prisma.metric.deleteMany({ where: { projectId: project.id, source: "MANUAL" } });
    await prisma.preLaunchChecklist.deleteMany({ where: { projectId: project.id } });
    await prisma.preLaunchAction.deleteMany({ where: { projectId: project.id } });
    await prisma.retentionCohort.deleteMany({ where: { projectId: project.id } });
    await prisma.activationFunnel.deleteMany({ where: { projectId: project.id } });
    await prisma.goal.deleteMany({ where: { projectId: project.id } });
    await prisma.growthRoutine.deleteMany({ where: { projectId: project.id } });
    await prisma.timelineEvent.deleteMany({ where: { projectId: project.id } });

    // Seed Pre-Launch Checklist
    const checklistItems = [
      // PRODUCT
      { category: "PRODUCT", title: "Define product value proposition", order: 1 },
      { category: "PRODUCT", title: "Build MVP features", order: 2 },
      { category: "PRODUCT", title: "User testing completed", order: 3 },
      { category: "PRODUCT", title: "Bug fixes and polish", order: 4 },
      
      // MARKETING
      { category: "MARKETING", title: "Create landing page", order: 1 },
      { category: "MARKETING", title: "Set up social media accounts", order: 2 },
      { category: "MARKETING", title: "Prepare launch announcement", order: 3 },
      { category: "MARKETING", title: "Build email list", order: 4 },
      
      // LEGAL
      { category: "LEGAL", title: "Privacy policy published", order: 1 },
      { category: "LEGAL", title: "Terms of service published", order: 2 },
      { category: "LEGAL", title: "Cookie consent implemented", order: 3 },
      
      // TECH
      { category: "TECH", title: "Production environment setup", order: 1 },
      { category: "TECH", title: "Analytics integrated", order: 2 },
      { category: "TECH", title: "Performance optimization", order: 3 },
      { category: "TECH", title: "Security audit completed", order: 4 },
    ];

    for (const item of checklistItems) {
      await prisma.preLaunchChecklist.create({
        data: {
          projectId: project.id,
          category: item.category as any,
          title: item.title,
          order: item.order,
          completed: Math.random() > 0.6, // Random completion for demo
        },
      });
    }

    // Seed Actions
    const actions = [
      { title: "Schedule product demo calls", priority: "HIGH", dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) },
      { title: "Write blog post about launch", priority: "MEDIUM", dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
      { title: "Reach out to tech journalists", priority: "MEDIUM", dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) },
      { title: "Prepare investor update", priority: "LOW", dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) },
    ];

    for (const action of actions) {
      await prisma.preLaunchAction.create({
        data: {
          projectId: project.id,
          ...action,
        },
      });
    }

    // Seed Metrics (last 30 days)
    for (let i = 30; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const baseDAU = 100;
      const growth = (30 - i) * 5;
      const dau = baseDAU + growth + Math.floor(Math.random() * 20);
      const mau = dau * 10;
      const mrr = 500 + (30 - i) * 50 + Math.floor(Math.random() * 100);

      await prisma.metric.create({
        data: {
          projectId: project.id,
          date,
          dau,
          mau,
          mrr,
          activeSubscriptions: Math.floor(mrr / 29),
          newSignups: Math.floor(Math.random() * 15) + 5,
          churnedUsers: Math.floor(Math.random() * 3),
          activationRate: 60 + Math.random() * 20,
          source: "MANUAL",
        },
      });
    }

    // Seed Retention Cohorts
    for (let i = 5; i >= 0; i--) {
      const cohortDate = new Date();
      cohortDate.setMonth(cohortDate.getMonth() - i);
      
      await prisma.retentionCohort.create({
        data: {
          projectId: project.id,
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

    // Seed Activation Funnel
    const today = new Date();
    const funnelSteps = [
      { step: "SIGNUP", count: 1000, conversionRate: 100 },
      { step: "ONBOARDING", count: 850, conversionRate: 85 },
      { step: "FIRST_ACTION", count: 680, conversionRate: 68 },
      { step: "ACTIVATED", count: 550, conversionRate: 55 },
    ];

    for (const step of funnelSteps) {
      await prisma.activationFunnel.create({
        data: {
          projectId: project.id,
          date: today,
          step: step.step as any,
          count: step.count,
          conversionRate: step.conversionRate,
        },
      });
    }

    // Seed Goals
    const goals = [
      {
        title: "Reach 1,000 active users",
        targetValue: 1000,
        currentValue: 250,
        unit: "users",
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        title: "Hit $5,000 MRR",
        targetValue: 5000,
        currentValue: 1800,
        unit: "$",
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const goal of goals) {
      await prisma.goal.create({
        data: {
          projectId: project.id,
          ...goal,
        },
      });
    }

    // Seed Growth Routines
    const routines = [
      {
        title: "Weekly metrics review",
        description: "Analyze DAU, MAU, and conversion rates",
        frequency: "WEEKLY",
      },
      {
        title: "Monthly investor update",
        description: "Send progress report to stakeholders",
        frequency: "MONTHLY",
      },
      {
        title: "Weekly content posting",
        description: "Share updates on social media",
        frequency: "WEEKLY",
      },
    ];

    for (const routine of routines) {
      await prisma.growthRoutine.create({
        data: {
          projectId: project.id,
          ...routine,
          frequency: routine.frequency as any,
        },
      });
    }

    // Seed Timeline Events
    const events = [
      {
        eventType: "MILESTONE",
        title: "First 100 users",
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        eventType: "LAUNCH",
        title: "Product launched",
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      },
      {
        eventType: "METRIC_THRESHOLD",
        title: "$1,000 MRR reached",
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      },
    ];

    for (const event of events) {
      await prisma.timelineEvent.create({
        data: {
          projectId: project.id,
          ...event,
          eventType: event.eventType as any,
        },
      });
    }

    return NextResponse.json({
      message: "Demo data seeded successfully!",
      counts: {
        checklist: checklistItems.length,
        actions: actions.length,
        metrics: 31,
        cohorts: 6,
        funnelSteps: 4,
        goals: goals.length,
        routines: routines.length,
        events: events.length,
      },
    });
  } catch (error) {
    console.error("Error seeding data:", error);
    return NextResponse.json(
      { error: "Failed to seed data" },
      { status: 500 }
    );
  }
}
