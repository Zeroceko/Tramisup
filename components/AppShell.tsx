import type { ReactNode } from "react";
import DashboardNav from "@/components/DashboardNav";

interface Product {
  id: string;
  name: string;
  status?: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
}

export default function AppShell({
  children,
  products = [],
  activeProductId,
  userName,
}: {
  children: ReactNode;
  products?: Product[];
  activeProductId?: string;
  userName?: string;
}) {
  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(255,215,239,0.7),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(255,235,105,0.25),_transparent_40%),linear-gradient(180deg,_#fdf9f6_0%,_#f8f5f0_100%)] text-[#0d0d12]">
      <DashboardNav products={products} activeProductId={activeProductId} userName={userName} />
      {/* overflow-hidden so AgentLayoutShell can use h-full; non-agent pages must provide their own scroll wrapper */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
