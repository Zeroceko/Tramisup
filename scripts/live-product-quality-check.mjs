const BASE_URL = process.env.BASE_URL || "https://tramisup.vercel.app";
const ACCESS_CODE = process.env.EARLY_ACCESS_CODE || "TT31623SEN";

const PRELAUNCH_MOBILE_MUST_INCLUDE = [
  "review hesabı",
  "data safety",
  "privacy policy",
  "sign in with apple",
];

const IOS_PRELAUNCH_MUST_INCLUDE = [
  "review hesabı",
  "privacy policy",
  "sign in with apple",
];

const ANDROID_PRELAUNCH_MUST_INCLUDE = [
  "data safety",
  "test hesabı",
];

const LAUNCHED_MOBILE_MUST_NOT_INCLUDE = [
  "review hesabı",
  "data safety",
  "sign in with apple",
  "privacy policy ve terms linklerini hazırla",
];

function persona({
  key,
  stage,
  locale = "tr",
  product,
  checks = {},
  expected = {},
}) {
  return {
    key,
    stage,
    locale,
    product: { ...product, seedData: false },
    checks,
    expected,
  };
}

const PERSONAS = [
  // GELISTIRME ASAMASINDA
  persona({
    key: "development_mobile_focusflow",
    stage: "Geliştirme aşamasında",
    product: {
      name: "FocusFlow Stage Check",
      description:
        "Dikkat dagitici bloklayici ve odak seansi takibi yapan mobil uygulama. MVP hala gelistirme asamasinda.",
      category: "Mobil uygulama, Productivity",
      mobilePlatforms: ["iOS"],
      targetAudience: "Tuketiciler, Freelancer'lar",
      businessModel: "Freemium",
      launchStatus: "Geliştirme aşamasında",
      website: "https://www.forestapp.cc",
    },
    checks: {
      preLaunchMustInclude: IOS_PRELAUNCH_MUST_INCLUDE,
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "development_b2b_teamsync",
    stage: "Geliştirme aşamasında",
    product: {
      name: "TeamSync Stage Check",
      description:
        "Kucuk ekiplerin async standup ve weekly planning akisini yoneten B2B SaaS urunu. Hala gelistirme asamasinda.",
      category: "SaaS, B2B, Collaboration",
      targetAudience: "Startup'lar, Ajanslar",
      businessModel: "Abonelik",
      launchStatus: "Geliştirme aşamasında",
      website: "https://linear.app",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı", "sign in with apple"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "development_content_briefly",
    stage: "Geliştirme aşamasında",
    product: {
      name: "Briefly Stage Check",
      description:
        "Pazarlama ekiplerine haftalik trend ozetleri ve benchmark notlari sunan icerik urunu. Ilk surum hala gelistirme tarafinda.",
      category: "Newsletter, Content",
      targetAudience: "Ajanslar, Creator'lar",
      businessModel: "Abonelik",
      launchStatus: "Geliştirme aşamasında",
      website: "https://substack.com",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "development_marketplace_craftcart",
    stage: "Geliştirme aşamasında",
    product: {
      name: "CraftCart Stage Check",
      description:
        "Nis urun satan kucuk markalar icin siparis ve vitrin yonetimi saglayan web tabanli commerce araci.",
      category: "E-commerce, SaaS",
      targetAudience: "KOBI'ler, Girisimciler",
      businessModel: "Komisyon + Abonelik",
      launchStatus: "Geliştirme aşamasında",
      website: "https://www.shopify.com",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "sign in with apple"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),

  // TEST KULLANICILARI VAR
  persona({
    key: "testusers_mobile_habitspark",
    stage: "Test kullanıcıları var",
    product: {
      name: "HabitSpark Stage Check",
      description:
        "Aliskanlik kartlari ve streak deneyimi sunan mobil uygulama. Test kullanicilari var ve store hazirligi kritik.",
      category: "Mobil uygulama, Lifestyle",
      mobilePlatforms: ["iOS", "Android"],
      targetAudience: "Tuketiciler",
      businessModel: "Abonelik",
      launchStatus: "Test kullanıcıları var",
      website: "https://habitica.com",
    },
    checks: {
      preLaunchMustInclude: PRELAUNCH_MOBILE_MUST_INCLUDE,
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "testusers_saas_dealdesk",
    stage: "Test kullanıcıları var",
    product: {
      name: "DealDesk Stage Check",
      description:
        "Satis ekiplerinin pipeline notlari, toplantilari ve teklif akislarini yoneten B2B SaaS urunu. Erken beta kullanicilari var.",
      category: "SaaS, Sales, B2B",
      targetAudience: "Startup'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Test kullanıcıları var",
      website: "https://pipedrive.com",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı", "sign in with apple"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "testusers_content_signalnote",
    stage: "Test kullanıcıları var",
    product: {
      name: "SignalNote Stage Check",
      description:
        "Kurucular icin haftalik growth teardown ve benchmark maili hazirlayan icerik urunu. Test okuyuculari var.",
      category: "Newsletter, Content",
      targetAudience: "Startup'lar, Creator'lar",
      businessModel: "Abonelik",
      launchStatus: "Test kullanıcıları var",
      website: "https://beehiiv.com",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "testusers_edtech_tutorboard",
    stage: "Test kullanıcıları var",
    product: {
      name: "TutorBoard Stage Check",
      description:
        "Ozel ders veren egitmenlerin ogrenci planlamasi ve ilerleme takibini yaptigi web uygulamasi.",
      category: "EdTech, SaaS",
      targetAudience: "Freelancer'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Test kullanıcıları var",
      website: "https://cal.com",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),

  // YAKINDA YAYINDA
  persona({
    key: "soon_mobile_pocketchef",
    stage: "Yakında yayında",
    product: {
      name: "PocketChef Stage Check",
      description:
        "Haftalik tarif, market listesi ve mutfak plani sunan mobil uygulama. Yayin tarihi cok yakin.",
      category: "Mobil uygulama, Food",
      mobilePlatforms: ["iOS", "Android"],
      targetAudience: "Tuketiciler",
      businessModel: "Freemium",
      launchStatus: "Yakında yayında",
      launchDate: "2026-04-20",
      website: "https://www.mealime.com",
    },
    checks: {
      preLaunchMustInclude: PRELAUNCH_MOBILE_MUST_INCLUDE,
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "soon_b2b_betaboard",
    stage: "Yakında yayında",
    product: {
      name: "BetaBoard Stage Check",
      description:
        "Beta feedback toplama, launch checklist ve release notu paylasimi yapan web SaaS urunu.",
      category: "SaaS, B2B",
      targetAudience: "Startup'lar, Ajanslar",
      businessModel: "Abonelik",
      launchStatus: "Yakında yayında",
      website: "https://notion.so",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı", "sign in with apple"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "soon_creator_portfoliojet",
    stage: "Yakında yayında",
    product: {
      name: "PortfolioJet Stage Check",
      description:
        "Creator'larin mini portfolio ve lead toplama sayfalari kurdugu hafif web araci. Launch cok yakin.",
      category: "Creator Tools, SaaS",
      targetAudience: "Creator'lar, Freelancer'lar",
      businessModel: "Abonelik",
      launchStatus: "Yakında yayında",
      website: "https://carrd.co",
    },
    checks: {
      preLaunchMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),
  persona({
    key: "soon_finance_mobile_cashcompass",
    stage: "Yakında yayında",
    product: {
      name: "CashCompass Stage Check",
      description:
        "Kisisel harcama kategorileri ve aylik butce takibi sunan mobil uygulama. Store launch oncesi son haftada.",
      category: "Mobil uygulama, Finance",
      mobilePlatforms: ["Android"],
      targetAudience: "Tuketiciler",
      businessModel: "Abonelik",
      launchStatus: "Yakında yayında",
      website: "https://play.google.com/store/apps/details?id=com.spendee.app",
    },
    checks: {
      preLaunchMustInclude: ANDROID_PRELAUNCH_MUST_INCLUDE,
    },
    expected: { growthHasNextStep: false, dashboardHasSummary: true },
  }),

  // YAYINDA
  persona({
    key: "launched_b2b_web_teampulse",
    stage: "Yayında",
    product: {
      name: "TeamPulse Live Check",
      description:
        "Uzaktan ve hibrit ekiplerin haftalik ekip sagligini, motivasyonunu ve darboğazlarini takip etmesini saglayan B2B SaaS platformu.",
      category: "SaaS, Productivity, HR Tech",
      targetAudience: "Startup'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Yayında",
      website: "https://slack.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["review hesabı", "data safety", "sign in with apple"],
      preLaunchMustNotInclude: ["review hesabı", "data safety", "sign in with apple"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "launched_mobile_consumer_habitloop",
    stage: "Yayında",
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
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      preLaunchMustNotInclude: LAUNCHED_MOBILE_MUST_NOT_INCLUDE,
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "launched_content_studiomail",
    stage: "Yayında",
    product: {
      name: "StudioMail Live Check",
      description:
        "Yaratici ekipler icin haftalik ilham, trend ve benchmark bulteni sunan icerik urunu.",
      category: "Newsletter, Content",
      targetAudience: "Creator'lar, Ajanslar",
      businessModel: "Abonelik",
      launchStatus: "Yayında",
      website: "https://substack.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "launched_marketplace_faircart",
    stage: "Yayında",
    product: {
      name: "FairCart Live Check",
      description:
        "Bağımsız markalarin mini vitrin kurup siparis aldigi commerce urunu. Landing ve mesaj uyumu growth icin kritik.",
      category: "E-commerce, Marketplace",
      targetAudience: "KOBI'ler, Girisimciler",
      businessModel: "Komisyon",
      launchStatus: "Yayında",
      website: "https://www.etsy.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),

  // BUYUME ASAMASINDA
  persona({
    key: "growing_mobile_b2c_fitnest",
    stage: "Büyüme aşamasında",
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
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      preLaunchMustNotInclude: ["data safety", "review hesabı", "sign in with apple"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "growing_b2b_pipelinepilot",
    stage: "Büyüme aşamasında",
    product: {
      name: "PipelinePilot Live Check",
      description:
        "Kucuk satis ekipleri icin funnel gorunurlugu, meeting follow-up ve revenue tahmini sunan B2B SaaS urunu.",
      category: "SaaS, Sales, B2B",
      targetAudience: "Startup'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Büyüme aşamasında",
      website: "https://www.hubspot.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "growing_creator_signalnoteplus",
    stage: "Büyüme aşamasında",
    product: {
      name: "SignalNote Plus Check",
      description:
        "Kurucular ve creator'lar icin haftalik taktik notlari ve benchmark raporlari sunan icerik urunu.",
      category: "Newsletter, Content",
      targetAudience: "Creator'lar, Startup'lar",
      businessModel: "Abonelik",
      launchStatus: "Büyüme aşamasında",
      website: "https://beehiiv.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
  persona({
    key: "growing_fintech_ledgermate",
    stage: "Büyüme aşamasında",
    product: {
      name: "LedgerMate Live Check",
      description:
        "Freelancer ve mikro isletmeler icin fatura, harcama ve tahsilat takibi yapan web urunu.",
      category: "FinTech, SaaS",
      targetAudience: "Freelancer'lar, KOBI'ler",
      businessModel: "Abonelik",
      launchStatus: "Büyüme aşamasında",
      website: "https://www.waveapps.com",
    },
    checks: {
      growthMustInclude: ["bir sonraki adım", "tiramisup"],
      growthMustNotInclude: ["data safety", "review hesabı"],
    },
    expected: { growthHasNextStep: true, dashboardHasSummary: true },
  }),
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

async function createProduct(jar, product) {
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

function runSnippetChecks(snippets, expected = {}) {
  const failures = [];

  for (const [key, value] of Object.entries(expected)) {
    if (typeof value === "boolean" && snippets[key] !== value) {
      failures.push(`Expected ${key}=${value} but got ${snippets[key]}`);
    }
  }

  return failures;
}

async function runPersona(personaConfig, index) {
  const id = timestampId(index);
  const email = `live-quality-${personaConfig.key}-${id}@example.com`;
  const password = "password123";
  const name = `Live ${personaConfig.key}`;

  const jar = await signupAndLogin({ email, password, name });
  const product = await createProduct(jar, personaConfig.product);
  await sleep(1200);
  const growthHtml = await fetchSurface(jar, personaConfig.locale, "/growth");
  await sleep(500);
  const preLaunchHtml = await fetchSurface(jar, personaConfig.locale, "/pre-launch");
  await sleep(500);
  const dashboardHtml = await fetchSurface(jar, personaConfig.locale, "/dashboard");

  const snippets = {
    dashboardHasSummary: normalize(dashboardHtml).includes("tiramisup özeti"),
    growthHasNextStep: normalize(growthHtml).includes("bir sonraki adım"),
    preLaunchHasLaunchReadiness:
      normalize(preLaunchHtml).includes("launch readiness") ||
      normalize(preLaunchHtml).includes("launch hazırlık"),
  };

  const failures = [
    ...runChecks(growthHtml, personaConfig.checks, "growth"),
    ...runChecks(preLaunchHtml, personaConfig.checks, "preLaunch"),
    ...runSnippetChecks(snippets, personaConfig.expected),
  ];

  return {
    persona: personaConfig.key,
    stage: personaConfig.stage,
    productId: product.id,
    productName: product.name,
    status: product.status,
    passed: failures.length === 0,
    failures,
    snippets,
  };
}

function summarizeByStage(results) {
  const stages = new Map();

  for (const result of results) {
    const current = stages.get(result.stage) ?? {
      total: 0,
      passedCount: 0,
      failedPersonas: [],
    };

    current.total += 1;
    if (result.passed) {
      current.passedCount += 1;
    } else {
      current.failedPersonas.push({
        persona: result.persona,
        failures: result.failures,
      });
    }

    stages.set(result.stage, current);
  }

  return Object.fromEntries(
    Array.from(stages.entries()).map(([stage, summary]) => [
      stage,
      {
        ...summary,
        allPassed: summary.passedCount === summary.total,
      },
    ])
  );
}

async function main() {
  const personaFilter = process.env.PERSONA_FILTER
    ? new Set(
        process.env.PERSONA_FILTER.split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      )
    : null;
  const stageFilter = process.env.STAGE_FILTER
    ? new Set(
        process.env.STAGE_FILTER.split(",")
          .map((value) => value.trim())
          .filter(Boolean)
      )
    : null;
  const personasToRun = PERSONAS.filter((item) => {
    if (personaFilter && !personaFilter.has(item.key)) return false;
    if (stageFilter && !stageFilter.has(item.stage)) return false;
    return true;
  });
  const results = [];

  for (let index = 0; index < personasToRun.length; index += 1) {
    const personaConfig = personasToRun[index];
    try {
      const result = await runPersona(personaConfig, index);
      results.push(result);
      console.log(JSON.stringify(result));
    } catch (error) {
      const result = {
        persona: personaConfig.key,
        stage: personaConfig.stage,
        passed: false,
        failures: [error instanceof Error ? error.message : String(error)],
      };
      results.push(result);
      console.log(JSON.stringify(result));
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
      filters: {
        personaFilter: personaFilter ? Array.from(personaFilter) : null,
        stageFilter: stageFilter ? Array.from(stageFilter) : null,
      },
      byStage: summarizeByStage(results),
      results,
    })
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
