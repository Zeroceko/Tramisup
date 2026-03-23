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

// Figma-matching labels for growth categories
const CATEGORY_LABELS: Record<string, string> = {
  ACQUISITION: "Analytics & Tracking",
  ACTIVATION:  "Organic Growth",
  RETENTION:   "Paid Acquisition",
  REVENUE:     "Retention & Engagement",
};

function SegmentBar({ completed, total, active }: { completed: number; total: number; active: boolean }) {
  const segments = Math.max(total, 1);
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-[6px] flex-1 rounded-[2px] transition-colors ${
            i < completed
              ? active
                ? "bg-white"
                : "bg-[#95dbda]"
              : active
                ? "bg-white/20"
                : "bg-[#e8e8e8]"
          }`}
        />
      ))}
    </div>
  );
}

interface GrowthChecklistSectionProps {
  items: GrowthItem[];
}

export default function GrowthChecklistSection({ items: initialItems }: GrowthChecklistSectionProps) {
  const [items, setItems] = useState(initialItems);

  const categories = Object.keys(CATEGORY_LABELS).filter(
    (cat) => items.some((i) => i.category === cat)
  );
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "ACQUISITION");

  async function toggleItem(id: string, current: boolean) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !current } : item))
    );
    const res = await fetch(`/api/growth-checklist/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !current }),
    });
    if (!res.ok) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, completed: current } : item))
      );
    }
  }

  if (items.length === 0) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center">
        <p className="text-[14px] font-semibold text-[#0d0d12]">Growth checklist hazırlanıyor</p>
        <p className="mt-1 text-[13px] text-[#666d80]">AI planın oluşturulmasını bekle.</p>
      </div>
    );
  }

  const activeItems = items
    .filter((i) => i.category === activeCategory)
    .sort((a, b) => a.order - b.order);
  const activeCompleted = activeItems.filter((i) => i.completed).length;
  const totalCompleted = items.filter((i) => i.completed).length;

  return (
    <div>
      {/* Horizontal category cards — Figma style */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          const done = catItems.filter((i) => i.completed).length;
          const isActive = cat === activeCategory;

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-[15px] p-4 text-left transition ${
                isActive
                  ? "bg-[#0d0d12] text-white"
                  : "border border-[#e8e8e8] bg-white text-[#0d0d12] hover:border-[#d0d0d0]"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <p className={`text-[13px] font-semibold leading-snug ${isActive ? "text-white" : "text-[#0d0d12]"}`}>
                  {CATEGORY_LABELS[cat]}
                </p>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <p className={`text-[11px] mb-2 ${isActive ? "text-white/60" : "text-[#666d80]"}`}>
                Tamamlandı
              </p>
              <p className={`text-[13px] font-bold mb-3 ${isActive ? "text-white" : "text-[#0d0d12]"}`}>
                {done}/{catItems.length}
              </p>
              <SegmentBar completed={done} total={catItems.length} active={isActive} />
            </button>
          );
        })}
      </div>

      {/* Checklist for active category */}
      <div className="rounded-[15px] border border-[#e8e8e8] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
            </svg>
            <p className="text-[14px] font-semibold text-[#0d0d12]">
              {CATEGORY_LABELS[activeCategory]} Checklist
            </p>
          </div>
          <span className="text-[12px] text-[#666d80]">
            {activeCompleted}/{activeItems.length}
          </span>
        </div>

        <div className="border-b border-[#f5f5f5] bg-[#fbfbfb] px-6 py-3">
          <p className="text-[12px] text-[#666d80]">
            Toplam ilerleme: <span className="font-semibold text-[#0d0d12]">{totalCompleted}/{items.length}</span>
          </p>
        </div>

        <div className="divide-y divide-[#f6f6f6]">
          {activeItems.map((item) => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id, item.completed)}
              className="flex w-full items-center gap-4 px-6 py-4 text-left transition hover:bg-[#fafafa]"
            >
              {/* Checkbox */}
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                  item.completed
                    ? "border-[#95dbda] bg-[#95dbda]"
                    : "border-[#d9d9d9]"
                }`}
              >
                {item.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>

              {/* Text */}
              <div className="flex-1 min-w-0 text-left">
                <p className={`text-[14px] ${item.completed ? "line-through text-[#9ca3af]" : "text-[#0d0d12]"}`}>
                  {item.title}
                </p>
                {item.description && !item.completed && (
                  <p className="mt-0.5 text-[12px] text-[#666d80] leading-5">{item.description}</p>
                )}
              </div>

              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
