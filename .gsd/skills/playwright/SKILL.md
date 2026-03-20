# Playwright E2E Testing Skill

**When to use:** E2E testing, browser automation, UI verification, regression testing

---

## Overview

Playwright E2E testleri Sprint manuel test case'lerini otomatikleştirir.

---

## Commands

### Run all tests:
```bash
npm run test:e2e
```

### Interactive UI mode:
```bash
npm run test:e2e:ui
```

### Headed mode (browser visible):
```bash
npm run test:e2e:headed
```

### Mobile tests only:
```bash
npm run test:e2e:mobile
```

---

## Writing Tests

### Basic Test Structure:
```typescript
import { test, expect } from '@playwright/test';

test('describe what this tests', async ({ page }) => {
  // Navigate
  await page.goto('/my-page');
  
  // Interact
  await page.click('button[type="submit"]');
  
  // Assert
  await expect(page.getByText('Success')).toBeVisible();
});
```

### Using Helpers:
```typescript
import { login, createProduct, switchProduct } from './helpers';

test('test with helpers', async ({ page }) => {
  await login(page);
  await createProduct(page, { name: 'Test Product' });
  await switchProduct(page, 'Test Product');
  
  // Continue testing...
});
```

---

## Patterns

### Navigation:
```typescript
// Direct URL
await page.goto('/dashboard');

// Click link
await page.click('a[href="/products"]');

// Wait for navigation
await page.waitForURL('/expected-url');
```

### Finding Elements:
```typescript
// By role (preferred)
await page.getByRole('button', { name: /Submit/i });

// By text
await page.getByText('Expected text');

// By test ID
await page.locator('[data-testid="my-element"]');

// By CSS selector
await page.locator('button.primary');
```

### Assertions:
```typescript
// Visibility
await expect(page.getByText('Hello')).toBeVisible();
await expect(page.locator('.modal')).toBeHidden();

// Text content
await expect(page.locator('h1')).toHaveText('Expected Title');
await expect(page.locator('p')).toContainText('partial');

// Count
await expect(page.locator('.item')).toHaveCount(5);

// URL
await expect(page).toHaveURL('/dashboard');
```

### Mobile Testing:
```typescript
test('mobile test @mobile', async ({ page }) => {
  // This runs on iPhone 12 viewport (390x844)
  
  // Check no horizontal scroll
  const scrollWidth = await page.evaluate(() => 
    document.documentElement.scrollWidth
  );
  const clientWidth = await page.evaluate(() => 
    document.documentElement.clientWidth
  );
  expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  
  // Check tap target size (min 44px)
  const button = page.getByRole('button').first();
  const box = await button.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
});
```

---

## Best Practices

### ✅ DO:
- Use `data-testid` for stable selectors
- Wait for network idle after navigation
- Use helpers for common flows (login, etc.)
- Test mobile responsive separately
- Check console errors during tests
- Take screenshots on failure (automatic)

### ❌ DON'T:
- Use brittle selectors (nth-child, complex CSS)
- Hard-code waits (sleep)
- Skip mobile tests
- Test implementation details
- Make tests dependent on each other

---

## Debugging

### Run with trace:
```bash
npx playwright test --trace on
```

### View trace:
```bash
npx playwright show-trace trace.zip
```

### Debug mode:
```bash
npx playwright test --debug
```

### Screenshots on failure:
Automatic! Check `test-results/` folder.

---

## Test Data Setup

### Seed database:
```typescript
test.beforeEach(async ({ page }) => {
  // Clear database
  await page.request.post('/api/test/reset');
  
  // Seed test data
  await page.request.post('/api/test/seed', {
    data: { userId: '123', products: [...] }
  });
});
```

### Cleanup:
```typescript
test.afterEach(async ({ page }) => {
  // Clean up test data
  await page.request.delete('/api/test/cleanup');
});
```

---

## Common Patterns

### Test login flow:
```typescript
test('login success', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByText('Welcome')).toBeVisible();
});
```

### Test form submission:
```typescript
test('create product form', async ({ page }) => {
  await page.goto('/products/new');
  
  await page.fill('input[name="name"]', 'My Product');
  await page.fill('textarea[name="description"]', 'Product desc');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/products');
  await expect(page.getByText('My Product')).toBeVisible();
});
```

### Test product switching:
```typescript
test('switch product changes data', async ({ page }) => {
  await login(page);
  
  // Get current product data
  const metric1 = await page.locator('[data-testid="metric"]').textContent();
  
  // Switch product
  await page.click('button:has-text("Product")');
  await page.click('[role="menuitem"]:nth-child(2)');
  await page.waitForLoadState('networkidle');
  
  // Verify data changed
  const metric2 = await page.locator('[data-testid="metric"]').textContent();
  expect(metric2).not.toBe(metric1);
});
```

---

## File Structure

```
tests/e2e/
├── sprint-1-manual.spec.ts    # Sprint 1 tests
├── sprint-2-e2e.spec.ts        # Sprint 2 tests (TODO)
├── helpers.ts                  # Shared helpers
└── README.md                   # Documentation
```

---

## Configuration

**File:** `playwright.config.ts`

**Key settings:**
- Base URL: `http://localhost:3001`
- Auto-start dev server
- Browser: Chromium (desktop + mobile)
- Screenshots: On failure
- Trace: On retry
- Parallel: Disabled (sequential for DB consistency)

---

## CI/CD Integration

```yaml
# .github/workflows/test.yml
- name: Install Playwright
  run: npx playwright install --with-deps

- name: Run E2E tests
  run: npm run test:e2e
  
- name: Upload test results
  uses: actions/upload-artifact@v3
  if: failure()
  with:
    name: playwright-report
    path: playwright-report/
```

---

## Troubleshooting

### Tests hang:
- Check dev server is running
- Increase timeout in config
- Check for infinite redirects

### Flaky tests:
- Add `waitForLoadState('networkidle')`
- Use `waitForSelector` instead of fixed waits
- Check for race conditions

### Element not found:
- Use Playwright Inspector: `--debug`
- Check element is visible (not hidden/off-screen)
- Try different selector strategy

---

## Resources

- Playwright Docs: https://playwright.dev
- Config: `playwright.config.ts`
- Test examples: `tests/e2e/`
- Helper functions: `tests/e2e/helpers.ts`

---

**Last Updated:** 2026-03-20
