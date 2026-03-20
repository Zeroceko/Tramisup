import { test, expect } from '@playwright/test';

test.describe('Wizard pill smoke', () => {
  test('shows pills, advances, and allows pill back navigation', async ({ page }) => {
    await page.goto('/products/new');
    await expect(page.getByText('1 / 7')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Ürünü Anlat' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Tip&Kanallar' })).toBeVisible();

    const nameInput = page.locator('input[type="text"]').first();
    await nameInput.fill('Wizard Smoke');
    await page.getByRole('button', { name: 'Devam Et' }).click();

    await expect(page.getByText('2 / 7')).toBeVisible();

    const firstPill = page.getByRole('button', { name: 'Ürünü Anlat' });
    await firstPill.click();

    await expect(page.getByText('1 / 7')).toBeVisible();
    await expect(nameInput).toHaveValue('Wizard Smoke');

    const futurePill = page.getByRole('button', { name: 'Ürün Profilleri' });
    await expect(futurePill).toBeDisabled();
  });
});
