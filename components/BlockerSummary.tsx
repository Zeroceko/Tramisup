"use client";

import { useState } from "react";

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
}

const categoryColors: Record<string, string> = {
  PRODUCT: "bg-[#f0fffe] text-[#2d9d9b] border-[#95dbda]",
  MARKETING: "bg-[#fee74e]/20 text-[#a07800] border-[#fee74e]/50",
  LEGAL: "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]",
  TECH: "bg-[#f6f6f6] text-[#666d80] border-[#e8e8e8]",
};

const categoryLabels: Record<string, string> = {
  PRODUCT: "Product",
  MARKETING: "Marketing",
  LEGAL: "Legal",
  TECH: "Tech",
};

export default function BlockerSummary({
  blockers,
  ignoredBlockers,
  onCreateTask,
  onIgnore,
}: BlockerSummaryProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (blockers.length === 0 && ignoredBlockers.length === 0) {
    return null;
  }

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
    <div className="mb-6 rounded-[15px] border border-[#ffccc7] bg-[#fff1f0] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[20px]">🚨</span>
        <div>
          <p className="text-[14px] font-bold text-[#0d0d12]">
            {blockers.length} Blocker{blockers.length !== 1 ? "s" : ""}
          </p>
          <p className="text-[12px] text-[#ff7a7a]">
            Yüksek öncelikli ve launch akışını şu an durduran maddeler
          </p>
        </div>
      </div>

      {blockers.length > 0 ? (
        <div className="space-y-2">
          {blockers.map((blocker) => (
            <div
              key={blocker.id}
              className="flex items-start justify-between gap-3 rounded-[10px] border border-[#f0d6d0] bg-white p-3"
            >
              <div className="flex-1 min-w-0">
                <p className="mb-1.5 text-[13px] font-semibold text-[#0d0d12]">
                  {blocker.title}
                </p>
                <span
                  className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${
                    categoryColors[blocker.category] ||
                    categoryColors.PRODUCT
                  }`}
                >
                  {categoryLabels[blocker.category] || blocker.category}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!blocker.linkedTaskId ? (
                  <button
                    onClick={() => handleIgnore(blocker.id, true)}
                    disabled={loading === blocker.id}
                    className="h-7 rounded-full border border-[#f0d6d0] px-3 text-[11px] font-semibold text-[#8a5560] transition hover:bg-[#fff7f7] disabled:opacity-50"
                  >
                    {loading === blocker.id ? "..." : "Yoksay"}
                  </button>
                ) : null}
                {blocker.linkedTaskId ? (
                  <span className="shrink-0 rounded border border-[#95dbda] bg-[#f0fffe] px-2 py-1 text-[11px] font-semibold text-[#2d9d9b]">
                    Tasklara eklendi
                  </span>
                ) : (
                  <button
                    onClick={() => handleCreateTask(blocker.id)}
                    disabled={loading === blocker.id}
                    className="h-7 rounded-full bg-[#ffd7ef] px-3 text-[11px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:opacity-50"
                  >
                    {loading === blocker.id ? "..." : "Task oluştur"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[10px] border border-dashed border-[#f0d6d0] bg-white/70 px-4 py-3">
          <p className="text-[13px] font-medium text-[#0d0d12]">
            Aktif blocker kalmadı.
          </p>
          <p className="mt-1 text-[12px] text-[#8a5560]">
            Yoksaydığın blocker&apos;lar aşağıda duruyor; istersen geri alıp tekrar değerlendirebilirsin.
          </p>
        </div>
      )}

      {ignoredBlockers.length > 0 ? (
        <div className="mt-4 rounded-[12px] border border-dashed border-[#f0d6d0] bg-white/70 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a5560]">
                Yoksayılan blocker&apos;lar
              </p>
              <p className="mt-1 text-[13px] text-[#666d80]">
                Şimdilik launch akışından çıkardığın kritik maddeler burada durur.
              </p>
            </div>
            <span className="rounded-full bg-[#fff1f0] px-3 py-1 text-[12px] font-medium text-[#8a5560]">
              {ignoredBlockers.length} madde
            </span>
          </div>

          <div className="mt-3 space-y-2">
            {ignoredBlockers.map((blocker) => (
              <div
                key={blocker.id}
                className="flex items-start justify-between gap-3 rounded-[10px] border border-[#f6e3dd] bg-white px-3 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="mb-1.5 text-[13px] font-semibold text-[#0d0d12]">
                    {blocker.title}
                  </p>
                  <span
                    className={`inline-block rounded border px-2 py-0.5 text-[11px] font-semibold ${
                      categoryColors[blocker.category] ||
                      categoryColors.PRODUCT
                    }`}
                  >
                    {categoryLabels[blocker.category] || blocker.category}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={() => handleIgnore(blocker.id, false)}
                    disabled={loading === blocker.id}
                    className="h-7 rounded-full border border-[#e8e8e8] px-3 text-[11px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                  >
                    {loading === blocker.id ? "..." : "Geri al"}
                  </button>
                  {!blocker.linkedTaskId ? (
                    <button
                      onClick={() => handleCreateTask(blocker.id)}
                      disabled={loading === blocker.id}
                      className="h-7 rounded-full bg-[#ffd7ef] px-3 text-[11px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:opacity-50"
                    >
                      {loading === blocker.id ? "..." : "Task oluştur"}
                    </button>
                  ) : (
                    <span className="shrink-0 rounded border border-[#95dbda] bg-[#f0fffe] px-2 py-1 text-[11px] font-semibold text-[#2d9d9b]">
                      Tasklara eklendi
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
