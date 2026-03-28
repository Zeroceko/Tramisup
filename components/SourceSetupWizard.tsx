"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronLeft,
  Loader2,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { toast } from "@/components/ui/sonner";

// ─── Types ───────────────────────────────────────────────────────────────────

type ValidationCheck = {
  key: string;
  label: string;
  passed: boolean;
  detail?: string;
};

type Ga4Property = {
  accountName: string;
  accountDisplayName: string;
  propertyId: string;
  propertyName: string;
  propertyDisplayName: string;
};

type ValidationResult = {
  provider: "GA4" | "STRIPE";
  status: "TRUSTED" | "UNTRUSTED" | "UNKNOWN";
  checks: ValidationCheck[];
  errorCode?: string;
  properties?: Ga4Property[];
  selectedPropertyId?: string | null;
  preview?: Record<string, unknown>;
};

type SetupStep = "connect" | "property" | "validate" | "sync" | "done";

type WizardProps = {
  provider: "GA4" | "STRIPE";
  productId: string;
  integrationId?: string | null;
  isConnected: boolean;
  selectedPropertyId?: string | null;
  onClose: () => void;
};

// ─── Step definitions ────────────────────────────────────────────────────────

function getSteps(provider: "GA4" | "STRIPE"): SetupStep[] {
  if (provider === "GA4") return ["connect", "property", "validate", "sync", "done"];
  return ["connect", "validate", "sync", "done"];
}

function getInitialStep(
  provider: "GA4" | "STRIPE",
  isConnected: boolean,
  selectedPropertyId?: string | null
): SetupStep {
  if (!isConnected) return "connect";
  if (provider === "GA4" && !selectedPropertyId) return "property";
  return "validate";
}

// ─── Copy ────────────────────────────────────────────────────────────────────

const PROVIDER_META = {
  GA4: {
    name: "Google Analytics 4",
    shortName: "GA4",
    connectTitle: "Google Analytics'e bağlan",
    connectDesc: "Google hesabınla oturum aç ve analytics verilerine okuma erişimi ver. Sadece readonly yetki istiyoruz.",
    connectCta: "Google ile bağlan",
    propertyTitle: "Hangi property'den veri çekelim?",
    propertyDesc: "Ürününe ait GA4 property'yi seç. Yanlış seçim yanlış metriklere yol açar — doğru ürünü seçtiğinden emin ol.",
    validateTitle: "Veri doğrulama",
    validateDesc: "Bağlantı ve veri erişimini kontrol ediyoruz. Bu adım gerçek veri çekmeyi denemeden önce her şeyin hazır olduğunu doğrular.",
    syncTitle: "İlk veri çekimi",
    syncDesc: "Son 14 günlük GA4 verisini içeri alıyoruz. DAU, toplam kullanıcı ve yeni kullanıcı verileri otomatik olarak kaydedilir.",
    doneTitle: "GA4 hazır",
    doneDesc: "Google Analytics bağlantısı kuruldu, doğrulandı ve ilk veri çekimi tamamlandı. Metrikler artık otomatik olarak güncellenecek.",
    metrics: ["DAU (günlük aktif kullanıcı)", "Toplam kullanıcı", "Yeni kullanıcılar", "Retention sinyalleri"],
    trustExplain: "GA4 verisi güvenilir olarak işaretlendi. Koç artık davranışsal sinyallere dayalı öneriler verebilir.",
  },
  STRIPE: {
    name: "Stripe",
    shortName: "Stripe",
    connectTitle: "Stripe hesabını bağla",
    connectDesc: "Stripe Connect ile hesabına readonly erişim ver. Sadece abonelik ve ödeme verilerini okuyoruz.",
    connectCta: "Stripe ile bağlan",
    propertyTitle: "",
    propertyDesc: "",
    validateTitle: "Hesap doğrulama",
    validateDesc: "Stripe hesap erişimini, abonelik ve ödeme verilerine ulaşabilirliği kontrol ediyoruz.",
    syncTitle: "İlk veri çekimi",
    syncDesc: "Aktif abonelikler, MRR ve son 30 günlük churn verisi çekiliyor.",
    doneTitle: "Stripe hazır",
    doneDesc: "Stripe bağlantısı kuruldu, doğrulandı ve ilk veri çekimi tamamlandı. Gelir metrikleri artık otomatik olarak güncellenecek.",
    metrics: ["MRR (aylık yinelenen gelir)", "Aktif abonelikler", "Churn (iptal edilen)", "Ödeme hacmi"],
    trustExplain: "Stripe verisi güvenilir olarak işaretlendi. Koç artık finansal sinyallere dayalı öneriler verebilir.",
  },
};

const ERROR_GUIDANCE: Record<string, { title: string; action: string }> = {
  AUTH_EXPIRED: {
    title: "Yetkilendirme süresi dolmuş",
    action: "Bağlantıyı kaldır ve yeniden bağlan. OAuth token'ı yenilenemedi.",
  },
  PERMISSION_DENIED: {
    title: "Yetersiz yetki",
    action: "Google hesabında GA4 verilerine erişim izni olduğundan emin ol. Gerekirse yeniden bağlan.",
  },
  NO_DATA: {
    title: "Kaynak boş görünüyor",
    action: "Seçili property/hesapta veri bulunmuyor. Doğru kaynağı seçtiğinden emin ol.",
  },
  WRONG_PROPERTY: {
    title: "Seçili property erişilemiyor",
    action: "Bu property artık hesabında görünmüyor. Başka bir property seç.",
  },
  NETWORK: {
    title: "Bağlantı hatası",
    action: "API'ye ulaşılamadı. İnternet bağlantını kontrol edip tekrar dene.",
  },
  MISSING_CONFIG: {
    title: "Yapılandırma eksik",
    action: "Bağlantı bilgileri kaybolmuş. Bağlantıyı kaldır ve yeniden kur.",
  },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function SourceSetupWizard({
  provider,
  productId,
  integrationId,
  isConnected,
  selectedPropertyId: initialPropertyId,
  onClose,
}: WizardProps) {
  const router = useRouter();
  const meta = PROVIDER_META[provider];
  const steps = getSteps(provider);

  const [currentStep, setCurrentStep] = useState<SetupStep>(
    getInitialStep(provider, isConnected, initialPropertyId)
  );
  const [loading, setLoading] = useState(false);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [properties, setProperties] = useState<Ga4Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<string>(initialPropertyId ?? "");
  const [syncResult, setSyncResult] = useState<{ recordsSynced: number } | null>(null);

  const stepIndex = steps.indexOf(currentStep);
  const progress = ((stepIndex + 1) / steps.length) * 100;

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleConnect = () => {
    setLoading(true);
    if (provider === "GA4") {
      window.location.href = `/api/integrations/google/link?productId=${productId}`;
    } else {
      window.location.href = `/api/integrations/stripe/link?productId=${productId}`;
    }
  };

  const loadProperties = useCallback(async () => {
    if (!integrationId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${integrationId}/ga4-properties`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setProperties(data.properties ?? []);
      if (data.selectedPropertyId) {
        setSelectedProperty(data.selectedPropertyId);
      } else if (data.properties?.length > 0) {
        setSelectedProperty(data.properties[0].propertyId);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Property listesi alınamadı");
    } finally {
      setLoading(false);
    }
  }, [integrationId]);

  const saveProperty = async () => {
    if (!integrationId || !selectedProperty) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${integrationId}/ga4-properties`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId: selectedProperty }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      toast.success(`${data.propertyDisplayName} seçildi.`);
      setCurrentStep("validate");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Property kaydedilemedi");
    } finally {
      setLoading(false);
    }
  };

  const runValidation = useCallback(async () => {
    if (!integrationId) return;
    setLoading(true);
    setValidation(null);
    try {
      const res = await fetch(`/api/integrations/${integrationId}/validate`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setValidation(data as ValidationResult);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Doğrulama başarısız");
    } finally {
      setLoading(false);
    }
  }, [integrationId]);

  const runSync = async () => {
    if (!integrationId) return;
    setLoading(true);
    setSyncResult(null);
    try {
      const res = await fetch(`/api/integrations/${integrationId}/sync`, {
        method: "POST",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      setSyncResult({ recordsSynced: data.recordsSynced ?? 0 });
      toast.success(`${data.recordsSynced ?? 0} kayıt senkronize edildi.`);
      setCurrentStep("done");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Sync başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleDone = () => {
    router.refresh();
    onClose();
  };

  // Auto-load properties when entering property step
  useEffect(() => {
    if (currentStep === "property" && properties.length === 0) {
      void loadProperties();
    }
  }, [currentStep, properties.length, loadProperties]);

  // Auto-run validation when entering validate step
  useEffect(() => {
    if (currentStep === "validate" && !validation) {
      void runValidation();
    }
  }, [currentStep, validation, runValidation]);

  // ── Step renderers ─────────────────────────────────────────────────────────

  function renderConnect() {
    return (
      <div className="space-y-5">
        <div className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-[#f6f6f6]">
          <BrandLogo provider={provider} className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {meta.connectTitle}
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
            {meta.connectDesc}
          </p>
        </div>

        {/* What you'll get */}
        <div className="rounded-[16px] bg-[#f7f9fa] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">
            Bağlandığında alacağın veriler
          </p>
          <div className="mt-3 space-y-2">
            {meta.metrics.map((m) => (
              <div key={m} className="flex items-center gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#95dbda]/30">
                  <Check className="h-2.5 w-2.5 text-[#2a7c7a]" />
                </span>
                <span className="text-[13px] text-[#3d4658]">{m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Security note */}
        <div className="flex items-start gap-2 rounded-[12px] border border-[#e8e8e8] bg-white p-3">
          <Shield className="mt-0.5 h-4 w-4 shrink-0 text-[#95dbda]" />
          <p className="text-[12px] leading-5 text-[#666d80]">
            Sadece okuma (readonly) yetkisi istiyoruz. Verilerin değiştirilmez, silinmez veya dışarıya aktarılmaz.
          </p>
        </div>

        <button
          type="button"
          onClick={handleConnect}
          disabled={loading}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BrandLogo provider={provider} className="h-4 w-4" />
          )}
          {loading ? "Yönlendiriliyor…" : meta.connectCta}
        </button>
      </div>
    );
  }

  function renderPropertySelect() {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {meta.propertyTitle}
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
            {meta.propertyDesc}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-[#95dbda]" />
            <span className="ml-2 text-[13px] text-[#666d80]">Property&apos;ler yükleniyor…</span>
          </div>
        ) : properties.length === 0 ? (
          <div className="rounded-[14px] border border-orange-100 bg-[#fff7ed] p-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#c2410c]" />
              <div>
                <p className="text-[13px] font-semibold text-[#c2410c]">Property bulunamadı</p>
                <p className="mt-1 text-[12px] leading-5 text-[#c2410c]/80">
                  Bu Google hesabında erişilebilir GA4 property yok. Doğru hesapla bağlandığından emin ol.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {properties.map((p) => (
                <button
                  key={p.propertyId}
                  type="button"
                  onClick={() => setSelectedProperty(p.propertyId)}
                  className={`w-full rounded-[14px] border p-4 text-left transition ${
                    selectedProperty === p.propertyId
                      ? "border-[#95dbda] bg-[#95dbda]/10"
                      : "border-[#e8e8e8] bg-white hover:border-[#cfcfcf]"
                  }`}
                >
                  <p className="text-[14px] font-semibold text-[#0d0d12]">
                    {p.propertyDisplayName}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#666d80]">
                    {p.accountDisplayName} · ID: {p.propertyId}
                  </p>
                </button>
              ))}
            </div>

            <div className="rounded-[12px] bg-[#f7f9fa] p-3">
              <p className="text-[12px] leading-5 text-[#666d80]">
                <strong className="text-[#0d0d12]">Dikkat:</strong> DAU, retention ve funnel verisi bu property&apos;den çekilir. Yanlış property seçilirse metrikler başka bir ürüne ait veri gösterir.
              </p>
            </div>

            <button
              type="button"
              onClick={saveProperty}
              disabled={loading || !selectedProperty}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? "Kaydediliyor…" : "Property'yi seç ve doğrula"}
            </button>
          </>
        )}
      </div>
    );
  }

  function renderValidation() {
    const isTrusted = validation?.status === "TRUSTED";
    const isUntrusted = validation?.status === "UNTRUSTED";
    const errorInfo = validation?.errorCode ? ERROR_GUIDANCE[validation.errorCode] : null;

    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {meta.validateTitle}
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
            {meta.validateDesc}
          </p>
        </div>

        {loading && !validation ? (
          <div className="space-y-3 py-4">
            <div className="flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-[#95dbda]" />
              <span className="text-[14px] text-[#666d80]">Bağlantı kontrol ediliyor…</span>
            </div>
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-10 animate-pulse rounded-[10px] bg-[#f0f0f0]" />
              ))}
            </div>
          </div>
        ) : validation ? (
          <>
            {/* Trust status banner */}
            <div
              className={`flex items-center gap-3 rounded-[14px] border p-4 ${
                isTrusted
                  ? "border-[#bbf7d0] bg-[#f0fdf4]"
                  : isUntrusted
                  ? "border-[#fecaca] bg-[#fef2f2]"
                  : "border-[#fed7aa] bg-[#fff7ed]"
              }`}
            >
              {isTrusted ? (
                <ShieldCheck className="h-5 w-5 shrink-0 text-[#22c55e]" />
              ) : isUntrusted ? (
                <ShieldAlert className="h-5 w-5 shrink-0 text-[#ef4444]" />
              ) : (
                <Shield className="h-5 w-5 shrink-0 text-[#f97316]" />
              )}
              <div>
                <p className="text-[14px] font-semibold text-[#0d0d12]">
                  {isTrusted
                    ? "Kaynak güvenilir"
                    : isUntrusted
                    ? "Doğrulama başarısız"
                    : "Kurulum bekliyor"}
                </p>
                <p className="mt-0.5 text-[12px] text-[#666d80]">
                  {isTrusted
                    ? "Tüm kontroller geçti. Veri çekimine hazır."
                    : isUntrusted
                    ? "Bazı kontroller geçemedi. Aşağıdaki detayları incele."
                    : "Ek kurulum adımı gerekiyor."}
                </p>
              </div>
            </div>

            {/* Check list */}
            <div className="space-y-1">
              {validation.checks.map((check) => (
                <div
                  key={check.key}
                  className={`flex items-start gap-3 rounded-[10px] p-3 ${
                    check.passed ? "bg-white" : "bg-[#fef2f2]"
                  }`}
                >
                  {check.passed ? (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#22c55e]">
                      <Check className="h-3 w-3 text-white" />
                    </span>
                  ) : (
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ef4444]">
                      <X className="h-3 w-3 text-white" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="text-[13px] font-semibold text-[#0d0d12]">{check.label}</p>
                    {check.detail && (
                      <p className="mt-0.5 text-[12px] leading-5 text-[#666d80]">{check.detail}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Data preview */}
            {validation.preview && isTrusted && (
              <div className="rounded-[14px] border border-[#bbf7d0] bg-[#f0fdf4] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#15803d]">
                  Veri önizleme
                </p>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  {Object.entries(validation.preview).map(([key, value]) => (
                    <div key={key}>
                      <p className="text-[11px] text-[#666d80]">{formatPreviewKey(key)}</p>
                      <p className="text-[16px] font-semibold text-[#0d0d12]">
                        {formatPreviewValue(key, value)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Error guidance */}
            {isUntrusted && errorInfo && (
              <div className="rounded-[12px] border border-[#fecaca] bg-[#fef2f2] p-4">
                <p className="text-[13px] font-semibold text-[#dc2626]">{errorInfo.title}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#dc2626]/80">{errorInfo.action}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              {isTrusted && (
                <button
                  type="button"
                  onClick={() => setCurrentStep("sync")}
                  className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24]"
                >
                  İlk sync&apos;i başlat
                  <ArrowRight className="h-4 w-4" />
                </button>
              )}
              {(isUntrusted || validation.status === "UNKNOWN") && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setValidation(null);
                      void runValidation();
                    }}
                    disabled={loading}
                    className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full border border-[#e8e8e8] bg-white text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                    Tekrar dene
                  </button>
                  {provider === "GA4" && validation.status === "UNKNOWN" && (
                    <button
                      type="button"
                      onClick={() => {
                        setValidation(null);
                        setCurrentStep("property");
                      }}
                      className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24]"
                    >
                      Property seç
                    </button>
                  )}
                </>
              )}
            </div>
          </>
        ) : null}
      </div>
    );
  }

  function renderSync() {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {meta.syncTitle}
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
            {meta.syncDesc}
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-[#f0f0f0]" />
              <div className="absolute inset-0 h-16 w-16 animate-spin rounded-full border-4 border-transparent border-t-[#95dbda]" />
            </div>
            <p className="mt-4 text-[14px] font-semibold text-[#0d0d12]">Veri çekiliyor…</p>
            <p className="mt-1 text-[12px] text-[#666d80]">Bu işlem birkaç saniye sürebilir</p>
          </div>
        ) : syncResult ? (
          <div className="rounded-[16px] border border-[#bbf7d0] bg-[#f0fdf4] p-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#22c55e]">
              <Check className="h-6 w-6 text-white" />
            </div>
            <p className="mt-3 text-[16px] font-semibold text-[#0d0d12]">
              {syncResult.recordsSynced} kayıt senkronize edildi
            </p>
            <p className="mt-1 text-[13px] text-[#666d80]">
              Veriler başarıyla çekildi ve kaydedildi.
            </p>
          </div>
        ) : (
          <>
            {/* What will happen */}
            <div className="rounded-[14px] bg-[#f7f9fa] p-4">
              <p className="text-[12px] font-semibold text-[#0d0d12]">Sync sırasında ne olacak?</p>
              <ul className="mt-2 space-y-1.5">
                {provider === "GA4" ? (
                  <>
                    <li className="text-[12px] leading-5 text-[#666d80]">• Son 14 günlük veri çekilir</li>
                    <li className="text-[12px] leading-5 text-[#666d80]">• DAU, toplam kullanıcı ve yeni kullanıcı kaydedilir</li>
                    <li className="text-[12px] leading-5 text-[#666d80]">• Mevcut veriler güncellenir, yenileri eklenir</li>
                  </>
                ) : (
                  <>
                    <li className="text-[12px] leading-5 text-[#666d80]">• Aktif abonelikler sayılır ve MRR hesaplanır</li>
                    <li className="text-[12px] leading-5 text-[#666d80]">• Son 30 günlük churn verisi çekilir</li>
                    <li className="text-[12px] leading-5 text-[#666d80]">• Finansal metrikler otomatik güncellenir</li>
                  </>
                )}
              </ul>
            </div>

            <button
              type="button"
              onClick={runSync}
              disabled={loading}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" />
              Sync&apos;i başlat
            </button>
          </>
        )}
      </div>
    );
  }

  function renderDone() {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#22c55e]/10">
          <ShieldCheck className="h-8 w-8 text-[#22c55e]" />
        </div>

        <div>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {meta.doneTitle}
          </h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
            {meta.doneDesc}
          </p>
        </div>

        <div className="rounded-[14px] bg-[#f0fdf4] border border-[#bbf7d0] p-4 text-left">
          <p className="text-[12px] leading-5 text-[#15803d]">
            {meta.trustExplain}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDone}
          className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#0d0d12] text-[14px] font-semibold text-white transition hover:bg-[#1a1a24]"
        >
          Tamamla
          <Check className="h-4 w-4" />
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const canGoBack =
    stepIndex > 0 &&
    currentStep !== "connect" &&
    currentStep !== "done";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-[520px] overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-[0_24px_80px_rgba(13,13,18,0.18)]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#eef1f2] px-6 py-4">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button
                type="button"
                onClick={() => setCurrentStep(steps[stepIndex - 1])}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] transition hover:bg-[#f6f6f6]"
              >
                <ChevronLeft className="h-4 w-4 text-[#666d80]" />
              </button>
            )}
            <div className="flex items-center gap-2">
              <BrandLogo provider={provider} className="h-5 w-5" />
              <span className="text-[13px] font-semibold text-[#0d0d12]">
                {meta.shortName} kurulumu
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-[#f6f6f6]"
          >
            <X className="h-4 w-4 text-[#666d80]" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-[#f0f0f0]">
          <div
            className="h-full bg-[#95dbda] transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-1 px-6 pt-4">
          {steps.map((step, i) => (
            <div
              key={step}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i <= stepIndex ? "bg-[#95dbda]" : "bg-[#f0f0f0]"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
          {currentStep === "connect" && renderConnect()}
          {currentStep === "property" && renderPropertySelect()}
          {currentStep === "validate" && renderValidation()}
          {currentStep === "sync" && renderSync()}
          {currentStep === "done" && renderDone()}
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PREVIEW_KEY_LABELS: Record<string, string> = {
  dau: "DAU",
  totalUsers: "Toplam kullanıcı",
  newUsers: "Yeni kullanıcı",
  dataPointCount: "Veri noktası",
  dateRange: "Tarih aralığı",
  activeSubscriptions: "Aktif abonelik",
  mrr: "MRR",
  currency: "Para birimi",
  recentCharges: "Son 30 gün ödeme",
};

function formatPreviewKey(key: string): string {
  return PREVIEW_KEY_LABELS[key] ?? key;
}

function formatPreviewValue(key: string, value: unknown): string {
  if (key === "mrr" && typeof value === "number") {
    return `${value.toLocaleString("tr-TR")}`;
  }
  if (typeof value === "number") return value.toLocaleString("tr-TR");
  if (typeof value === "string") return value;
  return String(value ?? "—");
}
