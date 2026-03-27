import Link from "next/link";

export type GateState = "HARD_BLOCKED" | "WARNING" | "CLEAR";

export type ConfidenceIndicator = {
  label: string;
  score: number; // 0–100
  status: "CLEAR" | "BLOCKED" | "PARTIAL";
};

type LaunchGateStatusProps = {
  gateState: GateState;
  weightedScore: number;
  activeBlockerCount: number;
  ignoredBlockerCount: number;
  nonCriticalRemaining: number;
  confidence: ConfidenceIndicator[];
  locale: string;
  daysUntilLaunch?: number | null;
};

const GATE_CONFIG: Record<
  GateState,
  { border: string; bg: string; badgeBg: string; badgeText: string; dotColor: string; headline: string; headlineEn: string }
> = {
  HARD_BLOCKED: {
    border: "border-[#fecaca]",
    bg: "bg-[#fff8f8]",
    badgeBg: "bg-[#fee2e2]",
    badgeText: "text-[#b91c1c]",
    dotColor: "bg-[#ef4444]",
    headline: "Launch gate kilitli",
    headlineEn: "Launch gate is locked",
  },
  WARNING: {
    border: "border-[#fde68a]",
    bg: "bg-[#fffdf5]",
    badgeBg: "bg-[#fef3c7]",
    badgeText: "text-[#92400e]",
    dotColor: "bg-[#f59e0b]",
    headline: "Launch'a geçebilirsin, riskler var",
    headlineEn: "You can launch, but there are risks",
  },
  CLEAR: {
    border: "border-[#a7f3d0]",
    bg: "bg-[#f0fdf9]",
    badgeBg: "bg-[#d1fae5]",
    badgeText: "text-[#065f46]",
    dotColor: "bg-[#34d399]",
    headline: "Launch'a hazırsın",
    headlineEn: "Ready to launch",
  },
};

const CONFIDENCE_STATUS_STYLES: Record<
  ConfidenceIndicator["status"],
  { bar: string; label: string }
> = {
  CLEAR: { bar: "bg-[#34d399]", label: "text-[#065f46]" },
  PARTIAL: { bar: "bg-[#f59e0b]", label: "text-[#92400e]" },
  BLOCKED: { bar: "bg-[#ef4444]", label: "text-[#b91c1c]" },
};

function GateSubline({
  gateState,
  activeBlockerCount,
  ignoredBlockerCount,
  nonCriticalRemaining,
  locale,
}: Pick<
  LaunchGateStatusProps,
  "gateState" | "activeBlockerCount" | "ignoredBlockerCount" | "nonCriticalRemaining" | "locale"
>) {
  const isEn = locale === "en";

  if (gateState === "HARD_BLOCKED") {
    return isEn
      ? `${activeBlockerCount} critical blocker${activeBlockerCount > 1 ? "s" : ""} must be resolved before you can launch.`
      : `Launch için ${activeBlockerCount} kritik blokaj kapatılmalı. Bunları tamamla ya da göze alarak yoksay.`;
  }
  if (gateState === "WARNING") {
    const parts: string[] = [];
    if (ignoredBlockerCount > 0) {
      parts.push(
        isEn
          ? `${ignoredBlockerCount} ignored blocker${ignoredBlockerCount > 1 ? "s" : ""}`
          : `${ignoredBlockerCount} yoksayılan blokaj`
      );
    }
    if (nonCriticalRemaining > 0) {
      parts.push(
        isEn
          ? `${nonCriticalRemaining} non-critical item${nonCriticalRemaining > 1 ? "s" : ""} open`
          : `${nonCriticalRemaining} kritik olmayan açık madde`
      );
    }
    const detail = parts.join(", ");
    return isEn
      ? `No active blockers. ${detail}. You can launch — confirm the risks in the modal.`
      : `Aktif blokaj yok. ${detail}. Launch edebilirsin — riskleri onay modalında kabul et.`;
  }
  // CLEAR
  if (nonCriticalRemaining > 0) {
    return isEn
      ? `All critical items done. ${nonCriticalRemaining} non-critical item${nonCriticalRemaining > 1 ? "s" : ""} can be finished after launch.`
      : `Tüm kritik maddeler tamam. ${nonCriticalRemaining} kritik olmayan maddeyi launch sonrası tamamlayabilirsin.`;
  }
  return isEn
    ? "All checklist items are complete. You're clear to launch."
    : "Tüm checklist maddeleri tamamlandı. Launch'a hazırsın.";
}

export default function LaunchGateStatus({
  gateState,
  weightedScore,
  activeBlockerCount,
  ignoredBlockerCount,
  nonCriticalRemaining,
  confidence,
  locale,
  daysUntilLaunch,
}: LaunchGateStatusProps) {
  const cfg = GATE_CONFIG[gateState];
  const isEn = locale === "en";
  const headline = isEn ? cfg.headlineEn : cfg.headline;

  return (
    <div className={`rounded-[18px] border ${cfg.border} ${cfg.bg} p-6`}>
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start">

        {/* Left: gate state + score */}
        <div className="flex-1">
          {/* Status badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dotColor}`} />
              {headline}
            </span>
            {daysUntilLaunch != null && daysUntilLaunch > 0 && (
              <span className="inline-flex items-center rounded-full bg-[#f0f0f0] px-2.5 py-1 text-[11px] font-medium text-[#666d80]">
                {isEn ? `${daysUntilLaunch} days to target` : `Hedef tarihe ${daysUntilLaunch} gün`}
              </span>
            )}
          </div>

          {/* Weighted score */}
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-[52px] font-bold leading-none tracking-[-0.04em] text-[#0d0d12]">
              {weightedScore}
            </span>
            <span className="text-[15px] font-medium text-[#666d80]">/ 100</span>
          </div>
          <p className="mt-0.5 text-[12px] text-[#94a3b8]">
            {isEn
              ? "Weighted launch score — critical items count 3×"
              : "Ağırlıklı launch skoru — kritik maddeler 3× sayılır"}
          </p>

          {/* Subline */}
          <p className="mt-3 text-[13px] leading-6 text-[#5e6678] max-w-lg">
            <GateSubline
              gateState={gateState}
              activeBlockerCount={activeBlockerCount}
              ignoredBlockerCount={ignoredBlockerCount}
              nonCriticalRemaining={nonCriticalRemaining}
              locale={locale}
            />
          </p>
        </div>

        {/* Right: confidence indicators */}
        <div className="shrink-0 w-full lg:w-[280px]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-3">
            {isEn ? "Launch confidence" : "Launch güven göstergeleri"}
          </p>
          <div className="space-y-3">
            {confidence.map((ind) => {
              const s = CONFIDENCE_STATUS_STYLES[ind.status];
              const statusLabel =
                ind.status === "CLEAR"
                  ? (isEn ? "Clear" : "Hazır")
                  : ind.status === "PARTIAL"
                    ? (isEn ? "Partial" : "İlerliyor")
                    : (isEn ? "Blocked" : "Blokeli");

              return (
                <div key={ind.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[12px] font-medium text-[#0d0d12]">
                      {ind.label}
                    </span>
                    <span className={`text-[11px] font-semibold ${s.label}`}>
                      {statusLabel}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#e8e8e8]">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${s.bar}`}
                      style={{ width: `${Math.min(100, ind.score)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick nav when blocked */}
          {gateState === "HARD_BLOCKED" && (
            <Link
              href="#blockers"
              className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-full border border-[#fecaca] bg-white px-3 text-[12px] font-medium text-[#b91c1c] transition hover:bg-[#fee2e2]"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12l7 7 7-7" />
              </svg>
              {isEn ? "Go to blockers" : "Blokajlara git"}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
