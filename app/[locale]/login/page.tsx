/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import RecaptchaField, {
  isClientRecaptchaEnabled,
  type RecaptchaFieldHandle,
} from "@/components/RecaptchaField";

const inputCls =
  "w-full rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3 text-sm font-medium text-[#21231D] outline-none transition-all placeholder:text-[#21231D]/30 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("login");
  const callbackUrl = searchParams.get("callbackUrl");
  const resetStatus = searchParams.get("reset");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<RecaptchaFieldHandle | null>(null);
  const recaptchaEnabled = isClientRecaptchaEnabled() && Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      let captchaToken: string | null = null;
      if (recaptchaEnabled) {
        captchaToken = await recaptchaRef.current?.executeAsync() ?? null;
        if (!captchaToken) {
          setError(locale === "en" ? "Please complete the reCAPTCHA check." : "Lütfen reCAPTCHA doğrulamasını tamamla.");
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        captchaToken,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "recaptcha_required") {
          setError(locale === "en" ? "Please complete the reCAPTCHA check." : "Lütfen reCAPTCHA doğrulamasını tamamla.");
        } else if (result.error === "recaptcha_invalid" || result.error === "recaptcha_verify_failed") {
          setError(locale === "en" ? "reCAPTCHA validation failed. Please try again." : "reCAPTCHA doğrulaması başarısız oldu. Lütfen tekrar dene.");
        } else {
          setError(t("errors.wrongCredentials"));
        }
        setCaptchaResetNonce((current) => current + 1);
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

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {resetStatus === "success" ? (
              <p className="rounded-xl border border-[#BFE3C8] bg-[#EDF8F0] px-4 py-3 text-sm font-medium text-[#27623A]">
                {t("resetSuccess")}
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

            <RecaptchaField
              ref={recaptchaRef}
              locale={locale}
              resetNonce={captchaResetNonce}
            />

            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

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
