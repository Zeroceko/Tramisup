import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";
import type { LaunchCategory, GrowthCategory, Priority, TaskStatus } from "@prisma/client";
import { loadProjectSkill } from "@/lib/project-skill-loader";
import { mergeMobileLaunchBaseline } from "@/lib/mobile-launch-baseline";

export type AiLaunchItem = {
  category: LaunchCategory;
  title: string;
  description?: string;
  priority: Priority;
  order: number;
};

export type AiGrowthItem = {
  category: GrowthCategory;
  title: string;
  description?: string;
  order: number;
};

export type AiTask = {
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
};

export type AiPlan = {
  launchChecklist: AiLaunchItem[];
  growthChecklist: AiGrowthItem[];
  tasks: AiTask[];
};

export type WizardInput = {
  name: string;
  description: string;
  category?: string;
  targetAudience?: string;
  businessModel?: string;
  launchStatus?: string;
  website?: string;
  mobilePlatforms?: string[];
  websiteContent?: string;
  stageContext?: string;
  storeGuidance?: string;
};

function inferContext(input: WizardInput) {
  const launchStage = (input.launchStatus ?? "").toLowerCase();
  const isLaunched = ["yayında", "büyüme aşamasında"].includes(launchStage);
  const platforms = Array.from(new Set(input.mobilePlatforms ?? []));
  const haystack = `${input.category ?? ""} ${input.targetAudience ?? ""} ${input.businessModel ?? ""} ${input.description ?? ""} ${input.websiteContent ?? ""}`.toLowerCase();

  return {
    launchStage,
    isLaunched,
    isMobile: platforms.length > 0 || /mobil uygulama|mobile app|app store|play store|ios|android/.test(haystack),
    platforms,
    isB2B: /team|teams|business|b2b|saas|company|startup|ekip|işletme/.test(haystack),
    isContent: /content|newsletter|media|community|creator|blog/.test(haystack),
    isSubscription: /subscription|abonelik|recurring|monthly|yearly|trial|freemium|paywall/.test(haystack),
  };
}

function makeLaunchItem(
  category: LaunchCategory,
  title: string,
  description: string,
  priority: Priority
): AiLaunchItem {
  return { category, title, description, priority, order: 0 };
}

function makeGrowthItem(
  category: GrowthCategory,
  title: string,
  description: string
): AiGrowthItem {
  return { category, title, description, order: 0 };
}

function assignOrder<T extends { order: number }>(items: T[]) {
  return items.map((item, index) => ({ ...item, order: index + 1 }));
}

function dedupeByTitle<T extends { title: string }>(items: T[]) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.title.toLocaleLowerCase("tr-TR");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildSkillBackedFallbackPlan(input: WizardInput): AiPlan {
  const context = inferContext(input);
  const productName = input.name;
  const audience = input.targetAudience || "hedef kitlen";
  const launchChecklist: AiLaunchItem[] = [];
  const growthChecklist: AiGrowthItem[] = [];

  if (context.isLaunched) {
    launchChecklist.push(
      makeLaunchItem(
        "MARKETING",
        "Store veya landing mesajini gercek degerle hizala",
        `${productName} icin ilk gorulen mesaj ile gercek deneyim arasinda kopukluk varsa acquisition kalitesi dusurur. Ilk vaadi netlestir.`,
        "HIGH"
      ),
      makeLaunchItem(
        "PRODUCT",
        "Ilk deger anina giden akis kopuslerini not et",
        `${audience} urunu gordukten sonra ilk faydali aksiyona ne kadar rahat gidiyor, bu kopusleri gozden gecir.`,
        "HIGH"
      ),
      makeLaunchItem(
        "TECH",
        "Acquisition ve activation eventlerini calisir halde tut",
        `Yayindaki urunde Tiramisup artik submission degil sinyal kalitesi arar. Install, signup ve ilk deger eventleri olculmeli.`,
        "HIGH"
      ),
      makeLaunchItem(
        "MARKETING",
        "Ilk screenshot veya hero alani en guclu use case'e gore yenile",
        `Listing ya da landing ilk bakista ${productName}'in neden denenecegini anlatmali.`,
        "MEDIUM"
      )
    );

    if (context.isMobile) {
      launchChecklist.push(
        makeLaunchItem(
          "MARKETING",
          "ASO baslik ve screenshot sirasini yeniden kontrol et",
          `Yayindaki mobil urunde artik odak submission degil, listing conversion. App Store / Play Store varliklarini en guclu use case'e gore duzenle.`,
          "HIGH"
        ),
        makeLaunchItem(
          "PRODUCT",
          "Store listing vaadi ile uygulama ici deneyimi eslestir",
          `Listing'de verilen soz ile uygulama ici ilk deneyim ayni hikayeyi anlatmali. Mesaj uyumsuzlugu retention'a zarar verir.`,
          "HIGH"
        ),
        makeLaunchItem(
          "MARKETING",
          "Rating ve review sinyalini haftalik takip et",
          `Store yorumlari ${productName} icin hem conversion hem retention sinyali verir. Tekrarlayan negatif temalari topla.`,
          "MEDIUM"
        )
      );
    }
  } else {
    launchChecklist.push(
      makeLaunchItem(
        "PRODUCT",
        "Ilk deger anini launch oncesi netlestir",
        `${productName} yayina ciktiginda ${audience} hangi ilk aksiyonla deger gordugunu anlamali.`,
        "HIGH"
      ),
      makeLaunchItem(
        "MARKETING",
        "Launch gunu mesajini ve dagitim planini hazirla",
        `Ilk trafik dalgasi geldigi anda hangi kanalda ne soylenecegi net olmali.`,
        "HIGH"
      ),
      makeLaunchItem(
        "TECH",
        "Launch sonrasi temel eventleri olcmeye hazir ol",
        `Acquisition, activation ve retention sinyallerini ilk gunden okuyabilmek icin temel eventler hazir olmali.`,
        "HIGH"
      ),
      makeLaunchItem(
        "LEGAL",
        "Kullaniciya gorunen guven ve yasal linkleri tamamla",
        `Privacy, terms ve destek kanali launch oncesi eksik kalmamali.`,
        "MEDIUM"
      )
    );
  }

  if (context.isMobile && !context.isLaunched) {
    launchChecklist.push(
      makeLaunchItem(
        "MARKETING",
        "Store listing gorsellerinin gercek urunle eslestigini kontrol et",
        `Mockup agirlikli listing yerine gercek deneyim gosteren ekranlar kullan.`,
        "MEDIUM"
      )
    );
  }

  if (context.isB2B) {
    growthChecklist.push(
      makeGrowthItem("ACQUISITION", "Ilk kaynak bazli signup veya demo takibini kur", `${productName} icin hangi kanal nitelikli talep getiriyor, bunu ayirt etmeye basla.`),
      makeGrowthItem("ACTIVATION", "Ilk faydali ekip aksiyonunu tek metrikte tanimla", `Ekip icinde gercek deger anini temsil eden ilk davranisi sec.`),
      makeGrowthItem("RETENTION", "Haftalik geri donen ekip hesabini izle", `Tek seferlik deneme ile duzenli kullanim arasindaki farki burada gorursun.`),
      makeGrowthItem("REVENUE", "Trial'dan ucretliye gecis ritmini izle", `Abonelik kararinin nerede guclendigini veya dustugunu burada anlarsin.`)
    );
  } else if (context.isContent) {
    growthChecklist.push(
      makeGrowthItem("ACQUISITION", "Icerik kanallarinin yeni signup katkisini ayir", `Hangi dagitim kanali daha verimli ilgi getiriyor, bunu sade bir setle gor.`),
      makeGrowthItem("ACTIVATION", "Ilk icerik tuketimi veya ilk kaydi activation olarak tanimla", `${audience} ilk degeri hangi davranisla goruyor, onu sabitle.`),
      makeGrowthItem("RETENTION", "Haftalik geri donen okuyucu oranini takip et", `Icerik urununde aliskanlik ritmi retention sinyalini belirler.`),
      makeGrowthItem("REVENUE", "Ucretli uye veya sponsor donusumunu izle", `Gelirin hangi icerik davranisi etrafinda toplandigini netlestir.`)
    );
  } else {
    growthChecklist.push(
      makeGrowthItem("ACQUISITION", "Ilk trafik veya install kaynagini netlestir", `Yeni kullanicilarin hangi kanaldan geldigini ayirmadan growth karari bulanir.`),
      makeGrowthItem("ACTIVATION", "Ilk deger aksiyonunu tek metrikte sabitle", `${productName} icin aha moment noktasini tek sayiyla izle.`),
      makeGrowthItem("RETENTION", "Geri donen kullanici ritmini olc", `Ilk haftada tekrar gelen kullanici davranisi urunun kaliciligini gosterir.`),
      makeGrowthItem("REVENUE", "Ucretliya gecis veya gelir ritmini izle", `Gelir davranisi acquisition kadar net okunmali.`)
    );
  }

  growthChecklist.push(
    makeGrowthItem("ACQUISITION", "Ilk kanal denemeleri icin haftalik ritim belirle", `Her hafta ayni dagitim veya kampanya setiyle sinyal toplamaya odaklan.`),
    makeGrowthItem("ACTIVATION", "Onboarding kopuslerini haftalik gozden gecir", `Ilk deger oncesi kaybedilen kullanicilar growth verimini dusurur.`),
    makeGrowthItem("RETENTION", "Ilk 7 gun aliskanlik veya tekrar kullanim sinyalini topla", `Retention buyumenin kalitesini belirler.`),
    makeGrowthItem("REVENUE", context.isSubscription ? "Paywall veya fiyatlama mesajini test et" : "Gelire giden ana aksiyonu netlestir", context.isSubscription ? "Abonelik veya freemium urunde fiyatlama vaadi dogrudan donusumu etkiler." : "Parali davranisa giden yol net degilse growth okunamaz.")
  );

  const dedupedLaunch = dedupeByTitle(launchChecklist).slice(0, 12);
  const dedupedGrowth = dedupeByTitle(growthChecklist).slice(0, 8);

  const tasks = dedupeByTitle([
    ...dedupedLaunch.slice(0, 2).map<AiTask>((item) => ({
      title: item.title,
      description: item.description,
      priority: item.priority,
      status: "TODO",
    })),
    ...dedupedGrowth.slice(0, 3).map<AiTask>((item, index) => ({
      title: item.title,
      description: item.description,
      priority: index === 0 ? "HIGH" : "MEDIUM",
      status: "TODO",
    })),
  ]).slice(0, 5);

  return {
    launchChecklist: assignOrder(dedupedLaunch),
    growthChecklist: assignOrder(dedupedGrowth),
    tasks,
  };
}

function extractGuidanceSection(skill: string) {
  const lines = skill.split("\n");
  const start = lines.findIndex((line) => line.trim() === "## Required Recommendation Areas");
  const end = lines.findIndex((line) => line.trim() === "## Output Style");
  if (start === -1) return skill;
  return lines.slice(start, end === -1 ? undefined : end).join("\n");
}

async function loadStoreGuidance(input: WizardInput) {
  const category = (input.category ?? "").toLowerCase();
  const platforms = input.mobilePlatforms ?? [];
  const stage = (input.launchStatus ?? "").toLowerCase();
  const isLaunched = ["yayında", "büyüme aşamasında"].includes(stage);
  const shouldLoadAppStore = platforms.includes("iOS") || /mobil uygulama|mobile app|ios|apple|app store/.test(category);
  const shouldLoadPlayStore = platforms.includes("Android") || /mobil uygulama|mobile app|android|google play|play store/.test(category);
  const shouldLoadAso = shouldLoadAppStore || shouldLoadPlayStore;

  const parts: string[] = [];
  if (shouldLoadAso) {
    const skill = await loadProjectSkill("aso-advisor");
    parts.push(`ASO ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  if (!isLaunched && shouldLoadAppStore) {
    const skill = await loadProjectSkill("app-store-submission-advisor");
    parts.push(`APP STORE SUBMISSION ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  if (!isLaunched && shouldLoadPlayStore) {
    const skill = await loadProjectSkill("play-store-submission-advisor");
    parts.push(`PLAY STORE SUBMISSION ADVISOR\n${extractGuidanceSection(skill)}`);
  }
  return parts.join("\n\n---\n\n");
}

async function loadLaunchAndAnalyticsGuidance(input: WizardInput) {
  const stage = (input.launchStatus ?? "").toLowerCase();
  const parts: string[] = [];

  if (!["yayında", "büyüme aşamasında"].includes(stage)) {
    const skill = await loadProjectSkill("launch-readiness-advisor");
    parts.push(`LAUNCH READINESS ADVISOR\n${extractGuidanceSection(skill)}`);
  }

  if (["yayında", "büyüme aşamasında"].includes(stage)) {
    const skill = await loadProjectSkill("analytics-instrumentation-advisor");
    parts.push(`ANALYTICS INSTRUMENTATION ADVISOR\n${extractGuidanceSection(skill)}`);
  }

  return parts.join("\n\n---\n\n");
}

const PROMPT = (input: WizardInput) => `Sen Tiramisup içindeki Founder Coach'sun. Bir kurucunun ürün bağlamını okuyup onun için gerçekten işe yarayacak ilk çalışma sistemini kuruyorsun.

ÜRÜN BİLGİLERİ:
- Ad: ${input.name}
- Açıklama: ${input.description}
- Kategori: ${input.category || "SaaS"}
- Hedef kitle: ${input.targetAudience || "belirtilmemiş"}
- İş modeli: ${input.businessModel || "belirtilmemiş"}
- Mevcut aşama: ${input.launchStatus || "belirtilmemiş"}
${input.stageContext ? `- Aşama detayları: ${input.stageContext}` : ""}
${input.storeGuidance ? `\nSTORE-GUIDANCE:\n${input.storeGuidance}\n\n${["Yayında", "Büyüme aşamasında"].includes(input.launchStatus || "") ? "Bu store rehberini submission checklist gibi degil, listing kalitesi, ASO ve buyume sinyali olarak yorumla." : "Bu store rehberini launch checklist ve gorevlerde acik, kullaniciya donuk maddelere donustur."}` : ""}
${input.websiteContent ? `\nBAGLANTI ICERIGI:\n${input.websiteContent}\n\nVerilen linklerdeki urun veya store metinlerini plana dahil et. Ozellikle yayindaki urunlerde listing vaadi ile growth onceliklerini eslestir.` : ""}

GÖREVİN:
Bu ürün için kurucunun ilk gerçek çalışma sistemini kur:
- Launch öncesi ise: kurucunun kritik checklistlerini ve bu haftaki görevlerini oluştur.
- Launch olduysa veya büyüme aşamasındaysa: growth hazırlığını kur, özellikle acquisition / activation / retention / revenue tarafında neyin önce ölçülmesi gerektiğini netleştir.
- Yayindaki mobil urunlerde App Store / Play Store submission checklist'i yazma. Bunun yerine listing kalitesi, ASO, screenshot hikayesi, rating/review sinyali ve store-page message match odagina gec.
- Kullanıcıya soru sorma. Mevcut bağlama göre karar ver.

AŞAMA BAZLI DÜŞÜN:
${input.launchStatus === "Geliştirme aşamasında" ? "Ürün yapılıyor. Beta/test kullanıcılarını bul, erken feedback topla, launch hazırlığını başlat." : ""}
${input.launchStatus === "Test kullanıcıları var" ? "Ürün test ediliyor. Feedback'i ürüne yansıt, onboarding sürtünmesini azalt, yayına hazırlık yap." : ""}
${input.launchStatus === "Yakında yayında" ? "Yayın çok yakın. Pazarlama altyapısını kur, yayın kampanyasını hazırla, ilk kullanıcı kitlesini oluştur." : ""}
${input.launchStatus === "Yayında" ? "Ürün canlıda. Müşteri edinme, aktivasyon ve ilk gelir sinyallerine odaklan." : ""}
${input.launchStatus === "Büyüme aşamasında" ? "Büyüme fazı. Ölçeklenebilir growth kanalları, retention ve gelir optimizasyonu öncelikli." : ""}

GROWTH CHECKLIST YAZARKEN:
- Acquisition: kullanıcı edinimi için ilk somut denemeleri yaz
- Activation: ilk değerli aksiyonu ve onboarding kalitesini düşün
- Retention: geri dönme ve kullanım devamlılığını düşün
- Revenue: ücretli dönüşüm ve recurring gelir mantığını düşün
- Maddeler soyut olmasın; kurucunun gerçekten uygulayabileceği eylemler yaz

Türkçe yaz. Gerçekten bu ürüne özgü şeyler söyle — "${input.name}" adını kullan. Generic tavsiye verme.

SADECE geçerli JSON döndür:

{
  "launchChecklist": [
    {
      "category": "PRODUCT" | "MARKETING" | "LEGAL" | "TECH",
      "title": "maks 65 karakter, spesifik ve aksiyonable",
      "description": "neden önemli, 1-2 cümle",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "order": 1
    }
  ],
  "growthChecklist": [
    {
      "category": "ACQUISITION" | "ACTIVATION" | "RETENTION" | "REVENUE",
      "title": "maks 65 karakter, spesifik ve aksiyonable",
      "description": "neden önemli, 1-2 cümle",
      "order": 1
    }
  ],
  "tasks": [
    {
      "title": "maks 65 karakter, bu hafta yapılacak",
      "description": "tam olarak ne yapılacak",
      "priority": "HIGH" | "MEDIUM" | "LOW",
      "status": "TODO" | "IN_PROGRESS"
    }
  ]
}

Kurallar:
- launchChecklist: 10-14 madde. PRODUCT, MARKETING, LEGAL, TECH dengeli dağıtım
- growthChecklist: 8-12 madde. ACQUISITION, ACTIVATION, RETENTION, REVENUE dengeli dağıtım
- tasks: 4-6 madde. Bu hafta başlanabilecek, spesifik işler
- Her madde "${input.name}" ürününe ve "${input.targetAudience}" kitlesine özgü olsun`;

function parsePlan(text: string): AiPlan {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  const plan: AiPlan = JSON.parse(cleaned);
  if (!plan.launchChecklist || !plan.growthChecklist || !plan.tasks) {
    throw new Error("Invalid plan structure");
  }
  return plan;
}

const QWEN_BASE_URL = "https://ws-bhoahnrg31wqikdh.eu-central-1.maas.aliyuncs.com/compatible-mode/v1";

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getQwenErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

function isQwenLimitError(error: unknown) {
  const message = getQwenErrorMessage(error).toLowerCase();
  return (
    /\b429\b/.test(message) ||
    /limit/.test(message) ||
    /quota/.test(message) ||
    /rate/.test(message) ||
    /insufficient balance/.test(message)
  );
}

function isRetryableQwenError(error: unknown) {
  const message = getQwenErrorMessage(error);
  return /\b(429|500|502|503|504)\b/.test(message) || /system error/i.test(message);
}

async function tryQwen(input: WizardInput): Promise<AiPlan> {
  const client = new OpenAI({
    apiKey: process.env.QWEN_API_KEY,
    baseURL: QWEN_BASE_URL,
  });

  let lastError: unknown;
  const maxAttempts = 6;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      const response = await client.chat.completions.create({
        model: "qwen-plus",
        messages: [{ role: "user", content: PROMPT(input) }],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });
      return parsePlan(response.choices[0]?.message?.content || "{}");
    } catch (error) {
      lastError = error;
      if (isQwenLimitError(error)) {
        throw error;
      }

      if (!isRetryableQwenError(error) || attempt === maxAttempts) {
        throw error;
      }

      await wait(Math.min(2500, 500 * attempt));
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Qwen request failed");
}

async function tryDeepSeek(input: WizardInput): Promise<AiPlan> {
  const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: "https://api.deepseek.com",
  });
  const response = await client.chat.completions.create({
    model: "deepseek-chat",
    messages: [{ role: "user", content: PROMPT(input) }],
    response_format: { type: "json_object" },
    temperature: 0.7,
  });
  return parsePlan(response.choices[0]?.message?.content || "{}");
}

async function tryGemini(input: WizardInput): Promise<AiPlan> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(PROMPT(input));
  return parsePlan(result.response.text());
}

export async function generateAiPlan(input: WizardInput): Promise<AiPlan | null> {
  const hasQwen = !!process.env.QWEN_API_KEY;
  const hasDeepSeek = !!process.env.DEEPSEEK_API_KEY;
  const hasGemini = !!process.env.GEMINI_API_KEY;

  if (!hasQwen && !hasDeepSeek && !hasGemini) {
    console.warn("[ai-plan] No AI API key configured — using static fallback");
    return null;
  }

  const storeGuidance = await loadStoreGuidance(input);
  const launchGuidance = await loadLaunchAndAnalyticsGuidance(input);

  if (hasQwen) {
    try {
      const plan = await tryQwen({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via Qwen");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.warn("[ai-plan] Qwen failed, trying DeepSeek:", (err as Error).message);
    }
  }

  if (hasDeepSeek) {
    try {
      const plan = await tryDeepSeek({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via DeepSeek");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.warn("[ai-plan] DeepSeek failed, trying Gemini:", (err as Error).message);
    }
  }

  if (hasGemini) {
    try {
      const plan = await tryGemini({
        ...input,
        storeGuidance,
        stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
      });
      console.log("[ai-plan] Generated via Gemini (fallback)");
      return mergeMobileLaunchBaseline(plan, input);
    } catch (err) {
      console.error("[ai-plan] Gemini fallback also failed:", (err as Error).message);
    }
  }

  console.warn("[ai-plan] All providers failed — using skill-backed fallback plan");
  return mergeMobileLaunchBaseline(
    buildSkillBackedFallbackPlan({
      ...input,
      storeGuidance,
      stageContext: [input.stageContext, launchGuidance].filter(Boolean).join(" "),
    }),
    input
  );
}
