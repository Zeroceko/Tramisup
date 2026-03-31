type PhaseBadgeStatus = "pre-launch" | "launched" | "growing";

const PHASE_CONFIG: Record<
  PhaseBadgeStatus,
  { label: string; labelEn: string; bg: string; dot: string }
> = {
  "pre-launch": {
    label: "Launch hazırlığı",
    labelEn: "Pre-launch",
    bg: "bg-[#fff8e1]",
    dot: "bg-[#f6c342]",
  },
  launched: {
    label: "Yayında",
    labelEn: "Launched",
    bg: "bg-[#e8faf4]",
    dot: "bg-[#34d399]",
  },
  growing: {
    label: "Büyüme aşaması",
    labelEn: "Growing",
    bg: "bg-[#ede9fe]",
    dot: "bg-[#8b5cf6]",
  },
};

function getGreeting(locale: string): string {
  const hour = new Date().getHours();
  if (locale === "en") {
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  }
  if (hour < 12) return "Günaydın";
  if (hour < 18) return "İyi günler";
  return "İyi akşamlar";
}

type TodayHeroProps = {
  userName?: string | null;
  productName: string;
  phase: PhaseBadgeStatus;
  statusLine: string;
  locale: string;
  coachSlot?: ReactNode;
};

export default function TodayHero({
  userName,
  productName,
  phase,
  statusLine,
  locale,
  coachSlot,
}: TodayHeroProps) {
  const greeting = getGreeting(locale);
  const phaseConfig = PHASE_CONFIG[phase];
  const phaseLabel = locale === "en" ? phaseConfig.labelEn : phaseConfig.label;

  return (
    <div className="relative mb-7 rounded-[28px] border border-white/65 bg-white/76 px-6 py-6 shadow-[0_18px_60px_rgba(26,24,35,0.08)] backdrop-blur sm:px-7 sm:py-7 lg:pr-[190px]">
      {coachSlot ? (
        <div className="mb-5 flex justify-end lg:absolute lg:right-7 lg:top-7 lg:mb-0">
          {coachSlot}
        </div>
      ) : null}

      {/* Greeting */}
      <p className="text-[13px] font-medium text-[#6f7482]">
        {greeting}
        {userName ? `, ${userName}` : ""}
      </p>

      {/* Product name + phase badge */}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <h1 className="text-[32px] font-bold leading-tight tracking-[-0.04em] text-[#131319] sm:text-[40px]">
          {productName}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold tracking-wide shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)] ${phaseConfig.bg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${phaseConfig.dot}`} />
          {phaseLabel}
        </span>
      </div>

      {/* Status line — the one-sentence state of the product */}
      <p className="mt-3 max-w-3xl text-[15px] leading-7 text-[#5e6678]">
        {statusLine}
      </p>
    </div>
  );
}
import type { ReactNode } from "react";
