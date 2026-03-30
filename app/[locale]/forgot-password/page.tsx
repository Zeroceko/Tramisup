/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3 text-sm font-medium text-[#21231D] outline-none transition-all placeholder:text-[#21231D]/30 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20";

export default function ForgotPasswordPage() {
  const locale = useLocale();
  const t = useTranslations("forgotPassword");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || t("errors.generic"));
        return;
      }

      setSuccess(true);
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF8F2] px-6 py-10 font-outfit">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(196,93,151,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto w-full max-w-[440px]">
        <div className="mb-8 flex items-center justify-center gap-2.5">
          <img src="/assets/illus-tiramisu-slice.png" alt="Tiramisup" className="h-10 w-10 object-contain" />
          <span className="text-xl font-black text-[#21231D]">Tiramisup</span>
        </div>

        <div className="rounded-2xl border border-[#E8DED7]/70 bg-white/80 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          <h1 className="mb-1 text-2xl font-black text-[#21231D]">{t("title")}</h1>
          <p className="mb-6 text-sm text-[#21231D]/50">{t("subtitle")}</p>

          {success ? (
            <div className="space-y-4">
              <p className="rounded-xl border border-[#BFE3C8] bg-[#EDF8F0] px-4 py-3 text-sm font-medium text-[#27623A]">
                {t("success")}
              </p>
              <Link
                href={`/${locale}/login`}
                className="inline-flex w-full items-center justify-center rounded-xl bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)]"
              >
                {t("backToLogin")} →
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label htmlFor="email" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                  {t("email")}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder={t("emailPlaceholder")}
                  className={inputCls}
                  autoFocus
                  required
                />
              </div>

              {error ? <p className="rounded-xl border border-[#E9A9B5] bg-[#FFF1F3] px-4 py-3 text-sm font-medium text-[#A13F54]">{error}</p> : null}

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl border-none bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? t("sending") : `${t("submit")} →`}
              </button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#21231D]/50">
          <Link href={`/${locale}/login`} className="font-bold text-[#C45D97] underline transition-colors hover:text-[#9F3E77]">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
