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

type DeltaResult = {
  stage: FunnelStageKey;
  metricName: string;
  newValue: number;
  prevValue: number | null;
  change: number | null;
  direction: "up" | "down" | "same" | "first";
};

type PostSave = {
  deltas: DeltaResult[];
  droppedStage: FunnelStageKey | null;
};

const STAGE_ACTION_HINTS: Partial<Record<FunnelStageKey, string>> = {
  Awareness: "Trafik kaynağını çeşitlendir veya içerik üretimini artır.",
  Acquisition: "Landing page dönüşümünü test et. Signup adımlarını azalt.",
  Activation: "Onboarding akışını gözden geçir. Aha moment'a giden adımları kısalt.",
  Retention: "En aktif kullanıcılarla görüş — neden geri geliyor?",
  Referral: "Referral mekanizması yeterince görünür mü? Davet sürtüşmesini azalt.",
  Revenue: "Trial süresi yeterli mi? Ücretli geçişin önündeki engeli bul.",
};

const FUNNEL_ORDER: FunnelStageKey[] = [
  "Awareness",
  "Acquisition",
  "Activation",
  "Retention",
  "Referral",
  "Revenue",
];

function computeDeltas(
  submitted: Record<string, string>,
  prev: MetricEntryRow | null,
  metrics: SelectedMetricField[]
): DeltaResult[] {
  return metrics.map((m) => {
    const newValue = Number(submitted[m.stage]);
    const prevValue = prev?.values?.[m.stage] ?? null;
    if (prevValue === null) {
      return { stage: m.stage, metricName: m.metricName, newValue, prevValue: null, change: null, direction: "first" };
    }
    const change = newValue - prevValue;
    const pctChange = prevValue > 0 ? (change / prevValue) * 100 : 0;
    const direction = pctChange > 5 ? "up" : pctChange < -5 ? "down" : "same";
    return { stage: m.stage, metricName: m.metricName, newValue, prevValue, change, direction } as DeltaResult;
  });
}

function findDroppedStage(deltas: DeltaResult[]): FunnelStageKey | null {
  const dropped = deltas
    .filter((d) => d.direction === "down")
    .sort((a, b) => FUNNEL_ORDER.indexOf(a.stage) - FUNNEL_ORDER.indexOf(b.stage));
  return dropped[0]?.stage ?? null;
}

const inputCls =
  "w-full rounded-[12px] border border-[#e8e8e8] bg-[#fafafa] px-3 py-2.5 text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none transition focus:border-[#95dbda] focus:bg-white";

export default function MetricEntryForm({
  productId,
  selectedMetrics,
  latestEntry,
  locale,
  compact = false,
  entryCount = 0,
}: {
  productId: string;
  selectedMetrics: SelectedMetricField[];
  latestEntry: MetricEntryRow | null;
  locale?: string;
  compact?: boolean;
  entryCount?: number;
}) {
  const router = useRouter();

  const initialValues = useMemo(() => {
    const base: Record<string, string> = {};
    for (const m of selectedMetrics) {
      base[m.stage] = "";
    }
    return base;
  }, [selectedMetrics]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [postSave, setPostSave] = useState<PostSave | null>(null);
  const [buildingDashboard, setBuildingDashboard] = useState(false);
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    values: initialValues,
  });

  const filledCount = Object.values(formData.values).filter((v) => v !== "").length;
  const allFilled = filledCount === selectedMetrics.length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFilled) {
      setError("Tüm metriklere bugünkü değeri gir.");
      return;
    }
    setLoading(true);
    setError("");
    setPostSave(null);

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          date: formData.date,
          values: Object.fromEntries(
            Object.entries(formData.values).map(([stage, v]) => [stage, Number(v)])
          ),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Kaydedilemedi");
      }

      // 5. giriş tamamlandıysa dashboard building popup göster
      const isJustActivated = entryCount + 1 >= 5 && entryCount < 5;
      if (isJustActivated) {
        setBuildingDashboard(true);
        await router.refresh();
        setTimeout(() => setBuildingDashboard(false), 2200);
      } else {
        // Compute post-save interpretation
        const deltas = computeDeltas(formData.values, latestEntry, selectedMetrics);
        const droppedStage = findDroppedStage(deltas);
        setPostSave({ deltas, droppedStage });
        router.refresh();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  // --- Dashboard building popup (5th entry milestone) ---
  if (buildingDashboard) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
        <div className="mx-4 w-full max-w-sm rounded-[24px] bg-[#0d0d12] p-8 text-center text-white shadow-2xl">
          <div className="mb-5 flex justify-center">
            <svg className="animate-spin h-8 w-8 text-[#95dbda]" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
              <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          </div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">Tiramisup</p>
          <p className="mt-2 text-[20px] font-semibold leading-snug tracking-[-0.01em]">Grafikler oluşturuluyor</p>
          <p className="mt-2 text-[13px] leading-6 text-white/60">5 günlük veri tamamlandı. Dashboard hazırlanıyor…</p>
        </div>
      </div>
    );
  }

  // --- Post-save interpretation panel ---
  if (postSave) {
    return (
      <div className="rounded-[16px] border border-[#d1f0ef] bg-[#f0fafa] p-5">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#95dbda] text-[10px] font-bold text-[#0d0d12]">
            ✓
          </span>
          <p className="text-[13px] font-semibold text-[#0d0d12]">
            Bugünkü veriler kaydedildi
          </p>
        </div>

        {/* Delta table */}
        <div className="mt-4 space-y-2">
          {postSave.deltas.map((d) => (
            <div
              key={d.stage}
              className="flex items-center justify-between rounded-[10px] bg-white px-3 py-2"
            >
              <div>
                <p className="text-[11px] text-[#8a8fa0]">{d.stage}</p>
                <p className="text-[12px] font-semibold text-[#0d0d12]">{d.metricName}</p>
              </div>
              <div className="text-right">
                <p className="text-[14px] font-bold text-[#0d0d12]">
                  {new Intl.NumberFormat("tr-TR").format(d.newValue)}
                </p>
                {d.direction === "first" ? (
                  <p className="text-[10px] text-[#8a8fa0]">İlk kayıt</p>
                ) : (
                  <p
                    className={`text-[11px] font-semibold ${
                      d.direction === "up"
                        ? "text-[#15803d]"
                        : d.direction === "down"
                        ? "text-[#dc2626]"
                        : "text-[#8a8fa0]"
                    }`}
                  >
                    {d.direction === "up" ? "↑" : d.direction === "down" ? "↓" : "→"}{" "}
                    {d.change !== null
                      ? `${d.change > 0 ? "+" : ""}${new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(d.change)}`
                      : ""}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Action suggestion for dropped stage */}
        {postSave.droppedStage && (
          <div className="mt-3 rounded-[12px] border border-orange-100 bg-[#fff7ed] p-3">
            <p className="text-[12px] font-semibold text-[#c2410c]">
              {postSave.droppedStage} aşamasında düşüş var
            </p>
            <p className="mt-0.5 text-[11px] leading-4 text-[#c2410c]">
              {STAGE_ACTION_HINTS[postSave.droppedStage] ?? "Bu aşama için görev oluşturmayı düşün."}
            </p>
            <a
              href={locale ? `/${locale}/tasks` : "/tasks"}
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[#c2410c] underline underline-offset-2"
            >
              Görevlere git →
            </a>
          </div>
        )}

        {/* All good */}
        {!postSave.droppedStage && postSave.deltas.some((d) => d.direction === "up") && (
          <div className="mt-3 rounded-[12px] bg-[#f0fdf4] p-3">
            <p className="text-[12px] font-semibold text-[#15803d]">İyi gidiyor</p>
            <p className="mt-0.5 text-[11px] leading-4 text-[#15803d]">
              Hiç düşüş yok — sıradaki dar boğazı bulmak için trend görünümüne bak.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => {
            setPostSave(null);
            setFormData({ date: format(new Date(), "yyyy-MM-dd"), values: initialValues });
          }}
          className="mt-4 w-full rounded-full border border-[#e8e8e8] py-2 text-[12px] font-semibold text-[#666d80] transition hover:bg-white"
        >
          Yeni giriş yap
        </button>
      </div>
    );
  }

  // --- Entry form ---
  return (
    <div className={compact ? "" : "rounded-[16px] border border-[#e8e8e8] bg-white p-5"}>
      {!compact && (
        <div className="mb-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#666d80]">
            Günlük giriş
          </p>
          <h3 className="mt-0.5 text-[16px] font-semibold text-[#0d0d12]">Bugün neler oldu?</h3>
          <p className="mt-1 text-[12px] leading-4 text-[#666d80]">
            {latestEntry
              ? `Son giriş: ${latestEntry.date}. Değerlerin değişmediyse aynı sayıları girebilirsin.`
              : "İlk veri girişin. Bu değerler trend analizinin baz çizgisini oluşturur."}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Date */}
        <div>
          <label className="mb-1 block text-[11px] font-semibold text-[#666d80]">
            Tarih
          </label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className={inputCls}
            required
          />
        </div>

        {/* Per-metric inputs */}
        {selectedMetrics.map((metric) => {
          const lastVal = latestEntry?.values?.[metric.stage];
          return (
            <div key={metric.stage}>
              <label className="mb-1 block text-[11px] font-semibold text-[#666d80]">
                {metric.stage} — {metric.metricName}
              </label>
              {lastVal !== undefined && (
                <p className="mb-1 text-[11px] text-[#8a8fa0]">
                  Son değer: {new Intl.NumberFormat("tr-TR").format(lastVal)}
                </p>
              )}
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.values[metric.stage] ?? ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    values: { ...prev.values, [metric.stage]: e.target.value },
                  }))
                }
                placeholder={lastVal !== undefined ? String(lastVal) : "0"}
                className={inputCls}
              />
            </div>
          );
        })}

        {error && (
          <p className="rounded-[10px] border border-red-100 bg-red-50 px-3 py-2 text-[12px] text-red-600">
            {error}
          </p>
        )}

        {/* Progress hint */}
        {!allFilled && filledCount > 0 && (
          <p className="text-[11px] text-[#8a8fa0]">
            {selectedMetrics.length - filledCount} alan daha doldurulacak
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !allFilled}
          className="h-10 w-full rounded-full bg-[#0d0d12] text-[13px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Kaydediliyor…" : "Kaydet"}
        </button>
      </form>
    </div>
  );
}
