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
};

export default function TodayHero({
  userName,
  productName,
  phase,
  statusLine,
  locale,
}: TodayHeroProps) {
  const greeting = getGreeting(locale);
  const phaseConfig = PHASE_CONFIG[phase];
  const phaseLabel = locale === "en" ? phaseConfig.labelEn : phaseConfig.label;

  return (
    <div className="mb-6">
      {/* Greeting */}
      <p className="text-[14px] text-[#666d80]">
        {greeting}
        {userName ? `, ${userName}` : ""}
      </p>

      {/* Product name + phase badge */}
      <div className="mt-1.5 flex items-center gap-3 flex-wrap">
        <h1 className="text-[28px] font-bold text-[#0d0d12] tracking-[-0.03em] leading-tight">
          {productName}
        </h1>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold tracking-wide ${phaseConfig.bg}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${phaseConfig.dot}`} />
          {phaseLabel}
        </span>
      </div>

      {/* Status line — the one-sentence state of the product */}
      <p className="mt-2 text-[14px] leading-6 text-[#5e6678] max-w-2xl">
        {statusLine}
      </p>
    </div>
  );
}
