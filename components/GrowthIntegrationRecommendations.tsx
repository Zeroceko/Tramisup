import Link from "next/link";
import type { MetricIntegrationRecommendation } from "@/lib/integration-recommendations";

export default function GrowthIntegrationRecommendations({
  metricRecommendations,
  uncoveredMetricNames,
  locale,
}: {
  metricRecommendations: MetricIntegrationRecommendation[];
  uncoveredMetricNames: string[];
  locale: string;
}) {
  if (metricRecommendations.length === 0 && uncoveredMetricNames.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[18px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff7fa_100%)] p-6 shadow-[0_20px_50px_rgba(17,16,20,0.04)]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">Önerilen kaynaklar</p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
            Seçtiğin metrikleri otomatik takip etmek için bir sonraki katman
          </h2>
          <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
            Growth tarafında hangi sayıları takip edeceğini seçtin. Şimdi bu sayıları mümkün olduğunca otomatik
            akıtacak veri kaynaklarını, her metrik için ayrı ayrı öneriyoruz.
          </p>
        </div>
        <Link
          href={`/${locale}/integrations`}
          className="inline-flex h-11 items-center justify-center rounded-full bg-[#111014] px-5 text-[13px] font-semibold text-white transition hover:bg-[#28232a]"
        >
          Önerilen kaynaklara git
        </Link>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {metricRecommendations.map((recommendation) => (
          <div key={`${recommendation.stage}-${recommendation.metricKey}`} className="rounded-[18px] border border-[#efe2e8] bg-white/90 p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">
                  {recommendation.stage}
                </p>
                <h3 className="mt-1 text-[17px] font-semibold text-[#0d0d12]">{recommendation.metricName}</h3>
              </div>
              <span className="rounded-full bg-[#fff0f7] px-3 py-1 text-[11px] font-semibold text-[#b85e88]">
                {recommendation.providers.length > 0 ? `${recommendation.providers.length} öneri` : "Manual"}
              </span>
            </div>

            {recommendation.providers.length > 0 ? (
              <div className="mt-4 space-y-3">
                {recommendation.providers.map((provider) => (
                  <div key={`${recommendation.metricKey}-${provider.provider}`} className="rounded-[14px] border border-[#f1e5eb] bg-[#fff9fc] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-white text-[20px]">
                          {provider.icon}
                        </div>
                        <div>
                          <p className="text-[14px] font-semibold text-[#0d0d12]">{provider.name}</p>
                          <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{provider.note}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ${
                          provider.connected
                            ? "bg-[#effaf3] text-[#2f6d46]"
                            : provider.mode === "ready_now"
                              ? "bg-[#fff1f7] text-[#b85e88]"
                              : "bg-[#f5f3ff] text-[#6d55b4]"
                        }`}
                      >
                        {provider.connected
                          ? "Bağlı"
                          : provider.mode === "ready_now"
                            ? "Hazır"
                            : "Ek kurulum"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-[13px] leading-6 text-[#5e6678]">
                Bu metrik için henüz doğrudan bir entegrasyon önerimiz yok. Şimdilik Metrics ekranından manuel takip etmek daha güvenli.
              </p>
            )}
          </div>
        ))}
      </div>

      {uncoveredMetricNames.length > 0 ? (
        <div className="mt-5 rounded-[16px] border border-dashed border-[#eadfe6] bg-white/70 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">Manuel veya ek entegrasyon gerektirenler</p>
          <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
            Şu seçimler için henüz doğrudan önerilen connector eşlemesi yok: {uncoveredMetricNames.join(", ")}.
            Bunları şimdilik Metrics ekranından manuel takip edebiliriz.
          </p>
        </div>
      ) : null}
    </section>
  );
}
