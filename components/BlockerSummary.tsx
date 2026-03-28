"use client";

import { useState } from "react";

// Severity: LEGAL/TECH blockers are CRITICAL — they carry higher launch risk
// PRODUCT/MARKETING blockers are IMPORTANT — serious but not immediate existential risk
type Severity = "CRITICAL" | "IMPORTANT";

function getSeverity(category: string): Severity {
  return category === "LEGAL" || category === "TECH" ? "CRITICAL" : "IMPORTANT";
}

interface Blocker {
  id: string;
  title: string;
  category: string;
  priority: string;
  linkedTaskId?: string;
}

interface BlockerSummaryProps {
  blockers: Blocker[];
  ignoredBlockers: Blocker[];
  onCreateTask: (itemId: string) => Promise<void>;
  onIgnore: (itemId: string, ignored: boolean) => Promise<void>;
  locale?: string;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { border: string; bg: string; dot: string; badge: string; label: string; labelEn: string; reason: string; reasonEn: string }
> = {
  CRITICAL: {
    border: "border-[#fecaca]",
    bg: "bg-[#fff8f8]",
    dot: "bg-[#ef4444]",
    badge: "bg-[#fee2e2] text-[#b91c1c]",
    label: "Kritik",
    labelEn: "Critical",
    reason: "Bu madde launch'ı doğrudan bloke eder",
    reasonEn: "This directly blocks your launch",
  },
  IMPORTANT: {
    border: "border-[#fde68a]",
    bg: "bg-[#fffdf5]",
    dot: "bg-[#f59e0b]",
    badge: "bg-[#fef3c7] text-[#92400e]",
    label: "Önemli",
    labelEn: "Important",
    reason: "Yayına geçmeden önce kapanmalı",
    reasonEn: "Should be resolved before launch",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT: "Ürün",
  MARKETING: "Pazarlama",
  LEGAL: "Legal",
  TECH: "Teknik",
};

// Sort: CRITICAL before IMPORTANT, then alphabetical within
function sortBlockers(blockers: Blocker[]): Blocker[] {
  return [...blockers].sort((a, b) => {
    const sa = getSeverity(a.category);
    const sb = getSeverity(b.category);
    if (sa === "CRITICAL" && sb !== "CRITICAL") return -1;
    if (sb === "CRITICAL" && sa !== "CRITICAL") return 1;
    return 0;
  });
}

export default function BlockerSummary({
  blockers,
  ignoredBlockers,
  onCreateTask,
  onIgnore,
  locale = "en",
}: BlockerSummaryProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const isEn = locale === "en";

  if (blockers.length === 0 && ignoredBlockers.length === 0) return null;

  const criticalCount = blockers.filter(
    (b) => getSeverity(b.category) === "CRITICAL"
  ).length;
  const importantCount = blockers.length - criticalCount;
  const sorted = sortBlockers(blockers);

  const handleCreateTask = async (itemId: string) => {
    setLoading(itemId);
    try {
      await onCreateTask(itemId);
    } finally {
      setLoading(null);
    }
  };

  const handleIgnore = async (itemId: string, ignored: boolean) => {
    setLoading(itemId);
    try {
      await onIgnore(itemId, ignored);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div id="blockers" className="space-y-3">
      {/* Active blockers */}
      {blockers.length > 0 ? (
        <div className="rounded-[15px] border border-[#fecaca] bg-[#fff8f8] p-5">
          {/* Header */}
          <div className="flex items-start gap-3 mb-4">
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#fee2e2]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="text-[#ef4444]">
                <path
                  d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#0d0d12]">
                {isEn
                  ? `${blockers.length} blocker${blockers.length > 1 ? "s" : ""} holding the launch gate`
                  : `${blockers.length} blokaj launch gate'ini kilitledi`}
              </p>
              <p className="mt-0.5 text-[12px] text-[#94a3b8]">
                {criticalCount > 0 && importantCount > 0
                  ? isEn
                    ? `${criticalCount} critical (Legal/Tech) · ${importantCount} important`
                    : `${criticalCount} kritik (Legal/Teknik) · ${importantCount} önemli`
                  : criticalCount > 0
                    ? isEn
                      ? `${criticalCount} critical blocker${criticalCount > 1 ? "s" : ""} — Legal or Technical risk`
                      : `${criticalCount} kritik blokaj — Legal veya Teknik risk`
                    : isEn
                      ? `${importantCount} important blocker${importantCount > 1 ? "s" : ""}`
                      : `${importantCount} önemli blokaj`}
              </p>
            </div>
          </div>

          {/* Blocker list */}
          <div className="space-y-2">
            {sorted.map((blocker) => {
              const sev = getSeverity(blocker.category);
              const cfg = SEVERITY_CONFIG[sev];

              return (
                <div
                  key={blocker.id}
                  className={`rounded-[12px] border ${cfg.border} ${cfg.bg} p-4`}
                >
                  <div className="flex items-start gap-3">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${cfg.dot}`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="flex-1 text-[13px] font-semibold text-[#0d0d12] leading-snug">
                          {blocker.title}
                        </p>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.badge}`}>
                            {isEn ? cfg.labelEn : cfg.label}
                          </span>
                          <span className="text-[10px] text-[#94a3b8]">
                            {CATEGORY_LABELS[blocker.category] ?? blocker.category}
                          </span>
                        </div>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                        {isEn ? cfg.reasonEn : cfg.reason}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex items-center gap-2 pl-5">
                    {blocker.linkedTaskId ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-[#a7f3d0] bg-[#ecfdf5] px-2.5 py-1 text-[11px] font-medium text-[#065f46]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {isEn ? "Task created" : "Görev oluşturuldu"}
                      </span>
                    ) : (
                      <button
                        onClick={() => handleCreateTask(blocker.id)}
                        disabled={loading === blocker.id}
                        className="inline-flex h-7 items-center rounded-full bg-[#ffd7ef] px-3 text-[11px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:opacity-50"
                      >
                        {loading === blocker.id
                          ? "..."
                          : (isEn ? "Create task" : "Görev oluştur")}
                      </button>
                    )}
                    <button
                      onClick={() => handleIgnore(blocker.id, true)}
                      disabled={loading === blocker.id}
                      className="inline-flex h-7 items-center rounded-full border border-[#e8e8e8] bg-white px-3 text-[11px] font-medium text-[#94a3b8] transition hover:text-[#666d80] disabled:opacity-50"
                    >
                      {isEn ? "Ignore risk" : "Riski kabul et, geç"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Ignored blockers */}
      {ignoredBlockers.length > 0 && (
        <div className="rounded-[14px] border border-dashed border-[#fde68a] bg-[#fffdf5] p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className="shrink-0 text-[#f59e0b]">
                <path d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div>
                <p className="text-[12px] font-semibold text-[#92400e]">
                  {isEn
                    ? `${ignoredBlockers.length} ignored blocker${ignoredBlockers.length > 1 ? "s" : ""} — risk accepted`
                    : `${ignoredBlockers.length} yoksayılan blokaj — risk kabul edildi`}
                </p>
                <p className="text-[11px] text-[#a16207]">
                  {isEn
                    ? "These will appear as warnings in the launch confirmation."
                    : "Bunlar launch onayında uyarı olarak görünecek."}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {ignoredBlockers.map((blocker) => (
              <div
                key={blocker.id}
                className="flex items-center justify-between gap-3 rounded-[10px] border border-[#fde68a]/50 bg-white px-3 py-2.5"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#0d0d12]">
                    {blocker.title}
                  </p>
                  <p className="text-[10px] text-[#94a3b8]">
                    {CATEGORY_LABELS[blocker.category] ?? blocker.category}
                    {getSeverity(blocker.category) === "CRITICAL" && (
                      <span className="ml-1 text-[#ef4444]">
                        · {isEn ? "was critical" : "kritikti"}
                      </span>
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleIgnore(blocker.id, false)}
                  disabled={loading === blocker.id}
                  className="inline-flex h-7 shrink-0 items-center rounded-full border border-[#e8e8e8] bg-white px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                >
                  {isEn ? "Restore" : "Geri al"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
