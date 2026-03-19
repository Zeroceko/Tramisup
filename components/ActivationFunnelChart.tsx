"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";

const FUNNEL_STEPS = ["SIGNUP", "ONBOARDING", "FIRST_ACTION", "ACTIVATED"];
const STEP_COLORS = ["#6366f1", "#8b5cf6", "#a855f7", "#10b981"];

export default function ActivationFunnelChart({ productId }: { productId: string }) {
  const [funnelData, setFunnelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/metrics/activation-funnel?productId=${productId}`)
      .then((res) => res.json())
      .then((data) => {
        const chartData = FUNNEL_STEPS.map((step) => {
          const stepData = data.find((d: any) => d.step === step) || { count: 0, conversionRate: 0 };
          return {
            step: step.replace("_", " "),
            count: stepData.count,
            conversionRate: stepData.conversionRate || 0,
          };
        });
        setFunnelData(chartData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activation Funnel</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">Loading...</div>
      </div>
    );
  }

  if (funnelData.every((d) => d.count === 0)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activation Funnel</h2>
        <div className="h-64 flex items-center justify-center text-gray-500">
          <p>No funnel data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Activation Funnel</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={funnelData} layout="horizontal">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" stroke="#9ca3af" style={{ fontSize: "12px" }} />
          <YAxis
            dataKey="step"
            type="category"
            stroke="#9ca3af"
            style={{ fontSize: "12px" }}
            width={100}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            formatter={(value, name) => {
              const numericValue = typeof value === "number" ? value : Number(value ?? 0);
              const label = String(name);
              if (label === "count") return [numericValue.toLocaleString(), "Users"];
              return [`${numericValue}%`, "Conversion"];
            }}
          />
          <Legend />
          <Bar dataKey="count" radius={[0, 8, 8, 0]}>
            {funnelData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={STEP_COLORS[index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 space-y-2">
        {funnelData.map((step, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{step.step}</span>
            <div className="flex items-center gap-3">
              <span className="font-medium text-gray-900">{step.count.toLocaleString()} users</span>
              {step.conversionRate > 0 && <span className="text-gray-500">({step.conversionRate}%)</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
