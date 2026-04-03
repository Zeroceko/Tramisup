import { test, expect } from "@playwright/test";

const ACCESS_CODE = process.env.E2E_SIGNUP_ACCESS_CODE ?? "TT31623SEN";
const PASSWORD = process.env.E2E_PASSWORD ?? "Passw0rd!";

function uniqueEmail(locale: string) {
  return `codex-smoke-${locale}-${Date.now()}@example.com`;
}

async function createAccount(page: import("@playwright/test").Page, locale: "en" | "tr") {
  const email = uniqueEmail(locale);
  const prefix = `/${locale}`;
  await page.goto(`${prefix}/signup`);
  await page.waitForLoadState("networkidle");

  await page.locator("#name").fill(`Codex Smoke ${locale.toUpperCase()}`);
  await page.locator("#email").fill(email);
  await page.locator("#accessCode").fill(ACCESS_CODE);
  await page.getByRole("button", { name: /Continue|Devam Et/i }).click();

  await page.locator("#password").fill(PASSWORD);
  await page.locator("#confirmPassword").fill(PASSWORD);
  await page.getByRole("button", { name: /Create Account|Hesap Oluştur/i }).click();

  await page.waitForURL(new RegExp(`${prefix}/onboarding`), { timeout: 60_000 });
  await page.waitForLoadState("networkidle");
  return { email, prefix };
}

async function clickContinue(page: import("@playwright/test").Page) {
  await page.getByRole("button", { name: /Continue|Devam Et/i }).click();
}

async function completeLaunchedOnboarding(page: import("@playwright/test").Page, locale: "en" | "tr") {
  const isEn = locale === "en";
  for (let i = 0; i < 12; i += 1) {
    if (page.url().includes(`/${locale}/dashboard`)) break;

    const headings = page.getByRole("heading", { level: 1 });
    const headingCount = await headings.count();
    const heading = (await headings.nth(Math.max(0, headingCount - 1)).textContent())?.trim() ?? "";

    if (/What is your product called\?|Ürününün adı ne\?/.test(heading)) {
      await page.locator('input[type="text"]').first().fill(`Codex ${locale.toUpperCase()} ${Date.now()}`);
      await clickContinue(page);
      continue;
    }

    if (/What does your product do\?|Ürünün ne yapıyor\?/.test(heading)) {
      await page.locator("textarea").fill(
        isEn
          ? "A web product for startup founders to decide what growth step to take next."
          : "Startup kurucuları için bir sonraki büyüme adımını netleştiren web ürünü."
      );
      await clickContinue(page);
      continue;
    }

    if (/What are you building\?|Ne inşa ediyorsun\?/.test(heading)) {
      await page.getByRole("button", { name: /SaaS/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/Which platforms does it run on\?|Hangi platformda çalışıyor\?/.test(heading)) {
      await page.getByRole("button", { name: /^Web/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/Who are you selling to\?|Kime satıyorsun\?/.test(heading)) {
      await page.getByRole("button", { name: isEn ? /Startup teams/i : /Startup ekipleri/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/How will this make money\?|Para nasıl kazanacaksın\?/.test(heading)) {
      await page.getByRole("button", { name: isEn ? /Subscription/i : /Abonelik/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/Which stage are you in right now\?|Şu an hangi aşamadasın\?/.test(heading)) {
      await page.getByRole("button", { name: isEn ? /^Live I have real users$/i : /^Yayındayım Gerçek kullanıcılarım var$/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/What is your #1 priority right now\?|Şu an 1 numaralı önceliğin ne\?/.test(heading)) {
      await page.getByRole("button", { name: isEn ? /Build a growth rhythm/i : /Büyüme ritmi kurmak/i }).click();
      await clickContinue(page);
      continue;
    }

    if (/Which tools are you already using\?|Hangi araçları kullanıyorsun\?/.test(heading)) {
      await page.getByRole("button", { name: /Skip|Atla/i }).click();
      continue;
    }

    if (/Your recommended AARRR setup|Önerilen AARRR kurulumun/.test(heading)) {
      await page.getByRole("button", { name: /Continue later|Daha sonra devam et/i }).click();
      continue;
    }

    throw new Error(`Unexpected onboarding step heading: ${heading}`);
  }

  await page.waitForURL(new RegExp(`/${locale}/(dashboard|products/.+/overview)`), { timeout: 120_000 });
  await page.waitForLoadState("networkidle");
}

test.describe("Production go-live smoke", () => {
  for (const locale of ["en", "tr"] as const) {
    test(`new ${locale} founder reaches metrics after launched onboarding`, async ({ page, baseURL }) => {
      test.setTimeout(240_000);
      expect(baseURL).toBeTruthy();

      await createAccount(page, locale);
      await completeLaunchedOnboarding(page, locale);

      if (page.url().includes("/overview")) {
        if (locale === "en") {
          await expect(page.getByText("Product created")).toBeVisible({ timeout: 30_000 });
          await page.getByRole("link", { name: /Continue with Growth setup|Go to Growth setup/i }).click();
        } else {
          await expect(page.getByText("Ürün oluşturuldu")).toBeVisible({ timeout: 30_000 });
          await page.getByRole("link", { name: /Growth kurulumuna devam et|Growth setup'a git/i }).click();
        }
      } else if (locale === "en") {
        await expect(page.getByText("Open Growth and choose your metrics")).toBeVisible({ timeout: 30_000 });
      } else {
        await expect(page.getByText("Growth'a geç ve metriklerini seç")).toBeVisible({ timeout: 30_000 });
      }

      await page.waitForURL(new RegExp(`/${locale}/growth`), { timeout: 30_000 });
      await page.waitForLoadState("networkidle");

      if (locale === "en") {
        await expect(page.getByText("Before Growth can give you reliable guidance")).toBeVisible({ timeout: 30_000 });
        await page.getByRole("link", { name: "Go to Metrics" }).click();
      } else {
        await expect(page.getByText("Growth tarafında güvenilir öneri verebilmemiz için")).toBeVisible({ timeout: 30_000 });
        await page.getByRole("link", { name: "Ölçüm sistemine git" }).click();
      }

      await page.waitForURL(new RegExp(`/${locale}/metrics`), { timeout: 30_000 });
      await page.waitForLoadState("networkidle");

      if (locale === "en") {
        await expect(page.getByText("Choose one core signal for each stage")).toBeVisible({ timeout: 30_000 });
      } else {
        await expect(page.getByText("Her aşama için tek bir ana sinyal seç")).toBeVisible({ timeout: 30_000 });
      }
    });
  }
});
