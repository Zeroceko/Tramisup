import type { GrowthTacticsPlan } from "@/lib/growth-tactics";

export default function GrowthTacticsPanel({
  plan,
  locale,
}: {
  plan: GrowthTacticsPlan | null;
  locale: string;
}) {
  if (!plan) return null;
  const isEn = locale === "en";

  return (
    <section className="rounded-[18px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffefe_0%,_#fff7fa_100%)] p-6">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
        Growth tactics
      </p>
      <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
        {plan.title}
      </h2>
      <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#666d80]">
        {plan.diagnosis}
      </p>
      {plan.readinessNote ? (
        <div className="mt-4 rounded-[14px] border border-[#f1e5eb] bg-white/85 px-4 py-3 text-[13px] leading-6 text-[#5e6678]">
          {plan.readinessNote}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-3">
        {plan.tactics.map((tactic) => (
          <article
            key={`${tactic.channel}-${tactic.title}`}
            className="rounded-[16px] border border-white/80 bg-white/90 p-4 shadow-[0_10px_24px_rgba(25,27,39,0.04)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#8b93a6]">
                {tactic.channel}
              </p>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                  tactic.confidence === "high"
                    ? "bg-[#f0fffe] text-[#0d9488]"
                    : tactic.confidence === "medium"
                      ? "bg-[#fff7d6] text-[#9a6700]"
                      : "bg-[#f4f4f5] text-[#666d80]"
                }`}
              >
                {tactic.confidence === "high"
                  ? isEn ? "High confidence" : "Yüksek güven"
                  : tactic.confidence === "medium"
                    ? isEn ? "Medium confidence" : "Orta güven"
                    : isEn ? "Low confidence" : "Düşük güven"}
              </span>
            </div>
            <h3 className="mt-3 text-[16px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              {tactic.title}
            </h3>
            <p className="mt-2 text-[13px] leading-6 text-[#5e6678]">
              {tactic.whyNow}
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-[12px] bg-[#faf7f9] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b93a6]">
                  {isEn ? "How to start" : "Nasıl başlarsın?"}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#3f4656]">{tactic.howToStart}</p>
              </div>
              <div className="rounded-[12px] bg-[#f8fbfb] px-3 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8b93a6]">
                  {isEn ? "Success signal" : "Başarı sinyali"}
                </p>
                <p className="mt-1 text-[12px] leading-5 text-[#3f4656]">{tactic.successSignal}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
