"use client";

import { useEffect, useState } from "react";

type Recommendation = {
  title: string;
  type: string;
  priority: "high" | "medium" | "low";
  impact_area: string;
  why_now: string;
  supporting_evidence: string[];
  assumptions: string[];
  missing_data: string[];
  confidence: "high" | "medium" | "low";
  expected_outcome: string;
  user_action: string;
};

type CoachRecommendationOutput = {
  primary_recommendation: Recommendation;
  supporting_recommendations: Recommendation[];
  missing_information_for_better_guidance: string[];
  critic_status: string;
};

interface AdvisorCardProps {
  productId: string;
  productName: string;
  eventType?: string;
}

function parseSuggestionError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg.includes('API key') || msg.includes('LoadAPIKeyError')) return 'AI servisi şu an yapılandırılmamış.';
  if (msg.includes('quota') || msg.includes('429')) return 'AI servisinin kullanım limiti doldu. Biraz sonra tekrar dene.';
  if (msg.includes('timeout') || msg.includes('408')) return 'İstek zaman aşımına uğradı.';
  if (msg.includes('500') || msg.includes('Internal')) return 'Sunucu hatası oluştu.';
  return 'Öneri şu an alınamadı.';
}

const PRIORITY_DOT: Record<string, string> = {
  high: "bg-[#ffd7ef]",
  medium: "bg-[#95dbda]",
  low: "bg-white/35",
};

const CONFIDENCE_LABEL: Record<string, string> = {
  high: "Yüksek güven",
  medium: "Orta güven",
  low: "Düşük güven",
};

export default function AdvisorCard({ productId, eventType = "DASHBOARD_VIEW" }: AdvisorCardProps) {
  const [suggestion, setSuggestion] = useState<CoachRecommendationOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [suggestionError, setSuggestionError] = useState<string | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState<CoachRecommendationOutput | null>(null);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSuggestion = () => {
    let cancelled = false;
    setLoading(true);
    setSuggestionError(null);
    fetch(`/api/products/${productId}/advice?event=${encodeURIComponent(eventType)}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((data: CoachRecommendationOutput | null) => {
        if (!cancelled) {
          setSuggestion(data);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setSuggestionError(parseSuggestionError(err));
          setLoading(false);
        }
      });
    return () => { cancelled = true; };
  };

  useEffect(() => {
    return loadSuggestion();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventType, productId]);

  async function askCoach() {
    const trimmed = question.trim();
    if (!trimmed) return;

    setAsking(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed, recentEvent: { type: "MANUAL_QUESTION" } }),
      });

      if (!res.ok) throw new Error("request failed");
      const data = (await res.json()) as CoachRecommendationOutput;
      setAnswer(data);
    } catch (err: unknown) {
      setError(parseSuggestionError(err));
    } finally {
      setAsking(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[20px] bg-[#0d0d12] p-6 animate-pulse">
        <div className="mb-3 h-4 w-32 rounded bg-white/10" />
        <div className="mb-4 h-6 w-3/4 rounded bg-white/10" />
        <div className="h-20 rounded-[12px] bg-white/5" />
      </div>
    );
  }

  const suggestionPrimary = suggestion?.primary_recommendation;

  return (
    <div className="rounded-[20px] bg-[#0d0d12] p-6 text-white">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          Tiramisup
        </span>
        {suggestionPrimary?.confidence && (
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
            {CONFIDENCE_LABEL[suggestionPrimary.confidence] ?? suggestionPrimary.confidence}
          </span>
        )}
      </div>

      {suggestionError ? (
        <div className="mb-5 rounded-[14px] border border-white/10 bg-white/5 p-4">
          <p className="text-[13px] text-white/50">{suggestionError}</p>
          <button
            onClick={loadSuggestion}
            className="mt-3 inline-flex h-8 items-center gap-1.5 rounded-full border border-white/15 bg-white/8 px-3 text-[12px] font-medium text-white/70 transition hover:bg-white/12 hover:text-white"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 6A4 4 0 1 1 6 2a4 4 0 0 1 2.83 1.17L10 2v4H6l1.59-1.59A2.5 2.5 0 1 0 8.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Tekrar dene
          </button>
        </div>
      ) : suggestionPrimary ? (
        <div className="mb-5 rounded-[14px] border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Bir sonraki öneri
            </p>
            <button
              onClick={loadSuggestion}
              title="Yenile"
              className="inline-flex h-6 w-6 items-center justify-center rounded-full text-white/30 transition hover:bg-white/10 hover:text-white/60"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 6A4 4 0 1 1 6 2a4 4 0 0 1 2.83 1.17L10 2v4H6l1.59-1.59A2.5 2.5 0 1 0 8.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <p className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.01em]">
            {suggestionPrimary.title}
          </p>
          <p className="mt-2 text-[13px] leading-6 text-white/70">{suggestionPrimary.why_now}</p>
          {suggestionPrimary.user_action && (
            <p className="mt-2 text-[12px] text-[#95dbda]">{suggestionPrimary.user_action}</p>
          )}
        </div>
      ) : (
        <div className="mb-5 rounded-[14px] border border-white/10 bg-white/5 p-4">
          <p className="text-[13px] text-white/50">Şu an için bir öneri yok. Aşağıdan soru sorabilirsin.</p>
        </div>
      )}

      <div className="mb-4">
        <label className="mb-2 block text-[12px] font-semibold uppercase tracking-[0.12em] text-white/40">
          Ürününle ilgili sor
        </label>
        <div className="flex gap-2">
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void askCoach();
            }}
            placeholder="Örn: Şimdi hangi metriği tanımlamalıyım?"
            className="h-11 flex-1 rounded-full border border-white/10 bg-white/5 px-4 text-[13px] text-white placeholder:text-white/35 outline-none transition focus:border-white/25"
          />
          <button
            onClick={() => void askCoach()}
            disabled={asking || !question.trim()}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {asking ? "Soruluyor…" : "Sor"}
          </button>
        </div>
        {error && <p className="mt-2 text-[12px] text-[#ffd7ef]">{error}</p>}
      </div>

      {answer && (
        <div className="space-y-3 rounded-[14px] border border-white/10 bg-white/5 p-4">
          {/* Primary recommendation */}
          <div>
            <div className="flex items-center gap-2">
              <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[answer.primary_recommendation.priority] ?? "bg-white/35"}`} />
              <p className="text-[16px] font-semibold text-white">{answer.primary_recommendation.title}</p>
              {answer.primary_recommendation.confidence && (
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px] text-white/60">
                  {CONFIDENCE_LABEL[answer.primary_recommendation.confidence] ?? answer.primary_recommendation.confidence}
                </span>
              )}
            </div>
            <p className="mt-1 text-[13px] leading-6 text-white/70">{answer.primary_recommendation.why_now}</p>
            {answer.primary_recommendation.user_action && (
              <p className="mt-2 text-[12px] text-[#95dbda]">{answer.primary_recommendation.user_action}</p>
            )}
            {answer.primary_recommendation.expected_outcome && (
              <p className="mt-1 text-[12px] text-white/45">{answer.primary_recommendation.expected_outcome}</p>
            )}
          </div>

          {/* Supporting recommendations */}
          {(answer.supporting_recommendations ?? []).length > 0 && (
            <div className="space-y-2">
              {(answer.supporting_recommendations ?? []).map((rec, i) => (
                <div key={`${rec.title}-${i}`} className="rounded-[12px] border border-white/8 bg-black/20 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${PRIORITY_DOT[rec.priority] ?? "bg-white/35"}`} />
                    <p className="text-[13px] font-semibold text-white">{rec.title}</p>
                  </div>
                  <p className="mt-1 text-[12px] leading-5 text-white/55">{rec.why_now}</p>
                </div>
              ))}
            </div>
          )}

          {/* Missing information */}
          {(answer.missing_information_for_better_guidance ?? []).length > 0 && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">Daha iyi öneriler için</p>
              <ul className="mt-2 space-y-1 text-[12px] text-white/55">
                {answer.missing_information_for_better_guidance.map((item, i) => (
                  <li key={`${item}-${i}`}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
