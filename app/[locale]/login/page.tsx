/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const inputCls =
  "w-full rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3 text-sm font-medium text-[#21231D] outline-none transition-all placeholder:text-[#21231D]/30 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("login");
  const callbackUrl = searchParams.get("callbackUrl");
  const resetStatus = searchParams.get("reset");
  const verified = searchParams.get("verified") === "1";

  const [email, setEmail] = useState(searchParams.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendingVerification, setResendingVerification] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [verificationRequired, setVerificationRequired] = useState(false);

  const handleGoogleLogin = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", {
        callbackUrl: callbackUrl || `/${locale}/dashboard`,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    setVerificationMessage("");
    setVerificationRequired(false);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "email_not_verified") {
          setVerificationRequired(true);
        } else {
          setError(t("errors.wrongCredentials"));
        }
      } else {
        router.push(callbackUrl || `/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      setError(t("errors.generic"));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setVerificationMessage(t("errors.emailRequiredForVerification"));
      return;
    }

    setResendingVerification(true);
    setVerificationMessage("");

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale }),
      });

      if (!response.ok) {
        throw new Error("resend_failed");
      }

      setVerificationMessage(t("verification.resent"));
    } catch {
      setVerificationMessage(t("verification.resendError"));
    } finally {
      setResendingVerification(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF8F2] px-6 py-10 font-outfit">
      <div
        className="pointer-events-none absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(196,93,151,0.08) 1.5px, transparent 1.5px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[560px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-20"
        style={{
          backgroundImage: "url('/assets/hero-brush-abstract.png')",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "contain",
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

          <button
            type="button"
            onClick={() => void handleGoogleLogin()}
            disabled={googleLoading || loading}
            className="mb-4 inline-flex w-full items-center justify-center gap-3 rounded-xl border border-[#E8DED7] bg-white py-3.5 text-sm font-bold text-[#21231D] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.10)] disabled:cursor-not-allowed disabled:opacity-70"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.5 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.2 14.6 2.3 12 2.3A9.7 9.7 0 0 0 2.3 12 9.7 9.7 0 0 0 12 21.7c5.6 0 9.3-3.9 9.3-9.4 0-.6-.1-1.1-.2-1.5H12Z"/>
              <path fill="#34A853" d="M3.4 7.4l3.2 2.3C7.5 7.8 9.6 6 12 6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C16.8 3.2 14.6 2.3 12 2.3c-3.8 0-7.1 2.2-8.6 5.1Z"/>
              <path fill="#FBBC05" d="M2.3 12c0 1.6.4 3 1.1 4.3l3.5-2.7c-.2-.5-.3-1-.3-1.6s.1-1.1.3-1.6L3.4 7.4A9.6 9.6 0 0 0 2.3 12Z"/>
              <path fill="#4285F4" d="M12 21.7c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.8.6-1.9 1.1-3.3 1.1-2.4 0-4.5-1.8-5.3-4.1l-3.5 2.7c1.5 2.9 4.8 5.1 8.8 5.1Z"/>
            </svg>
            {googleLoading ? t("googleLoading") : t("googleButton")}
          </button>

          <div className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#21231D]/35">
            <span className="h-px flex-1 bg-[#E8DED7]" />
            <span>{t("orDivider")}</span>
            <span className="h-px flex-1 bg-[#E8DED7]" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {resetStatus === "success" ? (
              <p className="rounded-xl border border-[#BFE3C8] bg-[#EDF8F0] px-4 py-3 text-sm font-medium text-[#27623A]">
                {t("resetSuccess")}
              </p>
            ) : null}
            {verified ? (
              <p className="rounded-xl border border-[#BFE3C8] bg-[#EDF8F0] px-4 py-3 text-sm font-medium text-[#27623A]">
                {t("verifiedSuccess")}
              </p>
            ) : null}
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

            <div>
              <label htmlFor="password" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                {t("password")}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder={t("passwordPlaceholder")}
                className={inputCls}
                required
              />
            </div>

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            {verificationRequired ? (
              <div className="rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-4">
                <p className="text-sm font-semibold text-[#21231D]">{t("verification.title")}</p>
                <p className="mt-1 text-sm leading-6 text-[#5A5D55]">{t("verification.description")}</p>
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={resendingVerification}
                  className="mt-3 inline-flex h-10 items-center rounded-full bg-[#21231D] px-4 text-sm font-semibold text-white transition hover:bg-[#34363A] disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {resendingVerification ? t("verification.resending") : t("verification.resend")}
                </button>
                {verificationMessage ? (
                  <p className="mt-3 text-sm text-[#5A5D55]">{verificationMessage}</p>
                ) : null}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-xl border-none bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  {t("loggingIn")}
                </span>
              ) : `${t("loginButton")} →`}
            </button>
          </form>

          <Link
            href={`/${locale}/forgot-password`}
            className="mt-4 block w-full text-center text-sm font-medium text-[#C45D97] transition-colors hover:text-[#9F3E77]"
          >
            {t("forgotPassword")}
          </Link>
        </div>

        <p className="mt-6 text-center text-sm text-[#21231D]/50">
          {t("noAccount")}{" "}
          <Link href={`/${locale}/signup`} className="font-bold text-[#C45D97] underline transition-colors hover:text-[#9F3E77]">
            {t("signupHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}
