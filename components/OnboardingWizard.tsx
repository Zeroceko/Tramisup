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
  | "category"
  | "platform"
  | "stage"
  | "timing"
  | "business"
  | "goal"
  | "sources"
  | "metrics";

type WizardData = {
  name: string;
  category: string;
  platforms: string[];
  launchStatus: string;
  timingOption: string;
  businessModel: string;
  growthGoal: string;
  intendedSources: string[];
};

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
    value: "Test aşamasında",
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

const GROWTH_GOALS = [
  {
    value: "İlk kullanıcıları kazanmak",
    label: "İlk kullanıcıları kazanmak",
    sub: "Sıfırdan trafik oluştur",
  },
  {
    value: "İlk ödeme yapan müşteriyi bulmak",
    label: "İlk ödeme yapan müşteriyi bulmak",
    sub: "Revenue hemen doğrulansın",
  },
  {
    value: "Retention'ı güçlendirmek",
    label: "Retention'ı güçlendirmek",
    sub: "Kullanıcılar geri dönsün",
  },
  { value: "MRR'ı büyütmek", label: "MRR'ı büyütmek", sub: "Aylık geliri artır" },
  {
    value: "Büyümeyi ölçeklemek",
    label: "Tüm kanalları genişletmek",
    sub: "Her aşamayı optimize et",
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isLaunchedStage(s: string) {
  return s === "Yayında" || s === "Büyüme aşamasında";
}

function isVeryEarlyStage(s: string) {
  return s === "Geliştirme aşamasında" || s === "Test aşamasında";
}

function deriveStatus(launchStatus: string): "PRE_LAUNCH" | "LAUNCHED" | "GROWING" {
  if (launchStatus === "Büyüme aşamasında") return "GROWING";
  if (launchStatus === "Yayında") return "LAUNCHED";
  return "PRE_LAUNCH";
}

function deriveTargetAudience(category: string): string {
  const map: Record<string, string> = {
    SaaS: "İşletmeler ve ekipler",
    "Mobil uygulama": "Bireysel kullanıcılar",
    "E-ticaret": "Tüketiciler",
    Marketplace: "Alıcılar ve satıcılar",
    "İçerik/Medya": "İçerik tüketicileri",
    Platform: "Geliştiriciler",
  };
  return map[category] ?? "Genel kullanıcılar";
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
    targetAudience: deriveTargetAudience(data.category),
  });
  const result: Partial<Record<FunnelStageKey, string>> = {};
  for (const section of plan.sections) {
    const pick = section.metrics.find((m) => m.recommended) ?? section.metrics[0];
    if (pick) result[section.stage] = pick.key;
  }
  return result;
}

function getActiveSteps(data: Partial<WizardData>): StepId[] {
  const ids: StepId[] = ["name", "category"];
  if (data.category === "Mobil uygulama") ids.push("platform");
  ids.push("stage");
  if (data.launchStatus && !isLaunchedStage(data.launchStatus)) ids.push("timing");
  ids.push("business", "goal", "sources");
  if (data.launchStatus && !isVeryEarlyStage(data.launchStatus)) ids.push("metrics");
  return ids;
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
  onAccept,
  onSkip,
}: {
  autoMetrics: Partial<Record<FunnelStageKey, string>>;
  data: Partial<WizardData>;
  onAccept: () => void;
  onSkip: () => void;
}) {
  const plan = getGrowthMetricRecommendations({
    name: data.name ?? "",
    status: deriveStatus(data.launchStatus ?? ""),
    category: data.category,
    businessModel: data.businessModel,
    targetAudience: deriveTargetAudience(data.category ?? ""),
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
          Bu kurulumu kullan
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="h-11 rounded-full border border-[#e5e7eb] px-5 text-[13px] font-medium text-[#666d80] transition hover:border-[#0d0d12] hover:text-[#0d0d12]"
        >
          Sonra yapacağım
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

  const autoMetrics = useMemo(
    () => computeAutoMetrics(data),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.category, data.launchStatus, data.businessModel]
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
          category: data.category,
          mobilePlatforms: data.platforms ?? [],
          targetAudience: deriveTargetAudience(data.category ?? ""),
          businessModel: data.businessModel,
          launchStatus: data.launchStatus,
          launchDate: data.timingOption ? timingToDate(data.timingOption) : undefined,
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
    <div className="flex min-h-screen flex-col bg-[#fafafa]">
      {/* ── Header with progress ── */}
      <div className="sticky top-0 z-10 border-b border-[#e8e8e8] bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center gap-4 px-6 py-4">
          <span className="shrink-0 text-[15px] font-bold tracking-tight text-[#0d0d12]">
            tiramisup
          </span>
          <div className="flex flex-1 items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#f0f0f0]">
              <div
                className="h-1.5 rounded-full bg-[#0d0d12] transition-[width] duration-500"
                style={{ width: `${Math.max(3, progressPct)}%` }}
              />
            </div>
            <span className="shrink-0 text-[11px] font-semibold tabular-nums text-[#8a8fa0]">
              {stepIndex + 1} / {totalSteps}
            </span>
          </div>
        </div>
      </div>

      {/* ── Step content ── */}
      <div className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
        <div className="w-full max-w-2xl">
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

          {/* Step: platform — only for mobile */}
          {currentId === "platform" && (
            <StepWrapper
              title="Hangi platform?"
              subtitle="iOS, Android, ya da ikisi — App Store / Play Store checklist buna göre hazırlanır."
            >
              <div className="grid gap-2 sm:grid-cols-3">
                {(
                  [
                    { value: "iOS", label: "iOS", sub: "Apple App Store" },
                    { value: "Android", label: "Android", sub: "Google Play Store" },
                    { value: "İkisi de", label: "İkisi de", sub: "Çapraz platform" },
                  ] as { value: string; label: string; sub: string }[]
                ).map((item) => {
                  const isBoth = item.value === "İkisi de";
                  const selected = isBoth
                    ? (data.platforms ?? []).includes("iOS") &&
                      (data.platforms ?? []).includes("Android")
                    : (data.platforms ?? []).includes(item.value);
                  return (
                    <OptionCard
                      key={item.value}
                      item={item}
                      selected={selected}
                      onClick={() => {
                        if (isBoth) {
                          set("platforms", ["iOS", "Android"]);
                        } else {
                          // deselect "both" shortcut if toggling individually
                          const existing = (data.platforms ?? []) as string[];
                          const next = existing.includes(item.value)
                            ? existing.filter((p) => p !== item.value)
                            : [...existing, item.value];
                          set("platforms", next);
                        }
                      }}
                    />
                  );
                })}
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
                    onClick={() => set("growthGoal", item.value)}
                  />
                ))}
              </div>
            </StepWrapper>
          )}

          {/* Step: sources — optional, multi-select */}
          {currentId === "sources" && (
            <StepWrapper
              title="Hangi araçları kullanıyorsun?"
              subtitle="Şimdi bağlamak zorunda değilsin — sadece planını bilelim."
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
              onAccept={() => submit(true)}
              onSkip={() => submit(false)}
            />
          )}

          {/* ── Navigation (not shown on metrics step — it has its own CTAs) ── */}
          {currentId !== "metrics" && (
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
                {currentId === "sources" && (
                  <button
                    type="button"
                    onClick={goNext}
                    className="text-[13px] text-[#8a8fa0] underline-offset-2 hover:text-[#666d80] hover:underline"
                  >
                    Atla
                  </button>
                )}
                <button
                  type="button"
                  onClick={goNext}
                  disabled={!canContinue()}
                  className="h-10 rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Devam →
                </button>
              </div>
            </div>
          )}

          {error && !isCreating && (
            <p className="mt-4 text-[13px] text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
