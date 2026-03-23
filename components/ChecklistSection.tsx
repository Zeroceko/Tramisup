"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  title: string;
  completed: boolean;
  priority: string;
  linkedTaskId: string | null;
}

interface ChecklistSectionProps {
  checklistsByCategory: Record<string, ChecklistItem[]>;
  productId: string;
  onCreateTask: (itemId: string) => Promise<void>;
}

// Figma-matching labels for launch categories
const CATEGORY_LABELS: Record<string, string> = {
  PRODUCT:   "Store & Listing",
  MARKETING: "Görseller & Materyaller",
  LEGAL:     "Compliance & Legal",
  TECH:      "Teknik Hazırlık",
};

// Segmented progress bar (Figma style: small blocks)
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

export default function ChecklistSection({
  checklistsByCategory,
  productId: _productId,
  onCreateTask,
}: ChecklistSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const categories = Object.keys(CATEGORY_LABELS).filter(
    (k) => (checklistsByCategory[k] ?? []).length > 0
  );

  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "PRODUCT");

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    setLoading(itemId);
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      router.refresh();
    } catch {
      // noop
    } finally {
      setLoading(null);
    }
  };

  const handleCreateTask = async (itemId: string) => {
    setLoading(itemId);
    try {
      await onCreateTask(itemId);
    } finally {
      setLoading(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center">
        <p className="text-[14px] font-semibold text-[#0d0d12]">Checklist hazırlanıyor</p>
        <p className="mt-1 text-[13px] text-[#666d80]">AI planın oluşturulmasını bekle.</p>
      </div>
    );
  }

  const activeItems = checklistsByCategory[activeCategory] ?? [];
  const activeCompleted = activeItems.filter((i) => i.completed).length;

  return (
    <div>
      {/* Horizontal category cards — Figma style */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const items = checklistsByCategory[cat] ?? [];
          const done = items.filter((i) => i.completed).length;
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
                {done}/{items.length}
              </p>
              <SegmentBar completed={done} total={items.length} active={isActive} />
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-[#666d80]">{activeCompleted}/{activeItems.length}</span>
            <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f6f6f6] text-[#666d80]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14"/>
              </svg>
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f6f6f6] text-[#666d80]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
              </svg>
            </button>
          </div>
        </div>

        <div className="divide-y divide-[#f6f6f6]">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className={`flex items-center gap-4 px-6 py-4 transition ${
                loading === item.id ? "opacity-60" : ""
              } ${item.completed ? "bg-[#fafffe]" : "hover:bg-[#fafafa]"}`}
            >
              {/* Checkbox */}
              <button
                onClick={() => handleToggle(item.id, item.completed)}
                disabled={loading === item.id}
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                  item.completed
                    ? "border-[#95dbda] bg-[#95dbda]"
                    : "border-[#d9d9d9] hover:border-[#95dbda]"
                }`}
              >
                {item.completed && (
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>

              {/* Text */}
              <p
                className={`flex-1 text-[14px] ${
                  item.completed ? "line-through text-[#9ca3af]" : "text-[#0d0d12]"
                }`}
              >
                {item.title}
              </p>

              {/* Action */}
              <div className="flex items-center gap-2 shrink-0">
                {!item.completed && !item.linkedTaskId && (
                  <button
                    onClick={() => handleCreateTask(item.id)}
                    disabled={loading === item.id}
                    className="hidden h-6 items-center rounded-full bg-[#f6f6f6] px-3 text-[11px] font-medium text-[#666d80] transition hover:bg-[#ffd7ef] hover:text-[#0d0d12] sm:flex"
                  >
                    {loading === item.id ? "..." : "+ Görev"}
                  </button>
                )}
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
