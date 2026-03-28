import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import type { FunnelMetricSelection } from "@/lib/metric-setup";

export type NextStepKey =
  | "CREATE_PRODUCT"
  | "COMPLETE_LAUNCH_CHECKLIST"
  | "SETUP_METRICS"
  | "ENTER_FIRST_VALUES"
  | "DEFINE_GOAL"
  | "ADVANCE_CHECKLIST"
  | "DAILY_METRICS"
  | "REVIEW_PROGRESS";

export type NextStep = {
  key: NextStepKey;
  title: string;
  description: string;
  cta: string;
  href: string;
};

/**
 * Unified next-step orchestration.
 * Returns the single most important next action for a product or user.
 * Used consistently across dashboard, growth, metrics, and tasks pages.
 */
export async function getProductNextStep(
  productId: string | null,
  locale: string = "tr"
): Promise<NextStep> {
  if (!productId) {
    return {
      key: "CREATE_PRODUCT",
      title: "Ilk urununu olustur",
      description: "Tiramisup senin icin calisma sistemi kurmaya hazir. Ilk adim urununu anlatmak.",
      cta: "Urunu olustur",
      href: `/${locale}/products/new`,
    };
  }

  const [product, metricSetup, metricEntryCount, goalCount, launchCompleted, launchTotal, growthCompleted, growthTotal, latestMetric] =
    await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        select: { status: true },
      }),
      prisma.metricSetup.findUnique({
        where: { productId },
        include: { entries: { take: 1 } },
      }),
      prisma.metricEntry.count({ where: { productId } }),
      prisma.goal.count({ where: { productId } }),
      prisma.launchChecklist.count({ where: { productId, completed: true } }),
      prisma.launchChecklist.count({ where: { productId } }),
      prisma.growthChecklist.count({ where: { productId, completed: true } }),
      prisma.growthChecklist.count({ where: { productId } }),
      prisma.metric.findFirst({ where: { productId }, orderBy: { date: "desc" } }),
    ]);

  if (!product) {
    return {
      key: "CREATE_PRODUCT",
      title: "Urunu olustur",
      description: "Urun bulunamadi.",
      cta: "Yeni urun olustur",
      href: `/${locale}/products/new`,
    };
  }

  const isLaunched = product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;

  // Pre-launch flow
  if (!isLaunched) {
    const progress = launchTotal > 0 ? Math.round((launchCompleted / launchTotal) * 100) : 0;
    return {
      key: "COMPLETE_LAUNCH_CHECKLIST",
      title: "Launch hazirligini tamamla",
      description: `${launchCompleted}/${launchTotal} madde tamamlandi (%${progress}). Kritik blokajlari kapatip yayina hazirlan.`,
      cta: "Launch hazirligina git",
      href: `/${locale}/pre-launch`,
    };
  }

  // Launched: metric setup not done
  const selections = (metricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
  const hasSetup = selections.some((s) => s.selectedMetricKeys.length > 0);
  if (!hasSetup) {
    return {
      key: "SETUP_METRICS",
      title: "Buyume takibini kur",
      description: "Her AARRR kategorisi icin 1 ana metrik sec. Sonra gunluk veri girisine basla.",
      cta: "Growth setup'a git",
      href: `/${locale}/growth`,
    };
  }

  // Launched: no metric entries yet
  const hasEntries = metricEntryCount > 0 || !!latestMetric;
  if (!hasEntries) {
    return {
      key: "ENTER_FIRST_VALUES",
      title: "Ilk metrik girisini yap",
      description: "Sectigin metrikler hazir. Bugunun degerlerini girerek baz cizgini olustur.",
      cta: "Metrik gir",
      href: `/${locale}/metrics`,
    };
  }

  // Launched: no goals yet
  if (goalCount === 0) {
    return {
      key: "DEFINE_GOAL",
      title: "Ilk hedefini belirle",
      description: "Veri girisi basladi. Simdi hangi sonuca ulasmayi hedefledigini sayi olarak tanimla.",
      cta: "Hedef koy",
      href: `/${locale}/growth#goals`,
    };
  }

  // Launched: growth checklist items remaining
  if (growthTotal > 0 && growthCompleted < growthTotal) {
    return {
      key: "ADVANCE_CHECKLIST",
      title: "Growth checklist'ini ilerlet",
      description: `${growthCompleted}/${growthTotal} growth maddesi tamamlandi. Metrikleri hareket ettirecek islere devam et.`,
      cta: "Checklist'e don",
      href: `/${locale}/growth#growth-checklist`,
    };
  }

  // Default: daily metrics review
  return {
    key: "DAILY_METRICS",
    title: "Bugunun metriklerini guncelle",
    description: "Gunluk AARRR verilerini girip trendi takip et.",
    cta: "Metriklere git",
    href: `/${locale}/metrics`,
  };
}
