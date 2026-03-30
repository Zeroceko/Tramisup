"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Settings, User } from "lucide-react";
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
        tasks: "Tasks",
        metrics: "Metrics",
        growth: "Growth",
        newProduct: "+ Add product",
        settings: "Settings",
        account: "Account",
        signOut: "Sign out",
      }
    : {
        overview: "Genel Bakış",
        launch: "Launch",
        tasks: "Görevler",
        metrics: "Metrikler",
        growth: "Büyüme",
        newProduct: "+ Ürün ekle",
        settings: "Ayarlar",
        account: "Hesap",
        signOut: "Çıkış yap",
      };

  const navItems = hasProducts
    ? isLaunchedProduct
      ? [
          { href: "/dashboard", label: labels.overview },
          { href: "/tasks", label: labels.tasks },
          { href: "/metrics", label: labels.metrics },
          { href: "/growth", label: labels.growth },
        ]
      : [
          { href: "/dashboard", label: labels.overview },
          { href: "/pre-launch", label: labels.launch },
          { href: "/tasks", label: labels.tasks },
          { href: "/growth", label: labels.growth, preview: true },
        ]
    : [{ href: "/dashboard", label: labels.overview }];

  const withLocale = (href: string) => `/${locale}${href}`;

  const isActive = (href: string) => {
    const full = withLocale(href);
    return href === "/dashboard"
      ? pathname === full
      : pathname?.startsWith(full);
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
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={withLocale(item.href)}
                  className={`flex h-[36px] items-center whitespace-nowrap rounded-full px-4 text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[#ffd9ef] text-[#0d0d12] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.65)]"
                      : item.preview
                        ? "border border-dashed border-[#e8e8e8] text-[#8a8fa0] hover:border-[#d9d9d9] hover:bg-[#fafafa] hover:text-[#0d0d12]"
                        : "text-[#666d80] hover:bg-[#f6f7fb] hover:text-[#0d0d12]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            {/* Settings icon in pill */}
            <Link
              href={withLocale("/settings")}
              className={`flex h-[36px] w-[36px] items-center justify-center rounded-full transition-colors ${
                pathname?.startsWith(withLocale("/settings"))
                  ? "bg-[#ffd9ef] text-[#0d0d12]"
                  : "text-[#666d80] hover:bg-[#f6f7fb] hover:text-[#0d0d12]"
              }`}
              aria-label={labels.settings}
              title={labels.settings}
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
          <ProductSelector
            products={products.map(({ id, name }) => ({ id, name }))}
            activeProductId={activeProductId}
          />

          <Link
            href={withLocale("/settings")}
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/70 bg-white/88 text-[#666d80] shadow-[0_10px_30px_rgba(25,27,39,0.06)] backdrop-blur transition hover:border-white hover:text-[#0d0d12] lg:hidden ${
              pathname?.startsWith(withLocale("/settings")) ? "bg-[#fff1f8] text-[#0d0d12]" : ""
            }`}
            aria-label={labels.settings}
            title={labels.settings}
          >
            <Settings className="h-4 w-4" />
          </Link>

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
                <Link href={withLocale("/settings")}>
                  <User className="mr-2 h-4 w-4 text-[#666d80]" />
                  {labels.settings}
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
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={withLocale(item.href)}
                className={`flex h-[34px] items-center whitespace-nowrap rounded-full border px-4 text-[12px] font-medium shadow-[0_8px_24px_rgba(25,27,39,0.05)] backdrop-blur transition-colors ${
                  active
                    ? "border-white/70 bg-[#ffd7ef] text-[#0d0d12]"
                    : item.preview
                      ? "border-dashed border-[#e8e8e8] bg-white/88 text-[#8a8fa0]"
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
