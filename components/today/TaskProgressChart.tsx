"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts";

export type TaskChartDay = {
  date: string;
  label: string;
  created: number;
  completed: number;
};

type Props = {
  data: TaskChartDay[];
  locale: string;
  totalCreated: number;
  totalCompleted: number;
};

export default function TaskProgressChart({ data, locale, totalCreated, totalCompleted }: Props) {
  const isEn = locale === "en";
  const isEmpty = data.every((d) => d.created === 0 && d.completed === 0);

  return (
    <div className="rounded-[20px] border border-[#e8e4de] bg-white p-5">
      {/* Header */}
      <div className="mb-4 flex items-start justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Task Progress" : "Görev İlerlemesi"}
          </p>
          <p className="mt-0.5 text-[12px] text-[#b0b7c3]">
            {isEn ? "Last 7 days" : "Son 7 gün"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#95dbda]" />
            <span className="text-[12px] text-[#666d80]">
              {totalCreated} {isEn ? "created" : "oluşturuldu"}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-[#75fc96]" />
            <span className="text-[12px] text-[#666d80]">
              {totalCompleted} {isEn ? "done" : "tamamlandı"}
            </span>
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-[160px] items-center justify-center">
          <p className="text-[13px] text-[#b0b7c3]">
            {isEn ? "No task activity in the last 7 days" : "Son 7 günde görev hareketi yok"}
          </p>
        </div>
      ) : (
        <div className="h-[160px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} barCategoryGap="30%" margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="#f1f5f8" />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: "#8a8fa0" }}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e8e8e8",
                  boxShadow: "0 8px 30px rgba(13,13,18,0.08)",
                  fontSize: 12,
                }}
                cursor={{ fill: "#f6f6f6" }}
                formatter={(value, name) => [
                  value,
                  name === "created"
                    ? (isEn ? "Created" : "Oluşturuldu")
                    : (isEn ? "Completed" : "Tamamlandı"),
                ]}
              />
              <Bar dataKey="created" fill="#95dbda" radius={[4, 4, 0, 0]} name="created" />
              <Bar dataKey="completed" fill="#75fc96" radius={[4, 4, 0, 0]} name="completed" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
