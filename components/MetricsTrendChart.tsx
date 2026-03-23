"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
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

const COLORS = ["#95dbda", "#ffd7ef", "#fee74e", "#75fc96", "#a5b4fc", "#fca5a5"];

export default function MetricsTrendChart({
  entries,
  series,
}: {
  entries: ChartEntry[];
  series: MetricSeries[];
}) {
  return (
    <div className="h-[280px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={entries} margin={{ top: 12, right: 12, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="#f1f3f5" strokeDasharray="3 3" />
          <XAxis dataKey="date" stroke="#8a8fa0" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#8a8fa0" fontSize={12} tickLine={false} axisLine={false} width={36} />
          <Tooltip
            contentStyle={{
              borderRadius: 14,
              border: "1px solid #e8e8e8",
              backgroundColor: "#ffffff",
              boxShadow: "0 12px 32px rgba(13,13,18,0.08)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          {series.map((metric, index) => (
            <Line
              key={metric.stage}
              type="monotone"
              dataKey={metric.stage}
              name={metric.metricName}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2.5}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
