"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  GrowthCheckinAnswers,
  GrowthCheckinQuestion,
} from "@/lib/growth-transition-checkin";

export default function GrowthTransitionCheckin({
  productId,
  locale,
  questions,
  initialAnswers,
  nextHref,
}: {
  productId: string;
  locale: string;
  questions: GrowthCheckinQuestion[];
  initialAnswers: GrowthCheckinAnswers;
  nextHref: string;
}) {
  const router = useRouter();
  const isEn = locale === "en";
  const [answers, setAnswers] = useState<GrowthCheckinAnswers>(initialAnswers);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allAnswered = useMemo(
    () => questions.every((question) => Boolean(answers[question.id]?.trim())),
    [answers, questions]
  );

  async function saveCheckin() {
    if (!allAnswered) {
      setError(
        isEn
          ? "Answer all check-in questions before continuing."
          : "Devam etmeden önce bu değerlendirmedeki tüm soruları cevapla."
      );
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/products/${productId}/growth-intake`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (!res.ok) throw new Error("save_failed");
      router.push(nextHref);
    } catch {
      setError(
        isEn
          ? "Growth check-in could not be saved. Try again."
          : "Growth değerlendirmesi kaydedilemedi. Tekrar dene."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-[18px] border border-[#e8e8e8] bg-white p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
        {isEn ? "Growth check-in" : "Growth değerlendirmesi"}
      </p>
      <h2 className="mt-2 text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {isEn ? "Answer a few questions before metric setup" : "Metric setup öncesi birkaç noktayı netleştir"}
      </h2>
      <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#5e6678]">
        {isEn
          ? "This is not a second onboarding. It gives Tiramisup just enough product-specific context to choose a cleaner measurement system before Growth starts making diagnosis claims."
          : "Bu ikinci bir onboarding değil. Tiramisup'ın Growth tarafında erken teşhis üretmeden önce bu ürün için daha temiz bir ölçüm sistemi kurmasına yardımcı olur."}
      </p>

      <div className="mt-5 space-y-4">
        {questions.map((question, index) => (
          <div key={question.id} className="rounded-[16px] border border-[#edf0f3] bg-[#fafbfc] p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[11px] font-semibold text-[#667085]">
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-[14px] font-semibold text-[#0d0d12]">{question.prompt}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#667085]">{question.helper}</p>

                {question.type === "choice" ? (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {question.options?.map((option) => {
                      const isSelected = answers[question.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setAnswers((current) => ({ ...current, [question.id]: option.value }))}
                          className={`rounded-[12px] border px-3 py-3 text-left text-[12px] transition ${
                            isSelected
                              ? "border-[#95dbda] bg-[#f0fafa] text-[#0d0d12]"
                              : "border-[#e4e7ec] bg-white text-[#475467] hover:border-[#cbd5e1]"
                          }`}
                        >
                          {option.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <textarea
                    value={answers[question.id] ?? ""}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [question.id]: event.target.value,
                      }))
                    }
                    placeholder={question.placeholder}
                    rows={3}
                    className="mt-3 w-full rounded-[12px] border border-[#dfe3e8] bg-white px-3 py-3 text-[13px] text-[#0d0d12] outline-none transition placeholder:text-[#98a2b3] focus:border-[#95dbda]"
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {error ? (
        <p className="mt-4 text-[12px] text-[#b42318]">{error}</p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-[12px] text-[#667085]">
          {isEn
            ? "After this, we move straight into metric setup."
            : "Bundan sonra doğrudan Metrics tarafındaki metric setup akışına geçeceğiz."}
        </p>
        <button
          type="button"
          onClick={() => void saveCheckin()}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#23252b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving
            ? "..."
            : isEn
              ? "Save and continue to Metrics"
              : "Kaydet ve Metrics'e geç"}
        </button>
      </div>
    </div>
  );
}
