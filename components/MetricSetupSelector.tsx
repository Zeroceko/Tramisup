"use client";

import { useMemo, useState } from "react";
import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";

export default function MetricSetupSelector({
  productId,
  plan,
  initialSetup,
}: {
  productId: string;
  plan: GrowthMetricPlan;
  initialSetup: SavedMetricSetup | null;
}) {
  const initialMap = useMemo(() => {
    const map: Record<string, string[]> = {};
    for (const selection of initialSetup?.selections ?? []) {
      map[selection.stage] = selection.selectedMetricKeys;
    }
    return map;
  }, [initialSetup]);

  const [selected, setSelected] = useState<Record<string, string[]>>(initialMap);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(stage: string, metricKey: string) {
    setSaved(false);
    setSelected((prev) => {
      const stageValues = prev[stage] ?? [];
      const nextValues = stageValues.includes(metricKey)
        ? stageValues.filter((item) => item !== metricKey)
        : [...stageValues, metricKey];
      return { ...prev, [stage]: nextValues };
    });
  }

  async function saveSetup() {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const setup: SavedMetricSetup = {
        version: 1,
        selections: plan.sections.map((section) => ({
          stage: section.stage,
          selectedMetricKeys: selected[section.stage] ?? [],
        })),
      };

      const res = await fetch(`/api/products/${productId}/metric-setup`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setup }),
      });

      if (!res.ok) throw new Error("save failed");
      setSaved(true);
    } catch {
      setError("Metrik tercihleri kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Metric setup</p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
            Takip etmek istediğin metrikleri seç
          </h2>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[#666d80]">
            Founder Coach sana seçenekleri gösterir; sen ürününe en uygun olanları işaretlersin. Sonra metrics ekranını buna göre genişletiriz.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void saveSetup()}
          disabled={saving}
          className="inline-flex h-10 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {saving ? "Kaydediliyor…" : "Seçimlerimi kaydet"}
        </button>
      </div>

      <div className="space-y-5">
        {plan.sections.map((section) => (
          <div key={section.stage} className="rounded-[14px] border border-[#ededed] p-4">
            <div className="mb-3">
              <p className="text-[13px] font-semibold text-[#0d0d12]">{section.stage}</p>
              <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{section.whyItMatters}</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {section.metrics.map((metric) => {
                const active = (selected[section.stage] ?? []).includes(metric.key);
                return (
                  <button
                    key={metric.key}
                    type="button"
                    onClick={() => toggle(section.stage, metric.key)}
                    className={`rounded-[12px] border p-4 text-left transition ${
                      active
                        ? "border-[#95dbda] bg-[#f0fafa]"
                        : "border-[#ececec] bg-[#fafafa] hover:border-[#d9d9d9]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-[13px] font-semibold text-[#0d0d12]">{metric.name}</p>
                      <span
                        className={`mt-0.5 inline-flex h-4 w-4 items-center justify-center rounded-full border ${
                          active ? "border-[#95dbda] bg-[#95dbda]" : "border-[#cfcfcf]"
                        }`}
                      >
                        {active ? (
                          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                            <path d="M1 3L3 5L7 1" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        ) : null}
                      </span>
                    </div>
                    <p className="mt-2 text-[12px] leading-5 text-[#666d80]">{metric.description}</p>
                    <p className="mt-3 text-[11px] leading-5 text-[#8a8fa0]">{metric.whenToUse}</p>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {saved ? <p className="mt-4 text-[12px] text-[#2f6d46]">Seçimlerin kaydedildi.</p> : null}
      {error ? <p className="mt-4 text-[12px] text-[#b42318]">{error}</p> : null}
    </section>
  );
}
