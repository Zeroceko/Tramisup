import Link from "next/link";

type SourceHealthProps = {
  connectedCount: number;
  errorCount: number;
  totalMetrics: number;
  /** How many of those metrics come from integrations vs manual */
  automatedMetrics: number;
  /** Has the user entered metrics today? */
  enteredToday: boolean;
  locale: string;
};

export default function SourceHealth({
  connectedCount,
  errorCount,
  totalMetrics,
  automatedMetrics,
  enteredToday,
  locale,
}: SourceHealthProps) {
  const manualMetrics = totalMetrics - automatedMetrics;
  const isEn = locale === "en";

  // Nothing to show if no metrics setup yet
  if (totalMetrics === 0) return null;

  return (
    <div className="rounded-[14px] border border-[#e8e8e8] bg-white p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
        {isEn ? "Data sources" : "Veri kaynakları"}
      </h3>

      <div className="mt-3 space-y-3">
        {/* Metric entry status for today */}
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              enteredToday
                ? "bg-[#d1fae5] text-[#059669]"
                : "bg-[#fef3c7] text-[#d97706]"
            }`}
          >
            {enteredToday ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
          </span>
          <p className="text-[13px] text-[#0d0d12]">
            {enteredToday
              ? (isEn ? "Today's metrics entered" : "Bugünkü metrikler girildi")
              : (isEn ? "Today's metrics not entered yet" : "Bugünkü metrikler henüz girilmedi")}
          </p>
        </div>

        {/* Manual vs automated breakdown */}
        <div className="flex items-center gap-2.5">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f0f0f0] text-[#666d80]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="12" width="4" height="9" /><rect x="10" y="7" width="4" height="14" /><rect x="17" y="3" width="4" height="18" />
            </svg>
          </span>
          <p className="text-[13px] text-[#5e6678]">
            {totalMetrics} {isEn ? "metrics" : "metrik"}{" "}
            {automatedMetrics > 0 && (
              <span className="text-[#059669]">
                ({automatedMetrics} {isEn ? "automated" : "otomatik"})
              </span>
            )}
            {manualMetrics > 0 && (
              <span className="text-[#94a3b8]">
                {automatedMetrics > 0 ? " · " : "("}
                {manualMetrics} {isEn ? "manual" : "manuel"}
                {automatedMetrics === 0 && ")"}
              </span>
            )}
          </p>
        </div>

        {/* Integration status */}
        <div className="flex items-center gap-2.5">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
              errorCount > 0
                ? "bg-[#fee2e2] text-[#ef4444]"
                : connectedCount > 0
                  ? "bg-[#d1fae5] text-[#059669]"
                  : "bg-[#f0f0f0] text-[#94a3b8]"
            }`}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </span>
          <p className="text-[13px] text-[#5e6678]">
            {connectedCount > 0
              ? `${connectedCount} ${isEn ? "source connected" : "kaynak bağlı"}`
              : (isEn ? "No sources connected" : "Kaynak bağlanmadı")}
            {errorCount > 0 && (
              <span className="ml-1 text-[#ef4444] font-medium">
                · {errorCount} {isEn ? "error" : "hata"}
              </span>
            )}
          </p>
        </div>
      </div>

      {/* CTA to connect more or fix errors */}
      {(connectedCount === 0 || errorCount > 0) && (
        <Link
          href={`/${locale}/integrations`}
          className="mt-4 inline-flex h-8 items-center rounded-full border border-[#e8e8e8] px-4 text-[12px] font-medium text-[#666d80] transition hover:bg-[#f6f6f6] hover:text-[#0d0d12]"
        >
          {errorCount > 0
            ? (isEn ? "Fix connection" : "Bağlantıyı düzelt")
            : (isEn ? "Connect a source" : "Kaynak bağla")}
          {" →"}
        </Link>
      )}
    </div>
  );
}
