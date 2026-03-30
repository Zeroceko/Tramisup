"use client";

import { useState } from "react";
import Link from "next/link";
import type { MetricIntegrationRecommendation } from "@/lib/integration-recommendations";
import { BrandLogo } from "@/components/BrandLogo";

export default function GrowthIntegrationRecommendations({
  metricRecommendations,
  uncoveredMetricNames,
  locale,
}: {
  metricRecommendations: MetricIntegrationRecommendation[];
  uncoveredMetricNames: string[];
  locale: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (metricRecommendations.length === 0 && uncoveredMetricNames.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[16px] border border-[#eadfe6] bg-[linear-gradient(180deg,_#fffdfd_0%,_#fff8fb_100%)] p-5 shadow-[0_14px_36px_rgba(17,16,20,0.03)]">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <button
          type="button"
          onClick={() => setIsOpen((value) => !value)}
          className="flex w-full items-start justify-between gap-4 text-left lg:flex-1"
        >
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">Önerilen kaynaklar</p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              Bu metrikleri otomatik akıtmak için uygun kaynaklar
            </h2>
            <p className="mt-2 text-[12px] leading-6 text-[#666d80]">
              Seçtiğin sinyalleri mümkün olduğunca otomatik besleyecek kaynakları stage bazında öneriyoruz.
            </p>
          </div>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#eadfe6] bg-white text-[#666d80] transition hover:text-[#0d0d12]">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </button>
        <Link
          href={`/${locale}/integrations`}
          className="inline-flex h-9 items-center justify-center rounded-full bg-[#111014] px-4 text-[12px] font-semibold text-white transition hover:bg-[#28232a] lg:ml-4"
        >
          Kaynaklara git
        </Link>
      </div>

      {isOpen ? (
      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {metricRecommendations.map((recommendation) => (
          <div
            key={`${recommendation.stage}-${recommendation.metricKey}`}
            className="rounded-[14px] border border-[#efe2e8] bg-white/90 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">
                  {recommendation.stage}
                </p>
                <h3 className="mt-1 text-[15px] font-semibold text-[#0d0d12]">{recommendation.metricName}</h3>
              </div>
              <span className="rounded-full bg-[#fff0f7] px-2.5 py-1 text-[10px] font-semibold text-[#b85e88]">
                {recommendation.providers.length > 0 ? `${recommendation.providers.length} öneri` : "Manual"}
              </span>
            </div>

            {recommendation.providers.length > 0 ? (
              <div className="mt-3 space-y-2">
                {recommendation.providers.map((provider) => (
                  <div
                    key={`${recommendation.metricKey}-${provider.provider}`}
                    className="rounded-[12px] border border-[#f1e5eb] bg-[#fff9fc] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] border border-[#f1e8ed] bg-white">
                          <BrandLogo provider={provider.provider} className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-semibold text-[#0d0d12]">{provider.name}</p>
                          <p className="mt-0.5 text-[11px] leading-5 text-[#666d80]">{provider.note}</p>
                        </div>
                      </div>
                      <span
                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
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
              <p className="mt-3 text-[12px] leading-6 text-[#5e6678]">
                Bu metrik için henüz doğrudan bir entegrasyon önerimiz yok. Şimdilik Metrics ekranından manuel takip etmek daha güvenli.
              </p>
            )}
          </div>
        ))}
      </div>
      ) : null}

      {isOpen && uncoveredMetricNames.length > 0 ? (
        <div className="mt-4 rounded-[14px] border border-dashed border-[#eadfe6] bg-white/70 p-4">
          <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">Manuel veya ek entegrasyon gerektirenler</p>
          <p className="mt-2 text-[12px] leading-6 text-[#666d80]">
            Şu seçimler için henüz doğrudan önerilen connector eşlemesi yok: {uncoveredMetricNames.join(", ")}.
            Bunları şimdilik Metrics ekranından manuel takip edebiliriz.
          </p>
        </div>
      ) : null}
    </section>
  );
}
