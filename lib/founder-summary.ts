import type { AiPlan, WizardInput } from "@/lib/ai-plan";
import { getMetricContext, type MetricSnapshot } from "@/lib/metric-context";
import { tasksAreNearDuplicate } from "@/lib/task-parsing";

export type FounderSummary = {
  headline: string;
  summary: string;
  nextStep: string;
  strengths: string[];
  focusAreas: string[];
  metricSnapshot: MetricSnapshot | null;
  connectedIntegrations: string[];
};

function splitList(value?: string) {
  return value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean) ?? [];
}

function toNaturalList(items: string[]) {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} ve ${items[1]}`;
  return `${items.slice(0, -1).join(", ")} ve ${items[items.length - 1]}`;
}

function pick(locale: string | undefined, en: string, tr: string) {
  return locale === "en" ? en : tr;
}

function getMobilePlatforms(platforms: string[]) {
  return platforms.filter((platform) => ["iOS", "Android"].includes(platform));
}

/**
 * Builds a founder summary enriched with real metric data from the database.
 * When called during product creation (no productId yet), it operates in
 * static-only mode. When called with a productId, it fetches live metrics.
 */
export async function buildFounderSummary(
  input: WizardInput,
  aiPlan: AiPlan | null,
  productId?: string
): Promise<FounderSummary> {
  const locale = input.locale;
  const categories = splitList(input.category);
  const audiences = splitList(input.targetAudience);
  const platforms = input.mobilePlatforms ?? [];
  const mobilePlatforms = getMobilePlatforms(platforms);
  const launchItems = aiPlan?.launchChecklist.slice(0, 2).map((item) => item.title) ?? [];
  const growthItems = aiPlan?.growthChecklist.slice(0, 2).map((item) => item.title) ?? [];
  const tasks = aiPlan?.tasks.slice(0, 2).map((item) => item.title) ?? [];
  const isLaunched = ["Yayında", "Büyüme aşamasında"].includes(input.launchStatus ?? "");

  // ── Metric injection (only when productId is available) ──────────────────
  let metricSnapshot: MetricSnapshot | null = null;
  let connectedIntegrations: string[] = [];

  if (productId) {
    try {
      const ctx = await getMetricContext(productId);
      metricSnapshot = ctx.snapshot;
      connectedIntegrations = ctx.integrations;
    } catch (err) {
      console.warn("[founder-summary] Metric context fetch failed, continuing without data:", err);
    }
  }

  // ── Strengths ────────────────────────────────────────────────────────────
  const strengths = [
    categories.length
      ? pick(locale, `${input.name} is currently positioned in the ${toNaturalList(categories)} context.`, `${input.name} şu anda ${toNaturalList(categories)} bağlamında konumlanıyor.`)
      : null,
    audiences.length
      ? pick(locale, `The primary audience is clearly defined as ${toNaturalList(audiences)}.`, `Ana hedef kitle ${toNaturalList(audiences)} olarak netleşmiş durumda.`)
      : null,
    mobilePlatforms.length
      ? pick(locale, `Mobile distribution is also prepared for ${toNaturalList(mobilePlatforms)}.`, `Mobil dağıtım hedefi ${toNaturalList(mobilePlatforms)} için ayrıca hazırlandı.`)
      : null,
    input.businessModel
      ? pick(locale, `The revenue model is defined as ${input.businessModel.toLowerCase()}.`, `Gelir modeli ${input.businessModel.toLowerCase()} tarafında tanımlı.`)
      : null,
    // Data-driven strengths
    metricSnapshot?.latestMrr != null
      ? pick(locale, `Monthly recurring revenue (MRR) is at ${metricSnapshot.latestMrr.toLocaleString(locale === "en" ? "en-US" : "tr-TR")}$`, `Aylık tekrarlayan gelir (MRR) ${metricSnapshot.latestMrr.toLocaleString("tr-TR")}$ seviyesinde.`)
      : null,
    metricSnapshot?.latestDau != null
      ? pick(locale, `There are ${metricSnapshot.latestDau.toLocaleString(locale === "en" ? "en-US" : "tr-TR")} daily active users.`, `Günlük ${metricSnapshot.latestDau.toLocaleString("tr-TR")} aktif kullanıcı mevcut.`)
      : null,
    connectedIntegrations.length > 0
      ? pick(locale, `${toNaturalList(connectedIntegrations)} integration is connected and data is flowing.`, `${toNaturalList(connectedIntegrations)} entegrasyonu bağlı ve veri akışı aktif.`)
      : null,
  ].filter(Boolean) as string[];

  // ── Focus Areas ──────────────────────────────────────────────────────────
  let focusAreas: string[];

  if (isLaunched && metricSnapshot) {
    // Data-driven focus areas when real metrics exist
    const dataFocusAreas: string[] = [];

    if (metricSnapshot.mrrTrend === "down") {
      dataFocusAreas.push(pick(locale, "MRR is trending down. Investigate churn causes and review cancellations.", "MRR düşüş trendinde — churn nedenlerini araştır ve iptalleri analiz et."));
    }
    if (metricSnapshot.dauTrend === "down") {
      dataFocusAreas.push(pick(locale, "DAU is falling. Review retention and activation flow.", "DAU düşüyor — retention veya activation akışını incele."));
    }
    if (metricSnapshot.latestChurnedUsers != null && metricSnapshot.latestChurnedUsers > 0) {
      dataFocusAreas.push(pick(locale, `${metricSnapshot.latestChurnedUsers} users cancelled recently. Review the reasons behind churn.`, `Son dönemde ${metricSnapshot.latestChurnedUsers} kullanıcı iptal etmiş — neden analizi yap.`));
    }
    if (connectedIntegrations.length === 0) {
      dataFocusAreas.push(pick(locale, "Connect Stripe or GA4 to automate metric flow.", "Stripe veya GA4 bağlayarak metrik akışını otomatikleştir."));
    }

    // Fill remaining slots with growth items
    const remaining = 3 - dataFocusAreas.length;
    if (remaining > 0 && growthItems.length > 0) {
      dataFocusAreas.push(...growthItems.slice(0, remaining));
    }

    focusAreas = dataFocusAreas.length > 0 ? dataFocusAreas : (growthItems.length
      ? growthItems
      : [
        pick(locale, "Choose the first acquisition and activation metrics you want to track.", "İlk takip edeceğin acquisition ve activation metriklerini seç."),
        pick(locale, "Start the first daily metric entry after setup.", "Metrik setup'tan sonra ilk günlük veri girişini başlat."),
      ]);
  } else if (isLaunched) {
    focusAreas = growthItems.length
      ? growthItems
      : [
        pick(locale, "Choose the first acquisition and activation metrics you want to track.", "İlk takip edeceğin acquisition ve activation metriklerini seç."),
        pick(locale, "Start the first daily metric entry after setup.", "Metrik setup'tan sonra ilk günlük veri girişini başlat."),
      ];
  } else {
    focusAreas = launchItems.length
      ? launchItems
      : [
        pick(locale, "Close the first launch-readiness items.", "İlk launch hazırlık maddelerini kapat."),
        pick(locale, "Focus on the most critical job this week.", "Bu haftaki en kritik işe odaklan."),
      ];
  }

  // ── Next Step ────────────────────────────────────────────────────────────
  let nextStep: string;

  if (isLaunched && metricSnapshot) {
    // Data-driven next step
    if (metricSnapshot.mrrTrend === "down") {
      nextStep = pick(locale, "Priority task: identify why users churn. Review cancellations from Stripe data.", "Öncelikli görev: Churn nedenini tespit et. Stripe verilerinden iptal eden kullanıcıları incele.");
    } else if (metricSnapshot.dauTrend === "down") {
      nextStep = pick(locale, "User activation is declining. Review onboarding and the first-value moment.", "Kullanıcı aktivasyonu düşüyor. Onboarding akışını ve ilk-değer-anını gözden geçir.");
    } else if (connectedIntegrations.length === 0) {
      nextStep = pick(locale, "Connect Stripe or GA4 from the integrations page so data can flow automatically.", "Entegrasyon sayfasından Stripe veya GA4 bağla — veriler otomatik aksın.");
    } else {
      nextStep = pick(locale, "Metrics look stable. Define a target in the next AARRR stage.", "Metrikler stabil. Bir sonraki AARRR kategorisinde hedef belirle.");
    }
  } else if (isLaunched) {
    nextStep = pick(locale, "Choose one core metric for each category on the Growth setup screen.", "Growth setup ekranında her kategori için tek ana metrik seç.");
  } else if (mobilePlatforms.length) {
    nextStep = pick(locale, "On the pre-launch screen, close the App Store and Google Play requirements with the critical checklist items.", "Pre-launch ekranında App Store ve Google Play gereksinimlerini kritik maddelerle birlikte kapat.");
  } else {
    nextStep = pick(locale, "Start with the first critical prep items on the pre-launch screen.", "Pre-launch ekranında ilk kritik hazırlık maddelerine başla.");
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  let summary: string;

  if (isLaunched && metricSnapshot) {
    const parts: string[] = [`${input.name} yayında ve veriler akıyor.`];
    if (metricSnapshot.latestMrr != null) {
      parts.push(`MRR: ${metricSnapshot.latestMrr.toLocaleString(locale === "en" ? "en-US" : "tr-TR")}$.`);
    }
    if (metricSnapshot.latestDau != null) {
      parts.push(`DAU: ${metricSnapshot.latestDau.toLocaleString(locale === "en" ? "en-US" : "tr-TR")}.`);
    }
    parts.push(pick(locale, "Tiramisup will use this data to suggest data-driven growth moves.", "Tiramisup bu verilere bakarak sana veri odaklı büyüme tavsiyeleri sunacak."));
    summary = parts.join(" ");
  } else if (isLaunched) {
    summary = pick(
      locale,
      `${input.name} is already live. Tiramisup will first clarify what to measure, then help you build growth in a calmer, data-led order.`,
      `${input.name}, yayındaki ürün yolculuğuna geçmiş durumda. Tiramisup önce neyi ölçeceğini netleştirip büyümeyi sakin ve veri odaklı bir sırayla kurmanı önerecek.`
    );
  } else {
    summary = pick(
      locale,
      `${input.name} is still in preparation mode. Tiramisup will shape the first working system from your product description and move you toward the next correct step without scattering your focus.`,
      `${input.name}, henüz hazırlık tarafında. Tiramisup ilk çalışma sistemini ürün anlatımına göre kurup seni dağılmadan bir sonraki doğru adıma taşıyacak.`
    );
  }

  // Dedupe focus areas: merge focusAreas + tasks, remove near-duplicates
  const rawFocusAreas = [...focusAreas, ...tasks];
  const dedupedFocusAreas: string[] = [];
  for (const item of rawFocusAreas) {
    if (!item?.trim()) continue;
    const isDuplicate = dedupedFocusAreas.some((existing) =>
      tasksAreNearDuplicate(existing, item)
    );
    if (!isDuplicate) dedupedFocusAreas.push(item);
  }

  return {
    headline: pick(locale, `Tiramisup summary for ${input.name}`, `${input.name} için Tiramisup özeti`),
    summary,
    nextStep,
    strengths: strengths.slice(0, 4),
    focusAreas: dedupedFocusAreas.slice(0, 4),
    metricSnapshot,
    connectedIntegrations,
  };
}
