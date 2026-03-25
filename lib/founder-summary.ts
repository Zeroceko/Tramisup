import type { AiPlan, WizardInput } from "@/lib/ai-plan";
import { getMetricContext, type MetricSnapshot } from "@/lib/metric-context";

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
  const categories = splitList(input.category);
  const audiences = splitList(input.targetAudience);
  const platforms = input.mobilePlatforms ?? [];
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
    categories.length ? `${input.name} şu anda ${toNaturalList(categories)} bağlamında konumlanıyor.` : null,
    audiences.length ? `Ana hedef kitle ${toNaturalList(audiences)} olarak netleşmiş durumda.` : null,
    platforms.length ? `Mobil dağıtım hedefi ${toNaturalList(platforms)} için ayrıca hazırlandı.` : null,
    input.businessModel ? `Gelir modeli ${input.businessModel.toLowerCase()} tarafında tanımlı.` : null,
    // Data-driven strengths
    metricSnapshot?.latestMrr != null
      ? `Aylık tekrarlayan gelir (MRR) ${metricSnapshot.latestMrr.toLocaleString("tr-TR")}$ seviyesinde.`
      : null,
    metricSnapshot?.latestDau != null
      ? `Günlük ${metricSnapshot.latestDau.toLocaleString("tr-TR")} aktif kullanıcı mevcut.`
      : null,
    connectedIntegrations.length > 0
      ? `${toNaturalList(connectedIntegrations)} entegrasyonu bağlı ve veri akışı aktif.`
      : null,
  ].filter(Boolean) as string[];

  // ── Focus Areas ──────────────────────────────────────────────────────────
  let focusAreas: string[];

  if (isLaunched && metricSnapshot) {
    // Data-driven focus areas when real metrics exist
    const dataFocusAreas: string[] = [];

    if (metricSnapshot.mrrTrend === "down") {
      dataFocusAreas.push("MRR düşüş trendinde — churn nedenlerini araştır ve iptalleri analiz et.");
    }
    if (metricSnapshot.dauTrend === "down") {
      dataFocusAreas.push("DAU düşüyor — retention veya activation akışını incele.");
    }
    if (metricSnapshot.latestChurnedUsers != null && metricSnapshot.latestChurnedUsers > 0) {
      dataFocusAreas.push(`Son dönemde ${metricSnapshot.latestChurnedUsers} kullanıcı iptal etmiş — neden analizi yap.`);
    }
    if (connectedIntegrations.length === 0) {
      dataFocusAreas.push("Stripe veya GA4 bağlayarak metrik akışını otomatikleştir.");
    }

    // Fill remaining slots with growth items
    const remaining = 3 - dataFocusAreas.length;
    if (remaining > 0 && growthItems.length > 0) {
      dataFocusAreas.push(...growthItems.slice(0, remaining));
    }

    focusAreas = dataFocusAreas.length > 0 ? dataFocusAreas : (growthItems.length
      ? growthItems
      : [
        "İlk takip edeceğin acquisition ve activation metriklerini seç.",
        "Metrik setup'tan sonra ilk günlük veri girişini başlat.",
      ]);
  } else if (isLaunched) {
    focusAreas = growthItems.length
      ? growthItems
      : [
        "İlk takip edeceğin acquisition ve activation metriklerini seç.",
        "Metrik setup'tan sonra ilk günlük veri girişini başlat.",
      ];
  } else {
    focusAreas = launchItems.length
      ? launchItems
      : [
        "İlk launch hazırlık maddelerini kapat.",
        "Bu haftaki en kritik işe odaklan.",
      ];
  }

  // ── Next Step ────────────────────────────────────────────────────────────
  let nextStep: string;

  if (isLaunched && metricSnapshot) {
    // Data-driven next step
    if (metricSnapshot.mrrTrend === "down") {
      nextStep = "Öncelikli görev: Churn nedenini tespit et. Stripe verilerinden iptal eden kullanıcıları incele.";
    } else if (metricSnapshot.dauTrend === "down") {
      nextStep = "Kullanıcı aktivasyonu düşüyor. Onboarding akışını ve ilk-değer-anını gözden geçir.";
    } else if (connectedIntegrations.length === 0) {
      nextStep = "Entegrasyon sayfasından Stripe veya GA4 bağla — veriler otomatik aksın.";
    } else {
      nextStep = "Metrikler stabil. Bir sonraki AARRR kategorisinde hedef belirle.";
    }
  } else if (isLaunched) {
    nextStep = "Growth setup ekranında her kategori için tek ana metrik seç.";
  } else if (platforms.length) {
    nextStep = "Pre-launch ekranında App Store ve Google Play gereksinimlerini kritik maddelerle birlikte kapat.";
  } else {
    nextStep = "Pre-launch ekranında ilk kritik hazırlık maddelerine başla.";
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  let summary: string;

  if (isLaunched && metricSnapshot) {
    const parts: string[] = [`${input.name} yayında ve veriler akıyor.`];
    if (metricSnapshot.latestMrr != null) {
      parts.push(`MRR: ${metricSnapshot.latestMrr.toLocaleString("tr-TR")}$.`);
    }
    if (metricSnapshot.latestDau != null) {
      parts.push(`DAU: ${metricSnapshot.latestDau.toLocaleString("tr-TR")}.`);
    }
    parts.push("Tiramisup bu verilere bakarak sana veri odaklı büyüme tavsiyeleri sunacak.");
    summary = parts.join(" ");
  } else if (isLaunched) {
    summary = `${input.name}, yayındaki ürün yolculuğuna geçmiş durumda. Tiramisup önce neyi ölçeceğini netleştirip büyümeyi sakin ve veri odaklı bir sırayla kurmanı önerecek.`;
  } else {
    summary = `${input.name}, henüz hazırlık tarafında. Tiramisup ilk çalışma sistemini ürün anlatımına göre kurup seni dağılmadan bir sonraki doğru adıma taşıyacak.`;
  }

  return {
    headline: `${input.name} için Tiramisup özeti`,
    summary,
    nextStep,
    strengths: strengths.slice(0, 4),
    focusAreas: [...focusAreas, ...tasks].slice(0, 4),
    metricSnapshot,
    connectedIntegrations,
  };
}
