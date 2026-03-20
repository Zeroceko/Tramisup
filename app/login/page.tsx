"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(72,109,255,0.2),_transparent_34%),linear-gradient(180deg,#f8faff_0%,#f5f7fb_40%,#f3f4f8_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_32px_80px_-30px_rgba(15,23,42,0.28)] backdrop-blur lg:grid-cols-[0.95fr_1.05fr]">
          <section className="hidden flex-col justify-between bg-slate-950 p-10 text-white lg:flex">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950">
                  T
                </div>
                <div>
                  <p className="text-base font-semibold tracking-[-0.03em]">Tiramisup</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Operator cockpit</p>
                </div>
              </Link>
              <h1 className="mt-12 text-4xl font-semibold tracking-[-0.05em] text-white">
                Welcome back to your growth operating system.
              </h1>
              <p className="mt-5 max-w-md text-sm leading-7 text-slate-300">
                Pick up where launch planning ended and execution begins: readiness, metrics,
                routines, and integration decisions in one place.
              </p>
            </div>

            <div className="grid gap-3">
              {[
                "Track launch readiness without spreadsheet drift",
                "Review MRR, retention, and activation from one surface",
                "Keep weekly growth rituals visible to the whole team",
              ].map((item) => (
                <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
                  {item}
                </div>
              ))}
            </div>
          </section>

          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-blue-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
                  Sign in
                </div>
                <h2 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Open your Tiramisup workspace</h2>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Use your email and password to continue into the dashboard.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2458ff_0%,#6d8dff_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-22px_rgba(36,88,255,0.95)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-600">
                Don&apos;t have an account? {" "}
                <Link href="/signup" className="font-semibold text-blue-700 hover:text-blue-800">
                  Create one
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
