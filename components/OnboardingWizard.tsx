"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getGrowthMetricRecommendations } from "@/lib/growth-metric-recommendations";

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
  | "stage"
  | "timing"
  | "business"
  | "audience"
  | "goal"
  | "sources"
  | "metrics";

type WizardData = {
  name: string;
  description: string;
  website: string;
  category: string;
  platforms: string[];
  targetAudience: string;
  launchStatus: string;
  timingOption: string;
  businessModel: string;
  growthGoal: string;
  goalKey: string;
  intendedSources: string[];
};

const CONNECTABLE_ONBOARDING_SOURCES = ["GA4", "Stripe"] as const;

// ─── Option data ──────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: "SaaS", label: "SaaS", sub: "Web tabanlı yazılım servisi" },
  { value: "Mobil uygulama", label: "Mobil Uygulama", sub: "iOS veya Android" },
  { value: "E-ticaret", label: "E-ticaret", sub: "Ürün veya servis satışı" },
  { value: "Marketplace", label: "Marketplace", sub: "Alıcı-satıcı platformu" },
  { value: "İçerik/Medya", label: "İçerik / Medya", sub: "Newsletter, blog, podcast" },
  { value: "Platform", label: "Platform / Araç", sub: "Geliştirici araçları, API" },
  { value: "Diğer", label: "Diğer", sub: "Başka bir şey" },
];

const STAGES = [
  { value: "Geliştirme aşamasında", label: "Geliştiriyorum", sub: "Henüz kullanıcı yok" },
  {
    value: "Test kullanıcıları var",
    label: "Beta / test kullanıcılarım var",
    sub: "Kapalı beta devam ediyor",
  },
  {
    value: "Yakında yayında",
    label: "Yakında yayına çıkıyorum",
    sub: "Launch hazırlığındayım",
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
  { value: "Freemium", label: "Freemium", sub: "Ücretsiz + ücretli plan" },
  { value: "Abonelik", label: "Abonelik", sub: "Aylık / yıllık ödeme" },
  { value: "Tek seferlik ödeme", label: "Tek seferlik satış", sub: "Bir kez satın al" },
  { value: "Kullanıma göre ödeme", label: "Kullanım bazlı", sub: "Pay-per-use" },
  { value: "Kurumsal/özel teklif", label: "Kurumsal / B2B", sub: "Sales-led, özel fiyat" },
  { value: "Marketplace komisyonu", label: "Marketplace komisyonu", sub: "İşlem başına % al" },
  { value: "Henüz monetize etmedim", label: "Henüz gelir yok", sub: "Önce kullanıcı, sonra para" },
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
  stage: { eyebrow: "Durum", title: "Asama secimi" },
  timing: { eyebrow: "Durum", title: "Launch zamani" },
  business: { eyebrow: "Model", title: "Gelir modeli" },
  audience: { eyebrow: "Model", title: "Hedef kitle" },
  goal: { eyebrow: "Odak", title: "Buyume onceligi" },
  sources: { eyebrow: "Veri", title: "Kaynaklar" },
  metrics: { eyebrow: "Veri", title: "AARRR onerisi" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLaunchedStage(s: string) {
  return s === "Yayında" || s === "Büyüme aşamasında";
}

function isVeryEarlyStage(s: string) {
  return s === "Geliştirme aşamasında" || s === "Test kullanıcıları var";
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
  data: Partial<WizardData>
): Partial<Record<FunnelStageKey, string>> {
  if (!data.category || !data.launchStatus) return {};
  const plan = getGrowthMetricRecommendations({
    name: data.name ?? "",
    status: deriveStatus(data.launchStatus),
    category: data.category,
    businessModel: data.businessModel,
    targetAudience: data.targetAudience,
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
  ids.push("stage");
  if (data.launchStatus && !isLaunchedStage(data.launchStatus)) ids.push("timing");
  ids.push("business", "audience", "goal", "sources");
  if (data.launchStatus && !isVeryEarlyStage(data.launchStatus)) ids.push("metrics");
  return ids;
}

function formatPlatforms(platforms: string[] | undefined) {
  if (!platforms || platforms.length === 0) return "Secilmedi";
  return platforms.join(", ");
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
      className={`w-full rounded-[14px] border p-4 text-left transition-all ${
        selected
          ? "border-[#0d0d12] bg-[#0d0d12] text-white shadow-[0_4px_20px_rgba(13,13,18,0.18)]"
          : "border-[#e5e7eb] bg-white text-[#0d0d12] hover:border-[#0d0d12]/40 hover:shadow-sm"
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
          <p className="text-[14px] font-semibold leading-tight">{item.label}</p>
          <p className={`mt-0.5 text-[12px] ${selected ? "text-white/70" : "text-[#8a8fa0]"}`}>
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
      <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0d0d12] sm:text-[30px]">
        {title}
      </h1>
      <p className="mb-7 mt-2 text-[14px] leading-6 text-[#666d80]">{subtitle}</p>
      {children}
    </div>
  );
}

// ─── Metrics Preview Step ─────────────────────────────────────────────────────

function MetricsStep({
  autoMetrics,
  data,
  hasConnectableSources,
  onAccept,
  onSkip,
}: {
  autoMetrics: Partial<Record<FunnelStageKey, string>>;
  data: Partial<WizardData>;
  hasConnectableSources: boolean;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const plan = getGrowthMetricRecommendations({
    name: data.name ?? "",
    status: deriveStatus(data.launchStatus ?? ""),
    category: data.category,
    businessModel: data.businessModel,
    targetAudience: data.targetAudience,
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
        İsteğe bağlı
      </span>
      <h1 className="text-[26px] font-bold tracking-[-0.02em] text-[#0d0d12] sm:text-[30px]">
        Önerilen AARRR kurulumun
      </h1>
      <p className="mb-7 mt-2 text-[14px] leading-6 text-[#666d80]">
        Profiline göre hazırlandı. Onaylarsan kurulum hemen aktif olur — Growth ekranından istediğin
        zaman değiştirebilirsin.
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
        Seçimler daha sonra değiştirilebilir. Bu adım sadece başlangıç noktasını ayarlar.
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onAccept}
          className="h-11 rounded-full bg-[#0d0d12] px-6 text-[14px] font-semibold text-white transition hover:bg-[#1a1a24]"
        >
          {hasConnectableSources ? "Bu kurulumu kullan ve kaynak bagla" : "Bu kurulumu kullan"}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-11 rounded-full border border-[#e5e7eb] px-5 text-[13px] font-medium text-[#666d80] transition hover:border-[#0d0d12] hover:text-[#0d0d12]"
        >
          {hasConnectableSources ? "Kurulumsuz devam et" : "Sonra yapacağım"}
        </button>
      </div>
    </div>
  );
}

// ─── Creating Screen ──────────────────────────────────────────────────────────

function CreatingScreen({ error }: { error: string | null }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fafafa] px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 h-12 w-12 animate-pulse rounded-full bg-[#ffd7ef]" />
        <h2 className="text-[20px] font-bold tracking-[-0.02em] text-[#0d0d12]">
          Çalışma alanın hazırlanıyor…
        </h2>
        <p className="mt-2 text-[14px] text-[#666d80]">
          AI plan hazırlanıyor ve sistem kişiselleştiriliyor
        </p>
        <div className="mt-6 overflow-hidden rounded-[14px] border border-[#e8e8e8] bg-white p-4 text-left">
          {[
            "Ürün profili oluşturuluyor",
            "Checklist hazırlanıyor",
            "Metriklerin ayarlanıyor",
            "Dashboard kişiselleştiriliyor",
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
  const [stepIndex, setStepIndex] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({ platforms: [], intendedSources: [] });
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Recompute step sequence whenever category or stage changes
  const stepIds = useMemo(
    () => getActiveSteps(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.category, data.launchStatus]
  );
  const currentId = stepIds[stepIndex] ?? "name";
  const totalSteps = stepIds.length;
  const progressPct = totalSteps > 1 ? (stepIndex / (totalSteps - 1)) * 100 : 0;
  const currentMeta = STEP_META[currentId];

  const autoMetrics = useMemo(
    () => computeAutoMetrics(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.category, data.launchStatus, data.businessModel]
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

  function toggleMulti(field: "platforms" | "intendedSources", value: string) {
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
        return !!data.category;
      case "platform":
        return (data.platforms ?? []).length > 0;
      case "stage":
        return !!data.launchStatus;
      case "timing":
        return !!data.timingOption;
      case "business":
        return !!data.businessModel;
      case "audience":
        return !!data.targetAudience;
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
          website: data.website || undefined,
          category: data.category,
          platforms: data.platforms ?? [],
          targetAudience: data.targetAudience,
          businessModel: data.businessModel,
          launchStatus: data.launchStatus,
          launchDate: data.timingOption ? timingToDate(data.timingOption) : undefined,
          growthGoal: data.growthGoal,
          goalKey: data.goalKey,
          stageContext: stageContext || undefined,
        }),
      });

      if (!productRes.ok) {
        const err = await productRes.json().catch(() => ({}));
        throw new Error((err as { error?: string }).error ?? "Ürün oluşturulamadı");
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

      if (connectableSources.length > 0) {
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

      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setIsCreating(false);
      setError(err instanceof Error ? err.message : "Bir hata oluştu, tekrar dene.");
    }
  }

  if (isCreating) {
    return <CreatingScreen error={error} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,215,239,0.42),_transparent_24%),linear-gradient(180deg,_#fcfcfb_0%,_#f5f5f2_100%)] px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <div className="overflow-hidden rounded-[28px] border border-[#e8e8e8] bg-[#0d0d12] p-6 text-white shadow-[0_24px_70px_rgba(13,13,18,0.16)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/45">
              Tiramisup setup
            </p>
            <h2 className="mt-2 text-[28px] font-semibold tracking-[-0.03em]">
              Urununu sisteme yerlestirelim
            </h2>
            <p className="mt-3 text-[13px] leading-6 text-white/70">
              Once urununu anlayalim, sonra dashboard, checklist ve growth alani buna gore sekillensin.
            </p>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#95dbda] transition-[width] duration-500"
                style={{ width: `${Math.max(4, progressPct)}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-white/55">
              <span>{currentMeta.eyebrow}</span>
              <span>
                {stepIndex + 1} / {totalSteps}
              </span>
            </div>

            <div className="mt-6 space-y-2">
              {stepIds.map((step, index) => {
                const isCurrent = step === currentId;
                const isDone = index < stepIndex;
                return (
                  <div
                    key={step}
                    className={`flex items-center gap-3 rounded-[16px] px-3 py-2.5 transition ${
                      isCurrent
                        ? "bg-white text-[#0d0d12]"
                        : isDone
                        ? "bg-white/8 text-white"
                        : "bg-transparent text-white/52"
                    }`}
                  >
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                        isCurrent
                          ? "bg-[#0d0d12] text-white"
                          : isDone
                          ? "bg-[#95dbda] text-[#0d0d12]"
                          : "border border-white/12"
                      }`}
                    >
                      {isDone ? "✓" : index + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] uppercase tracking-[0.12em] opacity-60">
                        {STEP_META[step].eyebrow}
                      </p>
                      <p className="text-[13px] font-semibold">{STEP_META[step].title}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-white/45">
                Canli ozet
              </p>
              <div className="mt-3 space-y-3 text-[12px]">
                <div>
                  <p className="text-white/45">Urun</p>
                  <p className="mt-0.5 font-semibold text-white">{data.name?.trim() || "Henuz ad verilmedi"}</p>
                </div>
                <div>
                  <p className="text-white/45">Kategori</p>
                  <p className="mt-0.5 font-semibold text-white">{data.category || "Secilmedi"}</p>
                </div>
                <div>
                  <p className="text-white/45">Platform</p>
                  <p className="mt-0.5 font-semibold text-white">{formatPlatforms(data.platforms)}</p>
                </div>
                <div>
                  <p className="text-white/45">Asama</p>
                  <p className="mt-0.5 font-semibold text-white">
                    {getStageLabel(data.launchStatus, STAGES)}
                  </p>
                </div>
                <div>
                  <p className="text-white/45">Hedef kitle</p>
                  <p className="mt-0.5 font-semibold text-white">
                    {getStageLabel(data.targetAudience, AUDIENCES)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="overflow-hidden rounded-[30px] border border-[#e8e8e8] bg-white shadow-[0_24px_80px_rgba(13,13,18,0.08)]">
          <div className="border-b border-[#eef1f2] bg-[linear-gradient(180deg,_#fffefe_0%,_#faf8fb_100%)] px-6 py-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
                  {currentMeta.eyebrow}
                </p>
                <h1 className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                  {currentMeta.title}
                </h1>
              </div>
              <div className="rounded-full border border-[#e8e8e8] bg-white px-3 py-1 text-[11px] font-semibold text-[#666d80]">
                {stepIndex + 1} / {totalSteps}
              </div>
            </div>
          </div>

          <div className="px-6 py-8 sm:px-8 sm:py-10">
          {/* Step: name */}
          {currentId === "name" && (
            <StepWrapper
              title="Ürününün adı ne?"
              subtitle="Bir isim yeterli — sonra istediğin zaman değiştirebilirsin."
            >
              <input
                type="text"
                autoFocus
                value={data.name ?? ""}
                onChange={(e) => set("name", e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                placeholder="Ürün adını yaz…"
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
              />
            </StepWrapper>
          )}

          {/* Step: description */}
          {currentId === "description" && (
            <StepWrapper
              title="Ürünün ne yapıyor?"
              subtitle="Bir cümleyle açıkla — hangi problemi, kimin için çözüyor?"
            >
              <textarea
                autoFocus
                value={data.description ?? ""}
                onChange={(e) => set("description", e.target.value)}
                placeholder="Freelancerların teklif ve ödemelerini tek yerden yönetmesini sağlıyor."
                rows={3}
                className="w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
              />
              <div className="mt-4">
                <label className="text-[12px] font-medium text-[#8a8fa0]">
                  Website veya link (opsiyonel)
                </label>
                <input
                  type="url"
                  value={data.website ?? ""}
                  onChange={(e) => set("website", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canContinue() && goNext()}
                  placeholder="https://example.com"
                  className="mt-1 w-full rounded-[12px] border border-[#e5e7eb] bg-white px-4 py-3 text-[15px] font-medium text-[#0d0d12] outline-none placeholder:text-[#b0b7c3] focus:border-[#0d0d12] focus:ring-2 focus:ring-[#0d0d12]/10"
                />
              </div>
            </StepWrapper>
          )}

          {/* Step: category */}
          {currentId === "category" && (
            <StepWrapper
              title="Ne inşa ediyorsun?"
              subtitle="En yakın eşleşeni seç — bu seçim sistem yapısını şekillendirir."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {CATEGORIES.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.category === item.value}
                    onClick={() => set("category", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: platform — universal */}
          {currentId === "platform" && (
            <StepWrapper
              title="Hangi platformda çalışıyor?"
              subtitle="Ürünün çalıştığı platformları seç — checklist ve metrik önerileri buna göre hazırlanır."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {PLATFORMS.map((item) => (
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
              title="Şu an hangi aşamadasın?"
              subtitle="Bu yanıt hangi ekranların önce görüneceğini belirler."
            >
              <div className="grid gap-2">
                {STAGES.map((item) => (
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
              title="Ne zaman yayına çıkmayı planlıyorsun?"
              subtitle="Tahmini bir zaman dilimi yeterli — checklist buna göre önceliklendirilir."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {TIMING_OPTIONS.map((item) => (
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
              title="Para nasıl kazanacaksın?"
              subtitle="Gelir modelin hangi metriklerin önemli olduğunu şekillendirir."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {BUSINESS_MODELS.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.businessModel === item.value}
                    onClick={() => set("businessModel", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: audience */}
          {currentId === "audience" && (
            <StepWrapper
              title="Kime satıyorsun?"
              subtitle="Ana hedef kitleni seç — öneriler ve büyüme rehberi buna göre şekillenir."
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {AUDIENCES.map((item) => (
                  <OptionCard
                    key={item.value}
                    item={item}
                    selected={data.targetAudience === item.value}
                    onClick={() => set("targetAudience", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: growth goal */}
          {currentId === "goal" && (
            <StepWrapper
              title="Şu an 1 numaralı önceliğin ne?"
              subtitle="Sadece biri — şu an en çok neye odaklanıyorsun?"
            >
              <div className="grid gap-2">
                {GROWTH_GOALS.map((item) => (
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
              title="Hangi araçları kullanıyorsun?"
              subtitle="Istiyorsan setup biter bitmez secili canli kaynaklari baglama ekranina gecirecegiz."
              badge="İsteğe bağlı"
            >
              <div className="grid gap-2 sm:grid-cols-2">
                {SOURCES.map((item) => (
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
              hasConnectableSources={connectableSources.length > 0}
              onAccept={() => submit(true)}
              onSkip={() => submit(false)}
            />
          )}

          {/* ── Navigation (not shown on metrics step — it has its own CTAs) ── */}
          {currentId !== "metrics" && (() => {
            const isLastStep = stepIndex === stepIds.length - 1;
            return (
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={goBack}
                  disabled={stepIndex === 0}
                  className="flex h-10 items-center gap-2 rounded-full border border-[#e5e7eb] px-4 text-[13px] font-medium text-[#666d80] transition hover:border-[#0d0d12] hover:text-[#0d0d12] disabled:pointer-events-none disabled:opacity-40"
                >
                  ← Geri
                </button>

                <div className="flex items-center gap-3">
                  {currentId === "sources" && !isLastStep && (
                    <button
                      type="button"
                      onClick={goNext}
                      className="text-[13px] text-[#8a8fa0] underline-offset-2 hover:text-[#666d80] hover:underline"
                    >
                      Atla
                    </button>
                  )}
                  {isLastStep ? (
                    <button
                      type="button"
                      onClick={() => submit(false)}
                      className="h-10 rounded-full bg-[#0d0d12] px-6 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
                    >
                      {connectableSources.length > 0 ? "Tamamla ve kaynak bagla" : "Tamamla ve basla"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={goNext}
                      disabled={!canContinue()}
                      className="h-10 rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Devam →
                    </button>
                  )}
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
