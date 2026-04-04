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
    <div className="h-screen flex flex-col bg-[radial-gradient(circle_at_top_left,_rgba(255,220,232,0.95),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(255,244,232,0.92),_transparent_24%),radial-gradient(circle_at_center,_rgba(213,229,255,0.72),_transparent_34%),linear-gradient(180deg,_#fffaf8_0%,_#f7f8fb_48%,_#f8fbff_100%)] text-[#0d0d12]">
      <DashboardNav products={products} activeProductId={activeProductId} userName={userName} />
      <main className="flex-1 min-h-0 w-full max-w-[1440px] mx-auto px-3 pb-3 sm:px-4 xl:px-5">
        {children}
      </main>
    </div>
  );
}
