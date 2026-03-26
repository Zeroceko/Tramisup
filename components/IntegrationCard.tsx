"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, ArrowUpRight, RefreshCw, Settings2, Unplug } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

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

type Ga4PropertyOption = {
  accountName: string;
  accountDisplayName: string;
  propertyId: string;
  propertyName: string;
  propertyDisplayName: string;
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
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [propertiesLoading, setPropertiesLoading] = useState(false);
  const [properties, setProperties] = useState<Ga4PropertyOption[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState(existingIntegration?.selectedPropertyId ?? "");
  const [savingProperty, setSavingProperty] = useState(false);
  const isConnected = existingIntegration?.status === "CONNECTED";
  const needsGa4Property =
    integration.provider === "GA4" && isConnected && !existingIntegration?.selectedPropertyId;

  const tone = integration.provider === "GA4"
    ? {
        shell: "border-[#efd9e4] bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff6fb_100%)]",
        icon: "bg-[linear-gradient(180deg,_#ffd8ea_0%,_#ffc3df_100%)] text-[#111014]",
        accent: "bg-[#fff0f7] text-[#b85e88] border-[#f3d8e6]",
        highlight: "bg-[#ffd8ea]",
      }
    : integration.provider === "STRIPE"
      ? {
          shell: "border-[#eee3d3] bg-[linear-gradient(180deg,_#fffdf8_0%,_#fff9ea_100%)]",
          icon: "bg-[linear-gradient(180deg,_#ffe992_0%,_#ffd65e_100%)] text-[#111014]",
          accent: "bg-[#fff6d7] text-[#8b6700] border-[#efe0a9]",
          highlight: "bg-[#ffe06a]",
        }
      : {
          shell: "border-[#ece5e9] bg-[linear-gradient(180deg,_#ffffff_0%,_#fbf8fa_100%)]",
          icon: "bg-[#f2edf1] text-[#6d6571]",
          accent: "bg-[#f5f1f4] text-[#6d6571] border-[#ece5e9]",
          highlight: "bg-[#f1e7ec]",
        };

  const loadProperties = useCallback(async () => {
    if (!existingIntegration || integration.provider !== "GA4") {
      return;
    }

    setPropertiesLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}/ga4-properties`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "GA4 properties could not be loaded");
      }

      setProperties(data.properties);
      setSelectedPropertyId(data.selectedPropertyId ?? data.properties[0]?.propertyId ?? "");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "GA4 properties could not be loaded");
    } finally {
      setPropertiesLoading(false);
    }
  }, [existingIntegration, integration.provider]);

  const openPropertySelector = useCallback(async () => {
    setPropertyDialogOpen(true);
    await loadProperties();
  }, [loadProperties]);

  useEffect(() => {
    setSelectedPropertyId(existingIntegration?.selectedPropertyId ?? "");
  }, [existingIntegration?.selectedPropertyId]);

  useEffect(() => {
    if (autoOpenPropertySelector && needsGa4Property) {
      setPropertyDialogOpen(true);
      void loadProperties();
    }
  }, [autoOpenPropertySelector, needsGa4Property, loadProperties]);

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingIntegration) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Integration could not be disconnected");
      }
      toast.success(`${integration.name} bağlantısı kaldırıldı.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Integration could not be disconnected");
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingIntegration) return;

    if (integration.provider === "GA4" && !selectedPropertyId) {
      await openPropertySelector();
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      toast.success(`Senkronizasyon başarılı. ${data.recordsSynced} kayıt işlendi.`);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Senkronizasyon başarısız");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    if (integration.comingSoon || isConnected || loading) return;

    setLoading(true);
    if (integration.provider === "GA4") {
      window.location.href = `/api/integrations/google/link?productId=${productId}`;
    } else if (integration.provider === "STRIPE") {
      window.location.href = `/api/integrations/stripe/link?productId=${productId}`;
    } else {
      setLoading(false);
      toast.message("Bu entegrasyon henüz desteklenmiyor.");
    }
  };

  const handleSaveProperty = async () => {
    if (!existingIntegration || !selectedPropertyId) {
      return;
    }

    setSavingProperty(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}/ga4-properties`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ propertyId: selectedPropertyId }),
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "GA4 property could not be saved");
      }

      toast.success(`${data.propertyDisplayName} seçildi.`);
      setPropertyDialogOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "GA4 property could not be saved");
    } finally {
      setSavingProperty(false);
    }
  };

  const selectedPropertyLabel = existingIntegration?.selectedPropertyDisplayName ?? "Henüz mülk seçilmedi";
  const selectedAccountLabel = existingIntegration?.accountDisplayName ?? "Google Analytics account";
  const formattedLastSyncAt = existingIntegration?.lastSyncAt
    ? new Date(existingIntegration.lastSyncAt).toLocaleString("tr-TR", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <>
      <article
        className={cn(
          "relative overflow-hidden rounded-[28px] border p-5 shadow-[0_18px_44px_rgba(17,16,20,0.06)] transition-transform duration-300 hover:-translate-y-0.5",
          integration.comingSoon ? "opacity-75" : "",
          tone.shell,
        )}
      >
        <div className="absolute right-5 top-5 flex items-center gap-2">
          {integration.comingSoon ? (
            <span className="rounded-full border border-[#ece5e9] bg-white/80 px-3 py-1 text-[11px] font-semibold text-[#6d6571]">
              Yakında
            </span>
          ) : isConnected ? (
            <span
              className={cn(
                "rounded-full border px-3 py-1 text-[11px] font-semibold",
                needsGa4Property ? "border-[#f2d89a] bg-[#fff6d7] text-[#8b6700]" : tone.accent,
              )}
            >
              {needsGa4Property ? "Property sec" : "Bağlı"}
            </span>
          ) : (
            <span className="rounded-full border border-[#ece5e9] bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#6d6571]">
              Hazır
            </span>
          )}
        </div>

        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[18px] shadow-sm overflow-hidden", tone.icon)}>
          <BrandLogo provider={integration.provider} className="h-7 w-7" />
        </div>

        <div className="mt-6 space-y-2">
          <h3 className="font-outfit text-[22px] leading-tight tracking-[-0.03em] text-[#111014]">
            {integration.name}
          </h3>
          <p className="text-[13px] leading-6 text-[#605965]">{integration.description}</p>
        </div>

        <div className="mt-6 rounded-[22px] border border-white/70 bg-white/70 p-4">
          {integration.provider === "GA4" ? (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8390]">Selected property</p>
              <p className="mt-2 text-[15px] font-semibold text-[#111014]">{selectedPropertyLabel}</p>
              <p className="mt-1 text-[12px] text-[#726b77]">{selectedAccountLabel}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8390]">Sync status</p>
              <p className="mt-2 text-[15px] font-semibold text-[#111014]">
                {formattedLastSyncAt ? `Son sync ${formattedLastSyncAt}` : "Henüz sync yapılmadı"}
              </p>
              <p className="mt-1 text-[12px] text-[#726b77]">
                {isConnected ? "Gelir ve churn katmanı hazır." : "Bağlantı kurulunca günlük revenue verisi akacak."}
              </p>
            </>
          )}
        </div>

        {needsGa4Property ? (
          <div className="mt-4 flex items-start gap-3 rounded-[20px] border border-[#f0dfa1] bg-[#fff8de] p-4">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[#9b7600]" />
            <p className="text-[12px] leading-6 text-[#775c00]">
              Bu hesapta birden fazla GA4 mülkü olabilir. Sync öncesinde doğru property&apos;yi sabitleyelim.
            </p>
          </div>
        ) : null}

        <div className="mt-6 grid gap-2 sm:grid-cols-2">
          {isConnected ? (
            <>
              {integration.provider === "GA4" ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => void openPropertySelector()}
                  disabled={loading || propertiesLoading || integration.comingSoon}
                  className="h-11 rounded-full border-[#ecdfe7] bg-white text-[#111014] hover:bg-[#fff4fa]"
                >
                  <Settings2 className="h-4 w-4" />
                  Property seç
                </Button>
              ) : null}

              <Button
                type="button"
                onClick={handleSync}
                disabled={loading || integration.comingSoon}
                className={cn(
                  "h-11 rounded-full border-0 text-[#111014] shadow-none",
                  integration.provider === "STRIPE" ? "bg-[#ffe166] hover:bg-[#ffd84a]" : "bg-[#ffd8ea] hover:bg-[#ffc6df]",
                )}
              >
                <RefreshCw className={cn("h-4 w-4", loading ? "animate-spin" : "")} />
                Senkronize et
              </Button>

              <Button
                type="button"
                variant="ghost"
                onClick={handleDisconnect}
                disabled={loading}
                className="h-11 rounded-full text-[#7d445e] hover:bg-white/80 hover:text-[#5d2940] sm:col-span-2"
              >
                <Unplug className="h-4 w-4" />
                Bağlantıyı kaldır
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={handleConnect}
              disabled={loading || integration.comingSoon}
              className={cn(
                "h-11 rounded-full border-0 text-[#111014] shadow-none sm:col-span-2",
                integration.comingSoon ? "bg-[#f2edf1] text-[#817985]" : "bg-[#111014] text-white hover:bg-[#28232a]",
              )}
            >
              {integration.comingSoon ? "Roadmap'te" : "Bağlantıyı başlat"}
              {!integration.comingSoon ? <ArrowUpRight className="h-4 w-4" /> : null}
            </Button>
          )}
        </div>
      </article>

      <Dialog open={propertyDialogOpen} onOpenChange={setPropertyDialogOpen}>
        <DialogContent className="rounded-[28px] border-[#eadfe6] bg-[#fffafc] p-0 shadow-[0_24px_80px_rgba(17,16,20,0.14)] sm:max-w-[560px]">
          <div className="border-b border-[#f0e4ea] p-6">
            <DialogHeader className="space-y-3 text-left">
              <DialogTitle className="font-outfit text-[28px] tracking-[-0.03em] text-[#111014]">
                Select GA4 property
              </DialogTitle>
              <DialogDescription className="max-w-xl text-[14px] leading-7 text-[#625c66]">
                Bu adim, Google Analytics hesabinda hangi property&apos;den veri cekecegimizi sabitler.
                Founder Coach bundan sonra bu kaynagi dogru urun olarak yorumlar.
              </DialogDescription>
            </DialogHeader>
          </div>
          <div className="space-y-4 p-6">
            <div className="rounded-[22px] border border-[#efe2e8] bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b8390]">Property</p>
              <div className="mt-3">
                <Select value={selectedPropertyId} onValueChange={setSelectedPropertyId} disabled={propertiesLoading}>
                  <SelectTrigger className="h-12 rounded-[18px] border-[#eadfe6] bg-[#fffafc] text-left shadow-none focus:ring-[#ffd8ea]">
                    <SelectValue placeholder={propertiesLoading ? "Properties yükleniyor..." : "Bir GA4 property seç"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-[18px] border-[#eadfe6] bg-white">
                    {properties.map((property) => (
                      <SelectItem key={property.propertyId} value={property.propertyId} className="rounded-[12px] py-3">
                        {property.propertyDisplayName} · {property.accountDisplayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {!propertiesLoading && properties.length === 0 ? (
              <div className="rounded-[22px] border border-[#f0dfa1] bg-[#fff8de] p-4 text-[13px] leading-6 text-[#775c00]">
                Bu Google hesabında erişilebilir bir GA4 property bulunamadı. Önce doğru Google hesabıyla property erişimini kontrol et.
              </div>
            ) : null}
          </div>

          <DialogFooter className="border-t border-[#f0e4ea] p-6 sm:justify-between sm:space-x-0">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setPropertyDialogOpen(false)}
              className="h-11 rounded-full text-[#6d6571] hover:bg-white"
            >
              Vazgeç
            </Button>
            <Button
              type="button"
              onClick={handleSaveProperty}
              disabled={savingProperty || !selectedPropertyId}
              className="h-11 rounded-full bg-[#111014] px-5 text-white hover:bg-[#28232a]"
            >
              {savingProperty ? "Kaydediliyor..." : "Property'yi kaydet"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
