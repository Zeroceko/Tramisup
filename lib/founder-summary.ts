import type { AiPlan, WizardInput } from "@/lib/ai-plan";

export type FounderSummary = {
  headline: string;
  summary: string;
  nextStep: string;
  strengths: string[];
  focusAreas: string[];
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

export function buildFounderSummary(input: WizardInput, aiPlan: AiPlan | null): FounderSummary {
  const categories = splitList(input.category);
  const audiences = splitList(input.targetAudience);
  const platforms = input.mobilePlatforms ?? [];
  const launchItems = aiPlan?.launchChecklist.slice(0, 2).map((item) => item.title) ?? [];
  const growthItems = aiPlan?.growthChecklist.slice(0, 2).map((item) => item.title) ?? [];
  const tasks = aiPlan?.tasks.slice(0, 2).map((item) => item.title) ?? [];
  const isLaunched = ["Yayında", "Büyüme aşamasında"].includes(input.launchStatus ?? "");

  const strengths = [
    categories.length ? `${input.name} şu anda ${toNaturalList(categories)} bağlamında konumlanıyor.` : null,
    audiences.length ? `Ana hedef kitle ${toNaturalList(audiences)} olarak netleşmiş durumda.` : null,
    platforms.length ? `Mobil dağıtım hedefi ${toNaturalList(platforms)} için ayrıca hazırlandı.` : null,
    input.businessModel ? `Gelir modeli ${input.businessModel.toLowerCase()} tarafında tanımlı.` : null,
  ].filter(Boolean) as string[];

  const focusAreas = isLaunched
    ? (growthItems.length
        ? growthItems
        : [
            "İlk takip edeceğin acquisition ve activation metriklerini seç.",
            "Metrik setup'tan sonra ilk günlük veri girişini başlat.",
          ])
    : (launchItems.length
        ? launchItems
        : [
            "İlk launch hazırlık maddelerini kapat.",
            "Bu haftaki en kritik işe odaklan.",
          ]);

  const nextStep = isLaunched
    ? "Growth setup ekranında her kategori için tek ana metrik seç."
    : platforms.length
      ? "Pre-launch ekranında App Store ve Google Play gereksinimlerini kritik maddelerle birlikte kapat."
      : "Pre-launch ekranında ilk kritik hazırlık maddelerine başla.";

  const summary = isLaunched
    ? `${input.name}, yayındaki ürün yolculuğuna geçmiş durumda. Tiramisup önce neyi ölçeceğini netleştirip büyümeyi sakin ve veri odaklı bir sırayla kurmanı önerecek.`
    : `${input.name}, henüz hazırlık tarafında. Tiramisup ilk çalışma sistemini ürün anlatımına göre kurup seni dağılmadan bir sonraki doğru adıma taşıyacak.`;

  return {
    headline: `${input.name} için Tiramisup özeti`,
    summary,
    nextStep,
    strengths: strengths.slice(0, 3),
    focusAreas: [...focusAreas, ...tasks].slice(0, 3),
  };
}
