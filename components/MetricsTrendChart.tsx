"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartEntry = {
  date: string;
  [key: string]: string | number;
};

type MetricSeries = {
  stage: string;
  metricName: string;
};

const COLORS = [
  { stroke: "#0d9488", fill: "#ccfbf1" },
  { stroke: "#d946ef", fill: "#fae8ff" },
  { stroke: "#eab308", fill: "#fef9c3" },
  { stroke: "#22c55e", fill: "#dcfce7" },
  { stroke: "#6366f1", fill: "#e0e7ff" },
  { stroke: "#ef4444", fill: "#fee2e2" },
];

function Sparkline({ data, dataKey, color }: { data: ChartEntry[]; dataKey: string; color: typeof COLORS[0] }) {
  return (
    <div className="h-[48px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color.fill} stopOpacity={0.8} />
              <stop offset="100%" stopColor={color.fill} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color.stroke}
            strokeWidth={1.5}
            fill={`url(#spark-${dataKey})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatValue(value: number | undefined | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("tr-TR", { maximumFractionDigits: 1 }).format(value);
}

function computeDelta(data: ChartEntry[], key: string): { label: string; positive: boolean | null } {
  const values = data.map((d) => d[key]).filter((v): v is number => typeof v === "number");
  if (values.length < 2) return { label: "—", positive: null };
  const first = values[0];
  const last = values[values.length - 1];
  if (first === 0) return { label: last > 0 ? `+${formatValue(last)}` : "0", positive: last > 0 };
  const pct = ((last - first) / Math.abs(first)) * 100;
  return {
    label: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`,
    positive: pct > 0 ? true : pct < 0 ? false : null,
  };
}

export default function MetricsTrendChart({
  entries,
  series,
}: {
  entries: ChartEntry[];
  series: MetricSeries[];
}) {
  if (entries.length < 2) return null;

  return (
    <div className="space-y-5">
      {/* Main combined chart */}
      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={entries} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
            <defs>
              {series.map((metric, i) => {
                const color = COLORS[i % COLORS.length];
                return (
                  <linearGradient key={metric.stage} id={`area-${metric.stage}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color.fill} stopOpacity={0.6} />
                    <stop offset="100%" stopColor={color.fill} stopOpacity={0} />
                  </linearGradient>
                );
              })}
            </defs>
            <CartesianGrid stroke="#f1f3f5" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#8a8fa0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#8a8fa0"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 16,
                border: "1px solid #e8e8e8",
                backgroundColor: "#ffffff",
                boxShadow: "0 12px 40px rgba(13,13,18,0.1)",
                fontSize: 13,
              }}
              labelStyle={{ color: "#0d0d12", fontWeight: 600, marginBottom: 4 }}
            />
            {series.map((metric, i) => {
              const color = COLORS[i % COLORS.length];
              return (
                <Area
                  key={metric.stage}
                  type="monotone"
                  dataKey={metric.stage}
                  name={metric.metricName}
                  stroke={color.stroke}
                  strokeWidth={2}
                  fill={`url(#area-${metric.stage})`}
                  dot={{ r: 2.5, fill: color.stroke, strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: color.stroke, strokeWidth: 2, stroke: "#fff" }}
                />
              );
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-stage sparkline cards */}
      <div className="grid gap-3 md:grid-cols-3">
        {series.map((metric, i) => {
          const color = COLORS[i % COLORS.length];
          const lastValue = entries.at(-1)?.[metric.stage];
          const delta = computeDelta(entries, metric.stage);
          return (
            <div key={metric.stage} className="rounded-[16px] border border-[#f0f0f0] bg-[#fbfbfb] p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.14em] text-[#8b93a6]">{metric.stage}</p>
                  <p className="text-[13px] font-medium text-[#0d0d12]">{metric.metricName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[18px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
                    {formatValue(typeof lastValue === "number" ? lastValue : null)}
                  </p>
                  <p className={`text-[11px] font-medium ${
                    delta.positive === true ? "text-[#0d9488]" : delta.positive === false ? "text-[#ef4444]" : "text-[#8b93a6]"
                  }`}>
                    {delta.label}
                  </p>
                </div>
              </div>
              <Sparkline data={entries} dataKey={metric.stage} color={color} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
