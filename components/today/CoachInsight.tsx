"use client";

import { useAdvisor } from "@/hooks/useAdvisor";
import Image from "next/image";
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

  return (
    <div
      className={`relative z-20 ml-auto h-[132px] origin-right overflow-hidden rounded-[24px] border border-white/80 bg-white/78 shadow-[0_18px_54px_rgba(23,20,31,0.10)] backdrop-blur-[18px] transition-[width,transform,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        expanded ? "w-[430px] shadow-[0_26px_70px_rgba(23,20,31,0.14)]" : "w-[138px]"
      }`}
    >
      <div
        className={`absolute left-0 top-0 h-full overflow-hidden transition-[width,opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "w-[292px] opacity-100 translate-x-0" : "w-0 opacity-0 translate-x-8"
        }`}
      >
        <div className="flex h-full flex-col bg-white/88 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f6ebe2] text-[#b37250]">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 18l6-6-6-6" />
                  <path d="M8 6l-6 6 6 6" />
                </svg>
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#b37250]">
                Tiramisup
              </span>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="text-[11px] font-medium text-[#b08e7d] transition hover:text-[#8f6c5c]"
            >
              {isEn ? "Close" : "Kapat"}
            </button>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto pr-1">
            {loading ? (
              <div className="flex items-center gap-2 text-[13px] leading-6 text-[#6c5f58]">
                <svg className="h-4 w-4 animate-spin text-[#aa6d4f]" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                {isEn ? "Reading your board..." : "Board'un okunuyor..."}
              </div>
            ) : response ? (
              <p className="whitespace-pre-wrap text-[13px] leading-6 text-[#3e312b]">
                {response}
              </p>
            ) : (
              <p className="text-[13px] leading-6 text-[#8a7d7a]">
                {isEn ? "No recommendation available." : "Öneri alınamadı."}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={handleAsk}
            className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-[#b37250] transition hover:text-[#8f5a3a]"
          >
            {isEn ? "Ask again" : "Tekrar sor"}
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>

      <button
        type="button"
        onClick={expanded ? undefined : handleAsk}
        className={`absolute right-0 top-0 h-full overflow-hidden rounded-[24px] bg-[radial-gradient(circle_at_top,_rgba(255,245,224,0.98),rgba(255,230,187,0.88)_38%,rgba(255,212,146,0.58)_78%,rgba(255,255,255,0.34)_100%)] transition-[width] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          expanded ? "w-[138px] cursor-default" : "w-full"
        }`}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_58%,rgba(132,67,27,0.18),transparent_34%),radial-gradient(circle_at_22%_18%,rgba(255,255,255,0.6),transparent_28%)]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <Image
            src="/assets/illus-tiramisu-slice.png"
            alt={isEn ? "Open Tiramisup suggestion" : "Tiramisup önerisini aç"}
            width={126}
            height={126}
            className={`h-auto w-[118px] drop-shadow-[0_14px_26px_rgba(117,63,25,0.14)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              expanded ? "scale-105" : "scale-100 hover:scale-[1.04]"
            }`}
            priority
          />
        </div>
        {expanded && (
          <div className="relative z-10 flex h-full items-center justify-center px-3 text-center">
            <h3 className="text-[18px] font-semibold leading-[1.05] tracking-[-0.04em] text-[#4a2d22]">
              Tiramisup
              <br />
              {isEn ? "Suggestion" : "Önerisi"}
            </h3>
          </div>
        )}
      </button>
    </div>
  );
}
