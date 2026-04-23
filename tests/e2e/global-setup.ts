/**
 * Playwright Global Setup
 *
 * Runs ONCE before all tests.
 * Creates a persistent test user via access code signup, creates 2 products,
 * and saves the browser auth state to .auth/user.json so individual tests
 * can skip the signup/login step entirely.
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
  let authenticated = false;

  try {
    // ── Try login first (user may already exist from a previous run) ───────
    await page.goto('/tr/login');
    await page.waitForLoadState('networkidle');
    await page.locator('#email').fill(TEST_USER.email);
    await page.locator('#password').fill(TEST_USER.password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();

    const loginResult = await Promise.race([
      page.waitForURL(/\/tr\/dashboard/, { timeout: 10000 }).then(() => 'ok'),
      page.waitForSelector('text=E-posta veya şifre hatalı', { timeout: 10000 }).then(() => 'no-user'),
    ]).catch(() => 'timeout');

    if (loginResult !== 'ok') {
      await page.goto('/tr/signup');
      await page.waitForLoadState('networkidle');
      const stepOneForm = page.locator('form').first();
      await page.locator('#name').fill(TEST_USER.name);
      await page.locator('#email').fill(TEST_USER.email);
      await stepOneForm.getByRole('button', { name: /Devam Et|Continue/i }).click();
      await page.locator('#password').fill(TEST_USER.password);
      await page.locator('#confirmPassword').fill(TEST_USER.password);
      await page.locator('form').last().getByRole('button', { name: /Hesap Oluştur|Create Account/i }).click();

      const signupResult = await Promise.race([
        page.waitForURL(/\/tr\/dashboard/, { timeout: 15000 }).then(() => 'dashboard'),
        page.waitForURL(/\/tr\/verify-email/, { timeout: 15000 }).then(() => 'verify'),
      ]).catch(() => 'timeout');

      if (signupResult === 'dashboard') {
        authenticated = true;
        console.log('[setup] Created test user and landed on dashboard:', TEST_USER.email);
      } else {
        console.warn('[setup] Shared user signup did not produce an authenticated session; continuing without saved auth state.');
      }
    } else {
      authenticated = true;
      console.log('[setup] Logged in as existing user:', TEST_USER.email);
    }
  } catch (error) {
    console.warn('[setup] Shared auth bootstrap failed; continuing without saved auth state.', error);
  }

  if (authenticated) {
    await page.goto('/tr/products');
    await page.waitForLoadState('networkidle');

    for (const p of [PRODUCTS.a, PRODUCTS.b]) {
      const exists = await page.getByText(p.name, { exact: true }).isVisible().catch(() => false);
      if (exists) {
        console.log(`[setup] Product already exists: ${p.name}`);
        continue;
      }

      console.log(`[setup] Creating product: ${p.name}`);
      await page.goto('/tr/products/new');
      await page.waitForLoadState('networkidle');
      await page.locator('input[type="text"]').first().waitFor({ state: 'visible', timeout: 60000 });

      await page.locator('input[type="text"]').first().fill(p.name);
      await page.locator('textarea').fill(`${p.name} açıklaması`);
      await page.getByRole('button', { name: 'Devam Et' }).click();
      await page.getByText(p.category, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Devam Et' }).click();
      await page.getByText(p.audience, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Devam Et' }).click();
      await page.getByText(p.model, { exact: true }).first().click();
      await page.getByRole('button', { name: 'Devam Et' }).click();
      await page.getByRole('button', { name: 'Devam Et' }).click();
      await page.getByRole('button', { name: 'Atla' }).click();
      await page.getByRole('button', { name: /Ürünü Oluştur/ }).click();
      await page.waitForURL(/\/tr\/dashboard/, { timeout: 15000 });
    }

    await context.storageState({ path: AUTH_FILE });
    console.log('[setup] Auth state saved to', AUTH_FILE);
  } else {
    console.warn('[setup] Auth state not saved; auth-required tests may need their own login flow.');
  }

  await browser.close();
}
