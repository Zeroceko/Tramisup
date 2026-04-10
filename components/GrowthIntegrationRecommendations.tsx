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
  const isEn = locale === "en";

  if (metricRecommendations.length === 0 && uncoveredMetricNames.length === 0) {
    return null;
  }

  return (
    <section className="rounded-[16px] border border-[#eadfe6] bg-[#fffcfd] px-4 py-3">
      <button
        type="button"
        onClick={() => setIsOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#b85e88] shrink-0">
            {isEn ? "Recommended sources" : "Önerilen kaynaklar"}
          </span>
          <span className="text-[12px] text-[#8a8fa0] truncate">
            {isEn
              ? `${metricRecommendations.length} metric(s) with source suggestions`
              : `${metricRecommendations.length} metrik için kaynak önerisi`}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={`/${locale}/integrations`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex h-7 items-center rounded-full bg-[#111014] px-3 text-[11px] font-semibold text-white transition hover:bg-[#28232a]"
          >
            {isEn ? "Sources" : "Kaynaklara git"}
          </Link>
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-[#eadfe6] bg-white text-[#666d80]">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </span>
        </div>
      </button>

      {isOpen ? (
      <div className="mt-3 grid gap-2 lg:grid-cols-2">
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
                {recommendation.providers.length > 0
                  ? isEn
                    ? `${recommendation.providers.length} suggestion${recommendation.providers.length > 1 ? "s" : ""}`
                    : `${recommendation.providers.length} öneri`
                  : "Manual"}
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
                          ? isEn ? "Connected" : "Bağlı"
                          : provider.mode === "ready_now"
                            ? isEn ? "Ready" : "Hazır"
                            : isEn ? "Extra setup" : "Ek kurulum"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-[12px] leading-6 text-[#5e6678]">
                {isEn
                  ? "We do not have a direct integration recommendation for this metric yet. For now, manual tracking in Metrics is the safer option."
                  : "Bu metrik için henüz doğrudan bir entegrasyon önerimiz yok. Şimdilik Metrics ekranından manuel takip etmek daha güvenli."}
              </p>
            )}
          </div>
        ))}
      </div>
      ) : null}

      {isOpen && uncoveredMetricNames.length > 0 ? (
        <p className="mt-2 text-[11px] text-[#8a8fa0] px-1">
          {isEn
            ? `Manual tracking: ${uncoveredMetricNames.join(", ")}`
            : `Manuel takip: ${uncoveredMetricNames.join(", ")}`}
        </p>
      ) : null}
    </section>
  );
}
