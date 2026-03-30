import { test, expect } from '@playwright/test';

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

async function loginOrSignup({
  page,
  prefix,
  email,
  password,
}: {
  page: import('@playwright/test').Page;
  prefix: string;
  email: string;
  password: string;
}) {
  await page.goto(`${prefix}/login`);
  await page.waitForLoadState('networkidle');
  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Giriş Yap' }).click();

  const loginResult = await Promise.race([
    page.waitForURL(new RegExp(`${prefix}/dashboard`), { timeout: 30000 }).then(() => 'ok' as const),
    page.getByText('E-posta veya şifre hatalı').waitFor({ state: 'visible', timeout: 30000 }).then(() => 'bad' as const),
  ]).catch(() => 'timeout' as const);

  if (loginResult === 'ok') {
    await page.waitForLoadState('networkidle');
    return;
  }

  const accessCode = process.env.E2E_SIGNUP_ACCESS_CODE;
  if (!accessCode) {
    throw new Error('Login failed and E2E_SIGNUP_ACCESS_CODE is not set (cannot auto-signup).');
  }

  await page.goto(`${prefix}/signup`);
  await page.waitForLoadState('networkidle');
  await page.locator('#name').fill('E2E User');
  await page.locator('#email').fill(email);
  await page.locator('#accessCode').fill(accessCode);
  await page.getByRole('button', { name: /Devam Et|Continue/i }).click();

  await page.locator('#password').waitFor({ state: 'visible', timeout: 30000 });
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: /Hesap Oluştur|Create Account/i }).click();
  await page.waitForURL(new RegExp(`${prefix}/(dashboard|onboarding)`), { timeout: 30000 });
  await page.waitForLoadState('networkidle');
}

async function clickContinue(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /Devam Et|Continue/i }).click();
}

test.describe('Prod smoke — login + add product', () => {
  test('logs in and creates a new product via wizard', async ({ page }) => {
    test.setTimeout(240_000);
    const email = requiredEnv('E2E_EMAIL');
    const password = requiredEnv('E2E_PASSWORD');
    const locale = process.env.E2E_LOCALE ?? 'tr';
    const prefix = `/${locale}`;

    const safeStamp = new Date().toISOString().replace(/[:.]/g, '-');
    const productName = `Prod E2E ${safeStamp}`;

    // Login (optionally auto-signup for local runs)
    await loginOrSignup({ page, prefix, email, password });

    // Create product (wizard)
    await page.goto(`${prefix}/products/new`);
    await page.waitForLoadState('networkidle');
    await page
      .locator('input[type="text"]')
      .first()
      .waitFor({ state: 'visible', timeout: 60000 });

    // Q1: name
    await page.locator('input[type="text"]').first().fill(productName);
    await clickContinue(page);

    // Q2: description
    await page.locator('textarea').waitFor({ state: 'visible', timeout: 20000 });
    await page.locator('textarea').fill(`${productName} açıklaması`);
    await clickContinue(page);

    // Q3: category
    await page.getByRole('button', { name: 'SaaS' }).click();
    await clickContinue(page);

    // Q4: platform
    await page.getByRole('button', { name: 'Web' }).click();
    await clickContinue(page);

    // Q5: audience
    await page.getByRole('button', { name: 'Geliştiriciler' }).click();
    await clickContinue(page);

    // Q6: business model
    await page.getByRole('button', { name: 'Abonelik' }).click();
    await clickContinue(page);

    // Q7: stage
    await page.getByRole('button', { name: 'Launch hazırlığındayım' }).click();
    await clickContinue(page);

    // Q8: growth goal
    await page.getByRole('button', { name: 'İlk kullanıcıları kazanmak' }).click();
    await clickContinue(page);

    // Q9: timing
    await page.getByRole('button', { name: '1–3 ay içinde' }).click();
    await clickContinue(page);

    // Q10: sources (optional)
    await page.getByRole('button', { name: 'Atla' }).click();

    // Q11: metrics setup (optional)
    await page.getByRole('button', { name: /Kurulumsuz devam et|Sonra yapacağım/i }).click();

    // Redirect after submit
    await page.waitForURL(new RegExp(`${prefix}/(dashboard|products)`), { timeout: 180000 });
    await page.waitForLoadState('networkidle');

    // Verify it appears in products list
    await page.goto(`${prefix}/products`);
    await page.waitForLoadState('networkidle');
    const appErrorHeading = page.getByRole('heading', { name: 'Bir şey ters gitti' });
    if (await appErrorHeading.isVisible().catch(() => false)) {
      const refText = (await page.getByText(/^Ref:/).first().textContent().catch(() => ''))?.trim();
      throw new Error(`Products page crashed after creation. ${refText || ''}`.trim());
    }
    await expect(page.getByText(productName, { exact: true }).first()).toBeVisible({
      timeout: 20000,
    });
  });
});
