"use client";

import { useAdvisor } from "@/hooks/useAdvisor";
import { useState } from "react";

type CoachInsightProps = {
  productId: string;
  stage: string;
  locale: string;
};

export default function CoachInsight({ productId, stage, locale }: CoachInsightProps) {
  const { askAdvisor, response, loading } = useAdvisor(productId);
  const [expanded, setExpanded] = useState(false);
  const isEn = locale === "en";

  function handleAsk() {
    setExpanded(true);
    // Always send analysis in English (better AI reasoning),
    // then force response language via explicit instruction.
    const languageInstruction = isEn
      ? "Respond in English."
      : "You MUST respond in Turkish (Türkçe). Do not use English.";
    const prompt = `My product is at stage: ${stage}. Look at my checklists, completed tasks, and daily performance. Give me ONE specific focus point — what I should do next and exactly why. Be direct, no introduction, no self-presentation. ${languageInstruction}`;
    askAdvisor(prompt);
  }

  // Collapsed state — simple trigger button
  if (!expanded) {
    return (
      <button
        type="button"
        onClick={handleAsk}
        className="group w-full rounded-[14px] border border-dashed border-[#e0e0e0] bg-[#fafafa] px-5 py-4 text-left transition hover:border-[#c45d97]/40 hover:bg-[#fdf6fa]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fdf2f8] text-[#c45d97] transition group-hover:bg-[#fce7f3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <div>
            <p className="text-[13px] font-semibold text-[#0d0d12]">
              {isEn ? "Ask Tiramisup" : "Tiramisup'a sor"}
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {isEn
                ? "Get a personalized recommendation for right now"
                : "Şu an için kişiselleştirilmiş bir öneri al"}
            </p>
          </div>
        </div>
      </button>
    );
  }

  // Expanded state — loading or response
  return (
    <div className="rounded-[14px] border border-[#f3e8ef] bg-gradient-to-br from-[#fdf9fb] to-[#fdf2f8] p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fce7f3] text-[#c45d97]">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c45d97]">
            Tiramisup
          </span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] text-[#94a3b8] hover:text-[#666d80] transition"
        >
          {isEn ? "Close" : "Kapat"}
        </button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2.5 text-[13px] text-[#666d80]">
          <svg className="h-4 w-4 animate-spin text-[#c45d97]" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
            <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
          {isEn
            ? "Analyzing your data..."
            : "Verilerini analiz ediyor..."}
        </div>
      ) : response ? (
        <div>
          <p className="text-[14px] leading-7 text-[#0d0d12] whitespace-pre-wrap">
            {response}
          </p>
          <button
            type="button"
            onClick={handleAsk}
            className="mt-3 text-[12px] font-medium text-[#c45d97] hover:text-[#a14a7e] transition"
          >
            {isEn ? "Ask again" : "Tekrar sor"} →
          </button>
        </div>
      ) : (
        <p className="text-[13px] text-[#94a3b8]">
          {isEn ? "No recommendation available." : "Öneri alınamadı."}
        </p>
      )}
    </div>
  );
}
