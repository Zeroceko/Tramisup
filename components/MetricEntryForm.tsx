"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface LatestMetric {
  dau: number | null;
  mau: number | null;
  mrr: number | null;
  activeSubscriptions: number | null;
  newSignups: number | null;
  churnedUsers: number | null;
  activationRate: number | null;
}

const inputCls = "w-full px-4 py-2.5 rounded-[10px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";
const labelCls = "block text-[12px] font-semibold text-[#0d0d12] mb-1.5";

export default function MetricEntryForm({
  productId,
  latestMetric,
}: {
  productId: string;
  latestMetric: LatestMetric | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    date: format(new Date(), "yyyy-MM-dd"),
    dau: latestMetric?.dau?.toString() || "",
    mau: latestMetric?.mau?.toString() || "",
    mrr: latestMetric?.mrr?.toString() || "",
    activeSubscriptions: latestMetric?.activeSubscriptions?.toString() || "",
    newSignups: "",
    churnedUsers: "",
    activationRate: latestMetric?.activationRate?.toString() || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          date: formData.date,
          dau: formData.dau ? parseInt(formData.dau) : null,
          mau: formData.mau ? parseInt(formData.mau) : null,
          mrr: formData.mrr ? parseFloat(formData.mrr) : null,
          activeSubscriptions: formData.activeSubscriptions ? parseInt(formData.activeSubscriptions) : null,
          newSignups: formData.newSignups ? parseInt(formData.newSignups) : null,
          churnedUsers: formData.churnedUsers ? parseInt(formData.churnedUsers) : null,
          activationRate: formData.activationRate ? parseFloat(formData.activationRate) : null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to save metrics");
      }

      router.refresh();
      setError("");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6 sticky top-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Veri girişi</p>
      <h2 className="text-[16px] font-semibold text-[#0d0d12] mb-5">Metrik Gir</h2>

      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-600">
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

        <div>
          <label className={labelCls}>DAU</label>
          <input
            type="number"
            value={formData.dau}
            onChange={(e) => setFormData({ ...formData, dau: e.target.value })}
            placeholder="Günlük aktif kullanıcı"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>MAU</label>
          <input
            type="number"
            value={formData.mau}
            onChange={(e) => setFormData({ ...formData, mau: e.target.value })}
            placeholder="Aylık aktif kullanıcı"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>MRR ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.mrr}
            onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
            placeholder="Aylık yinelenen gelir"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Aktif Abonelikler</label>
          <input
            type="number"
            value={formData.activeSubscriptions}
            onChange={(e) => setFormData({ ...formData, activeSubscriptions: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Yeni Kayıtlar</label>
          <input
            type="number"
            value={formData.newSignups}
            onChange={(e) => setFormData({ ...formData, newSignups: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Churn Olan Kullanıcılar</label>
          <input
            type="number"
            value={formData.churnedUsers}
            onChange={(e) => setFormData({ ...formData, churnedUsers: e.target.value })}
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Aktivasyon Oranı (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.activationRate}
            onChange={(e) => setFormData({ ...formData, activationRate: e.target.value })}
            className={inputCls}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-10 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Kaydediliyor…" : "Metrikleri Kaydet"}
        </button>
      </form>
    </div>
  );
}
