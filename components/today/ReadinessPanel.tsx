import Link from "next/link";

type Props = {
  phase: "pre-launch" | "launched";
  readinessScore: number;
  daysUntilLaunch: number | null;
  locale: string;
};

export default function ReadinessPanel({ phase, readinessScore, daysUntilLaunch, locale }: Props) {
  const isEn = locale === "en";

  if (phase === "pre-launch") {
    return (
      <div className="flex h-full flex-col justify-between rounded-[20px] border border-[#e8e4de] bg-white p-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Launch Readiness" : "Launch Hazırlığı"}
          </p>
          <div className="mt-3 flex items-end gap-2">
            <p className="text-[36px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
              %{readinessScore}
            </p>
            {readinessScore >= 100 && (
              <span className="mb-1 inline-flex items-center rounded-full bg-[#dcfce7] px-2 py-0.5 text-[11px] font-semibold text-[#15803d]">
                {isEn ? "Ready" : "Hazır"}
              </span>
            )}
          </div>
          {daysUntilLaunch !== null && daysUntilLaunch > 0 && (
            <p className="mt-1.5 text-[12px] text-[#8a8fa0]">
              {isEn ? `${daysUntilLaunch} days to launch` : `Lansmanına ${daysUntilLaunch} gün kaldı`}
            </p>
          )}
        </div>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
            <div
              className="h-full rounded-full bg-[#95dbda] transition-all duration-700"
              style={{ width: `${Math.min(100, readinessScore)}%` }}
            />
          </div>
          <Link
            href={`/${locale}/pre-launch`}
            className="mt-3 inline-block text-[12px] font-medium text-[#2a8a89] hover:underline"
          >
            {isEn ? "View launch checklist →" : "Launch listesini gör →"}
          </Link>
        </div>
      </div>
    );
  }

  // Launched but no metric data yet
  return (
    <div className="flex h-full flex-col justify-between rounded-[20px] border border-[#e8e4de] bg-white p-5">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
          {isEn ? "Growth Tracking" : "Büyüme Takibi"}
        </p>
        <p className="mt-3 text-[18px] font-semibold leading-snug tracking-[-0.02em] text-[#0d0d12]">
          {isEn ? "Start tracking metrics" : "Metrikleri takip etmeye başla"}
        </p>
        <p className="mt-2 text-[13px] leading-5 text-[#5e6678]">
          {isEn
            ? "Enter daily values to see your growth trend here."
            : "Günlük değer girerek büyüme trendi burada görünsün."}
        </p>
      </div>
      <Link
        href={`/${locale}/metrics`}
        className="mt-4 inline-flex h-9 items-center rounded-full bg-[#95dbda] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#7dcfce]"
      >
        {isEn ? "Go to metrics →" : "Metriklere git →"}
      </Link>
    </div>
  );
}
