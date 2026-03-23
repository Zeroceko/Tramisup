"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations();

  const activeProduct = products.find((product) => product.id === activeProductId);
  const hasProducts = products.length > 0;
  const isLaunched = activeProduct?.status === "LAUNCHED" || activeProduct?.status === "GROWING";

  const navItems = [
    { href: "/dashboard", key: "dashboard.overview", requiresProduct: false, show: true },
    { href: "/pre-launch", key: "preLaunch.eyebrow", requiresProduct: true, show: !isLaunched },
    { href: "/tasks", key: "tasks.eyebrow", requiresProduct: true, show: true },
    { href: "/metrics", key: "metrics.eyebrow", requiresProduct: true, show: true },
    { href: "/growth", key: "growth.eyebrow", requiresProduct: true, show: true },
  ];

  const withLocale = (href: string) => `/${locale}${href}`;
  const visibleNavItems = navItems.filter((item) => item.show && (hasProducts || !item.requiresProduct));

  const isActive = (href: string) => {
    const localizedHref = withLocale(href);
    return href === "/dashboard" ? pathname === localizedHref : pathname?.startsWith(localizedHref);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href={withLocale("/dashboard")} className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fee74e]">
            <span className="font-outfit text-[14px] font-semibold text-[#2e2e2e]">T</span>
          </div>
          <span className="hidden font-outfit text-[16px] font-medium tracking-[-0.01em] text-[#2e2e2e] sm:block">
            Tiramisup
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-[#e8e8e8] bg-white p-1 shadow-nav lg:flex">
          {visibleNavItems.map((item) => {
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
                {t(item.key)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ProductSelector products={products.map(({ id, name }) => ({ id, name }))} activeProductId={activeProductId} />

          {!hasProducts && (
            <Link
              href={withLocale("/products/new")}
              className="hidden h-9 items-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6] sm:inline-flex"
            >
              {t("common.createFirstProduct")}
            </Link>
          )}

          <Link
            href={withLocale("/settings")}
            className="hidden h-9 items-center rounded-full px-4 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6] sm:inline-flex"
          >
            {t("settings.eyebrow")}
          </Link>

          <button
            onClick={() => signOut({ callbackUrl: `/${locale}` })}
            className="inline-flex h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {t("common.signOut")}
          </button>
        </div>
      </div>

      <div className="border-t border-[#e8e8e8] px-4 pb-2 lg:hidden">
        <nav className="flex gap-1 overflow-x-auto pt-2">
          {visibleNavItems.map((item) => {
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
                {t(item.key)}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
