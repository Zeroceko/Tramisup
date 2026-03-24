'use client';

import { useAdvisor } from '@/hooks/useAdvisor';
import { useEffect, useState } from 'react';
import { Command } from 'lucide-react';

export default function TiramisupAdviceCard({ productId, stage }: { productId: string, stage: string }) {
  const { askAdvisor, response, loading } = useAdvisor(productId);
  const [hasFetched, setHasFetched] = useState(false);

  useEffect(() => {
    if (!hasFetched) {
      setHasFetched(true);
      // Fetches advice based on current stage dynamically upon loading.
      askAdvisor(`Ürünümün şu anki aşaması: ${stage}. Checklistlerime, tamamlanan görevlerime ve günlük performansıma bakarak bana 'Ne yapmam gerektiği' konusunda SADECE TEK BİR odak noktası ver. Sohbet etme, kendini tanıtma, sadece direkt mentor tavsiyeni yaz.`);
    }
  }, [hasFetched, askAdvisor, stage]);

  return (
    <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6 relative overflow-hidden">
        {/* Subtle background decoration */}
        <div className="absolute right-0 top-0 h-40 w-40 -translate-y-12 translate-x-12 opacity-10 blur-2xl rounded-full bg-[#c45d97] pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#C45D97]">
                Tiramisup Önerisi
              </span>
          </div>

          <div className="min-h-[60px]">
            {loading ? (
                <div className="flex items-center gap-3 text-[#666d80] text-[13px] animate-pulse">
                <Command size={14} className="animate-spin text-[#c45d97]" /> Tiramisup verilerini analiz ediyor, sana özel bir odak belirliyor...
                </div>
            ) : response ? (
                <p className="text-[14px] leading-7 text-[#0d0d12] font-medium whitespace-pre-wrap">
                    {response}
                </p>
            ) : (
                <p className="text-[13px] text-[#666d80]">Öneri bulunamadı. Lütfen daha sonra tekrar kontrol et.</p>
            )}
          </div>
      </div>
    </div>
  );
}
