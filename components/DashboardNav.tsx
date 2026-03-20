"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/dashboard", label: "Overview" },
  { href: "/pre-launch", label: "Pre-Launch" },
  { href: "/metrics", label: "Metrics" },
  { href: "/growth", label: "Growth" },
  { href: "/integrations", label: "Integrations" },
];

export default function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-white/60 bg-white/70 backdrop-blur-xl">
      <div className="mx-auto flex h-[88px] w-full max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2458ff_0%,#6d8dff_100%)] text-lg font-bold text-white shadow-[0_16px_30px_-18px_rgba(36,88,255,0.85)]">
              T
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold tracking-[-0.03em] text-slate-950">Tiramisup</p>
              <p className="truncate text-xs uppercase tracking-[0.24em] text-slate-500">Startup command center</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-1 rounded-full border border-slate-200/80 bg-white/80 p-1 shadow-[0_16px_36px_-26px_rgba(15,23,42,0.35)] lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/settings"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950 sm:inline-flex"
          >
            Settings
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex rounded-full bg-[linear-gradient(135deg,#2458ff_0%,#6d8dff_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(36,88,255,0.9)] transition hover:translate-y-[-1px]"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="border-t border-white/50 px-4 pb-3 lg:hidden sm:px-6">
        <nav className="flex gap-2 overflow-x-auto pt-3">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  active
                    ? "bg-slate-950 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
