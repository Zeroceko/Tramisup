"use client";

import { useState } from "react";
import Link from "next/link";

export default function LaunchMomentBanner({
  locale,
  productName,
}: {
  locale: string;
  productName: string;
}) {
  const [dismissed, setDismissed] = useState(false);
  const isEn = locale === "en";

  if (dismissed) return null;

  return (
    <div className="relative overflow-hidden rounded-[20px] border border-[#bbf7d0] bg-gradient-to-br from-[#f0fdf4] via-[#f7fff9] to-[#fafff7] p-6">
      {/* Dismiss */}
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full text-[#94a3b8] transition hover:bg-[#e8e8e8] hover:text-[#0d0d12]"
        aria-label="Kapat"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#22c55e]/15 text-2xl">
          🚀
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#15803d]">
            {isEn ? "You launched!" : "Launch ettin!"}
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {isEn ? `${productName} is live` : `${productName} yayında`}
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-[#4b7a5a]">
            {isEn
              ? "Pre-launch phase is complete. Your focus now shifts to growth — tracking users, measuring revenue, and building the habit of daily metrics."
              : "Pre-launch aşaması kapandı. Odak artık büyümeye geçiyor — kullanıcı takibi, gelir ölçümü ve günlük metrik ritmi."}
          </p>

          {/* Next steps */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/${locale}/growth`}
              className="inline-flex h-9 items-center rounded-full bg-[#0d0d12] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
            >
              {isEn ? "Set up growth tracking →" : "Growth takibini kur →"}
            </Link>
            <Link
              href={`/${locale}/integrations`}
              className="inline-flex h-9 items-center rounded-full border border-[#c8e6d0] bg-white px-4 text-[13px] font-medium text-[#15803d] transition hover:bg-[#f0fdf4]"
            >
              {isEn ? "Connect a source" : "Kaynak bağla"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
