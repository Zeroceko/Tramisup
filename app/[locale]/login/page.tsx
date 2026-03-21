"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useTranslations, useLocale } from "next-intl";

const inputCls = "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations('login');
  const locale = useLocale();
  const callbackUrl = searchParams.get('callbackUrl');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(t('errors.wrongCredentials'));
      } else {
        router.push(callbackUrl || `/${locale}/dashboard`);
        router.refresh();
      }
    } catch {
      setError(t('errors.generic'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-[0.95fr_1.05fr] overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-card">

        {/* Left panel */}
        <section className="hidden lg:flex flex-col justify-between bg-[#0d0d12] p-10">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fee74e] flex items-center justify-center font-bold text-[#0d0d12] text-[16px]">
                T
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Tiramisup</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Operator cockpit</p>
              </div>
            </Link>
            <h1 className="mt-12 text-[32px] font-bold tracking-[-0.03em] text-white leading-tight whitespace-pre-line">
              {t('sidebarTitle')}
            </h1>
            <p className="mt-4 text-[14px] leading-7 text-white/60">
              {t('sidebarSubtitle')}
            </p>
          </div>

          <div className="space-y-2">
            {(t.raw('features') as string[]).map((item) => (
              <div key={item} className="rounded-[12px] border border-white/10 bg-white/5 px-4 py-3 text-[13px] text-white/70">
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Right panel */}
        <section className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80] mb-2">{t('eyebrow')}</p>
              <h2 className="text-[26px] font-bold tracking-[-0.02em] text-[#0d0d12]">{t('title')}</h2>
              <p className="mt-2 text-[14px] text-[#666d80]">
                {t('subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  {t('email')}
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                  className={inputCls}
                  placeholder={t('emailPlaceholder')}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  {t('password')}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className={inputCls}
                  placeholder={t('passwordPlaceholder')}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#ffd7ef] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('loggingIn') : t('loginButton')}
              </button>
            </form>

            <p className="mt-6 text-[13px] text-[#666d80]">
              {t('noAccount')}{" "}
              <Link href={`/${locale}/signup`} className="font-semibold text-[#0d0d12] hover:text-[#666d80] transition">
                {t('signupHere')}
              </Link>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
