type Indicator = {
  label: string;
  value: string;
  status: "healthy" | "warning" | "neutral" | "empty";
  /** Optional sub-label shown below value */
  hint?: string;
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
      {indicators.map((ind) => (
        <div
          key={ind.label}
          className="rounded-[14px] border border-[#e8e8e8] bg-white px-4 py-3.5"
        >
          {/* Label row with status dot */}
          <div className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[ind.status]}`} />
            <span className="text-[11px] font-medium text-[#666d80]">
              {ind.label}
            </span>
          </div>

          {/* Value — the number or status word */}
          <p className={`mt-1 text-[20px] font-bold tracking-[-0.02em] leading-tight ${STATUS_VALUE_COLOR[ind.status]}`}>
            {ind.value}
          </p>

          {/* Hint */}
          {ind.hint && (
            <p className="mt-0.5 text-[11px] text-[#94a3b8]">{ind.hint}</p>
          )}
        </div>
      ))}
    </div>
  );
}
