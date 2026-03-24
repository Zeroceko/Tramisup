/* eslint-disable @next/next/no-img-element */
"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
const illusScattered = "/assets/illus-scattered-tasks.png";
const illusMetric = "/assets/illus-metric-rhythm.png";
const illusIntegration = "/assets/illus-integration-map.png";
const illusTiramisu = "/assets/illus-tiramisu-slice.png";
const illusFeatureLaunch = "/assets/illus-feature-launch.png";
const illusFeatureMetrics = "/assets/illus-feature-metrics.png";
const illusFeatureGrowth = "/assets/illus-feature-growth.png";
const illusFeatureAi = "/assets/illus-feature-ai.png";
const screenLaunch = "/assets/screen-launch.png";
const screenGrowth = "/assets/screen-growth.png";
const screenOverview = "/assets/screen-overview.png";
const iconBrushChecklist = "/assets/icon-brush-checklist.png";
const iconBrushCheck = "/assets/icon-brush-check.png";
const iconBrushLightning = "/assets/icon-brush-lightning.png";
const iconBrushGift = "/assets/icon-brush-gift.png";
const screenMainDashboard = "/assets/screen-main-dashboard.png";
const screenDashboard = "/assets/screen-dashboard.png";
const screenProducts = "/assets/screen-products-full.png";
const widgetWeeklyMetric = "/assets/weekly_metric_rythim.png";
const widgetGrowthEngine = "/assets/growth_engine.png";
const widgetAiPlaniq = "/assets/AI_PlanIQ_Assistant.png";
const brushStepWorkspace = "/assets/brush-step-workspace.png";
const brushStepMetrics = "/assets/brush-step-metrics.png";
const dashboardMockup = "/assets/dashboard-mockup.png";

/* ─── Reveal Hooks ─── */
function useReveal(cls = "reveal") {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add("visible"); obs.unobserve(el); } },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

function Reveal({ children, className = "", type = "reveal" }: { children: ReactNode; className?: string; type?: string }) {
  const ref = useReveal(type);
  return <div ref={ref} className={`${type} ${className}`}>{children}</div>;
}

/* ═══════════════════ CUSTOM DROPDOWN ═══════════════════ */
function CustomDropdown({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full px-5 py-3.5 rounded-xl border border-border bg-background text-foreground text-sm font-medium outline-none focus:border-p700 focus:ring-2 focus:ring-p600/20 transition-all text-left flex items-center justify-between cursor-pointer"
      >
        <span>{value}</span>
        <svg className={`w-4 h-4 text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
      </button>
      <div className={`absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-xl shadow-t-lg overflow-hidden z-50 transition-all duration-200 origin-top ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}>
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => { onChange(opt); setOpen(false); }}
            className={`w-full px-5 py-3 text-sm font-medium text-left cursor-pointer transition-all border-none ${value === opt ? "bg-p600 text-white" : "bg-transparent text-foreground hover:bg-p100"}`}
          >
            {value === opt && <span className="mr-2">✓</span>}{opt}
          </button>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ STICKY TIRAMISU ═══════════════════ */
function StickyTiramisu() {
  const [visible, setVisible] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  useEffect(() => {
    const h = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  if (!visible) return null;
  return (
    <button
      onClick={() => router.push(`/${locale}/signup`)}
      className="fixed bottom-8 right-8 z-[999] group cursor-pointer bg-charcoal hover:-translate-y-1 transition-all duration-300 rounded-full px-5 py-3 flex items-center gap-3 shadow-t-lg border-none"
    >
      <img src={illusTiramisu} alt="Tiramisup" className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300" />
      <span className="text-sm font-bold text-primary-foreground">Try Tiramisup free ✦</span>
    </button>
  );
}

/* Wrapper that hides on mobile */
function StickyTiramisuWrapper() {
  return (
    <div className="hidden md:block">
      <StickyTiramisu />
    </div>
  );
}

/* ═══════════════════ NAV ═══════════════════ */
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const locale = useLocale();
  const navigate = (p: string) => router.push(`/${locale}${p}`);
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", h); return () => window.removeEventListener("scroll", h);
  }, []);
  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/90 backdrop-blur-xl border-b border-border/25 py-3" : "py-5"}`}>
      <div className="container flex items-center justify-between">
        <a href="#hero-top" className="flex items-center gap-2.5 no-underline text-foreground">
          <img src={illusTiramisu} alt="Tiramisup" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <span className="font-black text-[17px] leading-tight">Tiramisup</span>
            <span className="text-[9px] font-bold tracking-[.18em] uppercase text-foreground/50">Launch to Growth</span>
          </div>
        </a>
        <ul className="hidden md:flex gap-8 list-none">
          {["Overview", "How it works", "Pricing"].map((l) => (
            <li key={l}><a href={`#${l.toLowerCase().replace(/ /g, "")}`} className="text-foreground/60 text-sm font-semibold no-underline hover:text-foreground transition-colors duration-200">{l}</a></li>
          ))}
        </ul>
        <div className="flex gap-2.5 items-center">
          <button onClick={() => navigate("/login")} className="hidden sm:inline-flex border border-border/50 text-foreground/70 px-5 py-2 rounded-full text-sm font-semibold bg-transparent cursor-pointer hover:border-p800 hover:text-foreground transition-all active:scale-[0.97]">Log in</button>
          <button onClick={() => navigate("/signup")} className="bg-charcoal text-primary-foreground px-6 py-2.5 rounded-full text-sm font-bold border-none cursor-pointer hover:-translate-y-0.5 hover:shadow-t-md transition-all active:scale-[0.97] inline-flex items-center gap-1.5">Start free →</button>
        </div>
      </div>
    </nav>
  );
}

/* ═══════════════════ HERO — Centered big text + email CTA ═══════════════════ */
function Hero() {
  const router = useRouter();
  const locale = useLocale();
  const navigate = (p: string) => router.push(`/${locale}${p}`);

  return (
    <section className="relative overflow-hidden min-h-screen flex items-center justify-center" id="hero-top" style={{ background: "linear-gradient(180deg, #FFD7EF 0%, #FFF5F9 50%, #FFFFFF 100%)" }}>
      <div className="container relative z-10 pt-28 pb-16 text-center">
        <div className="animate-fade-up max-w-[1100px] mx-auto">
          {/* Tiramisu icon as subtle background texture */}
          <img src={illusTiramisu} alt="" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[clamp(280px,40vw,500px)] h-auto object-contain opacity-[0.07] rotate-[-12deg] pointer-events-none select-none -z-0" />
          <div className="relative z-10">
            <h1 className="text-[clamp(48px,8vw,120px)] font-black tracking-[-0.04em] leading-[0.92] uppercase text-foreground mb-8" style={{ textWrap: "balance" }}>
              FROM CHAOS<br />TO <span className="text-p600 italic">GROWTH</span>
            </h1>
          </div>

          <p className="text-base md:text-lg text-muted leading-relaxed max-w-[640px] mx-auto mb-10">
            Launch checklist, live metrics, growth routines, and AI planning — all in one operating layer for product teams.
          </p>

          {/* Email input + CTA */}
          <form onSubmit={(e) => { e.preventDefault(); navigate("/signup"); }} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-[520px] mx-auto mb-6 px-4 sm:px-0" id="hero-form">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 min-w-0 px-5 sm:px-6 py-4 rounded-full text-foreground text-base font-medium outline-none placeholder:text-muted/50 transition-all bg-white border border-border shadow-sm focus:border-p600 focus:ring-2 focus:ring-p600/20"
            />
            <button type="submit" className="px-8 py-4 rounded-full text-sm font-black cursor-pointer transition-all active:scale-[0.97] border-none hover:opacity-90 hover:-translate-y-0.5 bg-charcoal text-primary-foreground whitespace-nowrap shadow-t-md">
              Start free →
            </button>
          </form>

          <p className="text-sm text-muted">
            No credit card required · Setup in 2 minutes
          </p>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ STATS TICKER ═══════════════════ */
function StatsTicker() {
  const items = [
    { num: "234+", lbl: "Launch tasks per workspace" },
    { num: "82%", lbl: "Avg. checklist completion" },
    { num: "3×", lbl: "Faster than spreadsheets" },
    { num: "$0", lbl: "To get started" },
    { num: "6", lbl: "Active growth routines" },
  ];
  const doubled = [...items, ...items];
  return (
    <div className="bg-charcoal overflow-hidden">
      <div className="flex animate-ticker whitespace-nowrap hover:[animation-play-state:paused]">
        {doubled.map((t, i) => (
          <div key={i} className="flex items-center shrink-0">
            <div className="flex items-center gap-2.5 px-10 py-5 border-r border-white/[.07]">
              <span className="text-[22px] font-black text-p600">{t.num}</span>
              <span className="text-[13px] text-white/45 font-medium">{t.lbl}</span>
            </div>
            <span className="text-white/[.18] text-lg py-5 pl-10 shrink-0">✦</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════ PROBLEM — Compact single screen ═══════════════════ */
function Problem() {
  return (
    <section className="py-20 lg:py-28" id="overview" style={{ background: "#21231D" }}>
      <div className="container">
        <Reveal>
          <div className="max-w-[800px] mb-10">
            <h2 className="font-syne text-[clamp(32px,5vw,64px)] font-bold tracking-[-0.03em] leading-[0.95] mb-5" style={{ color: "#A0E1E1" }}>
              You&apos;re managing launch in{" "}
              <span style={{ color: "#FFEB69" }}>7 different tools.</span>
            </h2>
            <p className="text-base leading-relaxed max-w-[540px]" style={{ color: "rgba(160,225,225,0.45)" }}>
              Legal, marketing, tech, product todos — scattered across Notion, Linear, Slack, and spreadsheets. No single readiness score. No rhythm. No clarity.
            </p>
          </div>
        </Reveal>

        <div className="flex gap-4 md:gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
          <Reveal type="reveal-left">
            <div className="rounded-2xl overflow-hidden hover-lift group flex flex-col min-w-[260px] md:min-w-0 md:w-[320px] snap-start shrink-0" style={{ background: "#3A341C" }}>
              <div className="p-5 pb-2 flex justify-center">
                <img src={illusScattered} alt="Scattered tasks" className="w-full max-w-[160px] h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>
              <div className="p-5 pt-2">
                <h4 className="text-base md:text-xl font-black mb-1.5" style={{ color: "#FFEB69" }}>Scattered tasks</h4>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: "rgba(255,235,105,0.4)" }}>Everything lives somewhere different. More time finding than doing.</p>
              </div>
            </div>
          </Reveal>
          <Reveal>
            <div className="rounded-2xl overflow-hidden hover-lift group flex flex-col min-w-[260px] md:min-w-0 md:w-[320px] snap-start shrink-0" style={{ background: "#320707" }}>
              <div className="p-5 pb-2 flex justify-center">
                <img src={illusMetric} alt="No metric rhythm" className="w-full max-w-[160px] h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>
              <div className="p-5 pt-2">
                <h4 className="text-base md:text-xl font-black mb-1.5" style={{ color: "#FFD7EF" }}>No metric rhythm</h4>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: "rgba(255,215,239,0.4)" }}>You check metrics when things feel off — not on a cadence that drives decisions.</p>
              </div>
            </div>
          </Reveal>
          <Reveal type="reveal-right">
            <div className="rounded-2xl overflow-hidden hover-lift group flex flex-col min-w-[260px] md:min-w-0 md:w-[320px] snap-start shrink-0" style={{ background: "#260A2F" }}>
              <div className="p-5 pb-2 flex justify-center">
                <img src={illusIntegration} alt="No integration map" className="w-full max-w-[160px] h-auto object-contain group-hover:scale-110 transition-transform duration-700 ease-out" />
              </div>
              <div className="p-5 pt-2">
                <h4 className="text-base md:text-xl font-black mb-1.5" style={{ color: "#FFC091" }}>No integration map</h4>
                <p className="text-xs md:text-sm leading-relaxed" style={{ color: "rgba(255,192,145,0.4)" }}>You discover what&apos;s broken only after launch, when it&apos;s too expensive to fix.</p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ EVERYTHING YOU NEED — Full-page animated ═══════════════════ */
const featureCards = [
  {
    num: "01",
    tag: "Core Feature",
    title: "Launch Readiness\nTracker",
    desc: "Track product, legal, marketing, and technical launch tasks on a single surface. See your readiness score in real time.",
    img: illusFeatureLaunch,
    overlay: null,
    bg: "hsl(var(--dark-charcoal-bg))",
    fg: "text-dark-charcoal-fg",
    fgSub: "text-dark-charcoal-fg/40",
    fgTag: "text-dark-charcoal-fg/30",
    cta: "Try it free →",
    ctaBg: "bg-teal text-charcoal",
  },
  {
    num: "02",
    tag: "Metrics",
    title: "Weekly Metric\nRhythm",
    desc: "Capture DAU, MRR, retention, and activation every week. Build a decision-making cadence so you act on data, not gut feeling.",
    img: illusFeatureMetrics,
    overlay: widgetWeeklyMetric,
    bg: "hsl(var(--dark-gold-card-bg))",
    fg: "text-dark-gold-card-fg",
    fgSub: "text-dark-gold-card-fg/40",
    fgTag: "text-dark-gold-card-fg/30",
    cta: "Start tracking →",
    ctaBg: "bg-dark-gold-card-fg text-dark-gold-card-bg",
  },
  {
    num: "03",
    tag: "Growth",
    title: "Growth\nEngine",
    desc: "Connect goals, routines, and integrations. Keep your growth machine running even through post-launch chaos.",
    img: illusFeatureGrowth,
    overlay: widgetGrowthEngine,
    bg: "linear-gradient(170deg, hsl(var(--p400)) 0%, hsl(var(--p600)) 100%)",
    fg: "text-foreground",
    fgSub: "text-foreground/50",
    fgTag: "text-foreground/30",
    cta: "Explore growth →",
    ctaBg: "bg-charcoal text-primary-foreground",
  },
  {
    num: "04",
    tag: "AI",
    title: "AI PlanIQ\nAssistant",
    desc: "Your AI copilot for launch planning. Ask questions, get prioritization suggestions, and surface what needs attention.",
    img: illusFeatureAi,
    overlay: widgetAiPlaniq,
    bg: "hsl(var(--dark-purple-bg))",
    fg: "text-dark-purple-fg",
    fgSub: "text-dark-purple-fg/40",
    fgTag: "text-dark-purple-fg/30",
    cta: "Meet PlanIQ →",
    ctaBg: "bg-dark-purple-fg text-dark-purple-bg",
  },
];

function Features() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const handleScroll = () => {
      const rect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportH = window.innerHeight;
      const scrolled = -rect.top;
      const totalScroll = sectionHeight - viewportH;
      if (totalScroll <= 0) return;
      const progress = Math.max(0, Math.min(1, scrolled / totalScroll));
      const idx = Math.min(3, Math.floor(progress * 4));
      setActiveIndex(idx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section className="py-0" id="features">
      {/* Full-page "Everything you need" */}
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Texture elements */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-[15%] left-[8%] w-[180px] h-[180px] rounded-full opacity-20" style={{ background: "radial-gradient(ellipse, hsl(var(--p400) / 0.6), transparent 70%)" }} />
          <div className="absolute bottom-[20%] right-[10%] w-[220px] h-[220px] rounded-full opacity-15" style={{ background: "radial-gradient(ellipse, hsl(var(--p600) / 0.5), transparent 70%)" }} />
          <div className="absolute top-[40%] right-[25%] w-[100px] h-[100px] rounded-full opacity-10" style={{ background: "radial-gradient(ellipse, hsl(var(--yellow) / 0.5), transparent 70%)" }} />
          {/* Brush texture marks */}
          <img src={brushStepWorkspace} alt="" className="absolute top-[5%] right-[5%] w-[200px] opacity-[0.06] rotate-12 pointer-events-none" />
          <img src={brushStepMetrics} alt="" className="absolute bottom-[10%] left-[3%] w-[180px] opacity-[0.06] -rotate-6 pointer-events-none" />
        </div>

        <div className="container relative z-10">
          <Reveal type="reveal-scale">
            <div className="text-center">
              <h2 className="font-syne text-[clamp(48px,8vw,110px)] font-bold tracking-[-0.04em] text-foreground leading-[0.92]">
                Everything you need.
                <br />
                <span className="text-p800">Nothing you don&apos;t.</span>
              </h2>
            </div>
          </Reveal>
        </div>
      </div>

      <div ref={sectionRef} style={{ height: "500vh" }} className="relative">
        <div className="sticky top-0 h-screen overflow-hidden">
          {featureCards.map((card, i) => {
            const isVisible = i <= activeIndex;
            const isCurrent = i === activeIndex;
            const stackOffset = isCurrent ? 0 : (activeIndex - i) * 8;
            return (
              <div
                key={i}
                className="absolute inset-0 transition-all duration-700 ease-out"
                style={{
                  background: card.bg,
                  opacity: isVisible ? 1 : 0,
                  transform: `translateY(${isVisible ? stackOffset : 100}px) scale(${isVisible ? 1 - (activeIndex - i) * 0.02 : 0.9})`,
                  zIndex: i + 1,
                }}
              >
                <div className="h-full flex items-center">
                  <div className="container">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                      <div className={`${i % 2 === 1 ? "lg:order-2" : ""}`}>
                        <span className={`${card.fgTag} text-sm font-bold uppercase tracking-[.2em] mb-4 block`}>{card.num} · {card.tag}</span>
                        <h3 className={`font-syne text-[clamp(32px,4vw,56px)] font-bold tracking-tight ${card.fg} leading-[1.05] mb-6 whitespace-pre-line`}>
                          {card.title}
                        </h3>
                        <p className={`text-lg ${card.fgSub} leading-relaxed max-w-[420px] mb-8`}>
                          {card.desc}
                        </p>
                        <a href="#hero-form" className={`inline-flex items-center gap-2 ${card.ctaBg} px-8 py-3.5 rounded-full text-base font-bold no-underline hover:-translate-y-1 transition-all active:scale-[0.97]`}>
                          {card.cta}
                        </a>
                      </div>
                      <div className={`flex justify-center relative ${i % 2 === 1 ? "lg:order-1" : ""}`}>
                        <img
                          src={card.img}
                          alt={card.title}
                          className={`w-full max-w-[280px] md:max-w-[500px] h-auto drop-shadow-2xl transition-all duration-700 ${isCurrent ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-60 translate-y-8"}`}
                        />
                        {card.overlay && (
                          <img
                            src={card.overlay}
                            alt=""
                            className={`absolute bottom-0 right-0 w-[70%] max-w-[350px] h-auto rounded-xl shadow-2xl transition-all duration-700 delay-200 ${isCurrent ? "scale-100 opacity-100 translate-y-0" : "scale-90 opacity-0 translate-y-12"}`}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 z-10">
                  {featureCards.map((_, di) => (
                    <div key={di} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${di === activeIndex ? "bg-yellow scale-125" : di <= activeIndex ? "bg-white/30" : "bg-white/10"}`} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ HOW IT WORKS — Left steps, right pink card ═══════════════════ */
function HowItWorks() {
  const router = useRouter();
  const locale = useLocale();
  const navigate = (p: string) => router.push(`/${locale}${p}`);
  const steps = [
    { num: "01", title: "Create your workspace", desc: "Sign up free, name your product, and Tiramisup scaffolds your launch checklist automatically." },
    { num: "02", title: "Track tasks + metrics", desc: "Add launch tasks by category. Log your first metrics manually — no integrations needed." },
    { num: "03", title: "Run growth routines", desc: "Set weekly check-in habits, connect your tools, and let Tiramisup surface what matters." },
  ];

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden bg-background" id="howitworks">
      <div className="container relative z-10">
        <Reveal>
          <h2 className="font-syne text-[clamp(36px,5vw,64px)] font-bold tracking-[-0.03em] text-foreground leading-[1] mb-14">
            From zero to launch-ready<br />
            <span className="text-p800 italic">in minutes</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-12 lg:gap-16 items-center">
          {/* Left: Steps */}
          <div className="space-y-0">
            {steps.map((step, i) => (
              <Reveal key={i}>
                <div className={`py-8 ${i < steps.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-full bg-charcoal text-primary-foreground flex items-center justify-center text-sm font-black shrink-0">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="font-syne text-xl font-bold text-foreground mb-2">{step.title}</h3>
                      <p className="text-sm text-muted leading-relaxed max-w-[400px]">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="pt-6">
              <button onClick={() => navigate("/signup")} className="inline-flex items-center gap-2 bg-charcoal text-primary-foreground px-8 py-3.5 rounded-full text-sm font-bold border-none cursor-pointer hover:-translate-y-1 transition-all">
                Try it free →
              </button>
            </div>
          </div>

          {/* Right: Dashboard mockup */}
          <Reveal type="reveal-right">
            <img src={dashboardMockup} alt="Tiramisup Dashboard" className="w-full h-auto rounded-2xl shadow-t-lg" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ METRICS — Bright bg cards, dark text, big numbers ═══════════════════ */
function Metrics() {
  const items = [
    { n: "234+", l: "Launch tasks per workspace", bg: "#FFC091", fg: "#260A2F" },
    { n: "82%", l: "Avg. checklist completion", bg: "#A0E1E1", fg: "#21231D" },
    { n: "3×", l: "Faster than spreadsheets", bg: "#FFEB69", fg: "#3A341C" },
    { n: "$0", l: "To get started today", bg: "#FFD7EF", fg: "#320707" },
  ];
  return (
    <div className="py-24 lg:py-32 bg-background relative overflow-hidden">
      <div className="container relative z-10">
        <Reveal>
          <div className="text-center mb-14">
            <h2 className="font-syne text-[clamp(32px,4vw,56px)] font-bold tracking-[-0.03em] text-foreground leading-[0.95]">
              Built for <span className="text-p800">real results</span>
            </h2>
          </div>
        </Reveal>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {items.map((m, i) => (
            <Reveal key={i}>
              <div
                className="group relative rounded-2xl p-8 lg:p-10 text-center hover-lift overflow-hidden cursor-default transition-all duration-500 min-h-[260px] flex flex-col items-center justify-center"
                style={{ background: m.bg }}
              >
                <span className="text-[clamp(64px,8vw,96px)] font-black tracking-tighter block leading-none font-syne" style={{ color: m.fg }}>
                  {m.n}
                </span>
                <span className="text-sm mt-3 block font-semibold" style={{ color: m.fg, opacity: 0.6 }}>
                  {m.l}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════ PRICING ═══════════════════ */
function Pricing() {
  const plans = [
    { tier: "Free", price: "$0", per: "/ forever", desc: "Everything to start planning your launch today.", features: ["Manual metric entry", "Up to 50 launch tasks", "1 workspace", "Basic growth routines", "Launch readiness score"], featured: false },
    { tier: "Pro", price: "$19", per: "/ month", desc: "For founders serious about shipping and growing.", features: ["Unlimited tasks", "Metric integrations", "AI PlanIQ assistant", "Multiple workspaces", "Priority support", "Advanced analytics"], featured: true },
    { tier: "Team", price: "$49", per: "/ month", desc: "Collaborate across your team with advanced controls.", features: ["Everything in Pro", "Team collaboration", "Role-based access", "Custom integrations", "Dedicated onboarding", "SLA support"], featured: false },
  ];
  return (
    <section className="py-24 lg:py-32 bg-card" id="pricing">
      <div className="container">
        <Reveal>
          <div className="text-center mb-12">
            <h2 className="font-syne text-[clamp(36px,5vw,68px)] font-bold tracking-[-0.03em] text-foreground leading-[0.95]">
              Simple pricing.
              <br /><span className="text-p800">No surprises.</span>
            </h2>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
          {plans.map((p) => (
            <Reveal key={p.tier}>
              <div className={`rounded-2xl p-10 relative hover-lift ${p.featured ? "bg-charcoal border-charcoal scale-[1.03] shadow-t-lg" : "bg-p100 border border-border"}`}>
                {p.featured && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-yellow text-charcoal text-[11px] font-black px-5 py-1 rounded-full whitespace-nowrap uppercase tracking-wide">⭐ Most Popular</div>}
                <div className={`text-xs font-bold uppercase tracking-widest mb-3 ${p.featured ? "text-white/40" : "text-muted"}`}>{p.tier}</div>
                <div className={`text-6xl font-black tracking-tighter leading-none mb-3 font-syne ${p.featured ? "text-white" : "text-foreground"}`}>
                  {p.price}<span className={`text-lg font-normal ${p.featured ? "text-white/35" : "text-muted"}`}> {p.per}</span>
                </div>
                <p className={`text-sm mb-6 leading-relaxed ${p.featured ? "text-white/50" : "text-muted"}`}>{p.desc}</p>
                <hr className={`border-t mb-6 ${p.featured ? "border-white/10" : "border-border"}`} />
                <ul className="list-none mb-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className={`text-sm flex items-start gap-2.5 ${p.featured ? "text-white/75" : "text-foreground/70"}`}>
                      <span className="text-p800 font-extrabold shrink-0">✓</span>{f}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-3.5 rounded-xl text-base font-bold cursor-pointer transition-all active:scale-[0.97] ${p.featured ? "bg-card text-charcoal border-none" : "bg-transparent border-2 border-border text-foreground/70 hover:border-charcoal hover:text-charcoal"}`}>
                  {p.featured ? "Start Pro trial →" : p.tier === "Free" ? "Start free →" : "Contact us →"}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════ CTA — Compact single-screen ═══════════════════ */
function FinalCTA() {
  const router = useRouter();
  const locale = useLocale();
  const navigate = (p: string) => router.push(`/${locale}${p}`);
  return (
    <section className="py-24 lg:py-32 text-center relative overflow-hidden" style={{ background: "#260A2F" }}>
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-[600px] h-[400px] rounded-full -top-[150px] -left-[150px] animate-blob" style={{ background: "radial-gradient(ellipse, rgba(255,192,145,0.1), transparent 70%)" }} />
        <div className="absolute w-[400px] h-[300px] rounded-full -bottom-[80px] -right-[80px] animate-blob" style={{ background: "radial-gradient(ellipse, rgba(255,235,105,0.06), transparent 70%)", animationDelay: "-5s" }} />
      </div>

      <div className="container relative z-10">
        <Reveal type="reveal-scale">
          <h2 className="font-syne text-[clamp(36px,5vw,72px)] font-bold tracking-[-0.03em] leading-[0.95] mb-5" style={{ color: "#FFC091" }}>
            Your launch clarity
            <br />starts <span className="italic" style={{ color: "#FFEB69" }}>here.</span>
          </h2>
          <p className="text-base leading-relaxed mb-10 max-w-[460px] mx-auto" style={{ color: "rgba(255,192,145,0.45)" }}>
            One workspace. Every launch task, metric, and growth routine — visible and actionable.
          </p>

          <div className="flex flex-col items-center gap-5">
            <button onClick={() => navigate("/signup")} className="group inline-flex items-center gap-3 border-none px-12 py-5 rounded-full text-xl font-black cursor-pointer hover:scale-105 transition-all duration-300 active:scale-[0.97]" style={{ background: "linear-gradient(135deg, #FFC091, #FFD7EF)", color: "#260A2F" }}>
              <img src={illusTiramisu} alt="" className="w-9 h-9 object-contain group-hover:rotate-12 transition-transform duration-300" />
              Try Tiramisup free
              <span className="text-2xl group-hover:translate-x-1 transition-transform duration-300">→</span>
            </button>

            <div className="flex justify-center gap-6 flex-wrap text-sm" style={{ color: "rgba(255,192,145,0.35)" }}>
              {["No credit card", "Setup in 2 minutes", "Cancel anytime"].map((c) => (
                <span key={c}><span className="font-extrabold" style={{ color: "#FFC091" }}>✓ </span>{c}</span>
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════════ FOOTER ═══════════════════ */
function Footer() {
  return (
    <footer className="bg-background border-t border-border py-16 pb-10">
      <div className="container">
        <div className="grid grid-cols-2 md:grid-cols-[1.8fr_1fr_1fr_1fr] gap-12 mb-10">
          <div className="col-span-2 md:col-span-1">
            <a href="#" className="flex items-center gap-2.5 no-underline text-foreground mb-4">
              <img src={illusTiramisu} alt="Tiramisup" className="w-10 h-10 object-contain" />
              <div className="flex flex-col">
                <span className="font-black text-[17px] leading-tight">Tiramisup</span>
                <span className="text-[9px] font-bold tracking-[.18em] uppercase text-foreground/50">Launch to Growth</span>
              </div>
            </a>
            <p className="text-sm text-muted leading-relaxed max-w-[230px]">Launch OS for SaaS founders. From checklist to growth, in one platform.</p>
          </div>
          {[
            { title: "Product", links: ["Overview", "How it works", "Pricing", "Changelog"] },
            { title: "Resources", links: ["Blog", "Documentation", "Roadmap"] },
            { title: "Company", links: ["About", "Contact", "Privacy", "Terms"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-muted mb-5">{col.title}</h4>
              <ul className="list-none space-y-3">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-muted no-underline font-medium hover:text-foreground transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-7 flex justify-between items-center flex-wrap gap-4">
          <p className="text-[13px] text-muted">© 2025 Tiramisup. All rights reserved.</p>
          <div className="flex gap-2.5">
            {["𝕏", "in", "gh"].map((s) => (
              <a key={s} href="#" className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-sm text-muted no-underline font-bold hover:border-foreground hover:text-foreground transition-all">{s}</a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════ PAGE ═══════════════════ */
export default function Index() {
  return (
    <div className="font-outfit">
      <Navbar />
      <Hero />
      <StatsTicker />
      <Problem />
      <Features />
      <HowItWorks />
      <Metrics />
      <Pricing />
      <FinalCTA />
      <Footer />
      <StickyTiramisuWrapper />
    </div>
  );
}
