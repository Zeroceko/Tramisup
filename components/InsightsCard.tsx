"use client";

import { useState } from "react";

type Insight = {
  area: string;
  issue: string;
  fix: string;
};

interface InsightsCardProps {
  productId: string;
  website: string;
}

export default function InsightsCard({ productId, website }: InsightsCardProps) {
  const [state, setState] = useState<"idle" | "loading" | "done" | "error" | "no-content">("idle");
  const [insights, setInsights] = useState<Insight[]>([]);

  async function analyze() {
    setState("loading");
    try {
      const res = await fetch(`/api/products/${productId}/insights`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      if (data.error && (!data.insights || data.insights.length === 0)) {
        setState("no-content");
        return;
      }
      setInsights(data.insights || []);
      setState("done");
    } catch {
      setState("error");
    }
  }

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
      <div className="mb-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">AI Analizi</p>
        <h2 className="mt-1 text-[18px] font-semibold text-[#0d0d12] tracking-[-0.01em]">Sitende ne eksik?</h2>
        <p className="mt-1 text-[13px] text-[#666d80] truncate">{website}</p>
      </div>

      {state === "idle" && (
        <button
          onClick={analyze}
          className="mt-2 inline-flex items-center justify-center w-full rounded-[10px] border border-[#e8e8e8] px-4 py-3 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#fafafa]"
        >
          Analiz et →
        </button>
      )}

      {state === "loading" && (
        <div className="mt-4 space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 rounded-[10px] bg-[#f6f6f6] animate-pulse" />
          ))}
        </div>
      )}

      {state === "error" && (
        <div className="mt-4 rounded-[10px] border border-dashed border-[#e8e8e8] px-4 py-6 text-center">
          <p className="text-[13px] text-[#666d80]">Analiz alınamadı.</p>
          <button onClick={analyze} className="mt-2 text-[13px] font-semibold text-[#0d0d12] hover:underline">
            Tekrar dene
          </button>
        </div>
      )}

      {state === "no-content" && (
        <div className="mt-4 rounded-[10px] border border-dashed border-[#e8e8e8] px-4 py-6 text-center">
          <p className="text-[13px] text-[#666d80]">Site içeriği okunamadı — JavaScript ile render edilen siteler desteklenmiyor.</p>
        </div>
      )}

      {state === "done" && insights.length === 0 && (
        <div className="mt-4 rounded-[10px] border border-dashed border-[#e8e8e8] px-4 py-6 text-center">
          <p className="text-[13px] text-[#666d80]">AI analiz tamamlanamadı.</p>
          <button onClick={analyze} className="mt-2 text-[13px] font-semibold text-[#0d0d12] hover:underline">
            Tekrar dene
          </button>
        </div>
      )}

      {state === "done" && insights.length > 0 && (
        <div className="mt-4 space-y-3">
          {insights.map((insight, i) => (
            <div key={i} className="rounded-[10px] border border-[#e8e8e8] px-4 py-3">
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#666d80]">{insight.area}</p>
              <p className="mt-1 text-[13px] font-semibold text-[#0d0d12]">{insight.issue}</p>
              <p className="mt-0.5 text-[12px] text-[#666d80] leading-5">{insight.fix}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
