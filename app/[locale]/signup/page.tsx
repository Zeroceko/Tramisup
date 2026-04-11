/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useRef, useState } from "react";
import PasswordChecklist from "@/components/ui/PasswordChecklist";
import { isStrongPassword } from "@/lib/password-rules";
import RecaptchaField, {
  isClientRecaptchaEnabled,
  type RecaptchaFieldHandle,
} from "@/components/RecaptchaField";

const PRODUCT_TYPES = ["SaaS", "Mobile App", "E-commerce", "Other"] as const;

const inputCls =
  "w-full rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3 text-sm font-medium text-[#21231D] outline-none transition-all placeholder:text-[#21231D]/30 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20";
const errorCls = "rounded-xl border border-[#E9A9B5] bg-[#FFF1F3] px-4 py-3 text-sm font-medium text-[#A13F54]";

export default function SignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("signup");

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<(typeof PRODUCT_TYPES)[number]>("SaaS");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const recaptchaRef = useRef<RecaptchaFieldHandle | null>(null);
  const recaptchaEnabled = isClientRecaptchaEnabled() && Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  const handleGoogleSignup = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signIn("google", {
        callbackUrl: `/${locale}/onboarding`,
      });
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleStepOne = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim()) {
      setError(t("errors.requiredFields"));
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setError(t("errors.invalidEmail"));
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (!isStrongPassword(password)) {
      setError(t("passwordHint"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(t("errors.passwordsMismatch"));
      setLoading(false);
      return;
    }

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

      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          locale,
          captchaToken,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errors.createFailed"));
        setCaptchaResetNonce((current) => current + 1);
        setLoading(false);
        return;
      }
      const nextParams = new URLSearchParams({
        sent: "1",
        type: "user",
        email: data.email || email,
      });
      router.push(`/${locale}/verify-email?${nextParams.toString()}`);
      router.refresh();
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

        <div className="mb-8 flex items-center justify-center gap-3">
          {[1, 2].map((current) => (
            <div key={current} className="flex items-center gap-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step >= current ? "bg-[#21231D] text-white" : "bg-[#E8DED7] text-[#21231D]/40"
                }`}
              >
                {current}
              </div>
              {current < 2 ? <div className={`h-0.5 w-8 rounded-full ${step > current ? "bg-[#21231D]" : "bg-[#E8DED7]"}`} /> : null}
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-[#E8DED7]/70 bg-white/80 p-8 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl">
          {step === 1 ? (
            <>
              <h1 className="mb-1 text-2xl font-black text-[#21231D]">{t("title")}</h1>
              <p className="mb-6 text-sm text-[#21231D]/50">{t("subtitle")}</p>

              <button
                type="button"
                onClick={() => void handleGoogleSignup()}
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

              <form onSubmit={handleStepOne} className="flex flex-col gap-4">
                <div>
                  <label htmlFor="name" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                    {t("name")}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder={t("namePlaceholder")}
                    className={inputCls}
                    autoFocus
                    required
                  />
                </div>

                <div>
                  <label htmlFor="productType" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                    {t("productType")}
                  </label>
                  <select
                    id="productType"
                    value={productType}
                    onChange={(event) => setProductType(event.target.value as (typeof PRODUCT_TYPES)[number])}
                    className={`${inputCls} cursor-pointer`}
                  >
                    {PRODUCT_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

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
                    required
                  />
                </div>

                {error ? <p className={errorCls}>{error}</p> : null}

                <button
                  type="submit"
                  className="w-full rounded-xl border-none bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)]"
                >
                  {t("continueButton")} →
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-black text-[#21231D]">
                {t("stepTwoTitle")}
              </h2>
              <p className="mb-6 text-sm text-[#21231D]/50">
                {t("stepTwoSubtitle")}
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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
                    minLength={8}
                    required
                  />
                </div>

                <PasswordChecklist
                  password={password}
                  copy={{
                    title: t("passwordChecklist.title"),
                    minLength: t("passwordChecklist.minLength"),
                    number: t("passwordChecklist.number"),
                    special: t("passwordChecklist.special"),
                  }}
                />

                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                    {t("confirmPassword")}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={t("confirmPasswordPlaceholder")}
                    className={inputCls}
                    required
                  />
                </div>

                <RecaptchaField
                  ref={recaptchaRef}
                  locale={locale}
                  resetNonce={captchaResetNonce}
                />

                {error ? <p className={errorCls}>{error}</p> : null}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl border-none bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? t("creating") : `${t("createAccount")} →`}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setError("");
                  }}
                  className="border-none bg-transparent text-sm font-medium text-[#21231D]/50 transition-colors hover:text-[#21231D]"
                >
                  ← {t("backButton")}
                </button>
              </form>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[#21231D]/50">
          {t("haveAccount")}{" "}
          <Link href={`/${locale}/login`} className="font-bold text-[#C45D97] underline transition-colors hover:text-[#9F3E77]">
            {t("loginHere")}
          </Link>
        </p>
      </div>
    </div>
  );
}
