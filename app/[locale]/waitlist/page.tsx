/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import AnalyticsConsentBanner from "@/components/analytics/AnalyticsConsentBanner";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import RoutePageViewTracker from "@/components/analytics/RoutePageViewTracker";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import SectionViewTracker from "@/components/analytics/SectionViewTracker";
import RecaptchaField, {
  isClientRecaptchaEnabled,
  type RecaptchaFieldHandle,
} from "@/components/RecaptchaField";
import { trackAnalyticsEvent } from "@/lib/analytics";

const illusScattered = "/assets/illus-scattered-tasks.png";
const illusMetric = "/assets/illus-metric-rhythm.png";
const illusIntegration = "/assets/illus-integration-map.png";
const illusTiramisu = "/assets/illus-tiramisu-slice.png";
const dashboardMockup = "/assets/dashboard-mockup.png";

const EARLY_ACCESS_COPY = {
  en: {
    nav: {
      tagline: "Launch to Growth",
      cta: "Join waitlist →",
    },
    hero: {
      titleTop: "FROM CHAOS",
      connector: "TO",
      titleBottom: "GROWTH",
      subtitle:
        "Launch checklist, live metrics, growth routines, and planning in one workspace for product teams.",
      emailPlaceholder: "you@email.com",
      cta: "Join waitlist →",
    },
    sticky: "Join early access ✦",
    problem: {
      title: "You're managing launch in",
      highlight: "7 different tools.",
      desc: "Legal, marketing, tech, product todos — scattered across Notion, Linear, Slack, and spreadsheets. No single readiness score. No rhythm. No clarity.",
      cards: [
        {
          title: "Scattered tasks",
          desc: "Everything lives somewhere different. More time finding than doing.",
          alt: "Scattered tasks",
          bg: "#3A341C",
          titleColor: "#FFEB69",
          bodyColor: "rgba(255,235,105,0.4)",
        },
        {
          title: "No metric rhythm",
          desc: "You check metrics when things feel off — not on a cadence that drives decisions.",
          alt: "No metric rhythm",
          bg: "#320707",
          titleColor: "#FFD7EF",
          bodyColor: "rgba(255,215,239,0.4)",
        },
        {
          title: "No integration map",
          desc: "You discover what's broken only after launch, when it's too expensive to fix.",
          alt: "No integration map",
          bg: "#260A2F",
          titleColor: "#FFC091",
          bodyColor: "rgba(255,192,145,0.4)",
        },
      ],
    },
    how: {
      title: "Tiramisup: Manage launch, track growth",
      accent: "",
      steps: [
        {
          num: "01",
          title: "Create your workspace",
          desc: "Join the waitlist, tell us where you are, and get invited into the right onboarding flow.",
        },
        {
          num: "02",
          title: "Track tasks + metrics",
          desc: "Start with the essentials first, then expand into launch readiness and live operating rhythm.",
        },
        {
          num: "03",
          title: "Run growth routines",
          desc: "Keep focus on the next action instead of juggling multiple disconnected tools.",
        },
      ],
      dashboardAlt: "Tiramisup Dashboard",
      cta: "Join waitlist →",
    },
    form: {
      errorFallback: "Something went wrong. Please try again.",
      emailExists: "This email is already on the list.",
      disclaimer:
        "By joining, you agree that we may email you about early access. We use essential cookies and optional analytics tools to improve the site.",
      privacy: "Privacy Policy",
      terms: "Terms",
    },
  },
  tr: {
    nav: {
      tagline: "Launch to Growth",
      cta: "Listeye katıl →",
    },
    hero: {
      titleTop: "KAOSTAN",
      connector: "",
      titleBottom: "BÜYÜMEYE",
      subtitle:
        "Yayın kontrol listesi, canlı metrikler, büyüme rutinleri ve planlama; ürün ekipleri için tek çalışma alanında.",
      emailPlaceholder: "sen@ornek.com",
      cta: "Listeye katıl →",
    },
    sticky: "Erken erişime katıl ✦",
    problem: {
      title: "Launch'ı",
      highlight: "7 farklı araçta yönetiyorsun.",
      desc: "Hukuk, pazarlama, teknik ve ürün işleri Notion, Linear, Slack ve spreadsheet'lere dağılmış durumda. Tek bir hazırlık skoru yok. Ritim yok. Netlik yok.",
      cards: [
        {
          title: "Görevler dağınık",
          desc: "Her şey farklı bir yerde duruyor. Yapmaktan çok bulmaya zaman gidiyor.",
          alt: "Dağınık görevler",
          bg: "#3A341C",
          titleColor: "#FFEB69",
          bodyColor: "rgba(255,235,105,0.4)",
        },
        {
          title: "Metrik ritmi yok",
          desc: "Metriklere ancak işler ters gittiğinde bakılıyor; karar taşıyan düzenli bir kadans yok.",
          alt: "Metrik ritmi yok",
          bg: "#320707",
          titleColor: "#FFD7EF",
          bodyColor: "rgba(255,215,239,0.4)",
        },
        {
          title: "Entegrasyon haritası yok",
          desc: "Neyin bozuk olduğunu ancak launch'tan sonra fark ediyorsun; o noktada düzeltmek çok daha pahalı.",
          alt: "Entegrasyon haritası yok",
          bg: "#260A2F",
          titleColor: "#FFC091",
          bodyColor: "rgba(255,192,145,0.4)",
        },
      ],
    },
    how: {
      title: "Tiramisup: Lansmanı yönet, büyümeyi takip et",
      accent: "",
      steps: [
        {
          num: "01",
          title: "Çalışma alanını kur",
          desc: "Waitlist'e katıl, hangi aşamada olduğunu paylaş, sana uygun onboarding akışına davet gönderelim.",
        },
        {
          num: "02",
          title: "Görevleri ve metrikleri takip et",
          desc: "Önce temel işleri topla, sonra launch hazırlığı ve günlük çalışma ritmini genişlet.",
        },
        {
          num: "03",
          title: "Büyüme rutinlerini çalıştır",
          desc: "Birbiriyle kopuk araçları kovalamak yerine sıradaki net aksiyona odaklan.",
        },
      ],
      dashboardAlt: "Tiramisup Paneli",
      cta: "Listeye katıl →",
    },
    form: {
      errorFallback: "Bir şey ters gitti. Lütfen tekrar dene.",
      emailExists: "Bu email zaten listede.",
      disclaimer:
        "Listeye katılarak erken erişimle ilgili sana e-posta gönderebileceğimizi kabul etmiş olursun. Siteyi iyileştirmek için zorunlu çerezler ve isteğe bağlı analytics araçları kullanıyoruz.",
      privacy: "Gizlilik Politikası",
      terms: "Koşullar",
    },
  },
} as const;

function useReveal(cls = "reveal") {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [cls]);

  return ref;
}

function Reveal({ children, className = "", type = "reveal" }: { children: ReactNode; className?: string; type?: string }) {
  const ref = useReveal(type);
  return <div ref={ref} className={`${type} ${className}`}>{children}</div>;
}

type Copy = (typeof EARLY_ACCESS_COPY)[keyof typeof EARLY_ACCESS_COPY];

function StickyCta({
  label,
  locale,
  onClick,
}: {
  label: string;
  locale: "en" | "tr";
  onClick: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [hasTrackedView, setHasTrackedView] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 500);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!visible || hasTrackedView) return;

    trackAnalyticsEvent("waitlist_sticky_cta_view", {
      locale,
      location: "sticky_cta",
    });
    setHasTrackedView(true);
  }, [hasTrackedView, locale, visible]);

  if (!visible) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-8 right-8 z-[999] hidden rounded-full border-none bg-charcoal px-5 py-3 shadow-t-lg transition-all duration-300 hover:-translate-y-1 md:flex md:items-center md:gap-3"
    >
      <img src={illusTiramisu} alt="Tiramisup" className="h-9 w-9 object-contain" />
      <span className="text-sm font-bold text-primary-foreground">{label}</span>
    </button>
  );
}

function Navbar({
  copy,
  onPrimaryClick,
}: {
  copy: Copy;
  onPrimaryClick: () => void;
}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
        scrolled ? "border-b border-border/25 bg-background/90 py-3 backdrop-blur-xl" : "py-5"
      }`}
    >
      <div className="container flex items-center justify-between">
        <a href="#hero-top" className="flex items-center gap-2.5 no-underline text-foreground">
          <img src={illusTiramisu} alt="Tiramisup" className="h-10 w-10 object-contain" />
          <div className="flex flex-col">
            <span className="text-[17px] font-black leading-tight">Tiramisup</span>
          </div>
        </a>

        <div className="flex items-center gap-2.5">
          <LanguageSwitcher />
          <button
            type="button"
            onClick={onPrimaryClick}
            className="inline-flex items-center gap-1.5 rounded-full border-none bg-charcoal px-6 py-2.5 text-sm font-bold text-primary-foreground transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:shadow-t-md"
          >
            {copy.nav.cta}
          </button>
        </div>
      </div>
    </nav>
  );
}

function Hero({
  copy,
  locale,
  email,
  loading,
  error,
  inputRef,
  recaptchaResetNonce,
  onEmailChange,
  onEmailFocus,
  onSubmitCtaClick,
  onSubmit,
  recaptchaRef,
}: {
  copy: Copy;
  locale: "en" | "tr";
  email: string;
  loading: boolean;
  error: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  recaptchaResetNonce: number;
  onEmailChange: (value: string) => void;
  onEmailFocus: () => void;
  onSubmitCtaClick: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  recaptchaRef: React.RefObject<RecaptchaFieldHandle | null>;
}) {
  return (
    <section
      id="hero-top"
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
      style={{ background: "linear-gradient(180deg, #FFD7EF 0%, #FFF5F9 50%, #FFFFFF 100%)" }}
    >
      <div className="container relative z-10 pb-16 pt-28 text-center">
        <div className="mx-auto max-w-[1100px] animate-fade-up">
          <img
            src={illusTiramisu}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 -z-0 h-auto w-[clamp(280px,40vw,500px)] -translate-x-1/2 -translate-y-1/2 select-none object-contain opacity-[0.07] rotate-[-12deg]"
          />

          <div className="relative z-10">
            <h1
              className="mb-8 text-[clamp(48px,8vw,120px)] font-black uppercase leading-[0.92] tracking-[-0.04em] text-foreground"
              style={{ textWrap: "balance" }}
            >
              {copy.hero.titleTop}
              <br />
              {copy.hero.connector ? `${copy.hero.connector} ` : ""}
              <span className="italic text-p600">{copy.hero.titleBottom}</span>
            </h1>
          </div>

          <p className="mx-auto mb-10 max-w-[640px] text-base leading-relaxed text-muted md:text-lg">
            {copy.hero.subtitle}
          </p>

          <form id="hero-form" onSubmit={onSubmit} className="mx-auto mb-4 max-w-[520px] px-4 sm:px-0">
            <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
              <input
                ref={inputRef}
                type="email"
                value={email}
                onFocus={onEmailFocus}
                onChange={(event) => onEmailChange(event.target.value)}
                placeholder={copy.hero.emailPlaceholder}
                className="min-w-0 flex-1 rounded-full border border-border bg-white px-5 py-4 text-base font-medium text-foreground shadow-sm outline-none transition-all placeholder:text-muted/50 focus:border-p600 focus:ring-2 focus:ring-p600/20 sm:px-6"
                disabled={loading}
                required
              />
              <button
                type="submit"
                onClick={onSubmitCtaClick}
                disabled={loading || !email.trim()}
                className="whitespace-nowrap rounded-full border-none bg-charcoal px-8 py-4 text-sm font-black text-primary-foreground shadow-t-md transition-all active:scale-[0.97] hover:-translate-y-0.5 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {loading ? "..." : copy.hero.cta}
              </button>
            </div>

            <RecaptchaField ref={recaptchaRef} locale={locale} resetNonce={recaptchaResetNonce} />
          </form>

          {error ? (
            <div className="mx-auto mb-3 max-w-[520px] rounded-2xl border border-[#f3c2cf] bg-[#fff2f5] px-4 py-3 text-sm text-[#b03b64]">
              {error}
            </div>
          ) : null}

          <div className="mx-auto mt-3 max-w-[620px] px-4 text-center text-xs leading-6 text-foreground/55 sm:px-0">
            <p>
              {copy.form.disclaimer}{" "}
              <Link href={`/${locale}/privacy`} className="font-semibold underline underline-offset-4">
                {copy.form.privacy}
              </Link>{" "}
              ·{" "}
              <Link href={`/${locale}/terms`} className="font-semibold underline underline-offset-4">
                {copy.form.terms}
              </Link>
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

function Problem({ copy }: { copy: Copy }) {
  const images = [illusScattered, illusMetric, illusIntegration];

  return (
    <section id="overview" className="py-20 lg:py-28" style={{ background: "#21231D" }}>
      <div className="container">
        <Reveal>
          <div className="mb-10 max-w-[800px]">
            <h2
              className="mb-5 font-syne text-[clamp(32px,5vw,64px)] font-bold leading-[0.95] tracking-[-0.03em]"
              style={{ color: "#A0E1E1" }}
            >
              {copy.problem.title} <span style={{ color: "#FFEB69" }}>{copy.problem.highlight}</span>
            </h2>
            <p className="max-w-[540px] text-base leading-relaxed" style={{ color: "rgba(160,225,225,0.45)" }}>
              {copy.problem.desc}
            </p>
          </div>
        </Reveal>

        <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 scrollbar-hide md:mx-0 md:gap-6 md:overflow-visible md:px-0 md:pb-0">
          {copy.problem.cards.map((card, index) => (
            <Reveal key={card.title} type={index === 0 ? "reveal-left" : index === 2 ? "reveal-right" : "reveal"}>
              <div
                className="group flex min-w-[260px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl hover-lift md:min-w-0 md:flex-1 md:shrink"
                style={{ background: card.bg }}
              >
                <div className="flex justify-center p-5 pb-2 md:p-6 md:pb-2">
                  <img
                    src={images[index]}
                    alt={card.alt}
                    className="h-auto w-full max-w-[160px] object-contain transition-transform duration-700 ease-out group-hover:scale-110 md:max-w-[220px]"
                  />
                </div>
                <div className="p-5 pt-2 md:p-6 md:pt-2">
                  <h4 className="mb-1.5 text-base font-black md:text-xl" style={{ color: card.titleColor }}>
                    {card.title}
                  </h4>
                  <p className="text-xs leading-relaxed md:text-sm" style={{ color: card.bodyColor }}>
                    {card.desc}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks({ copy, onPrimaryClick }: { copy: Copy; onPrimaryClick: () => void }) {
  return (
    <section id="howitworks" className="relative overflow-hidden bg-background py-24 lg:py-32">
      <div className="container relative z-10">
        <Reveal>
          <h2 className="mb-14 font-syne text-[clamp(36px,5vw,64px)] font-bold leading-[1] tracking-[-0.03em] text-foreground">
            {copy.how.title}
            {copy.how.accent ? (
              <>
                <br />
                <span className="italic text-p800">{copy.how.accent}</span>
              </>
            ) : null}
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          <div className="space-y-0">
            {copy.how.steps.map((step, index) => (
              <Reveal key={step.num}>
                <div className={`py-8 ${index < copy.how.steps.length - 1 ? "border-b border-border" : ""}`}>
                  <div className="flex items-start gap-5">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-charcoal text-sm font-black text-primary-foreground">
                      {step.num}
                    </div>
                    <div>
                      <h3 className="mb-2 font-syne text-xl font-bold text-foreground">{step.title}</h3>
                      <p className="max-w-[400px] text-sm leading-relaxed text-muted">{step.desc}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
            <div className="pt-6">
              <button
                type="button"
                onClick={onPrimaryClick}
                className="inline-flex items-center gap-2 rounded-full border-none bg-charcoal px-8 py-3.5 text-sm font-bold text-primary-foreground transition-all hover:-translate-y-1"
              >
                {copy.how.cta}
              </button>
            </div>
          </div>

          <Reveal type="reveal-right">
            <img src={dashboardMockup} alt={copy.how.dashboardAlt} className="h-auto w-full rounded-2xl shadow-t-lg" />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default function EarlyAccessPage() {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale() === "tr" ? "tr" : "en";
  const copy = EARLY_ACCESS_COPY[locale];
  const inputRef = useRef<HTMLInputElement>(null);
  const recaptchaRef = useRef<RecaptchaFieldHandle | null>(null);
  const [email, setEmail] = useState("");
  const [captchaResetNonce, setCaptchaResetNonce] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasTrackedEmailFocus, setHasTrackedEmailFocus] = useState(false);
  const [hasTrackedEmailStarted, setHasTrackedEmailStarted] = useState(false);
  const [hasTrackedWaitlistView, setHasTrackedWaitlistView] = useState(false);
  const isRootWaitlistRoute = pathname === `/${locale}`;
  const recaptchaEnabled =
    isClientRecaptchaEnabled() &&
    Boolean(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY);

  useEffect(() => {
    if (hasTrackedWaitlistView) return;

    trackAnalyticsEvent("waitlist_view", {
      locale,
      page: "waitlist",
    });
    setHasTrackedWaitlistView(true);
  }, [hasTrackedWaitlistView, locale]);

  const focusForm = (location: string) => {
    trackAnalyticsEvent("waitlist_cta_click", {
      locale,
      location,
    });
    setError("");
    inputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => inputRef.current?.focus(), 250);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);

    if (!hasTrackedEmailStarted && value.trim().length > 0) {
      trackAnalyticsEvent("waitlist_email_started", {
        locale,
        field: "email",
      });
      setHasTrackedEmailStarted(true);
    }
  };

  const handleEmailFocus = () => {
    if (hasTrackedEmailFocus) return;

    trackAnalyticsEvent("waitlist_email_focus", {
      locale,
      field: "email",
    });
    setHasTrackedEmailFocus(true);
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    setLoading(true);

    trackAnalyticsEvent("waitlist_signup_attempt", {
      locale,
      source: "early_access_landing",
    });

    try {
      let captchaToken: string | null = null;
      if (recaptchaEnabled) {
        captchaToken = await recaptchaRef.current?.executeAsync() ?? null;
        if (!captchaToken) {
          setError(
            locale === "en"
              ? "Please complete the reCAPTCHA check."
              : "Lütfen reCAPTCHA doğrulamasını tamamla.",
          );
          setLoading(false);
          return;
        }
      }

      const response = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          source: "early-access-landing",
          locale,
          captchaToken,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        trackAnalyticsEvent("waitlist_signup_error", {
          locale,
          source: "early_access_landing",
          error: data.error || "request_failed",
        });
        setError(data.error || copy.form.errorFallback);
        setCaptchaResetNonce((current) => current + 1);
        return;
      }

      trackAnalyticsEvent("waitlist_signup", {
        locale,
        source: "early_access_landing",
      });
      router.push(`/${locale}/waitlist/thank-you`);
    } catch {
      trackAnalyticsEvent("waitlist_signup_error", {
        locale,
        source: "early_access_landing",
        error: "network_error",
      });
      setError(copy.form.errorFallback);
      setCaptchaResetNonce((current) => current + 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="font-outfit">
      {isRootWaitlistRoute ? (
        <>
          <AnalyticsScripts clarityProjectId="w2uovepi9h" />
          <RoutePageViewTracker params={{ funnel: "waitlist" }} />
        </>
      ) : null}
      <SectionViewTracker eventName="waitlist_section_view" params={{ locale, section: "hero" }} targetId="hero-top" />
      <SectionViewTracker eventName="waitlist_section_view" params={{ locale, section: "overview" }} targetId="overview" />
      <SectionViewTracker eventName="waitlist_section_view" params={{ locale, section: "howitworks" }} targetId="howitworks" />
      <Navbar copy={copy} onPrimaryClick={() => focusForm("navbar")} />
      <Hero
        copy={copy}
        locale={locale}
        email={email}
        loading={loading}
        error={error}
        inputRef={inputRef}
        recaptchaResetNonce={captchaResetNonce}
        onEmailChange={handleEmailChange}
        onEmailFocus={handleEmailFocus}
        onSubmitCtaClick={() =>
          trackAnalyticsEvent("waitlist_cta_click", {
            locale,
            location: "hero_submit",
          })
        }
        onSubmit={handleSubmit}
        recaptchaRef={recaptchaRef}
      />
      <Problem copy={copy} />
      <HowItWorks copy={copy} onPrimaryClick={() => focusForm("how_it_works")} />
      <StickyCta label={copy.sticky} locale={locale} onClick={() => focusForm("sticky_cta")} />
      {isRootWaitlistRoute ? <AnalyticsConsentBanner /> : null}
    </div>
  );
}
