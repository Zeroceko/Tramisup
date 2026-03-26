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

const STAGE_LABELS: Record<FunnelStageKey, string> = {
  Awareness: "Farkindalik",
  Acquisition: "Kazanım",
  Activation: "Ilk deger",
  Retention: "Geri donus",
  Referral: "Tavsiye",
  Revenue: "Gelir",
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

export function buildFunnelHealthSummary(input: {
  product: ProductShape;
  selectedMetrics: FunnelMetricDescriptor[];
  entries: MetricEntryRow[];
}): FunnelHealthSummary | null {
  const { product, selectedMetrics, entries } = input;
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
  const headline =
    overallStatus === "STRONG"
      ? "Funnel saglikli ilerliyor"
      : overallStatus === "MIXED"
        ? "Funnel'da zayif halka var"
        : "Funnel ritmi yeni olusuyor";
  const summary =
    overallStatus === "STRONG"
      ? `Tiramisup bu ${profile.label.toLowerCase()} icin ${profile.cadenceLabel} bazda yaklasik %${profile.baseTargetRate} buyume ritmini saglikli kabul ediyor. Sectigin funnel halkalarinin cogu bu ritmi yakaliyor.`
      : overallStatus === "MIXED"
        ? `Tiramisup bu ${profile.label.toLowerCase()} icin ${profile.cadenceLabel} bazda yaklasik %${profile.baseTargetRate} buyume bekliyor. Funnel'in tum halkalari ayni hizda buyumuyor; en zayif halka sonraki odagin olmali.`
        : `Tiramisup bu ${profile.label.toLowerCase()} icin ${profile.cadenceLabel} bazda yaklasik %${profile.baseTargetRate} buyume ritmi izler. Ancak henuz duzenli bir baz cizgi olusmadigi icin once biraz daha veri gerekir.`;
  const nextFocus =
    nextFocusStage.status === "AT_RISK"
      ? `${nextFocusStage.stageLabel} halkasi hedefin gerisinde. Bir sonraki odak burada donusumu veya buyume hizini guclendirmek olmali.`
      : nextFocusStage.status === "NEEDS_BASELINE"
        ? `${nextFocusStage.stageLabel} halkasi icin henuz yeterli ${profile.cadenceLabel} veri yok. Tiramisup bu halkayi net okuyabilmek icin ritmi tamamlamani bekliyor.`
        : `${nextFocusStage.stageLabel} halkasi iyi gorunuyor. Simdi funnel'in sonraki asamasini ayni ritimde tutmaya odaklan.`;

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
