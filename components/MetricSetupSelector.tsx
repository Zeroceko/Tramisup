"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { GrowthMetricPlan } from "@/lib/growth-metric-recommendations";
import type { SavedMetricSetup } from "@/lib/metric-setup";

export default function MetricSetupSelector({
  productId,
  plan,
  initialSetup,
  locale,
}: {
  productId: string;
  plan: GrowthMetricPlan;
  initialSetup: SavedMetricSetup | null;
  locale: string;
}) {
  const router = useRouter();
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

  function selectSingle(stage: string, metricKey: string) {
    setSaved(false);
    setSelected((prev) => ({ ...prev, [stage]: [metricKey] }));
  }

  const completedStages = plan.sections.filter((section) => (selected[section.stage] ?? []).length === 1).length;
  const allStagesReady = completedStages === plan.sections.length;

  async function saveSetup() {
    if (!allStagesReady) {
      setError("Devam etmeden önce her kategori için 1 metrik seç.");
      return;
    }

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
      router.push(`/${locale}/metrics`);
      router.refresh();
    } catch {
      setError("Metrik tercihleri kaydedilemedi. Tekrar dene.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="mb-6 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Metric setup</p>
        <h2 className="mt-1 text-[20px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
          Şimdi sadece 6 ana metriği seçelim
        </h2>
        <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
          Her kategori için tek bir ana metrik seç. Hepsini mükemmel kurmaya çalışma; önce neyi takip edeceğini netleştir, sonra günlük veri girişine geçeceğiz.
        </p>
      </div>

      <div className="space-y-4">
        {plan.sections.map((section) => {
          const selectedKey = selected[section.stage]?.[0];
          return (
            <div key={section.stage} className="rounded-[14px] border border-[#ededed] p-4">
              <div className="mb-3">
                <p className="text-[15px] font-semibold text-[#0d0d12]">{section.stage}</p>
                <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{section.whyItMatters}</p>
              </div>

              <div className="grid gap-3 md:grid-cols-3">
                {section.metrics.map((metric) => {
                  const active = selectedKey === metric.key;
                  return (
                    <button
                      key={metric.key}
                      type="button"
                      onClick={() => selectSingle(section.stage, metric.key)}
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
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-4 mt-6 rounded-[16px] border border-[#ececec] bg-white/95 p-4 shadow-[0_12px_30px_rgba(13,13,18,0.08)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[13px] font-semibold text-[#0d0d12]">{completedStages} / {plan.sections.length} kategori tamamlandı</p>
            <p className="mt-1 text-[12px] text-[#666d80]">Kaydedince seni günlük metrik girişine götüreceğim.</p>
          </div>
          <button
            type="button"
            onClick={() => void saveSetup()}
            disabled={saving || !allStagesReady}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? "Kaydediliyor…" : "Kaydet ve metrik girişine geç"}
          </button>
        </div>
        {saved ? <p className="mt-3 text-[12px] text-[#2f6d46]">Seçimlerin kaydedildi.</p> : null}
        {error ? <p className="mt-3 text-[12px] text-[#b42318]">{error}</p> : null}
      </div>
    </section>
  );
}
