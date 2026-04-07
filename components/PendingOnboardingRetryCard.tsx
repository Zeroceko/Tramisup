"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearOnboardingRetryDraft,
  loadOnboardingRetryDraft,
  type SavedOnboardingRetryDraft,
} from "@/lib/onboarding-retry-storage";

type Props = {
  locale: string;
};

export default function PendingOnboardingRetryCard({ locale }: Props) {
  const router = useRouter();
  const isEn = locale === "en";
  const [draft, setDraft] = useState<SavedOnboardingRetryDraft | null>(null);

  useEffect(() => {
    const loaded = loadOnboardingRetryDraft();
    setDraft(loaded);
  }, []);

  if (!draft) return null;

  const productName = typeof draft.data?.name === "string" ? draft.data.name : null;

  return (
    <div className="mx-auto mt-4 max-w-xl rounded-[20px] border border-[#ffd7ef] bg-[#fff7fc] p-5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a4b74]">
        {isEn ? "Saved draft" : "Kaydedilen taslak"}
      </p>
      <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {isEn ? "Your previous product setup is ready to retry" : "Önceki ürün kurulumun yeniden denemeye hazır"}
      </h3>
      <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
        {isEn
          ? `We saved your answers${productName ? ` for "${productName}"` : ""}. You can continue and retry product creation.`
          : `Yanıtlarını${productName ? ` "${productName}" için` : ""} kaydettik. Devam edip ürün oluşturmayı tekrar deneyebilirsin.`}
      </p>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => router.push(`/${locale}/onboarding?resume=1`)}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
        >
          {isEn ? "Retry with saved answers" : "Kayıtlı yanıtlarla tekrar dene"}
        </button>
        <button
          type="button"
          onClick={() => {
            clearOnboardingRetryDraft();
            setDraft(null);
          }}
          className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e8e8] bg-white px-5 text-[13px] font-medium text-[#5e6678] transition hover:bg-[#f6f6f6]"
        >
          {isEn ? "Discard draft" : "Taslağı sil"}
        </button>
      </div>
    </div>
  );
}

