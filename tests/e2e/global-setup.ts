/**
 * Playwright Global Setup
 *
 * Runs ONCE before all tests.
 * Creates a persistent test user, creates 2 products, and saves the
 * browser auth state to .auth/user.json so individual tests can skip
 * the signup/login step entirely.
 */

import { chromium, expect, FullConfig } from '@playwright/test';
import * as path from 'path';

export const TEST_USER = {
  name:     'E2E Test User',
  email:    'e2e-shared@tiramisup.test',
  password: 'password123',
};

export const PRODUCTS = {
  a: { name: 'SaaS Uygulamam',     category: 'SaaS',       audience: 'Developers', model: 'Subscription' },
  b: { name: 'E-Ticaret Mağazam',  category: 'E-commerce', audience: 'KOBİ',       model: 'One-time'     },
};

export const AUTH_FILE = path.join(__dirname, '.auth/user.json');

export default async function globalSetup(config: FullConfig) {
  const baseURL = config.projects[0].use.baseURL ?? 'http://localhost:3001';
  const browser = await chromium.launch();
  const context = await browser.newContext({ baseURL });
  const page    = await context.newPage();

  // ── Try login first (user may already exist from a previous run) ──────────
  await page.goto('/login');
  await page.locator('#email').fill(TEST_USER.email);
  await page.locator('#password').fill(TEST_USER.password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();

  const loginResult = await Promise.race([
    page.waitForURL('/dashboard', { timeout: 10000 }).then(() => 'ok'),
    page.waitForSelector('text=E-posta veya şifre hatalı', { timeout: 10000 }).then(() => 'no-user'),
  ]).catch(() => 'timeout');

  // ── Create account if login failed ────────────────────────────────────────
  if (loginResult !== 'ok') {
    // Waitlist gate: add test user to waitlist and approve before signup
    console.log('[setup] Adding test user to waitlist and approving...');
    const joinRes = await page.request.post('/api/waitlist/join', {
      data: { email: TEST_USER.email, name: TEST_USER.name, source: 'e2e-setup' },
    });
    if (joinRes.status() === 201 || joinRes.status() === 409) {
      // 201 = created, 409 = already exists — both are fine
      // Now approve: find the entry via admin page
      await page.goto('/admin/waitlist');
      await page.waitForLoadState('networkidle');
      const row = page.locator('tr', { hasText: TEST_USER.email });
      const approveBtn = row.getByRole('button', { name: 'Onayla' });
      if (await approveBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
        await approveBtn.click();
        await expect(row.getByText('APPROVED')).toBeVisible({ timeout: 5000 });
        console.log('[setup] Waitlist entry approved for:', TEST_USER.email);
      } else {
        console.log('[setup] Waitlist entry already approved or not found');
      }
    }

    await page.goto('/signup');
    await page.locator('#name').fill(TEST_USER.name);
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Hesap Oluştur' }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });
    console.log('[setup] Created test user:', TEST_USER.email);
  } else {
    console.log('[setup] Logged in as existing user:', TEST_USER.email);
  }

  // ── Ensure 2 products exist (skip if already created) ────────────────────
  await page.goto('/products');
  await page.waitForLoadState('networkidle');

  for (const p of [PRODUCTS.a, PRODUCTS.b]) {
    const exists = await page.getByText(p.name, { exact: true }).isVisible();
    if (exists) {
      console.log(`[setup] Product already exists: ${p.name}`);
      continue;
    }

    console.log(`[setup] Creating product: ${p.name}`);
    await page.goto('/products/new');
    await page.waitForLoadState('networkidle');
    // Wait for React hydration (client component)
    await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 60000 });

    // Step 1: name + description
    await page.locator('input[type="text"]').first().fill(p.name);
    await page.locator('textarea').fill(`${p.name} açıklaması`);
    await page.getByRole('button', { name: 'Devam Et' }).click();
    // Step 2 - Category
    await page.getByText(p.category, { exact: true }).first().click();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    // Step 3 - Audience
    await page.getByText(p.audience, { exact: true }).first().click();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    // Step 4 - Model
    await page.getByText(p.model, { exact: true }).first().click();
    await page.getByRole('button', { name: 'Devam Et' }).click();
    // Step 5 - Goals (skip)
    await page.getByRole('button', { name: 'Devam Et' }).click();
    // Step 6 - URL (skip)
    await page.getByRole('button', { name: 'Atla' }).click();
    // Step 7 - Submit
    await page.getByRole('button', { name: /Ürünü Oluştur/ }).click();
    await page.waitForURL('/dashboard', { timeout: 15000 });
  }

  // ── Save auth state ───────────────────────────────────────────────────────
  await context.storageState({ path: AUTH_FILE });
  console.log('[setup] Auth state saved to', AUTH_FILE);

  await browser.close();
}
