"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";

const COPY = {
  en: {
    text: "We use essential cookies to run the site and optional analytics cookies to understand demand and improve the landing page.",
    accept: "Accept analytics",
    reject: "Reject",
    privacy: "Privacy",
    terms: "Terms",
  },
  tr: {
    text: "Siteyi çalıştırmak için zorunlu çerezler, talebi anlamak ve landing page'i iyileştirmek için isteğe bağlı analytics çerezleri kullanıyoruz.",
    accept: "Çerezleri kabul et",
    reject: "Reddet",
    privacy: "Gizlilik",
    terms: "Koşullar",
  },
} as const;

function persistConsent(value: "granted" | "denied") {
  window.localStorage.setItem("tiramisup-analytics-consent", value);
  document.cookie = `analytics_consent=${value}; path=/; max-age=31536000; samesite=lax`;
}

export default function AnalyticsConsentBanner() {
  const locale = useLocale() === "tr" ? "tr" : "en";
  const copy = COPY[locale];
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stored =
      window.localStorage.getItem("tiramisup-analytics-consent") ||
      document.cookie
        .split("; ")
        .find((item) => item.startsWith("analytics_consent="))
        ?.split("=")[1];

    setVisible(!stored);
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[1000] w-[min(360px,calc(100vw-2rem))] -translate-x-1/2 md:bottom-6 md:left-6 md:translate-x-0">
      <div className="rounded-[24px] border border-border bg-background/95 p-4 shadow-t-lg backdrop-blur-xl">
        <div>
          <p className="text-sm leading-6 text-foreground/80">{copy.text}</p>
          <div className="mt-3 flex items-center gap-4 text-sm font-semibold">
            <Link href={`/${locale}/privacy`} className="text-foreground/70 underline underline-offset-4">
              {copy.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="text-foreground/70 underline underline-offset-4">
              {copy.terms}
            </Link>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => {
              persistConsent("denied");
              setVisible(false);
            }}
            className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5"
          >
            {copy.reject}
          </button>
          <button
            type="button"
            onClick={() => {
              persistConsent("granted");
              setVisible(false);
              window.location.reload();
            }}
            className="rounded-2xl border-none bg-charcoal px-4 py-3 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
