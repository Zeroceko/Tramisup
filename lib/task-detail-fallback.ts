type TaskDetailInput = {
  title: string;
  category?: string | null;
  linkedChecklistTitle?: string | null;
  locale?: string;
};

function lowerTitle(title: string, locale: string) {
  return title.charAt(0).toLocaleLowerCase(locale) + title.slice(1);
}

function getDomainLabel(category: string | null | undefined, locale: string) {
  const isEn = locale === "en";
  const labels: Record<string, { en: string; tr: string }> = {
    PRODUCT: { en: "product experience", tr: "ürün deneyimi" },
    TECH: { en: "technical readiness", tr: "teknik hazırlık" },
    LEGAL: { en: "compliance and trust", tr: "uyumluluk ve güven" },
    MARKETING: { en: "launch messaging", tr: "launch mesajı" },
    ACQUISITION: { en: "acquisition funnel", tr: "edinim hunisi" },
    ACTIVATION: { en: "activation flow", tr: "aktivasyon akışı" },
    RETENTION: { en: "retention loop", tr: "retention döngüsü" },
    REVENUE: { en: "revenue model", tr: "gelir modeli" },
    MEASUREMENT: { en: "measurement layer", tr: "ölçümleme katmanı" },
  };
  const found = category ? labels[category] : null;
  return found ? (isEn ? found.en : found.tr) : isEn ? "launch plan" : "launch planı";
}

export function buildTaskDetailFallback(input: TaskDetailInput) {
  const locale = input.locale === "tr" ? "tr" : "en";
  const isEn = locale === "en";
  const title = input.title.trim();
  const titleLower = lowerTitle(title, locale);
  const domain = getDomainLabel(input.category, locale);
  const linked = input.linkedChecklistTitle?.trim();

  if (isEn) {
    return {
      why: linked
        ? `"${title}" moves the linked checklist item "${linked}" forward and reduces risk in ${domain}.`
        : `"${title}" reduces execution risk in ${domain} and keeps launch work moving.`,
      doneCriteria: linked
        ? `This is done when "${titleLower}" is completed, reviewed, and the linked checklist item "${linked}" no longer needs follow-up.`
        : `This is done when "${titleLower}" is completed, reviewed, and visible in the active launch workflow.`,
      nextAction: `Start by defining the smallest shippable version of "${title}" and assigning one owner for today's next step.`,
    };
  }

  return {
    why: linked
      ? `"${title}", bağlı checklist maddesi "${linked}" için ilerleme sağlar ve ${domain} tarafındaki riski azaltır.`
      : `"${title}", ${domain} tarafındaki icra riskini azaltır ve launch işinin akmasını sağlar.`,
    doneCriteria: linked
      ? `Bu iş, "${titleLower}" tamamlanıp gözden geçirildiğinde ve bağlı checklist maddesi "${linked}" artık ek takip istemediğinde biter.`
      : `Bu iş, "${titleLower}" tamamlanıp gözden geçirildiğinde ve aktif launch akışında görünür hale geldiğinde biter.`,
    nextAction: `Önce "${title}" için bugün çıkarılabilecek en küçük uygulanabilir parçayı tanımla ve tek bir sorumlu ata.`,
  };
}
