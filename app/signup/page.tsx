"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

const inputCls = "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Hesap oluşturulamadı");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", { email, password, redirect: false });

      if (result?.error) {
        setError("Hesap oluşturuldu ama giriş başarısız. Lütfen giriş ekranını dene.");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Bir hata oluştu. Lütfen tekrar dene.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid lg:grid-cols-[1.05fr_0.95fr] overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white shadow-card">

        {/* Left panel — form */}
        <section className="p-8 sm:p-12">
          <div className="mx-auto max-w-md">
            <div className="mb-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80] mb-2">Kayıt Ol</p>
              <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0d0d12]">Launch ekibin için workspace oluştur</h1>
              <p className="mt-2 text-[14px] text-[#666d80]">
                Hesabını oluştur ve launch planlamasıyla başla; metrikler ve büyüme rutinlerine genişlet.
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
                  Ad Soyad
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  className={inputCls}
                  placeholder="Ada Lovelace"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  E-posta
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className={inputCls}
                  placeholder="sen@ornek.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-[12px] font-semibold text-[#0d0d12] mb-1.5">
                  Şifre
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className={inputCls}
                  placeholder="En az 8 karakter"
                />
                <p className="mt-1.5 text-[11px] text-[#9ca3af]">Şifren en az 8 karakter olmalı.</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-full bg-[#ffd7ef] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Hesap oluşturuluyor…" : "Hesap Oluştur"}
              </button>
            </form>

            <p className="mt-6 text-[13px] text-[#666d80]">
              Zaten hesabın var mı?{" "}
              <Link href="/login" className="font-semibold text-[#0d0d12] hover:text-[#666d80] transition">
                Giriş yap
              </Link>
            </p>
          </div>
        </section>

        {/* Right panel — dark feature showcase */}
        <section className="hidden lg:flex flex-col justify-between bg-[#0d0d12] p-10">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#fee74e] flex items-center justify-center font-bold text-[#0d0d12] text-[16px]">
                T
              </div>
              <div>
                <p className="text-[15px] font-semibold text-white">Tiramisup</p>
                <p className="text-[10px] uppercase tracking-[0.22em] text-white/40">Launch to growth</p>
              </div>
            </Link>
            <h2 className="mt-12 text-[28px] font-bold tracking-[-0.03em] text-white leading-tight">
              Launch ile ölçek arasındaki<br />karmaşık orta yol için tek workspace.
            </h2>
          </div>

          <div className="space-y-3">
            {[
              ["Pre-Launch", "Checklist ilerlemesi, launch blokerları ve bekleyen aksiyonlar"],
              ["Metrikler",  "Manuel giriş şimdi, entegrasyon-hazır temel sonra"],
              ["Büyüme",     "Hedefler, rutinler ve ilerleme görünürlüğü tek döngüde"],
            ].map(([title, copy]) => (
              <div key={title} className="rounded-[12px] border border-white/10 bg-white/5 p-4">
                <p className="text-[14px] font-semibold text-white">{title}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/60">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
