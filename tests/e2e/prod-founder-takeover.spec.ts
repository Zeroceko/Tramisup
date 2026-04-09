/**
 * Founder takeover test — full realistic flow against production.
 *
 * Run with:
 *   E2E_BASE_URL=https://tiramisup.app \
 *   E2E_EMAIL=... E2E_PASSWORD=... E2E_LOCALE=tr \
 *   npx playwright test --config playwright-prod.config.ts prod-founder-takeover
 */
import { test, expect, type Page } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../../tmp/founder-test');
const NOTES_PATH = path.join(SCREENSHOT_DIR, 'notes.md');

function note(line: string) {
  // eslint-disable-next-line no-console
  console.log(`[founder] ${line}`);
  fs.appendFileSync(NOTES_PATH, line + '\n');
}

async function shot(page: Page, name: string) {
  const file = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: file, fullPage: true });
  note(`📸 ${name}.png`);
}

async function clickContinue(page: Page) {
  await page.getByRole('button', { name: /Devam Et|Continue/i }).first().click();
}

async function safeClick(page: Page, name: RegExp | string) {
  const btn = page.getByRole('button', { name: name as RegExp }).first();
  await btn.waitFor({ state: 'visible', timeout: 15000 });
  await btn.click();
}

test.describe('Founder takeover (prod)', () => {
  test('full realistic founder flow', async ({ page }) => {
    test.setTimeout(420_000);
    const pageErrors: string[] = [];

    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    fs.writeFileSync(NOTES_PATH, `# Founder takeover run — ${new Date().toISOString()}\n\n`);

    const email = process.env.E2E_EMAIL!;
    const password = process.env.E2E_PASSWORD!;
    const locale = process.env.E2E_LOCALE ?? 'tr';
    const prefix = `/${locale}`;
    const productName = `Komşu Kahve ${new Date().toISOString().slice(0, 19)}`;
    const productDescription =
      'Komşu Kahve, mahalle kahvecilerinin WhatsApp üzerinden ön sipariş almasını, ' +
      'günlük teslim alma sırasını yönetmesini ve sadık müşterilerini takip etmesini sağlayan bir abonelik servisidir. ' +
      'POS gerektirmez, küçük işletmeler için tasarlandı, İstanbul ve Ankara odaklı.';

    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
      note(`❌ pageerror: ${err.message}`);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') note(`⚠️ console.error: ${msg.text().slice(0, 240)}`);
    });

    // ─── 1. Login ───────────────────────────────────────────────
    note(`## 1. Login as ${email}`);
    await page.goto(`${prefix}/login`);
    await page.waitForLoadState('networkidle');
    await shot(page, '01-login');

    // confirm no recaptcha widget
    const recaptchaPresent = await page.locator('iframe[src*="recaptcha"]').count();
    note(`reCAPTCHA iframes on login: ${recaptchaPresent}`);

    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: /Giriş Yap|Sign in/i }).click();
    await page.waitForURL(/dashboard|onboarding|products/, { timeout: 30000 });
    await page.waitForLoadState('networkidle');
    note(`Landed at: ${page.url()}`);
    await shot(page, '02-after-login');

    // ─── 2. Visit settings → billing first to capture starting plan ─
    note('## 2. Settings → billing snapshot');
    await page.goto(`${prefix}/settings?section=billing`);
    await page.waitForLoadState('networkidle');
    await shot(page, '03-settings-billing-before');

    // ─── 3. Pricing page snapshot ───────────────────────────────
    note('## 3. Pricing page snapshot');
    await page.goto(`${prefix}/pricing`);
    await page.waitForLoadState('networkidle');
    await shot(page, '04-pricing');

    // ─── 4. Product creation gate ───────────────────────────────
    note('## 4. /products/new gate');
    await page.goto(`${prefix}/products/new`);
    await page.waitForLoadState('networkidle');
    await shot(page, '05-products-new');

    const limitVisible = await page
      .getByText(/Ürün limiti|Product limit/i)
      .first()
      .isVisible()
      .catch(() => false);
    if (limitVisible) {
      note('🚧 Hit product limit gate — upgrading via fake checkout to continue.');
      await shot(page, '05a-limit-hit');
      await page.goto(`/api/billing/checkout?plan=PRO&interval=MONTHLY&locale=${locale}`);
      await page.waitForLoadState('networkidle');
      await shot(page, '05b-after-fake-checkout');
      await page.goto(`${prefix}/products/new`);
      await page.waitForLoadState('networkidle');
    }

    // ─── 5. Onboarding wizard — fill EVERY question realistically ─
    note('## 5. Onboarding wizard (realistic founder fill)');
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 60000 });
    await shot(page, '06-wizard-q1-name');

    // Q1 name
    await page.locator('input[type="text"]').first().fill(productName);
    await clickContinue(page);

    // Q2 description (textarea)
    await page.locator('textarea').waitFor({ state: 'visible', timeout: 20000 });
    await shot(page, '07-wizard-q2-desc');
    await page.locator('textarea').fill(productDescription);
    await clickContinue(page);

    // Q3 category (multi-select; pick 2)
    await shot(page, '08-wizard-q3-category');
    await safeClick(page, /^SaaS$/);
    // try also picking Marketplace if available — multi-select
    const marketplace = page.getByRole('button', { name: /^Marketplace$/ });
    if (await marketplace.isVisible().catch(() => false)) await marketplace.click();
    await clickContinue(page);

    // Q4 platform (multi)
    await shot(page, '09-wizard-q4-platform');
    await safeClick(page, /^Web$/);
    const ios = page.getByRole('button', { name: /^iOS$/ });
    if (await ios.isVisible().catch(() => false)) await ios.click();
    await clickContinue(page);

    // Q5 audience (multi)
    await shot(page, '10-wizard-q5-stage');
    await safeClick(page, /KOBİ'ler|KOBİ|SMBs/);
    await clickContinue(page);

    // Q6 business model (multi)
    await shot(page, '11-wizard-q6-business');
    await safeClick(page, /^Abonelik$|^Subscription$/);
    await clickContinue(page);

    // Q7 stage
    await shot(page, '12-wizard-q7-audience');
    await safeClick(page, /Yayındayım|^Live$/);
    await clickContinue(page);

    // Q8 goal
    await shot(page, '13-wizard-q8-goal');
    await safeClick(page, /Büyüme ritmi kurmak|Build a growth rhythm/);
    await clickContinue(page);

    // Q9 sources (DO NOT SKIP — pick GA4 + Stripe)
    await shot(page, '14-wizard-q9-sources');
    const ga4 = page.getByRole('button', { name: /Google Analytics 4|GA4/ });
    if (await ga4.isVisible().catch(() => false)) await ga4.click();
    const stripe = page.getByRole('button', { name: /^Stripe$/ });
    if (await stripe.isVisible().catch(() => false)) await stripe.click();
    await clickContinue(page);

    // Q10 metrics (DO NOT SKIP — pick a few)
    await shot(page, '15-wizard-q10-metrics');
    // Best-effort: click any "DAU" "MRR" "Activation" type buttons
    for (const candidate of ['DAU', 'MRR', 'Yeni kullanıcılar', 'Aktivasyon', 'Retention', 'Tekrar kullanım']) {
      const btn = page.getByRole('button', { name: new RegExp(candidate, 'i') }).first();
      if (await btn.isVisible().catch(() => false)) {
        await btn.click().catch(() => {});
      }
    }
    await clickContinue(page).catch(async () => {
      await safeClick(page, /Tamamla|Finish|Bitir|Continue/);
    });

    // Wait for redirect to dashboard or product overview
    await page
      .waitForURL(/dashboard|overview|products/, { timeout: 180000 })
      .catch(() => note('⚠️ post-wizard redirect timed out'));
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, '16-after-wizard');
    note(`Post-wizard URL: ${page.url()}`);

    // ─── 6. Surface walkthrough ─────────────────────────────────
    const surfaces: Array<{ name: string; path: string }> = [
      { name: '17-dashboard', path: `${prefix}/dashboard` },
      { name: '18-pre-launch', path: `${prefix}/pre-launch` },
      { name: '19-growth', path: `${prefix}/growth` },
      { name: '20-metrics', path: `${prefix}/metrics` },
      { name: '21-tasks', path: `${prefix}/tasks` },
      { name: '22-settings', path: `${prefix}/settings` },
      { name: '23-integrations', path: `${prefix}/integrations` },
    ];
    for (const s of surfaces) {
      note(`## visit ${s.path}`);
      await page.goto(s.path);
      await page.waitForLoadState('networkidle').catch(() => {});
      await page.waitForTimeout(1500);
      await shot(page, s.name);
    }

    await page.goto(`${prefix}/pre-launch`);
    await page.waitForLoadState('networkidle').catch(() => {});
    const launchText = await page.locator('body').innerText();
    const totalChecklistMatch = launchText.match(/Tamamlanan[\s\S]{0,120}?(\d+)\s*\/\s*(\d+)\s*(madde|items)/i);
    const totalChecklistItems = totalChecklistMatch ? Number(totalChecklistMatch[2]) : null;
    note(`Launch checklist total from stats: ${totalChecklistItems}`);
    expect(totalChecklistItems).not.toBeNull();
    expect(totalChecklistItems!).toBeGreaterThanOrEqual(5);
    expect(launchText.includes('Komşu Kahve')).toBe(true);

    await page.goto(`${prefix}/metrics`);
    await page.waitForLoadState('networkidle').catch(() => {});
    const metrics418 = pageErrors.some((message) => message.includes('React error #418'));
    note(`Metrics page React #418 seen: ${metrics418}`);
    expect(metrics418).toBe(false);

    // ─── 7. Founder Coach + Agent chat probe ────────────────────
    note('## 7. Agent chat probe');
    await page.goto(`${prefix}/dashboard`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    await shot(page, '24-dashboard-agent-panel');

    // Capture the static recommendation card labels (these are the ones I claim are static)
    const cardLabels = await page
      .locator('button.w-full.rounded-\\[14px\\], button[class*="rounded-[14px]"]')
      .allTextContents()
      .catch(() => [] as string[]);
    note(`Visible recommendation card labels: ${JSON.stringify(cardLabels)}`);

    // Send a deeply specific question that a generic AI cannot answer well unless it has product context
    const probeMsg =
      'Komşu Kahve için bu hafta odaklanmam gereken tek şey ne? ' +
      'Cevabında ürün adımı ve abonelik olduğunu kullan, yoksa bu cevap işime yaramaz.';
    const chatInput = page.locator('input[placeholder*="Belirli"], input[placeholder*="specific"]');
    if (await chatInput.first().isVisible().catch(() => false)) {
      await chatInput.first().fill(probeMsg);
      await page.keyboard.press('Enter');
      await page.waitForTimeout(15000); // wait for AI
      await shot(page, '25-agent-chat-after-probe');
      // capture last assistant message text
      const messages = await page.locator('div.bg-\\[\\#f0f0f0\\], div[class*="bg-[#f0f0f0]"]').allTextContents().catch(() => []);
      note(`Last assistant message snippet: ${JSON.stringify(messages.slice(-1))}`);
    } else {
      note('⚠️ chat input not found');
    }

    // ─── 8. Recommendation card click test ──────────────────────
    note('## 8. Recommendation card click');
    await page.goto(`${prefix}/dashboard`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await page.waitForTimeout(2000);
    const firstCard = page
      .locator('button[class*="rounded-[14px]"]')
      .filter({ hasText: /./ })
      .first();
    if (await firstCard.isVisible().catch(() => false)) {
      const cardText = (await firstCard.textContent()) ?? '(unknown)';
      note(`Clicking card: ${cardText.trim()}`);
      await firstCard.click();
      await page.waitForTimeout(4000);
      await shot(page, '26-after-card-click');
    }

    // Verify task appeared in tasks page
    await page.goto(`${prefix}/tasks`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, '27-tasks-after-card');

    // ─── 9. Final settings → billing snapshot ───────────────────
    await page.goto(`${prefix}/settings?section=billing`);
    await page.waitForLoadState('networkidle').catch(() => {});
    await shot(page, '28-settings-billing-after');

    note('✅ run complete');
    expect(true).toBe(true);
  });
});
