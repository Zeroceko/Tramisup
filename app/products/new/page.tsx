"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type WizardData = {
  name: string;
  description: string;
  category: string;
  targetAudience: string;
  businessModel: string;
  website: string;
  launchGoals: string[];
};

const STEPS = [
  "Ürünü Anlat",
  "Tipi & Kanallar",
  "Ürün Profili",
  "Veri & İzinler",
  "Launch Hazırlık",
  "Growth Setup",
  "Diğerleri",
];

const CATEGORIES = ["SaaS", "E-commerce", "Marketplace", "Mobile App", "Content/Media", "Diğer"];
const AUDIENCES  = ["Developers", "KOBİ", "Tüketiciler", "Kurumsal", "Diğer"];
const MODELS     = ["Subscription", "Freemium", "One-time", "Reklam", "Marketplace Fee", "Diğer"];
const GOALS      = [
  "İlk 100 kullanıcıya ulaş",
  "$1000 MRR'a ulaş",
  "Product-market fit kanıtla",
  "İlk paying customer'ı bul",
  "Beta launch yap",
  "Sürdürülebilir büyüme başlat",
];

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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border text-[14px] font-medium text-left transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#0d0d12]"
          : "border-[#e8e8e8] bg-white text-[#666d80] hover:border-[#95dbda] hover:text-[#0d0d12]"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-[#95dbda]" : "border-[#d0d0d0]"
        }`}
      >
        {selected && <span className="w-2 h-2 rounded-full bg-[#95dbda]" />}
      </span>
      {children}
    </button>
  );
}

function CheckButton({
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
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-[12px] border text-[14px] font-medium text-left transition ${
        selected
          ? "border-[#95dbda] bg-[#f0fafa] text-[#0d0d12]"
          : "border-[#e8e8e8] bg-white text-[#666d80] hover:border-[#95dbda] hover:text-[#0d0d12]"
      }`}
    >
      <span
        className={`w-4 h-4 rounded-[4px] border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-[#95dbda] bg-[#95dbda]" : "border-[#d0d0d0]"
        }`}
      >
        {selected && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </span>
      {children}
    </button>
  );
}

export default function NewProductWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<WizardData>({
    name: "",
    description: "",
    category: "",
    targetAudience: "",
    businessModel: "",
    website: "",
    launchGoals: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const canNext = () => {
    if (step === 1) return data.name.trim() !== "";
    if (step === 2) return data.category !== "";
    if (step === 3) return data.targetAudience !== "";
    if (step === 4) return data.businessModel !== "";
    return true;
  };

  const handleNext = () => {
    if (!canNext()) { setError("Bu alanı doldurmak gerekiyor."); return; }
    setError("");
    setStep((s) => Math.min(s + 1, 7));
  };

  const handleBack = () => { setError(""); setStep((s) => Math.max(s - 1, 1)); };

  const toggleGoal = (goal: string) =>
    setData((prev) => ({
      ...prev,
      launchGoals: prev.launchGoals.includes(goal)
        ? prev.launchGoals.filter((g) => g !== goal)
        : [...prev.launchGoals, goal],
    }));

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, seedData: false }),
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

  return (
    <div className="min-h-screen bg-[#f6f6f6] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/dashboard" className="text-[13px] text-[#666d80] hover:text-[#0d0d12] transition flex items-center gap-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Geri dön
          </Link>
          <span className="text-[12px] font-medium text-[#666d80]">{step} / 7</span>
        </div>

        {/* Progress bar */}
        <div className="flex gap-1 mb-8">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-[3px] flex-1 rounded-full transition-all"
              style={{ background: i < step ? "#95dbda" : "#e8e8e8" }}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-[20px] border border-[#e8e8e8] p-8 shadow-card">

          {/* Step label */}
          <div className="mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f0fafa] border border-[#95dbda]/30 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#5b5a64]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#95dbda]" />
              Adım {step} — {STEPS[step - 1]}
            </span>
          </div>

          {/* Error */}
          {error && (
            <div className="mt-4 px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-600">
              {error}
            </div>
          )}

          {/* ── Step content ── */}
          <div className="mt-6 space-y-3">

            {/* Step 1 */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-[13px] font-semibold text-[#0d0d12] mb-2">
                    Ürünün adı <span className="text-red-400">*</span>
                  </label>
                  <input
                    autoFocus
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && handleNext()}
                    placeholder="örn. TaskFlow, Notey…"
                    className="w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition"
                  />
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#0d0d12] mb-2">
                    Kısa açıklama
                  </label>
                  <textarea
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData({ ...data, description: e.target.value })}
                    placeholder="Ürünün ne yapıyor? Tek cümleyle anlat."
                    className="w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2 */}
            {step === 2 && (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#0d0d12] mb-3">
                  Kategori <span className="text-red-400">*</span>
                </p>
                {CATEGORIES.map((cat) => (
                  <OptionButton key={cat} selected={data.category === cat} onClick={() => setData({ ...data, category: cat })}>
                    {cat}
                  </OptionButton>
                ))}
              </div>
            )}

            {/* Step 3 */}
            {step === 3 && (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#0d0d12] mb-3">
                  Hedef kitle <span className="text-red-400">*</span>
                </p>
                {AUDIENCES.map((aud) => (
                  <OptionButton key={aud} selected={data.targetAudience === aud} onClick={() => setData({ ...data, targetAudience: aud })}>
                    {aud}
                  </OptionButton>
                ))}
              </div>
            )}

            {/* Step 4 */}
            {step === 4 && (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#0d0d12] mb-3">
                  İş modeli <span className="text-red-400">*</span>
                </p>
                {MODELS.map((m) => (
                  <OptionButton key={m} selected={data.businessModel === m} onClick={() => setData({ ...data, businessModel: m })}>
                    {m}
                  </OptionButton>
                ))}
              </div>
            )}

            {/* Step 5 */}
            {step === 5 && (
              <div className="space-y-2">
                <p className="text-[13px] font-semibold text-[#0d0d12] mb-3">
                  Launch hedeflerin
                </p>
                {GOALS.map((goal) => (
                  <CheckButton key={goal} selected={data.launchGoals.includes(goal)} onClick={() => toggleGoal(goal)}>
                    {goal}
                  </CheckButton>
                ))}
              </div>
            )}

            {/* Step 6 */}
            {step === 6 && (
              <div>
                <label className="block text-[13px] font-semibold text-[#0d0d12] mb-2">
                  Website URL <span className="text-[#9ca3af] font-normal">(opsiyonel)</span>
                </label>
                <input
                  type="url"
                  value={data.website}
                  onChange={(e) => setData({ ...data, website: e.target.value })}
                  placeholder="https://urunun.com"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition"
                />
              </div>
            )}

            {/* Step 7 */}
            {step === 7 && (
              <div className="space-y-4">
                <div className="rounded-[12px] bg-[#f6f6f6] p-5">
                  <p className="text-[13px] font-semibold text-[#0d0d12] mb-3">Özet</p>
                  <div className="space-y-2 text-[13px] text-[#666d80]">
                    <div className="flex justify-between">
                      <span>Ürün adı</span>
                      <span className="text-[#0d0d12] font-medium">{data.name || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Kategori</span>
                      <span className="text-[#0d0d12] font-medium">{data.category || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hedef kitle</span>
                      <span className="text-[#0d0d12] font-medium">{data.targetAudience || "—"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>İş modeli</span>
                      <span className="text-[#0d0d12] font-medium">{data.businessModel || "—"}</span>
                    </div>
                    {data.website && (
                      <div className="flex justify-between">
                        <span>Website</span>
                        <span className="text-[#0d0d12] font-medium truncate max-w-[180px]">{data.website}</span>
                      </div>
                    )}
                    {data.launchGoals.length > 0 && (
                      <div className="flex justify-between">
                        <span>Hedefler</span>
                        <span className="text-[#0d0d12] font-medium">{data.launchGoals.length} seçildi</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-[12px] border border-dashed border-[#95dbda]/50 p-4 text-[12px] text-[#666d80]">
                  <span className="font-semibold text-[#0d0d12]">Takım davetleri</span> yakında geliyor — Sprint 10&apos;da.
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={handleBack}
                disabled={loading}
                className="px-5 h-11 rounded-full border border-[#e8e8e8] text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6] transition disabled:opacity-50"
              >
                Geri
              </button>
            )}

            {step === 6 && (
              <button
                type="button"
                onClick={() => { setError(""); setStep(7); }}
                className="px-5 h-11 rounded-full border border-[#e8e8e8] text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6] transition"
              >
                Atla
              </button>
            )}

            {step < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`flex-1 h-11 rounded-full text-[14px] font-semibold transition ${
                  canNext()
                    ? "bg-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4]"
                    : "bg-[#f0f0f0] text-[#9ca3af] cursor-not-allowed"
                }`}
              >
                Devam Et
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 h-11 rounded-full bg-[#ffd7ef] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50"
              >
                {loading ? "Oluşturuluyor…" : "Ürünü Oluştur 🚀"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
