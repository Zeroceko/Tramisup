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
  const locale = pathname?.split("/")[1] || "tr";

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
        integrations: "Integrations",
        connectorHub: "Connectors",
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
        integrations: "Entegrasyonlar",
        connectorHub: "Bağlantılar",
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
          { href: "/pre-launch", label: labels.launch, preview: true },
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
    <header className="sticky top-0 z-40 border-b border-[#e8e8e8] bg-white">
      <div className="mx-auto flex h-[64px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Left: Logo + pill nav */}
        <div className="flex items-center gap-4">
          <Link
            href={withLocale("/dashboard")}
            className="flex shrink-0 items-center gap-2.5"
          >
            <img
              src="/assets/illus-tiramisu-slice.png"
              alt="Tiramisup"
              className="h-9 w-9 object-contain"
            />
            <span className="hidden font-semibold text-[15px] text-[#0d0d12] tracking-[-0.01em] sm:block">
              Tiramisup
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
                      : item.preview
                        ? "border border-dashed border-[#e8e8e8] text-[#8a8fa0] hover:border-[#d9d9d9] hover:bg-[#fafafa] hover:text-[#0d0d12]"
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
            className={`inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e8e8] bg-white text-[#666d80] transition hover:border-[#d0d0d0] hover:text-[#0d0d12] lg:hidden ${
              pathname?.startsWith(withLocale("/settings")) ? "border-[#f0bfd8] bg-[#fff1f8] text-[#0d0d12]" : ""
            }`}
            aria-label={labels.settings}
            title={labels.settings}
          >
            <Settings className="h-4 w-4" />
          </Link>

          {!hasProducts && (
            <Link
              href={withLocale("/products/new")}
              className="hidden h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:inline-flex"
            >
              {labels.newProduct}
            </Link>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d0d12] text-[11px] font-bold text-white transition hover:bg-[#2e2e2e]"
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
                    : item.preview
                      ? "border border-dashed border-[#e8e8e8] text-[#8a8fa0]"
                      : "border border-[#e8e8e8] text-[#666d80]"
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
