"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

type WizardData = {
  name: string;
  description: string;
  categories: string[];
  categoryOther: string;
  targetAudiences: string[];
  audienceOther: string;
  businessModel: string;
  launchStatus: string;
  launchDate: string;
  website?: string;
};

const PILLS = [
  { id: 1, label: "Ürünü Anlat" },
  { id: 2, label: "Kitle & Model" },
];

const OTHER_OPTION = "Diğer";

const CATEGORIES = [
  "SaaS",
  "Mobil uygulama",
  "E-ticaret",
  "Marketplace",
  "İçerik / Medya",
  "Platform",
  OTHER_OPTION,
];

const AUDIENCES = [
  "Geliştiriciler",
  "KOBİ'ler",
  "Tüketiciler",
  "Kurumsal ekipler",
  "Startup'lar",
  "Freelancer'lar",
  OTHER_OPTION,
];

const BUSINESS_MODELS = [
  "Freemium",
  "Abonelik",
  "Tek seferlik ödeme",
  "Kullanıma göre ödeme",
  "Kurumsal / özel teklif",
  "Marketplace komisyonu",
];

const LAUNCH_STATUSES = [
  "Geliştirme aşamasında",
  "Test kullanıcıları var",
  "Yakında yayında",
  "Yayında",
  "Büyüme aşamasında",
];

type Question =
  | {
      id: "name" | "businessModel" | "launchStatus";
      type: "text" | "single-select";
      label: string;
      description?: string;
      placeholder?: string;
      options?: string[];
      required: boolean;
    }
  | {
      id: "description";
      type: "textarea";
      label: string;
      description?: string;
      placeholder?: string;
      required: boolean;
    }
  | {
      id: "categories" | "targetAudiences";
      type: "multi-select";
      label: string;
      description?: string;
      options: string[];
      required: boolean;
      otherField: "categoryOther" | "audienceOther";
      otherPlaceholder: string;
    };

const PILL_QUESTIONS: Record<number, Question[]> = {
  1: [
    {
      id: "name",
      type: "text",
      label: "Ürününüzün adı nedir?",
      placeholder: "Örn: Tiramisup",
      required: true,
    },
    {
      id: "description",
      type: "textarea",
      label: "Ne işe yarıyor?",
      placeholder: "Kullanıcı kendi cümleleriyle hangi sorunu çözdüğünü anlatsın",
      required: true,
    },
    {
      id: "categories",
      type: "multi-select",
      label: "Hangi kategoriye giriyor?",
      description: "Birden fazla seçim yapabilirsin. Örn: hem SaaS hem mobil uygulama.",
      options: CATEGORIES,
      required: true,
      otherField: "categoryOther",
      otherPlaceholder: "Kategori belirtin",
    },
  ],
  2: [
    {
      id: "targetAudiences",
      type: "multi-select",
      label: "Kime satıyorsunuz?",
      description: "Birden fazla müşteri tipi seçebilirsin.",
      options: AUDIENCES,
      required: true,
      otherField: "audienceOther",
      otherPlaceholder: "Hedef kitleyi belirtin",
    },
    {
      id: "businessModel",
      type: "single-select",
      label: "Para nasıl kazanıyorsunuz?",
      options: BUSINESS_MODELS,
      required: true,
    },
    {
      id: "launchStatus",
      type: "single-select",
      label: "Şu an hangi aşamadasın?",
      description: "Tiramisup buna göre plan ve growth hazırlığı yapacak.",
      options: LAUNCH_STATUSES,
      required: true,
    },
  ],
};

function StepPills({
  currentPill,
  onPillClick,
}: {
  currentPill: number;
  onPillClick: (pill: number) => void;
}) {
  return (
    <div className="mb-10 flex gap-3">
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

function OptionButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
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

function serializeMultiSelect(values: string[], otherValue: string) {
  const base = values.filter((value) => value !== OTHER_OPTION);
  if (values.includes(OTHER_OPTION) && otherValue.trim()) {
    base.push(`Diğer: ${otherValue.trim()}`);
  }
  return base.join(", ");
}

export default function NewProductWizard() {
  const router = useRouter();
  const locale = useLocale();
  const [currentPill, setCurrentPill] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [data, setData] = useState<WizardData>({
    name: "",
    description: "",
    categories: [],
    categoryOther: "",
    targetAudiences: [],
    audienceOther: "",
    businessModel: "",
    launchStatus: "",
    launchDate: "",
    website: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const pillQuestions = PILL_QUESTIONS[currentPill] || [];
  const currentQuestion = pillQuestions[questionIndex];
  const isLastQuestionInPill = questionIndex === pillQuestions.length - 1;
  const isLastPill = currentPill === PILLS.length;

  const launchAdvice = useMemo(() => {
    switch (data.launchStatus) {
      case "Yakında yayında":
        return "Henüz tarih net değilse sorun değil. Ama gerçekçi bir yayın tarihi seçmek checklist önceliklerini daha doğru kurar.";
      case "Yayında":
        return "Bu aşamada Tiramisup, growth hazırlığını activation, retention ve revenue sinyallerine göre öne çeker.";
      case "Büyüme aşamasında":
        return "Bu aşamada founder coach özellikle acquisition, activation ve retention metriklerini birlikte kurmaya çalışır.";
      default:
        return null;
    }
  }, [data.launchStatus]);

  function setValue<K extends keyof WizardData>(id: K, value: WizardData[K]) {
    setData((prev) => ({ ...prev, [id]: value }));
  }

  function toggleMultiValue(field: "categories" | "targetAudiences", value: string) {
    setData((prev) => {
      const current = prev[field];
      const exists = current.includes(value);
      const next = exists ? current.filter((item) => item !== value) : [...current, value];

      if (field === "categories" && value === OTHER_OPTION && exists) {
        return { ...prev, categories: next, categoryOther: "" };
      }

      if (field === "targetAudiences" && value === OTHER_OPTION && exists) {
        return { ...prev, targetAudiences: next, audienceOther: "" };
      }

      return { ...prev, [field]: next };
    });
  }

  function canProceed() {
    if (!currentQuestion) return true;

    if (currentQuestion.type === "text" || currentQuestion.type === "textarea") {
      return data[currentQuestion.id].trim() !== "";
    }

    if (currentQuestion.type === "single-select") {
      if (currentQuestion.id === "launchStatus") {
        if (!data.launchStatus) return false;
        if (data.launchStatus === "Yakında yayında") {
          return data.launchDate.trim() !== "";
        }
        return true;
      }

      return data[currentQuestion.id].trim() !== "";
    }

    if (currentQuestion.type === "multi-select") {
      const values = data[currentQuestion.id];
      if (values.length === 0) return false;
      if (values.includes(OTHER_OPTION)) {
        return data[currentQuestion.otherField].trim() !== "";
      }
      return true;
    }

    return true;
  }

  function handleNext() {
    if (!canProceed()) {
      setError("Bu alanı doldurmak gerekiyor.");
      return;
    }

    setError("");

    if (isLastQuestionInPill) {
      if (isLastPill) {
        void handleSubmit();
      } else {
        setCurrentPill((prev) => prev + 1);
        setQuestionIndex(0);
      }
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  }

  function handleBack() {
    setError("");
    if (questionIndex > 0) {
      setQuestionIndex((prev) => prev - 1);
      return;
    }

    if (currentPill > 1) {
      const prevPill = currentPill - 1;
      const prevQuestions = PILL_QUESTIONS[prevPill] || [];
      setCurrentPill(prevPill);
      setQuestionIndex(prevQuestions.length - 1);
    }
  }

  function goToPill(targetPill: number) {
    if (targetPill <= currentPill) {
      setError("");
      setCurrentPill(targetPill);
      setQuestionIndex(0);
    }
  }

  async function handleSubmit() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: serializeMultiSelect(data.categories, data.categoryOther),
          targetAudience: serializeMultiSelect(data.targetAudiences, data.audienceOther),
          businessModel: data.businessModel,
          launchStatus: data.launchStatus,
          launchDate: data.launchDate || undefined,
          website: data.website,
          seedData: false,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Ürün oluşturulamadı");
      }

      const product = await res.json();
      document.cookie = `activeProductId=${product.id}; path=/`;
      router.push(`/${locale}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
      setLoading(false);
    }
  }

  const totalQuestions = Object.values(PILL_QUESTIONS).reduce((sum, questions) => sum + questions.length, 0);
  const completedQuestions = Object.entries(PILL_QUESTIONS).reduce((sum, [pillId, questions]) => {
    const numericPill = Number(pillId);
    if (numericPill < currentPill) return sum + questions.length;
    if (numericPill === currentPill) return sum + questionIndex;
    return sum;
  }, 0);

  return (
    <div className="min-h-screen bg-[#f6f6f6] px-4 py-8 md:px-8 md:py-10">
      <div className="mx-auto w-full max-w-6xl">
        <div className="mb-4 flex items-center justify-between px-1">
          <Link
            href={`/${locale}/dashboard`}
            className="inline-flex items-center gap-1 text-[13px] text-[#666d80] transition hover:text-[#111111]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M19 12H5M12 5l-7 7 7 7"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Geri dön
          </Link>
          <span className="text-[12px] font-medium text-[#666d80]">
            {completedQuestions + 1} / {totalQuestions}
          </span>
        </div>

        <div className="rounded-[28px] border border-[#ededed] bg-white px-6 py-6 shadow-card md:px-10 md:py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111111]">
                Ürününüzü tanıyalım
              </h1>
              <p className="mt-1 text-[14px] text-[#666d80]">
                Founder Coach, anlattığın ürüne göre checklist ve growth başlangıcını hazırlayacak.
              </p>
            </div>
            <Link
              href={`/${locale}/dashboard`}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#ececec] text-[20px] leading-none text-[#666d80] transition hover:border-[#d8d8d8] hover:text-[#111111]"
            >
              ×
            </Link>
          </div>

          <StepPills currentPill={currentPill} onPillClick={goToPill} />

          {error ? (
            <div className="mb-5 rounded-[14px] border border-red-200 bg-red-50 px-4 py-3 text-[13px] text-red-600">
              {error}
            </div>
          ) : null}

          {currentQuestion ? (
            <div className="mx-auto max-w-3xl space-y-6">
              <div className="text-center">
                <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-[#111111] md:text-[36px]">
                  {currentQuestion.label}
                </h2>
                {currentQuestion.description ? (
                  <p className="mt-2 text-[14px] text-[#6b7280]">{currentQuestion.description}</p>
                ) : null}
              </div>

              <div className="space-y-3">
                {currentQuestion.type === "text" ? (
                  <input
                    autoFocus
                    type="text"
                    value={data[currentQuestion.id]}
                    onChange={(e) => setValue(currentQuestion.id, e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder={currentQuestion.placeholder}
                    className="w-full rounded-[18px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.type === "textarea" ? (
                  <>
                    <textarea
                      autoFocus
                      rows={4}
                      value={data.description}
                      onChange={(e) => setValue("description", e.target.value)}
                      placeholder={currentQuestion.placeholder}
                      className="w-full resize-none rounded-[22px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition focus:border-[#95dbda] focus:bg-white"
                    />
                    <div className="flex items-center gap-2 rounded-[18px] border border-[#efefef] bg-[#fafafa] px-4 py-3 transition focus-within:border-[#95dbda] focus-within:bg-white">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#b6bcc6]">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input
                        type="url"
                        value={data.website}
                        onChange={(e) => setValue("website", e.target.value)}
                        placeholder="URL ekle (opsiyonel) — landing page, GitHub, App Store…"
                        className="flex-1 bg-transparent text-[13px] text-[#111111] placeholder-[#b6bcc6] outline-none"
                      />
                    </div>
                  </>
                ) : null}

                {currentQuestion.type === "single-select" && currentQuestion.options
                  ? currentQuestion.options.map((option) => (
                      <OptionButton
                        key={option}
                        selected={data[currentQuestion.id] === option}
                        onClick={() => setValue(currentQuestion.id, option)}
                      >
                        {option}
                      </OptionButton>
                    ))
                  : null}

                {currentQuestion.type === "multi-select"
                  ? currentQuestion.options.map((option) => {
                      const selected = data[currentQuestion.id].includes(option);
                      return (
                        <OptionButton
                          key={option}
                          selected={selected}
                          onClick={() => toggleMultiValue(currentQuestion.id, option)}
                        >
                          {option}
                        </OptionButton>
                      );
                    })
                  : null}

                {currentQuestion.type === "multi-select" &&
                data[currentQuestion.id].includes(OTHER_OPTION) ? (
                  <input
                    type="text"
                    value={data[currentQuestion.otherField]}
                    onChange={(e) => setValue(currentQuestion.otherField, e.target.value)}
                    placeholder={currentQuestion.otherPlaceholder}
                    className="w-full rounded-[18px] border border-[#efefef] bg-[#fafafa] px-5 py-4 text-[14px] text-[#111111] placeholder-[#b6bcc6] outline-none transition focus:border-[#95dbda] focus:bg-white"
                  />
                ) : null}

                {currentQuestion.id === "launchStatus" && data.launchStatus === "Yakında yayında" ? (
                  <div className="space-y-3 rounded-[20px] border border-[#efefef] bg-[#fafafa] p-4">
                    <label className="block text-[13px] font-semibold text-[#111111]">Planlanan yayın tarihi</label>
                    <input
                      type="date"
                      value={data.launchDate}
                      onChange={(e) => setValue("launchDate", e.target.value)}
                      className="w-full rounded-[16px] border border-[#e6e6e6] bg-white px-4 py-3 text-[14px] text-[#111111] outline-none transition focus:border-[#95dbda]"
                    />
                    {launchAdvice ? <p className="text-[12px] leading-5 text-[#666d80]">{launchAdvice}</p> : null}
                  </div>
                ) : null}

                {currentQuestion.id === "launchStatus" && data.launchStatus !== "Yakında yayında" && launchAdvice ? (
                  <div className="rounded-[18px] border border-[#efefef] bg-[#fafafa] px-4 py-3 text-[12px] leading-5 text-[#666d80]">
                    {launchAdvice}
                  </div>
                ) : null}
              </div>
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap items-center gap-3 md:justify-end">
            {(currentPill > 1 || questionIndex > 0) ? (
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
              className={`min-w-[180px] rounded-full px-6 py-3 text-[14px] font-semibold transition ${
                canProceed() && !loading
                  ? "bg-[#ffd7ef] text-[#111111] hover:bg-[#f7c8e2]"
                  : "bg-[#f1f1f1] text-[#a0a0a0] cursor-not-allowed"
              }`}
            >
              {isLastQuestionInPill && isLastPill
                ? loading
                  ? "Plan hazırlanıyor…"
                  : "Planımı Oluştur ✦"
                : "Devam Et"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
