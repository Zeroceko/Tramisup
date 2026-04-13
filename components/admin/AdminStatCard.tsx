type AdminStatCardProps = {
  label: string;
  value: number | string;
  hint?: string;
  tone?: "pink" | "teal" | "yellow" | "green";
};

const toneClasses: Record<NonNullable<AdminStatCardProps["tone"]>, string> = {
  pink: "bg-[#fff6fb] border-[#f3d7ea]",
  teal: "bg-[#f5fffe] border-[#d5f0ef]",
  yellow: "bg-[#fffaf0] border-[#f4dfb6]",
  green: "bg-[#f7fff7] border-[#d7efd8]",
};

export default function AdminStatCard({
  label,
  value,
  hint,
  tone = "teal",
}: AdminStatCardProps) {
  return (
    <div className={`rounded-[22px] border p-5 ${toneClasses[tone]}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
        {label}
      </p>
      <p className="mt-3 text-[34px] font-bold tracking-[-0.04em] text-[#0d0d12]">
        {value}
      </p>
      {hint ? (
        <p className="mt-2 text-[12px] leading-5 text-[#5e6678]">{hint}</p>
      ) : null}
    </div>
  );
}
