"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";

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
        setError(data.error || "Failed to create account");
        setLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Account created but sign-in failed. Please try the login screen.");
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
        <div className="grid w-full overflow-hidden rounded-[32px] border border-white/70 bg-white/75 shadow-[0_32px_80px_-30px_rgba(15,23,42,0.28)] backdrop-blur lg:grid-cols-[1.02fr_0.98fr]">
          <section className="p-6 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <div className="mb-8">
                <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-violet-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Create workspace
                </div>
                <h1 className="text-3xl font-semibold tracking-[-0.04em] text-slate-950">Set up Tramisu for your launch team</h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  Create your account now and start with launch planning, then expand into metrics and growth routines.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {error ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="Jane Doe"
                  />
                </div>

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
                    minLength={8}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
                    placeholder="At least 8 characters"
                  />
                  <p className="mt-2 text-xs text-slate-500">Use at least 8 characters for your workspace password.</p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2458ff_0%,#6d8dff_100%)] px-5 py-3.5 text-sm font-semibold text-white shadow-[0_20px_40px_-22px_rgba(36,88,255,0.95)] transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-sm text-slate-600">
                Already have an account? {" "}
                <Link href="/login" className="font-semibold text-blue-700 hover:text-blue-800">
                  Sign in
                </Link>
              </p>
            </div>
          </section>

          <section className="hidden flex-col justify-between border-l border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#111827_100%)] p-10 text-white lg:flex">
            <div>
              <Link href="/" className="inline-flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-lg font-bold text-slate-950">
                  T
                </div>
                <div>
                  <p className="text-base font-semibold tracking-[-0.03em]">Tramisu</p>
                  <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Launch to growth</p>
                </div>
              </Link>
              <h2 className="mt-12 text-4xl font-semibold tracking-[-0.05em] text-white">
                A single workspace for the messy middle between launch and scale.
              </h2>
            </div>

            <div className="grid gap-4">
              {[
                ["Pre-launch", "Checklist progress, launch blockers, and pending actions"],
                ["Metrics", "Manual entry now, integration-ready foundation next"],
                ["Growth", "Goals, routines, and progress visibility in one loop"],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-lg font-semibold tracking-[-0.03em] text-white">{title}</p>
                  <p className="mt-2 text-sm leading-7 text-slate-300">{copy}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
