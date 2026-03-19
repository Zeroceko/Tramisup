"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
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
    date: format(new Date(m.date), "MMM d"),
    DAU: m.dau || 0,
    MAU: m.mau || 0,
    MRR: m.mrr || 0,
  }));

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Metrics Overview</h2>
        <div className="text-center py-16 text-gray-500">
          <p className="mb-4">No metrics data available</p>
          <p className="text-sm">Start by entering your first metric →</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Growth Trends (Last 30 Days)</h2>

      <div className="mb-8">
        <h3 className="text-sm font-medium text-gray-700 mb-4">Daily & Monthly Active Users</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="DAU" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="MAU" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-4">Monthly Recurring Revenue</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "white",
                border: "1px solid #e5e7eb",
                borderRadius: "8px",
                padding: "8px 12px",
              }}
              formatter={(value) => {
                const numericValue = typeof value === "number" ? value : Number(value ?? 0);
                return `$${numericValue.toLocaleString()}`;
              }}
            />
            <Legend />
            <Line type="monotone" dataKey="MRR" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
