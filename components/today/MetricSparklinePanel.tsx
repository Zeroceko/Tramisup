"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type SparkEntry = { date: string; value: number };

type Props = {
  data: SparkEntry[];
  label: string;
  locale: string;
  href: string;
};

const METRIC_LABELS: Record<string, { en: string; tr: string }> = {
  "dau":            { en: "Daily Active Users", tr: "Günlük Aktif Kullanıcı" },
  "mau":            { en: "Monthly Active Users", tr: "Aylık Aktif Kullanıcı" },
  "mrr":            { en: "MRR", tr: "MRR" },
  "arpu":           { en: "ARPU", tr: "ARPU" },
  "website-visits": { en: "Website Visits", tr: "Site Ziyareti" },
  "signups":        { en: "Signups", tr: "Kayıt" },
  "churn-rate":     { en: "Churn Rate", tr: "Churn Oranı" },
};

function humanizeLabel(key: string, isEn: boolean): string {
  const entry = METRIC_LABELS[key];
  if (entry) return isEn ? entry.en : entry.tr;
  return key
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatValue(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(value);
}

export default function MetricSparklinePanel({ data, label, locale, href }: Props) {
  const isEn = locale === "en";

  const lastValue = data[data.length - 1]?.value ?? 0;
  const previousValue = data[data.length - 2]?.value ?? null;
  const delta =
    previousValue != null && previousValue > 0
      ? Math.round(((lastValue - previousValue) / previousValue) * 100)
      : null;
  const isPositive = delta !== null && delta >= 0;

  return (
    <Link
      href={href}
      className="block rounded-[20px] border border-[#e8e4de] bg-white p-5 transition hover:border-[#95dbda]/60 hover:shadow-[0_4px_20px_rgba(149,219,218,0.12)]"
    >
      {/* Header */}
      <div className="mb-3">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
          {isEn ? "Metric Trend" : "Metrik Trendi"}
        </p>
        <p className="mt-0.5 text-[13px] font-medium text-[#5e6678]">
          {humanizeLabel(label, isEn)}
        </p>
      </div>

      {/* Value + delta */}
      <div className="mb-4 flex items-end gap-2">
        <p className="text-[32px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
          {formatValue(lastValue)}
        </p>
        {delta !== null && (
          <span
            className={`mb-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${
              isPositive
                ? "bg-[#dcfce7] text-[#15803d]"
                : "bg-[#fee2e2] text-[#dc2626]"
            }`}
          >
            {isPositive ? "▲" : "▼"} {Math.abs(delta)}%
          </span>
        )}
      </div>

      {/* Sparkline */}
      <div className="h-[72px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 2 }}>
            <defs>
              <linearGradient id="metric-spark-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ccfbf1" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#ccfbf1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              content={() => null}
              cursor={false}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#0d9488"
              strokeWidth={2}
              fill="url(#metric-spark-fill)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <p className="mt-2 text-[11px] text-[#b0b7c3]">
        {isEn ? `${data.length} day trend →` : `${data.length} günlük trend →`}
      </p>
    </Link>
  );
}
