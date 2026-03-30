export type GrowthWorkspaceStepKey =
  | "SETUP_METRICS"
  | "ENTER_FIRST_VALUES"
  | "DEFINE_GOAL"
  | "ADVANCE_CHECKLIST"
  | "REVIEW_WITH_COACH";

export type GrowthWorkspaceStepInput = {
  hasSetup: boolean;
  hasMetricEntries: boolean;
  hasGoals: boolean;
  completedGrowthItems: number;
  totalGrowthItems: number;
  locale?: string;
};

export type GrowthWorkspaceStep = {
  key: GrowthWorkspaceStepKey;
  title: string;
  description: string;
  cta: string;
  href: string;
};

export function getGrowthWorkspaceStep(
  input: GrowthWorkspaceStepInput
): GrowthWorkspaceStep {
  const { hasSetup, hasMetricEntries, hasGoals, completedGrowthItems, totalGrowthItems, locale = "en" } = input;
  const isEn = locale === "en";

  if (!hasSetup) {
    return {
      key: "SETUP_METRICS",
      title: isEn
        ? "Choose which signals to track first"
        : "Önce hangi sayıları takip edeceğini seç",
      description: isEn
        ? "Before optimization, Growth needs a clear metric setup so recommendations are grounded in real signals."
        : "Growth tarafında ilk iş optimizasyon değil, hangi metriklerle karar vereceğini netleştirmek.",
      href: `/${locale}/metrics`,
      cta: isEn ? "Open metric setup" : "Metrik setup'ını tamamla",
    };
  }

  if (!hasMetricEntries) {
    return {
      key: "ENTER_FIRST_VALUES",
      title: isEn ? "Enter your first real values" : "Şimdi ilk günlük veri girişini yap",
      description: isEn
        ? "Your metric setup is ready. The next clear step is entering the first real numbers on the Metrics screen."
        : "Metrik setup hazır. Bir sonraki net adım metrics ekranında seçtiğin sayılar için ilk gerçek değerleri girmek.",
      href: `/${locale}/metrics`,
      cta: isEn ? "Go to Metrics" : "Metrik girişine git",
    };
  }

  if (!hasGoals) {
    return {
      key: "DEFINE_GOAL",
      title: isEn ? "Set your first target" : "Şimdi ilk hedef değerini tanımla",
      description: isEn
        ? "You know what you track now. The next step is defining the numeric outcome you want to reach."
        : "Artık neyi takip ettiğini biliyorsun. Sıradaki iş, hangi sonuca ulaşmak istediğini sayı olarak netleştirmek.",
      href: "#goals",
      cta: isEn ? "Jump to goals" : "Hedef alanına in",
    };
  }

  if (totalGrowthItems > 0 && completedGrowthItems < totalGrowthItems) {
    return {
      key: "ADVANCE_CHECKLIST",
      title: isEn ? "Advance your growth checklist" : "Şimdi growth checklist'ini ilerlet",
      description: isEn
        ? "Data and direction are in place. Now move into the operational growth work that should actually shift the metric."
        : "Veri girişi ve hedef yönü hazır. Bu aşamada metriği gerçekten hareket ettirecek operasyonel growth işlerine dönüyoruz.",
      href: "#growth-checklist",
      cta: isEn ? "Open checklist" : "Checklist'e dön",
    };
  }

  return {
    key: "REVIEW_WITH_COACH",
    title: isEn ? "Focus on Tiramisup's next move" : "Şimdi Tiramisup önerisine göre odaklan",
    description: isEn
      ? "The core setup is in place. Now choose the move most likely to shift today's metric."
      : "Temel setup ve execution yüzeyi oturdu. Sıradaki iş, hangi hamlenin bugünkü metriği oynatacağını seçmek.",
    href: "#coach",
    cta: isEn ? "View coach insight" : "Koç önerisini gör",
  };
}
