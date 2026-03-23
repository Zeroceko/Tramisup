import type { FunnelHealthSummary } from "@/lib/funnel-health";

const statusStyles: Record<FunnelHealthSummary["stages"][number]["status"], string> = {
  AHEAD: "border-[#95dbda] bg-[#f0fffe] text-[#2d9d9b]",
  ON_TRACK: "border-[#fee74e]/50 bg-[#fff9dd] text-[#8a6a00]",
  AT_RISK: "border-[#ffccc7] bg-[#fff1f0] text-[#c13f3f]",
  NEEDS_BASELINE: "border-[#e8e8e8] bg-[#fafafa] text-[#666d80]",
};

const statusLabels: Record<FunnelHealthSummary["stages"][number]["status"], string> = {
  AHEAD: "Hedefin ustunde",
  ON_TRACK: "Takipte",
  AT_RISK: "Geride",
  NEEDS_BASELINE: "Baz cizgi gerekiyor",
};

export default function FunnelHealthSection({
  summary,
}: {
  summary: FunnelHealthSummary;
}) {
  return (
    <section className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[18px] bg-[#0d0d12] p-5 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
            Tiramisup yorumu
          </p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.03em]">
            {summary.headline}
          </h2>
          <p className="mt-3 text-[14px] leading-7 text-white/72">
            {summary.summary}
          </p>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Urun tipi
              </p>
              <p className="mt-2 text-[14px] font-semibold">{summary.profileLabel}</p>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Hedef ritim
              </p>
              <p className="mt-2 text-[14px] font-semibold">
                {summary.cadenceLabel} %{summary.baseTargetRate}
              </p>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/5 p-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/45">
                Sira simdi nerede?
              </p>
              <p className="mt-2 text-[14px] font-semibold">
                {summary.stages.find((stage) => stage.status === "AT_RISK")?.stageLabel ??
                  summary.stages.find((stage) => stage.status === "NEEDS_BASELINE")?.stageLabel ??
                  "Funnel dengede"}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[16px] border border-white/10 bg-white/5 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/45">
              Mentor notu
            </p>
            <p className="mt-2 text-[14px] leading-7 text-white/78">
              {summary.nextFocus}
            </p>
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                Funnel gorunumu
              </p>
              <h3 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                AARRR halkalari tek akis olarak
              </h3>
            </div>
            <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[12px] font-medium text-[#4c5567]">
              {summary.cadenceLabel} karsilastirma
            </span>
          </div>

          <div className="space-y-3">
            {summary.stages.map((stage, index) => {
              const width = `${Math.max(68, 100 - index * 6)}%`;

              return (
                <div
                  key={stage.stage}
                  className="mx-auto rounded-[18px] border border-[#eef1f2] bg-[#fbfcfc] p-4"
                  style={{ width }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                        {stage.stage}
                      </p>
                      <h4 className="mt-1 text-[16px] font-semibold text-[#0d0d12]">
                        {stage.metricName}
                      </h4>
                    </div>
                    <span
                      className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${statusStyles[stage.status]}`}
                    >
                      {statusLabels[stage.status]}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-[12px] bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8fa0]">
                        Son deger
                      </p>
                      <p className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                        {stage.currentValue ?? "—"}
                      </p>
                    </div>
                    <div className="rounded-[12px] bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8fa0]">
                        {summary.cadenceLabel} buyume
                      </p>
                      <p className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                        {stage.growthRate != null ? `${stage.growthRate >= 0 ? "+" : ""}${stage.growthRate}%` : "—"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#666d80]">
                        Hedef: +%{stage.targetRate}
                      </p>
                    </div>
                    <div className="rounded-[12px] bg-white p-3">
                      <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8fa0]">
                        Onceki halkadan gecis
                      </p>
                      <p className="mt-1 text-[24px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                        {stage.conversionFromPrevious != null ? `%${stage.conversionFromPrevious}` : "—"}
                      </p>
                      <p className="mt-1 text-[12px] text-[#666d80]">
                        {stage.baselineValue != null ? `Baz: ${stage.baselineValue}` : "Henuz yeterli ritim yok"}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
