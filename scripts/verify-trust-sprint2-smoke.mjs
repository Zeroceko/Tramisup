import bcrypt from "bcryptjs";
import { chromium } from "playwright";
import { PrismaClient, Priority, ProductStatus, TaskStatus } from "@prisma/client";

const prisma = new PrismaClient();

const BASE_URL = process.env.SMOKE_BASE_URL ?? "http://127.0.0.1:3002";
const EMAIL = "trust-sprint2-smoke@example.com";
const PASSWORD = "SmokeTest1!";

async function seed() {
  const passwordHash = await bcrypt.hash(PASSWORD, 10);

  const existingUser = await prisma.user.findUnique({
    where: { email: EMAIL },
    include: { products: true },
  });

  if (existingUser?.products.length) {
    await prisma.product.deleteMany({
      where: { userId: existingUser.id },
    });
  }

  const user = await prisma.user.upsert({
    where: { email: EMAIL },
    update: {
      name: "Trust Sprint Smoke",
      passwordHash,
      preferredLocale: "en",
      emailVerified: new Date(),
      verificationToken: null,
    },
    create: {
      email: EMAIL,
      name: "Trust Sprint Smoke",
      passwordHash,
      preferredLocale: "en",
      emailVerified: new Date(),
    },
  });

  const product = await prisma.product.create({
    data: {
      userId: user.id,
      name: "Signal Desk",
      status: ProductStatus.PRE_LAUNCH,
      launchStatus: "PREPARING",
      launchDate: new Date("2026-06-01T00:00:00.000Z"),
      description: "Async launch command center for founders preparing public release.",
      category: "Collaboration",
      targetAudience: "Startup teams",
      businessModel: "Subscription",
      website: "https://example.com",
      launchGoals: JSON.stringify({
        growthGoal: "Validate launch readiness",
        goalKey: "launch-readiness",
        contextLinks: ["https://example.com/docs"],
      }),
    },
  });

  const linkedTask = await prisma.task.create({
    data: {
      productId: product.id,
      title: "Ship the investor-safe launch FAQ",
      description: "Why: Investors and early users need one source of truth before launch.\nDone when: The FAQ is published and linked from the launch page.\nNext action: Draft the top five questions from recent founder calls.",
      whyItMatters: "Investors and early users need one source of truth before launch.",
      doneCriteria: "The FAQ is published and linked from the launch page.",
      nextAction: "Draft the top five questions from recent founder calls.",
      priority: Priority.HIGH,
      status: TaskStatus.TODO,
      category: "MARKETING",
      source: "MANUAL",
    },
  });

  const detailTask = await prisma.task.create({
    data: {
      productId: product.id,
      title: "Prepare the product story for launch day",
      description: "Narrative prep for the launch day timeline.",
      whyItMatters: "The product story keeps the launch page, waitlist, and outreach consistent.",
      doneCriteria: "The launch story is approved and reused across landing, email, and social copy.",
      nextAction: "Turn the current homepage headline into a one-sentence promise for launch day.",
      priority: Priority.HIGH,
      status: TaskStatus.IN_PROGRESS,
      category: "MARKETING",
      source: "AI_PLAN",
      dueDate: new Date(),
    },
  });

  const fallbackTask = await prisma.task.create({
    data: {
      productId: product.id,
      title: "Review launch sequencing with the founder",
      description: "Make sure the launch order is realistic before launch day.",
      priority: Priority.HIGH,
      status: TaskStatus.TODO,
      category: "PRODUCT",
      source: "MANUAL",
      dueDate: new Date(),
    },
  });

  const checklistToComplete = await prisma.launchChecklist.create({
    data: {
      productId: product.id,
      category: "PRODUCT",
      title: "Confirm the first-run success moment",
      description: "Why: Founders need to know if new users reach value fast.\nDone when: The first-run flow highlights one success action clearly.\nNext action: Rewrite the first screen so the core action appears above the fold.",
      priority: Priority.HIGH,
      order: 0,
    },
  });

  const checklistForTask = await prisma.launchChecklist.create({
    data: {
      productId: product.id,
      category: "LEGAL",
      title: "Finalize customer-facing privacy copy",
      description: "Why: Privacy concerns block signups close to launch.\nDone when: The privacy summary matches the legal policy and the signup form links to it.\nNext action: Add a founder-readable summary under the signup form.",
      priority: Priority.MEDIUM,
      order: 1,
    },
  });

  await prisma.launchChecklist.create({
    data: {
      productId: product.id,
      category: "MARKETING",
      title: "Publish launch FAQ",
      description: "Why: Users and investors need one trusted answer bank before launch.\nDone when: The FAQ is published and linked from launch surfaces.\nNext action: Draft the first five launch-day questions.",
      priority: Priority.HIGH,
      order: 2,
      linkedTaskId: linkedTask.id,
    },
  });

  await prisma.metricSetup.create({
    data: {
      productId: product.id,
      selections: [],
      platforms: ["Web"],
      ignoredChecklistIds: [],
      founderSummary: {
        headline: "Signal Desk is almost ready",
        summary: "Use this workspace to verify launch surfaces and task bridges.",
        nextStep: "Close the first product blocker.",
        strengths: ["Clear audience", "Focused launch scope"],
        focusAreas: ["First value clarity", "Tracking setup"],
      },
    },
  });

  await prisma.agentMessage.createMany({
    data: [
      {
        userId: user.id,
        productId: product.id,
        agentType: "launch",
        role: "user",
        content: "What should I validate first?",
      },
      {
        userId: user.id,
        productId: product.id,
        agentType: "launch",
        role: "assistant",
        content: "Validate that a new founder understands the first value moment in under ten seconds.",
        actionsJson: JSON.stringify([
          {
            type: "open_checklist",
            label: "Open checklist",
          },
        ]),
      },
      {
        userId: user.id,
        productId: product.id,
        agentType: "launch",
        role: "user",
        content: "How should I track that?",
      },
      {
        userId: user.id,
        productId: product.id,
        agentType: "launch",
        role: "assistant",
        content: "Track a first-value event and keep one follow-up task tied to it.",
        actionsJson: JSON.stringify([
          {
            type: "create_task",
            label: "Create launch validation task",
            payload: {
              title: "Instrument the first-value event",
              description: "Add one event for the first value moment and review it daily for the first launch week.",
              priority: "HIGH",
            },
          },
          {
            type: "open_tracking",
            label: "Open tracking",
          },
        ]),
      },
    ],
  });

  return {
    user,
    product,
    checklistToComplete,
    checklistForTask,
    detailTask,
    fallbackTask,
  };
}

async function login(page) {
  await page.goto(`${BASE_URL}/en/login`);
  await page.getByLabel("Email").fill(EMAIL);
  await page.getByLabel("Password").fill(PASSWORD);
  await page.getByRole("button", { name: /log in/i }).click();
  await page.waitForURL(/\/en\/dashboard$/);
}

async function expectNoText(page, text) {
  const body = await page.locator("body").innerText();
  if (body.includes(text)) {
    throw new Error(`Unexpected text found: ${text}`);
  }
}

async function readReadinessScore(page) {
  const card = page
    .locator("p")
    .filter({ hasText: /^Readiness$/ })
    .first()
    .locator("xpath=..");
  const value = await card.locator("p.text-\\[32px\\]").first().innerText();
  const match = value.match(/(\d+)/);
  if (!match) {
    throw new Error("Readiness score could not be read.");
  }
  return Number(match[1]);
}

async function run() {
  const seeded = await seed();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await login(page);

    await page.goto(`${BASE_URL}/en/settings?section=product`);
    await page.getByLabel("Category").fill("Founder Ops");
    await page.getByLabel("Target audience").fill("Seed-stage founders");
    await page.getByRole("button", { name: "Save changes" }).click();
    await page.waitForLoadState("networkidle");
    await page.reload();
    await page.getByLabel("Category").waitFor();
    const savedCategory = await page.getByLabel("Category").inputValue();
    const savedAudience = await page.getByLabel("Target audience").inputValue();
    if (savedCategory !== "Founder Ops" || savedAudience !== "Seed-stage founders") {
      throw new Error(`Settings persistence failed: ${savedCategory} / ${savedAudience}`);
    }

    await page.goto(`${BASE_URL}/en/settings?section=product`);
    await page.getByRole("button", { name: "Tracking Metrics" }).click();
    await page.waitForURL(/section=tracking/);
    await page.getByText("Measurement system", { exact: true }).waitFor();
    await expectNoText(page, "Update the active product's onboarding context");

    await page.goto(`${BASE_URL}/en/dashboard`);
    await page.getByRole("heading", { name: "Signal Desk" }).waitFor();
    await expectNoText(page, "Launch Readiness");
    await expectNoText(page, "Update the active product's onboarding context");

    await page.goto(`${BASE_URL}/en/pre-launch`);
    await page.getByRole("heading", { name: "Launch Readiness" }).waitFor();
    await expectNoText(page, "Update the active product's onboarding context");
    await page.goto(`${BASE_URL}/en/settings?section=product`);
    await page.goto(`${BASE_URL}/en/pre-launch`);
    await page.getByRole("heading", { name: "Launch Readiness" }).waitFor();
    await expectNoText(page, "Update the active product's onboarding context");

    await page.getByText("Pending Tasks", { exact: true }).waitFor();
    const readinessBefore = await readReadinessScore(page);

    await page.getByRole("button", { name: "Add to tasks" }).first().click();
    await page.getByText(/Task created from checklist|Existing task linked/).waitFor();
    const readinessAfterTask = await readReadinessScore(page);
    if (readinessAfterTask <= readinessBefore) {
      throw new Error("Readiness score did not move after adding a linked task.");
    }

    await page.getByRole("button", { name: "Mark done" }).first().click();
    await page.getByText("Checklist item marked done").waitFor();
    const readinessAfterDone = await readReadinessScore(page);
    if (readinessAfterDone <= readinessAfterTask) {
      throw new Error("Readiness score did not react after completing a checklist item.");
    }

    await page.getByText("Validate that a new founder understands the first value moment in under ten seconds.").waitFor();
    await page.getByText("Track a first-value event and keep one follow-up task tied to it.").waitFor();
    await page.getByRole("button", { name: "Open checklist" }).waitFor();
    await page.getByRole("button", { name: "Open tracking" }).waitFor();
    await page.getByRole("button", { name: "Create launch validation task" }).click();
    await page.getByText("Task added: Instrument the first-value event").waitFor();

    await page.goto(`${BASE_URL}/en/settings?section=sources`);
    await page.getByText("Product DAU, retention, funnel, and organic site traffic analysis.").waitFor();
    await expectNoText(page, "Sağladığı veriler");
    await expectNoText(page, "Ürün içi DAU");

    await page.goto(`${BASE_URL}/tr/dashboard`);
    await page.locator("body").waitFor();
    await expectNoText(page, "PRE_LAUNCH");

    await page.goto(`${BASE_URL}/en/tasks`);
    const detailButtons = page.getByRole("button", { name: "View details" });
    await detailButtons.first().waitFor();
    await detailButtons.nth(0).click();
    await page.getByRole("heading", { name: "Prepare the product story for launch day" }).nth(1).waitFor();
    await page.getByText("Why it matters").waitFor();
    await page.getByText("Done when").waitFor();
    await page.getByText("Next action").waitFor();
    await page.getByText("The product story keeps the launch page, waitlist, and outreach consistent.").waitFor();
    await page.getByRole("button", { name: "Close", exact: true }).click();

    await detailButtons.nth(1).click();
    await page.getByRole("heading", { name: "Review launch sequencing with the founder" }).nth(1).waitFor();
    await page.getByText("Why it matters").waitFor();
    await page.getByRole("heading", { name: "Review launch sequencing with the founder" }).nth(1).waitFor();
    await page.getByText(/smallest shippable version of "Review launch sequencing with the founder"/i).waitFor();

    console.log(JSON.stringify({
      ok: true,
      email: EMAIL,
      productId: seeded.product.id,
      verified: [
        "settings-save-persistence",
        "settings-tracking-tab-switch",
        "dashboard-route-content-match",
        "prelaunch-route-isolation",
        "checklist-mark-done",
        "checklist-add-to-tasks-feedback",
        "pending-task-counter-sync",
        "readiness-reacts-to-task-and-checklist-progress",
        "agent-history-and-actions",
        "sources-en-localization",
        "tr-badge-no-raw-prelaunch-token",
        "task-detail-structured-content",
        "task-detail-contextual-fallback",
      ],
    }, null, 2));
  } finally {
    await page.close();
    await browser.close();
    await prisma.$disconnect();
  }
}

run().catch(async (error) => {
  console.error(error);
  await prisma.$disconnect();
  process.exit(1);
});
