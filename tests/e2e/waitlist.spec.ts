/**
 * Waitlist & Signup System — E2E Tests
 *
 * Tests the full waitlist + access-code signup flow with i18n (/tr/ prefix):
 * 1. Landing page modal opens and collects email
 * 2. Thank you page shows after submission
 * 3. Admin panel displays entries and allows approval
 * 4. Signup requires valid access code (TT31623SEN)
 * 5. Modal "Erken erişim kodum var" link navigates to signup
 */

import { test, expect } from '@playwright/test';

// These tests run WITHOUT auth (public pages)
test.use({ storageState: { cookies: [], origins: [] } });

const uniqueEmail = () => `waitlist-${Date.now()}@test.local`;

test.describe('Waitlist — Landing Page Modal', () => {
  test('CTA "Ücretsiz başla" opens waitlist modal', async ({ page }) => {
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    // Click header CTA button
    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();

    // Modal should be visible
    await expect(page.getByRole('heading', { name: "Waitlist'e Katıl" })).toBeVisible({ timeout: 3000 });
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Modal closes when close button is clicked', async ({ page }) => {
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await expect(page.getByRole('heading', { name: "Waitlist'e Katıl" })).toBeVisible();

    // Click close button (✕)
    await page.locator('.fixed.inset-0.z-50 button:has-text("✕")').click();
    await expect(page.getByRole('heading', { name: "Waitlist'e Katıl" })).not.toBeVisible({ timeout: 3000 });
  });

  test('Submit email shows success and redirects to thank-you', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await expect(page.getByRole('heading', { name: "Waitlist'e Katıl" })).toBeVisible();

    await page.locator('input[type="email"]').fill(email);
    await page.locator('button[type="submit"]').click();

    // Should show success
    await expect(page.getByText('Başarılı!')).toBeVisible({ timeout: 5000 });

    // Should redirect to thank-you (middleware may add /tr/)
    await page.waitForURL(/waitlist\/thank-you/, { timeout: 5000 });
    await expect(page.getByText('Teşekkürler!')).toBeVisible();
  });

  test('Duplicate email shows error', async ({ page }) => {
    const email = uniqueEmail();

    // First submission via API (faster)
    await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Dup Test' },
    });

    // Try same email via modal
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');
    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await page.locator('input[type="email"]').fill(email);
    await page.locator('button[type="submit"]').click();

    await expect(page.getByText('Email already in waitlist')).toBeVisible({ timeout: 5000 });
  });

  test('"Erken erişim kodum var" link navigates to signup page', async ({ page }) => {
    await page.goto('/tr');
    await page.waitForLoadState('networkidle');

    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await expect(page.getByRole('heading', { name: "Waitlist'e Katıl" })).toBeVisible();

    // Click early access link
    await page.getByText('Erken erişim kodum var').click();

    // Should navigate to signup page
    await page.waitForURL(/\/tr\/signup/, { timeout: 5000 });
    await expect(page.locator('#accessCode')).toBeVisible();
  });
});

test.describe('Waitlist — Thank You Page', () => {
  test('Thank you page renders correctly', async ({ page }) => {
    await page.goto('/tr/waitlist/thank-you');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Teşekkürler!')).toBeVisible();
    await expect(page.getByText('Email takip et')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ana sayfaya dön' })).toBeVisible();
  });

  test('"Ana sayfaya dön" link navigates home', async ({ page }) => {
    await page.goto('/tr/waitlist/thank-you');
    await page.getByRole('link', { name: 'Ana sayfaya dön' }).click();
    await page.waitForURL(/\/tr\/?$/, { timeout: 5000 });
  });
});

test.describe('Waitlist — Admin Panel', () => {
  const ADMIN = { email: 'admin@tiramisup', password: 't1ram1sUP', name: 'Admin' };

  async function loginAsAdmin(page: import('@playwright/test').Page) {
    // Create admin account if it doesn't exist (idempotent)
    await page.request.post('/api/auth/signup', {
      data: { name: ADMIN.name, email: ADMIN.email, password: ADMIN.password, accessCode: 'TT31623SEN' },
    });

    // Log in
    await page.goto('/tr/login');
    await page.waitForLoadState('networkidle');
    await page.locator('#email').fill(ADMIN.email);
    await page.locator('#password').fill(ADMIN.password);
    await page.getByRole('button', { name: 'Giriş Yap' }).click();
    await page.waitForURL(/dashboard/, { timeout: 10000 });
  }

  test('Non-admin is redirected away from admin page', async ({ page }) => {
    await page.goto('/tr/admin/waitlist');
    await page.waitForURL(/\/tr\/login/, { timeout: 5000 });
  });

  test('Admin page loads and shows stats', async ({ page }) => {
    await loginAsAdmin(page);

    await page.goto('/tr/admin/waitlist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Waitlist Yönetimi')).toBeVisible();
    await expect(page.getByText('TOPLAM', { exact: true })).toBeVisible();
    await expect(page.getByText('BEKLEME', { exact: true })).toBeVisible();
    await expect(page.getByText('ONAYLANDI', { exact: true })).toBeVisible();
  });

  test('New waitlist entry appears in admin panel', async ({ page }) => {
    await loginAsAdmin(page);
    const email = uniqueEmail();

    const res = await page.request.post('/api/waitlist/join', {
      data: { email, name: 'E2E Admin Test' },
    });
    expect(res.status()).toBe(201);

    await page.goto('/tr/admin/waitlist');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 });
  });

  test('Admin can approve a waitlist entry', async ({ page }) => {
    await loginAsAdmin(page);
    const email = uniqueEmail();

    await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Approve Test' },
    });

    await page.goto('/tr/admin/waitlist');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { hasText: email });
    await expect(row).toBeVisible({ timeout: 5000 });
    await row.getByRole('button', { name: 'Onayla' }).click();

    // Status badge should change to "Onaylandı"
    await expect(row.getByText('Onaylandı')).toBeVisible({ timeout: 5000 });
  });

  test('Admin can delete a waitlist entry', async ({ page }) => {
    await loginAsAdmin(page);
    const email = uniqueEmail();

    await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Delete Test' },
    });

    await page.goto('/tr/admin/waitlist');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { hasText: email });
    await expect(row).toBeVisible({ timeout: 5000 });

    page.on('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Sil' }).click();

    await expect(row).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Signup — Access Code Flow', () => {
  test('Signup with valid access code succeeds and redirects to dashboard', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/tr/signup');
    await page.waitForLoadState('networkidle');

    await page.locator('#name').fill('Access Code User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#accessCode').fill('TT31623SEN');
    await page.getByRole('button', { name: /Hesap Oluştur/i }).click();

    // Should redirect to dashboard
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  });

  test('Signup with invalid access code shows error', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/tr/signup');
    await page.waitForLoadState('networkidle');

    await page.locator('#name').fill('Bad Code User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#accessCode').fill('WRONGCODE');
    await page.getByRole('button', { name: /Hesap Oluştur/i }).click();

    await expect(
      page.getByText('Geçersiz erken erişim kodu')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Signup without access code shows error', async ({ page }) => {
    await page.goto('/tr/signup');
    await page.waitForLoadState('networkidle');

    await page.locator('#name').fill('No Code User');
    await page.locator('#email').fill(uniqueEmail());
    await page.locator('#password').fill('password123');
    // Leave access code empty — HTML required attribute should prevent submit,
    // but if it does submit, API returns error
    // We test by removing the required attribute via JS
    await page.locator('#accessCode').evaluate((el: HTMLInputElement) => el.removeAttribute('required'));
    await page.getByRole('button', { name: /Hesap Oluştur/i }).click();

    await expect(
      page.getByText('Geçersiz erken erişim kodu')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Access code is case-insensitive', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/tr/signup');
    await page.waitForLoadState('networkidle');

    await page.locator('#name').fill('Lowercase Code User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.locator('#accessCode').fill('tt31623sen');
    await page.getByRole('button', { name: /Hesap Oluştur/i }).click();

    // Should succeed and redirect
    await page.waitForURL(/dashboard/, { timeout: 15000 });
  });
});
