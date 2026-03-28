"use client";

import { useMemo, useState } from "react";
import IntegrationCard, {
  type ExistingIntegration,
  type IntegrationDef,
  type SourceState,
  getSourceState,
} from "@/components/IntegrationCard";
import SourceSetupWizard from "@/components/SourceSetupWizard";
import { BrandLogo } from "@/components/BrandLogo";
import PageHeader from "@/components/PageHeader";

type IntegrationsWorkspaceProps = {
  productName: string;
  integrations: ExistingIntegration[];
  availableIntegrations: IntegrationDef[];
  productId: string;
  manualEntryCount?: number;
  success?: string;
  error?: string;
  onboarding?: string;
  connect?: string;
  queued?: string;
};

// Feedback from OAuth redirects
const feedbackCopy: Record<
  string,
  { tone: "success" | "error"; title: string; body: string }
> = {
  ga4_connected: {
    tone: "success",
    title: "Google Analytics bağlandı",
    body: "Son adım kaldı: hangi GA4 property'den veri çekeceğimizi seç. Bu olmadan sync çalışmaz.",
  },
  stripe_connected: {
    tone: "success",
    title: "Stripe bağlandı",
    body: "Gelir ve churn verileri artık sync akışına hazır. İlk sync'i başlatarak veriyi içeri al.",
  },
  stripe_denied: {
    tone: "error",
    title: "Stripe izni tamamlanmadı",
    body: "Bağlantı ekranı yarıda kaldı. İstersen tekrar deneyebiliriz.",
  },
  missing_params_or_denied: {
    tone: "error",
    title: "Google bağlantısı tamamlanmadı",
    body: "Google izin akışı eksik ya da yarıda kaldı. Tekrar dene.",
  },
  unauthorized_product: {
    tone: "error",
    title: "Bağlantı hedefi doğrulanamadı",
    body: "Seçili ürünle OAuth state eşleşmedi. Sayfayı yenileyip tekrar dene.",
  },
  missing_env_secrets: {
    tone: "error",
    title: "Google OAuth ayarı eksik",
    body: "Sunucu tarafında gerekli gizli anahtarlar eksik görünüyor.",
  },
  exchange_failed: {
    tone: "error",
    title: "Token değişimi başarısız oldu",
    body: "Google izin verdi ama token alma aşaması tamamlanmadı.",
  },
  oauth_crash: {
    tone: "error",
    title: "OAuth callback beklenmedik şekilde durdu",
    body: "Akış callback aşamasında bozuldu.",
  },
};

// Trust level: what does the user's data quality look like overall?
type TrustLevel = "TRUSTED" | "PARTIAL" | "MANUAL";

function computeTrustLevel(states: SourceState[]): TrustLevel {
  if (states.some((s) => s === "SYNCED")) return "TRUSTED";
  if (states.some((s) => s === "NEEDS_SETUP" || s === "STALE" || s === "ERROR"))
    return "PARTIAL";
  return "MANUAL";
}

const TRUST_CONFIG: Record<
  TrustLevel,
  { label: string; dot: string; dotCls: string; bg: string; border: string; body: string }
> = {
  TRUSTED: {
    label: "Veri güvenilir",
    dot: "bg-[#22c55e] animate-pulse",
    dotCls: "bg-[#22c55e]",
    bg: "bg-[#f0fdf4]",
    border: "border-[#bbf7d0]",
    body:
      "Metrikler gerçek veri kaynaklarından akıyor. Koç yorumları ve öneriler güvenilir sinyallere dayanır.",
  },
  PARTIAL: {
    label: "Kısmi bağlantı",
    dot: "bg-[#f97316]",
    dotCls: "bg-[#f97316]",
    bg: "bg-[#fff7ed]",
    border: "border-[#fed7aa]",
    body:
      "Bağlı kaynaklar kurulum ya da yeni bir sync bekliyor. Eksik veriler manuel giriş ile tamamlanır.",
  },
  MANUAL: {
    label: "Manuel veri",
    dot: "bg-[#d0d0d0]",
    dotCls: "bg-[#d0d0d0]",
    bg: "bg-[#f6f6f6]",
    border: "border-[#e8e8e8]",
    body:
      "Henüz aktif veri kaynağı yok. Tüm metrikler manuel giriş ile takip ediliyor. Kaynak bağladığında koç gerçek verilerle çalışır.",
  },
};

export default function IntegrationsWorkspace({
  productName,
  integrations,
  availableIntegrations,
  productId,
  manualEntryCount,
  success,
  error,
  onboarding,
  connect,
  queued,
}: IntegrationsWorkspaceProps) {
  const integrationMap = useMemo(
    () => new Map(integrations.map((i) => [i.provider, i])),
    [integrations]
  );

  const liveIntegrations = availableIntegrations.filter((i) => !i.comingSoon);
  const roadmapIntegrations = availableIntegrations.filter((i) => i.comingSoon);

  // Compute state for each live source
  const sourceStates: SourceState[] = liveIntegrations.map((i) =>
    getSourceState(integrationMap.get(i.provider), i.provider)
  );
  const trustLevel = computeTrustLevel(sourceStates);
  const trustCfg = TRUST_CONFIG[trustLevel];

  const syncedSources = sourceStates.filter((s) => s === "SYNCED").length;
  const queuedProviders = (queued ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  const onboardingFeedback =
    onboarding === "1" && connect
      ? {
          tone: "success" as const,
          title: "Onboarding tamamlandi",
          body:
            queuedProviders.length > 0
              ? `Sectigin kaynaklari baglamaya geciyoruz. Once ${connect}, sonra ${queuedProviders.join(", ")} kurulumu acilabilir.`
              : `Sectigin kaynaklari baglamaya hazirsin. Once ${connect} kurulumu aciliyor.`,
        }
      : null;
  const feedback = success
    ? feedbackCopy[success]
    : error
    ? feedbackCopy[error]
    : onboardingFeedback;

  // Auto-open wizard when returning from OAuth callback
  const requestedProvider =
    connect === "GA4" || connect === "STRIPE" ? connect : null;
  const autoOpenProvider: "GA4" | "STRIPE" | null =
    success === "ga4_connected"
      ? "GA4"
      : success === "stripe_connected"
      ? "STRIPE"
      : requestedProvider;
  const autoOpenIntegration = autoOpenProvider
    ? integrationMap.get(autoOpenProvider)
    : null;
  const [wizardAutoOpen, setWizardAutoOpen] = useState(!!autoOpenProvider);

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow="Veri güvenilirliği"
        title="Kaynaklar"
        description={`${productName} · Metriklerini besleyen veri kaynakları burada yönetilir.`}
      />

      {/* OAuth feedback banner */}
      {feedback && (
        <div
          className={`rounded-[16px] border p-4 ${
            feedback.tone === "success"
              ? "border-[#bbf7d0] bg-[#f0fdf4]"
              : "border-[#fecaca] bg-[#fef2f2]"
          }`}
        >
          <p className="text-[13px] font-semibold text-[#0d0d12]">
            {feedback.title}
          </p>
          <p className="mt-0.5 text-[13px] leading-5 text-[#666d80]">
            {feedback.body}
          </p>
        </div>
      )}

      {/* Data trust banner */}
      <div
        className={`rounded-[16px] border p-5 ${trustCfg.bg} ${trustCfg.border}`}
      >
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${trustCfg.dot}`} />
              <span className="text-[13px] font-semibold text-[#0d0d12]">
                {trustCfg.label}
              </span>
              {syncedSources > 0 && (
                <span className="rounded-full bg-white/60 px-2 py-0.5 text-[11px] font-semibold text-[#666d80]">
                  {syncedSources} kaynak aktif
                </span>
              )}
            </div>
            <p className="mt-1.5 text-[13px] leading-5 text-[#666d80]">
              {trustCfg.body}
            </p>
          </div>

          {/* Coach signal indicator */}
          <div className="shrink-0 rounded-[12px] bg-white/60 px-3 py-2 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
              Koç sinyali
            </p>
            <p className="mt-0.5 text-[13px] font-semibold text-[#0d0d12]">
              {trustLevel === "TRUSTED"
                ? "Gerçek veri"
                : trustLevel === "PARTIAL"
                ? "Karma veri"
                : "Tahmini"}
            </p>
          </div>
        </div>

        {/* Contextual explanation */}
        {trustLevel !== "TRUSTED" && (
          <div className="mt-3 border-t border-black/5 pt-3">
            <p className="text-[12px] leading-5 text-[#666d80]">
              {trustLevel === "MANUAL"
                ? "Kaynak bağlandığında ve sync çalıştığında koç seni gerçek metriklerle değerlendirir: kaç kullanıcı, ne kadar gelir, hangi oran düşüyor."
                : "Kurulumu tamamlanan kaynaklar sync'e hazır. Her kaynak için sync'i başlatman yeterli."}
            </p>
          </div>
        )}
      </div>

      {/* Live sources grid */}
      <div>
        <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0d0d12]">
          Aktif kaynaklar
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {liveIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.provider}
              integration={integration}
              existingIntegration={integrationMap.get(integration.provider)}
              productId={productId}
              manualEntryCount={manualEntryCount}
              autoOpenPropertySelector={
                success === "ga4_connected" &&
                integration.provider === "GA4"
              }
            />
          ))}
        </div>
      </div>

      {/* Roadmap sources */}
      {roadmapIntegrations.length > 0 && (
        <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
          <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
            Yakında gelecekler
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#8a8fa0]">
            Bu kaynaklar henüz aktif değil. Her biri bağlandığında koç sinyaline ek bir veri katmanı ekler.
          </p>
          <div className="mt-4 divide-y divide-[#f0f0f0]">
            {roadmapIntegrations.map((integration) => (
              <div
                key={integration.provider}
                className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[#f6f6f6] overflow-hidden">
                  <BrandLogo
                    provider={integration.provider}
                    className="h-4 w-4 opacity-50"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-[#0d0d12]">
                    {integration.name}
                  </p>
                  <p className="text-[12px] leading-5 text-[#8a8fa0]">
                    {integration.description}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-[#e8e8e8] bg-[#f6f6f6] px-2.5 py-0.5 text-[11px] font-medium text-[#94a3b8]">
                  Yakında
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-opened wizard after OAuth return */}
      {wizardAutoOpen && autoOpenProvider && (
        <SourceSetupWizard
          provider={autoOpenProvider}
          productId={productId}
          integrationId={autoOpenIntegration?.id ?? null}
          isConnected={autoOpenIntegration?.status === "CONNECTED"}
          selectedPropertyId={autoOpenIntegration?.selectedPropertyId}
          manualEntryCount={manualEntryCount}
          onClose={() => setWizardAutoOpen(false)}
        />
      )}
    </div>
  );
}
