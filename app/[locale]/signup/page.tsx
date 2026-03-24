/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

const PRODUCT_TYPES = ["SaaS", "Mobile App", "E-commerce", "Other"] as const;

const inputCls =
  "w-full rounded-xl border border-[#E8DED7] bg-[#FFF8F2] px-4 py-3 text-sm font-medium text-[#21231D] outline-none transition-all placeholder:text-[#21231D]/30 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20";

export default function SignupPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("signup");

  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [productType, setProductType] = useState<(typeof PRODUCT_TYPES)[number]>("SaaS");
  const [email, setEmail] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleStepOne = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !accessCode.trim()) {
      setError(t("errors.createFailed"));
      return;
    }

    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isEmailValid) {
      setError(t("errors.generic"));
      return;
    }

    setStep(2);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    if (password.length < 8) {
      setError(t("passwordHint"));
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError(locale === "tr" ? "Şifreler eşleşmiyor." : "Passwords don't match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          accessCode: accessCode.trim().toUpperCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t("errors.createFailed"));
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        setError(t("errors.loginAfterCreate"));
      } else {
        router.push(`/${locale}/products/new`);
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
                    Product Type
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

                <div>
                  <label htmlFor="accessCode" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                    {locale === "tr" ? "Erken Erişim Kodu" : "Early Access Code"}
                  </label>
                  <input
                    id="accessCode"
                    type="text"
                    value={accessCode}
                    onChange={(event) => setAccessCode(event.target.value.toUpperCase())}
                    placeholder="TT31623SEN"
                    className={inputCls}
                    maxLength={20}
                    required
                  />
                </div>

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

                <button
                  type="submit"
                  className="w-full rounded-xl border-none bg-[#21231D] py-3.5 text-sm font-black text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_rgba(33,35,29,0.18)]"
                >
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="mb-1 text-2xl font-black text-[#21231D]">
                {locale === "tr" ? "Şifreni belirle" : "Set your password"}
              </h2>
              <p className="mb-6 text-sm text-[#21231D]/50">
                {locale === "tr" ? "Hesabın için güçlü bir şifre seç." : "Choose a strong password for your account."}
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

                <div>
                  <label htmlFor="confirmPassword" className="mb-1 block text-[10px] font-bold uppercase tracking-wider text-[#21231D]/60">
                    {locale === "tr" ? "Şifreyi doğrula" : "Confirm password"}
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder={locale === "tr" ? "Şifreyi tekrar gir" : "Repeat password"}
                    className={inputCls}
                    required
                  />
                </div>

                {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}

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
                  ← {locale === "tr" ? "Geri" : "Back"}
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
