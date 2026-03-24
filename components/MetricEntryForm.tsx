"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { FunnelStageKey, MetricEntryRow } from "@/lib/metric-setup";

type SelectedMetricField = {
  stage: FunnelStageKey;
  metricKey: string;
  metricName: string;
};

const inputCls = "w-full rounded-[18px] border border-[#ececec] bg-[#fcfcfc] px-4 py-3 text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none transition focus:border-[#95dbda] focus:bg-white";
const labelCls = "block text-[12px] font-semibold text-[#0d0d12] mb-1.5";

export default function MetricEntryForm({
  productId,
  selectedMetrics,
  latestEntry,
}: {
  productId: string;
  selectedMetrics: SelectedMetricField[];
  latestEntry: MetricEntryRow | null;
}) {
  const router = useRouter();
  const initialValues = useMemo(() => {
    const base: Record<string, string> = {};
    for (const metric of selectedMetrics) {
      base[metric.stage] = latestEntry?.values?.[metric.stage]?.toString() ?? "";
    }
    return base;
  }, [latestEntry, selectedMetrics]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    values: initialValues,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSavedMessage("");

    const values = Object.values(formData.values).filter(Boolean);
    if (values.length !== selectedMetrics.length) {
      setError("Devam etmeden önce seçtiğin tüm metriklere bugünkü değer gir.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          date: formData.date,
          values: Object.fromEntries(
            Object.entries(formData.values).map(([stage, value]) => [stage, Number(value)])
          ),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save metrics");
      }

      setSavedMessage("Bugünkü sayıların kaydedildi. Şimdi soldaki kartlar, trend ve son girişler kısmında görünecek.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sticky top-4 rounded-[30px] border border-[#ececec] bg-white p-6 shadow-[0_20px_60px_rgba(13,13,18,0.04)]">
      <div className="rounded-[26px] bg-[#0d0d12] p-5 text-white">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
          Günlük giriş
        </p>
        <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.04em] leading-[1.08]">
          Bugün neler oldu?
        </h2>
        <p className="mt-3 text-[13px] leading-6 text-white/72">
          Burada sadece seçtiğin ana sayıları giriyorsun. Kaydettikten sonra soldaki trend, snapshot ve funnel yorumları hemen güncellenir.
        </p>
      </div>

      <div className="mt-5 rounded-[22px] bg-[#f7f7f8] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">Kısa rehber</p>
        <p className="mt-1 text-[12px] leading-5 text-[#5e6678]">
          Growth ekranında neyi takip edeceğini seçtin. Metrics ekranı ise bunu günlük ya da haftalık ritimle canlı tutar.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-[16px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </div>
        )}
        {savedMessage && (
          <div className="rounded-[16px] border border-[#cce8d3] bg-[#f4fbf6] px-4 py-3 text-[13px] text-[#2f6d46]">
            {savedMessage}
          </div>
        )}

        <div className="pt-1">
          <label className={labelCls}>Tarih</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={inputCls}
            required
          />
        </div>

        {selectedMetrics.map((metric) => (
          <div key={metric.stage} className="rounded-[22px] border border-[#efefef] bg-[#fbfbfb] p-4">
            <label className={labelCls}>{metric.stage}: {metric.metricName}</label>
            <p className="mb-2 text-[11px] text-[#8a8fa0]">
              Son değer: {latestEntry?.values?.[metric.stage] ?? "Henüz yok"}
            </p>
            <input
              type="number"
              step="0.01"
              value={formData.values[metric.stage] ?? ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  values: { ...prev.values, [metric.stage]: e.target.value },
                }))
              }
              placeholder={`${metric.metricName} değeri`}
              className={inputCls}
            />
          </div>
        ))}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 h-12 w-full rounded-full bg-[#111111] text-[13px] font-semibold text-white transition hover:bg-[#2a2a2d] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Kaydediliyor…" : "Bugünkü veriyi kaydet"}
        </button>
      </form>
    </div>
  );
}
