"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export interface IntegrationDef {
  provider: string;
  name: string;
  description: string;
  icon: string | React.ReactNode;
  comingSoon?: boolean;
}

interface ExistingIntegration {
  id: string;
  status: string;
  lastSyncAt: Date | null;
}

export default function IntegrationCard({
  integration,
  existingIntegration,
  productId,
}: {
  integration: IntegrationDef;
  existingIntegration?: ExistingIntegration;
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isConnected = existingIntegration?.status === "CONNECTED";

  const handleDisconnect = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
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

  const handleSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!existingIntegration) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/integrations/${existingIntegration.id}/sync`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      alert(`Senkronizasyon başarılı! Toplam ${data.recordsSynced} gün/kayıt veritabanına işlendi.`);
      router.refresh();
    } catch (error) {
      alert("Senkronizasyon başarısız: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (integration.comingSoon || isConnected || loading) return;
    
    setLoading(true);
    if (integration.provider === "GA4") {
      window.location.href = `/api/integrations/google/link?productId=${productId}`;
    } else if (integration.provider === "STRIPE") {
      window.location.href = `/api/integrations/stripe/link?productId=${productId}`;
    } else {
      setLoading(false);
      alert("Bu entegrasyon henüz desteklenmiyor.");
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative group rounded-xl border p-5 transition-all overflow-hidden ${
        integration.comingSoon
          ? "bg-[#161616]/50 border-[#2e2e2e]/50 cursor-not-allowed opacity-60"
          : "bg-[#161616] border-[#2e2e2e] hover:border-[#444] hover:bg-[#1a1a1a] cursor-pointer"
      }`}
    >
      <div className="flex justify-between items-start mb-4">
        {/* ICON */}
        <div className="w-10 h-10 rounded-lg bg-[#222] border border-[#333] flex items-center justify-center text-[18px] shadow-sm shrink-0">
          {integration.icon}
        </div>

        {/* STATUS BADGE */}
        {integration.comingSoon ? (
          <span className="text-[11px] font-medium text-[#888] px-2.5 py-1 rounded-md bg-[#222]">Yakında</span>
        ) : isConnected ? (
          <span className="text-[11px] font-medium text-[#4ade80] px-2.5 py-1 rounded-md bg-[#4ade80]/10 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]"></span>
            Bağlandı
          </span>
        ) : (
          <span className="text-[11px] font-medium text-[#e4e4e7] px-2.5 py-1 rounded-md bg-[#333] group-hover:bg-[#444] transition">
            {loading ? "Yönlendiriliyor..." : "Etkinleştir"}
          </span>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-[15px] font-semibold text-[#f4f4f5] tracking-tight">{integration.name}</h3>
        <p className="text-[13px] text-[#a1a1aa] mt-1 pr-2 leading-relaxed">{integration.description}</p>
      </div>

      {/* QUICK ACTIONS FOR CONNECTED */}
      {isConnected && (
        <div className="pt-4 border-t border-[#333] flex items-center justify-between gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {existingIntegration?.lastSyncAt ? (
             <span className="text-[10px] text-[#666]">
               Son Sync: {new Date(existingIntegration.lastSyncAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute:'2-digit' })}
             </span>
          ) : <span />}
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleSync}
              disabled={loading}
              className="px-3 py-1.5 rounded-md bg-[#fafafa] text-[11px] font-medium text-[#000] hover:bg-[#e4e4e7] transition disabled:opacity-50"
            >
              Senkronize Et
            </button>
            <button 
              onClick={handleDisconnect}
              disabled={loading}
              className="px-3 py-1.5 rounded-md border border-[#444] text-[11px] font-medium text-[#ef4444] hover:bg-[#ef4444]/10 hover:border-[#ef4444]/30 transition disabled:opacity-50"
            >
              Kopar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
