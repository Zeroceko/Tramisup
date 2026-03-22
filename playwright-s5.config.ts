/**
 * Playwright config for S5 smoke test only.
 * No globalSetup — we handle auth manually in the test.
 * Dev server must already be running on port 3000.
 */
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "s5-smoke.spec.ts",
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    // No storageState — each describe block manages auth itself
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Reuse the already-running dev server
});
