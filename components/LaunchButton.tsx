"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface LaunchButtonProps {
  productId: string;
  locale: string;
}

const REVIEW_ITEMS = [
  {
    id: "listing",
    title: "Store, site veya launch sayfasındaki son metinleri kontrol ettim",
    description: "Kullanıcı ilk gördüğü yerde vaat ve yönlendirme artık net.",
  },
  {
    id: "access",
    title: "Temel akışlar, linkler ve gerekirse test hesabı çalışıyor",
    description: "Launch anında kırık onboarding veya ölü link bırakmıyorum.",
  },
  {
    id: "feedback",
    title: "İlk kullanıcı sinyallerini toplayacağım kanal hazır",
    description: "Destek, form, DM veya analytics tarafında ilk feedback boşta kalmayacak.",
  },
];

export default function LaunchButton({ productId, locale }: LaunchButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [confirmLive, setConfirmLive] = useState(false);

  const readyForLaunch = useMemo(
    () => REVIEW_ITEMS.every((item) => checked[item.id]) && confirmLive,
    [checked, confirmLive]
  );

  async function handleLaunch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LAUNCHED" }),
      });
      if (res.ok) {
        setOpen(false);
        router.push(`/${locale}/growth`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleReviewItem(id: string) {
    setChecked((current) => ({ ...current, [id]: !current[id] }));
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[14px] font-semibold text-white transition hover:bg-[#333]"
      >
        Launch&apos;a hazırım
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d12]/35 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[640px] rounded-[28px] border border-[#e8e8e8] bg-white p-6 shadow-[0_24px_80px_rgba(13,13,18,0.18)] sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80]">
                  Son launch kontrolu
                </p>
                <h3 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                  Launch edildi demeden once son bir tur
                </h3>
                <p className="mt-2 max-w-[520px] text-[14px] leading-6 text-[#666d80]">
                  Bu kisa kontrol listesi kapaninca urunu yayinda kabul edecegiz ve seni growth alanina gecirecegiz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e8e8e8] text-[#666d80] transition hover:bg-[#f6f6f6]"
                aria-label="Launch onay penceresini kapat"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {REVIEW_ITEMS.map((item) => {
                const active = Boolean(checked[item.id]);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleReviewItem(item.id)}
                    className={`w-full rounded-[18px] border p-4 text-left transition ${
                      active
                        ? "border-[#95dbda] bg-[#f0fffe]"
                        : "border-[#e8e8e8] bg-[#fcfcfc] hover:border-[#d7dbe3]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                          active
                            ? "border-[#95dbda] bg-[#95dbda] text-white"
                            : "border-[#d0d5dd] bg-white text-transparent"
                        }`}
                      >
                        ✓
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-[#0d0d12]">
                          {item.title}
                        </p>
                        <p className="mt-1 text-[13px] leading-6 text-[#666d80]">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 rounded-[18px] border border-[#ffd7ef] bg-[#fff7fb] p-4">
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="checkbox"
                  checked={confirmLive}
                  onChange={(event) => setConfirmLive(event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-[#d0d5dd] text-[#0d0d12] focus:ring-[#95dbda]"
                />
                <div>
                  <p className="text-[14px] font-semibold text-[#0d0d12]">
                    Evet, urunu artik launch edildi olarak isaretlemek istiyorum
                  </p>
                  <p className="mt-1 text-[13px] leading-6 text-[#666d80]">
                    Bunu onaylayinca pre-launch asamasi kapanir ve sonraki ekran growth odakli acilir.
                  </p>
                </div>
              </label>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[12px] leading-5 text-[#8a8fa0]">
                Kritik olmayan launch maddeleri yine launch sayfasinda kalir; ama ana ritim artik growth tarafina gecer.
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="inline-flex h-11 items-center justify-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                >
                  Biraz daha bakayim
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!readyForLaunch || loading}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading ? "Growth'a geciliyor..." : "Launch edildi, growth'a gec"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
