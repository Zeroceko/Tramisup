"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useState, useRef, useEffect } from "react";

const locales = [
  { value: "tr", label: "Türkçe" },
  { value: "en", label: "English" },
];

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const current = locales.find((l) => l.value === locale) ?? locales[0];

  const setLocaleCookie = (newLocale: string) => {
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${maxAge}`;
  };

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    setLocaleCookie(newLocale);
    setOpen(false);
    router.push(newPath);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 border border-border/50 text-foreground/70 px-5 py-2 rounded-full text-sm font-semibold bg-transparent cursor-pointer hover:border-p800 hover:text-foreground transition-all active:scale-[0.97]"
      >
        {current.label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 min-w-full rounded-2xl border border-white/10 bg-[#0d0d12] shadow-xl overflow-hidden z-50">
          {locales.map((l) => (
            <button
              key={l.value}
              onClick={() => switchLocale(l.value)}
              className={`w-full px-5 py-2.5 text-left text-sm font-semibold transition-colors hover:bg-white/10 ${
                l.value === locale ? "text-white" : "text-white/50"
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
