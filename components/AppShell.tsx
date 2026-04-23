import type { ReactNode } from "react";
import ProductEventTracker from "@/components/analytics/ProductEventTracker";
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
  analyticsSurface = "app",
}: {
  children: ReactNode;
  products?: Product[];
  activeProductId?: string;
  userName?: string;
  analyticsSurface?: string;
}) {
  return (
    <div className="fixed inset-0 flex min-h-0 w-full flex-col overflow-hidden bg-[#f8f5f0] text-[#0d0d12]">
      <ProductEventTracker productId={activeProductId} surface={analyticsSurface} />
      <DashboardNav products={products} activeProductId={activeProductId} userName={userName} />
      {/* overflow-hidden so AgentLayoutShell can use h-full; non-agent pages must provide their own scroll wrapper */}
      <main className="flex-1 min-h-0 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
