"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { User } from "lucide-react";
import ProductSelector from "@/components/ProductSelector";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Product {
  id: string;
  name: string;
  status?: "PRE_LAUNCH" | "LAUNCHED" | "GROWING";
}

interface DashboardNavProps {
  products?: Product[];
  activeProductId?: string;
  userName?: string;
}

function getInitials(name?: string): string {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function DashboardNav({
  products = [],
  activeProductId,
  userName,
}: DashboardNavProps) {
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "en";

  const hasProducts = products.length > 0;
  const activeProduct = products.find((product) => product.id === activeProductId) ?? products[0];
  const isLaunchedProduct =
    activeProduct?.status === "LAUNCHED" || activeProduct?.status === "GROWING";

  const labels = locale === "en"
    ? {
        overview: "Overview",
        launch: "Launch",
        growth: "Growth",
        newProduct: "+ Add product",
        settings: "Settings",
        account: "Account",
        accountSettings: "Account settings",
        signOut: "Sign out",
      }
    : {
        overview: "Genel Bakış",
        launch: "Launch",
        growth: "Büyüme",
        newProduct: "+ Ürün ekle",
        settings: "Ayarlar",
        account: "Hesap",
        accountSettings: "Hesap ayarları",
        signOut: "Çıkış yap",
      };

  const navItems = hasProducts
    ? [
        { href: "/dashboard", label: labels.overview, match: ["/dashboard"] },
        isLaunchedProduct
          ? { href: "/growth", label: labels.growth, match: ["/growth", "/metrics", "/tasks"] }
          : { href: "/pre-launch", label: labels.launch, match: ["/pre-launch", "/tasks"] },
        { href: "/settings", label: labels.settings, match: ["/settings"] },
      ]
    : [{ href: "/dashboard", label: labels.overview, match: ["/dashboard"] }];

  const withLocale = (href: string) => `/${locale}${href}`;

  const isActive = (href: string, match?: string[]) => {
    if (match?.length) {
      return match.some((part) => {
        const full = withLocale(part);
        return part === "/dashboard" ? pathname === full : pathname?.startsWith(full);
      });
    }
    const full = withLocale(href);
    return href === "/dashboard" ? pathname === full : pathname?.startsWith(full);
  };

  return (
    <header className="sticky top-0 z-40 bg-transparent">
      <div className="mx-auto flex w-full max-w-[1440px] items-center justify-between gap-4 px-4 pt-4 sm:px-6 xl:px-8">

        {/* Left: Logo + pill nav */}
        <div className="flex items-center gap-4">
          <Link
            href={withLocale("/dashboard")}
            className="flex h-11 shrink-0 items-center gap-2.5 rounded-full border border-white/70 bg-white/88 px-4 shadow-[0_10px_30px_rgba(25,27,39,0.06)] backdrop-blur"
          >
            <img
              src="/assets/illus-tiramisu-slice.png"
              alt="Tiramisup"
              className="h-8 w-8 object-contain"
            />
            <span className="hidden sm:block">
              <span className="block font-semibold text-[14px] text-[#0d0d12] tracking-[-0.02em]">
                Tiramisup
              </span>
              <span className="block text-[8.5px] font-semibold uppercase tracking-[0.22em] text-[#8b8f9c]">
                Launch to Growth
              </span>
            </span>
          </Link>

          {/* Pill nav */}
          <nav className="hidden items-center gap-1 rounded-full border border-white/70 bg-white/88 p-1.5 shadow-[0_10px_30px_rgba(25,27,39,0.06)] backdrop-blur lg:flex">
            {navItems.map((item) => {
              const active = isActive(item.href, item.match);
              return (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className={`flex h-[36px] items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[#ffd9ef] text-[#0d0d12] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
                      : "text-[#666d80] hover:bg-[#f6f7fb] hover:text-[#0d0d12]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right: Board + Product selector + Avatar */}
        <div className="flex items-center gap-2">
          <ProductSelector
            products={products.map(({ id, name }) => ({ id, name }))}
            activeProductId={activeProductId}
          />

          {!hasProducts && (
            <Link
              href={withLocale("/onboarding")}
              className="hidden h-11 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] shadow-[0_10px_30px_rgba(25,27,39,0.08)] transition hover:bg-[#f5c8e4] sm:inline-flex"
            >
              {labels.newProduct}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#1d1d22] text-[11px] font-bold text-white shadow-[0_12px_30px_rgba(16,16,22,0.18)] transition hover:bg-[#2e2e2e]"
                title={labels.account}
              >
                {getInitials(userName)}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-[16px] border-[#e8e8e8] bg-white p-2 shadow-[0_20px_50px_rgba(17,16,20,0.08)]">
              <DropdownMenuLabel className="px-3 py-2 text-[12px] uppercase tracking-[0.14em] text-[#7b8393]">
                {labels.account}
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#ececec]" />
              <DropdownMenuItem asChild className="rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-[#0d0d12] focus:bg-[#f6f6f6]">
                <Link href={withLocale("/account")}>
                  <User className="mr-2 h-4 w-4 text-[#666d80]" />
                  {labels.accountSettings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => signOut({ callbackUrl: `/${locale}` })}
                className="rounded-[12px] px-3 py-2.5 text-[13px] font-medium text-[#0d0d12] focus:bg-[#f6f6f6]"
              >
                <svg className="mr-2 h-4 w-4 text-[#666d80]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                {labels.signOut}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className="px-4 pb-2 lg:hidden">
        <nav className="flex gap-1 overflow-x-auto pt-2">
          {navItems.map((item) => {
            const active = isActive(item.href, item.match);
            return (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className={`flex h-[34px] items-center whitespace-nowrap rounded-full border px-4 text-[12px] font-medium shadow-[0_8px_24px_rgba(25,27,39,0.05)] backdrop-blur transition-colors ${
                  active
                    ? "border-white/70 bg-[#ffd7ef] text-[#0d0d12]"
                    : "border-white/70 bg-white/88 text-[#666d80]"
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
