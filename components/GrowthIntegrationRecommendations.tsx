"use client";

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
  const isEn = locale === "en";

  if (metricRecommendations.length === 0 && uncoveredMetricNames.length === 0) {
    return null;
  }

  const suggestedProviderCount = new Set(
    metricRecommendations.flatMap((recommendation) =>
      recommendation.providers.map((provider) => provider.provider),
    ),
  ).size;
  const metricsWithProviders = metricRecommendations.filter((recommendation) => recommendation.providers.length > 0).length;

  return (
    <Link
      href={`/${locale}/integrations`}
      className="group block rounded-[16px] border border-[#e4edf3] bg-[#fbfdff] px-4 py-3 transition hover:border-[#d7e5ef] hover:bg-[#f6fbff]"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#5f7891]">
            {isEn ? "Source note" : "Kaynak notu"}
          </p>
          <p className="mt-1 text-[13px] font-semibold text-[#0d0d12]">
            {isEn ? "Open Integrations to improve source coverage" : "Kaynak kapsamasını güçlendirmek için Integrations'ı aç"}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#6a7283]">
            {metricsWithProviders > 0
              ? isEn
                ? `${metricsWithProviders} selected metric already has source suggestions across ${suggestedProviderCount} provider option${suggestedProviderCount === 1 ? "" : "s"}.`
                : `${metricsWithProviders} seçili metrik için ${suggestedProviderCount} farklı provider önerisi hazır.`
              : isEn
                ? "Some selected metrics are safer to keep manual for now."
                : "Bazı seçili metrikleri şimdilik manuel tutmak daha güvenli."}
          </p>
          {uncoveredMetricNames.length > 0 ? (
            <p className="mt-1 text-[11px] text-[#8a8fa0]">
              {isEn
                ? `Manual-first: ${uncoveredMetricNames.join(", ")}`
                : `Önce manuel: ${uncoveredMetricNames.join(", ")}`}
            </p>
          ) : null}
        </div>
        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#dce6ee] bg-white text-[#5f7891] group-hover:text-[#3d5e78]">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M7 17L17 7" />
            <path d="M7 7h10v10" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
