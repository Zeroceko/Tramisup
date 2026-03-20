type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "pink" | "teal" | "yellow" | "green";
};

const accentMap: Record<string, string> = {
  pink:   "bg-[#ffd7ef]",
  teal:   "bg-[#95dbda]",
  yellow: "bg-[#fee74e]",
  green:  "bg-[#75fc96]",
};

export default function StatCard({ label, value, hint, accent }: StatCardProps) {
  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
          {label}
        </p>
        {accent && (
          <span className={`w-2.5 h-2.5 rounded-full ${accentMap[accent]}`} />
        )}
      </div>
      <p className="text-[32px] font-bold text-[#0d0d12] leading-none tracking-[-0.03em]">
        {value}
      </p>
      {hint && <p className="text-[13px] text-[#666d80]">{hint}</p>}
    </div>
  );
}
