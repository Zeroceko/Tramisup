import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/user.json" });

type ProductSummary = {
  id: string;
  name: string;
  status: string | null;
  category: string | null;
  createdAt: string;
};

function getLocale() {
  return (process.env.E2E_LOCALE ?? "tr") as "tr" | "en";
}

async function loginVerifiedFounder(page: Page, prefix: string, locale: "tr" | "en") {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Suggestion surface smoke requires either a valid tests/e2e/.auth/user.json or E2E_EMAIL/E2E_PASSWORD credentials.",
    );
  }

  const isEn = locale === "en";

  await page.goto(`${prefix}/login`);
  await page.waitForLoadState("networkidle");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page
    .getByRole("button", { name: isEn ? /Sign in|Log in/i : /Giriş Yap/i })
    .click();
  await page.waitForURL(new RegExp(`${prefix}/(dashboard|onboarding|products)`), { timeout: 60_000 });
  await page.waitForLoadState("networkidle");
}

async function listProducts(page: Page) {
  const response = await page.context().request.get("/api/products");
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as ProductSummary[];
}

async function createSmokeProduct(
  page: Page,
  locale: "tr" | "en",
  launchStatus: "BUILDING" | "LIVE",
) {
  const isEn = locale === "en";
  const timestamp = Date.now();
  const payload = {
    name: `Suggestion Smoke ${launchStatus} ${timestamp}`,
    category: "SaaS",
    description:
      launchStatus === "LIVE"
        ? isEn
          ? "A live SaaS product created by the agent suggestion smoke test."
          : "Agent suggestion smoke testi tarafindan olusturulan yayindaki SaaS urunu."
        : isEn
          ? "A pre-launch SaaS product created by the agent suggestion smoke test."
          : "Agent suggestion smoke testi tarafindan olusturulan pre-launch SaaS urunu.",
    platforms: ["WEB"],
    targetAudience: isEn ? "Startup teams" : "Startup ekipleri",
    businessModel: isEn ? "Subscription" : "Abonelik",
    launchStatus,
    growthGoal: isEn ? "Build a growth rhythm" : "Buyume ritmi kurmak",
    goalKey: "growth_rhythm",
    locale,
  };

  const response = await page.context().request.post("/api/products", {
    data: payload,
  });

  expect(response.ok(), `Failed to create ${launchStatus} smoke product: ${await response.text()}`).toBeTruthy();
  const json = (await response.json()) as { id: string };
  return json.id;
}

async function updateProductStage(
  page: Page,
  productId: string,
  launchStatus: "BUILDING" | "LIVE",
) {
  const response = await page.context().request.patch(`/api/products/${productId}`, {
    data: {
      launchStatus,
    },
  });

  expect(response.ok(), `Failed to update product ${productId} to ${launchStatus}: ${await response.text()}`).toBeTruthy();
}

async function deleteProduct(page: Page, productId: string) {
  const response = await page.context().request.delete(`/api/products/${productId}`);
  expect(response.ok(), `Failed to delete smoke product ${productId}: ${await response.text()}`).toBeTruthy();
}

async function activateProduct(page: Page, prefix: string, productId: string) {
  await page.goto(`${prefix}/products/${productId}/overview`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate((id) => {
    document.cookie = `activeProductId=${id}; path=/; max-age=31536000`;
  }, productId);
}

async function openAgentPanel(page: Page, panelTitle: RegExp) {
  const opener = page.locator("button[title]").filter({ has: page.locator("img[src='/assets/illus-tiramisu-slice.png']") }).first();
  await expect(opener).toBeVisible({ timeout: 30_000 });
  await opener.click();
  await expect(page.getByText(panelTitle).first()).toBeVisible({ timeout: 30_000 });
}

async function assertSuggestionSurface(
  page: Page,
  opts: {
    route: string;
    panelTitle: RegExp;
    previewTitle: RegExp;
    createTitle: RegExp;
    previewButtonLabel: RegExp;
    whyLabel: RegExp;
    doneLabel: RegExp;
    nextLabel: RegExp;
  },
) {
  await page.goto(opts.route);
  await page.waitForLoadState("networkidle").catch(() => {});

  await openAgentPanel(page, opts.panelTitle);

  const previewButtons = page.getByTitle(opts.previewTitle);
  const createButtons = page.getByTitle(opts.createTitle);

  await expect(previewButtons.first()).toBeVisible({ timeout: 30_000 });
  await expect(createButtons.first()).toBeVisible({ timeout: 30_000 });

  await previewButtons.first().click();

  await expect(page.getByTitle(opts.previewButtonLabel).or(page.getByRole("button", { name: opts.previewButtonLabel })).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(opts.whyLabel).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(opts.doneLabel).first()).toBeVisible({ timeout: 30_000 });
  await expect(page.getByText(opts.nextLabel).first()).toBeVisible({ timeout: 30_000 });

  await page.keyboard.press("Escape");
  await expect(page.getByText(opts.whyLabel).first()).toBeHidden({ timeout: 10_000 });
}

test.describe("Production agent suggestion surfaces", () => {
  test("verified founder can preview actionable suggestions on overview, launch, and growth", async ({ page }) => {
    test.setTimeout(240_000);

    const locale = getLocale();
    const prefix = `/${locale}`;
    const isEn = locale === "en";
    const cleanupProductIds: string[] = [];

    try {
      await page.goto(`${prefix}/dashboard`);
      await page.waitForLoadState("networkidle");

      if (/\/login/.test(page.url())) {
        await loginVerifiedFounder(page, prefix, locale);
      }

      let products = await listProducts(page);
      let prelaunchProduct = products.find((product) => product.status === "PRE_LAUNCH");
      let launchedProduct = products.find((product) => product.status === "LAUNCHED" || product.status === "GROWING");

      if (!prelaunchProduct) {
        const productId = await createSmokeProduct(page, locale, "BUILDING");
        cleanupProductIds.push(productId);
        products = await listProducts(page);
        prelaunchProduct =
          products.find((product) => product.id === productId) ??
          products.find((product) => product.status === "PRE_LAUNCH");
      }

      expect(prelaunchProduct, "Need at least one PRE_LAUNCH product for launch suggestion coverage").toBeTruthy();

      await activateProduct(page, prefix, prelaunchProduct!.id);
      await assertSuggestionSurface(page, {
        route: `${prefix}/pre-launch`,
        panelTitle: isEn ? /Launch Recommendations/i : /Launch Önerileri/i,
        previewTitle: isEn ? /^Preview$/i : /^Önizle$/i,
        createTitle: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        previewButtonLabel: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        whyLabel: isEn ? /Why it matters/i : /Neden önemli/i,
        doneLabel: isEn ? /Done when/i : /Biten hali/i,
        nextLabel: isEn ? /Next action/i : /Sonraki adım/i,
      });

      await activateProduct(page, prefix, prelaunchProduct!.id);
      await assertSuggestionSurface(page, {
        route: `${prefix}/dashboard`,
        panelTitle: isEn ? /Tiramisup Recommendations/i : /Tiramisup Önerileri/i,
        previewTitle: isEn ? /^Preview$/i : /^Önizle$/i,
        createTitle: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        previewButtonLabel: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        whyLabel: isEn ? /Why it matters/i : /Neden önemli/i,
        doneLabel: isEn ? /Done when/i : /Biten hali/i,
        nextLabel: isEn ? /Next action/i : /Sonraki adım/i,
      });

      if (!launchedProduct) {
        if (!cleanupProductIds.includes(prelaunchProduct!.id)) {
          cleanupProductIds.push(prelaunchProduct!.id);
        }
        await updateProductStage(page, prelaunchProduct!.id, "LIVE");
        products = await listProducts(page);
        launchedProduct =
          products.find((product) => product.id === prelaunchProduct!.id) ??
          products.find((product) => product.status === "LAUNCHED" || product.status === "GROWING");
      }

      expect(launchedProduct, "Need at least one LAUNCHED or GROWING product for growth suggestion coverage").toBeTruthy();

      await activateProduct(page, prefix, launchedProduct!.id);
      await assertSuggestionSurface(page, {
        route: `${prefix}/growth`,
        panelTitle: isEn ? /Growth Recommendations/i : /Growth Önerileri/i,
        previewTitle: isEn ? /^Preview$/i : /^Önizle$/i,
        createTitle: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        previewButtonLabel: isEn ? /Create task|Open board/i : /Görev oluştur|Board'u aç/i,
        whyLabel: isEn ? /Why it matters/i : /Neden önemli/i,
        doneLabel: isEn ? /Done when/i : /Biten hali/i,
        nextLabel: isEn ? /Next action/i : /Sonraki adım/i,
      });
    } finally {
      for (const productId of cleanupProductIds.reverse()) {
        try {
          await deleteProduct(page, productId);
        } catch {
          // Cleanup failure should not hide the primary regression failure.
        }
      }
    }
  });
});
