"use client";

import { usePathname } from "next/navigation";
import AdvisorCard from "@/components/AdvisorCard";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

  if (!isVisible || !productId) {
    return null;
  }

  const labels = locale === "en"
    ? {
        trigger: "Open Tiramisup suggestion",
        panelTitle: isGrowthPage ? "Growth suggestion" : "Launch suggestion",
        panelDescription: isGrowthPage
          ? "Open Tiramisup's current recommendation without leaving the page."
          : "Open Tiramisup's current launch recommendation without leaving the page.",
      }
    : {
        trigger: "Tiramisup önerisini aç",
        panelTitle: isGrowthPage ? "Growth önerisi" : "Launch önerisi",
        panelDescription: isGrowthPage
          ? "Sayfadan ayrılmadan Tiramisup'ın güncel growth önerisini aç."
          : "Sayfadan ayrılmadan Tiramisup'ın güncel launch önerisini aç.",
      };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          title={labels.trigger}
          aria-label={labels.trigger}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/65 bg-white/88 shadow-[0_10px_30px_rgba(25,27,39,0.06)] backdrop-blur transition hover:border-white hover:bg-white"
        >
          <img
            src="/assets/illus-tiramisu-slice.png"
            alt="Tiramisup"
            className="h-8 w-8 object-contain"
          />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={12}
        className="w-[min(92vw,440px)] border-none bg-transparent p-0 shadow-none"
      >
        <div className="mb-3 rounded-[18px] border border-white/65 bg-white/82 px-4 py-3 text-[#0d0d12] shadow-[0_16px_40px_rgba(25,27,39,0.08)] backdrop-blur">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b8393]">
            Tiramisup
          </p>
          <p className="mt-1 text-[15px] font-semibold tracking-[-0.02em]">{labels.panelTitle}</p>
          <p className="mt-1 text-[13px] leading-6 text-[#5e6678]">{labels.panelDescription}</p>
        </div>
        <AdvisorCard
          productId={productId}
          productName={productName ?? ""}
          eventType={isGrowthPage ? "GROWTH_VIEW" : "PRE_LAUNCH_VIEW"}
        />
      </PopoverContent>
    </Popover>
  );
}
