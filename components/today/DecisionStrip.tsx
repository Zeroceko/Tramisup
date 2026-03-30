import Link from "next/link";

type Indicator = {
  label: string;
  value: string;
  status: "healthy" | "warning" | "neutral" | "empty";
  /** Optional sub-label shown below value */
  hint?: string;
  /** Optional link — makes the card clickable */
  href?: string;
};

type DecisionStripProps = {
  indicators: Indicator[];
};

const STATUS_DOT: Record<Indicator["status"], string> = {
  healthy: "bg-[#34d399]",
  warning: "bg-[#f59e0b]",
  neutral: "bg-[#94a3b8]",
  empty: "bg-[#d1d5db]",
};

const STATUS_VALUE_COLOR: Record<Indicator["status"], string> = {
  healthy: "text-[#0d0d12]",
  warning: "text-[#92400e]",
  neutral: "text-[#0d0d12]",
  empty: "text-[#94a3b8]",
};

export default function DecisionStrip({ indicators }: DecisionStripProps) {
  if (indicators.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {indicators.map((ind) => {
        const inner = (
          <>
            {/* Label row with status dot */}
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ind.status]}`} />
              <span className="text-[11px] font-medium text-[#737988]">
                {ind.label}
              </span>
              {ind.href && (
                <span className="ml-auto text-[10px] text-[#c8ccd6]">↗</span>
              )}
            </div>

            {/* Value */}
            <p className={`mt-2 text-[24px] font-bold tracking-[-0.03em] leading-tight ${STATUS_VALUE_COLOR[ind.status]}`}>
              {ind.value}
            </p>

            {/* Hint */}
            {ind.hint && (
              <p className="mt-1 text-[11px] text-[#98a0ae]">{ind.hint}</p>
            )}
          </>
        );

        const baseClass = "rounded-[24px] border border-white/70 bg-white/82 px-4 py-4 shadow-[0_14px_44px_rgba(23,20,31,0.06)] backdrop-blur";

        if (ind.href) {
          return (
            <Link
              key={ind.label}
              href={ind.href}
              className={`${baseClass} block transition hover:-translate-y-0.5 hover:border-white hover:shadow-[0_18px_48px_rgba(23,20,31,0.09)]`}
            >
              {inner}
            </Link>
          );
        }

        return (
          <div key={ind.label} className={baseClass}>
            {inner}
          </div>
        );
      })}
    </div>
  );
}
