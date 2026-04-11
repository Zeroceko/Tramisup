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

// Section-aware active pill colors matching the mockup
function getActiveStyle(section: "overview" | "launch" | "growth" | "metrics"): string {
  if (section === "overview") return "bg-[#ffeb69] text-[#0d0d12] font-bold shadow-sm";
  if (section === "launch") return "bg-[#ffd7ef] text-[#0d0d12] font-bold shadow-sm";
  if (section === "metrics") return "bg-[#ffd7ef] text-[#0d0d12] font-bold shadow-sm";
  return "bg-[#95dbda] text-[#0d0d12] font-bold shadow-sm";
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
        metrics: "Metrics",
        growth: "Growth",
        newProduct: "+ Add product",
        settings: "Settings",
        account: "Account",
        accountSettings: "Account settings",
        signOut: "Sign out",
        board: "Board",
      }
    : {
        overview: "Genel Bakış",
        launch: "Launch",
        metrics: "Metrikler",
        growth: "Büyüme",
        newProduct: "+ Ürün ekle",
        settings: "Ayarlar",
        account: "Hesap",
        accountSettings: "Hesap ayarları",
        signOut: "Çıkış yap",
        board: "Board",
      };

  const withLocale = (href: string) => `/${locale}${href}`;

  const isActive = (paths: string[]) =>
    paths.some((part) => {
      const full = withLocale(part);
      return part === "/dashboard" ? pathname === full : pathname?.startsWith(full);
    });

  const currentSection: "overview" | "launch" | "growth" | "metrics" =
    isActive(["/growth"]) ? "growth"
    : isActive(["/metrics"]) ? "metrics"
    : isActive(["/pre-launch"]) ? "launch"
    : "overview";

  const preLaunchNavItems = [
    { href: "/dashboard", label: labels.overview, section: "overview" as const, match: ["/dashboard"] },
    { href: "/pre-launch", label: labels.launch, section: "launch" as const, match: ["/pre-launch"] },
  ];

  const launchedNavItems = [
    { href: "/dashboard", label: labels.overview, section: "overview" as const, match: ["/dashboard"] },
    { href: "/metrics", label: labels.metrics, section: "metrics" as const, match: ["/metrics"] },
    { href: "/growth", label: labels.growth, section: "growth" as const, match: ["/growth"] },
  ];

  const navItems = isLaunchedProduct ? launchedNavItems : preLaunchNavItems;
  const visibleNavItems = hasProducts ? navItems : navItems.slice(0, 1);

  return (
    <header className="h-16 w-full shrink-0 bg-white border-b border-[#eeebe5] flex items-center px-5 gap-4 z-40">
      {/* Logo */}
      <Link
        href={withLocale("/dashboard")}
        className="flex items-center gap-2.5 shrink-0 no-underline"
      >
        <img
          src="/assets/illus-tiramisu-slice.png"
          alt="Tiramisup"
          className="h-9 w-9 object-contain"
        />
        <div className="hidden sm:flex flex-col leading-none">
          <span className="font-black text-[15px] text-[#0d0d12] tracking-[-0.01em]">
            Tiramisup
          </span>
          <span className="text-[8.5px] font-bold uppercase tracking-[0.2em] text-[#8a8fa0]">
            Launch to Growth
          </span>
        </div>
      </Link>

      {/* Nav pill group */}
      <nav className="flex items-center gap-0.5 bg-[#f5f2ec] rounded-full p-1">
        {visibleNavItems.map((item) => {
          const active = isActive(item.match);
          return (
            <Link
              key={item.href}
              href={withLocale(item.href)}
              className={`flex h-[30px] items-center whitespace-nowrap rounded-full px-3.5 text-[13px] font-semibold transition-all ${
                active
                  ? getActiveStyle(item.section)
                  : "text-[#6b6f7e] hover:text-[#0d0d12] hover:bg-white/60"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings icon */}
      <Link
        href={withLocale("/settings")}
        className="p-2 rounded-lg text-[#8a8fa0] hover:text-[#0d0d12] hover:bg-[#f5f2ec] transition-colors"
        title={labels.settings}
      >
        <Settings className="h-4 w-4" />
      </Link>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Right: Board + Product selector + Avatar */}
      <div className="flex items-center gap-2">
        {hasProducts && (
          <Link
            href={withLocale("/tasks")}
            className={`hidden h-[34px] items-center rounded-full px-4 text-[13px] font-semibold transition-colors lg:flex border ${
              isActive(["/tasks"])
                ? "bg-[#ffeb69] text-[#0d0d12] border-[#ffeb69]"
                : "bg-white text-[#0d0d12] border-[#e0ddd6] hover:bg-[#f9f7f3]"
            }`}
          >
            {labels.board}
          </Link>
        )}

        <ProductSelector
          products={products.map(({ id, name }) => ({ id, name }))}
          activeProductId={activeProductId}
        />

        {!hasProducts && (
          <Link
            href={withLocale("/onboarding")}
            className="hidden h-[34px] items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:inline-flex"
          >
            {labels.newProduct}
          </Link>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#1d1d22] text-[11px] font-bold text-white transition hover:bg-[#2e2e2e]"
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
    </header>
  );
}
