import { Page } from '@playwright/test';

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function signup(
  page: Page,
  name: string,
  email: string,
  password: string,
) {
  await page.goto('/signup');
  await page.locator('#name').fill(name);
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Hesap Oluştur' }).click();
  await page.waitForURL('/dashboard', { timeout: 15000 });
}

export async function login(page: Page, email: string, password: string = 'password123') {
  await page.goto('/login');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();
  await page.waitForURL('/dashboard', { timeout: 15000 });
}

// ─── Wizard ───────────────────────────────────────────────────────────────────

export interface WizardData {
  name: string;
  description?: string;
  category?: string;       // default: 'SaaS'
  audience?: string;       // default: 'Developers'
  businessModel?: string;  // default: 'Subscription'
}

export async function completeWizard(page: Page, data: WizardData) {
  await page.goto('/products/new');

  // Step 1: Name + description
  await page.locator('input[type="text"]').first().fill(data.name);
  await page.locator('textarea').fill(data.description ?? 'Test ürün açıklaması');
  await page.getByRole('button', { name: 'Devam Et' }).click();

  // Step 2: Category
  await page.getByText(data.category ?? 'SaaS', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Devam Et' }).click();

  // Step 3: Target audience
  await page.getByText(data.audience ?? 'Developers', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Devam Et' }).click();

  // Step 4: Business model
  await page.getByText(data.businessModel ?? 'Subscription', { exact: true }).first().click();
  await page.getByRole('button', { name: 'Devam Et' }).click();

  // Step 5: Goals — skip (optional)
  await page.getByRole('button', { name: 'Devam Et' }).click();

  // Step 6: Website — skip
  await page.getByRole('button', { name: 'Atla' }).click();

  // Step 7: Submit
  await page.getByRole('button', { name: /Ürünü Oluştur/ }).click();
  await page.waitForURL('/dashboard', { timeout: 15000 });
}

// ─── Product selector ─────────────────────────────────────────────────────────

export async function getNavProductButton(page: Page) {
  // The selector button is in the header, contains a small teal dot span
  return page.locator('header').getByRole('button').filter({
    has: page.locator('span.bg-\\[\\#95dbda\\]'),
  }).first();
}

export async function switchProduct(page: Page, productName: string) {
  const btn = await getNavProductButton(page);
  await btn.click();
  // Click the product name button inside the dropdown
  await page.locator('div.absolute').getByRole('button', { name: productName, exact: false }).first().click();
  await page.waitForLoadState('networkidle');
}

// ─── Utils ────────────────────────────────────────────────────────────────────

/** Unique email per test run to avoid DB conflicts */
export function uniqueEmail(prefix = 'e2e') {
  return `${prefix}+${Date.now()}@test.local`;
}

/** Collect console errors during callback */
export async function collectConsoleErrors(
  page: Page,
  fn: () => Promise<void>,
): Promise<string[]> {
  const errors: string[] = [];
  const handler = (msg: { type: () => string; text: () => string }) => {
    if (msg.type() === 'error') errors.push(msg.text());
  };
  page.on('console', handler);
  await fn();
  page.off('console', handler);
  // Filter known noise
  return errors.filter(
    (e) =>
      !e.includes('favicon') &&
      !e.includes('ERR_BLOCKED_BY_CLIENT') &&
      !e.includes('net::ERR'),
  );
}
