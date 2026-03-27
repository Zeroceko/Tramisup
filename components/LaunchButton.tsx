"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

interface IgnoredBlocker {
  id: string;
  title: string;
  category: string;
}

interface LaunchButtonProps {
  productId: string;
  locale: string;
  /** Gate is open when no active blockers remain */
  gateOpen: boolean;
  /** Ignored blockers to surface in confirmation if any */
  ignoredBlockers?: IgnoredBlocker[];
  /** Non-critical items left open */
  nonCriticalRemaining?: number;
}

const REVIEW_ITEMS = [
  {
    id: "core_flows",
    title: "Temel akışlar test edildi",
    titleEn: "Core flows have been tested",
    description: "Kayıt, onboarding ve temel özellik kırık değil.",
    descriptionEn: "Sign-up, onboarding, and core features are not broken.",
  },
  {
    id: "listing",
    title: "Site veya uygulama sayfası hazır",
    titleEn: "Landing page or app listing is ready",
    description: "Kullanıcı seni bulduğunda ne yaptığını anlıyor.",
    descriptionEn: "When users find you, they understand what you do.",
  },
  {
    id: "feedback_channel",
    title: "İlk sinyal kanalı hazır",
    titleEn: "First feedback channel is ready",
    description: "Kullanıcılardan gelen ilk işaret kaybolmayacak.",
    descriptionEn: "First user signals won't be lost.",
  },
];

export default function LaunchButton({
  productId,
  locale,
  gateOpen,
  ignoredBlockers = [],
  nonCriticalRemaining = 0,
}: LaunchButtonProps) {
  const router = useRouter();
  const isEn = locale === "en";
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [riskAcknowledged, setRiskAcknowledged] = useState(false);
  const [confirmLive, setConfirmLive] = useState(false);

  const hasIgnoredRisks = ignoredBlockers.length > 0;

  const readyForLaunch = useMemo(() => {
    const reviewDone = REVIEW_ITEMS.every((item) => checked[item.id]);
    const riskOk = hasIgnoredRisks ? riskAcknowledged : true;
    return reviewDone && riskOk && confirmLive;
  }, [checked, riskAcknowledged, confirmLive, hasIgnoredRisks]);

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

  return (
    <>
      {/* Trigger — always visible, locked or unlocked */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => gateOpen && setOpen(true)}
          disabled={!gateOpen}
          className={`inline-flex h-12 items-center justify-center gap-2 rounded-full px-7 text-[14px] font-semibold transition ${
            gateOpen
              ? "bg-[#0d0d12] text-white hover:bg-[#333]"
              : "cursor-not-allowed bg-[#f0f0f0] text-[#94a3b8]"
          }`}
        >
          {gateOpen ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              {isEn ? "Launch the product" : "Ürünü launch et"}
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              {isEn ? "Resolve blockers to launch" : "Blokajları kapat, launch et"}
            </>
          )}
        </button>
        {!gateOpen && (
          <p className="text-[11px] text-[#94a3b8]">
            {isEn
              ? "Launch gate is locked while critical blockers remain"
              : "Kritik blokajlar kapanana kadar launch gate kilitli"}
          </p>
        )}
      </div>

      {/* Confirmation modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d0d12]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-[600px] max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#e8e8e8] bg-white p-6 shadow-[0_24px_80px_rgba(13,13,18,0.2)] sm:p-8">

            {/* Modal header */}
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#666d80]">
                  {isEn ? "Final launch check" : "Son launch kontrolü"}
                </p>
                <h3 className="mt-2 text-[26px] font-bold tracking-[-0.03em] text-[#0d0d12]">
                  {isEn ? "One last check before launch" : "Launch öncesi son bir tur"}
                </h3>
                {(nonCriticalRemaining > 0 || hasIgnoredRisks) && (
                  <p className="mt-1.5 text-[13px] leading-6 text-[#666d80]">
                    {isEn
                      ? "No critical blockers active. Confirm the points below to proceed."
                      : "Aktif kritik blokaj yok. Aşağıdaki noktaları onaylayarak devam et."}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#e8e8e8] text-[#666d80] transition hover:bg-[#f6f6f6]"
              >
                ×
              </button>
            </div>

            {/* Ignored risk warning — only shown when relevant */}
            {hasIgnoredRisks && (
              <div className="mb-5 rounded-[14px] border border-[#fde68a] bg-[#fffdf5] p-4">
                <div className="flex items-start gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="mt-0.5 shrink-0 text-[#f59e0b]">
                    <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div>
                    <p className="text-[12px] font-semibold text-[#92400e]">
                      {isEn
                        ? `${ignoredBlockers.length} blocker${ignoredBlockers.length > 1 ? "s" : ""} were ignored`
                        : `${ignoredBlockers.length} blokaj yoksayıldı`}
                    </p>
                    <ul className="mt-1.5 space-y-0.5">
                      {ignoredBlockers.map((b) => (
                        <li key={b.id} className="text-[11px] text-[#a16207]">
                          · {b.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* Review checklist */}
            <div className="space-y-2.5 mb-5">
              {REVIEW_ITEMS.map((item) => {
                const active = Boolean(checked[item.id]);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setChecked((c) => ({ ...c, [item.id]: !c[item.id] }))
                    }
                    className={`w-full rounded-[14px] border p-4 text-left transition ${
                      active
                        ? "border-[#95dbda] bg-[#f0fffe]"
                        : "border-[#e8e8e8] bg-[#fcfcfc] hover:border-[#d0d0d0]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                          active
                            ? "border-[#95dbda] bg-[#95dbda]"
                            : "border-[#d0d5dd] bg-white"
                        }`}
                      >
                        {active && (
                          <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <div>
                        <p className="text-[13px] font-semibold text-[#0d0d12]">
                          {isEn ? item.titleEn : item.title}
                        </p>
                        <p className="mt-0.5 text-[12px] leading-5 text-[#666d80]">
                          {isEn ? item.descriptionEn : item.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Risk acknowledgment — only when ignored blockers exist */}
            {hasIgnoredRisks && (
              <label className="mb-4 flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#fde68a] bg-[#fffdf5] p-4">
                <input
                  type="checkbox"
                  checked={riskAcknowledged}
                  onChange={(e) => setRiskAcknowledged(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#d0d5dd] accent-[#f59e0b]"
                />
                <div>
                  <p className="text-[13px] font-semibold text-[#0d0d12]">
                    {isEn
                      ? "I acknowledge the ignored risks and choose to launch anyway"
                      : "Yoksaydığım risklerin farkındayım, yine de launch etmeyi seçiyorum"}
                  </p>
                  <p className="mt-0.5 text-[12px] leading-5 text-[#94a3b8]">
                    {isEn
                      ? "You can fix these after launch from the Launch Readiness page."
                      : "Bu maddeleri launch sonrası Launch Readiness sayfasından tamamlayabilirsin."}
                  </p>
                </div>
              </label>
            )}

            {/* Final confirmation */}
            <label className="flex cursor-pointer items-start gap-3 rounded-[14px] border border-[#ffd7ef] bg-[#fff7fb] p-4">
              <input
                type="checkbox"
                checked={confirmLive}
                onChange={(e) => setConfirmLive(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#d0d5dd] accent-[#c45d97]"
              />
              <div>
                <p className="text-[13px] font-semibold text-[#0d0d12]">
                  {isEn
                    ? "Yes, I want to mark this product as launched"
                    : "Evet, bu ürünü launch edildi olarak işaretlemek istiyorum"}
                </p>
                <p className="mt-0.5 text-[12px] leading-5 text-[#666d80]">
                  {isEn
                    ? "Pre-launch phase closes. Your operating rhythm shifts to growth."
                    : "Pre-launch aşaması kapanır. Çalışma ritmi growth tarafına geçer."}
                </p>
              </div>
            </label>

            {/* Actions */}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[11px] leading-5 text-[#94a3b8] max-w-xs">
                {isEn
                  ? "Non-critical open items stay visible on the Launch Readiness page after launch."
                  : "Kritik olmayan açık maddeler launch sonrası Launch Readiness sayfasında görünmeye devam eder."}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={loading}
                  className="inline-flex h-10 items-center justify-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                >
                  {isEn ? "Not yet" : "Biraz daha bakayım"}
                </button>
                <button
                  type="button"
                  onClick={handleLaunch}
                  disabled={!readyForLaunch || loading}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading
                    ? (isEn ? "Launching..." : "Launch ediliyor...")
                    : (isEn ? "Mark as launched →" : "Launch edildi, growth'a geç →")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
