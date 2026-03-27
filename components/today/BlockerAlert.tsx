import Link from "next/link";

type Blocker = {
  id: string;
  title: string;
  /** Where this blocker lives — used for the link */
  href: string;
  /** Source label: "Launch checklist", "Entegrasyon", etc. */
  source: string;
};

type BlockerAlertProps = {
  blockers: Blocker[];
  locale: string;
};

export default function BlockerAlert({ blockers, locale }: BlockerAlertProps) {
  if (blockers.length === 0) return null;

  const countLabel =
    locale === "en"
      ? `${blockers.length} blocker${blockers.length > 1 ? "s" : ""} need${blockers.length === 1 ? "s" : ""} attention`
      : `${blockers.length} kritik blokaj dikkatini bekliyor`;

  return (
    <div className="rounded-[14px] border border-[#fde68a] bg-[#fffdf5] px-5 py-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          className="shrink-0 text-[#f59e0b]"
        >
          <path
            d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <p className="text-[13px] font-semibold text-[#92400e]">
          {countLabel}
        </p>
      </div>

      {/* Blocker list */}
      <ul className="mt-3 space-y-2">
        {blockers.map((b) => (
          <li key={b.id}>
            <Link
              href={b.href}
              className="group flex items-start gap-2.5 rounded-[10px] px-3 py-2 transition hover:bg-[#fef3c7]/50"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0d0d12] group-hover:text-[#92400e] transition">
                  {b.title}
                </p>
                <p className="text-[11px] text-[#94a3b8]">{b.source}</p>
              </div>
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#b0b8c8"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-100"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
