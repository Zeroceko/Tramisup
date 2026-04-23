"use client";

import { useState } from "react";
import type { FeedbackEntry } from "@/lib/product-feedback";

type ProductFeedbackCardProps = {
  productId: string;
  locale: string;
  initialEntries: FeedbackEntry[];
};

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "tr-TR", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function ProductFeedbackCard({
  productId,
  locale,
  initialEntries,
}: ProductFeedbackCardProps) {
  const isEn = locale === "en";
  const [entries, setEntries] = useState(initialEntries);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    const trimmedMessage = message.trim();
    if (trimmedMessage.length < 3) {
      setError(isEn ? "Please add a bit more detail." : "Biraz daha detay yazar mısın?");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch(`/api/products/${productId}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          message: trimmedMessage,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string; entry?: FeedbackEntry }
        | null;

      if (!response.ok || !payload?.entry) {
        setError(
          isEn
            ? "Feedback could not be saved right now."
            : "Feedback şu anda kaydedilemedi."
        );
        return;
      }

      setEntries((current) => [payload.entry!, ...current].slice(0, 5));
      setName("");
      setEmail("");
      setMessage("");
      setSuccess(
        isEn ? "Feedback saved. Keep them coming." : "Feedback kaydedildi. Devam edebiliriz."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
            {isEn ? "Early user feedback" : "İlk kullanıcı feedback'i"}
          </p>
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {isEn ? "Collect quick reactions in one place" : "Hızlı geri bildirimleri tek yerde topla"}
          </h2>
          <p className="mt-2 max-w-xl text-[14px] leading-7 text-[#5e6678]">
            {isEn
              ? "Use this tiny form during interviews or tests so the first signals do not get lost."
              : "İlk görüşmelerde veya testlerde bu mini formu kullan; ilk sinyaller dağılmadan burada kalsın."}
          </p>
        </div>
        <div className="rounded-full bg-[#f6f6f6] px-4 py-2 text-[12px] font-medium text-[#5e6678]">
          {entries.length} {isEn ? "saved" : "kayıtlı"}
        </div>
      </div>

      <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={isEn ? "Name (optional)" : "İsim (opsiyonel)"}
            className="w-full rounded-[12px] border border-[#e8e8e8] bg-[#fcfcfc] px-4 py-3 text-[14px] text-[#0d0d12] outline-none transition focus:border-[#95dbda]"
          />
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={isEn ? "Email (optional)" : "E-posta (opsiyonel)"}
            className="w-full rounded-[12px] border border-[#e8e8e8] bg-[#fcfcfc] px-4 py-3 text-[14px] text-[#0d0d12] outline-none transition focus:border-[#95dbda]"
          />
        </div>

        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={
            isEn
              ? "What confused the user, what felt useful, or where did they get stuck?"
              : "Kullanıcı nerede takıldı, neyi faydalı buldu ya da ne kafasını karıştırdı?"
          }
          rows={4}
          className="w-full rounded-[14px] border border-[#e8e8e8] bg-[#fcfcfc] px-4 py-3 text-[14px] leading-6 text-[#0d0d12] outline-none transition focus:border-[#95dbda]"
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[20px] text-[13px]">
            {error ? <p className="text-[#b42318]">{error}</p> : null}
            {!error && success ? <p className="text-[#0d9488]">{success}</p> : null}
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? isEn ? "Saving..." : "Kaydediliyor..."
              : isEn ? "Save feedback" : "Feedback kaydet"}
          </button>
        </div>
      </form>

      <div className="mt-6 space-y-3">
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8a8fa0]">
          {isEn ? "Latest notes" : "Son notlar"}
        </p>
        {entries.length === 0 ? (
          <div className="rounded-[14px] border border-dashed border-[#d8dbe2] bg-[#fafafa] px-4 py-4 text-[14px] leading-6 text-[#667085]">
            {isEn
              ? "No feedback yet. The first few user notes will appear here."
              : "Henüz feedback yok. İlk kullanıcı notları burada görünecek."}
          </div>
        ) : (
          entries.slice(0, 5).map((entry) => (
            <div key={entry.id} className="rounded-[14px] bg-[#f8f8f8] px-4 py-4">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[13px] font-semibold text-[#0d0d12]">
                  {entry.name || (isEn ? "Anonymous user" : "İsimsiz kullanıcı")}
                </p>
                <p className="text-[12px] text-[#8a8fa0]">{formatDate(entry.createdAt, locale)}</p>
              </div>
              <p className="mt-2 text-[14px] leading-6 text-[#465063]">{entry.message}</p>
              {entry.email ? (
                <p className="mt-2 text-[12px] text-[#8a8fa0]">{entry.email}</p>
              ) : null}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
