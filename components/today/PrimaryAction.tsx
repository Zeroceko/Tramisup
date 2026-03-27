import Link from "next/link";

type PrimaryActionProps = {
  title: string;
  description: string;
  why: string;
  cta: string;
  href: string;
  /** Optional progress indicator (0-100) shown as thin bar */
  progress?: number;
  /** Visual accent — adapts to phase */
  accent?: "pink" | "teal" | "amber";
};

const ACCENT_STYLES: Record<string, { bg: string; button: string; buttonHover: string; bar: string }> = {
  pink: {
    bg: "bg-gradient-to-br from-[#fff9fb] to-[#fff0f6]",
    button: "bg-[#ffd7ef] text-[#0d0d12]",
    buttonHover: "hover:bg-[#f5c8e4]",
    bar: "bg-[#ffd7ef]",
  },
  teal: {
    bg: "bg-gradient-to-br from-[#f6fdfd] to-[#eef9f9]",
    button: "bg-[#95dbda] text-[#0d0d12]",
    buttonHover: "hover:bg-[#7dcfce]",
    bar: "bg-[#95dbda]",
  },
  amber: {
    bg: "bg-gradient-to-br from-[#fffdf5] to-[#fff8e1]",
    button: "bg-[#fee74e] text-[#0d0d12]",
    buttonHover: "hover:bg-[#fde032]",
    bar: "bg-[#fee74e]",
  },
};

export default function PrimaryAction({
  title,
  description,
  why,
  cta,
  href,
  progress,
  accent = "pink",
}: PrimaryActionProps) {
  const styles = ACCENT_STYLES[accent];

  return (
    <div className={`rounded-[18px] border border-[#e8e8e8] ${styles.bg} p-6 sm:p-7`}>
      {/* Why this matters — the reasoning line */}
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
        {why}
      </p>

      {/* Action title — the dominant text */}
      <h2 className="mt-2.5 text-[22px] font-bold tracking-[-0.02em] text-[#0d0d12] sm:text-[24px]">
        {title}
      </h2>

      {/* Description — context, not fluff */}
      <p className="mt-1.5 text-[14px] leading-6 text-[#5e6678] max-w-2xl">
        {description}
      </p>

      {/* Progress bar (optional) */}
      {progress != null && (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-[#e8e8e8]/60">
            <div
              className={`h-full rounded-full ${styles.bar} transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <span className="text-[12px] font-semibold text-[#666d80] tabular-nums">
            %{progress}
          </span>
        </div>
      )}

      {/* Single CTA */}
      <Link
        href={href}
        className={`mt-5 inline-flex h-11 items-center rounded-full px-6 text-[14px] font-semibold transition ${styles.button} ${styles.buttonHover}`}
      >
        {cta}
      </Link>
    </div>
  );
}
