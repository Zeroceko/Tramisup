import { test, expect, type Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";

type ProductSummary = {
  id: string;
  name: string;
  status: string | null;
  category: string | null;
  createdAt: string;
};

type Persona = {
  key: string;
  founderName: string;
  focus: string;
  targetStatus: "PRE_LAUNCH" | "GROWING";
  run: (page: Page, prefix: string, product: ProductSummary, note: (line: string) => void) => Promise<void>;
};

const RUN_ID = new Date().toISOString().replace(/[:.]/g, "-");
const OUT_DIR = path.resolve(__dirname, "../../test-results/persona-simulations", RUN_ID);
const NOTES_PATH = path.join(OUT_DIR, "notes.md");

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function note(line: string) {
  console.log(`[persona] ${line}`);
  fs.appendFileSync(NOTES_PATH, `${line}\n`);
}

async function shot(page: Page, name: string) {
  await page.screenshot({
    path: path.join(OUT_DIR, `${name}.png`),
    fullPage: true,
  });
  note(`📸 ${name}.png`);
}

async function login(page: Page, prefix: string) {
  const email = requiredEnv("E2E_EMAIL");
  const password = requiredEnv("E2E_PASSWORD");

  await page.goto(`${prefix}/login`);
  await page.waitForLoadState("networkidle");
  await page.locator("#email").fill(email);
  await page.locator("#password").fill(password);
  await page.getByRole("button", { name: /Giriş Yap|Sign in/i }).click();
  await page.waitForURL(/dashboard|products|onboarding/, { timeout: 30000 });
  await page.waitForLoadState("networkidle");
  note(`Login landed at ${page.url()}`);
}

async function listProducts(page: Page) {
  const res = await page.context().request.get("/api/products");
  if (!res.ok()) {
    throw new Error(`Could not list products (${res.status()}): ${await res.text()}`);
  }
  return (await res.json()) as ProductSummary[];
}

async function activateProduct(page: Page, prefix: string, productId: string) {
  await page.goto(`${prefix}/products/${productId}/overview`);
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate((id) => {
    document.cookie = `activeProductId=${id}; path=/; max-age=31536000`;
  }, productId);
}

const personas: Persona[] = [
  {
    key: "01-defne-prelaunch",
    founderName: "Defne Kaya",
    focus: "Launch clarity",
    targetStatus: "PRE_LAUNCH",
    run: async (page, prefix, product, noteFn) => {
      await activateProduct(page, prefix, product.id);
      await page.goto(`${prefix}/pre-launch`);
      await page.waitForLoadState("networkidle").catch(() => {});
      const hasChecklist = await page.getByText(/Checklist|Listesi/i).first().isVisible().catch(() => false);
      const noChecklist = await page.getByText(/Henüz checklist oluşmadı|No checklist yet/i).first().isVisible().catch(() => false);
      noteFn(`Defne sees checklist surface: ${hasChecklist}, empty checklist state: ${noChecklist}`);
    },
  },
  {
    key: "02-mert-solo-saas",
    founderName: "Mert Arslan",
    focus: "One clear next step",
    targetStatus: "GROWING",
    run: async (page, prefix, product, noteFn) => {
      await activateProduct(page, prefix, product.id);
      await page.goto(`${prefix}/dashboard`);
      await page.waitForLoadState("networkidle").catch(() => {});
      noteFn(`Mert dashboard URL: ${page.url()}`);
      const growthCta = await page.getByText(/Growth|Büyüme/i).first().isVisible().catch(() => false);
      noteFn(`Mert sees growth-related guidance on dashboard: ${growthCta}`);
    },
  },
  {
    key: "03-selin-nontechnical",
    founderName: "Selin Demir",
    focus: "Plain-language guidance",
    targetStatus: "GROWING",
    run: async (page, prefix, product, noteFn) => {
      await activateProduct(page, prefix, product.id);
      await page.goto(`${prefix}/dashboard`);
      await page.waitForLoadState("networkidle").catch(() => {});
      const agentOpener = page.locator('button[title*="Öneri"], button[title*="Recommendations"], button[title*="Launch"], button[title*="Growth"]').first();
      if (await agentOpener.isVisible().catch(() => false)) {
        await agentOpener.click();
        await page.waitForTimeout(1000);
      }
      const input = page.locator('input[placeholder*="soru"], input[placeholder*="question"]').first();
      if (await input.isVisible().catch(() => false)) {
        await input.fill("Bana çok sade şekilde şimdi ne yapmam gerektiğini söyle.");
        await page.getByRole("button", { name: /Gönder|Send/i }).first().click();
        await page.waitForTimeout(4000);
        noteFn("Selin asked the AI for a plain-language instruction.");
      } else {
        noteFn("Selin could not reach the free-form AI input quickly.");
      }
    },
  },
  {
    key: "04-emre-growth-operator",
    founderName: "Emre Yılmaz",
    focus: "Metrics credibility",
    targetStatus: "GROWING",
    run: async (page, prefix, product, noteFn) => {
      await activateProduct(page, prefix, product.id);
      await page.goto(`${prefix}/metrics`);
      await page.waitForLoadState("networkidle").catch(() => {});
      noteFn(`Emre metrics URL: ${page.url()}`);
      const metricInputs = await page.locator('input[type="number"]').count();
      noteFn(`Emre sees ${metricInputs} numeric metric inputs.`);
      await page.goto(`${prefix}/growth`);
      await page.waitForLoadState("networkidle").catch(() => {});
      noteFn(`Emre growth URL: ${page.url()}`);
    },
  },
  {
    key: "05-duru-multiproduct",
    founderName: "Duru Çelik",
    focus: "Portfolio clarity",
    targetStatus: "PRE_LAUNCH",
    run: async (page, prefix, _product, noteFn) => {
      await page.goto(`${prefix}/products`);
      await page.waitForLoadState("networkidle").catch(() => {});
      const cards = await page.locator('a[href$="/products/new"], button:has-text("Aktif yap"), button:has-text("Active product")').count();
      noteFn(`Duru product portfolio interaction markers: ${cards}`);
      const body = await page.locator("body").innerText();
      noteFn(`Products page contains ${body.includes("Tüm ürünlerin") ? "TR hero" : "no TR hero"} copy.`);
    },
  },
];

test.describe("Production persona simulations", () => {
  test("run five founder personas sequentially on the current product portfolio", async ({ page }) => {
    test.setTimeout(360_000);

    fs.mkdirSync(OUT_DIR, { recursive: true });
    fs.writeFileSync(
      NOTES_PATH,
      `# Persona founder simulation run — ${new Date().toISOString()}\n\n` +
        `Note: New-product onboarding was previously observed to stall around the AARRR recommendation step, and /api/products/[id]/generate-plan timed out around 50s in production. This run therefore uses the current product portfolio under the test founder account.\n\n`,
    );

    const prefix = "/tr";
    const pageErrors: string[] = [];

    page.on("pageerror", (err) => {
      pageErrors.push(err.message);
      note(`❌ pageerror: ${err.message}`);
    });
    page.on("console", (msg) => {
      if (msg.type() === "error") note(`⚠️ console.error: ${msg.text().slice(0, 220)}`);
    });

    await login(page, prefix);
    await shot(page, "00-after-login");

    const products = await listProducts(page);
    note(`Available products: ${products.map((p) => `${p.name} [${p.status}]`).join(" | ")}`);

    const prelaunchProducts = products.filter((p) => p.status === "PRE_LAUNCH");
    const growingProduct = products.find((p) => p.status === "GROWING");

    expect(prelaunchProducts.length).toBeGreaterThan(0);
    expect(growingProduct).toBeTruthy();

    for (const persona of personas) {
      note(`\n## ${persona.founderName} — ${persona.focus}`);
      const product =
        persona.targetStatus === "GROWING"
          ? growingProduct!
          : prelaunchProducts[0];
      note(`Using product "${product.name}" (${product.status})`);
      await persona.run(page, prefix, product, note);
      await shot(page, `${persona.key}`);
    }

    note(`\nPage errors observed during portfolio-based persona run: ${pageErrors.length}`);

    await page.goto(`${prefix}/products`);
    await page.waitForLoadState("networkidle").catch(() => {});
    await shot(page, "99-products-portfolio");
    expect(products.length).toBeGreaterThan(0);
  });
});
