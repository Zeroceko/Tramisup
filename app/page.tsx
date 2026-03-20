import Link from "next/link";

/* ── Mini bar chart (dekoratif) ─────────────────────────── */
const bars = [8, 14, 10, 20, 16, 20, 14, 20, 18, 20, 12, 8, 20, 16, 8, 20, 14, 20, 16, 20];

function MiniBar({ heights, color = "pink" }: { heights: number[]; color?: "pink" | "teal" }) {
  const bg = color === "pink" ? "#ffd7ef" : "#95dbda";
  return (
    <div className="flex items-end gap-[3px]">
      {heights.map((h, i) => (
        <div key={i} style={{ width: 4, height: h, borderRadius: 4, background: bg }} />
      ))}
    </div>
  );
}

/* ── Stat Card ───────────────────────────────────────────── */
function StatCard({
  count,
  label,
  chartColor = "pink",
}: {
  count: string;
  label: string;
  chartColor?: "pink" | "teal";
}) {
  return (
    <div className="card p-[20px_22px] flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[42px] font-bold leading-none text-black">{count}</p>
        </div>
        <div className="w-9 h-9 rounded-full bg-[#f6f6f6] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M4 16L16 4M16 4H8M16 4V12" stroke="#666d80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <MiniBar heights={bars.slice(0, 14)} color={chartColor} />
      <p className="text-[16px] font-normal text-[#666d80]">{label}</p>
    </div>
  );
}

/* ── Feature Card ─────────────────────────────────────────── */
function FeatureCard({
  icon,
  title,
  desc,
  accent,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  accent?: string;
}) {
  return (
    <div className="card p-6 flex flex-col gap-4">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: accent ?? "#ffd7ef" }}
      >
        {icon}
      </div>
      <div>
        <p className="font-semibold text-[17px] text-[#0d0d12]">{title}</p>
        <p className="mt-1.5 text-[14px] leading-6 text-[#666d80]">{desc}</p>
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────── */
export default function Home() {
  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      {/* NAV */}
      <header className="flex items-center justify-between px-6 py-5 max-w-[1200px] mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-[#fee74e] flex items-center justify-center overflow-hidden">
            <span className="font-outfit font-semibold text-[15px] text-[#2e2e2e]">T</span>
          </div>
          <span className="font-outfit font-medium text-[18px] text-[#2e2e2e] tracking-[-0.01em]">Tiramisup</span>
        </div>

        {/* Nav pill */}
        <nav className="nav-pill hidden md:flex">
          <a href="#features" className="nav-pill-item active">Overview</a>
          <a href="#how" className="nav-pill-item">Nasıl çalışır</a>
          <a href="#pricing" className="nav-pill-item">Fiyatlar</a>
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden sm:inline-flex items-center px-4 h-9 rounded-full text-[13px] font-medium text-[#0d0d12] hover:bg-white transition"
          >
            Giriş yap
          </Link>
          <Link
            href="/signup"
            className="inline-flex items-center px-4 h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
          >
            Ücretsiz başla
          </Link>
        </div>
      </header>

      {/* HERO */}
      <main className="max-w-[1200px] mx-auto px-6 pt-8 pb-20">
        <section className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 mb-6 px-3 py-1.5 rounded-full bg-white border border-[#e8e8e8] text-[12px] font-medium text-[#666d80]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#95dbda] inline-block" />
            Launchtan büyümeye — tek platform
          </div>
          <h1 className="text-[52px] sm:text-[64px] font-bold text-black leading-[1.05] tracking-[-0.03em] max-w-[700px] mx-auto">
            Ürünün laucha ne kadar hazır?
          </h1>
          <p className="mt-5 text-[18px] text-[#5b5a64] max-w-[520px] mx-auto leading-[1.7]">
            Tiramisup; launch checklist, canlı metrikler, büyüme rutinleri ve entegrasyon planlamasını tek bir operasyon katmanında toplar.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-6 h-11 rounded-full bg-black text-white text-[14px] font-semibold hover:bg-[#1a1a1a] transition"
            >
              Çalışma alanı oluştur
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2.5 7h9M7.5 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center px-6 h-11 rounded-full bg-white text-[14px] font-medium text-[#0d0d12] border border-[#e8e8e8] hover:border-[#d0d0d0] transition"
            >
              Var olan hesap
            </Link>
          </div>
          <p className="mt-3 text-[13px] text-[#666d80]">Kredi kartı gerekmez · Manuel metriklerle başla</p>
        </section>

        {/* STAT CARDS — dashboard preview */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3" id="features">
          <StatCard count="234" label="Launch hazırlık görevi" chartColor="pink" />
          <StatCard count="82%" label="Checklist tamamlanma" chartColor="teal" />
          <StatCard count="$12.4k" label="Aylık tekrarlayan gelir" chartColor="pink" />
          <StatCard count="6" label="Aktif büyüme rutini" chartColor="teal" />
        </section>

        {/* DASHBOARD MOCKUP */}
        <section className="card p-6 mb-3">
          <div className="flex items-center justify-between mb-5">
            <div>
              <p className="text-[22px] font-normal text-[#5b5a64]">Ürünün laucha ne kadar hazır?</p>
              <p className="text-[32px] font-bold text-black leading-tight">Bu hafta özet 👋</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="tag-pink">Genel bakış</div>
              <div className="tag-green">
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M2 6L6 2M6 2H3.5M6 2V4.5" stroke="#0d0d12" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Canlı
              </div>
            </div>
          </div>

          {/* inner grid */}
          <div className="grid md:grid-cols-3 gap-3">
            {/* Task Statistics */}
            <div className="bg-[#f6f6f6] rounded-[12px] p-4">
              <p className="section-title mb-1">Görev İstatistikleri</p>
              <p className="text-[12px] text-[#666d80]">Toplam Görev</p>
              <div className="flex items-end justify-between mt-2">
                <p className="text-[32px] font-bold text-black leading-none">506</p>
                <div className="tag-green">▲ 4.3%</div>
              </div>
              <div className="mt-3 flex items-end gap-[3px]">
                {[...Array(32)].map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 4,
                      height: i < 28 ? 16 : 25,
                      borderRadius: 4,
                      background: i < 28 ? "#ffd7ef" : "#8cb4b9",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Meeting Note */}
            <div className="bg-[#000000] rounded-[12px] p-5 text-white">
              <p className="section-title text-white mb-3">Toplantı Notu</p>
              <p className="text-[18px] font-medium leading-snug">Arc Company ile Toplantı</p>
              <p className="mt-2 text-[13px] text-white/60">Saat: 14.00 - 16.00</p>
              <div className="mt-4">
                <div className="inline-flex items-center px-4 h-10 rounded-full bg-[#ffd7ef] text-[13px] font-medium text-black">
                  Detayları gör →
                </div>
              </div>
            </div>

            {/* AI assist */}
            <div className="bg-[#f6f6f6] rounded-[12px] p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="section-title">AI PlanIQ</p>
                <div className="inline-flex items-center gap-1 bg-white rounded px-2 py-1 text-[11px] text-[#666d80]">
                  Asistan ▾
                </div>
              </div>
              <p className="text-[13px] text-[#0d0d12] font-medium">Günaydın 👋</p>
              <p className="text-[12px] text-[#666d80] mt-1">Bugün size nasıl yardımcı olabilirim?</p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {["Metrikler", "Launch plan", "Büyüme"].map((t) => (
                  <span key={t} className="bg-white rounded-[4px] px-2 py-1 text-[11px] text-[#666d80]">{t}</span>
                ))}
              </div>
              <div className="mt-4 grid grid-cols-3 gap-1.5">
                {["Takım Performansı", "Proje Verimliliği", "Görev Özeti"].map((t) => (
                  <div key={t} className="bg-white rounded-lg p-2 text-[10px] text-[#666d80] leading-tight">{t}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="grid md:grid-cols-3 gap-3 mb-16" id="how">
          <FeatureCard
            accent="#ffd7ef"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3 5-5M20 12a8 8 0 11-16 0 8 8 0 0116 0z" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            title="Launch Hazırlığı"
            desc="Ürün, hukuki, pazarlama ve teknik launch çalışmalarını tek bir yüzeyde takip et."
          />
          <FeatureCard
            accent="#95dbda"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M3 12h4l3-8 4 16 3-8h4" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            title="Metrik Ritmi"
            desc="DAU, MRR, retention ve aktivasyonu haftalık karar alma ritmiyle birlikte yakala."
          />
          <FeatureCard
            accent="#fee74e"
            icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            title="Büyüme Motoru"
            desc="Hedefleri, rutinleri ve entegrasyonları birbirine bağla — launch sonrası kaosda bile çalış."
          />
        </section>

        {/* CTA */}
        <section className="card p-12 text-center" id="pricing">
          <p className="text-[36px] font-bold text-black leading-tight tracking-[-0.02em]">
            Bugün başlamak için<br />bir neden var.
          </p>
          <p className="mt-4 text-[16px] text-[#666d80] max-w-[380px] mx-auto leading-relaxed">
            Manuel metriklerle ücretsiz başla. İstediğinde entegrasyonları ekle.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-7 h-12 rounded-full bg-[#ffd7ef] text-[15px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
            >
              Ücretsiz çalışma alanı aç
            </Link>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-[#e8e8e8] py-8 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#fee74e] flex items-center justify-center">
              <span className="font-outfit font-semibold text-[11px] text-[#2e2e2e]">T</span>
            </div>
            <span className="font-outfit font-medium text-[14px] text-[#2e2e2e]">Tiramisup</span>
          </div>
          <p className="text-[13px] text-[#666d80]">© 2025 Tiramisup. Tüm hakları saklıdır.</p>
        </div>
      </footer>
    </div>
  );
}
