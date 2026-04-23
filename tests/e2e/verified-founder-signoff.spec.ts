import { test, expect, type Page } from "@playwright/test";

test.use({ storageState: "tests/e2e/.auth/user.json" });

async function clickContinue(page: Page) {
  await page.getByRole("button", { name: /Devam Et|Continue/i }).click();
}

async function loginVerifiedFounder(page: Page, prefix: string, locale: "tr" | "en") {
  const email = process.env.E2E_EMAIL;
  const password = process.env.E2E_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "Verified founder smoke requires either a valid tests/e2e/.auth/user.json or E2E_EMAIL/E2E_PASSWORD credentials."
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

test.describe("Verified founder signoff", () => {
  test("existing verified founder can reach the core launched flow without signup", async ({ page }) => {
    test.setTimeout(240_000);

    const locale = (process.env.E2E_LOCALE ?? "tr") as "tr" | "en";
    const prefix = `/${locale}`;
    const productName = `Verified Founder ${new Date().toISOString().replace(/[:.]/g, "-")}`;
    const isEn = locale === "en";

    await page.goto(`${prefix}/dashboard`);
    await page.waitForLoadState("networkidle");

    if (/\/login/.test(page.url())) {
      await loginVerifiedFounder(page, prefix, locale);
    }

    await page.goto(`${prefix}/products/new`);
    await page.waitForLoadState("networkidle");
    await page.locator('input[type="text"]').first().waitFor({ state: "visible", timeout: 60_000 });

    await page.locator('input[type="text"]').first().fill(productName);
    await clickContinue(page);

    await page.locator("textarea").waitFor({ state: "visible", timeout: 20_000 });
    await page.locator("textarea").fill(
      isEn
        ? "A launched web product used to validate the core Tiramisup growth flow."
        : "Tiramisup çekirdek growth akışını doğrulamak için kullanılan yayındaki web ürünü."
    );
    await clickContinue(page);

    await page.getByRole("button", { name: /SaaS/i }).click();
    await clickContinue(page);

    await page.getByRole("button", { name: /^Web/i }).click();
    await clickContinue(page);

    await page.getByRole("button", { name: isEn ? /Startup teams/i : /Startup ekipleri/i }).click();
    await clickContinue(page);

    await page.getByRole("button", { name: isEn ? /Subscription/i : /Abonelik/i }).click();
    await clickContinue(page);

    await page.getByRole("button", {
      name: isEn ? /^Live I have real users$/i : /^Yayındayım Gerçek kullanıcılarım var$/i,
    }).click();
    await clickContinue(page);

    await page.getByRole("button", {
      name: isEn ? /Build a growth rhythm/i : /Büyüme ritmi kurmak/i,
    }).click();
    await clickContinue(page);

    await page.getByRole("button", { name: /Skip|Atla/i }).click();

    const continueLater = page.getByRole("button", { name: /Continue later|Daha sonra devam et/i });
    if (await continueLater.isVisible().catch(() => false)) {
      await continueLater.click();
    } else {
      await clickContinue(page);
    }

    await page.waitForURL(new RegExp(`${prefix}/(dashboard|products/.+/overview)`), { timeout: 180_000 });
    await page.waitForLoadState("networkidle");

    if (page.url().includes("/overview")) {
      if (isEn) {
        await expect(page.getByText("Product created")).toBeVisible({ timeout: 30_000 });
        await page.getByRole("link", { name: /Start Growth check-in|Growth setup|Go to Growth setup/i }).click();
      } else {
        await expect(page.getByText("Ürün oluşturuldu")).toBeVisible({ timeout: 30_000 });
        await page.getByRole("link", { name: /Growth check-in ile başla|Growth kurulumuna devam et|Growth setup'a git/i }).click();
      }
    } else if (isEn) {
      await expect(page.getByText("Open Metrics and choose your metrics")).toBeVisible({ timeout: 30_000 });
      await page.getByRole("link", { name: /Open Metrics/i }).click();
    } else {
      await expect(page.getByText("Metrics'e geç ve metriklerini seç")).toBeVisible({ timeout: 30_000 });
      await page.getByRole("link", { name: /Metrics'e git/i }).click();
    }

    await page.waitForLoadState("networkidle");

    if (/\/growth/.test(page.url())) {
      await expect(
        page.getByText(
          isEn
            ? "Before Growth can give you reliable guidance"
            : "Growth tarafında güvenilir öneri verebilmemiz için"
        )
      ).toBeVisible({ timeout: 30_000 });
      await page.getByRole("link", { name: isEn ? /Go to Metrics/i : /Ölçüm sistemine git/i }).click();
    }

    await page.waitForURL(new RegExp(`${prefix}/metrics`), { timeout: 30_000 });
    await page.waitForLoadState("networkidle");
    await expect(
      page.getByText(isEn ? "Select metrics to start tracking" : "Takip etmek için metrik seç")
    ).toBeVisible({ timeout: 30_000 });
  });
});
