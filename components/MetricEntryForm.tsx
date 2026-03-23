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

const inputCls = "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";
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
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    values: initialValues,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

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

      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6 sticky top-4">
      <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Günlük veri girişi</p>
      <h2 className="mb-2 text-[16px] font-semibold text-[#0d0d12]">Bugünkü metriklerini gir</h2>
      <p className="mb-5 text-[12px] leading-5 text-[#666d80]">Sadece seçtiğin ana AARRR metriklerini gösteriyorum.</p>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="rounded-[10px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
            {error}
          </div>
        )}

        <div>
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
          <div key={metric.stage}>
            <label className={labelCls}>{metric.stage}: {metric.metricName}</label>
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
          className="w-full h-10 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Kaydediliyor…" : "Bugünkü veriyi kaydet"}
        </button>
      </form>
    </div>
  );
}
