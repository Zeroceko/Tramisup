type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "pink" | "teal" | "yellow" | "green";
  // percentage 0–100 to draw a mini bar chart
  progress?: number;
};

const accentBar: Record<string, string> = {
  pink:   "bg-[#ffd7ef]",
  teal:   "bg-[#95dbda]",
  yellow: "bg-[#fee74e]",
  green:  "bg-[#75fc96]",
};

// Mini bar chart: 8 bars, last `filled` bars are colored
function MiniBarChart({ filled, color }: { filled: number; color: string }) {
  const total = 8;
  return (
    <div className="flex items-end gap-[3px] h-8">
      {Array.from({ length: total }).map((_, i) => {
        const isColored = i >= total - filled;
        const heights = [12, 16, 10, 20, 14, 18, 22, 16];
        return (
          <div
            key={i}
            className={`w-[4px] rounded-sm transition-all ${
              isColored ? color : "bg-[#f0f0f0]"
            }`}
            style={{ height: heights[i] }}
          />
        );
      })}
    </div>
  );
}

export default function StatCard({ label, value, hint, accent, progress }: StatCardProps) {
  const filledBars = progress != null ? Math.round((progress / 100) * 8) : 0;
  const barColor = accent ? accentBar[accent] : "bg-[#95dbda]";

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium text-[#666d80]">{label}</p>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
          <path d="M7 17L17 7M17 7H7M17 7v10" />
        </svg>
      </div>

      <div className="flex items-end justify-between gap-2">
        <p className="text-[36px] font-bold text-[#0d0d12] leading-none tracking-[-0.04em]">
          {value}
        </p>
        {progress != null && (
          <MiniBarChart filled={filledBars} color={barColor} />
        )}
      </div>

      {hint && (
        <p className="text-[12px] text-[#9ca3af]">{hint}</p>
      )}
    </div>
  );
}
