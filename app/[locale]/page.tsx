"use client";

import Link from "next/link";
import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import WaitlistModal from "@/components/WaitlistModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#e8e8e8] bg-white px-3 py-1.5 text-[12px] font-medium text-[#666d80]">
      <span className="h-1.5 w-1.5 rounded-full bg-[#95dbda]" />
      {children}
    </span>
  );
}

function MetricCard({ value, label, note }: { value: string; label: string; note: string }) {
  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-5 shadow-sm">
      <p className="text-[34px] font-bold tracking-[-0.03em] text-[#0d0d12]">{value}</p>
      <p className="mt-2 text-[14px] font-medium text-[#0d0d12]">{label}</p>
      <p className="mt-1 text-[13px] leading-6 text-[#666d80]">{note}</p>
    </div>
  );
}

function FeatureCard({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[24px] border border-[#e8e8e8] bg-white p-6 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{eyebrow}</p>
      <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">{title}</h3>
      <p className="mt-3 text-[14px] leading-7 text-[#666d80]">{desc}</p>
    </div>
  );
}

function WorkflowStep({
  index,
  title,
  desc,
}: {
  index: string;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#f0fafa] text-[14px] font-semibold text-[#0d0d12]">
          {index}
        </div>
        <div>
          <h4 className="text-[17px] font-semibold text-[#0d0d12]">{title}</h4>
          <p className="mt-2 text-[14px] leading-7 text-[#666d80]">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [waitlistOpen, setWaitlistOpen] = useState(false);
  const t = useTranslations();
  const locale = useLocale();

  return (
    <div className="min-h-screen bg-[#f6f6f6] text-[#0d0d12]">
      <header className="mx-auto flex w-full max-w-[1200px] items-center justify-between px-6 py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fee74e]">
            <span className="font-outfit text-[15px] font-semibold text-[#2e2e2e]">T</span>
          </div>
          <div>
            <span className="font-outfit text-[18px] font-medium tracking-[-0.01em] text-[#2e2e2e]">Tiramisup</span>
            <p className="text-[10px] uppercase tracking-[0.22em] text-[#9ca3af]">Launch to growth</p>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-1 rounded-full border border-[#e8e8e8] bg-white p-1 shadow-sm">
          <a href="#problem" className="rounded-full px-4 py-2 text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6]">Problem</a>
          <a href="#system" className="rounded-full px-4 py-2 text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6]">System</a>
          <a href="#flow" className="rounded-full px-4 py-2 text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6]">Flow</a>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link
            href={`/${locale}/login`}
            className="hidden sm:inline-flex h-9 items-center rounded-full px-4 text-[13px] font-medium text-[#0d0d12] hover:bg-white transition"
          >
            {t("nav.login")}
          </Link>
          <button
            onClick={() => setWaitlistOpen(true)}
            className="inline-flex h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {t("nav.signupFree")}
          </button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[1200px] px-6 pb-24 pt-8">
        <section className="grid items-center gap-8 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <SectionLabel>{t("hero.badge")}</SectionLabel>
            <h1 className="mt-6 max-w-[720px] text-[48px] font-bold leading-[1.02] tracking-[-0.04em] text-[#0d0d12] sm:text-[66px]">
              Launch sonrası kaosu,
              <br />
              çalıştırılabilir bir sisteme çevir.
            </h1>
            <p className="mt-6 max-w-[620px] text-[18px] leading-8 text-[#5b5a64]">
              Tiramisup; launch checklist, görevler, metrikler, growth ritüelleri ve entegrasyon kararlarını tek bir product workspace içinde toplar. Spreadsheet, Notion ve dağınık dashboard geçişlerini azaltır.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <button
                onClick={() => setWaitlistOpen(true)}
                className="inline-flex h-12 items-center gap-2 rounded-full bg-black px-6 text-[14px] font-semibold text-white transition hover:bg-[#1a1a1a]"
              >
                {t("hero.createWorkspace")}
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <Link
                href={`/${locale}/login`}
                className="inline-flex h-12 items-center rounded-full border border-[#e8e8e8] bg-white px-6 text-[14px] font-medium text-[#0d0d12] transition hover:border-[#d0d0d0]"
              >
                {t("hero.existingAccount")}
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap gap-2 text-[12px] text-[#666d80]">
              <span className="rounded-full border border-[#e8e8e8] bg-white px-3 py-1.5">Waitlist + early access</span>
              <span className="rounded-full border border-[#e8e8e8] bg-white px-3 py-1.5">TR / EN</span>
              <span className="rounded-full border border-[#e8e8e8] bg-white px-3 py-1.5">No fake onboarding data</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-[#e8e8e8] bg-[#0d0d12] p-6 text-white shadow-card">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Weekly operating view</p>
                <p className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">Founder cockpit</p>
              </div>
              <span className="rounded-full bg-[#ffd7ef] px-3 py-1 text-[11px] font-semibold text-[#0d0d12]">Live MVP</span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="text-[12px] text-white/50">Launch readiness</p>
                <p className="mt-2 text-[32px] font-bold">82%</p>
                <p className="mt-2 text-[13px] leading-6 text-white/65">Checklist ilerlemesi, blocker görünürlüğü ve task linkage tek yüzeyde.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4">
                <p className="text-[12px] text-white/50">Metric rhythm</p>
                <p className="mt-2 text-[32px] font-bold">Daily</p>
                <p className="mt-2 text-[13px] leading-6 text-white/65">MRR, activation ve operasyonel metrikler için tek karar yüzeyi.</p>
              </div>
              <div className="rounded-[18px] border border-white/10 bg-white/5 p-4 sm:col-span-2">
                <p className="text-[12px] text-white/50">Why teams adopt it</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-3">
                  <div className="rounded-[14px] bg-black/30 p-3 text-[13px] text-white/80">Checklist → task dönüşümü</div>
                  <div className="rounded-[14px] bg-black/30 p-3 text-[13px] text-white/80">Boş dashboard yerine yönlendiren onboarding</div>
                  <div className="rounded-[14px] bg-black/30 p-3 text-[13px] text-white/80">Ürün bazlı çalışma context&apos;i</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="problem" className="mt-20 grid gap-4 md:grid-cols-3">
          <FeatureCard eyebrow="Problem" title="Launch sırasında ekip nerede olduğunu kaybediyor" desc="Checklist başka yerde, görevler başka yerde, metrikler başka yerde kalınca ekip karar vermek yerine context taşımaya başlıyor." />
          <FeatureCard eyebrow="Approach" title="Tek bir çalışma yüzeyinde operasyonel ritim" desc="Tiramisup, launch readiness ile growth execution arasındaki orta katmanı sahiplenir. Yani yapılacak iş ile görülecek sinyal aynı yerde yaşar." />
          <FeatureCard eyebrow="Outcome" title="Daha az dağınıklık, daha net sonraki adım" desc="İlk kullanıcı deneyimi güvenli empty state ile başlar; ürün oluşturulduğunda yüzeyler anlamlı hale gelir. Sahte başarı hissi üretmez." />
        </section>

        <section className="mt-20 grid gap-4 md:grid-cols-4" id="system">
          <MetricCard value="Waitlist" label="Lead capture" note="Landing CTA doğrudan bekleme listesine ya da erken erişim yoluna gider." />
          <MetricCard value="Code" label="Early access" note="Onaylı kullanıcılar kod ile direkt signup akışına girer." />
          <MetricCard value="Empty" label="Safe first run" note="Kullanıcının ürünü yoksa fake dashboard yerine gerçek başlangıç yönlendirmesi görür." />
          <MetricCard value="Wizard" label="Product setup" note="İlk ürün wizard üzerinden tanımlanır, context ürün bazlı oturur." />
        </section>

        <section id="flow" className="mt-20">
          <div className="max-w-[760px]">
            <SectionLabel>Onboarding flow</SectionLabel>
            <h2 className="mt-5 text-[42px] font-bold tracking-[-0.03em] text-[#0d0d12]">İlk 5 dakikada ne olur?</h2>
            <p className="mt-4 text-[16px] leading-8 text-[#666d80]">
              Bu landing sayfasının görevi sadece güzel görünmek değil; kullanıcının bir sonraki adıma güvenle geçmesini sağlamak. Akış bu yüzden olabildiğince açık ve düşük sürtünmeli tutuldu.
            </p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <WorkflowStep index="01" title="Lead capture veya early access seçimi" desc="Start free CTA waitlist modal açar. Kodu olan kullanıcı signup'a gider, olmayan kullanıcı waitlist'e katılır." />
            <WorkflowStep index="02" title="Kodlu kayıt" desc="Erken erişim kodu ile kullanıcı hesabını açar. Signup artık otomatik fake product seed etmez." />
            <WorkflowStep index="03" title="Temiz dashboard" desc="Kullanıcının ürünü yoksa dashboard kırık kartlar ya da fake veri göstermez; ilk ürününü oluştur CTA'sı verir." />
            <WorkflowStep index="04" title="Gerçek ürün context'i" desc="Wizard tamamlandığında ürün oluşturulur ve iç yüzeyler ürün bazlı çalışmaya başlar." />
          </div>
        </section>

        <section className="mt-20 rounded-[30px] border border-[#e8e8e8] bg-white p-10 text-center shadow-sm">
          <SectionLabel>Current release</SectionLabel>
          <h2 className="mt-5 text-[40px] font-bold tracking-[-0.03em] text-[#0d0d12]">Launch-to-growth için sade ama çalışan bir MVP.</h2>
          <p className="mx-auto mt-4 max-w-[650px] text-[16px] leading-8 text-[#666d80]">
            Eğer şu an aradığın şey, launch sonrası neye bakacağını ve ne yapacağını bir arada tutan sade bir operating layer ise, Tiramisup o alanı sahipleniyor.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setWaitlistOpen(true)}
              className="inline-flex h-12 items-center rounded-full bg-[#ffd7ef] px-7 text-[15px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {t("cta.openWorkspace")}
            </button>
            <Link
              href={`/${locale}/login`}
              className="inline-flex h-12 items-center rounded-full border border-[#e8e8e8] px-7 text-[15px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6]"
            >
              {t("nav.login")}
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e8e8e8] px-6 py-8">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#fee74e]">
              <span className="font-outfit text-[11px] font-semibold text-[#2e2e2e]">T</span>
            </div>
            <span className="font-outfit text-[14px] font-medium text-[#2e2e2e]">Tiramisup</span>
          </div>
          <p className="text-[13px] text-[#666d80]">{t("footer.rights")}</p>
        </div>
      </footer>

      <WaitlistModal open={waitlistOpen} onClose={() => setWaitlistOpen(false)} />
    </div>
  );
}
