type StatCardProps = {
  label: string;
  value: string;
  hint?: string;
  accent?: "blue" | "violet" | "emerald" | "amber";
};

const accentMap = {
  blue: "from-blue-500/15 to-cyan-500/10 text-blue-700",
  violet: "from-violet-500/15 to-fuchsia-500/10 text-violet-700",
  emerald: "from-emerald-500/15 to-teal-500/10 text-emerald-700",
  amber: "from-amber-500/15 to-orange-500/10 text-amber-700",
};

export default function StatCard({ label, value, hint, accent = "blue" }: StatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-[24px] border border-white/70 bg-white/80 p-5 shadow-[0_18px_40px_-24px_rgba(15,23,42,0.28)] backdrop-blur transition-transform duration-200 hover:-translate-y-0.5">
      <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${accentMap[accent]} opacity-70 blur-2xl`} />
      <div className="relative">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
        <p className="mt-4 text-3xl font-semibold tracking-[-0.04em] text-slate-950">{value}</p>
        {hint ? <p className="mt-2 text-sm text-slate-500">{hint}</p> : null}
      </div>
    </div>
  );
}
