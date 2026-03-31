"use client";

import { useEffect, useRef, useState } from "react";
import AdvisorCard from "@/components/AdvisorCard";

type TiramisupCoachLauncherProps = {
  productId?: string;
  productName?: string;
  eventType: string;
  title: string;
  description: string;
  className?: string;
};

export default function TiramisupCoachLauncher({
  productId,
  productName,
  eventType,
  title,
  description,
  className = "",
}: TiramisupCoachLauncherProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

  if (!productId) {
    return null;
  }

  return (
    <div
      id="tiramisup-coach"
      ref={ref}
      className={`relative hidden min-h-[240px] w-full items-center justify-end lg:flex ${className}`}
    >
      <div className="absolute right-0 top-1/2 flex w-full -translate-y-1/2 items-center justify-end">
        <div
          className={`overflow-hidden transition-all duration-300 ease-out ${
            open ? "mr-[-28px] w-[390px] opacity-100" : "mr-0 w-0 opacity-0"
          }`}
        >
          <div className="rounded-[34px] rounded-r-[20px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(255,249,242,0.78))] px-6 py-5 shadow-[0_24px_80px_rgba(25,27,39,0.12)] backdrop-blur-2xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#f7e8dc] text-[16px] text-[#a76643]">
                  ✎
                </div>
                <p className="text-[16px] font-semibold uppercase tracking-[0.20em] text-[#b2744f]">
                  Tiramisup
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[18px] font-medium text-[#b2744f] transition hover:opacity-70"
              >
                Close
              </button>
            </div>

            <AdvisorCard
              productId={productId}
              productName={productName ?? ""}
              eventType={eventType}
              variant="launcher"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          title={title}
          aria-label={title}
          aria-expanded={open}
          className={`relative z-[10] flex shrink-0 items-center justify-center overflow-hidden border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(255,249,242,0.74))] shadow-[0_24px_80px_rgba(25,27,39,0.12)] backdrop-blur-2xl transition-all duration-300 ease-out ${
            open ? "h-[232px] w-[232px] rounded-[30px]" : "h-[180px] w-[272px] rounded-[34px]"
          }`}
        >
          <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_26%_22%,rgba(255,229,190,0.96),transparent_36%),radial-gradient(circle_at_76%_66%,rgba(255,220,210,0.64),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.22),rgba(255,248,240,0.12))]" />
          <img
            src="/assets/illus-tiramisu-slice.png"
            alt="Tiramisup"
            className={`absolute inset-0 h-full w-full object-cover transition-all duration-300 ease-out ${
              open ? "scale-[1.18] blur-[5px] saturate-[1.15]" : "scale-[1.02] blur-0"
            }`}
          />
          {open ? (
            <div className="relative z-[2] px-6 text-center">
              <p className="text-[20px] font-semibold uppercase tracking-[0.18em] text-[#5d3522]">
                Tiramisup
              </p>
              <p className="mt-3 text-[24px] font-bold leading-tight tracking-[-0.04em] text-[#3f2418]">
                {title}
              </p>
            </div>
          ) : (
            <span className="relative z-[2] text-[28px] text-[#8b5a47] drop-shadow-sm">✦</span>
          )}
          <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)]" />
        </button>
      </div>
      <div className="h-[240px] w-full max-w-[640px]" />
      <p className="sr-only">{description}</p>
    </div>
  );
}
