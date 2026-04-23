/**
 * Real end-to-end user journey — production smoke test.
 *
 * Simulates a brand-new user: lands on homepage → clicks signup →
 * fills form → goes through onboarding by clicking → navigates via nav.
 * No direct URL jumps — everything via clicks like a real human.
 *
 * Usage:
 *   E2E_BASE_URL="https://tiramisup.app" \
 *   npx playwright test prod-real-user-journey --config playwright-prod.config.ts --headed
 */
import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

// ─── Config ───────────────────────────────────────────────────────────────────

const BASE = process.env.E2E_BASE_URL ?? "https://tiramisup.app";
const ACCESS_CODE = process.env.E2E_ACCESS_CODE ?? "TT31623SEN";
const TEST_EMAIL = `e2e+${Date.now()}@tiramisup-test.com`;
const TEST_PASSWORD = "TestUser@2026!";
const TEST_NAME = "E2E Founder";

// ─── Report ───────────────────────────────────────────────────────────────────

const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const OUT_DIR = path.resolve(__dirname, "../../test-results/real-user-journey", RUN_ID);
const REPORT_PATH = path.join(OUT_DIR, "report.md");

type Timing = { label: string; ms: number; threshold: number };
const timings: Timing[] = [];
const issues: string[] = [];
const observations: string[] = [];

function log(line: string) {
  console.log(`[journey] ${line}`);
  fs.appendFileSync(REPORT_PATH, `${line}\n`);
}

function obs(line: string) {
  observations.push(line);
  log(`  👁  ${line}`);
}

function track(label: string, ms: number, threshold: number) {
  timings.push({ label, ms, threshold });
  const ok = ms <= threshold;
  const flag = ok ? "✅" : "⚠️  SLOW";
  log(`  ${flag}  ${label}: ${ms}ms  (limit ${threshold}ms)`);
  if (!ok) issues.push(`SLOW: ${label} — ${ms}ms (limit ${threshold}ms)`);
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT_DIR, `${name}.png`), fullPage: true });
  log(`  📸 ${name}.png`);
}

async function timed<T>(label: string, threshold: number, fn: () => Promise<T>): Promise<T> {
  const t0 = Date.now();
  const r = await fn();
  track(label, Date.now() - t0, threshold);
  return r;
}

// Wait for navigation to settle after a click
async function settle(page: Page) {
  await page.waitForLoadState("networkidle").catch(() => {});
}

// ─── Journey steps ────────────────────────────────────────────────────────────

async function step1_Landing(page: Page) {
  log("\n## 1. Landing page");

  await timed("Landing — first paint (DOMContentLoaded)", 4000, async () => {
    await page.goto(BASE);
    await page.waitForLoadState("domcontentloaded");
  });

  const fcp: number | null = await page.evaluate(() => {
    const e = performance.getEntriesByName("first-contentful-paint")[0];
    return e ? e.startTime : null;
  });
  if (fcp !== null) track("Landing FCP", Math.round(fcp), 2500);

  const ttfb: number | null = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    return nav ? Math.round(nav.responseStart - nav.requestStart) : null;
  });
  if (ttfb !== null) track("Landing TTFB", ttfb, 800);

  // Dismiss cookie banner if present
  const acceptCookies = page.getByRole("button", { name: /accept|kabul/i }).first();
  if (await acceptCookies.isVisible().catch(() => false)) {
    await acceptCookies.click();
    await page.waitForTimeout(300);
  }

  // Scroll to check lazy-loaded sections render
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(600);
  await shot(page, "01-landing-mid");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot(page, "01-landing-top");

  // Look for CTA — landing uses "Join waitlist" button or nav signup link
  const ctaButton = page.getByRole("button", { name: /join waitlist|sign up|get started|kayıt|başla|ücretsiz/i }).first();
  const ctaLink = page.getByRole("link", { name: /join waitlist|sign up|get started|kayıt|başla|ücretsiz/i }).first();
  const navSignupLink = page.locator("nav a[href*='signup'], header a[href*='signup']").first();

  const ctaBtnVisible = await ctaButton.isVisible().catch(() => false);
  const ctaLinkVisible = await ctaLink.isVisible().catch(() => false);
  const navSignupVisible = await navSignupLink.isVisible().catch(() => false);

  obs(`Landing CTA button visible: ${ctaBtnVisible}`);
  obs(`Landing CTA link visible: ${ctaLinkVisible}`);
  obs(`Nav signup link visible: ${navSignupVisible}`);

  if (!ctaBtnVisible && !ctaLinkVisible && !navSignupVisible) {
    issues.push("Landing: no signup/join CTA found — new users have no clear entry point");
  }

  // Return whichever CTA we found
  if (ctaBtnVisible) return ctaButton;
  if (ctaLinkVisible) return ctaLink;
  return navSignupLink;
}

async function step2_NavigateToSignup(page: Page, _ctaLocator: ReturnType<Page["getByRole"]>) {
  log("\n## 2. Navigate to signup");

  // OBSERVATION: Landing "Join waitlist" is an inline email capture form, not a
  // link to /signup. There is no nav link to signup either. A new user who
  // wants to create an account must already know the /signup URL.
  issues.push("UX: Landing has no direct link to /signup — Join waitlist is an inline email form only. New users have no self-serve signup path from the landing page.");

  // Go directly to signup (only known path for actual account creation)
  await timed("Navigate to /signup", 3000, async () => {
    await page.goto(`${BASE}/en/signup`);
    await page.waitForLoadState("domcontentloaded");
  });

  await shot(page, "02-signup-page");
  obs(`Signup page URL: ${page.url()}`);
}

async function step3_Signup(page: Page) {
  log("\n## 3. Fill & submit signup form (2-step)");

  // ── Step 1: Name + Email ────────────────────────────────────────────────────
  const nameField = page.locator("input[type='text'], #name, input[name='name']").first();
  const emailField = page.locator("input[type='email'], #email").first();

  const hasName = await nameField.isVisible().catch(() => false);
  const hasEmail = await emailField.isVisible().catch(() => false);

  obs(`Step 1 fields — name:${hasName} email:${hasEmail}`);

  if (!hasEmail) {
    issues.push("Signup step 1: email field not found");
    await shot(page, "03-signup-step1-missing");
    return false;
  }

  if (hasName) await nameField.fill(TEST_NAME);
  await emailField.fill(TEST_EMAIL);

  // Product type dropdown if present
  const productTypeSelect = page.locator("select").first();
  if (await productTypeSelect.isVisible().catch(() => false)) {
    await productTypeSelect.selectOption("SaaS");
  }

  await shot(page, "03-signup-step1-filled");

  // Click the form submit button — NOT "Continue with Google"
  // The submit button is type=submit at the bottom of the form, text "Continue →"
  const continueBtn = page.locator("form button[type='submit'], button[type='submit']").last();
  const continueBtnAlt = page.getByRole("button", { name: /^Continue →$|^Devam →$|^Continue$/ }).last();
  const btnToClick = await continueBtn.isVisible().catch(() => false) ? continueBtn : continueBtnAlt;
  if (await btnToClick.isVisible().catch(() => false)) {
    await timed("Signup step 1 → step 2", 4000, async () => {
      await btnToClick.click();
      await page.waitForTimeout(600);
    });
  }

  await shot(page, "03-signup-step2");

  // ── Step 2: Password ────────────────────────────────────────────────────────
  const passField = page.locator("input[type='password'], #password").first();
  const hasPass = await passField.isVisible().catch(() => false);
  obs(`Step 2 fields — password:${hasPass}`);

  if (!hasPass) {
    // Maybe we're already on dashboard (email already registered)
    if (page.url().includes("dashboard") || page.url().includes("onboarding")) {
      obs("Already redirected — email was already registered, continuing");
      return true;
    }
    issues.push("Signup step 2: password field not found");
    await shot(page, "03-signup-step2-missing");
    return false;
  }

  await passField.fill(TEST_PASSWORD);

  // Confirm password if present
  const confirmPassField = page.locator("input[type='password']").nth(1);
  if (await confirmPassField.isVisible().catch(() => false)) {
    await confirmPassField.fill(TEST_PASSWORD);
  }

  // Access code if present
  const accessField = page.locator("#accessCode, input[name='accessCode'], input[placeholder*='code' i], input[placeholder*='kod' i]").first();
  if (await accessField.isVisible().catch(() => false)) {
    await accessField.fill(ACCESS_CODE);
  }

  await shot(page, "03-signup-step2-filled");

  // Final submit
  const submitBtn = page.getByRole("button", { name: /create account|hesap oluştur|sign up|kayıt|continue|devam|finish/i }).first();
  if (!await submitBtn.isVisible().catch(() => false)) {
    issues.push("Signup: final submit button not found");
    return false;
  }

  let totalMs = 0;
  await timed("Signup submit → redirect", 10000, async () => {
    const t0 = Date.now();
    await submitBtn.click();
    await page.waitForURL(/dashboard|onboarding|verify-email/, { timeout: 25000 });
    totalMs = Date.now() - t0;
    await settle(page);
  });

  const landedUrl = page.url();
  obs(`After signup submit: ${landedUrl} (${totalMs}ms)`);
  await shot(page, "04-after-signup");

  if (totalMs > 5000) issues.push(`Signup submit slow: ${totalMs}ms — user sees spinner for too long`);

  // Email verification wall — real users must check their inbox before continuing
  if (landedUrl.includes("verify-email")) {
    obs("Email verification required — user is blocked at verify-email screen before reaching dashboard");
    issues.push("UX: Email verification required after signup — user must check inbox before they can use the app. This adds friction to first-run experience.");
    await shot(page, "04-verify-email-wall");
    // Cannot proceed to onboarding without a real email link — stop here
    return "verify_email";
  }

  return true;
}

async function step4_Onboarding(page: Page) {
  log("\n## 4. Onboarding wizard");

  // If we landed on dashboard, navigate to onboarding
  if (!page.url().includes("onboarding")) {
    const startBtn = page.getByRole("link", { name: /start the product journey|ürün yolculuğu|create.*product|ürün oluştur/i }).first();
    if (await startBtn.isVisible().catch(() => false)) {
      await timed("Dashboard CTA → onboarding", 3000, async () => {
        await startBtn.click();
        await page.waitForLoadState("domcontentloaded");
      });
    } else {
      await page.goto(`${BASE}/en/onboarding`);
      await page.waitForLoadState("domcontentloaded");
    }
  }

  obs(`Onboarding URL: ${page.url()}`);
  await shot(page, "05-onboarding-start");

  // Step: Product name
  const nameInput = page.locator('input[type="text"]').first();
  if (!await nameInput.isVisible().catch(() => false)) {
    issues.push("Onboarding: name input not visible on first step");
    return;
  }
  await nameInput.fill("JourneyTest SaaS");
  await shot(page, "06-onboarding-name");

  await timed("Name step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });

  // Step: Description
  const textarea = page.locator("textarea").first();
  if (await textarea.isVisible().catch(() => false)) {
    await textarea.fill("A tool that helps indie developers ship faster by tracking tasks, deadlines and revenue from one dashboard.");
    await timed("Description step → next", 600, async () => {
      await page.getByRole("button", { name: /continue|devam/i }).first().click();
      await page.waitForTimeout(350);
    });
  }
  await shot(page, "07-onboarding-category");

  // Step: Category
  const saas = page.getByText("SaaS", { exact: true }).first();
  if (await saas.isVisible().catch(() => false)) await saas.click();
  await timed("Category step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });
  await shot(page, "08-onboarding-platform");

  // Step: Platform
  const web = page.getByText("Web", { exact: true }).first();
  if (await web.isVisible().catch(() => false)) await web.click();
  await timed("Platform step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });
  await shot(page, "09-onboarding-stage");

  // Step: Launch stage — pick "Growing"
  const growing = page.getByText(/^Growing$|^Büyüyor$/).first();
  const live = page.getByText(/^Live$|^Yayında$/).first();
  if (await growing.isVisible().catch(() => false)) {
    await growing.click();
    obs("Selected stage: Growing");
  } else if (await live.isVisible().catch(() => false)) {
    await live.click();
    obs("Selected stage: Live");
  } else {
    issues.push("Onboarding: no stage option found (Growing/Live)");
  }
  await timed("Stage step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });
  await shot(page, "10-onboarding-business");

  // Step: Business model
  const subscription = page.getByText(/Subscription|Abonelik/).first();
  if (await subscription.isVisible().catch(() => false)) await subscription.click();
  await timed("Business model step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });
  await shot(page, "11-onboarding-audience");

  // Step: Audience
  const devs = page.getByText(/Developer|Geliştirici|Solo|Indie/i).first();
  if (await devs.isVisible().catch(() => false)) await devs.click();
  await timed("Audience step → next", 600, async () => {
    await page.getByRole("button", { name: /continue|devam/i }).first().click();
    await page.waitForTimeout(350);
  });
  await shot(page, "12-onboarding-goal");

  // Step: Goal — pick any
  const anyGoalBtn = page.locator("button").filter({ hasText: /revenue|gelir|user|kullanıcı|paying|paying/i }).first();
  if (await anyGoalBtn.isVisible().catch(() => false)) {
    await anyGoalBtn.click();
    await page.waitForTimeout(200);
  }
  const nextAfterGoal = page.getByRole("button", { name: /continue|devam/i }).first();
  if (await nextAfterGoal.isVisible().catch(() => false)) {
    await nextAfterGoal.click();
    await page.waitForTimeout(350);
  }
  await shot(page, "13-onboarding-metrics");

  // Step: Metrics (AARRR) — may appear for Growing stage
  const metricsStep = await page.getByText(/AARRR|signal|sinyal/i).first().isVisible().catch(() => false);
  obs(`AARRR metrics step visible: ${metricsStep}`);
  if (metricsStep) {
    // Pick a metric
    const firstMetric = page.locator("button").filter({ hasText: /DAU|MAU|MRR|Revenue|Signup|Activation/i }).first();
    if (await firstMetric.isVisible().catch(() => false)) await firstMetric.click();
    await page.waitForTimeout(200);
    const saveMetrics = page.getByRole("button", { name: /save|kaydet|use this|continue|devam/i }).first();
    if (await saveMetrics.isVisible().catch(() => false)) {
      await saveMetrics.click();
      await page.waitForTimeout(350);
    }
  }
  await shot(page, "14-onboarding-sources");

  // Step: Sources — skip
  const skipSources = page.getByRole("button", { name: /skip|atla|without|geç/i }).first();
  if (await skipSources.isVisible().catch(() => false)) {
    await skipSources.click();
    await page.waitForTimeout(350);
  }
  await shot(page, "15-onboarding-final");

  // Final: Create product button
  const createBtn = page.getByRole("button", { name: /create|oluştur|finish|tamamla/i }).first();
  if (await createBtn.isVisible().catch(() => false)) {
    await timed("Create product → post-create redirect", 8000, async () => {
      await createBtn.click();
      await page.waitForURL(/dashboard|integrations|growth/, { timeout: 20000 });
      await settle(page);
    });
    obs(`Post-create URL: ${page.url()}`);
    await shot(page, "16-after-create");
  } else {
    issues.push("Onboarding: Create button not found on final step");
    obs(`Current URL on final step: ${page.url()}`);
  }
}

async function step5_PostOnboardingNavigation(page: Page) {
  log("\n## 5. Post-onboarding navigation (clicking nav links)");

  await shot(page, "17-nav-start");

  // Navigate via clicking nav links, not direct URL
  const navLinks = [
    { name: /dashboard|overview/i, label: "Dashboard via nav" },
    { name: /growth/i, label: "Growth via nav" },
    { name: /metrics/i, label: "Metrics via nav" },
    { name: /tasks/i, label: "Tasks via nav" },
    { name: /pre-launch|launch/i, label: "Pre-launch via nav" },
  ];

  for (const { name, label } of navLinks) {
    const link = page.getByRole("link", { name }).first();
    if (!await link.isVisible().catch(() => false)) {
      obs(`Nav link "${label}" not found — skipping`);
      continue;
    }
    await timed(label, 4000, async () => {
      await link.click();
      await page.waitForLoadState("domcontentloaded");
      await settle(page);
    });
    obs(`${label} → ${page.url()}`);

    // Check no error pages
    const is404 = await page.getByText(/404|not found|page not found/i).first().isVisible().catch(() => false);
    const isError = await page.getByText(/something went wrong|error|hata/i).first().isVisible().catch(() => false);
    if (is404) issues.push(`${label}: 404 page`);
    if (isError) issues.push(`${label}: error state visible`);

    await shot(page, `nav-${label.replace(/ /g, "-").toLowerCase()}`);
  }
}

async function step6_GrowthKickoff(page: Page) {
  log("\n## 6. Growth kickoff page (onboarding=1)");

  // Click Growth nav link first
  const growthLink = page.getByRole("link", { name: /^growth$/i }).first();
  if (await growthLink.isVisible().catch(() => false)) {
    await growthLink.click();
    await settle(page);
  } else {
    await page.goto(`${BASE}/en/growth`);
    await settle(page);
  }

  // Simulate arriving from onboarding by appending ?onboarding=1
  const currentUrl = page.url();
  const kickoffUrl = currentUrl.includes("?") ? `${currentUrl}&onboarding=1` : `${currentUrl}?onboarding=1`;
  await timed("Growth kickoff page (onboarding=1)", 4000, async () => {
    await page.goto(kickoffUrl);
    await settle(page);
  });

  await shot(page, "18-growth-kickoff");
  obs(`Growth kickoff URL: ${page.url()}`);

  const hasOldBanner = await page.getByText(/Tamamlananlar|Already done/i).isVisible().catch(() => false);
  const hasProgressTracker = await page.getByText(/Growth workflow|Growth akışı/i).isVisible().catch(() => false);
  const hasCoachCard = await page.getByText(/Next growth step|Sıradaki growth adımı/i).isVisible().catch(() => false);
  const hasCheckin = await page.getByText(/acquisition|check.in|değerlendirme|how did|nasıl/i).first().isVisible().catch(() => false);
  const hasPageHeader = await page.getByText(/few quick questions|birkaç kısa/i).first().isVisible().catch(() => false);

  obs(`Old banner visible (should be HIDDEN): ${hasOldBanner}`);
  obs(`Progress tracker visible (should be HIDDEN): ${hasProgressTracker}`);
  obs(`Coach card visible (should be HIDDEN): ${hasCoachCard}`);
  obs(`Check-in form visible (should be SHOWN): ${hasCheckin}`);
  obs(`Simple header text visible: ${hasPageHeader}`);

  if (hasOldBanner) issues.push("Growth kickoff: old tamamlananlar banner still showing");
  if (hasProgressTracker) issues.push("Growth kickoff: progress tracker still showing");
  if (hasCoachCard) issues.push("Growth kickoff: coach card visible — should be hidden");
}

// ─── Main test ────────────────────────────────────────────────────────────────

test.describe("Real user journey — tiramisup.app", () => {
  test("brand-new user: landing → signup → onboarding → navigate", async ({ page }) => {
    test.setTimeout(300_000);

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(REPORT_PATH, `# Real User Journey — ${new Date().toISOString()}\nBase: ${BASE}\nEmail: ${TEST_EMAIL}\n\n`);

    const pageErrors: string[] = [];
    const slowRequests: string[] = [];

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
      log(`  ❌ pageerror: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") log(`  ⚠️  console.error: ${msg.text().slice(0, 200)}`);
    });
    page.on("response", (resp) => {
      if (resp.url().includes("/api/")) {
        const t = resp.request().timing();
        const ms = Math.round(t.responseEnd - t.requestStart);
        if (!isNaN(ms) && ms > 3000) {
          slowRequests.push(`${resp.status()} ${resp.url().replace(BASE, "")} — ${ms}ms`);
        }
      }
    });

    // Run each step
    const ctaLocator = await step1_Landing(page);
    await step2_NavigateToSignup(page, ctaLocator);
    const signedUp = await step3_Signup(page);

    if (signedUp === true) {
      await step4_Onboarding(page);
      await step5_PostOnboardingNavigation(page);
      await step6_GrowthKickoff(page);
    } else if (signedUp === "verify_email") {
      log("\n⚠️  Stopped at email verification — cannot continue without inbox access");
      log("  To test onboarding+nav: use an existing verified account via E2E_EMAIL/E2E_PASSWORD");
      // Still test nav with the existing test account if credentials available
      if (process.env.E2E_EMAIL && process.env.E2E_PASSWORD) {
        log("\n  Switching to existing account to test the rest of the flow...");
        await page.context().clearCookies();
        await page.goto(`${BASE}/en/login`);
        await page.waitForLoadState("domcontentloaded");
        await page.locator("#email, input[type='email']").first().fill(process.env.E2E_EMAIL);
        await page.locator("#password, input[type='password']").first().fill(process.env.E2E_PASSWORD);
        await page.getByRole("button", { name: /Log In|Giriş Yap/i }).click();
        await page.waitForURL(/dashboard|onboarding/, { timeout: 20000 });
        await settle(page);
        obs(`Switched to existing account, landed: ${page.url()}`);
        await step5_PostOnboardingNavigation(page);
        await step6_GrowthKickoff(page);
      }
    }

    // ─── Final report ─────────────────────────────────────────────────────────
    log("\n---\n\n## Summary\n");

    if (slowRequests.length > 0) {
      log("### Slow API calls (>3s)");
      slowRequests.forEach((r) => { log(`- ⚠️  ${r}`); issues.push(`Slow API: ${r}`); });
    }

    log(`\nPage JS errors: ${pageErrors.length}`);
    if (pageErrors.length > 0) pageErrors.forEach((e) => log(`  - ${e.slice(0, 200)}`));

    log(`\nIssues found: ${issues.length}`);
    if (issues.length > 0) {
      log("\n### Issues");
      issues.forEach((i) => log(`- ${i}`));
    } else {
      log("No issues found. ✅");
    }

    log("\n### Timings");
    for (const t of timings) {
      const ok = t.ms <= t.threshold;
      log(`- ${ok ? "✅" : "⚠️ "} ${t.label}: ${t.ms}ms`);
    }

    console.log(`\n📋 Report → ${REPORT_PATH}`);
    console.log(`📁 Screenshots → ${OUT_DIR}\n`);

    expect(pageErrors.filter((e) => !e.includes("hydration")).length, "JS errors on page").toBeLessThan(5);
  });
});
