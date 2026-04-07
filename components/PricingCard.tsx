"use client";

import Link from "next/link";

type Feature = { text: string; included: boolean };

type PricingCardProps = {
  name: string;
  price: number;
  interval: "monthly" | "yearly";
  description: string;
  features: Feature[];
  cta: string;
  ctaHref: string;
  ctaDisabled?: boolean;
  highlighted?: boolean;
  currentPlan?: boolean;
  locale: string;
};

export default function PricingCard({
  name,
  price,
  interval,
  description,
  features,
  cta,
  ctaHref,
  ctaDisabled = false,
  highlighted = false,
  currentPlan = false,
  locale,
}: PricingCardProps) {
  const isEn = locale === "en";
  const yearlyNote = interval === "yearly"
    ? isEn ? "billed yearly" : "yıllık faturalandırılır"
    : null;

  return (
    <div
      className={`relative flex flex-col rounded-[24px] border p-7 ${
        highlighted
          ? "border-[#0d0d12] bg-[#0d0d12]"
          : "border-[#e8e8e8] bg-white"
      }`}
    >
      {highlighted && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#ffd7ef] px-3 py-0.5 text-[11px] font-semibold text-[#0d0d12]">
          {isEn ? "Most popular" : "En popüler"}
        </span>
      )}

      {currentPlan && (
        <span className="absolute -top-3 right-6 rounded-full bg-[#95dbda] px-3 py-0.5 text-[11px] font-semibold text-[#0d0d12]">
          {isEn ? "Current plan" : "Mevcut plan"}
        </span>
      )}

      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${highlighted ? "text-[#95dbda]" : "text-[#8a8fa0]"}`}>
        {name}
      </p>

      <div className="mt-3 flex items-end gap-1">
        {price === 0 ? (
          <p className={`text-[36px] font-bold leading-none tracking-[-0.03em] ${highlighted ? "text-white" : "text-[#0d0d12]"}`}>
            {isEn ? "Free" : "Ücretsiz"}
          </p>
        ) : (
          <>
            <p className={`text-[36px] font-bold leading-none tracking-[-0.03em] ${highlighted ? "text-white" : "text-[#0d0d12]"}`}>
              ${price}
            </p>
            <p className={`mb-1 text-[13px] ${highlighted ? "text-[#9ca3af]" : "text-[#8a8fa0]"}`}>
              /{isEn ? "mo" : "ay"}
            </p>
          </>
        )}
      </div>

      {yearlyNote && (
        <p className={`mt-1 text-[11px] ${highlighted ? "text-[#6b7280]" : "text-[#9ca3af]"}`}>
          {yearlyNote}
        </p>
      )}

      <p className={`mt-3 text-[13px] leading-5 ${highlighted ? "text-[#9ca3af]" : "text-[#5e6678]"}`}>
        {description}
      </p>

      {ctaDisabled ? (
        <button
          type="button"
          disabled
          aria-disabled="true"
          className={`mt-6 inline-flex h-11 items-center justify-center rounded-full text-[13px] font-semibold ${
            highlighted
              ? "bg-[#ffd7ef] text-[#0d0d12] opacity-70"
              : "border border-[#e8e8e8] bg-white text-[#8a8fa0]"
          }`}
          title={isEn ? "Payments coming soon" : "Ödeme yakında"}
        >
          {cta}
        </button>
      ) : (
        <Link
          href={ctaHref}
          className={`mt-6 inline-flex h-11 items-center justify-center rounded-full text-[13px] font-semibold transition ${
            highlighted
              ? "bg-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4]"
              : currentPlan
                ? "cursor-default border border-[#e8e8e8] bg-white text-[#8a8fa0]"
                : "bg-[#0d0d12] text-white hover:bg-[#1a1a24]"
          }`}
        >
          {cta}
        </Link>
      )}

      <div className="mt-7 space-y-3">
        {features.map((f) => (
          <div key={f.text} className="flex items-start gap-2.5">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className={`mt-0.5 shrink-0 ${f.included ? (highlighted ? "text-[#95dbda]" : "text-[#0d0d12]") : "text-[#d1d5db]"}`}
            >
              {f.included ? (
                <path d="M3 8l3.5 3.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              ) : (
                <path d="M4 8h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              )}
            </svg>
            <p className={`text-[13px] leading-5 ${f.included ? (highlighted ? "text-[#e5e7eb]" : "text-[#3d4658]") : (highlighted ? "text-[#6b7280]" : "text-[#9ca3af]")}`}>
              {f.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
