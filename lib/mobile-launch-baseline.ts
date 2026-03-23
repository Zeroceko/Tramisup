import type { LaunchCategory, Priority } from "@prisma/client";
import type { AiLaunchItem, AiPlan, WizardInput } from "@/lib/ai-plan";

type BaselineItem = {
  category: LaunchCategory;
  title: string;
  description: string;
  priority: Priority;
};

const IOS_BASELINE: BaselineItem[] = [
  {
    category: "LEGAL",
    title: "Privacy Policy ve Terms linklerini hazırla",
    description:
      "App Store incelemesinde gizlilik ve kullanım koşulları linkleri net görünmeli. Ayarlar, paywall ve store listing tarafında bu bağlantılar eksik kalmasın.",
    priority: "HIGH",
  },
  {
    category: "TECH",
    title: "Login gerekiyorsa review hesabı hazırla",
    description:
      "App Review ekibi uygulamayı test edebilmelidir. Giriş gerekiyorsa çalışan bir test hesabı ve kısa kullanım notu hazır olmalı.",
    priority: "HIGH",
  },
  {
    category: "PRODUCT",
    title: "Sign in with Apple gereksinimini kontrol et",
    description:
      "Google, Facebook veya benzeri sosyal giriş kullanıyorsan Apple parity gereksinimi tetiklenebilir. İnceleme öncesi bunu netleştir.",
    priority: "HIGH",
  },
  {
    category: "MARKETING",
    title: "Gerçek App Store screenshot setini tamamla",
    description:
      "Screenshot'lar mevcut iOS deneyimini gerçekten göstermeli. Mockup ağırlıklı veya eski ekranlı listing inceleme riskini artırır.",
    priority: "MEDIUM",
  },
];

const ANDROID_BASELINE: BaselineItem[] = [
  {
    category: "LEGAL",
    title: "Data Safety beyanını gerçek SDK kullanımına göre doldur",
    description:
      "Google Play Data Safety formu uygulamadaki gerçek veri toplama ve SDK davranışıyla birebir uyumlu olmalı.",
    priority: "HIGH",
  },
  {
    category: "TECH",
    title: "Giriş varsa test hesabı ve silme akışını doğrula",
    description:
      "Play incelemesi için çalışan test hesabı gerekebilir. Hesap açılan ürünlerde account deletion gereksinimini de önceden kapat.",
    priority: "HIGH",
  },
  {
    category: "PRODUCT",
    title: "İzin isteme ve açıklama akışlarını sadeleştir",
    description:
      "Android'de gereksiz veya erken permission istemek güven ve review kalitesini düşürür. Her izin için net kullanıcı faydası görünmeli.",
    priority: "HIGH",
  },
  {
    category: "MARKETING",
    title: "Play Store listing görsellerini gerçek akışla hizala",
    description:
      "Icon, açıklama ve screenshot seti uygulamanın gerçek Android deneyimini anlatmalı. Eski veya abartılı store görselleri risk yaratır.",
    priority: "MEDIUM",
  },
];

function normalizeTitle(title: string) {
  return title
    .toLocaleLowerCase("tr-TR")
    .replace(/[^a-z0-9ğüşöçıİ\s]/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function mergeLaunchChecklist(
  plan: AiPlan,
  baselineItems: BaselineItem[],
): AiPlan {
  const seen = new Set(plan.launchChecklist.map((item) => normalizeTitle(item.title)));

  const mergedBaseline: AiLaunchItem[] = [];
  for (const item of baselineItems) {
    const normalized = normalizeTitle(item.title);
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    mergedBaseline.push({
      ...item,
      order: mergedBaseline.length + 1,
    });
  }

  const aiItems = plan.launchChecklist.map((item, index) => ({
    ...item,
    order: mergedBaseline.length + index + 1,
  }));

  return {
    ...plan,
    launchChecklist: [...mergedBaseline, ...aiItems],
  };
}

export function mergeMobileLaunchBaseline(plan: AiPlan, input: WizardInput): AiPlan {
  const platforms = Array.from(new Set(input.mobilePlatforms ?? []));
  if (platforms.length === 0) return plan;

  const baselineItems: BaselineItem[] = [];
  if (platforms.includes("iOS")) baselineItems.push(...IOS_BASELINE);
  if (platforms.includes("Android")) baselineItems.push(...ANDROID_BASELINE);

  if (baselineItems.length === 0) return plan;
  return mergeLaunchChecklist(plan, baselineItems);
}
