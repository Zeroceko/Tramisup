"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, RefreshCw, Settings2, Unplug } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import SourceSetupWizard from "@/components/SourceSetupWizard";

export interface IntegrationDef {
  provider: string;
  name: string;
  description: string;
  icon: string;
  comingSoon?: boolean;
}

export interface ExistingIntegration {
  id: string;
  status: string;
  provider: string;
  lastSyncAt: string | null;
  selectedPropertyId?: string | null;
  selectedPropertyDisplayName?: string | null;
  accountDisplayName?: string | null;
}

export type SourceState =
  | "DISCONNECTED"
  | "NEEDS_SETUP"
  | "SYNCED"
  | "STALE"
  | "ERROR";

export function getSourceState(
  existing: ExistingIntegration | undefined,
  provider: string
): SourceState {
  if (!existing || existing.status === "DISCONNECTED") return "DISCONNECTED";
  if (existing.status === "ERROR") return "ERROR";
  // CONNECTED:
  if (provider === "GA4" && !existing.selectedPropertyId) return "NEEDS_SETUP";
  if (!existing.lastSyncAt) return "NEEDS_SETUP";
  const msAgo = Date.now() - new Date(existing.lastSyncAt).getTime();
  return msAgo > 48 * 3_600_000 ? "STALE" : "SYNCED";
}

const STATE_CONFIG: Record<
  SourceState,
  { label: string; cls: string; dot: string }
> = {
  DISCONNECTED: {
    label: "Bağlı değil",
    cls: "bg-[#f6f6f6] text-[#666d80] border-[#e8e8e8]",
    dot: "bg-[#d0d0d0]",
  },
  NEEDS_SETUP: {
    label: "Kurulum gerekli",
    cls: "bg-[#fff7ed] text-[#c2410c] border-[#fed7aa]",
    dot: "bg-[#f97316]",
  },
  SYNCED: {
    label: "Güvenilir",
    cls: "bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]",
    dot: "bg-[#22c55e]",
  },
  STALE: {
    label: "Eski veri",
    cls: "bg-[#fefce8] text-[#a16207] border-[#fde68a]",
    dot: "bg-[#eab308]",
  },
  ERROR: {
    label: "Bağlantı hatası",
    cls: "bg-[#fef2f2] text-[#dc2626] border-[#fecaca]",
    dot: "bg-[#ef4444]",
  },
};

// What this source provides / what's missing without it
const SOURCE_VALUE: Record<
  string,
  { metrics: string; without: string; withIt: string }
> = {
  GA4: {
    metrics: "DAU · Retention · Funnel · Organik trafik",
    without:
      "Kullanıcı sayıları manuel giriş ya da tahminden gelir. Koç davranışsal sinyaller olmadan yorum yapar.",
    withIt:
      "Günlük aktif kullanıcı, retention ve dönüşüm verisi otomatik akar. Koç gerçek kullanım sinyalleriyle çalışır.",
  },
  STRIPE: {
    metrics: "MRR · Churn · Yeni abonelikler · Gelir trendi",
    without:
      "Gelir metrikleri manuel giriş gerektirir. MRR ve churn hesabı tahmini kalır.",
    withIt:
      "Gelir, churn ve abonelik değişimleri otomatik hesaplanır. Finansal koç yorumları gerçek veriye dayanır.",
  },
};

export default function IntegrationCard({
  integration,
  existingIntegration,
  productId,
  autoOpenPropertySelector = false,
}: {
  integration: IntegrationDef;
  existingIntegration?: ExistingIntegration;
  productId: string;
  autoOpenPropertySelector?: boolean;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);

  const sourceState = getSourceState(existingIntegration, integration.provider);
  const stateCfg = STATE_CONFIG[sourceState];
  const value = SOURCE_VALUE[integration.provider];
  const isConnected = existingIntegration?.status === "CONNECTED";
  const needsGa4Property =
    integration.provider === "GA4" &&
    isConnected &&
    !existingIntegration?.selectedPropertyId;

  const formattedLastSyncAt = existingIntegration?.lastSyncAt
    ? new Date(existingIntegration.lastSyncAt).toLocaleString("tr-TR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  useEffect(() => {
    if (autoOpenPropertySelector && needsGa4Property) {
      setWizardOpen(true);
    }
  }, [autoOpenPropertySelector, needsGa4Property]);

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingIntegration) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok)
        throw new Error(data.error || "Bağlantı kaldırılamadı");
      toast.success(`${integration.name} bağlantısı kaldırıldı.`);
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Bağlantı kaldırılamadı"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingIntegration) return;
    if (integration.provider === "GA4" && !existingIntegration.selectedPropertyId) {
      setWizardOpen(true);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/integrations/${existingIntegration.id}/sync`,
        { method: "POST" }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      toast.success(
        `Senkronizasyon başarılı. ${data.recordsSynced} kayıt işlendi.`
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Senkronizasyon başarısız"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (integration.comingSoon || loading) return;
    if (integration.provider === "GA4" || integration.provider === "STRIPE") {
      setWizardOpen(true);
    } else {
      toast.message("Bu kaynak henüz desteklenmiyor.");
    }
  };

  return (
    <>
      <div
        className={cn(
          "rounded-[20px] border bg-white p-5 transition",
          integration.comingSoon ? "opacity-60" : "border-[#e8e8e8]",
          sourceState === "ERROR" && "border-red-100",
          sourceState === "NEEDS_SETUP" && "border-orange-100"
        )}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#f6f6f6] overflow-hidden">
            <BrandLogo provider={integration.provider} className="h-6 w-6" />
          </div>
          {/* State badge */}
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
              integration.comingSoon
                ? "border-[#e8e8e8] bg-[#f6f6f6] text-[#94a3b8]"
                : stateCfg.cls
            )}
          >
            {!integration.comingSoon && (
              <span
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  sourceState === "SYNCED" ? "animate-pulse" : "",
                  stateCfg.dot
                )}
              />
            )}
            {integration.comingSoon ? "Yakında" : stateCfg.label}
          </span>
        </div>

        {/* Name + description */}
        <div className="mt-4">
          <h3 className="text-[16px] font-semibold text-[#0d0d12]">
            {integration.name}
          </h3>
          <p className="mt-1 text-[13px] leading-5 text-[#666d80]">
            {integration.description}
          </p>
        </div>

        {/* Metrics provided */}
        {value && (
          <div className="mt-3 rounded-[12px] bg-[#f6f6f6] px-3 py-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#8a8fa0]">
              Sağladığı veriler
            </p>
            <p className="mt-1 text-[12px] font-medium text-[#0d0d12]">
              {value.metrics}
            </p>
          </div>
        )}

        {/* State-specific callout */}
        {sourceState === "NEEDS_SETUP" && integration.provider === "GA4" && (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-orange-100 bg-[#fff7ed] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c2410c]" />
            <p className="text-[12px] leading-5 text-[#c2410c]">
              Hangi GA4 property&apos;den veri çekeceğimizi belirle — bu adım olmadan sync çalışmaz.
            </p>
          </div>
        )}

        {sourceState === "NEEDS_SETUP" && integration.provider === "STRIPE" && (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-orange-100 bg-[#fff7ed] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#c2410c]" />
            <p className="text-[12px] leading-5 text-[#c2410c]">
              Bağlantı kuruldu. İlk sync&apos;i başlatarak gelir verisini içeri al.
            </p>
          </div>
        )}

        {sourceState === "ERROR" && (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-red-100 bg-[#fef2f2] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-600" />
            <p className="text-[12px] leading-5 text-red-700">
              Bağlantı kesildi veya yetki sona erdi. Yeniden bağlanmak gerekiyor.
            </p>
          </div>
        )}

        {sourceState === "STALE" && (
          <div className="mt-3 flex items-start gap-2 rounded-[12px] border border-yellow-100 bg-[#fefce8] p-3">
            <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#a16207]" />
            <p className="text-[12px] leading-5 text-[#a16207]">
              Son sync 48 saatten eski. Veri tazelemesi önerilir.
            </p>
          </div>
        )}

        {/* Sync info */}
        {isConnected && formattedLastSyncAt && (
          <p className="mt-3 text-[11px] text-[#8a8fa0]">
            Son sync: {formattedLastSyncAt}
          </p>
        )}

        {/* GA4 property display */}
        {integration.provider === "GA4" && isConnected && existingIntegration?.selectedPropertyDisplayName && (
          <p className="mt-1 text-[12px] font-medium text-[#0d0d12]">
            {existingIntegration.selectedPropertyDisplayName}
          </p>
        )}

        {/* Trust explanation — only show for disconnected sources */}
        {value && sourceState === "DISCONNECTED" && (
          <p className="mt-3 text-[12px] leading-5 text-[#8a8fa0]">
            {value.without}
          </p>
        )}

        {/* Actions */}
        <div className="mt-4 space-y-2">
          {isConnected ? (
            <>
              {/* Guided setup CTA for NEEDS_SETUP */}
              {sourceState === "NEEDS_SETUP" && (
                <Button
                  type="button"
                  onClick={() => setWizardOpen(true)}
                  className="h-10 w-full rounded-full border-0 bg-[#0d0d12] text-[13px] font-semibold text-white shadow-none hover:bg-[#1a1a24]"
                >
                  Kurulumu tamamla
                </Button>
              )}

              {/* GA4 property selector */}
              {integration.provider === "GA4" && sourceState !== "NEEDS_SETUP" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setWizardOpen(true)}
                  disabled={loading || integration.comingSoon}
                  className="h-10 w-full rounded-full border-[#e8e8e8] bg-white text-[13px] text-[#0d0d12] hover:bg-[#f6f6f6]"
                >
                  <Settings2 className="h-4 w-4" />
                  {existingIntegration?.selectedPropertyId
                    ? "Property değiştir"
                    : "Property seç"}
                </Button>
              )}

              <Button
                type="button"
                onClick={handleSync}
                disabled={loading || integration.comingSoon}
                className="h-10 w-full rounded-full border-0 bg-[#95dbda]/20 text-[13px] font-semibold text-[#0d0d12] shadow-none hover:bg-[#95dbda]/40 disabled:opacity-50"
              >
                <RefreshCw
                  className={cn("h-4 w-4", loading ? "animate-spin" : "")}
                />
                {loading ? "Senkronize ediliyor…" : "Senkronize et"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleDisconnect}
                disabled={loading}
                className="h-9 w-full rounded-full text-[12px] text-[#8a8fa0] hover:bg-[#f6f6f6] hover:text-[#ef4444]"
              >
                <Unplug className="h-3.5 w-3.5" />
                Bağlantıyı kaldır
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleConnect}
              disabled={loading || integration.comingSoon}
              className={cn(
                "h-10 w-full rounded-full border-0 text-[13px] font-semibold shadow-none",
                integration.comingSoon
                  ? "bg-[#f6f6f6] text-[#94a3b8]"
                  : "bg-[#0d0d12] text-white hover:bg-[#1a1a24] disabled:opacity-50"
              )}
            >
              {loading
                ? "Yönlendiriliyor…"
                : integration.comingSoon
                ? "Roadmap'te"
                : "Bağlan"}
            </Button>
          )}
        </div>
      </div>

      {/* Source Setup Wizard */}
      {wizardOpen && (
        <SourceSetupWizard
          provider={integration.provider as "GA4" | "STRIPE"}
          productId={productId}
          integrationId={existingIntegration?.id ?? null}
          isConnected={isConnected}
          selectedPropertyId={existingIntegration?.selectedPropertyId}
          onClose={() => {
            setWizardOpen(false);
            router.refresh();
          }}
        />
      )}

    </>
  );
}
