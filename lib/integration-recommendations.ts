import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";
import { AVAILABLE_INTEGRATIONS, type SupportedIntegrationProvider } from "@/lib/integrations-catalog";

type MetricProviderSupport = {
  provider: SupportedIntegrationProvider;
  mode: "ready_now" | "needs_custom_setup";
  note: string;
};

type MetricRecommendationConfig = {
  metricKey: string;
  providers: MetricProviderSupport[];
};

export type MetricProviderRecommendation = {
  provider: SupportedIntegrationProvider;
  name: string;
  icon: string;
  connected: boolean;
  mode: "ready_now" | "needs_custom_setup";
  note: string;
};

export type MetricIntegrationRecommendation = {
  stage: string;
  metricKey: string;
  metricName: string;
  providers: MetricProviderRecommendation[];
};

export type StageAutomationGuide = {
  stage: string;
  supportedMetricKeys: string[];
  connectedProviders: SupportedIntegrationProvider[];
  preferredMetricKey: string | null;
};

const METRIC_PROVIDER_CONFIG: MetricRecommendationConfig[] = [
  {
    metricKey: "website-visits",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Website trafiğini otomatik izler." },
    ],
  },
  {
    metricKey: "reach",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Organik ve sayfa erişim sinyallerini toplar." },
      { provider: "META_ADS", mode: "needs_custom_setup", note: "Paid reach verisini kampanya düzeyinde ekler." },
      { provider: "GOOGLE_ADS", mode: "needs_custom_setup", note: "Ads tarafında gösterim ve reach sinyali sağlar." },
    ],
  },
  {
    metricKey: "visitor-to-signup",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Traffic ve signup event'leriyle dönüşümü izler." },
    ],
  },
  {
    metricKey: "waitlist-joins",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Waitlist event'i veya thank-you page ile takip edilebilir." },
    ],
  },
  {
    metricKey: "cac",
    providers: [
      { provider: "META_ADS", mode: "needs_custom_setup", note: "Paid acquisition cost için Meta spend gerekir." },
      { provider: "GOOGLE_ADS", mode: "needs_custom_setup", note: "Paid acquisition cost için Google Ads spend gerekir." },
      { provider: "TIKTOK_ADS", mode: "needs_custom_setup", note: "TikTok spend verisi ile CAC kurulabilir." },
    ],
  },
  {
    metricKey: "onboarding-completion",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Onboarding completion event'leri varsa otomatik akar." },
    ],
  },
  {
    metricKey: "first-value-action",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Aha moment event'i GA4 event olarak gönderiliyorsa izlenir." },
    ],
  },
  {
    metricKey: "activation-rate",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Signup ve activation event'lerinden türetilebilir." },
    ],
  },
  {
    metricKey: "d1-d7-d30",
    providers: [
      { provider: "GA4", mode: "needs_custom_setup", note: "Retention/cohort raporları için ek kurgu gerekir." },
      { provider: "APPSFLYER", mode: "needs_custom_setup", note: "Mobil attribution + retention görünümü için uygun." },
    ],
  },
  {
    metricKey: "wau-mau",
    providers: [
      { provider: "GA4", mode: "needs_custom_setup", note: "WAU/MAU raporları event ve rapor kurgusuyla kurulabilir." },
    ],
  },
  {
    metricKey: "churn",
    providers: [
      { provider: "STRIPE", mode: "ready_now", note: "Abonelik iptallerinden doğrudan gelir." },
      { provider: "GA4", mode: "needs_custom_setup", note: "Subscription churn yerine behavior drop-off izlemek için yardımcı olur." },
      { provider: "REVENUECAT", mode: "needs_custom_setup", note: "Mobil abonelik churn takibi için güçlü aday." },
    ],
  },
  {
    metricKey: "invites-sent",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Invite/share event'i GA4'e gidiyorsa izlenebilir." },
    ],
  },
  {
    metricKey: "referral-conversion",
    providers: [
      { provider: "GA4", mode: "ready_now", note: "Referral kaynakları ve signup event'leriyle ölçülebilir." },
      { provider: "APPSFLYER", mode: "needs_custom_setup", note: "Mobil attribution referral senaryolarında yardımcı olur." },
    ],
  },
  {
    metricKey: "viral-coefficient",
    providers: [
      { provider: "GA4", mode: "needs_custom_setup", note: "Invite ve signup event'lerinden hesaplanabilir." },
    ],
  },
  {
    metricKey: "trial-to-paid",
    providers: [
      { provider: "STRIPE", mode: "ready_now", note: "Trial ve ödeme dönüşümünü doğal olarak taşır." },
      { provider: "GA4", mode: "needs_custom_setup", note: "Purchase/subscribe event'leri düzgün işleniyorsa destek olabilir." },
      { provider: "REVENUECAT", mode: "needs_custom_setup", note: "Mobil trial-to-paid için güçlü aday." },
    ],
  },
  {
    metricKey: "mrr",
    providers: [
      { provider: "STRIPE", mode: "ready_now", note: "MRR için şu an en net ve desteklenen kaynak." },
      { provider: "GA4", mode: "needs_custom_setup", note: "Ecommerce revenue event'leri varsa gelir sinyali verebilir ama şu an MRR sync'imiz Stripe merkezli." },
      { provider: "REVENUECAT", mode: "needs_custom_setup", note: "Mobil subscription revenue için sonraki katmanda eklenebilir." },
    ],
  },
  {
    metricKey: "arpu",
    providers: [
      { provider: "STRIPE", mode: "ready_now", note: "Ödeme verisinden hesaplamak için en doğal kaynak." },
      { provider: "GA4", mode: "needs_custom_setup", note: "Revenue ve user event'leri sağlamsa destek olabilir." },
    ],
  },
];

// Real auto-sync coverage based on the metrics we currently ingest and bridge
// into MetricSetup / MetricEntry. This is intentionally narrower than the
// recommendation catalog above.
const AUTO_SYNC_PROVIDER_CONFIG: MetricRecommendationConfig[] = [
  {
    metricKey: "website-visits",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync total users verisiyle beslenir." }],
  },
  {
    metricKey: "reach",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync total users verisiyle proxy olarak beslenir." }],
  },
  {
    metricKey: "visitor-to-signup",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync new users verisini acquisition proxy'si olarak kullanır." }],
  },
  {
    metricKey: "waitlist-joins",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync new users verisini launch interest proxy'si olarak kullanır." }],
  },
  {
    metricKey: "wau-mau",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync active users verisiyle retention sinyali üretir." }],
  },
  {
    metricKey: "d1-d7-d30",
    providers: [{ provider: "GA4", mode: "ready_now", note: "GA4 sync active users verisini retention proxy'si olarak kullanır." }],
  },
  {
    metricKey: "mrr",
    providers: [{ provider: "STRIPE", mode: "ready_now", note: "Stripe sync MRR verisini dogrudan doldurur." }],
  },
  {
    metricKey: "arpu",
    providers: [{ provider: "STRIPE", mode: "ready_now", note: "Stripe sync gelir verisiyle ARPU sinyali üretir." }],
  },
  {
    metricKey: "trial-to-paid",
    providers: [{ provider: "STRIPE", mode: "ready_now", note: "Stripe sync active subscription verisini kullanir." }],
  },
  {
    metricKey: "churn",
    providers: [{ provider: "STRIPE", mode: "ready_now", note: "Stripe sync cancelled subscriptions verisini kullanir." }],
  },
];

function getCatalogItem(provider: SupportedIntegrationProvider) {
  return AVAILABLE_INTEGRATIONS.find((item) => item.provider === provider);
}

export function getStageAutomationGuides({
  plan,
  connectedProviders,
}: {
  plan: GrowthMetricPlan;
  connectedProviders: string[];
}): StageAutomationGuide[] {
  const connectedSet = new Set(connectedProviders as SupportedIntegrationProvider[]);

  return plan.sections.map((section) => {
    const supportedMetrics = section.metrics.filter((metric) => {
      const config = AUTO_SYNC_PROVIDER_CONFIG.find((item) => item.metricKey === metric.key);
      return (config?.providers ?? []).some(
        (providerConfig) =>
          providerConfig.mode === "ready_now" && connectedSet.has(providerConfig.provider),
      );
    });

    const stageProviders = Array.from(
      new Set(
        supportedMetrics.flatMap((metric) => {
          const config = AUTO_SYNC_PROVIDER_CONFIG.find((item) => item.metricKey === metric.key);
          return (config?.providers ?? [])
            .filter(
              (providerConfig) =>
                providerConfig.mode === "ready_now" && connectedSet.has(providerConfig.provider),
            )
            .map((providerConfig) => providerConfig.provider);
        }),
      ),
    );

    const preferredMetric =
      supportedMetrics.find((metric) => metric.recommended) ?? supportedMetrics[0] ?? null;

    return {
      stage: section.stage,
      supportedMetricKeys: supportedMetrics.map((metric) => metric.key),
      connectedProviders: stageProviders,
      preferredMetricKey: preferredMetric?.key ?? null,
    };
  });
}

export function getRecommendedIntegrationsForSetup({
  setup,
  plan,
  connectedProviders,
}: {
  setup: SavedMetricSetup | null;
  plan: GrowthMetricPlan;
  connectedProviders: string[];
}) {
  const selectedMetricPairs =
    setup?.selections.flatMap((selection) =>
      selection.selectedMetricKeys.map((metricKey) => ({
        stage: selection.stage,
        metricKey,
      })),
    ) ?? [];

  const metricLabelMap = new Map(
    plan.sections.flatMap((section) =>
      section.metrics.map((metric) => [metric.key, metric.name] as const),
    ),
  );

  const metricRecommendations: MetricIntegrationRecommendation[] = selectedMetricPairs.map((selection) => {
    const config = METRIC_PROVIDER_CONFIG.find((item) => item.metricKey === selection.metricKey);
    const providers = (config?.providers ?? [])
      .map((providerConfig) => {
        const catalogItem = getCatalogItem(providerConfig.provider);
        if (!catalogItem) {
          return null;
        }

        return {
          provider: providerConfig.provider,
          name: catalogItem.name,
          icon: catalogItem.icon,
          connected: connectedProviders.includes(providerConfig.provider),
          mode: providerConfig.mode,
          note: providerConfig.note,
        };
      })
      .filter(Boolean) as MetricProviderRecommendation[];

    return {
      stage: selection.stage,
      metricKey: selection.metricKey,
      metricName: metricLabelMap.get(selection.metricKey) ?? selection.metricKey,
      providers,
    };
  });

  const uncoveredMetricNames = metricRecommendations
    .filter((item) => item.providers.length === 0)
    .map((item) => item.metricName);

  return {
    metricRecommendations,
    uncoveredMetricNames,
  };
}
