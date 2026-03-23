"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { useTranslations, useLocale } from "next-intl";

const inputCls = "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

export default function SignupPage() {
  const router = useRouter();
  const t = useTranslations('signup');
  const locale = useLocale();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accessCode, setAccessCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name,
          email,
          password,
          accessCode: accessCode.trim().toUpperCase()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || t('errors.createFailed'));
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        setError(t('errors.loginAfterCreate'));
      } else {
        router.push(`/${locale}/products/new`);
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
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-card">

        <section className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80] mb-2">{t('eyebrow')}</p>
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0d0d12]">{t('title')}</h1>
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
                <label htmlFor="name" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  {t('name')}
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className={inputCls}
                  placeholder={t('namePlaceholder')}
                />
              </div>

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
                  minLength={8}
                  className={inputCls}
                  placeholder={t('passwordPlaceholder')}
                />
                <p className="mt-1.5 text-[11px] text-[#9ca3af]">{t('passwordHint')}</p>
              </div>

              <div className="rounded-[16px] border border-[#e8e8e8] bg-[#fafafa] p-4">
                <label htmlFor="accessCode" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  Erken Erişim Kodu
                </label>
                <input
                  id="accessCode"
                  type="text"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  required
                  className={inputCls}
                  placeholder="TT31623SEN"
                  maxLength={20}
                />
                <p className="mt-1.5 text-[11px] text-[#9ca3af]">
                  Sana verilen erken erişim kodunu girerek direkt hesap oluşturabilirsin.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#ffd7ef] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('creating') : t('createAccount')}
              </button>
            </form>

            <p className="mt-6 text-[13px] text-[#666d80]">
              {t('haveAccount')}{" "}
              <Link href={`/${locale}/login`} className="font-semibold text-[#0d0d12] hover:text-[#666d80] transition">
                {t('loginHere')}
              </Link>
            </p>
          </div>
        </section>

        <section className="hidden lg:flex flex-col justify-between bg-[#0d0d12] p-10">
          <div>
            <Link href={`/${locale}`} className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fee74e] flex items-center justify-center font-bold text-[#0d0d12] text-[16px]">
                T
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Tiramisup</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">{t('sidebarTagline')}</p>
              </div>
            </Link>
            <h2 className="mt-12 text-[28px] font-bold tracking-[-0.03em] text-white leading-tight whitespace-pre-line">
              {t('sidebarTitle')}
            </h2>
          </div>

          <div className="space-y-3">
            {Object.entries(t.raw('features') as Record<string, {title: string; desc: string}>).map(([key, feat]) => (
              <div key={key} className="rounded-[12px] border border-white/10 bg-white/5 p-4">
                <p className="text-[14px] font-semibold text-white">{feat.title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/60">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
