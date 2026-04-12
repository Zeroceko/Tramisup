export type SupportedIntegrationProvider =
  | "GA4"
  | "STRIPE"
  | "REVENUECAT"
  | "APP_STORE_CONNECT"
  | "GOOGLE_PLAY"
  | "META_ADS"
  | "GOOGLE_ADS"
  | "TIKTOK_ADS"
  | "APPSFLYER";

export type IntegrationCatalogItem = {
  provider: SupportedIntegrationProvider;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
};

export const AVAILABLE_INTEGRATIONS: IntegrationCatalogItem[] = [
  { provider: "GA4", name: "Google Analytics", description: "Product DAU, retention, funnel, and organic site traffic analysis.", icon: "GA4" },
  { provider: "STRIPE", name: "Stripe", description: "Financial signals for MRR, new subscriptions, and churn.", icon: "STRIPE" },
  { provider: "REVENUECAT", name: "RevenueCat", description: "App Store and Play Store subscription analytics.", icon: "REVENUECAT", comingSoon: true },
  { provider: "APP_STORE_CONNECT", name: "App Store Connect", description: "Store connection for iOS release, rating, and listing signals.", icon: "APP_STORE_CONNECT" },
  { provider: "GOOGLE_PLAY", name: "Google Play", description: "OAuth connection for Android release and store data.", icon: "GOOGLE_PLAY" },
  { provider: "META_ADS", name: "Meta Ads", description: "Ad spend and conversion signals from Meta campaigns.", icon: "META_ADS", comingSoon: true },
  { provider: "GOOGLE_ADS", name: "Google Ads", description: "Search, Display, and App campaign performance signals.", icon: "GOOGLE_ADS", comingSoon: true },
  { provider: "TIKTOK_ADS", name: "TikTok Ads", description: "Performance and spend signals from TikTok Ads Manager.", icon: "TIKTOK_ADS", comingSoon: true },
  { provider: "APPSFLYER", name: "AppsFlyer", description: "Attribution verification and advanced mobile MMP support.", icon: "APPSFLYER", comingSoon: true },
];

const TURKISH_DESCRIPTIONS: Record<SupportedIntegrationProvider, string> = {
  GA4: "Ürün içi DAU, retention, funnel ve organik site trafiği analizi.",
  STRIPE: "Finansal veriler: MRR, yeni abonelikler ve churn takibi.",
  REVENUECAT: "App Store ve Play Store abonelik analitiği.",
  APP_STORE_CONNECT: "iOS release, rating ve listing sinyallerini hazırlayan store bağlantısı.",
  GOOGLE_PLAY: "Android release ve store verisini hazırlayan OAuth bağlantısı.",
  META_ADS: "Reklam harcamaları ve dönüşüm verileri.",
  GOOGLE_ADS: "Search, Display ve App kampanya performansı.",
  TIKTOK_ADS: "TikTok Manager Ads performansı ve harcamaları.",
  APPSFLYER: "Attribution doğrulama ve gelişmiş mobil MMP çözümü.",
};

export function getAvailableIntegrations(locale: string): IntegrationCatalogItem[] {
  const isEn = locale === "en";
  return AVAILABLE_INTEGRATIONS.map((item) => ({
    ...item,
    description: isEn ? item.description : TURKISH_DESCRIPTIONS[item.provider],
  }));
}
