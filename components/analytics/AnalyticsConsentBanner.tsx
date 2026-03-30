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
    <div className="fixed inset-x-4 bottom-4 z-[1000] md:left-6 md:right-6">
      <div className="mx-auto max-w-5xl rounded-[24px] border border-border bg-background/95 p-4 shadow-t-lg backdrop-blur-xl md:flex md:items-end md:justify-between md:gap-6 md:p-5">
        <div className="max-w-3xl">
          <p className="text-sm leading-6 text-foreground/80">{copy.text}</p>
          <div className="mt-2 flex items-center gap-4 text-sm font-semibold">
            <Link href={`/${locale}/privacy`} className="text-foreground/70 underline underline-offset-4">
              {copy.privacy}
            </Link>
            <Link href={`/${locale}/terms`} className="text-foreground/70 underline underline-offset-4">
              {copy.terms}
            </Link>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3 md:mt-0">
          <button
            type="button"
            onClick={() => {
              persistConsent("denied");
              setVisible(false);
            }}
            className="rounded-full border border-border bg-white px-5 py-3 text-sm font-bold text-foreground transition-all hover:-translate-y-0.5"
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
            className="rounded-full border-none bg-charcoal px-5 py-3 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-0.5"
          >
            {copy.accept}
          </button>
        </div>
      </div>
    </div>
  );
}
