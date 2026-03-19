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
          activeSubscriptions: formData.activeSubscriptions
            ? parseInt(formData.activeSubscriptions)
            : null,
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Metrics</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">DAU</label>
          <input
            type="number"
            value={formData.dau}
            onChange={(e) => setFormData({ ...formData, dau: e.target.value })}
            placeholder="Daily Active Users"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MAU</label>
          <input
            type="number"
            value={formData.mau}
            onChange={(e) => setFormData({ ...formData, mau: e.target.value })}
            placeholder="Monthly Active Users"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">MRR ($)</label>
          <input
            type="number"
            step="0.01"
            value={formData.mrr}
            onChange={(e) => setFormData({ ...formData, mrr: e.target.value })}
            placeholder="Monthly Recurring Revenue"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Active Subscriptions</label>
          <input
            type="number"
            value={formData.activeSubscriptions}
            onChange={(e) => setFormData({ ...formData, activeSubscriptions: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Signups</label>
          <input
            type="number"
            value={formData.newSignups}
            onChange={(e) => setFormData({ ...formData, newSignups: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Churned Users</label>
          <input
            type="number"
            value={formData.churnedUsers}
            onChange={(e) => setFormData({ ...formData, churnedUsers: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Activation Rate (%)</label>
          <input
            type="number"
            step="0.01"
            value={formData.activationRate}
            onChange={(e) => setFormData({ ...formData, activationRate: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Save Metrics"}
        </button>
      </form>
    </div>
  );
}
