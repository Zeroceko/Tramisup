"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ProductSelector from "@/components/ProductSelector";

interface Product {
  id: string;
  name: string;
  status?: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
}

interface DashboardNavProps {
  products?: Product[];
  activeProductId?: string;
}

export default function DashboardNav({
  products = [],
  activeProductId,
}: DashboardNavProps) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "tr";

  const hasProducts = products.length > 0;

  const navItems = [
    { href: "/dashboard", label: "Overview", show: true },
    { href: "/pre-launch", label: "Launch", show: true },
    { href: "/growth", label: "Growth", show: true },
  ].filter((i) => i.show || !hasProducts);

  const withLocale = (href: string) => `/${locale}${href}`;

  const isActive = (href: string) => {
    const full = withLocale(href);
    return href === "/dashboard"
      ? pathname === full
      : pathname?.startsWith(full);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Left: Logo + pill nav */}
        <div className="flex items-center gap-4">
          <Link
            href={withLocale("/dashboard")}
            className="flex shrink-0 items-center gap-2.5"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fee74e]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 10h12M10 4l6 6-6 6" stroke="#2e2e2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <span className="hidden font-semibold text-[15px] text-[#0d0d12] tracking-[-0.01em] sm:block">
              Tiramisight
            </span>
          </Link>

          {/* Pill nav */}
          <nav className="hidden items-center gap-0.5 rounded-full border border-[#e8e8e8] bg-white p-1 shadow-sm lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className={`flex h-[34px] items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[#ffd7ef] text-[#0d0d12]"
                      : "text-[#666d80] hover:bg-[#f6f6f6] hover:text-[#0d0d12]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Settings icon in pill */}
            <Link
              href={withLocale("/settings")}
              className={`flex h-[34px] w-[34px] items-center justify-center rounded-full transition-colors ${
                pathname?.startsWith(withLocale("/settings"))
                  ? "bg-[#ffd7ef] text-[#0d0d12]"
                  : "text-[#666d80] hover:bg-[#f6f6f6] hover:text-[#0d0d12]"
              }`}
              aria-label="Ayarlar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </Link>
          </nav>
        </div>

        {/* Right: Board + Product selector + Avatar */}
        <div className="flex items-center gap-2">
          {/* Board button */}
          <Link
            href={withLocale("/tasks")}
            className={`hidden h-9 items-center rounded-full border px-4 text-[13px] font-medium transition sm:inline-flex ${
              pathname?.startsWith(withLocale("/tasks"))
                ? "border-[#0d0d12] bg-[#0d0d12] text-white"
                : "border-[#e8e8e8] text-[#0d0d12] hover:bg-[#f6f6f6]"
            }`}
          >
            Board
          </Link>

          <ProductSelector
            products={products.map(({ id, name }) => ({ id, name }))}
            activeProductId={activeProductId}
          />

          {!hasProducts && (
            <Link
              href={withLocale("/products/new")}
              className="hidden h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:inline-flex"
            >
              + Ürün ekle
            </Link>
          )}

          {/* Avatar */}
          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d0d12] text-[12px] font-bold text-white transition hover:bg-[#2e2e2e]"
            title="Çıkış yap"
          >
            T
          </button>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="border-t border-[#e8e8e8] px-4 pb-2 lg:hidden">
        <nav className="flex gap-1 overflow-x-auto pt-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className={`flex h-[34px] items-center whitespace-nowrap rounded-full px-4 text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-[#ffd7ef] text-[#0d0d12]"
                    : "border border-[#e8e8e8] text-[#666d80]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={withLocale("/tasks")}
            className={`flex h-[34px] items-center whitespace-nowrap rounded-full px-4 text-[12px] font-medium transition-colors ${
              pathname?.startsWith(withLocale("/tasks"))
                ? "bg-[#0d0d12] text-white"
                : "border border-[#e8e8e8] text-[#666d80]"
            }`}
          >
            Board
          </Link>
        </nav>
      </div>
    </header>
  );
}
