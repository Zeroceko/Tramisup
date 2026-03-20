"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface Metric {
  id: string;
  date: Date;
  dau: number | null;
  mau: number | null;
  mrr: number | null;
  newSignups: number | null;
  churnedUsers: number | null;
  activationRate: number | null;
}

export default function MetricsOverview({ metrics }: { metrics: Metric[] }) {
  const chartData = metrics.map((m) => ({
    date: format(new Date(m.date), "d MMM"),
    DAU: m.dau || 0,
    MAU: m.mau || 0,
    MRR: m.mrr || 0,
  }));

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
        <h2 className="text-[16px] font-semibold text-[#0d0d12] mb-4">Metrik Trendi</h2>
        <div className="text-center py-16">
          <p className="text-[14px] text-[#666d80]">Henüz metrik verisi yok</p>
          <p className="mt-1 text-[13px] text-[#9ca3af]">İlk metriğini girerek başla →</p>
        </div>
      </div>
    );
  }

  const tooltipStyle = {
    backgroundColor: "white",
    border: "1px solid #e8e8e8",
    borderRadius: "10px",
    padding: "8px 12px",
    fontSize: "12px",
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Kullanıcılar</p>
        <h3 className="text-[16px] font-semibold text-[#0d0d12] mb-5">Günlük & Aylık Aktif Kullanıcı</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} />
            <Line type="monotone" dataKey="DAU" stroke="#95dbda" strokeWidth={2} dot={false} name="DAU" />
            <Line type="monotone" dataKey="MAU" stroke="#ffd7ef" strokeWidth={2} dot={false} name="MAU" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Gelir</p>
        <h3 className="text-[16px] font-semibold text-[#0d0d12] mb-5">Monthly Recurring Revenue</h3>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="date" stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis stroke="#9ca3af" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => {
                const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                return [`$${numericValue.toLocaleString()}`, "MRR"];
              }}
            />
            <Line type="monotone" dataKey="MRR" stroke="#75fc96" strokeWidth={2} dot={false} name="MRR" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
