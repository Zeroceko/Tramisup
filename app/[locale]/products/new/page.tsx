"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WizardData = {
  // Pill 1: Ürünü Anlat
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  launchStatus: string;
  
  // Pill 2: Launch Hedefleri
  launchDate: string;
  launchGoals: string[];
  successMetric: string;
  
  // Pill 3: Metrics
  trackingMetrics: string[];
  hasDataSource: string;
  
  // Pill 4: Growth
  growthChannels: string[];
  businessModel: string;
  pricingStrategy: string;
  
  // Pill 5: Integrations
  currentTools: string[];
  wantedIntegrations: string[];
  
  // Pill 6: Team
  teamSize: string;
  userRole: string;
  
  // Pill 7: İlk Aksiyonlar
  wantsDemoData: string;
  firstTask: string;
  
  website: string;
};

const PILLS = [
  { id: 1, label: "Ürünü Anlat" },
  { id: 2, label: "Launch Hedefleri" },
  { id: 3, label: "Metrics & Tracking" },
  { id: 4, label: "Growth Yaklaşımı" },
  { id: 5, label: "Entegrasyonlar" },
  { id: 6, label: "Ekip" },
  { id: 7, label: "Hızlı Başlangıç" },
];

const CATEGORIES = ["SaaS", "E-commerce", "Marketplace", "Mobile App", "Content/Media", "Platform", "Diğer"];
const AUDIENCES = ["Developers", "KOBİ", "Tüketiciler", "Kurumsal", "Startup'lar", "Freelancer'lar", "Diğer"];
const LAUNCH_STATUSES = ["Fikir aşamasında", "Geliştirme aşamasında", "Beta'da", "Yakında launch", "Launch oldu", "Büyüme aşamasında"];

const LAUNCH_GOALS = [
  "İlk 100 kullanıcıya ulaş",
  "$1000 MRR'a ulaş",
  "İlk 10 paying customer",
  "Product-market fit kanıtla",
  "Beta feedback topla",
  "Viral loop kur",
];

const SUCCESS_METRICS = ["Kullanıcı sayısı", "MRR", "Activation rate", "Retention rate", "NPS", "Churn rate"];

const TRACKING_METRICS = ["DAU/MAU", "MRR/ARR", "Churn", "Activation", "Retention", "Conversion rate", "ARPU"];

const GROWTH_CHANNELS = [
  "Organic/SEO",
  "Paid ads",
  "Content marketing",
  "Social media",
  "Product Hunt",
  "Referral/Word of mouth",
  "Partnerships",
  "Cold outreach",
];

const BUSINESS_MODELS = ["Freemium", "Subscription", "One-time payment", "Usage-based", "Enterprise/Custom", "Marketplace fee"];

const PRICING_STRATEGIES = [
  "Free → Paid upsell",
  "Free trial → Subscription",
  "Direkt paid",
  "Contact sales",
  "Henüz karar vermedim",
];

const CURRENT_TOOLS = [
  "Google Analytics",
  "Mixpanel",
  "Amplitude",
  "Stripe",
  "Segment",
  "PostHog",
  "Custom analytics",
  "Henüz yok",
];

const WANTED_INTEGRATIONS = ["Stripe", "GA4", "Mixpanel", "Segment", "Amplitude", "PostHog"];

const TEAM_SIZES = ["Solo founder", "2-3 kişi", "4-10 kişi", "10+ kişi"];
const USER_ROLES = ["Founder/CEO", "Product Manager", "Developer", "Growth", "Marketing", "Diğer"];

type Question = {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox" | "url" | "date";
  label: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
};

const PILL_QUESTIONS: Record<number, Question[]> = {
  1: [
    { id: "name", type: "text", label: "Ürününüzün adı nedir?", placeholder: "Örn: Tiramisup", required: true },
    { id: "description", type: "textarea", label: "Hangi sorunu çözüyorsunuz?", placeholder: "Kısa açıklama (1-2 cümle)", required: true },
    { id: "category", type: "radio", label: "Hangi kategoriye giriyorsunuz?", options: CATEGORIES, required: true },
    { id: "targetAudience", type: "radio", label: "Ana hedef kitleniz kim?", options: AUDIENCES, required: true },
    { id: "launchStatus", type: "radio", label: "Şu an hangi aşamadasınız?", options: LAUNCH_STATUSES, required: true },
    { id: "website", type: "url", label: "Ürün siteniz var mı?", placeholder: "https://urunun.com" },
  ],
  2: [
    { id: "launchDate", type: "date", label: "Launch tarihiniz ne zaman?", description: "Yaklaşık bir tarih girin", required: true },
    { id: "launchGoals", type: "checkbox", label: "İlk 90 günde hangi hedeflere ulaşmak istiyorsunuz?", options: LAUNCH_GOALS },
    { id: "successMetric", type: "radio", label: "Başarıyı hangi metrikle ölçeceksiniz?", options: SUCCESS_METRICS, required: true },
  ],
  3: [
    { id: "trackingMetrics", type: "checkbox", label: "Hangi metrikleri takip etmek istiyorsunuz?", options: TRACKING_METRICS },
    { id: "hasDataSource", type: "radio", label: "Şu an veri kaynağınız var mı?", options: ["Evet, entegre edeceğim", "Hayır, manuel gireceğim", "Henüz bilmiyorum"], required: true },
  ],
  4: [
    { id: "growthChannels", type: "checkbox", label: "Hangi growth kanallarını kullanacaksınız?", description: "Öncelikli 2-3 kanal seçin", options: GROWTH_CHANNELS },
    { id: "businessModel", type: "radio", label: "İş modeliniz nedir?", options: BUSINESS_MODELS, required: true },
    { id: "pricingStrategy", type: "radio", label: "Pricing stratejiniz nedir?", options: PRICING_STRATEGIES, required: true },
  ],
  5: [
    { id: "currentTools", type: "checkbox", label: "Şu an hangi araçları kullanıyorsunuz?", options: CURRENT_TOOLS },
    { id: "wantedIntegrations", type: "checkbox", label: "Tiramisup ile bağlamak istediğiniz araçlar?", options: WANTED_INTEGRATIONS },
  ],
  6: [
    { id: "teamSize", type: "radio", label: "Ekip büyüklüğünüz nedir?", options: TEAM_SIZES, required: true },
    { id: "userRole", type: "radio", label: "Sizin rolünüz nedir?", options: USER_ROLES, required: true },
  ],
  7: [
    { id: "wantsDemoData", type: "radio", label: "Demo veri ile başlamak ister misiniz?", description: "Hemen ürünü keşfetmenize yardımcı olur", options: ["Evet, demo veri yükle", "Hayır, temiz başlayayım"], required: true },
    { id: "firstTask", type: "text", label: "İlk göreviniz ne olsun?", placeholder: "Örn: Landing page tasarımı tamamla" },
  ],
};

function OptionButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[20px] border px-5 py-4 text-left text-[14px] font-medium transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#111111]"
          : "border-[#ececec] bg-[#fafafa] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
      }`}
    >
      {children}
    </button>
  );
}

function CheckButton({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[20px] border px-5 py-4 text-left text-[14px] font-medium transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#111111]"
          : "border-[#ececec] bg-[#fafafa] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
      }`}
    >
      {children}
    </button>
  );
}

function StepPills({ currentPill, onPillClick }: { currentPill: number; onPillClick: (pill: number) => void }) {
  return (
    <div className="mb-10 flex flex-wrap gap-3">
      {PILLS.map((pill) => {
        const isActive = currentPill === pill.id;
        const isCompleted = pill.id < currentPill;
        const isFuture = pill.id > currentPill;

        return (
          <button
            key={pill.id}
            type="button"
            onClick={() => !isFuture && onPillClick(pill.id)}
            disabled={isFuture}
            className={`rounded-full px-5 py-2.5 text-[12px] font-medium transition ${
              isActive
                ? "bg-[#95dbda] text-[#111111] shadow-[0_6px_18px_rgba(149,219,218,0.28)]"
                : isCompleted
                  ? "bg-[#d0d0d0] text-white hover:bg-[#bdbdbd] cursor-pointer"
                  : "bg-[#d0d0d0] text-white/95 cursor-not-allowed"
            }`}
          >
            {pill.label}
          </button>
        );
      })}
    </div>
  );
}

export default function NewProductWizard() {
  const router = useRouter();
  const [currentPill, setCurrentPill] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({
    launchGoals: [],
    trackingMetrics: [],
    growthChannels: [],
    currentTools: [],
    wantedIntegrations: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pillQuestions = PILL_QUESTIONS[currentPill] || [];
  const currentQuestion = pillQuestions[questionIndex];
  const isLastQuestionInPill = questionIndex === pillQuestions.length - 1;
  const isLastPill = currentPill === PILLS.length;

  const getValue = (id: string): any => {
    return (data as any)[id] || (currentQuestion?.type === "checkbox" ? [] : "");
  };

  const setValue = (id: string, value: any) => {
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const canProceed = () => {
    if (!currentQuestion) return true;
    if (!currentQuestion.required) return true;
    const val = getValue(currentQuestion.id);
    if (currentQuestion.type === "checkbox") return true;
    return val && val.toString().trim() !== "";
  };

  const handleNext = () => {
    if (!canProceed()) {
      setError("Bu alanı doldurmak gerekiyor.");
      return;
    }
    setError("");

    if (isLastQuestionInPill) {
      if (isLastPill) {
        handleSubmit();
      } else {
        setCurrentPill((p) => p + 1);
        setQuestionIndex(0);
      }
    } else {
      setQuestionIndex((i) => i + 1);
    }
  };

  const handleBack = () => {
    setError("");
    if (questionIndex > 0) {
      setQuestionIndex((i) => i - 1);
    } else if (currentPill > 1) {
      const prevPill = currentPill - 1;
      const prevQuestions = PILL_QUESTIONS[prevPill] || [];
      setCurrentPill(prevPill);
      setQuestionIndex(Math.max(0, prevQuestions.length - 1));
    }
  };

  const goToPill = (targetPill: number) => {
    if (targetPill <= currentPill) {
      setError("");
      setCurrentPill(targetPill);
      setQuestionIndex(0);
    }
  };

  const toggleArrayValue = (key: string, value: string) => {
    const current = getValue(key) as string[];
    setValue(key, current.includes(value) ? current.filter((v) => v !== value) : [...current, value]);
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const seedData = data.wantsDemoData === "Evet, demo veri yükle";

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          targetAudience: data.targetAudience,
          businessModel: data.businessModel,
          website: data.website,
          launchGoals: JSON.stringify(data.launchGoals),
          seedData,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ürün oluşturulamadı");
      }

      const product = await res.json();
      document.cookie = `activeProductId=${product.id}; path=/`;
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  };

  let totalQuestions = 0;
  let completedQuestions = 0;
  for (let i = 1; i <= PILLS.length; i++) {
    const qs = PILL_QUESTIONS[i] || [];
    totalQuestions += qs.length;
    if (i < currentPill) {
      completedQuestions += qs.length;
    } else if (i === currentPill) {
      completedQuestions += questionIndex;
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between px-1">
          <Link href="/dashboard" className="inline-flex items-center gap-1 text-[13px] text-[#666d80] transition hover:text-[#111111]">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Geri dön
          </Link>
          <span className="text-[12px] font-medium text-[#666d80]">
            {completedQuestions + 1} / {totalQuestions}
          </span>
        </div>

        <div className="rounded-[28px] border border-[#ededed] bg-white px-6 py-6 shadow-card md:px-10 md:py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111111]">Yeni Ürün Oluştur</h1>
            <Link
              href="/dashboard"
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[20px] leading-none text-[#666d80] transition hover:border-[#d8d8d8] hover:text-[#111111]"
            >
              ×
            </Link>
          </div>

          <StepPills currentPill={currentPill} onPillClick={goToPill} />

          {error ? <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">{error}</div> : null}

          {currentQuestion ? (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="text-center">
                <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#111111] md:text-[36px]">{currentQuestion.label}</h2>
                {currentQuestion.description ? <p className="mt-2 text-[14px] text-[#6b7280]">{currentQuestion.description}</p> : null}
              </div>

              <div className="space-y-3">
                {currentQuestion.type === "text" ? (
                  <input
                    autoFocus
                    type="text"
                    value={getValue(currentQuestion.id) || ""}
                    onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder={currentQuestion.placeholder}
                    className="w-full rounded-[18px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={getValue(currentQuestion.id) || ""}
                    onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full rounded-[22px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition resize-none focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.type === "url" ? (
                  <input
                    type="url"
                    value={getValue(currentQuestion.id) || ""}
                    onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                    placeholder={currentQuestion.placeholder}
                    className="w-full rounded-[18px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.type === "date" ? (
                  <input
                    type="date"
                    value={getValue(currentQuestion.id) || ""}
                    onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                    className="w-full rounded-[18px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] outline-none transition focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.type === "radio" && currentQuestion.options
                  ? currentQuestion.options.map((option) => (
                      <OptionButton
                        key={option}
                        selected={getValue(currentQuestion.id) === option}
                        onClick={() => setValue(currentQuestion.id, option)}
                      >
                        {option}
                      </OptionButton>
                    ))
                  : null}

                {currentQuestion.type === "checkbox" && currentQuestion.options
                  ? currentQuestion.options.map((option) => (
                      <CheckButton
                        key={option}
                        selected={(getValue(currentQuestion.id) || []).includes(option)}
                        onClick={() => toggleArrayValue(currentQuestion.id, option)}
                      >
                        {option}
                      </CheckButton>
                    ))
                  : null}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3 md:justify-end">
            {currentPill > 1 || questionIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="h-11 rounded-full border border-[#ececec] px-5 text-[13px] font-medium text-[#666d80] transition hover:bg-[#fafafa] disabled:opacity-50"
              >
                Geri
              </button>
            ) : null}

            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed() || loading}
              className={`min-w-[170px] rounded-full px-6 py-3 text-[14px] font-semibold transition ${
                canProceed() && !loading ? "bg-[#ffd7ef] text-[#111111] hover:bg-[#f7c8e2]" : "bg-[#f1f1f1] text-[#a0a0a0] cursor-not-allowed"
              }`}
            >
              {isLastPill && isLastQuestionInPill ? (loading ? "Oluşturuluyor…" : "Ürünü Oluştur") : "Devam Et"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
