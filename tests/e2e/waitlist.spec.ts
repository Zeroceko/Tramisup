/**
 * Waitlist System — E2E Tests
 *
 * Tests the full waitlist flow:
 * 1. Landing page modal opens and collects email
 * 2. Thank you page shows after submission
 * 3. Admin panel displays entries and allows approval
 * 4. Signup blocked for pending/unknown emails
 * 5. Signup allowed for approved emails
 */

import { test, expect } from '@playwright/test';

// These tests run WITHOUT auth (public pages)
test.use({ storageState: { cookies: [], origins: [] } });

const uniqueEmail = () => `waitlist-${Date.now()}@test.local`;

test.describe('Waitlist — Landing Page Modal', () => {
  test('CTA "Ücretsiz başla" opens waitlist modal', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click header CTA button
    const ctaButton = page.locator('header').getByRole('button', { name: 'Ücretsiz başla' });
    await ctaButton.click();

    // Modal should be visible
    const modal = page.getByText("Waitlist'e Katıl");
    await expect(modal).toBeVisible({ timeout: 3000 });

    // Email input should be present
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('Modal closes when backdrop is clicked', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await expect(page.getByText("Waitlist'e Katıl")).toBeVisible();

    // Click backdrop (the overlay behind the modal)
    await page.locator('.fixed.inset-0.bg-black\\/50').click({ force: true });

    // Modal should disappear
    await expect(page.getByText("Waitlist'e Katıl")).not.toBeVisible({ timeout: 3000 });
  });

  test('Submit email shows success and redirects to thank-you', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open modal
    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await expect(page.getByText("Waitlist'e Katıl")).toBeVisible();

    // Fill email and submit
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole('button', { name: "Waitlist'e Katıl" }).click();

    // Should show success message
    await expect(page.getByText('Başarılı!')).toBeVisible({ timeout: 5000 });

    // Should redirect to thank-you page
    await page.waitForURL('/waitlist/thank-you', { timeout: 5000 });
    await expect(page.getByText('Teşekkürler!')).toBeVisible();
  });

  test('Duplicate email shows error', async ({ page }) => {
    const email = uniqueEmail();
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // First submission
    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole('button', { name: "Waitlist'e Katıl" }).click();
    await page.waitForURL('/waitlist/thank-you', { timeout: 5000 });

    // Go back and try same email
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.locator('header').getByRole('button', { name: 'Ücretsiz başla' }).click();
    await page.locator('input[type="email"]').fill(email);
    await page.getByRole('button', { name: "Waitlist'e Katıl" }).click();

    // Should show error
    await expect(page.getByText('Email already in waitlist')).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Waitlist — Thank You Page', () => {
  test('Thank you page renders correctly', async ({ page }) => {
    await page.goto('/waitlist/thank-you');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Teşekkürler!')).toBeVisible();
    await expect(page.getByText('Email takip et')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Ana sayfaya dön' })).toBeVisible();
  });

  test('"Ana sayfaya dön" link navigates to home', async ({ page }) => {
    await page.goto('/waitlist/thank-you');
    await page.getByRole('link', { name: 'Ana sayfaya dön' }).click();
    await page.waitForURL('/', { timeout: 5000 });
  });
});

test.describe('Waitlist — Admin Panel', () => {
  test('Admin page loads and shows stats', async ({ page }) => {
    await page.goto('/admin/waitlist');
    await page.waitForLoadState('networkidle');

    await expect(page.getByText('Waitlist Yönetimi')).toBeVisible();
    // Stats cards should exist
    await expect(page.getByText('Toplam')).toBeVisible();
    await expect(page.getByText('Bekleyen')).toBeVisible();
    await expect(page.getByText('Onaylanan')).toBeVisible();
  });

  test('New waitlist entry appears in admin panel', async ({ page }) => {
    const email = uniqueEmail();

    // Join waitlist via API
    const res = await page.request.post('/api/waitlist/join', {
      data: { email, name: 'E2E Admin Test' },
    });
    expect(res.status()).toBe(201);

    // Check admin panel
    await page.goto('/admin/waitlist');
    await page.waitForLoadState('networkidle');
    await expect(page.getByText(email)).toBeVisible({ timeout: 5000 });
  });

  test('Admin can approve a waitlist entry', async ({ page }) => {
    const email = uniqueEmail();

    // Join waitlist via API
    await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Approve Test' },
    });

    // Go to admin panel
    await page.goto('/admin/waitlist');
    await page.waitForLoadState('networkidle');

    // Find the row with this email and click approve
    const row = page.locator('tr', { hasText: email });
    await expect(row).toBeVisible({ timeout: 5000 });
    await row.getByRole('button', { name: 'Onayla' }).click();

    // Status should change to APPROVED (teal badge)
    await expect(row.getByText('APPROVED')).toBeVisible({ timeout: 5000 });
  });

  test('Admin can delete a waitlist entry', async ({ page }) => {
    const email = uniqueEmail();

    // Join waitlist via API
    await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Delete Test' },
    });

    await page.goto('/admin/waitlist');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { hasText: email });
    await expect(row).toBeVisible({ timeout: 5000 });

    // Accept the confirm dialog
    page.on('dialog', (dialog) => dialog.accept());
    await row.getByRole('button', { name: 'Sil' }).click();

    // Row should disappear
    await expect(row).not.toBeVisible({ timeout: 5000 });
  });
});

test.describe('Waitlist — Signup Guard', () => {
  test('Signup blocked for email not in waitlist', async ({ page }) => {
    const email = uniqueEmail();

    await page.goto('/signup');
    await page.locator('#name').fill('Test User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Hesap Oluştur' }).click();

    // Should show "join waitlist first" error
    await expect(
      page.getByText("Lütfen önce waitlist'e katıl")
    ).toBeVisible({ timeout: 5000 });
  });

  test('Signup blocked for pending email', async ({ page }) => {
    const email = uniqueEmail();

    // Join waitlist (status = PENDING)
    await page.request.post('/api/waitlist/join', {
      data: { email },
    });

    await page.goto('/signup');
    await page.locator('#name').fill('Pending User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Hesap Oluştur' }).click();

    // Should show "not yet approved" error
    await expect(
      page.getByText('Hesabın henüz onaylanmamış')
    ).toBeVisible({ timeout: 5000 });
  });

  test('Signup allowed for approved email', async ({ page }) => {
    const email = uniqueEmail();

    // Join waitlist
    const joinRes = await page.request.post('/api/waitlist/join', {
      data: { email, name: 'Approved User' },
    });
    const joinData = await joinRes.json();
    expect(joinRes.status()).toBe(201);

    // Approve via check → get id → approve
    // We need the entry ID, so let's get it from admin API
    // Actually, we can approve by fetching admin page and clicking
    // But easier: use PATCH API directly
    // First, find the entry ID from the join response... it's not returned
    // Use the admin page approach instead:
    await page.goto('/admin/waitlist');
    await page.waitForLoadState('networkidle');

    const row = page.locator('tr', { hasText: email });
    await row.getByRole('button', { name: 'Onayla' }).click();
    await expect(row.getByText('APPROVED')).toBeVisible({ timeout: 5000 });

    // Now try signup
    await page.goto('/signup');
    await page.locator('#name').fill('Approved User');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill('password123');
    await page.getByRole('button', { name: 'Hesap Oluştur' }).click();

    // Should redirect to dashboard (successful signup)
    await page.waitForURL('/dashboard', { timeout: 15000 });
  });
});
