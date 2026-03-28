"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const setLocaleCookie = (newLocale: string) => {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAge}`;
  };

  const switchLocale = (newLocale: string) => {
    // Replace current locale in pathname with new locale
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    setLocaleCookie(newLocale);
    router.push(newPath);
  };

  return (
    <select
      value={locale}
      onChange={(e) => switchLocale(e.target.value)}
      className="h-9 px-3 rounded-full text-[13px] font-medium text-[#0d0d12] bg-white border border-[#e8e8e8] hover:border-[#d0d0d0] transition cursor-pointer"
    >
      <option value="en">English</option>
      <option value="tr">Türkçe</option>
    </select>
  );
}
