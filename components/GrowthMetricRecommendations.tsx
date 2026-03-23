import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";

const STAGE_COLORS: Record<string, string> = {
  Awareness: "bg-[#f1e8ff] text-[#5b3f86]",
  Acquisition: "bg-[#ffe9f3] text-[#8a4564]",
  Activation: "bg-[#e8f6ff] text-[#305d7a]",
  Retention: "bg-[#eaf9ef] text-[#2f6d46]",
  Referral: "bg-[#fff4df] text-[#7f5a20]",
  Revenue: "bg-[#f7ebff] text-[#6a3d7d]",
};

export default function GrowthMetricRecommendations({ plan }: { plan: GrowthMetricPlan }) {
  return (
    <section className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="mb-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Founder coach</p>
        <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
          Growth takibi için önerilen funnel metrikleri
        </h2>
        <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#666d80]">{plan.summary}</p>
      </div>

      <div className="space-y-5">
        {plan.sections.map((section) => (
          <div key={section.stage} className="rounded-[14px] border border-[#ededed] p-4">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${STAGE_COLORS[section.stage]}`}>
                {section.stage}
              </span>
              <p className="text-[13px] text-[#666d80]">{section.whyItMatters}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {section.metrics.map((metric) => (
                <div key={metric.key} className="rounded-[12px] bg-[#fafafa] p-4">
                  <p className="text-[13px] font-semibold text-[#0d0d12]">{metric.name}</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{metric.description}</p>
                  <p className="mt-3 text-[11px] font-medium text-[#8a8fa0]">Ne zaman mantıklı?</p>
                  <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{metric.whenToUse}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
