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
  onCreateTask: (itemId: string) => Promise<void>;
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
  onCreateTask,
}: BlockerSummaryProps) {
  const [loading, setLoading] = useState<string | null>(null);

  if (blockers.length === 0) {
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

  return (
    <div className="mb-6 rounded-[15px] border border-[#ffccc7] bg-[#fff1f0] p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[20px]">🚨</span>
        <div>
          <p className="text-[14px] font-bold text-[#0d0d12]">
            {blockers.length} Blocker{blockers.length !== 1 ? "s" : ""}
          </p>
          <p className="text-[12px] text-[#ff7a7a]">
            High priority items blocking launch
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {blockers.map((blocker) => (
          <div
            key={blocker.id}
            className="flex items-start justify-between gap-3 p-3 bg-white rounded-[10px] border border-[#f0d6d0]"
          >
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-[#0d0d12] mb-1.5">
                {blocker.title}
              </p>
              <span
                className={`inline-block px-2 py-0.5 text-[11px] font-semibold rounded border ${
                  categoryColors[blocker.category] ||
                  categoryColors.PRODUCT
                }`}
              >
                {categoryLabels[blocker.category] || blocker.category}
              </span>
            </div>
            {blocker.linkedTaskId ? (
              <span className="text-[11px] font-semibold text-[#2d9d9b] px-2 py-1 rounded bg-[#f0fffe] border border-[#95dbda] shrink-0">
                ✓ Task Created
              </span>
            ) : (
              <button
                onClick={() => handleCreateTask(blocker.id)}
                disabled={loading === blocker.id}
                className="px-3 h-7 rounded-full text-[11px] font-semibold bg-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 shrink-0"
              >
                {loading === blocker.id ? "Creating..." : "Create Task"}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
