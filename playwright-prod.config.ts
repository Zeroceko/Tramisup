/**
 * Playwright config for production smoke runs (no local dev server).
 *
 * Usage:
 *   E2E_EMAIL="m@m.com" E2E_PASSWORD="1234" npx playwright test --config playwright-prod.config.ts
 */
import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.E2E_BASE_URL ?? 'https://tiramisup.app';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: /prod-.*\.spec\.ts/,
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
