const BASE_URL = process.env.BASE_URL || "https://tramisup.vercel.app";
const ACCESS_CODE = process.env.EARLY_ACCESS_CODE || "TT31623SEN";

const PERSONAS = [
  {
    key: "launched_b2b_web",
    locale: "tr",
    product: {
      name: "TeamPulse Live Check",
      description:
        "Uzaktan ve hibrit ekiplerin haftalik ekip sagligini, motivasyonunu ve darboğazlarini takip etmesini saglayan B2B SaaS platformu.",
      category: "SaaS, Productivity, HR Tech",
      targetAudience: "Startup'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Yayında",
      website: "https://slack.com",
      seedData: false,
    },
    checks: {
      growthMustInclude: ["Bir sonraki adım", "Tiramisup"],
      growthMustNotInclude: ["review hesabı", "Data Safety", "Sign in with Apple"],
    },
  },
  {
    key: "launched_mobile_consumer",
    locale: "tr",
    product: {
      name: "HabitLoop Live Check",
      description:
        "Gunluk aliskanlik ve rutin takibi yapan mobil uygulama. Store sayfasi baglantilari: https://apps.apple.com/us/app/strides-goal-habit-tracker/id672401817 ve https://play.google.com/store/apps/details?id=com.ticktick.task",
      category: "Mobil uygulama, Lifestyle",
      mobilePlatforms: ["iOS", "Android"],
      targetAudience: "Tuketiciler, Freelancer'lar",
      businessModel: "Abonelik",
      launchStatus: "Yayında",
      website: "https://apps.apple.com/us/app/strides-goal-habit-tracker/id672401817",
      seedData: false,
    },
    checks: {
      preLaunchMustNotInclude: [
        "review hesabı",
        "Data Safety",
        "Sign in with Apple",
        "Privacy Policy ve Terms linklerini hazırla",
      ],
      growthMustInclude: ["Bir sonraki adım", "Tiramisup"],
    },
  },
  {
    key: "growing_mobile_b2c",
    locale: "tr",
    product: {
      name: "FitNest Live Check",
      description:
        "Evde egzersiz planlari ve premium workout paketleri satan mobil uygulama. Store listing baglantisi: https://play.google.com/store/apps/details?id=com.myfitnesspal.android",
      category: "Mobil uygulama, Fitness",
      mobilePlatforms: ["Android"],
      targetAudience: "Tuketiciler",
      businessModel: "Abonelik",
      launchStatus: "Büyüme aşamasında",
      website: "https://play.google.com/store/apps/details?id=com.myfitnesspal.android",
      seedData: false,
    },
    checks: {
      preLaunchMustNotInclude: ["Data Safety", "review hesabı", "Sign in with Apple"],
      growthMustInclude: ["Bir sonraki adım", "Tiramisup"],
    },
  },
  {
    key: "prelaunch_mobile",
    locale: "tr",
    product: {
      name: "PocketChef Live Check",
      description:
        "Kullanicilara haftalik tarif ve market listesi sunan mobil uygulama. Yayin icin cok yakinda, store hazirligi kritik.",
      category: "Mobil uygulama, Food",
      mobilePlatforms: ["iOS", "Android"],
      targetAudience: "Tuketiciler",
      businessModel: "Freemium",
      launchStatus: "Yakında yayında",
      launchDate: "2026-04-15",
      website: "https://www.mealime.com",
      seedData: false,
    },
    checks: {
      preLaunchMustInclude: ["review hesabı", "Data Safety", "Privacy Policy", "Sign in with Apple"],
    },
  },
  {
    key: "prelaunch_web_saas",
    locale: "tr",
    product: {
      name: "BetaBoard Live Check",
      description:
        "Kucuk ekiplerin beta feedback toplamasini ve launch checklist'lerini yonetmesini saglayan web SaaS urunu.",
      category: "SaaS, B2B",
      targetAudience: "Startup'lar, Ajanslar",
      businessModel: "Abonelik",
      launchStatus: "Test kullanıcıları var",
      website: "https://notion.so",
      seedData: false,
    },
    checks: {
      growthMustNotInclude: ["Data Safety", "review hesabı", "Sign in with Apple"],
    },
  },
  {
    key: "launched_content_product",
    locale: "tr",
    product: {
      name: "StudioMail Live Check",
      description:
        "Yaratıcı ekipler icin haftalik ilham, trend ve benchmark bulteni sunan icerik urunu.",
      category: "Newsletter, Content",
      targetAudience: "Creator'lar, Ajanslar",
      businessModel: "Abonelik",
      launchStatus: "Yayında",
      website: "https://substack.com",
      seedData: false,
    },
    checks: {
      growthMustInclude: ["Bir sonraki adım", "Tiramisup"],
      growthMustNotInclude: ["Data Safety", "review hesabı"],
    },
  },
];

class CookieJar {
  constructor() {
    this.store = new Map();
  }

  setFromHeader(setCookieHeaders = []) {
    for (const header of setCookieHeaders) {
      const [pair] = header.split(";");
      const eq = pair.indexOf("=");
      if (eq === -1) continue;
      const key = pair.slice(0, eq).trim();
      const value = pair.slice(eq + 1).trim();
      this.store.set(key, value);
    }
  }

  toHeader() {
    return Array.from(this.store.entries())
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  }
}

async function request(url, { jar, method = "GET", headers = {}, body, redirect = "manual" } = {}) {
  const finalHeaders = new Headers(headers);
  if (jar) {
    const cookie = jar.toHeader();
    if (cookie) finalHeaders.set("cookie", cookie);
  }

  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body,
    redirect,
  });

  if (jar && response.headers.getSetCookie) {
    jar.setFromHeader(response.headers.getSetCookie());
  }

  return response;
}

async function signupAndLogin({ email, password, name }) {
  const jar = new CookieJar();

  const signupRes = await request(`${BASE_URL}/api/auth/signup`, {
    jar,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password, accessCode: ACCESS_CODE }),
  });

  if (!signupRes.ok) {
    const text = await signupRes.text();
    throw new Error(`Signup failed (${signupRes.status}): ${text}`);
  }

  const csrfRes = await request(`${BASE_URL}/api/auth/csrf`, { jar });
  if (!csrfRes.ok) {
    throw new Error(`CSRF fetch failed (${csrfRes.status})`);
  }
  const csrfJson = await csrfRes.json();
  const csrfToken = csrfJson.csrfToken;

  const formBody = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${BASE_URL}/tr/dashboard`,
    json: "true",
  });

  const loginRes = await request(`${BASE_URL}/api/auth/callback/credentials`, {
    jar,
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: formBody.toString(),
  });

  if (![200, 302].includes(loginRes.status)) {
    const text = await loginRes.text();
    throw new Error(`Login failed (${loginRes.status}): ${text}`);
  }

  const sessionRes = await request(`${BASE_URL}/api/auth/session`, { jar });
  const sessionJson = await sessionRes.json();
  if (!sessionJson?.user?.email) {
    throw new Error("Session was not established");
  }

  return jar;
}

async function createProduct(jar, locale, product) {
  const res = await request(`${BASE_URL}/api/products`, {
    jar,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(product),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Product creation failed (${res.status}): ${JSON.stringify(json)}`);
  }

  return json;
}

function normalize(text) {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function runChecks(html, checks = {}, surfaceName) {
  const haystack = normalize(html);
  const failures = [];

  for (const phrase of checks[`${surfaceName}MustInclude`] || []) {
    if (!haystack.includes(phrase.toLowerCase())) {
      failures.push(`Missing "${phrase}" on ${surfaceName}`);
    }
  }

  for (const phrase of checks[`${surfaceName}MustNotInclude`] || []) {
    if (haystack.includes(phrase.toLowerCase())) {
      failures.push(`Unexpected "${phrase}" on ${surfaceName}`);
    }
  }

  return failures;
}

async function fetchSurface(jar, locale, path) {
  const res = await request(`${BASE_URL}/${locale}${path}`, { jar });
  return res.text();
}

function timestampId(index) {
  return `${Date.now()}-${index}-${Math.random().toString(36).slice(2, 8)}`;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runPersona(persona, index) {
  const id = timestampId(index);
  const email = `live-quality-${persona.key}-${id}@example.com`;
  const password = "password123";
  const name = `Live ${persona.key}`;

  const jar = await signupAndLogin({ email, password, name });
  const product = await createProduct(jar, persona.locale, persona.product);
  await sleep(1200);
  const growthHtml = await fetchSurface(jar, persona.locale, "/growth");
  await sleep(500);
  const preLaunchHtml = await fetchSurface(jar, persona.locale, "/pre-launch");
  await sleep(500);
  const dashboardHtml = await fetchSurface(jar, persona.locale, "/dashboard");

  const failures = [
    ...runChecks(growthHtml, persona.checks, "growth"),
    ...runChecks(preLaunchHtml, persona.checks, "preLaunch"),
  ];

  return {
    persona: persona.key,
    productId: product.id,
    productName: product.name,
    status: product.status,
    passed: failures.length === 0,
    failures,
    snippets: {
      dashboardHasSummary: normalize(dashboardHtml).includes("tiramisup özeti"),
      growthHasNextStep: normalize(growthHtml).includes("bir sonraki adım"),
      preLaunchHasLaunchReadiness: normalize(preLaunchHtml).includes("launch readiness") || normalize(preLaunchHtml).includes("launch hazırlık"),
    },
  };
}

async function main() {
  const results = [];

  for (let index = 0; index < PERSONAS.length; index += 1) {
    const persona = PERSONAS[index];
    try {
      const result = await runPersona(persona, index);
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (error) {
      results.push({
        persona: persona.key,
        passed: false,
        failures: [error instanceof Error ? error.message : String(error)],
      });
      console.log(JSON.stringify(results[results.length - 1]));
    }

    await sleep(3000);
  }

  const passedCount = results.filter((item) => item.passed).length;
  console.log(
    JSON.stringify({
      summary: {
        passedCount,
        total: results.length,
        allPassed: passedCount === results.length,
      },
      results,
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
