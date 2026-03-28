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

  if (!hasSetup) {
    return {
      key: "SETUP_METRICS",
      title: "Önce hangi sayıları takip edeceğini seç",
      description:
        "Growth tarafında ilk iş optimizasyon değil, hangi metriklerle karar vereceğini netleştirmek.",
      href: `/${locale}/growth`,
      cta: "Metrik setup'ını tamamla",
    };
  }

  if (!hasMetricEntries) {
    return {
      key: "ENTER_FIRST_VALUES",
      title: "Şimdi ilk günlük veri girişini yap",
      description:
        "Metrik setup hazır. Bir sonraki net adım metrics ekranında seçtiğin sayılar için ilk gerçek değerleri girmek.",
      href: `/${locale}/metrics`,
      cta: "Metrik girişine git",
    };
  }

  if (!hasGoals) {
    return {
      key: "DEFINE_GOAL",
      title: "Şimdi ilk hedef değerini tanımla",
      description:
        "Artık neyi takip ettiğini biliyorsun. Sıradaki iş, hangi sonuca ulaşmak istediğini sayı olarak netleştirmek.",
      href: "#goals",
      cta: "Hedef alanına in",
    };
  }

  if (totalGrowthItems > 0 && completedGrowthItems < totalGrowthItems) {
    return {
      key: "ADVANCE_CHECKLIST",
      title: "Şimdi growth checklist'ini ilerlet",
      description:
        "Veri girişi ve hedef yönü hazır. Bu aşamada metriği gerçekten hareket ettirecek operasyonel growth işlerine dönüyoruz.",
      href: "#growth-checklist",
      cta: "Checklist'e dön",
    };
  }

  return {
    key: "REVIEW_WITH_COACH",
    title: "Şimdi Tiramisup önerisine göre odaklan",
    description:
      "Temel setup ve execution yüzeyi oturdu. Sıradaki iş, hangi hamlenin bugünkü metriği oynatacağını seçmek.",
    href: "#coach",
    cta: "Koç önerisini gör",
  };
}
