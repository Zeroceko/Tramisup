"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import Link from "next/link";

type WizardData = {
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  businessModel: string;
  launchStatus: string;
  launchGoals: string[];
  successMetric: string;
  growthChannels: string[];
};

type AiSuggestions = {
  successMetric?: string;
  growthChannels?: string[];
};

const PILLS = [
  { id: 1, label: "Ürünü Anlat" },
  { id: 2, label: "Kitle & Model" },
  { id: 3, label: "Hedefler & Büyüme" },
];

const CATEGORIES = [
  "SaaS",
  "E-commerce",
  "Marketplace",
  "Mobile App",
  "Content/Media",
  "Platform",
  "Diğer",
];

const AUDIENCES = [
  "Developers",
  "KOBİ",
  "Tüketiciler",
  "Kurumsal",
  "Startup'lar",
  "Freelancer'lar",
  "Diğer",
];

const BUSINESS_MODELS = [
  "Freemium",
  "Subscription",
  "One-time payment",
  "Usage-based",
  "Enterprise/Custom",
  "Marketplace fee",
];

const LAUNCH_STATUSES = [
  "Fikir aşamasında",
  "Geliştirme aşamasında",
  "Beta'da",
  "Yakında launch",
  "Launch oldu",
  "Büyüme aşamasında",
];

const LAUNCH_GOALS = [
  "İlk 100 kullanıcıya ulaş",
  "$1000 MRR'a ulaş",
  "İlk 10 paying customer",
  "Product-market fit kanıtla",
  "Beta feedback topla",
  "Viral loop kur",
];

const SUCCESS_METRICS = [
  "Kullanıcı sayısı",
  "MRR",
  "Activation rate",
  "Retention rate",
  "NPS",
  "Churn rate",
];

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

type Question = {
  id: string;
  type: "text" | "textarea" | "radio" | "checkbox";
  label: string;
  description?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
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
      label: "Hangi sorunu çözüyorsunuz?",
      placeholder: "Ürününüzü bir cümleyle tanımlayın",
      required: true,
    },
    {
      id: "category",
      type: "radio",
      label: "Hangi kategoriye giriyorsunuz?",
      options: CATEGORIES,
      required: true,
    },
  ],
  2: [
    {
      id: "targetAudience",
      type: "radio",
      label: "Ana hedef kitleniz kim?",
      options: AUDIENCES,
      required: true,
    },
    {
      id: "businessModel",
      type: "radio",
      label: "İş modeliniz nedir?",
      options: BUSINESS_MODELS,
      required: true,
    },
  ],
  3: [
    {
      id: "launchStatus",
      type: "radio",
      label: "Şu an hangi aşamadasınız?",
      options: LAUNCH_STATUSES,
      required: true,
    },
    {
      id: "launchGoals",
      type: "checkbox",
      label: "İlk 90 günde hangi hedeflere ulaşmak istiyorsunuz?",
      description: "İstediğiniz kadar seçebilirsiniz",
      options: LAUNCH_GOALS,
    },
    {
      id: "successMetric",
      type: "radio",
      label: "Başarıyı hangi metrikle ölçeceksiniz?",
      options: SUCCESS_METRICS,
      required: true,
    },
    {
      id: "growthChannels",
      type: "checkbox",
      label: "Büyüme için hangi kanalları kullanacaksınız?",
      description: "Öncelikli 2-3 kanal seçin",
      options: GROWTH_CHANNELS,
    },
  ],
};

const AI_SUGGESTED_FIELDS = new Set(["successMetric", "growthChannels"]);

function RecommendedBadge() {
  return (
    <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-[#fef9c3] px-2.5 py-0.5 text-[11px] font-semibold text-[#854d0e]">
      ✦ Önerilen
    </span>
  );
}

function OptionButton({
  selected,
  onClick,
  recommended,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  recommended?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[20px] border px-5 py-4 text-left text-[14px] font-medium transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#111111]"
          : recommended
          ? "border-[#fbbf24]/60 bg-[#fffbeb] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
          : "border-[#ececec] bg-[#fafafa] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span>{children}</span>
        {recommended && <RecommendedBadge />}
      </span>
    </button>
  );
}

function CheckButton({
  selected,
  onClick,
  recommended,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  recommended?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-[20px] border px-5 py-4 text-left text-[14px] font-medium transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#111111]"
          : recommended
          ? "border-[#fbbf24]/60 bg-[#fffbeb] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
          : "border-[#ececec] bg-[#fafafa] text-[#666d80] hover:border-[#95dbda] hover:bg-white hover:text-[#111111]"
      }`}
    >
      <span className="flex items-center justify-between gap-3">
        <span>{children}</span>
        {recommended && <RecommendedBadge />}
      </span>
    </button>
  );
}

function StepPills({
  currentPill,
  onPillClick,
}: {
  currentPill: number;
  onPillClick: (pill: number) => void;
}) {
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
  const locale = useLocale();
  const [currentPill, setCurrentPill] = useState(1);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [data, setData] = useState<Partial<WizardData>>({
    launchGoals: [],
    growthChannels: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestions>({});
  const [aiLoading, setAiLoading] = useState(false);

  const pillQuestions = PILL_QUESTIONS[currentPill] || [];
  const currentQuestion = pillQuestions[questionIndex];
  const isLastQuestionInPill = questionIndex === pillQuestions.length - 1;
  const isLastPill = currentPill === PILLS.length;

  const getValue = (id: string): any => {
    return (
      (data as any)[id] || (currentQuestion?.type === "checkbox" ? [] : "")
    );
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

  const getRecommended = (fieldId: string): string | string[] | undefined => {
    if (!AI_SUGGESTED_FIELDS.has(fieldId)) return undefined;
    return (aiSuggestions as any)[fieldId];
  };

  const isOptionRecommended = (fieldId: string, option: string): boolean => {
    const rec = getRecommended(fieldId);
    if (!rec) return false;
    if (Array.isArray(rec)) return rec.includes(option);
    return rec === option;
  };

  // Only show hint when suggestions are actually loaded for this field
  const hasActualRecommendation =
    currentQuestion !== undefined &&
    AI_SUGGESTED_FIELDS.has(currentQuestion.id) &&
    !aiLoading &&
    getRecommended(currentQuestion.id) !== undefined;

  const fetchAiSuggestions = async (wizardData: Partial<WizardData>) => {
    setAiLoading(true);
    try {
      const res = await fetch("/api/ai/wizard-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardData.name,
          description: wizardData.description,
          category: wizardData.category,
          targetAudience: wizardData.targetAudience,
          businessModel: wizardData.businessModel,
        }),
      });
      if (res.ok) {
        const suggestions = await res.json();
        setAiSuggestions(suggestions);
      }
    } catch {
      // Non-fatal
    } finally {
      setAiLoading(false);
    }
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
        // Leaving Pill 2 → fire AI (has category, audience, businessModel)
        if (currentPill === 2) {
          fetchAiSuggestions(data);
        }
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
    setValue(
      key,
      current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
    );
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          description: data.description,
          category: data.category,
          targetAudience: data.targetAudience,
          businessModel: data.businessModel,
          launchGoals: data.launchGoals,
          seedData: false,
          // Context for AI plan generation
          launchStatus: data.launchStatus,
          successMetric: data.successMetric,
          growthChannels: data.growthChannels,
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
          <div className="flex items-center gap-3">
            {aiLoading && (
              <span className="flex items-center gap-1.5 text-[12px] text-[#a07800]">
                <svg
                  className="animate-spin"
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray="40 20"
                  />
                </svg>
                Tiramisup analiz ediyor…
              </span>
            )}
            <span className="text-[12px] font-medium text-[#666d80]">
              {completedQuestions + 1} / {totalQuestions}
            </span>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#ededed] bg-white px-6 py-6 shadow-card md:px-10 md:py-8">
          <div className="mb-8 flex items-start justify-between gap-4">
            <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111111]">
              Yeni Ürün Oluştur
            </h1>
            <Link
              href={`/${locale}/dashboard`}
              aria-label="Kapat"
              className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#ececec] text-[20px] leading-none text-[#666d80] transition hover:border-[#d8d8d8] hover:text-[#111111]"
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
                  <p className="mt-2 text-[14px] text-[#6b7280]">
                    {currentQuestion.description}
                  </p>
                ) : null}
                {hasActualRecommendation && (
                  <p className="mt-2 text-[12px] text-[#a07800]">
                    ✦ Sarı seçenekler Tiramisup&apos;un size özel tavsiyesi
                  </p>
                )}
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

                {currentQuestion.type === "radio" && currentQuestion.options
                  ? currentQuestion.options.map((option) => (
                      <OptionButton
                        key={option}
                        selected={getValue(currentQuestion.id) === option}
                        onClick={() => setValue(currentQuestion.id, option)}
                        recommended={isOptionRecommended(
                          currentQuestion.id,
                          option
                        )}
                      >
                        {option}
                      </OptionButton>
                    ))
                  : null}

                {currentQuestion.type === "checkbox" && currentQuestion.options
                  ? currentQuestion.options.map((option) => (
                      <CheckButton
                        key={option}
                        selected={(getValue(currentQuestion.id) || []).includes(
                          option
                        )}
                        onClick={() =>
                          toggleArrayValue(currentQuestion.id, option)
                        }
                        recommended={isOptionRecommended(
                          currentQuestion.id,
                          option
                        )}
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
                canProceed() && !loading
                  ? "bg-[#ffd7ef] text-[#111111] hover:bg-[#f7c8e2]"
                  : "bg-[#f1f1f1] text-[#a0a0a0] cursor-not-allowed"
              }`}
            >
              {isLastPill && isLastQuestionInPill
                ? loading
                  ? "Planın oluşturuluyor…"
                  : "Planımı Oluştur"
                : "Devam Et"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
