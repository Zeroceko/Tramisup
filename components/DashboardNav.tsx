"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import ProductSelector from "@/components/ProductSelector";

interface Product {
  id: string;
  name: string;
}

const navItems = [
  { href: "/dashboard",    label: "Genel Bakış" },
  { href: "/pre-launch",   label: "Pre-Launch" },
  { href: "/tasks",        label: "Görevler" },
  { href: "/metrics",      label: "Metrikler" },
  { href: "/growth",       label: "Büyüme" },
  { href: "/integrations", label: "Entegrasyonlar" },
];

interface DashboardNavProps {
  products?: Product[];
  activeProductId?: string;
}

export default function DashboardNav({
  products = [],
  activeProductId,
}: DashboardNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname?.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e8e8e8]">
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-full bg-[#fee74e] flex items-center justify-center">
            <span className="font-outfit font-semibold text-[14px] text-[#2e2e2e]">T</span>
          </div>
          <span className="font-outfit font-medium text-[16px] text-[#2e2e2e] tracking-[-0.01em] hidden sm:block">
            Tiramisup
          </span>
        </Link>

        {/* Pill nav */}
        <nav className="hidden lg:flex items-center gap-1 bg-white rounded-full border border-[#e8e8e8] p-1 shadow-nav">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 h-[34px] flex items-center text-[13px] font-medium transition-colors whitespace-nowrap ${
                  active
                    ? "bg-[#ffd7ef] text-[#0d0d12]"
                    : "text-[#666d80] hover:bg-[#f6f6f6] hover:text-[#0d0d12]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <ProductSelector products={products} activeProductId={activeProductId} />

          <Link
            href="/settings"
            className="hidden sm:inline-flex items-center px-4 h-9 rounded-full text-[13px] font-medium text-[#0d0d12] hover:bg-[#f6f6f6] transition"
          >
            Ayarlar
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="inline-flex items-center px-4 h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
          >
            Çıkış
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      <div className="lg:hidden border-t border-[#e8e8e8] px-4 pb-2">
        <nav className="flex gap-1 overflow-x-auto pt-2">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`whitespace-nowrap rounded-full px-4 h-[34px] flex items-center text-[12px] font-medium transition-colors ${
                  active
                    ? "bg-[#ffd7ef] text-[#0d0d12]"
                    : "text-[#666d80] border border-[#e8e8e8]"
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
