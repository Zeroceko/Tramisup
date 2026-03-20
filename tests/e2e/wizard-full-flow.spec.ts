import { test, expect } from "@playwright/test";

test.describe("Product wizard - pill-based multi-question flow", () => {
  test.use({ storageState: "tests/e2e/.auth/user.json" });

  test("completes full wizard flow through all pills", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    // Pill 1: Ürünü Anlat (6 sorular)
    await expect(page.locator("h2")).toContainText("Ürününüzün adı nedir?");
    await page.locator('input[type="text"]').fill("E2E Test Product");
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Hangi sorunu çözüyorsunuz?");
    await page.locator("textarea").fill("Kısa test açıklaması");
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Hangi kategoriye giriyorsunuz?");
    await page.getByRole("button", { name: "SaaS" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Ana hedef kitleniz kim?");
    await page.getByRole("button", { name: "Developers" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Şu an hangi aşamadasınız?");
    await page.getByRole("button", { name: "Fikir aşamasında" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Ürün siteniz var mı?");
    // Skip optional question
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 2: Launch Hedefleri (3 soru)
    await expect(page.locator("h2")).toContainText("Launch tarihiniz ne zaman?");
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 3);
    const dateStr = futureDate.toISOString().split("T")[0];
    await page.locator('input[type="date"]').fill(dateStr);
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("İlk 90 günde hangi hedeflere ulaşmak istiyorsunuz?");
    // Checkbox - skip
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Başarıyı hangi metrikle ölçeceksiniz?");
    await page.getByRole("button", { name: "MRR" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 3: Metrics & Tracking (2 soru)
    await expect(page.locator("h2")).toContainText("Hangi metrikleri takip etmek istiyorsunuz?");
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Şu an veri kaynağınız var mı?");
    await page.getByRole("button", { name: "Hayır, manuel gireceğim" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 4: Growth Yaklaşımı (3 soru)
    await expect(page.locator("h2")).toContainText("Hangi growth kanallarını kullanacaksınız?");
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("İş modeliniz nedir?");
    await page.getByRole("button", { name: "Freemium" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Pricing stratejiniz nedir?");
    await page.getByRole("button", { name: "Free trial → Subscription" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 5: Entegrasyonlar (2 soru)
    await expect(page.locator("h2")).toContainText("Şu an hangi araçları kullanıyorsunuz?");
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Tiramisup ile bağlamak istediğiniz araçlar?");
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 6: Ekip (2 soru)
    await expect(page.locator("h2")).toContainText("Ekip büyüklüğünüz nedir?");
    await page.getByRole("button", { name: "Solo founder" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("Sizin rolünüz nedir?");
    await page.getByRole("button", { name: "Founder/CEO" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Pill 7: Hızlı Başlangıç (2 soru)
    await expect(page.locator("h2")).toContainText("Demo veri ile başlamak ister misiniz?");
    await page.getByRole("button", { name: "Evet, demo veri yükle" }).click();
    await page.getByRole("button", { name: "Devam Et" }).click();

    await expect(page.locator("h2")).toContainText("İlk göreviniz ne olsun?");
    // Optional
    await page.getByRole("button", { name: "Ürünü Oluştur" }).click();

    // Should redirect to dashboard
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10000 });
  });

  test("allows backward navigation via pill buttons", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    // Fill first question
    await page.locator('input[type="text"]').fill("Test");
    await page.getByRole("button", { name: "Devam Et" }).click();

    // Now at question 2
    await expect(page.locator("h2")).toContainText("Hangi sorunu çözüyorsunuz?");
    await expect(page.getByText("2 / 20")).toBeVisible();

    // Click "Ürünü Anlat" pill (active pill, should go back to start)
    await page.getByRole("button", { name: "Ürünü Anlat" }).click();

    // Should be back at first question
    await expect(page.locator("h2")).toContainText("Ürününüzün adı nedir?");
    await expect(page.getByText("1 / 20")).toBeVisible();
  });

  test("shows correct pill states (active, completed, future)", async ({ page }) => {
    await page.goto("http://localhost:3000/products/new");

    // Initially: Pill 1 active, rest future
    const pill1 = page.getByRole("button", { name: "Ürünü Anlat" });
    const pill2 = page.getByRole("button", { name: "Launch Hedefleri" });
    const pill3 = page.getByRole("button", { name: "Metrics & Tracking" });

    // Pill 1 should be active (teal bg)
    await expect(pill1).toHaveClass(/bg-\[#95dbda\]/);

    // Pill 2, 3 should be disabled (gray, not clickable)
    await expect(pill2).toHaveAttribute("disabled", "");
    await expect(pill3).toHaveAttribute("disabled", "");
  });
});
