import Link from "next/link";

type PrimaryActionProps = {
  title: string;
  description: string;
  why: string;
  cta: string;
  href: string;
  progress?: number;
  accent?: "pink" | "teal" | "amber";
};

const ACCENT_STYLES: Record<string, {
  border: string;
  button: string;
  buttonHover: string;
  bar: string;
  labelColor: string;
}> = {
  pink: {
    border: "border-[#ffd7ef]",
    button: "bg-[#ffd7ef] text-[#0d0d12]",
    buttonHover: "hover:bg-[#f5c8e4]",
    bar: "bg-[#ffd7ef]",
    labelColor: "text-[#b05a88]",
  },
  teal: {
    border: "border-[#95dbda]",
    button: "bg-[#95dbda] text-[#0d0d12]",
    buttonHover: "hover:bg-[#7dcfce]",
    bar: "bg-[#95dbda]",
    labelColor: "text-[#2a8a89]",
  },
  amber: {
    border: "border-[#fee74e]",
    button: "bg-[#fee74e] text-[#0d0d12]",
    buttonHover: "hover:bg-[#fde032]",
    bar: "bg-[#fee74e]",
    labelColor: "text-[#9a7400]",
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
    <div className={`rounded-[20px] border bg-white ${styles.border} p-5 sm:p-6`}>
      <p className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${styles.labelColor}`}>
        {why}
      </p>

      <h2 className="mt-2.5 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {title}
      </h2>

      <p className="mt-1.5 text-[13px] leading-6 text-[#5e6678] max-w-2xl">
        {description}
      </p>

      {progress != null && (
        <div className="mt-4 flex items-center gap-3">
          <div className="h-1.5 flex-1 rounded-full bg-[#f0f0f0]">
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

      <Link
        href={href}
        className={`mt-5 inline-flex h-10 items-center rounded-full px-5 text-[13px] font-semibold transition ${styles.button} ${styles.buttonHover}`}
      >
        {cta}
      </Link>
    </div>
  );
}
