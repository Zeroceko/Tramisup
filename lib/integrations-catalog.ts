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
  { provider: "GA4", name: "Google Analytics", description: "Ürün içi DAU, retention, funnel ve organik site trafiği analizi.", icon: "GA4" },
  { provider: "STRIPE", name: "Stripe", description: "Finansal veriler: MRR, yeni abonelikler ve churn takibi.", icon: "STRIPE" },
  { provider: "REVENUECAT", name: "RevenueCat", description: "App Store ve Play Store abonelik analitiği.", icon: "REVENUECAT", comingSoon: true },
  { provider: "APP_STORE_CONNECT", name: "App Store Connect", description: "iOS release, rating ve listing sinyallerini hazırlayan store bağlantısı.", icon: "APP_STORE_CONNECT" },
  { provider: "GOOGLE_PLAY", name: "Google Play", description: "Android release ve store verisini hazırlayan OAuth bağlantısı.", icon: "GOOGLE_PLAY" },
  { provider: "META_ADS", name: "Meta Ads", description: "Reklam harcamaları ve dönüşüm verileri.", icon: "META_ADS", comingSoon: true },
  { provider: "GOOGLE_ADS", name: "Google Ads", description: "Search, Display ve App kampanya performansı.", icon: "GOOGLE_ADS", comingSoon: true },
  { provider: "TIKTOK_ADS", name: "TikTok Ads", description: "TikTok Manager Ads performansı ve harcamaları.", icon: "TIKTOK_ADS", comingSoon: true },
  { provider: "APPSFLYER", name: "AppsFlyer", description: "Attribution doğrulama ve gelişmiş mobil MMP çözümü.", icon: "APPSFLYER", comingSoon: true },
];
