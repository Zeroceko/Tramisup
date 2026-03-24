/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState, type ReactNode } from "react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const stats = [
  { num: "234+", label: "Launch tasks per workspace" },
  { num: "82%", label: "Avg. checklist completion" },
  { num: "3×", label: "Faster than spreadsheets" },
  { num: "$0", label: "To get started" },
  { num: "6", label: "Active growth routines" },
];

const featureCards = [
  {
    num: "01",
    tag: "Core Feature",
    title: "Launch Readiness\nTracker",
    desc: "Track product, legal, marketing, and technical launch tasks on a single surface. See your readiness score in real time.",
    img: "/landing-preview/illus-feature-launch.png",
    overlay: "",
    bg: "#21231D",
    titleColor: "#F9F7EF",
    copyColor: "rgba(249,247,239,0.45)",
    tagColor: "rgba(249,247,239,0.3)",
    buttonBg: "#A0E1E1",
    buttonColor: "#21231D",
    cta: "Try it free →",
  },
  {
    num: "02",
    tag: "Metrics",
    title: "Weekly Metric\nRhythm",
    desc: "Capture DAU, MRR, retention, and activation every week. Build a decision-making cadence so you act on data, not gut feeling.",
    img: "/landing-preview/illus-feature-metrics.png",
    overlay: "/landing-preview/weekly_metric_rythim.png",
    bg: "#3A341C",
    titleColor: "#F4E2A3",
    copyColor: "rgba(244,226,163,0.42)",
    tagColor: "rgba(244,226,163,0.28)",
    buttonBg: "#F4E2A3",
    buttonColor: "#3A341C",
    cta: "Start tracking →",
  },
  {
    num: "03",
    tag: "Growth",
    title: "Growth\nEngine",
    desc: "Connect goals, routines, and integrations. Keep your growth machine running even through post-launch chaos.",
    img: "/landing-preview/illus-feature-growth.png",
    overlay: "/landing-preview/growth_engine.png",
    bg: "linear-gradient(170deg, #f0bfd7 0%, #c45d97 100%)",
    titleColor: "#1B1018",
    copyColor: "rgba(27,16,24,0.55)",
    tagColor: "rgba(27,16,24,0.36)",
    buttonBg: "#21231D",
    buttonColor: "#FFF8F2",
    cta: "Explore growth →",
  },
  {
    num: "04",
    tag: "AI",
    title: "AI PlanIQ\nAssistant",
    desc: "Your AI copilot for launch planning. Ask questions, get prioritization suggestions, and surface what needs attention.",
    img: "/landing-preview/illus-feature-ai.png",
    overlay: "/landing-preview/AI_PlanIQ_Assistant.png",
    bg: "#260A2F",
    titleColor: "#FFC091",
    copyColor: "rgba(255,192,145,0.42)",
    tagColor: "rgba(255,192,145,0.28)",
    buttonBg: "#FFC091",
    buttonColor: "#260A2F",
    cta: "Meet PlanIQ →",
  },
];

const plans = [
  {
    tier: "Free",
    price: "$0",
    per: "/ forever",
    desc: "Everything to start planning your launch today.",
    features: ["Manual metric entry", "Up to 50 launch tasks", "1 workspace", "Basic growth routines", "Launch readiness score"],
    featured: false,
  },
  {
    tier: "Pro",
    price: "$19",
    per: "/ month",
    desc: "For founders serious about shipping and growing.",
    features: ["Unlimited tasks", "Metric integrations", "AI PlanIQ assistant", "Multiple workspaces", "Priority support", "Advanced analytics"],
    featured: true,
  },
  {
    tier: "Team",
    price: "$49",
    per: "/ month",
    desc: "Collaborate across your team with advanced controls.",
    features: ["Everything in Pro", "Team collaboration", "Role-based access", "Custom integrations", "Dedicated onboarding", "SLA support"],
    featured: false,
  },
];

function useReveal(type = "reveal") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("lp-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, type };
}

function Reveal({
  children,
  className = "",
  type = "reveal",
}: {
  children: ReactNode;
  className?: string;
  type?: "reveal" | "reveal-left" | "reveal-right" | "reveal-scale";
}) {
  const { ref } = useReveal(type);
  return (
    <div ref={ref} className={`lp-${type} ${className}`}>
      {children}
    </div>
  );
}

function PreviewNav({
  locale,
  onStartFree,
  loginLabel,
  signupLabel,
}: {
  locale: string;
  onStartFree: () => void;
  loginLabel: string;
  signupLabel: string;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-[#E8DED7]/70 bg-[#FFF8F2]/85 py-3 backdrop-blur-xl" : "py-5"
      }`}
    >
      <div className="lp-container flex items-center justify-between">
        <a href="#hero-top" className="flex items-center gap-2.5 no-underline text-[#21231D]">
          <img src="/landing-preview/illus-tiramisu-slice.png" alt="Tiramisup" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-outfit text-[17px] font-black leading-tight">Tiramisup</span>
            <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#21231D]/50">Launch to Growth</span>
          </div>
        </a>

        <ul className="hidden list-none gap-8 md:flex">
          {[
            ["Overview", "#overview"],
            ["Features", "#features"],
            ["How it works", "#howitworks"],
            ["Pricing", "#pricing"],
          ].map(([label, href]) => (
            <li key={label}>
              <a href={href} className="text-sm font-semibold text-[#21231D]/60 no-underline transition-colors duration-200 hover:text-[#21231D]">
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/login`}
            className="hidden rounded-full border border-[#E8DED7]/80 px-5 py-2 text-sm font-semibold text-[#21231D]/70 transition hover:border-[#21231D] hover:text-[#21231D] sm:inline-flex"
          >
            {loginLabel}
          </Link>
          <button
            onClick={onStartFree}
            className="inline-flex items-center gap-1.5 rounded-full border-none bg-[#21231D] px-6 py-2.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:shadow-[0_10px_28px_rgba(0,0,0,0.14)]"
          >
            {signupLabel}
          </button>
        </div>
      </div>
    </nav>
  );
}

function StickyTiramisu({ onStartFree }: { onStartFree: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      onClick={onStartFree}
      className="fixed bottom-8 right-8 z-[60] hidden items-center gap-3 rounded-full border-none bg-[#21231D] px-5 py-3 text-sm font-bold text-white shadow-[0_18px_44px_rgba(0,0,0,0.18)] transition-all duration-300 hover:-translate-y-1 md:flex"
    >
      <img src="/landing-preview/illus-tiramisu-slice.png" alt="" className="h-9 w-9 object-contain transition-transform duration-300" />
      <span>Try Tiramisup free ✦</span>
    </button>
  );
}

function FeatureShowcase({ onStartFree }: { onStartFree: () => void }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToCard = (index: number) => {
    const track = trackRef.current;
    if (!track) return;

    track.scrollTo({
      left: track.clientWidth * index,
      behavior: "smooth",
    });
  };

  const handleTrackScroll = () => {
    const track = trackRef.current;
    if (!track || track.clientWidth === 0) return;

    const nextIndex = Math.round(track.scrollLeft / track.clientWidth);
    setActiveIndex(Math.max(0, Math.min(featureCards.length - 1, nextIndex)));
  };

  return (
    <section id="features" className="py-0">
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#FFF8F2]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[8%] top-[15%] h-[180px] w-[180px] rounded-full opacity-20" style={{ background: "radial-gradient(ellipse, rgba(196,93,151,0.28), transparent 70%)" }} />
          <div className="absolute bottom-[20%] right-[10%] h-[220px] w-[220px] rounded-full opacity-15" style={{ background: "radial-gradient(ellipse, rgba(240,191,215,0.28), transparent 70%)" }} />
          <img src="/landing-preview/brush-step-workspace.png" alt="" className="absolute right-[5%] top-[5%] w-[200px] rotate-12 opacity-[0.06]" />
          <img src="/landing-preview/brush-step-metrics.png" alt="" className="absolute bottom-[10%] left-[3%] w-[180px] -rotate-6 opacity-[0.06]" />
        </div>

        <div className="lp-container relative z-10">
          <Reveal type="reveal-scale">
            <div className="text-center">
              <h2 className="font-outfit text-[clamp(48px,8vw,110px)] font-black leading-[0.92] tracking-[-0.04em] text-[#21231D]">
                Everything you need.
                <br />
                <span className="text-[#C45D97]">Nothing you don&apos;t.</span>
              </h2>
            </div>
          </Reveal>
        </div>
      </div>

      <div className="bg-[#FFF8F2] px-4 pb-16 md:px-0 md:pb-24">
        <div className="lp-container">
          <div className="overflow-hidden rounded-[32px] border border-[#E8DED7] bg-white shadow-[0_24px_80px_rgba(33,35,29,0.08)]">
            <div
              ref={trackRef}
              onScroll={handleTrackScroll}
              className="scrollbar-hide flex snap-x snap-mandatory overflow-x-auto overflow-y-hidden touch-pan-x"
              style={{ WebkitOverflowScrolling: "touch" }}
            >
              {featureCards.map((card, index) => (
                <div
                  key={card.num}
                  className="flex min-h-[100svh] min-w-full snap-center items-center"
                  style={{ background: card.bg }}
                >
                  <div className="w-full px-6 py-10 md:px-10 lg:px-14">
                    <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
                      <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                        <span className="mb-4 block text-sm font-bold uppercase tracking-[0.2em]" style={{ color: card.tagColor }}>
                          {card.num} · {card.tag}
                        </span>
                        <h3
                          className="whitespace-pre-line font-outfit text-[clamp(32px,4vw,56px)] font-black leading-[1.05] tracking-tight"
                          style={{ color: card.titleColor }}
                        >
                          {card.title}
                        </h3>
                        <p className="mb-8 mt-6 max-w-[420px] text-lg leading-relaxed" style={{ color: card.copyColor }}>
                          {card.desc}
                        </p>
                        <button
                          onClick={onStartFree}
                          className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-base font-bold transition-all hover:-translate-y-1"
                          style={{ background: card.buttonBg, color: card.buttonColor }}
                        >
                          {card.cta}
                        </button>
                      </div>

                      <div className={`relative flex justify-center ${index % 2 === 1 ? "lg:order-1" : ""}`}>
                        <img
                          src={card.img}
                          alt={card.title}
                          className="h-auto w-full max-w-[280px] drop-shadow-2xl md:max-w-[500px]"
                        />
                        {card.overlay ? (
                          <img
                            src={card.overlay}
                            alt=""
                            className="absolute bottom-0 right-0 h-auto w-[70%] max-w-[350px] rounded-xl shadow-2xl"
                          />
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-3 border-t border-[#E8DED7] bg-white/90 px-6 py-5">
              {featureCards.map((_, dotIndex) => (
                <button
                  key={dotIndex}
                  type="button"
                  aria-label={`Go to feature ${dotIndex + 1}`}
                  onClick={() => scrollToCard(dotIndex)}
                  className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
                    dotIndex === activeIndex ? "scale-125 bg-[#C45D97]" : "bg-[#D9C8D3]"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPreviewPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations();
  const goToSignup = () => router.push(`/${locale}/signup`);

  return (
    <>
      <div className="min-h-screen overflow-x-hidden bg-[#FFF8F2] font-outfit text-[#21231D]">
        <PreviewNav
          locale={locale}
          onStartFree={goToSignup}
          loginLabel={t("nav.login")}
          signupLabel={t("nav.signupFree")}
        />

        <main>
          <section
            id="hero-top"
            className="relative flex min-h-screen items-center justify-center overflow-hidden"
            style={{ background: "linear-gradient(180deg, #FFD7EF 0%, #FFF5F9 50%, #FFFFFF 100%)" }}
          >
            <div className="lp-container relative z-10 pb-16 pt-28 text-center">
              <div className="mx-auto max-w-[1100px] animate-[lp-fade-up_0.8s_ease-out_both]">
                <img
                  src="/landing-preview/illus-tiramisu-slice.png"
                  alt=""
                  className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-auto w-[clamp(280px,40vw,500px)] -translate-x-1/2 -translate-y-1/2 rotate-[-12deg] object-contain opacity-[0.07]"
                />

                <h1 className="mb-8 text-[clamp(48px,8vw,120px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-[#21231D]">
                  FROM CHAOS
                  <br />
                  TO <span className="italic text-[#C45D97]">GROWTH</span>
                </h1>

                <p className="mx-auto mb-10 max-w-[640px] text-base leading-relaxed text-[#676B63] md:text-lg">
                  Launch checklist, live metrics, growth routines, and AI planning — all in one operating layer for product teams.
                </p>

                <form
                  onSubmit={(event) => {
                    event.preventDefault();
                    goToSignup();
                  }}
                  className="mx-auto mb-6 flex max-w-[520px] flex-col items-stretch gap-3 px-4 sm:flex-row sm:items-center sm:px-0"
                  id="hero-form"
                >
                  <input
                    type="email"
                    placeholder="you@email.com"
                    className="min-w-0 flex-1 rounded-full border border-[#E8DED7] bg-white px-5 py-4 text-base font-medium text-[#21231D] shadow-sm outline-none transition-all placeholder:text-[#676B63]/50 focus:border-[#C45D97] focus:ring-2 focus:ring-[#C45D97]/20 sm:px-6"
                  />
                  <button
                    type="submit"
                    className="whitespace-nowrap rounded-full border-none bg-[#21231D] px-8 py-4 text-sm font-black text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-0.5 hover:opacity-90"
                  >
                    Start free →
                  </button>
                </form>

                <p className="text-sm text-[#676B63]">No credit card required · Setup in 2 minutes</p>
              </div>
            </div>
          </section>

          <section className="overflow-hidden bg-[#21231D]">
            <div className="flex whitespace-nowrap [animation:lp-ticker_30s_linear_infinite] hover:[animation-play-state:paused]">
              {[...stats, ...stats].map((item, index) => (
                <div key={`${item.label}-${index}`} className="flex shrink-0 items-center">
                  <div className="flex items-center gap-2.5 border-r border-white/[0.07] px-10 py-5">
                    <span className="text-[22px] font-black text-[#C45D97]">{item.num}</span>
                    <span className="text-[13px] font-medium text-white/45">{item.label}</span>
                  </div>
                  <span className="shrink-0 py-5 pl-10 text-lg text-white/[0.18]">✦</span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[#21231D] py-20 lg:py-28" id="overview">
            <div className="lp-container">
              <Reveal>
                <div className="mb-10 max-w-[800px]">
                  <h2 className="mb-5 text-[clamp(32px,5vw,64px)] font-black leading-[0.95] tracking-[-0.03em] text-[#A0E1E1]">
                    You&apos;re managing launch in <span className="text-[#FFEB69]">7 different tools.</span>
                  </h2>
                  <p className="max-w-[540px] text-base leading-relaxed text-[#A0E1E1]/45">
                    Legal, marketing, tech, product todos — scattered across Notion, Linear, Slack, and spreadsheets. No single readiness score. No rhythm. No clarity.
                  </p>
                </div>
              </Reveal>

              <div className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 md:mx-0 md:px-0 lg:gap-5">
                {[
                  {
                    image: "/landing-preview/illus-scattered-tasks.png",
                    title: "Scattered tasks",
                    copy: "Everything lives somewhere different. More time finding than doing.",
                    bg: "#3A341C",
                    fg: "#FFEB69",
                  },
                  {
                    image: "/landing-preview/illus-metric-rhythm.png",
                    title: "No metric rhythm",
                    copy: "You check metrics when things feel off — not on a cadence that drives decisions.",
                    bg: "#320707",
                    fg: "#FFD7EF",
                  },
                  {
                    image: "/landing-preview/illus-integration-map.png",
                    title: "No integration map",
                    copy: "You discover what&apos;s broken only after launch, when it&apos;s too expensive to fix.",
                    bg: "#260A2F",
                    fg: "#FFC091",
                  },
                ].map((card, index) => (
                  <Reveal key={card.title} type={index === 0 ? "reveal-left" : index === 2 ? "reveal-right" : "reveal"}>
                    <div className="lp-hover-lift flex min-w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl md:min-w-0 md:w-[320px]" style={{ background: card.bg }}>
                      <div className="flex justify-center p-5 pb-2">
                        <img src={card.image} alt={card.title} className="h-auto w-full max-w-[160px] object-contain transition-transform duration-700 ease-out" />
                      </div>
                      <div className="p-5 pt-2">
                        <h4 className="mb-1.5 text-base font-black md:text-xl" style={{ color: card.fg }}>
                          {card.title}
                        </h4>
                        <p className="text-xs leading-relaxed md:text-sm" style={{ color: `${card.fg}66` }}>
                          {card.copy}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

              <FeatureShowcase onStartFree={goToSignup} />

          <section className="relative overflow-hidden bg-[#FFF8F2] py-24 lg:py-32" id="howitworks">
            <div className="lp-container relative z-10">
              <Reveal>
                <h2 className="mb-14 text-[clamp(36px,5vw,64px)] font-black leading-[1] tracking-[-0.03em] text-[#21231D]">
                  From zero to launch-ready
                  <br />
                  <span className="italic text-[#C45D97]">in minutes</span>
                </h2>
              </Reveal>

              <div className="grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
                <div className="space-y-0">
                  {[
                    ["01", "Create your workspace", "Sign up free, name your product, and Tiramisup scaffolds your launch checklist automatically."],
                    ["02", "Track tasks + metrics", "Add launch tasks by category. Log your first metrics manually — no integrations needed."],
                    ["03", "Run growth routines", "Set weekly check-in habits, connect your tools, and let Tiramisup surface what matters."],
                  ].map(([num, title, desc], index, all) => (
                    <Reveal key={title}>
                      <div className={`py-8 ${index < all.length - 1 ? "border-b border-[#E8DED7]" : ""}`}>
                        <div className="flex items-start gap-5">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#21231D] text-sm font-black text-white">
                            {num}
                          </div>
                          <div>
                            <h3 className="mb-2 text-xl font-black text-[#21231D]">{title}</h3>
                            <p className="max-w-[400px] text-sm leading-relaxed text-[#676B63]">{desc}</p>
                          </div>
                        </div>
                      </div>
                    </Reveal>
                  ))}
                  <div className="pt-6">
                    <button
                      onClick={goToSignup}
                      className="inline-flex items-center gap-2 rounded-full border-none bg-[#21231D] px-8 py-3.5 text-sm font-bold text-white transition-all hover:-translate-y-1"
                    >
                      Try it free →
                    </button>
                  </div>
                </div>

                <Reveal type="reveal-right">
                  <img src="/landing-preview/dashboard-mockup.png" alt="Tiramisup Dashboard" className="lp-shadow-lg h-auto w-full rounded-2xl" />
                </Reveal>
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden bg-[#FFF8F2] py-24 lg:py-32">
            <div className="lp-container relative z-10">
              <Reveal>
                <div className="mb-14 text-center">
                  <h2 className="text-[clamp(32px,4vw,56px)] font-black leading-[0.95] tracking-[-0.03em] text-[#21231D]">
                    Built for <span className="text-[#C45D97]">real results</span>
                  </h2>
                </div>
              </Reveal>

              <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
                {[
                  { num: "234+", label: "Launch tasks per workspace", bg: "#FFC091", fg: "#260A2F" },
                  { num: "82%", label: "Avg. checklist completion", bg: "#A0E1E1", fg: "#21231D" },
                  { num: "3×", label: "Faster than spreadsheets", bg: "#FFEB69", fg: "#3A341C" },
                  { num: "$0", label: "To get started today", bg: "#FFD7EF", fg: "#320707" },
                ].map((item) => (
                  <Reveal key={item.label}>
                    <div
                      className="lp-hover-lift relative flex min-h-[260px] cursor-default flex-col items-center justify-center overflow-hidden rounded-2xl p-8 text-center lg:p-10"
                      style={{ background: item.bg }}
                    >
                      <span className="block text-[clamp(64px,8vw,96px)] font-black leading-none tracking-tighter" style={{ color: item.fg }}>
                        {item.num}
                      </span>
                      <span className="mt-3 block text-sm font-semibold" style={{ color: item.fg, opacity: 0.6 }}>
                        {item.label}
                      </span>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-[#F8F2EA] py-24 lg:py-32" id="pricing">
            <div className="lp-container">
              <Reveal>
                <div className="mb-12 text-center">
                  <h2 className="text-[clamp(36px,5vw,68px)] font-black leading-[0.95] tracking-[-0.03em] text-[#21231D]">
                    Simple pricing.
                    <br />
                    <span className="text-[#C45D97]">No surprises.</span>
                  </h2>
                </div>
              </Reveal>

              <div className="grid items-start gap-5 md:grid-cols-3">
                {plans.map((plan) => (
                  <Reveal key={plan.tier}>
                    <div
                      className={`lp-hover-lift relative rounded-2xl p-10 ${
                        plan.featured ? "scale-[1.03] bg-[#21231D] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.15)]" : "border border-[#E8DED7] bg-[#F8ECF2]"
                      }`}
                    >
                      {plan.featured ? (
                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[#FFEB69] px-5 py-1 text-[11px] font-black uppercase tracking-wide text-[#21231D]">
                          Most Popular
                        </div>
                      ) : null}
                      <div className={`mb-3 text-xs font-bold uppercase tracking-widest ${plan.featured ? "text-white/40" : "text-[#676B63]"}`}>{plan.tier}</div>
                      <div className={`font-outfit text-6xl font-black leading-none tracking-tighter ${plan.featured ? "text-white" : "text-[#21231D]"}`}>
                        {plan.price}
                        <span className={`text-lg font-normal ${plan.featured ? "text-white/35" : "text-[#676B63]"}`}> {plan.per}</span>
                      </div>
                      <p className={`mb-6 mt-3 text-sm leading-relaxed ${plan.featured ? "text-white/50" : "text-[#676B63]"}`}>{plan.desc}</p>
                      <hr className={`mb-6 border-t ${plan.featured ? "border-white/10" : "border-[#E8DED7]"}`} />
                      <ul className="mb-8 list-none space-y-3">
                        {plan.features.map((feature) => (
                          <li key={feature} className={`flex items-start gap-2.5 text-sm ${plan.featured ? "text-white/75" : "text-[#21231D]/70"}`}>
                            <span className="shrink-0 font-extrabold text-[#C45D97]">✓</span>
                            {feature}
                          </li>
                        ))}
                      </ul>
                      <button
                        onClick={goToSignup}
                        className={`w-full rounded-xl py-3.5 text-base font-bold transition-all hover:-translate-y-0.5 ${
                          plan.featured
                            ? "border-none bg-[#FFF8F2] text-[#21231D]"
                            : "border-2 border-[#E8DED7] bg-transparent text-[#21231D]/70 hover:border-[#21231D] hover:text-[#21231D]"
                        }`}
                      >
                        {plan.featured ? "Start Pro trial →" : plan.tier === "Free" ? "Start free →" : "Contact us →"}
                      </button>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section className="relative overflow-hidden py-24 text-center lg:py-32" style={{ background: "#260A2F" }}>
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -left-[150px] -top-[150px] h-[400px] w-[600px] rounded-full [animation:lp-blob_8s_ease-in-out_infinite]" style={{ background: "radial-gradient(ellipse, rgba(255,192,145,0.1), transparent 70%)" }} />
              <div
                className="absolute -bottom-[80px] -right-[80px] h-[300px] w-[400px] rounded-full [animation:lp-blob_8s_ease-in-out_infinite]"
                style={{ background: "radial-gradient(ellipse, rgba(255,235,105,0.06), transparent 70%)", animationDelay: "-5s" }}
              />
            </div>

            <div className="lp-container relative z-10">
              <Reveal type="reveal-scale">
                <h2 className="mb-5 text-[clamp(36px,5vw,72px)] font-black leading-[0.95] tracking-[-0.03em] text-[#FFC091]">
                  Your launch clarity
                  <br />
                  starts <span className="italic text-[#FFEB69]">here.</span>
                </h2>
                <p className="mx-auto mb-10 max-w-[460px] text-base leading-relaxed text-[#FFC091]/45">
                  One workspace. Every launch task, metric, and growth routine — visible and actionable.
                </p>

                <div className="flex flex-col items-center gap-5">
                  <button
                    onClick={goToSignup}
                    className="group inline-flex items-center gap-3 rounded-full border-none px-12 py-5 text-xl font-black text-[#260A2F] transition-all duration-300 hover:scale-105"
                    style={{ background: "linear-gradient(135deg, #FFC091, #FFD7EF)" }}
                  >
                    <img src="/landing-preview/illus-tiramisu-slice.png" alt="" className="h-9 w-9 object-contain transition-transform duration-300 group-hover:rotate-12" />
                    Try Tiramisup free
                    <span className="text-2xl transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </button>

                  <div className="flex flex-wrap justify-center gap-6 text-sm text-[#FFC091]/35">
                    {["No credit card", "Setup in 2 minutes", "Cancel anytime"].map((copy) => (
                      <span key={copy}>
                        <span className="font-extrabold text-[#FFC091]">✓ </span>
                        {copy}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        </main>

        <footer className="border-t border-[#E8DED7] bg-[#FFF8F2] pb-10 pt-16">
          <div className="lp-container">
            <div className="mb-10 grid grid-cols-2 gap-12 md:grid-cols-[1.8fr_1fr_1fr_1fr]">
              <div className="col-span-2 md:col-span-1">
                <a href="#hero-top" className="mb-4 flex items-center gap-2.5 no-underline text-[#21231D]">
                  <img src="/landing-preview/illus-tiramisu-slice.png" alt="Tiramisup" className="h-10 w-10 object-contain" />
                  <div className="flex flex-col">
                    <span className="font-outfit text-[17px] font-black leading-tight">Tiramisup</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#21231D]/50">Launch to Growth</span>
                  </div>
                </a>
                <p className="max-w-[230px] text-sm leading-relaxed text-[#676B63]">Launch OS for SaaS founders. From checklist to growth, in one platform.</p>
              </div>

              {[
                { title: "Product", links: ["Overview", "How it works", "Pricing", "Changelog"] },
                { title: "Resources", links: ["Blog", "Documentation", "Roadmap"] },
                { title: "Company", links: ["About", "Contact", "Privacy", "Terms"] },
              ].map((column) => (
                <div key={column.title}>
                  <h4 className="mb-5 text-[11px] font-extrabold uppercase tracking-widest text-[#676B63]">{column.title}</h4>
                  <ul className="list-none space-y-3">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="text-sm font-medium text-[#676B63] no-underline transition-colors hover:text-[#21231D]">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 border-t border-[#E8DED7] pt-7">
              <p className="text-[13px] text-[#676B63]">{t("footer.rights")}</p>
              <div className="flex gap-2.5">
                {["𝕏", "in", "gh"].map((social) => (
                  <a
                    key={social}
                    href="#"
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#E8DED7] bg-white text-sm font-bold text-[#676B63] no-underline transition-all hover:border-[#21231D] hover:text-[#21231D]"
                  >
                    {social}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </footer>

        <StickyTiramisu onStartFree={goToSignup} />
      </div>

      <style jsx global>{`
        @keyframes lp-fade-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes lp-ticker {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        @keyframes lp-blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(30px, -50px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.95);
          }
          75% {
            transform: translate(40px, 30px) scale(1.05);
          }
        }

        .lp-container {
          margin: 0 auto;
          width: 100%;
          max-width: 1380px;
          padding-left: 24px;
          padding-right: 24px;
        }

        .lp-reveal,
        .lp-reveal-left,
        .lp-reveal-right,
        .lp-reveal-scale {
          opacity: 0;
          transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .lp-reveal {
          transform: translateY(40px);
        }

        .lp-reveal-left {
          transform: translateX(-50px);
        }

        .lp-reveal-right {
          transform: translateX(50px);
        }

        .lp-reveal-scale {
          transform: scale(0.92);
        }

        .lp-visible {
          opacity: 1;
          transform: translate(0) scale(1);
        }

        .lp-hover-lift {
          transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.35s ease;
        }

        .lp-hover-lift:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .lp-shadow-lg {
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </>
  );
}
