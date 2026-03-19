import type { ReactNode } from "react";
import DashboardNav from "@/components/DashboardNav";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(70,112,255,0.18),_transparent_32%),linear-gradient(180deg,#f5f7ff_0%,#f7f7fb_40%,#f3f4f8_100%)] text-slate-900">
      <div className="absolute inset-x-0 top-0 -z-10 h-[28rem] bg-[radial-gradient(circle_at_top,_rgba(118,146,255,0.2),_transparent_45%)]" />
      <DashboardNav />
      <main className="relative mx-auto min-h-[calc(100vh-88px)] w-full max-w-7xl px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
