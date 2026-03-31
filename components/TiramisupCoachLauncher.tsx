"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import AdvisorCard from "@/components/AdvisorCard";

type TiramisupCoachLauncherProps = {
  productId?: string;
  productName?: string;
};

export default function TiramisupCoachLauncher({
  productId,
  productName,
}: TiramisupCoachLauncherProps) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] === "tr" ? "tr" : "en";
  const isLaunchPage = pathname?.startsWith(`/${locale}/pre-launch`);
  const isGrowthPage = pathname?.startsWith(`/${locale}/growth`);
  const isVisible = Boolean(productId) && (isLaunchPage || isGrowthPage);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const labels = locale === "en"
    ? {
        trigger: "Open Tiramisup suggestion",
        panelTitle: isGrowthPage ? "Growth suggestion" : "Launch suggestion",
        panelDescription: isGrowthPage
          ? "Open Tiramisup's current recommendation without leaving the page."
          : "Open Tiramisup's current launch recommendation without leaving the page.",
        close: "Close suggestion panel",
      }
    : {
        trigger: "Tiramisup önerisini aç",
        panelTitle: isGrowthPage ? "Growth önerisi" : "Launch önerisi",
        panelDescription: isGrowthPage
          ? "Sayfadan ayrılmadan Tiramisup'ın güncel growth önerisini aç."
          : "Sayfadan ayrılmadan Tiramisup'ın güncel launch önerisini aç.",
        close: "Öneri panelini kapat",
      };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  if (!isVisible || !productId) {
    return null;
  }

  return (
    <div
      id="tiramisup-coach"
      ref={ref}
      className="relative hidden h-11 items-center justify-end lg:flex"
    >
      <div
        className={`pointer-events-none absolute right-14 top-1/2 z-50 -translate-y-1/2 transition-all duration-300 ease-out ${
          open ? "w-[min(86vw,420px)] opacity-100" : "w-0 opacity-0"
        }`}
      >
        <div
          className={`origin-right overflow-hidden transition-all duration-300 ease-out ${
            open ? "translate-x-0 scale-100" : "translate-x-4 scale-95"
          }`}
        >
          <div className="relative overflow-hidden rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.74),rgba(255,250,246,0.62))] p-3 shadow-[0_24px_80px_rgba(25,27,39,0.14)] backdrop-blur-2xl">
            <div className="pointer-events-none absolute inset-0 opacity-40">
              <div className="absolute -left-10 top-4 h-24 w-32 rounded-full bg-[#ffd9ef] blur-3xl" />
              <div className="absolute right-0 top-10 h-32 w-36 rounded-full bg-[#d9e8ff] blur-3xl" />
              <div className="absolute bottom-0 left-24 h-20 w-28 rounded-full bg-[#ffe9cf] blur-2xl" />
            </div>
            <div className="relative mb-3 flex items-start justify-between gap-4 rounded-[22px] border border-white/60 bg-white/45 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8b8f9c]">
                  Tiramisup
                </p>
                <p className="mt-1 text-[16px] font-semibold tracking-[-0.02em] text-[#171717]">
                  {labels.panelTitle}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
                  {labels.panelDescription}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                title={labels.close}
                aria-label={labels.close}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/70 text-[#666d80] transition hover:bg-white"
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 3L9 9M9 3L3 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <AdvisorCard
              productId={productId}
              productName={productName ?? ""}
              eventType={isGrowthPage ? "GROWTH_VIEW" : "PRE_LAUNCH_VIEW"}
              variant="launcher"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        title={labels.trigger}
        aria-label={labels.trigger}
        aria-expanded={open}
        className={`relative z-[60] inline-flex shrink-0 items-center justify-center overflow-hidden border border-white/65 bg-white/88 shadow-[0_16px_40px_rgba(25,27,39,0.10)] backdrop-blur transition-all duration-300 ease-out hover:border-white hover:bg-white ${
          open ? "h-[60px] w-[60px] rounded-[22px]" : "h-11 w-11 rounded-full"
        }`}
      >
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,233,207,0.7),transparent_48%),radial-gradient(circle_at_72%_65%,rgba(255,217,239,0.72),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.85),rgba(255,250,246,0.72))]" />
        <img
          src="/assets/illus-tiramisu-slice.png"
          alt="Tiramisup"
          className={`relative object-contain transition-all duration-300 ease-out ${
            open ? "h-11 w-11" : "h-8 w-8"
          }`}
        />
      </button>
    </div>
  );
}
