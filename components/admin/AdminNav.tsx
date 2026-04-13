"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    href: "/admin/overview",
    label: { en: "Overview", tr: "Genel Bakış" },
  },
  {
    href: "/admin/users",
    label: { en: "Users", tr: "Kullanıcılar" },
  },
  {
    href: "/admin/products",
    label: { en: "Products", tr: "Ürünler" },
  },
  {
    href: "/admin/billing",
    label: { en: "Billing", tr: "Paketler" },
  },
  {
    href: "/admin/ai-usage",
    label: { en: "AI Usage", tr: "AI Kullanımı" },
  },
  {
    href: "/admin/waitlist",
    label: { en: "Waitlist", tr: "Waitlist" },
  },
] as const;

export default function AdminNav({ locale }: { locale: string }) {
  const pathname = usePathname();
  const isEn = locale === "en";

  return (
    <nav className="flex flex-wrap gap-2">
      {NAV_ITEMS.map((item) => {
        const href = `/${locale}${item.href}`;
        const isActive =
          pathname === href || pathname?.startsWith(`${href}/`);

        return (
          <Link
            key={item.href}
            href={href}
            className={`inline-flex h-10 items-center rounded-full border px-4 text-[13px] font-semibold transition ${
              isActive
                ? "border-[#0d0d12] bg-[#0d0d12] text-white shadow-sm"
                : "border-[#e5e0d8] bg-white text-[#5e6678] hover:border-[#d4cec4] hover:bg-[#fcfbf8] hover:text-[#0d0d12]"
            }`}
          >
            {isEn ? item.label.en : item.label.tr}
          </Link>
        );
      })}
    </nav>
  );
}
