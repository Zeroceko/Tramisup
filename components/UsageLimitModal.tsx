"use client";

type UsageLimitModalProps = {
  open: boolean;
  locale: string;
  title: string;
  description: string;
  upgradeHref: string;
  onClose: () => void;
};

export default function UsageLimitModal({
  open,
  locale,
  title,
  description,
  upgradeHref,
  onClose,
}: UsageLimitModalProps) {
  const isEn = locale === "en";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-md rounded-[24px] border border-[#e8e8e8] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#5e6678] transition hover:bg-[#f6f6f6]"
          aria-label={isEn ? "Close" : "Kapat"}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <div className="mb-5 rounded-[16px] border border-[#ffd7ef] bg-[#fff7fc] px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#a55b83]">
            {isEn ? "Upgrade required" : "Yükseltme gerekiyor"}
          </p>
          <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            {title}
          </h2>
        </div>

        <p className="text-[14px] leading-6 text-[#5e6678]">{description}</p>

        <div className="mt-6 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-[#e8e8e8] bg-[#f7f7fa] text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f0f0f4]"
          >
            {isEn ? "Maybe later" : "Daha sonra"}
          </button>
          <a
            href={upgradeHref}
            className="flex-1 h-11 rounded-full bg-[#0d0d12] px-5 text-center text-[13px] font-semibold leading-[44px] text-white transition hover:bg-[#1a1a24]"
          >
            {isEn ? "See plans" : "Planları gör"}
          </a>
        </div>
      </div>
    </div>
  );
}
