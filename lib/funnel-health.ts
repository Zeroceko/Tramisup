import type { FunnelStageKey, MetricEntryRow } from "@/lib/metric-setup";

export type FunnelMetricDescriptor = {
  stage: FunnelStageKey;
  metricKey: string;
  metricName: string;
};

export type FunnelStageHealth = {
  stage: FunnelStageKey;
  stageLabel: string;
  metricName: string;
  currentValue: number | null;
  baselineValue: number | null;
  growthRate: number | null;
  targetRate: number;
  conversionFromPrevious: number | null;
  status: "AHEAD" | "ON_TRACK" | "AT_RISK" | "NEEDS_BASELINE";
};

export type FunnelHealthSummary = {
  profileLabel: string;
  cadenceLabel: string;
  cadenceDays: number;
  baseTargetRate: number;
  overallStatus: "STRONG" | "MIXED" | "EARLY";
  headline: string;
  summary: string;
  nextFocus: string;
  stages: FunnelStageHealth[];
};

type ProductShape = {
  category?: string | null;
  targetAudience?: string | null;
  businessModel?: string | null;
  description?: string | null;
  website?: string | null;
};

const STAGE_ORDER: FunnelStageKey[] = [
  "Awareness",
  "Acquisition",
  "Activation",
  "Retention",
  "Referral",
  "Revenue",
];

const STAGE_LABELS_TR: Record<FunnelStageKey, string> = {
  Awareness: "Farkındalık",
  Acquisition: "Edinim",
  Activation: "İlk değer",
  Retention: "Geri dönüş",
  Referral: "Tavsiye",
  Revenue: "Gelir",
};

const STAGE_LABELS_EN: Record<FunnelStageKey, string> = {
  Awareness: "Awareness",
  Acquisition: "Acquisition",
  Activation: "Activation",
  Retention: "Retention",
  Referral: "Referral",
  Revenue: "Revenue",
};

const STAGE_TARGET_MULTIPLIERS: Record<FunnelStageKey, number> = {
  Awareness: 1,
  Acquisition: 1,
  Activation: 0.9,
  Retention: 0.7,
  Referral: 0.6,
  Revenue: 0.8,
};

function inferProfile(product: ProductShape) {
  const haystack = `${product.category ?? ""} ${product.targetAudience ?? ""} ${product.businessModel ?? ""} ${product.description ?? ""} ${product.website ?? ""}`.toLowerCase();

  if (/ios|android|mobil uygulama|mobile app|app store|play store/.test(haystack)) {
    return {
      label: "Mobil urun",
      cadenceLabel: "haftalik",
      cadenceDays: 7,
      baseTargetRate: 5,
    };
  }

  if (/content|newsletter|media|creator|community|blog/.test(haystack)) {
    return {
      label: "Icerik ve topluluk urunu",
      cadenceLabel: "haftalik",
      cadenceDays: 7,
      baseTargetRate: 6,
    };
  }

  if (/team|teams|business|b2b|saas|company|startup|ekip|isletme|workspace|dashboard/.test(haystack)) {
    return {
      label: "B2B SaaS",
      cadenceLabel: "aylik",
      cadenceDays: 30,
      baseTargetRate: 5,
    };
  }

  if (/subscription|abonelik|consumer|b2c|lifestyle|habit|fitness/.test(haystack)) {
    return {
      label: "Tuketici abonelik urunu",
      cadenceLabel: "haftalik",
      cadenceDays: 7,
      baseTargetRate: 5,
    };
  }

  return {
    label: "Genel dijital urun",
    cadenceLabel: "aylik",
    cadenceDays: 30,
    baseTargetRate: 5,
  };
}

function round(value: number, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function pickBaselineEntry(entries: MetricEntryRow[], cadenceDays: number) {
  if (entries.length < 2) return null;

  const latestEntry = entries[entries.length - 1];
  const latestDate = new Date(latestEntry.date);
  const targetTime = latestDate.getTime() - cadenceDays * 24 * 60 * 60 * 1000;

  for (let index = entries.length - 2; index >= 0; index -= 1) {
    const entry = entries[index];
    const entryTime = new Date(entry.date).getTime();
    if (entryTime <= targetTime) {
      return entry;
    }
  }

  return entries[entries.length - 2] ?? null;
}

function formatNum(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function buildFunnelHealthSummary(input: {
  product: ProductShape;
  selectedMetrics: FunnelMetricDescriptor[];
  entries: MetricEntryRow[];
  locale?: string;
}): FunnelHealthSummary | null {
  const { product, selectedMetrics, entries, locale = "tr" } = input;
  const isEn = locale === "en";
  const STAGE_LABELS = isEn ? STAGE_LABELS_EN : STAGE_LABELS_TR;
  if (selectedMetrics.length === 0) return null;

  const profile = inferProfile(product);
  const latestEntry = entries[entries.length - 1] ?? null;
  const baselineEntry = pickBaselineEntry(entries, profile.cadenceDays);

  const stages = STAGE_ORDER
    .map((stage) => {
      const metric = selectedMetrics.find((item) => item.stage === stage);
      if (!metric) return null;

      const currentValue = latestEntry?.values?.[stage] ?? null;
      const baselineValue = baselineEntry?.values?.[stage] ?? null;
      const previousStage = STAGE_ORDER[STAGE_ORDER.indexOf(stage) - 1];
      const previousStageValue = previousStage
        ? latestEntry?.values?.[previousStage] ?? null
        : null;
      const conversionFromPrevious =
        currentValue != null && previousStageValue != null && previousStageValue > 0
          ? round((currentValue / previousStageValue) * 100, 1)
          : null;
      const targetRate = round(
        profile.baseTargetRate * STAGE_TARGET_MULTIPLIERS[stage],
        1
      );
      const growthRate =
        currentValue != null && baselineValue != null && baselineValue > 0
          ? round(((currentValue - baselineValue) / baselineValue) * 100, 1)
          : null;

      let status: FunnelStageHealth["status"] = "NEEDS_BASELINE";
      if (growthRate != null) {
        if (growthRate >= targetRate) {
          status = "AHEAD";
        } else if (growthRate >= targetRate * 0.6 || growthRate >= 2) {
          status = "ON_TRACK";
        } else {
          status = "AT_RISK";
        }
      }

      return {
        stage,
        stageLabel: STAGE_LABELS[stage],
        metricName: metric.metricName,
        currentValue,
        baselineValue,
        growthRate,
        targetRate,
        conversionFromPrevious,
        status,
      } satisfies FunnelStageHealth;
    })
    .filter(Boolean) as FunnelStageHealth[];

  if (stages.length === 0) return null;

  const measurableStages = stages.filter((stage) => stage.growthRate != null);
  const aheadOrOnTrack = measurableStages.filter(
    (stage) => stage.status === "AHEAD" || stage.status === "ON_TRACK"
  ).length;
  const atRiskStage = measurableStages.find((stage) => stage.status === "AT_RISK");
  const baselineNeededStage = stages.find((stage) => stage.status === "NEEDS_BASELINE");

  let overallStatus: FunnelHealthSummary["overallStatus"] = "EARLY";
  if (measurableStages.length > 0) {
    overallStatus =
      aheadOrOnTrack >= Math.ceil(measurableStages.length / 2) ? "STRONG" : "MIXED";
  }

  const nextFocusStage = atRiskStage ?? baselineNeededStage ?? stages[0];

  // Build data-aware next focus text — include actual metric values when available
  function buildNextFocus(stage: FunnelStageHealth): string {
    const label = stage.stageLabel;
    const metric = stage.metricName;
    const cur = stage.currentValue;
    const base = stage.baselineValue;
    const rate = stage.growthRate;

    if (stage.status === "AT_RISK") {
      if (cur != null && base != null && rate != null) {
        const direction = rate < 0 ? (isEn ? "dropped" : "düştü") : (isEn ? "grew" : "büyüdü");
        const sign = rate >= 0 ? "+" : "";
        if (isEn) {
          return `${label}: ${metric} ${direction} from ${formatNum(base)} to ${formatNum(cur)} (${sign}${rate}% vs target +${stage.targetRate}%). This is the current weak link — investigate what changed in this stage.`;
        }
        return `${label}: ${metric} ${formatNum(base)}'den ${formatNum(cur)}'e ${direction} (%${sign}${rate}, hedef %+${stage.targetRate}). Şu anki zayıf halka bu — bu aşamada neyin değiştiğini araştır.`;
      }
      if (isEn) {
        return `${label} is below target. This is the weakest link right now — focus here before expanding other areas.`;
      }
      return `${label} hedefin gerisinde. Şu anki zayıf halka bu — diğer alanlara genişlemeden önce buraya odaklan.`;
    }

    if (stage.status === "NEEDS_BASELINE") {
      if (isEn) {
        return `${label} (${metric}) doesn't have enough data yet for a ${profile.cadenceLabel} comparison. Keep entering values so the system can read this stage clearly.`;
      }
      return `${label} (${metric}) için henüz ${profile.cadenceLabel} karşılaştırma yapacak kadar veri yok. Sistemi net okuyabilmek için değer girmeye devam et.`;
    }

    if (cur != null && base != null && rate != null) {
      const sign = rate >= 0 ? "+" : "";
      if (isEn) {
        return `${label} is performing well (${metric}: ${formatNum(base)} → ${formatNum(cur)}, ${sign}${rate}%). Keep the rhythm and watch the next stage in the funnel.`;
      }
      return `${label} iyi görünüyor (${metric}: ${formatNum(base)} → ${formatNum(cur)}, %${sign}${rate}). Ritmi koru, funnel'ın bir sonraki aşamasını takipte tut.`;
    }

    if (isEn) {
      return `${label} is on track. Focus on maintaining the current rhythm and watch for any early dips.`;
    }
    return `${label} yolunda. Mevcut ritmi korumaya odaklan ve erken düşüşleri yakından izle.`;
  }

  const nextFocus = buildNextFocus(nextFocusStage);

  const headline = isEn
    ? overallStatus === "STRONG"
      ? "Funnel is performing well"
      : overallStatus === "MIXED"
        ? "Weak link detected in funnel"
        : "Funnel rhythm is still forming"
    : overallStatus === "STRONG"
      ? "Funnel sağlıklı ilerliyor"
      : overallStatus === "MIXED"
        ? "Funnel'da zayıf halka var"
        : "Funnel ritmi henüz oluşuyor";

  const profileLabelDisplay = profile.label;
  const summary = isEn
    ? overallStatus === "STRONG"
      ? `For a ${profileLabelDisplay.toLowerCase()}, Tiramisup targets roughly ${profile.baseTargetRate}% ${profile.cadenceLabel} growth. Most of your tracked funnel stages are hitting or beating that rhythm.`
      : overallStatus === "MIXED"
        ? `For a ${profileLabelDisplay.toLowerCase()}, Tiramisup targets roughly ${profile.baseTargetRate}% ${profile.cadenceLabel} growth. Not all funnel stages are moving at the same rate — the weakest link should be the next focus.`
        : `For a ${profileLabelDisplay.toLowerCase()}, Tiramisup tracks roughly ${profile.baseTargetRate}% ${profile.cadenceLabel} growth. There isn't a stable baseline yet — keep entering data to get a clearer read.`
    : overallStatus === "STRONG"
      ? `Tiramisup, bu ${profileLabelDisplay.toLowerCase()} için ${profile.cadenceLabel} bazda yaklaşık %${profile.baseTargetRate} büyüme ritmini sağlıklı kabul ediyor. Seçtiğin funnel halkalarının çoğu bu ritmi yakalıyor.`
      : overallStatus === "MIXED"
        ? `Tiramisup, bu ${profileLabelDisplay.toLowerCase()} için ${profile.cadenceLabel} bazda yaklaşık %${profile.baseTargetRate} büyüme bekliyor. Funnel'ın tüm halkaları aynı hızda büyümüyor; en zayıf halka sonraki odağın olmalı.`
        : `Tiramisup, bu ${profileLabelDisplay.toLowerCase()} için ${profile.cadenceLabel} bazda yaklaşık %${profile.baseTargetRate} büyüme ritmi izler. Ancak henüz düzenli bir baz çizgi oluşmadığı için önce biraz daha veri gerekir.`;

  return {
    profileLabel: profile.label,
    cadenceLabel: profile.cadenceLabel,
    cadenceDays: profile.cadenceDays,
    baseTargetRate: profile.baseTargetRate,
    overallStatus,
    headline,
    summary,
    nextFocus,
    stages,
  };
}
