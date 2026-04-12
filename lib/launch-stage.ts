export type LaunchStageKey =
  | "IDEA"
  | "BUILDING"
  | "TESTING"
  | "PREPARING"
  | "LIVE"
  | "GROWING";

export type ProductStatusKey = "PRE_LAUNCH" | "LAUNCHED" | "GROWING";

export const CANONICAL_LAUNCH_STAGE_KEYS: LaunchStageKey[] = [
  "IDEA",
  "BUILDING",
  "TESTING",
  "PREPARING",
  "LIVE",
  "GROWING",
];

const KEY_TO_TR: Record<LaunchStageKey, string> = {
  IDEA: "Fikir aşamasında",
  BUILDING: "Geliştirme aşamasında",
  TESTING: "Test kullanıcıları var",
  PREPARING: "Yakında yayında",
  LIVE: "Yayında",
  GROWING: "Büyüme aşamasında",
};

const KEY_TO_EN: Record<LaunchStageKey, string> = {
  IDEA: "Idea stage",
  BUILDING: "Building",
  TESTING: "I have test users",
  PREPARING: "Preparing for launch",
  LIVE: "Live",
  GROWING: "Growing",
};

const LEGACY_TO_KEY: Record<string, LaunchStageKey> = {
  "Fikir aşamasında": "IDEA",
  "Idea stage": "IDEA",
  Idea: "IDEA",
  "Geliştirme aşamasında": "BUILDING",
  Development: "BUILDING",
  "Test kullanıcıları var": "TESTING",
  Testing: "TESTING",
  "Yakında yayında": "PREPARING",
  "Launching soon": "PREPARING",
  "Launch prep": "PREPARING",
  "Preparing for launch": "PREPARING",
  "Yayında": "LIVE",
  Live: "LIVE",
  "Büyüme aşamasında": "GROWING",
  Growing: "GROWING",
  "Early growth": "GROWING",
};

const PRODUCT_STATUS_LABELS: Record<ProductStatusKey, { en: string; tr: string }> = {
  PRE_LAUNCH: { en: "Pre-launch", tr: "Launch hazırlığı" },
  LAUNCHED: { en: "Launched", tr: "Yayında" },
  GROWING: { en: "Growing", tr: "Büyüyor" },
};

export function normalizeLaunchStageKey(value?: string | null): LaunchStageKey | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const upper = trimmed.toUpperCase() as LaunchStageKey;
  if (upper in KEY_TO_TR) return upper;
  return LEGACY_TO_KEY[trimmed];
}

export function isCanonicalLaunchStageKey(value?: string | null): value is LaunchStageKey {
  return Boolean(value && CANONICAL_LAUNCH_STAGE_KEYS.includes(value as LaunchStageKey));
}

export function ensureCanonicalLaunchStageKey(value?: string | null): LaunchStageKey | null {
  return normalizeLaunchStageKey(value) ?? null;
}

export function canonicalLaunchStageFromProductStatus(
  status?: string | null,
): LaunchStageKey | null {
  const normalized = status?.trim().toUpperCase();
  if (normalized === "GROWING") return "GROWING";
  if (normalized === "LAUNCHED") return "LIVE";
  if (normalized === "PRE_LAUNCH") return "PREPARING";
  return null;
}

export function getLaunchStageLabel(
  value: string | null | undefined,
  locale: string = "en",
): string | null {
  if (!value) return null;
  const key = normalizeLaunchStageKey(value);
  if (!key) return value;
  return locale === "tr" ? KEY_TO_TR[key] : KEY_TO_EN[key];
}

export function deriveProductStatusFromLaunchStage(value?: string | null) {
  const key = normalizeLaunchStageKey(value);
  if (key === "GROWING") return "GROWING" as const;
  if (key === "LIVE") return "LAUNCHED" as const;
  return "PRE_LAUNCH" as const;
}

export function buildLaunchStageRepairData(input: {
  launchStatus?: string | null;
  status?: string | null;
}) {
  const canonicalLaunchStage =
    ensureCanonicalLaunchStageKey(input.launchStatus) ??
    canonicalLaunchStageFromProductStatus(input.status);

  if (!canonicalLaunchStage) return null;

  return {
    launchStatus: canonicalLaunchStage,
    status: deriveProductStatusFromLaunchStage(canonicalLaunchStage),
  };
}

export function getProductStatusLabel(
  status: ProductStatusKey | string | null | undefined,
  locale: string = "en",
): string | null {
  if (!status) return null;
  const normalized = status.toUpperCase() as ProductStatusKey;
  const labels = PRODUCT_STATUS_LABELS[normalized];
  if (!labels) return status;
  return locale === "tr" ? labels.tr : labels.en;
}

export function isLaunchedLaunchStage(value?: string | null) {
  const key = normalizeLaunchStageKey(value);
  return key === "LIVE" || key === "GROWING";
}

export function isVeryEarlyLaunchStage(value?: string | null) {
  const key = normalizeLaunchStageKey(value);
  return key === "IDEA" || key === "BUILDING" || key === "TESTING";
}
