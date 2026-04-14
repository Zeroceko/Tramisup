"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type CoachInsightProps = {
  productId: string;
  stage: string;
  locale: string;
};

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

type PreviousCoachAnswer = {
  title?: string;
  why_now?: string;
  user_action?: string;
};

type AskMode = "quick" | "balanced" | "deep";

type TaskCandidate = {
  id: string;
  title: string;
  description: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
};

const MODE_COPY: Record<AskMode, { tr: string; en: string }> = {
  quick: { tr: "Hızlı", en: "Quick" },
  balanced: { tr: "Dengeli", en: "Balanced" },
  deep: { tr: "Derin", en: "Deep" },
};

const PRIORITY_STYLES = {
  HIGH: "bg-[#ffe1e8] text-[#b42318]",
  MEDIUM: "bg-[#fff3d7] text-[#b54708]",
  LOW: "bg-[#edf7f7] text-[#0f766e]",
} as const;

function parseSuggestionError(err: unknown, locale: "en" | "tr"): string {
  const msg = err instanceof Error ? err.message : String(err);
  if (locale === "en") {
    if (msg.includes("API key") || msg.includes("LoadAPIKeyError")) return "The AI service is not configured right now.";
    if (msg.includes("quota") || msg.includes("429")) return "The AI service quota is exhausted. Try again shortly.";
    if (msg.includes("timeout") || msg.includes("408")) return "The request timed out.";
    if (msg.includes("500") || msg.includes("Internal")) return "A server error occurred.";
    return "The suggestion could not be loaded right now.";
  }

  if (msg.includes("API key") || msg.includes("LoadAPIKeyError")) return "AI servisi şu an yapılandırılmamış.";
  if (msg.includes("quota") || msg.includes("429")) return "AI servisinin kullanım limiti doldu. Biraz sonra tekrar dene.";
  if (msg.includes("timeout") || msg.includes("408")) return "İstek zaman aşımına uğradı.";
  if (msg.includes("500") || msg.includes("Internal")) return "Sunucu hatası oluştu.";
  return "Öneri şu an alınamadı.";
}

function toTaskPriority(priority: Recommendation["priority"]): TaskCandidate["priority"] {
  if (priority === "high") return "HIGH";
  if (priority === "low") return "LOW";
  return "MEDIUM";
}

function buildTaskDescription(rec: Recommendation, locale: string) {
  const nextStepLabel = locale === "en" ? "Next step" : "Sonraki adım";
  const outcomeLabel = locale === "en" ? "Expected outcome" : "Beklenen etki";
  const parts = [rec.why_now];

  if (rec.user_action) {
    parts.push(`${nextStepLabel}: ${rec.user_action}`);
  }

  if (rec.expected_outcome) {
    parts.push(`${outcomeLabel}: ${rec.expected_outcome}`);
  }

  return parts.filter(Boolean).join("\n");
}

function buildTaskCandidates(
  answer: CoachRecommendationOutput,
  locale: string,
  mode: AskMode
): TaskCandidate[] {
  const recommendations =
    mode === "quick"
      ? [answer.primary_recommendation]
      : mode === "balanced"
        ? [answer.primary_recommendation, ...answer.supporting_recommendations.slice(0, 1)]
        : [answer.primary_recommendation, ...answer.supporting_recommendations];

  return recommendations.map((rec, index) => ({
    id: `${rec.type}-${index}-${rec.title}`,
    title: rec.title,
    description: buildTaskDescription(rec, locale),
    priority: toTaskPriority(rec.priority),
  }));
}

export default function CoachInsight({ productId, stage, locale }: CoachInsightProps) {
  const router = useRouter();
  const isEn = locale === "en";
  const uiLocale = isEn ? "en" : "tr";
  const [expanded, setExpanded] = useState(false);
  const [question, setQuestion] = useState("");
  const [mode, setMode] = useState<AskMode>("balanced");
  const [loading, setLoading] = useState(false);
  const [addingTasks, setAddingTasks] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answer, setAnswer] = useState<CoachRecommendationOutput | null>(null);
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [lastAddedTitles, setLastAddedTitles] = useState<string[]>([]);
  const [hiddenTaskIds, setHiddenTaskIds] = useState<string[]>([]);
  const [previousAnswer, setPreviousAnswer] = useState<PreviousCoachAnswer | null>(null);

  const suggestedPrompts = useMemo(
    () =>
      isEn
        ? [
            "What should I focus on this week?",
            "What is blocking launch right now?",
            "Turn this week's priorities into tasks",
          ]
        : [
            "Bu hafta neye odaklanmalıyım?",
            "Şu an launch'ı ne blokluyor?",
            "Bu haftanın önceliklerini göreve çevir",
          ],
    [isEn]
  );

  const taskCandidates = useMemo(
    () => (answer ? buildTaskCandidates(answer, uiLocale, mode) : []),
    [answer, mode, uiLocale]
  );
  const visibleTaskCandidates = useMemo(
    () => taskCandidates.filter((task) => !hiddenTaskIds.includes(task.id)),
    [hiddenTaskIds, taskCandidates]
  );

  async function askCoach(prefilledQuestion?: string) {
    const prompt = (prefilledQuestion ?? question).trim();
    if (!prompt) return;

    setExpanded(true);
    setLoading(true);
    setError(null);
    setLastAddedTitles([]);
    setHiddenTaskIds([]);

    try {
      const res = await fetch(`/api/products/${productId}/advice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          mode,
          recentEvent: { type: "MANUAL_QUESTION" },
          previousAnswer,
          locale: uiLocale,
        }),
      });

      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as CoachRecommendationOutput;
      setAnswer(data);
      setQuestion(prompt);
      setPreviousAnswer({
        title: data.primary_recommendation.title,
        why_now: data.primary_recommendation.why_now,
        user_action: data.primary_recommendation.user_action,
      });

      const candidates = buildTaskCandidates(data, uiLocale, mode);
      setSelectedTaskIds(candidates.length > 0 ? [candidates[0].id] : []);
    } catch (err: unknown) {
      setError(parseSuggestionError(err, uiLocale));
    } finally {
      setLoading(false);
    }
  }

  async function addSelectedTasks() {
    const selectedTasks = visibleTaskCandidates.filter((task) => selectedTaskIds.includes(task.id));
    if (selectedTasks.length === 0) return;

    setAddingTasks(true);
    setError(null);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tasks: selectedTasks.map((task) => ({
            productId,
            title: task.title,
            description: task.description,
            priority: task.priority,
          })),
        }),
      });

      const payload = await res.json().catch(() => null) as { error?: string } | null;
      if (!res.ok) throw new Error(payload?.error ?? String(res.status));

      setLastAddedTitles(selectedTasks.map((task) => task.title));
      setHiddenTaskIds((current) => [...current, ...selectedTasks.map((task) => task.id)]);
      setSelectedTaskIds((current) =>
        current.filter((taskId) => !selectedTasks.some((task) => task.id === taskId))
      );
      router.refresh();
    } catch (err: unknown) {
      setError(parseSuggestionError(err, uiLocale));
    } finally {
      setAddingTasks(false);
    }
  }

  function toggleTask(taskId: string) {
    setSelectedTaskIds((current) =>
      current.includes(taskId)
        ? current.filter((id) => id !== taskId)
        : [...current, taskId]
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="group w-full rounded-[26px] border border-dashed border-[#eadde6] bg-white px-5 py-5 text-left shadow-[0_10px_28px_rgba(23,20,31,0.04)] transition hover:border-[#c45d97]/40 hover:bg-[#fff8fb]"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fdf2f8] text-[#c45d97] transition group-hover:bg-[#fce7f3]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
            </svg>
          </span>
          <div>
            <p className="text-[14px] font-semibold text-[#0d0d12]">
              {isEn ? "Ask Tiramisup" : "Tiramisup'a sor"}
            </p>
            <p className="text-[11px] text-[#94a3b8]">
              {isEn
                ? "Ask a question, get an answer, and turn it into action"
                : "Soru sor, yanıt al, göreve çevir"}
            </p>
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="rounded-[28px] border border-[#f3e8ef] bg-[#fef7fb] p-5 shadow-[0_12px_34px_rgba(23,20,31,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#fce7f3] text-[#c45d97]">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#c45d97]">
              Tiramisup
            </span>
          </div>
          <p className="mt-2 text-[12px] text-[#8d6a7b]">
            {isEn ? "Powered by Tiramisup AI" : "Tiramisup AI ile çalışır"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="text-[11px] text-[#94a3b8] transition hover:text-[#666d80]"
        >
          {isEn ? "Close" : "Kapat"}
        </button>
      </div>

      <div className="mb-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d6a7b]">
          {isEn ? "Answer mode" : "Yanıt modu"}
        </p>
        <div className="flex flex-wrap gap-2">
          {(["quick", "balanced", "deep"] as AskMode[]).map((item) => {
            const active = mode === item;
            return (
              <button
                key={item}
                type="button"
                onClick={() => setMode(item)}
                className={`inline-flex h-8 items-center rounded-full px-3 text-[12px] font-medium transition ${
                  active
                    ? "bg-[#ffd7ef] text-[#0d0d12]"
                    : "bg-white/70 text-[#6b7280] hover:bg-white"
                }`}
              >
                {MODE_COPY[item][uiLocale]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-[20px] border border-white/70 bg-white/70 p-4">
        <label className="mb-2 block text-[12px] font-semibold text-[#0d0d12]">
          {isEn ? "What do you need help with right now?" : "Şu an tam olarak neye ihtiyacın var?"}
        </label>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          rows={3}
          placeholder={
            isEn
              ? `Example: My product is in ${stage}. What should I finish this week?`
              : `Örnek: Ürünüm ${stage} aşamasında. Bu hafta neyi bitirmeliyim?`
          }
          className="w-full resize-none rounded-[16px] border border-[#f1dbe7] bg-white px-4 py-3 text-[13px] leading-6 text-[#0d0d12] outline-none transition focus:border-[#e5aac8]"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                setQuestion(prompt);
                void askCoach(prompt);
              }}
              className="rounded-full border border-[#f1dbe7] bg-[#fff8fb] px-3 py-1.5 text-[11px] text-[#8d4972] transition hover:border-[#e5aac8] hover:bg-white"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-[11px] text-[#8b93a6]">
            {isEn
              ? "We'll answer from your current product context, checklists, tasks, and metrics."
              : "Yanıt ürün bağlamına, checklist'lerine, görevlerine ve metriklerine göre üretilir."}
          </p>
          <button
            type="button"
            onClick={() => void askCoach()}
            disabled={loading || !question.trim()}
            className="inline-flex h-10 items-center justify-center rounded-full bg-[#111014] px-4 text-[13px] font-semibold text-white transition hover:bg-[#28232a] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (isEn ? "Thinking..." : "Düşünüyor...") : isEn ? "Ask" : "Sor"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-[16px] border border-[#f3c5d9] bg-[#fff7fb] px-4 py-3 text-[12px] text-[#a14a7e]">
          {error}
        </div>
      )}

      {answer && (
        <div className="mt-4 space-y-4">
          <div className="rounded-[20px] border border-white/70 bg-white/80 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d6a7b]">
              {isEn ? "Answer" : "Yanıt"}
            </p>
            <h3 className="mt-2 text-[18px] font-semibold leading-snug tracking-[-0.01em] text-[#0d0d12]">
              {answer.primary_recommendation.title}
            </h3>
            <p className="mt-2 text-[14px] leading-7 text-[#3f4757]">
              {answer.primary_recommendation.why_now}
            </p>
            {answer.primary_recommendation.user_action && (
              <p className="mt-3 rounded-[14px] bg-[#fff7fb] px-3 py-2 text-[12px] font-medium text-[#8d4972]">
                {answer.primary_recommendation.user_action}
              </p>
            )}
            {mode === "deep" && answer.missing_information_for_better_guidance.length > 0 && (
              <div className="mt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d6a7b]">
                  {isEn ? "To sharpen the next answer" : "Bir sonraki yanıtı keskinleştirmek için"}
                </p>
                <ul className="mt-2 space-y-1 text-[12px] text-[#5e6678]">
                  {answer.missing_information_for_better_guidance.slice(0, 3).map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {visibleTaskCandidates.length > 0 && (
            <div className="rounded-[20px] border border-white/70 bg-white/80 p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8d6a7b]">
                    {isEn ? "Task candidates" : "Görev adayları"}
                  </p>
                  <h4 className="mt-2 text-[16px] font-semibold text-[#0d0d12]">
                    {isEn ? "Pick what should become cards" : "Kartlara dönüşecek işleri seç"}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedTaskIds(visibleTaskCandidates.map((task) => task.id))}
                  className="text-[11px] font-medium text-[#8d4972] transition hover:text-[#733960]"
                >
                  {isEn ? "Select all" : "Hepsini seç"}
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {visibleTaskCandidates.map((task) => {
                  const checked = selectedTaskIds.includes(task.id);
                  return (
                    <label
                      key={task.id}
                      className={`flex cursor-pointer items-start gap-3 rounded-[16px] border px-4 py-3 transition ${
                        checked
                          ? "border-[#e5aac8] bg-[#fff8fb]"
                          : "border-[#f2edf0] bg-white hover:border-[#ecd5e1]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleTask(task.id)}
                        className="mt-1 h-4 w-4 rounded border-[#d4a4bd] text-[#c45d97] focus:ring-[#f7c6de]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-[14px] font-semibold text-[#0d0d12]">
                            {task.title}
                          </p>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${PRIORITY_STYLES[task.priority]}`}>
                            {task.priority}
                          </span>
                        </div>
                        <p className="mt-1 whitespace-pre-line text-[12px] leading-5 text-[#5e6678]">
                          {task.description}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-[#8b93a6]">
                  {isEn
                    ? "Selected items will be added to your task board."
                    : "Seçtiklerin görev kartlarına eklenecek."}
                </div>
                <button
                  type="button"
                  onClick={() => void addSelectedTasks()}
                  disabled={addingTasks || selectedTaskIds.length === 0}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingTasks
                    ? isEn
                      ? "Adding..."
                      : "Ekleniyor..."
                    : isEn
                      ? "Add selected to tasks"
                      : "Seçilenleri görevlere ekle"}
                </button>
              </div>
            </div>
          )}

          {lastAddedTitles.length > 0 && (
            <div className="rounded-[20px] border border-[#bbf7d0] bg-[#f0fdf4] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#15803d]">
                {isEn ? "Added to tasks" : "Görevlere eklendi"}
              </p>
              <p className="mt-2 text-[14px] leading-6 text-[#166534]">
                {isEn
                  ? `${lastAddedTitles.length} task${lastAddedTitles.length > 1 ? "s were" : " was"} added to your board.`
                  : `${lastAddedTitles.length} görev kartlarına eklendi.`}
              </p>
              <ul className="mt-3 space-y-1 text-[12px] text-[#166534]">
                {lastAddedTitles.map((title) => (
                  <li key={title}>• {title}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
