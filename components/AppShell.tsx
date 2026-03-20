import type { ReactNode } from "react";
import DashboardNav from "@/components/DashboardNav";

interface Product {
  id: string;
  name: string;
}

export default function AppShell({
  children,
  products = [],
  activeProductId,
}: {
  children: ReactNode;
  products?: Product[];
  activeProductId?: string;
}) {
  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#0d0d12]">
      <DashboardNav products={products} activeProductId={activeProductId} />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
