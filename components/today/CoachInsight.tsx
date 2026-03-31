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

  if (!expanded) {
    return (
      <div className="relative min-h-[320px] overflow-visible">
        <button
          type="button"
          onClick={handleAsk}
          className="group relative flex h-full min-h-[320px] w-full overflow-hidden rounded-[32px] border border-[#f2e7ee] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.96),_rgba(255,247,250,0.88)_45%,_rgba(255,241,246,0.92)_100%)] p-6 text-left shadow-[0_28px_80px_rgba(23,20,31,0.08)] backdrop-blur transition hover:border-[#d8a2bd]/70 hover:shadow-[0_34px_90px_rgba(23,20,31,0.12)]"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_15%,rgba(255,224,238,0.55),transparent_34%),radial-gradient(circle_at_80%_82%,rgba(255,236,218,0.58),transparent_26%)]" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 text-[#b26b49] shadow-[0_12px_24px_rgba(178,107,73,0.14)]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3l1.9 4.6L19 9.5l-4 3.2 1.3 5.1L12 15l-4.3 2.8 1.3-5.1-4-3.2 5.1-1.9L12 3Z" />
                </svg>
              </span>
              <div>
                <p className="text-[14px] font-semibold text-[#33231f]">
                  {isEn ? "Ask Tiramisup" : "Tiramisup'a sor"}
                </p>
                <p className="text-[12px] leading-5 text-[#8a7d7a]">
                  {isEn
                    ? "Open today's suggestion in the empty board space"
                    : "Bugünün önerisini sağdaki boş alanda aç"}
                </p>
              </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-[250px] items-center justify-center pt-6">
              <div className="absolute inset-x-2 bottom-3 h-24 rounded-full bg-[radial-gradient(circle,rgba(171,95,38,0.30),rgba(255,255,255,0)_72%)] blur-2xl" />
              <Image
                src="/assets/illus-tiramisu-slice.png"
                alt={isEn ? "Tiramisup suggestion launcher" : "Tiramisup öneri başlatıcısı"}
                width={220}
                height={220}
                className="relative z-10 h-auto w-[220px] drop-shadow-[0_24px_40px_rgba(117,63,25,0.18)] transition duration-300 group-hover:scale-[1.03]"
                priority
              />
              <span className="absolute inset-0 z-20 flex items-center justify-center">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#8f5a3a]/82 text-white shadow-[0_12px_24px_rgba(117,63,25,0.22)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.9 4.6L19 9.5l-4 3.2 1.3 5.1L12 15l-4.3 2.8 1.3-5.1-4-3.2 5.1-1.9L12 3Z" />
                  </svg>
                </span>
              </span>
            </div>

            <p className="text-[12px] font-medium text-[#a16f57]">
              {isEn ? "Tap to open Tiramisup's recommendation" : "Tiramisup önerisini açmak için dokun"}
            </p>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="relative min-h-[340px] overflow-visible">
      <div className="relative z-20 ml-auto w-full max-w-[min(760px,calc(100vw-2rem))] overflow-hidden rounded-[34px] border border-[#efe2d9] bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.98),_rgba(255,247,250,0.92)_38%,_rgba(255,241,246,0.96)_100%)] shadow-[0_34px_110px_rgba(23,20,31,0.14)] xl:absolute xl:right-0 xl:top-0 xl:w-[760px]">
        <div className="grid gap-0 md:grid-cols-[minmax(0,1.25fr)_280px]">
          <div className="bg-white/82 p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f7eee7] text-[#aa6d4f] shadow-[0_14px_28px_rgba(170,109,79,0.12)]">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 3l1.9 4.6L19 9.5l-4 3.2 1.3 5.1L12 15l-4.3 2.8 1.3-5.1-4-3.2 5.1-1.9L12 3Z" />
                  </svg>
                </span>
                <div>
                  <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-[#aa6d4f]">
                    Tiramisup
                  </p>
                  <p className="text-[12px] text-[#9b877c]">
                    {isEn ? "Personalized recommendation" : "Kişiselleştirilmiş öneri"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="text-[13px] font-medium text-[#aa6d4f] transition hover:text-[#8c573a]"
              >
                {isEn ? "Close" : "Kapat"}
              </button>
            </div>

            <div className="mt-6 min-h-[176px]">
              {loading ? (
                <div className="flex items-center gap-3 text-[14px] text-[#6c5f58]">
                  <svg className="h-4 w-4 animate-spin text-[#aa6d4f]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2.5" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                  {isEn ? "Analyzing your board and choosing the next move..." : "Board'unu okuyup bir sonraki doğru hamleyi seçiyor..."}
                </div>
              ) : response ? (
                <p className="whitespace-pre-wrap text-[17px] leading-9 text-[#382a24]">
                  {response}
                </p>
              ) : (
                <p className="text-[14px] leading-7 text-[#8a7d7a]">
                  {isEn ? "No recommendation available." : "Öneri alınamadı."}
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={handleAsk}
              className="mt-6 inline-flex items-center gap-2 text-[15px] font-semibold text-[#aa6d4f] transition hover:text-[#8c573a]"
            >
              {isEn ? "Ask again" : "Tekrar sor"}
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <div className="relative flex min-h-[240px] items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(255,243,221,0.95),rgba(255,227,177,0.82)_38%,rgba(255,212,146,0.55)_72%,rgba(255,255,255,0.2)_100%)] p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_66%,rgba(132,67,27,0.22),transparent_36%),radial-gradient(circle_at_24%_22%,rgba(255,255,255,0.55),transparent_34%)]" />
            <Image
              src="/assets/illus-tiramisu-slice.png"
              alt=""
              width={220}
              height={220}
              className="absolute inset-x-0 bottom-[-8px] mx-auto h-auto w-[210px] opacity-80 blur-[0.4px]"
            />
            <div className="relative z-10 text-center">
              <p className="text-[15px] font-semibold uppercase tracking-[0.16em] text-[#8b5739]">
                Tiramisup
              </p>
              <h3 className="mt-3 text-[40px] font-semibold leading-[0.95] tracking-[-0.04em] text-[#4a2d22]">
                {isEn ? "Suggestion" : "Önerisi"}
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
