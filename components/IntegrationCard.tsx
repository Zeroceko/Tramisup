"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Integration {
  provider: string;
  name: string;
  description: string;
  icon: string;
}

interface ExistingIntegration {
  id: string;
  status: string;
  lastSyncAt: Date | null;
}

const inputCls = "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

export default function IntegrationCard({
  integration,
  existingIntegration,
  productId,
}: {
  integration: Integration;
  existingIntegration?: ExistingIntegration;
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isConnected = existingIntegration?.status === "CONNECTED";

  const handleDisconnect = async () => {
    if (!existingIntegration) return;
    setLoading(true);
    try {
      await fetch(`/api/integrations/${existingIntegration.id}`, { method: "DELETE" });
      router.refresh();
    } catch (error) {
      console.error("Failed to disconnect integration:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    if (!existingIntegration) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      alert(`Senkronizasyon başarılı! Toplam ${data.recordsSynced} gün/kayıt veritabanına işlendi.`);
      router.refresh();
    } catch (error) {
      console.error("Failed to sync connection:", error);
      alert("Senkronizasyon başarısız: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5 hover:border-[#d0d0d0] transition">
      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-[10px] bg-[#f6f6f6] flex items-center justify-center text-[20px] shrink-0">
          {integration.icon}
        </div>
        <div>
          <h3 className="text-[15px] font-semibold text-[#0d0d12]">{integration.name}</h3>
          <p className="text-[12px] text-[#666d80] mt-0.5">{integration.description}</p>
        </div>
      </div>

      {isConnected ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#75fc96]/20 text-[11px] font-semibold text-[#1a7a36]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#75fc96]" />
              Bağlandı
            </span>
            {existingIntegration?.lastSyncAt && (
              <span className="text-[11px] text-[#9ca3af]">
                Son: {new Date(existingIntegration.lastSyncAt).toLocaleDateString("tr-TR")}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSync}
              disabled={loading}
              className="flex-1 h-9 rounded-full bg-[#95dbda] text-[12px] font-semibold text-[#0d0d12] hover:opacity-80 transition disabled:opacity-50"
            >
              {loading ? "Senkronize Ediliyor..." : "Şimdi Senkronize Et"}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="h-9 px-3 rounded-full border border-red-200 text-[12px] font-semibold text-red-500 hover:bg-red-50 transition disabled:opacity-50"
            >
              Kopar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => {
            setLoading(true);
            if (integration.provider === "GA4") {
              window.location.href = `/api/integrations/google/link?productId=${productId}`;
            } else if (integration.provider === "STRIPE") {
              window.location.href = `/api/integrations/stripe/link?productId=${productId}`;
            } else {
              setLoading(false);
              alert("Bu entegrasyon henüz desteklenmiyor.");
            }
          }}
          disabled={loading}
          className="w-full h-9 rounded-full border border-[#e8e8e8] text-[12px] font-semibold text-[#0d0d12] hover:bg-[#f6f6f6] transition disabled:opacity-50"
        >
          {loading ? "Yönlendiriliyor..." : `${integration.name} ile Bağlan`}
        </button>
      )}
    </div>
  );
}
