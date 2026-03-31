"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";
import { Link2, Paperclip, Plus, Sparkles, X } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type FunnelStageKey =
  | "Awareness"
  | "Acquisition"
  | "Activation"
  | "Retention"
  | "Referral"
  | "Revenue";

type StepId =
  | "name"
  | "description"
  | "category"
  | "platform"
  | "audience"
  | "business"
  | "stage"
  | "goal"
  | "timing"
  | "sources"
  | "metrics";

type WizardData = {
  name: string;
  description: string;
  website: string;
  categories: string[];
  categoryOther: string;
  platforms: string[];
  targetAudiences: string[];
  targetAudienceOther: string;
  launchStatus: string;
  timingOption: string;
  businessModels: string[];
  businessModelOther: string;
  growthGoal: string;
  goalKey: string;
  intendedSources: string[];
};

const CONNECTABLE_ONBOARDING_SOURCES = ["GA4", "Stripe"] as const;
const OTHER_OPTION_VALUE = "Diğer";

// ─── Option data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "SaaS", label: "SaaS", sub: "Web tabanlı yazılım servisi" },
  { value: "Mobil uygulama", label: "Mobil Uygulama", sub: "iOS veya Android" },
  { value: "E-ticaret", label: "E-ticaret", sub: "Ürün veya servis satışı" },
  { value: "Marketplace", label: "Marketplace", sub: "Alıcı-satıcı platformu" },
  { value: "İçerik/Medya", label: "İçerik / Medya", sub: "Newsletter, blog, podcast" },
  { value: "Platform", label: "Platform / Araç", sub: "Geliştirici araçları, API" },
  { value: "AI Product", label: "AI Product", sub: "LLM, agent veya AI destekli ürün" },
  { value: "Diğer", label: "Diğer", sub: "Başka bir şey" },
];

const STAGES = [
  { value: "Fikir aşamasında", label: "Fikir aşamasındayım", sub: "Problemi ve çözümü netleştiriyorum" },
  { value: "Geliştirme aşamasında", label: "Geliştiriyorum", sub: "Henüz kullanıcı yok" },
  {
    value: "Test kullanıcıları var",
    label: "Test kullanıcılarım var",
    sub: "Kapalı beta devam ediyor",
  },
  {
    value: "Yakında yayında",
    label: "Launch hazırlığındayım",
    sub: "Yakında yayına çıkıyorum",
  },
  { value: "Yayında", label: "Yayındayım", sub: "Gerçek kullanıcılarım var" },
  {
    value: "Büyüme aşamasında",
    label: "Büyüme aşamasındayım",
    sub: "Ölçeklendirmeye odaklanıyorum",
  },
];

const TIMING_OPTIONS = [
  { value: "2 hafta içinde", label: "2 hafta içinde", sub: "Sprint modundayım" },
  { value: "1-3 ay", label: "1–3 ay içinde", sub: "Hazırlıklar devam ediyor" },
  { value: "3-6 ay", label: "3–6 ay içinde", sub: "Erken aşama, zamanım var" },
  { value: "Belirsiz", label: "Henüz bilmiyorum", sub: "Hazır olunca çıkarım" },
];

const BUSINESS_MODELS = [
  { value: "Abonelik", label: "Abonelik", sub: "Aylık / yıllık ödeme" },
  { value: "Freemium", label: "Freemium + ücretli plan", sub: "Ücretsiz giriş + yükseltme" },
  { value: "Tek seferlik ödeme", label: "Tek seferlik satış", sub: "Bir kez satın al" },
  { value: "Kullanıma göre ödeme", label: "Kullanım bazlı", sub: "Pay-per-use" },
  { value: "Kurumsal/özel teklif", label: "Kurumsal / B2B", sub: "Sales-led, özel fiyat" },
  { value: "Marketplace komisyonu", label: "Marketplace komisyonu", sub: "İşlem başına % al" },
  { value: "Reklam", label: "Reklam", sub: "Reklam veya sponsorluk geliri" },
  { value: "Henüz monetize etmedim", label: "Henüz gelir yok", sub: "Önce kullanıcı, sonra para" },
  { value: "Diğer", label: "Diğer", sub: "Farklı bir gelir modeli" },
];

const PLATFORMS = [
  { value: "Web", label: "Web", sub: "Tarayıcı tabanlı uygulama" },
  { value: "iOS", label: "iOS", sub: "Apple App Store" },
  { value: "Android", label: "Android", sub: "Google Play Store" },
  { value: "Desktop", label: "Desktop", sub: "Windows, macOS, Linux" },
  { value: "API", label: "API / Backend", sub: "Geliştirici servisi" },
  { value: "Multi-platform", label: "Multi-platform", sub: "Birden fazla platform" },
];

const AUDIENCES = [
  { value: "Tüketiciler", label: "Tüketiciler", sub: "B2C bireysel kullanıcılar" },
  { value: "Freelancerlar", label: "Freelancerlar", sub: "Bağımsız çalışanlar" },
  { value: "Geliştiriciler", label: "Geliştiriciler", sub: "Yazılımcılar ve teknik ekipler" },
  { value: "Startup ekipleri", label: "Startup ekipleri", sub: "Erken aşama takımlar" },
  { value: "KOBİ'ler", label: "KOBİ'ler", sub: "Küçük ve orta ölçekli işletmeler" },
  { value: "Kurumsal ekipler", label: "Kurumsal ekipler", sub: "Enterprise organizasyonlar" },
  { value: "İç ekipler", label: "İç ekipler / Operasyon", sub: "Şirket içi kullanım" },
  { value: "İçerik üreticileri", label: "İçerik üreticileri", sub: "Kreator ve influencerlar" },
  { value: "Eğitim", label: "Eğitim", sub: "Öğrenci ve eğitimciler" },
  { value: "Diğer", label: "Diğer", sub: "Başka bir kitle" },
];

const GROWTH_GOALS = [
  {
    value: "İlk kullanıcıları kazanmak",
    key: "get_first_users",
    label: "İlk kullanıcıları kazanmak",
    sub: "Sıfırdan trafik oluştur",
  },
  {
    value: "Ürünü doğrulamak",
    key: "validate_product",
    label: "Ürünü doğrulamak",
    sub: "Kullanıcılar gerçekten kullanıyor mu?",
  },
  {
    value: "İlk tekrar kullanımı sağlamak",
    key: "reach_first_value_usage",
    label: "İlk tekrar kullanımı sağlamak",
    sub: "Kullanıcılar geri dönsün",
  },
  {
    value: "İlk ödeme yapan müşteriyi bulmak",
    key: "get_first_revenue",
    label: "İlk ödeme yapan müşteriyi bulmak",
    sub: "Revenue hemen doğrulansın",
  },
  {
    value: "Büyüme ritmi kurmak",
    key: "build_growth_rhythm",
    label: "Büyüme ritmi kurmak",
    sub: "Haftalık döngüyü oturt",
  },
];

const SOURCES = [
  { value: "GA4", label: "Google Analytics 4", sub: "Web trafiği ve dönüşüm" },
  { value: "Stripe", label: "Stripe", sub: "Ödeme ve abonelik" },
  { value: "App Store Connect", label: "App Store Connect", sub: "iOS gelir ve indir" },
  { value: "Google Play", label: "Google Play Console", sub: "Android istatistikleri" },
  { value: "RevenueCat", label: "RevenueCat", sub: "Mobil abonelik takibi" },
];

const STAGE_ORDER: FunnelStageKey[] = [
  "Awareness",
  "Acquisition",
  "Activation",
  "Retention",
  "Referral",
  "Revenue",
];

const STAGE_COLORS: Record<FunnelStageKey, string> = {
  Awareness: "bg-blue-50 text-blue-700 border-blue-100",
  Acquisition: "bg-violet-50 text-violet-700 border-violet-100",
  Activation: "bg-pink-50 text-pink-700 border-pink-100",
  Retention: "bg-amber-50 text-amber-700 border-amber-100",
  Referral: "bg-green-50 text-green-700 border-green-100",
  Revenue: "bg-teal-50 text-teal-700 border-teal-100",
};

const STEP_META: Record<
  StepId,
  { eyebrow: string; title: string }
> = {
  name: { eyebrow: "Temel", title: "Urun kimligi" },
  description: { eyebrow: "Temel", title: "Urun anlatimi" },
  category: { eyebrow: "Kurgu", title: "Kategori secimi" },
  platform: { eyebrow: "Kurgu", title: "Platformlar" },
  audience: { eyebrow: "Model", title: "Hedef kitle" },
  business: { eyebrow: "Model", title: "Gelir modeli" },
  stage: { eyebrow: "Durum", title: "Asama secimi" },
  goal: { eyebrow: "Odak", title: "Buyume onceligi" },
  timing: { eyebrow: "Durum", title: "Launch zamani" },
  sources: { eyebrow: "Veri", title: "Kaynaklar" },
  metrics: { eyebrow: "Veri", title: "AARRR onerisi" },
};

const ONBOARDING_PHASES = [
  "Ürününü Anlat",
  "Tip&Kanallar",
  "Ürün Profilleri",
  "Go-to-Market",
  "Launch Hazırlık",
  "Veri & İzler",
] as const;

const STEP_TO_PHASE: Record<StepId, number> = {
  name: 0,
  description: 0,
  category: 1,
  platform: 1,
  audience: 2,
  business: 2,
  stage: 3,
  goal: 3,
  timing: 4,
  sources: 5,
  metrics: 5,
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLaunchedStage(s: string) {
  return s === "Yayında" || s === "Büyüme aşamasında";
}

function isVeryEarlyStage(s: string) {
  return s === "Fikir aşamasında" || s === "Geliştirme aşamasında" || s === "Test kullanıcıları var";
}

function deriveStatus(launchStatus: string): "PRE_LAUNCH" | "LAUNCHED" | "GROWING" {
  if (launchStatus === "Büyüme aşamasında") return "GROWING";
  if (launchStatus === "Yayında") return "LAUNCHED";
  return "PRE_LAUNCH";
}

function timingToDate(timing: string): string | null {
  const days: Record<string, number> = {
    "2 hafta içinde": 14,
    "1-3 ay": 45,
    "3-6 ay": 120,
  };
  const d = days[timing];
  if (!d) return null;
  const date = new Date();
  date.setDate(date.getDate() + d);
  return date.toISOString().slice(0, 10);
}

function computeAutoMetrics(
  data: Partial<WizardData>,
  locale?: string,
): Partial<Record<FunnelStageKey, string>> {
  const category = joinSelections(data.categories, data.categoryOther);
  const targetAudience = joinSelections(data.targetAudiences, data.targetAudienceOther);
  const businessModel = joinSelections(data.businessModels, data.businessModelOther);

  if (!category || !data.launchStatus) return {};
  const plan = getGrowthMetricRecommendations({
    name: data.name ?? "",
    status: deriveStatus(data.launchStatus),
    category,
    businessModel,
    targetAudience,
    description: data.description,
    platforms: data.platforms,
    goalKey: data.goalKey,
    locale,
  });
  const result: Partial<Record<FunnelStageKey, string>> = {};
  for (const section of plan.sections) {
    const pick = section.metrics.find((m) => m.recommended) ?? section.metrics[0];
    if (pick) result[section.stage] = pick.key;
  }
  return result;
}

function getActiveSteps(data: Partial<WizardData>): StepId[] {
  const ids: StepId[] = ["name", "description", "category", "platform"];
  ids.push("audience", "business", "stage", "goal");
  if (data.launchStatus && !isLaunchedStage(data.launchStatus)) ids.push("timing");
  ids.push("sources");
  if (data.launchStatus && !isVeryEarlyStage(data.launchStatus)) ids.push("metrics");
  return ids;
}

function formatPlatforms(platforms: string[] | undefined) {
  if (!platforms || platforms.length === 0) return "Secilmedi";
  return platforms.join(", ");
}

function joinSelections(selected: string[] | undefined, otherValue?: string) {
  const items = [...(selected ?? [])];
  const otherIndex = items.indexOf(OTHER_OPTION_VALUE);
  if (otherIndex !== -1) {
    const trimmedOther = otherValue?.trim();
    if (trimmedOther) {
      items[otherIndex] = trimmedOther;
    } else {
      items.splice(otherIndex, 1);
    }
  }
  return items.join(", ");
}

function hasOtherSelection(selected: string[] | undefined) {
  return (selected ?? []).includes(OTHER_OPTION_VALUE);
}

function getStageLabel(value: string | undefined, items: { value: string; label: string }[]) {
  return items.find((item) => item.value === value)?.label ?? value ?? "Secilmedi";
}

function getConnectableSources(intendedSources: string[] | undefined) {
  return (intendedSources ?? []).filter((source): source is (typeof CONNECTABLE_ONBOARDING_SOURCES)[number] =>
    CONNECTABLE_ONBOARDING_SOURCES.includes(source as (typeof CONNECTABLE_ONBOARDING_SOURCES)[number]),
  );
}

function toIntegrationProvider(source: (typeof CONNECTABLE_ONBOARDING_SOURCES)[number]) {
  return source === "Stripe" ? "STRIPE" : source;
}

// ─── Option Card ──────────────────────────────────────────────────────────────

function OptionCard({
  item,
  selected,
  multi,
  onClick,
}: {
  item: { value: string; label: string; sub: string };
  selected: boolean;
  multi?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[12px] border p-3.5 text-left transition-all ${
        selected
          ? "border-[#8dcfd2] bg-[#dff2f4] text-[#0d0d12] shadow-[0_4px_20px_rgba(84,141,146,0.16)]"
          : "border-[#dadbe0] bg-white text-[#0d0d12] hover:border-[#9fb5bf] hover:shadow-sm"
      }`}
    >
      <div className="flex items-start gap-3">
        {multi && (
          <div
            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition ${
              selected ? "border-white bg-white" : "border-[#d0d5dd] bg-white"
            }`}
          >
            {selected && <div className="h-2 w-2 rounded-sm bg-[#0d0d12]" />}
          </div>
        )}
        <div>
          <p className="text-[13px] font-semibold leading-tight">{item.label}</p>
          <p className={`mt-0.5 text-[11px] ${selected ? "text-[#50767a]" : "text-[#8a8fa0]"}`}>
            {item.sub}
          </p>
        </div>
      </div>
    </button>
  );
}

// ─── Step Wrapper ─────────────────────────────────────────────────────────────

function StepWrapper({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {badge && (
        <span className="mb-4 inline-block rounded-full border border-[#e5e7eb] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
          {badge}
        </span>
      )}
      <h1 className="text-center text-[24px] font-semibold tracking-[-0.02em] text-[#0d0d12] sm:text-[30px]">
        {title}
      </h1>
      <p className="mx-auto mb-6 mt-2 max-w-3xl text-center text-[14px] leading-[1.45] text-[#666d80] sm:text-[16px]">
        {subtitle}
      </p>
      {children}
    </div>
  );
}

// ─── Metrics Preview Step ─────────────────────────────────────────────────────

function MetricsStep({
  autoMetrics,
  data,
  locale,
  hasConnectableSources,
  onAccept,
  onSkip,
}: {
  autoMetrics: Partial<Record<FunnelStageKey, string>>;
  data: Partial<WizardData>;
  locale: string;
  hasConnectableSources: boolean;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const isEn = locale === "en";
  const plan = getGrowthMetricRecommendations({
    name: data.name ?? "",
    status: deriveStatus(data.launchStatus ?? ""),
    category: joinSelections(data.categories, data.categoryOther),
    businessModel: joinSelections(data.businessModels, data.businessModelOther),
    targetAudience: joinSelections(data.targetAudiences, data.targetAudienceOther),
    description: data.description,
    platforms: data.platforms,
    goalKey: data.goalKey,
    locale,
  });

  const metricNames: Partial<Record<FunnelStageKey, string>> = {};
  for (const section of plan.sections) {
    const key = autoMetrics[section.stage];
    if (key) {
      const metric = section.metrics.find((m) => m.key === key);
      if (metric) metricNames[section.stage] = metric.name;
    }
  }

  const entries = STAGE_ORDER.filter((s) => metricNames[s]);

  return (
    <div>
      <span className="mb-4 inline-block rounded-full border border-[#e5e7eb] px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
        {isEn ? "Optional" : "İsteğe bağlı"}
      </span>
      <h1 className="text-[22px] font-bold tracking-[-0.01em] text-[#0d0d12] sm:text-[26px]">
        {isEn ? "Your recommended AARRR setup" : "Önerilen AARRR kurulumun"}
      </h1>
      <p className="mb-7 mt-2 text-[14px] leading-6 text-[#666d80]">
        {isEn
          ? "This was prepared based on your profile. If you accept it, setup becomes active immediately and you can change it later from Growth."
          : "Profiline göre hazırlandı. Onaylarsan kurulum hemen aktif olur — Growth ekranından istediğin zaman değiştirebilirsin."}
      </p>

      <div className="overflow-hidden rounded-[16px] border border-[#e5e7eb] bg-white">
        {entries.map((stage, i) => (
          <div
            key={stage}
            className={`flex items-center justify-between gap-4 px-5 py-3.5 ${
              i < entries.length - 1 ? "border-b border-[#f3f4f6]" : ""
            }`}
          >
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] ${STAGE_COLORS[stage]}`}
            >
              {stage}
            </span>
            <p className="text-[13px] font-semibold text-[#0d0d12]">{metricNames[stage]}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[12px] leading-5 text-[#8a8fa0]">
        {isEn ? "You can change these choices later. This step only sets the starting point." : "Seçimler daha sonra değiştirilebilir. Bu adım sadece başlangıç noktasını ayarlar."}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAccept}
          className="h-10 rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
        >
          {hasConnectableSources
            ? isEn ? "Use this setup and connect sources" : "Bu kurulumu kullan ve kaynak bagla"
            : isEn ? "Use this setup" : "Bu kurulumu kullan"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-10 rounded-full border border-[#e5e7eb] px-4 text-[12px] font-medium text-[#666d80] transition hover:border-[#0d0d12] hover:text-[#0d0d12]"
        >
          {isEn ? "Continue later" : "Daha sonra devam et"}
        </button>
      </div>
    </div>
  );
}

// ─── Creating Screen ──────────────────────────────────────────────────────────

function CreatingScreen({ error, locale }: { error: string | null; locale: string }) {
  const isEn = locale === "en";
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full bg-[#ffd7ef]" />
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0d0d12]">
          {isEn ? "Your workspace is being prepared…" : "Çalışma alanın hazırlanıyor…"}
        </h2>
        <p className="mt-2 text-[14px] text-[#666d80]">
          {isEn ? "The AI plan is being prepared and the system is being personalized" : "AI plan hazırlanıyor ve sistem kişiselleştiriliyor"}
        </p>
        <div className="mt-6 overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white p-4 text-left">
          {[
            isEn ? "Product profile is being created" : "Ürün profili oluşturuluyor",
            isEn ? "Checklist is being prepared" : "Checklist hazırlanıyor",
            isEn ? "Your metrics are being configured" : "Metriklerin ayarlanıyor",
            isEn ? "Dashboard is being personalized" : "Dashboard kişiselleştiriliyor",
          ].map((label) => (
            <div key={label} className="flex items-center gap-3 py-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#ffd7ef]" />
              <p className="text-[12px] text-[#666d80]">{label}</p>
            </div>
          ))}
        </div>
        {error && <p className="mt-4 text-[13px] text-red-600">{error}</p>}
      </div>
    </div>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────

export default function OnboardingWizard({ locale }: { locale: string }) {
  const router = useRouter();
  const isEn = locale === "en";
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({
    categories: [],
    categoryOther: "",
    platforms: [],
    targetAudiences: [],
    targetAudienceOther: "",
    businessModels: [],
    businessModelOther: "",
    intendedSources: [],
  });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = isEn
    ? [
        { value: "SaaS", label: "SaaS", sub: "Web-based software service" },
        { value: "Mobil uygulama", label: "Mobile app", sub: "iOS or Android" },
        { value: "E-ticaret", label: "E-commerce", sub: "Selling products or services" },
        { value: "Marketplace", label: "Marketplace", sub: "Buyer-seller platform" },
        { value: "İçerik/Medya", label: "Content / Media", sub: "Newsletter, blog, podcast" },
        { value: "Platform", label: "Platform / Tool", sub: "Developer tools, API" },
        { value: "AI Product", label: "AI Product", sub: "LLM, agent, or AI-enabled product" },
        { value: "Diğer", label: "Other", sub: "Something else" },
      ]
    : CATEGORIES;
  const stageOptions = isEn
    ? [
        { value: "Fikir aşamasında", label: "Idea stage", sub: "I am clarifying the problem and solution" },
        { value: "Geliştirme aşamasında", label: "Building", sub: "No users yet" },
        { value: "Test kullanıcıları var", label: "I have test users", sub: "Closed beta is ongoing" },
        { value: "Yakında yayında", label: "Preparing for launch", sub: "Going live soon" },
        { value: "Yayında", label: "Live", sub: "I have real users" },
        { value: "Büyüme aşamasında", label: "Growing", sub: "I am focused on scaling" },
      ]
    : STAGES;
  const timingOptions = isEn
    ? [
        { value: "2 hafta içinde", label: "Within 2 weeks", sub: "I am in sprint mode" },
        { value: "1-3 ay", label: "In 1-3 months", sub: "Preparation is ongoing" },
        { value: "3-6 ay", label: "In 3-6 months", sub: "Early stage, I have time" },
        { value: "Belirsiz", label: "Not sure yet", sub: "I will launch when ready" },
      ]
    : TIMING_OPTIONS;
  const businessModels = isEn
    ? [
        { value: "Abonelik", label: "Subscription", sub: "Monthly / yearly payment" },
        { value: "Freemium", label: "Freemium + paid plan", sub: "Free entry + upgrade" },
        { value: "Tek seferlik ödeme", label: "One-time purchase", sub: "Buy once" },
        { value: "Kullanıma göre ödeme", label: "Usage-based", sub: "Pay per use" },
        { value: "Kurumsal/özel teklif", label: "Enterprise / B2B", sub: "Sales-led, custom pricing" },
        { value: "Marketplace komisyonu", label: "Marketplace commission", sub: "Take a % per transaction" },
        { value: "Reklam", label: "Ads", sub: "Ads or sponsorship revenue" },
        { value: "Henüz monetize etmedim", label: "No revenue yet", sub: "Users first, money later" },
        { value: "Diğer", label: "Other", sub: "A different revenue model" },
      ]
    : BUSINESS_MODELS;
  const platforms = isEn
    ? [
        { value: "Web", label: "Web", sub: "Browser-based application" },
        { value: "iOS", label: "iOS", sub: "Apple App Store" },
        { value: "Android", label: "Android", sub: "Google Play Store" },
        { value: "Desktop", label: "Desktop", sub: "Windows, macOS, Linux" },
        { value: "API", label: "API / Backend", sub: "Developer service" },
        { value: "Multi-platform", label: "Multi-platform", sub: "More than one platform" },
      ]
    : PLATFORMS;
  const audiences = isEn
    ? [
        { value: "Tüketiciler", label: "Consumers", sub: "B2C individual users" },
        { value: "Freelancerlar", label: "Freelancers", sub: "Independent workers" },
        { value: "Geliştiriciler", label: "Developers", sub: "Engineers and technical teams" },
        { value: "Startup ekipleri", label: "Startup teams", sub: "Early-stage teams" },
        { value: "KOBİ'ler", label: "SMBs", sub: "Small and medium-sized businesses" },
        { value: "Kurumsal ekipler", label: "Enterprise teams", sub: "Large organizations" },
        { value: "İç ekipler", label: "Internal teams / Operations", sub: "In-company usage" },
        { value: "İçerik üreticileri", label: "Creators", sub: "Creators and influencers" },
        { value: "Eğitim", label: "Education", sub: "Students and educators" },
        { value: "Diğer", label: "Other", sub: "Another audience" },
      ]
    : AUDIENCES;
  const growthGoals = isEn
    ? [
        { value: "İlk kullanıcıları kazanmak", key: "get_first_users", label: "Get first users", sub: "Create traffic from zero" },
        { value: "Ürünü doğrulamak", key: "validate_product", label: "Validate the product", sub: "Are users really using it?" },
        { value: "İlk tekrar kullanımı sağlamak", key: "reach_first_value_usage", label: "Drive first repeat usage", sub: "Get users to come back" },
        { value: "İlk ödeme yapan müşteriyi bulmak", key: "get_first_revenue", label: "Find the first paying customer", sub: "Validate revenue quickly" },
        { value: "Büyüme ritmi kurmak", key: "build_growth_rhythm", label: "Build a growth rhythm", sub: "Settle the weekly loop" },
      ]
    : GROWTH_GOALS;
  const sources = isEn
    ? [
        { value: "GA4", label: "Google Analytics 4", sub: "Web traffic and conversion" },
        { value: "Stripe", label: "Stripe", sub: "Payments and subscriptions" },
        { value: "App Store Connect", label: "App Store Connect", sub: "iOS revenue and installs" },
        { value: "Google Play", label: "Google Play Console", sub: "Android store stats" },
        { value: "RevenueCat", label: "RevenueCat", sub: "Mobile subscription tracking" },
      ]
    : SOURCES;
  const onboardingPhases = isEn
    ? ["Describe your product", "Type & Channels", "Product Profiles", "Go-to-Market", "Launch Prep", "Data & Signals"]
    : ONBOARDING_PHASES;

  // Recompute step sequence whenever category or stage changes
  const stepIds = useMemo(
    () => getActiveSteps(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.launchStatus]
  );
  const currentId = stepIds[stepIndex] ?? "name";
  const totalSteps = stepIds.length;
  const progressPct = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  const currentMeta = STEP_META[currentId];
  const activePhaseIndex = STEP_TO_PHASE[currentId];
  const activePhaseSteps = stepIds.filter((id) => STEP_TO_PHASE[id] === activePhaseIndex);
  const activePhaseStepIndex = activePhaseSteps.indexOf(currentId);

  const autoMetrics = useMemo(
    () => computeAutoMetrics(data, locale),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      data.categories,
      data.categoryOther,
      data.launchStatus,
      data.businessModels,
      data.businessModelOther,
      data.targetAudiences,
      data.targetAudienceOther,
      data.platforms,
      data.goalKey,
      data.description,
      data.name,
      locale,
    ]
  );
  const connectableSources = useMemo(
    () => getConnectableSources(data.intendedSources),
    [data.intendedSources],
  );

  function goNext() {
    if (stepIndex < stepIds.length - 1) setStepIndex((i) => i + 1);
  }
  function goBack() {
    if (stepIndex > 0) setStepIndex((i) => i - 1);
  }

  function set<K extends keyof WizardData>(key: K, value: WizardData[K]) {
    setData((d) => ({ ...d, [key]: value }));
  }

  function toggleMulti(
    field: "categories" | "platforms" | "targetAudiences" | "businessModels" | "intendedSources",
    value: string
  ) {
    setData((d) => {
      const arr = (d[field] ?? []) as string[];
      return {
        ...d,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  function canContinue(): boolean {
    switch (currentId) {
      case "name":
        return (data.name ?? "").trim().length > 0;
      case "description":
        return (data.description ?? "").trim().length > 0;
      case "category":
        return (data.categories ?? []).length > 0 && (!hasOtherSelection(data.categories) || (data.categoryOther ?? "").trim().length > 0);
      case "platform":
        return (data.platforms ?? []).length > 0;
      case "stage":
        return !!data.launchStatus;
      case "timing":
        return !!data.timingOption;
      case "business":
        return (data.businessModels ?? []).length > 0 && (!hasOtherSelection(data.businessModels) || (data.businessModelOther ?? "").trim().length > 0);
      case "audience":
        return (data.targetAudiences ?? []).length > 0 && (!hasOtherSelection(data.targetAudiences) || (data.targetAudienceOther ?? "").trim().length > 0);
      case "goal":
        return !!data.growthGoal;
      case "sources":
        return true;
      case "metrics":
        return true;
      default:
        return false;
    }
  }

  async function submit(useMetrics: boolean) {
    setIsCreating(true);
    setError(null);
    try {
      const stageContext = [
        data.growthGoal ? `Kurucu önceliği: ${data.growthGoal}` : null,
        (data.intendedSources ?? []).length > 0
          ? `Planlanan araçlar: ${(data.intendedSources ?? []).join(", ")}`
          : null,
      ]
        .filter(Boolean)
        .join(". ");

      const productRes = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          locale,
          website: data.website || undefined,
          category: joinSelections(data.categories, data.categoryOther),
          platforms: data.platforms ?? [],
          targetAudience: joinSelections(data.targetAudiences, data.targetAudienceOther),
          businessModel: joinSelections(data.businessModels, data.businessModelOther),
          launchStatus: data.launchStatus,
          launchDate: data.timingOption ? timingToDate(data.timingOption) : undefined,
          growthGoal: data.growthGoal,
          goalKey: data.goalKey,
          stageContext: stageContext || undefined,
        }),
      });

      if (!productRes.ok) {
        const err = await productRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? (isEn ? "Product could not be created" : "Ürün oluşturulamadı"));
      }

      const product = (await productRes.json()) as { id: string };

      // Optionally save recommended metric selections
      if (useMetrics && Object.keys(autoMetrics).length > 0) {
        const selections = Object.entries(autoMetrics).map(([stage, key]) => ({
          stage,
          selectedMetricKeys: [key],
        }));
        await fetch(`/api/products/${product.id}/metric-setup`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ setup: { selections } }),
        }).catch(() => {
          // non-critical: metric setup can be done later
        });
      }

      if (useMetrics && connectableSources.length > 0) {
        const params = new URLSearchParams({
          onboarding: "1",
          connect: toIntegrationProvider(connectableSources[0]),
        });
        if (connectableSources.length > 1) {
          params.set(
            "queued",
            connectableSources
              .slice(1)
              .map((source) => toIntegrationProvider(source))
              .join(","),
          );
        }
        router.push(`/${locale}/integrations?${params.toString()}`);
        return;
      }

      if (!useMetrics) {
        router.push(`/${locale}/products/${product.id}/overview?onboarding=continue`);
        return;
      }

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setIsCreating(false);
      setError(err instanceof Error ? err.message : isEn ? "Something went wrong, please try again." : "Bir hata oluştu, tekrar dene.");
    }
  }

  if (isCreating) {
    return <CreatingScreen error={error} locale={locale} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,146,178,0.35),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(120,158,255,0.28),_transparent_34%),linear-gradient(135deg,_#ffd2df_0%,_#f1d8ff_46%,_#c9dcff_100%)] p-2 sm:p-4">
      <div className="mx-auto max-w-[1100px] rounded-[14px] border border-white/55 bg-[#f2f2f2]/95 p-3 shadow-[0_20px_64px_rgba(65,38,72,0.2)] backdrop-blur">
        <div className="flex items-center justify-between gap-4 px-1 pb-3">
          <h1 className="text-[18px] font-semibold tracking-[-0.01em] text-[#1b1b1f] sm:text-[28px]">
            {isEn ? "Create New Product" : "Yeni Ürün Oluştur"}
          </h1>
          <button
            type="button"
            onClick={() => router.push(`/${locale}/dashboard`)}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[8px] border border-[#d8d8d8] bg-[#f6f6f6] text-[#5f6674] transition hover:bg-white"
            aria-label={isEn ? "Close" : "Kapat"}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="scrollbar-hide mb-5 overflow-x-auto">
          <div className="flex min-w-max items-center gap-2">
            {onboardingPhases.map((phase, index) => {
              const isCurrent = index === activePhaseIndex;
              const isDone = index < activePhaseIndex;
              return (
                <span
                  key={phase}
                  className={`inline-flex h-8 items-center rounded-full px-3.5 text-[11px] font-medium ${
                    isCurrent
                      ? "border border-[#7ac9cf] bg-[#bde5e8] text-[#0f3b40]"
                      : isDone
                      ? "bg-[#cfd2d7] text-[#4f5563]"
                      : "bg-[#b5b6ba] text-white/85"
                  }`}
                >
                  {phase}
                  {isCurrent ? ` (${activePhaseStepIndex + 1}/${Math.max(1, activePhaseSteps.length)})` : ""}
                </span>
              );
            })}
          </div>
        </div>

        <div className="rounded-[14px] border border-[#ececee] bg-[#f7f7f8] px-4 py-5 sm:px-5 sm:py-6">
          <div className="mx-auto w-full max-w-4xl">
            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-[#e4e4e8]">
              <div
                className="h-full rounded-full bg-[#8ecfd3] transition-[width] duration-500"
                style={{ width: `${Math.max(6, progressPct)}%` }}
              />
            </div>
          {/* Step: name */}
          {currentId === "name" && (
            <StepWrapper
              title={isEn ? "What is your product called?" : "Ürününün adı ne?"}
              subtitle={isEn ? "A name is enough for now; you can change it later." : "Bir isim yeterli — sonra istediğin zaman değiştirebilirsin."}
            >
              <input
                type="text"
                autoFocus
                value={data.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                placeholder={isEn ? "Type the product name…" : "Ürün adını yaz…"}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
              />
            </StepWrapper>
          )}

          {/* Step: description */}
          {currentId === "description" && (
            <StepWrapper
              title={isEn ? "What does your product do?" : "Ürünün ne yapıyor?"}
              subtitle={isEn ? "This field is critical for understanding your product and creating a truly product-specific plan. Be explicit about what it does, for whom, and which problem it solves." : "Bu alan ürününü tanımamız ve sana gerçekten ürüne özel plan oluşturmamız için çok önemli. Ne yaptığını, kimin için yaptığını ve hangi problemi çözdüğünü net yaz."}
            >
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-[#ececef] px-3 py-1 text-[12px] text-[#6e7483]">
                <Sparkles className="h-3.5 w-3.5" />
                {isEn ? "We use this to personalize the AI plan and recommendations" : "Bunu AI planı ve önerileri kişiselleştirmek için kullanıyoruz"}
              </div>
              <div className="mb-3 rounded-[12px] border border-[#e7e8ee] bg-white/70 px-4 py-3 text-[13px] leading-6 text-[#5f6674]">
                {isEn ? "Keep it short but real. Not a marketing slogan; describe what the product practically does today. If possible, think in this format:" : "Kısa ama gerçek yaz. Pazarlama sloganı değil; ürünün bugün pratikte ne yaptığını anlat. Mümkünse şu formatta düşün:"}
                {" "}
                <span className="font-medium text-[#0d0d12]">{isEn ? "[for whom] + [which problem] + [how it solves it]" : "[kim için] + [hangi problemi] + [nasıl çözüyor]"}</span>
              </div>
              <textarea
                autoFocus
                value={data.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder={isEn ? "It helps freelancers manage scattered proposal and payment workflows in one place; proposal creation, tracking, and collection live in one panel." : "Freelancerların dağınık teklif ve ödeme süreçlerini tek panelde yönetmesini sağlıyor; teklif oluşturma, takip ve tahsilat akışını tek yerde topluyor."}
                rows={4}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
              />
              <p className="mt-2 text-[12px] leading-5 text-[#8a8fa0]">
                {isEn ? "The clearer you are here, the more accurate the checklist, metric recommendations, and next steps will be." : "Ne kadar net yazarsan, checklist, metrik önerileri ve sonraki adımlar o kadar isabetli olur."}
              </p>
              <div className="mt-4">
                <label className="text-[12px] font-medium text-[#8a8fa0]">
                  {isEn ? "Website or link (optional)" : "Website veya link (opsiyonel)"}
                </label>
                <input
                  type="url"
                  value={data.website ?? ""}
                  onChange={(e) => set("website", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                  placeholder="https://example.com"
                  className="mt-1 w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
                />
              </div>
            </StepWrapper>
          )}

          {/* Step: category */}
          {currentId === "category" && (
            <StepWrapper
              title={isEn ? "What are you building?" : "Ne inşa ediyorsun?"}
              subtitle={isEn ? "Choose the closest match. This shapes the system structure." : "En yakın eşleşeni seç — bu seçim sistem yapısını şekillendirir."}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {categories.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    multi
                    selected={(data.categories ?? []).includes(item.value)}
                    onClick={() => toggleMulti("categories", item.value)}
                  />
                ))}
              </div>
              {hasOtherSelection(data.categories) && (
                <div className="mt-4">
                  <label className="mb-1 block text-[12px] font-medium text-[#8a8fa0]">
                    {isEn ? "You selected Other, please specify" : "Diğer seçtin, belirtin"}
                  </label>
                  <input
                    type="text"
                    value={data.categoryOther ?? ""}
                    onChange={(e) => set("categoryOther", e.target.value)}
                    placeholder={isEn ? "E.g. internal operations tool" : "Örn. İç operasyon aracı"}
                    className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
                  />
                </div>
              )}
            </StepWrapper>
          )}

          {/* Step: platform — universal */}
          {currentId === "platform" && (
            <StepWrapper
              title={isEn ? "Which platforms does it run on?" : "Hangi platformda çalışıyor?"}
              subtitle={isEn ? "Choose the platforms your product runs on. Checklist and metric recommendations are shaped from this." : "Ürünün çalıştığı platformları seç — checklist ve metrik önerileri buna göre hazırlanır."}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {platforms.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    multi
                    selected={(data.platforms ?? []).includes(item.value)}
                    onClick={() => toggleMulti("platforms", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: stage */}
          {currentId === "stage" && (
            <StepWrapper
              title={isEn ? "Which stage are you in right now?" : "Şu an hangi aşamadasın?"}
              subtitle={isEn ? "This determines which workspaces appear first." : "Bu yanıt hangi ekranların önce görüneceğini belirler."}
            >
              <div className="grid gap-2">
                {stageOptions.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.launchStatus === item.value}
                    onClick={() => set("launchStatus", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: timing — only for PRE_LAUNCH */}
          {currentId === "timing" && (
            <StepWrapper
              title={isEn ? "When do you plan to launch?" : "Ne zaman yayına çıkmayı planlıyorsun?"}
              subtitle={isEn ? "An estimated timing is enough. The checklist will be prioritized around it." : "Tahmini bir zaman dilimi yeterli — checklist buna göre önceliklendirilir."}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {timingOptions.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.timingOption === item.value}
                    onClick={() => set("timingOption", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: business model */}
          {currentId === "business" && (
            <StepWrapper
              title={isEn ? "How will this make money?" : "Para nasıl kazanacaksın?"}
              subtitle={isEn ? "Your revenue model shapes which metrics matter most." : "Gelir modelin hangi metriklerin önemli olduğunu şekillendirir."}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {businessModels.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    multi
                    selected={(data.businessModels ?? []).includes(item.value)}
                    onClick={() => toggleMulti("businessModels", item.value)}
                  />
                ))}
              </div>
              {hasOtherSelection(data.businessModels) && (
                <div className="mt-4">
                  <label className="mb-1 block text-[12px] font-medium text-[#8a8fa0]">
                    {isEn ? "You selected Other, please specify" : "Diğer seçtin, belirtin"}
                  </label>
                  <input
                    type="text"
                    value={data.businessModelOther ?? ""}
                    onChange={(e) => set("businessModelOther", e.target.value)}
                    placeholder={isEn ? "E.g. service + software package" : "Örn. Hizmet + yazılım paketi"}
                    className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
                  />
                </div>
              )}
            </StepWrapper>
          )}

          {/* Step: audience */}
          {currentId === "audience" && (
            <StepWrapper
              title={isEn ? "Who are you selling to?" : "Kime satıyorsun?"}
              subtitle={isEn ? "Select the main audience you sell to. Recommendations and the growth guide adapt to this." : "Ana hedef kitleni seç — öneriler ve büyüme rehberi buna göre şekillenir."}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {audiences.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    multi
                    selected={(data.targetAudiences ?? []).includes(item.value)}
                    onClick={() => toggleMulti("targetAudiences", item.value)}
                  />
                ))}
              </div>
              {hasOtherSelection(data.targetAudiences) && (
                <div className="mt-4">
                  <label className="mb-1 block text-[12px] font-medium text-[#8a8fa0]">
                    {isEn ? "You selected Other, please specify" : "Diğer seçtin, belirtin"}
                  </label>
                  <input
                    type="text"
                    value={data.targetAudienceOther ?? ""}
                    onChange={(e) => set("targetAudienceOther", e.target.value)}
                    placeholder={isEn ? "E.g. operations managers" : "Örn. Operasyon yöneticileri"}
                    className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-2.5 text-[14px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
                  />
                </div>
              )}
            </StepWrapper>
          )}

          {/* Step: growth goal */}
          {currentId === "goal" && (
            <StepWrapper
              title={isEn ? "What is your #1 priority right now?" : "Şu an 1 numaralı önceliğin ne?"}
              subtitle={isEn ? "Just one: what are you most focused on right now?" : "Sadece biri — şu an en çok neye odaklanıyorsun?"}
            >
              <div className="grid gap-2">
                {growthGoals.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.growthGoal === item.value}
                    onClick={() => {
                      set("growthGoal", item.value);
                      set("goalKey", item.key);
                    }}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: sources — optional, multi-select */}
          {currentId === "sources" && (
            <StepWrapper
              title={isEn ? "Which tools are you already using?" : "Hangi araçları kullanıyorsun?"}
              subtitle={isEn ? "If you want, once setup finishes we can take you straight to connecting the live sources you selected." : "Istiyorsan setup biter bitmez secili canli kaynaklari baglama ekranina gecirecegiz."}
              badge={isEn ? "Optional" : "İsteğe bağlı"}
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {sources.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    multi
                    selected={(data.intendedSources ?? []).includes(item.value)}
                    onClick={() => toggleMulti("intendedSources", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: metrics — optional, submit step */}
          {currentId === "metrics" && (
            <MetricsStep
              autoMetrics={autoMetrics}
              data={data}
              locale={locale}
              hasConnectableSources={connectableSources.length > 0}
              onAccept={() => submit(true)}
              onSkip={() => submit(false)}
            />
          )}

          {/* ── Navigation (not shown on metrics step — it has its own CTAs) ── */}
          {currentId !== "metrics" && (() => {
            const isLastStep = stepIndex === stepIds.length - 1;
            return (
              <div className="mt-8 space-y-3">
                {currentId === "description" && (
                  <div className="grid gap-2 sm:grid-cols-3">
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#e5e5e8] bg-[#ececee] text-[13px] font-medium text-[#666d80] transition hover:bg-white"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f6f2dd] text-[#9c8f45]">
                        <Paperclip className="h-4 w-4" />
                      </span>
                      {isEn ? "Upload file" : "Dosya Yükle"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#e5e5e8] bg-[#ececee] text-[13px] font-medium text-[#666d80] transition hover:bg-white"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#dff2f4] text-[#3f8b91]">
                        <Link2 className="h-4 w-4" />
                      </span>
                      {isEn ? "Define URL" : "URL Tanımla"}
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-[#e5e5e8] bg-[#ececee] text-[13px] font-medium text-[#666d80] transition hover:bg-white"
                    >
                      <span className="inline-flex h-7 w-7 items-center justify-center rounded-[8px] bg-[#f2e8dc] text-[#8c6d43]">
                        <Plus className="h-4 w-4" />
                      </span>
                      {isEn ? "Extra note" : "Ek Not"}
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex h-10 items-center gap-2 rounded-full border border-[#d9dadd] bg-white px-4 text-[12px] font-medium text-[#666d80] transition hover:border-[#9fa4af] hover:text-[#0d0d12] disabled:pointer-events-none disabled:opacity-40"
                >
                  {isEn ? "← Back" : "← Geri"}
                </button>

                <div className="flex items-center gap-3">
                  {currentId === "sources" && !isLastStep && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="text-[13px] text-[#8a8fa0] underline-offset-2 hover:text-[#666d80] hover:underline"
                    >
                      {isEn ? "Skip" : "Atla"}
                    </button>
                  )}
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={() => submit(false)}
                      className="h-10 rounded-full bg-[#edbfd9] px-6 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#e7b0d0]"
                    >
                      {connectableSources.length > 0
                        ? isEn ? "Finish and connect sources" : "Tamamla ve kaynak bagla"
                        : isEn ? "Finish and start" : "Tamamla ve basla"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue()}
                      className="h-10 rounded-full bg-[#edbfd9] px-6 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#e7b0d0] disabled:cursor-not-allowed disabled:bg-[#F4DDE9] disabled:text-[#7E6674] disabled:opacity-100"
                    >
                      {isEn ? "Continue" : "Devam Et"}
                    </button>
                  )}
                </div>
              </div>
              </div>
            );
          })()}

          {error && !isCreating && (
            <p className="mt-4 text-[13px] text-red-600">{error}</p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}
