/**
 * PlainPageShell — used by pages that don't have an agent chat panel
 * (settings, account, integrations, metrics).
 * Wraps content in a scrollable white card matching AgentLayoutShell's right panel.
 * Pages control their own inner max-width.
 */
export default function PlainPageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="rounded-2xl bg-white border border-[#e8e4de] shadow-[0_1px_4px_rgba(0,0,0,0.06)] min-h-full px-8 py-7">
        {children}
      </div>
    </div>
  );
}
