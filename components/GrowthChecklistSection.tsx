"use client";

import { useState } from "react";

type GrowthItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  completed: boolean;
  order: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  ACQUISITION: "Edinim",
  ACTIVATION: "Aktivasyon",
  RETENTION: "Tutma",
  REVENUE: "Gelir",
};

const CATEGORY_COLORS: Record<string, string> = {
  ACQUISITION: "bg-[#ffd7ef]",
  ACTIVATION: "bg-[#d7f0ff]",
  RETENTION: "bg-[#d7ffd7]",
  REVENUE: "bg-[#fff3d7]",
};

interface GrowthChecklistSectionProps {
  items: GrowthItem[];
}

export default function GrowthChecklistSection({ items: initialItems }: GrowthChecklistSectionProps) {
  const [items, setItems] = useState(initialItems);

  async function toggleItem(id: string, current: boolean) {
    // Optimistic update
    setItems(prev => prev.map(item => item.id === id ? { ...item, completed: !current } : item));

    const res = await fetch(`/api/growth-checklist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    });

    if (!res.ok) {
      // Revert on failure
      setItems(prev => prev.map(item => item.id === id ? { ...item, completed: current } : item));
    }
  }

  const categories = ["ACQUISITION", "ACTIVATION", "RETENTION", "REVENUE"];
  const completedCount = items.filter(i => i.completed).length;
  const totalCount = items.length;

  if (totalCount === 0) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-8 text-center">
        <p className="text-[14px] font-semibold text-[#0d0d12]">Growth checklist hazırlanıyor</p>
        <p className="mt-1 text-[13px] text-[#666d80]">AI planın oluşturulmasını bekle.</p>
      </div>
    );
  }

  return (
    <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Büyüme planı</p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#0d0d12] tracking-[-0.01em]">Growth checklist</h2>
        </div>
        <span className="text-[13px] font-semibold text-[#666d80]">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-[#f6f6f6] rounded-full overflow-hidden mb-6">
        <div
          className="h-full rounded-full bg-[#95dbda] transition-all"
          style={{ width: totalCount > 0 ? `${Math.round((completedCount / totalCount) * 100)}%` : "0%" }}
        />
      </div>

      <div className="space-y-6">
        {categories.map(cat => {
          const catItems = items.filter(i => i.category === cat);
          if (catItems.length === 0) return null;
          return (
            <div key={cat}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-semibold text-[#0d0d12] ${CATEGORY_COLORS[cat]}`}>
                  {CATEGORY_LABELS[cat]}
                </span>
                <span className="text-[11px] text-[#666d80]">
                  {catItems.filter(i => i.completed).length}/{catItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {catItems.sort((a, b) => a.order - b.order).map(item => (
                  <button
                    key={item.id}
                    onClick={() => toggleItem(item.id, item.completed)}
                    className="w-full flex items-start gap-3 rounded-[10px] border border-[#e8e8e8] px-4 py-3 text-left transition hover:border-[#d0d0d0] hover:bg-[#fafafa]"
                  >
                    <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      item.completed
                        ? "border-[#75fc96] bg-[#75fc96]"
                        : "border-[#d9d9d9]"
                    }`}>
                      {item.completed && (
                        <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                          <path d="M1 3L3 5L7 1" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                    <div className="min-w-0">
                      <p className={`text-[13px] font-semibold ${item.completed ? "line-through text-[#999]" : "text-[#0d0d12]"}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="mt-0.5 text-[12px] text-[#666d80] leading-5">{item.description}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
