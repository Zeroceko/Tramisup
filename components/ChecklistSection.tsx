"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  title: string;
  description?: string | null;
  category?: string;
  completed: boolean;
  priority: string;
  linkedTaskId: string | null;
}

interface ChecklistSectionProps {
  checklistsByCategory: Record<string, ChecklistItem[]>;
  productId: string;
  onCreateTask: (itemId: string) => Promise<void>;
  ignoredItems: ChecklistItem[];
  locale?: string;
}

const CATEGORY_LABELS: Record<string, { label: string; risk: string; riskEn: string }> = {
  PRODUCT: {
    label: "Ürün hazırlığı",
    risk: "Temel kullanıcı deneyimini ve ilk değer anını etkiler",
    riskEn: "Affects the core user experience and first value moment",
  },
  MARKETING: {
    label: "Pazarlama",
    risk: "İlk trafik ve kullanıcı kazanımını etkiler",
    riskEn: "Affects initial traffic and user acquisition",
  },
  LEGAL: {
    label: "Compliance & Legal",
    risk: "Hukuki riskler launch'ı ve ürünü durdurabilir",
    riskEn: "Legal risks can stop the launch or the product",
  },
  TECH: {
    label: "Teknik Hazırlık",
    risk: "Teknik sorunlar kullanıcıları kaybettirir",
    riskEn: "Technical failures cause user drop-off at launch",
  },
};

const PRIORITY_CONFIG: Record<string, { dot: string; label: string; labelEn: string }> = {
  HIGH: { dot: "bg-[#ef4444]", label: "Kritik", labelEn: "Critical" },
  MEDIUM: { dot: "bg-[#f59e0b]", label: "Önemli", labelEn: "Important" },
  LOW: { dot: "bg-[#94a3b8]", label: "İsteğe bağlı", labelEn: "Optional" },
};

function SegmentBar({
  completed,
  total,
  active,
}: {
  completed: number;
  total: number;
  active: boolean;
}) {
  const segments = Math.max(total, 1);
  return (
    <div className="flex gap-[3px]">
      {Array.from({ length: segments }).map((_, i) => (
        <div
          key={i}
          className={`h-[8px] flex-1 rounded-[3px] transition-colors ${
            i < completed
              ? active
                ? "bg-[#95dbda]"
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
  ignoredItems,
  locale = "en",
}: ChecklistSectionProps) {
  const router = useRouter();
  const isEn = locale === "en";
  const [loading, setLoading] = useState<string | null>(null);
  const [expandedDesc, setExpandedDesc] = useState<string | null>(null);

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

  const handleIgnore = async (itemId: string, ignored: boolean) => {
    setLoading(itemId);
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ignored }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center">
        <p className="text-[14px] font-semibold text-[#0d0d12]">
          {isEn ? "No checklist yet" : "Henüz checklist oluşmadı"}
        </p>
        <p className="mt-1 text-[13px] text-[#666d80]">
          {isEn
            ? "Checklist items will appear once Tiramisup generates your launch plan."
            : "Bu ürün için launch checklist maddeleri henüz üretilemedi. Tiramisup önerileri hazırlanabildiğinde burada gerçek maddeler görünür."}
        </p>
      </div>
    );
  }

  const activeItems = checklistsByCategory[activeCategory] ?? [];
  const activeCompleted = activeItems.filter((i) => i.completed).length;
  const activeCritical = activeItems.filter(
    (i) => i.priority === "HIGH" && !i.completed
  ).length;
  const categoryMeta = CATEGORY_LABELS[activeCategory];

  return (
    <div>
      {/* Category selector cards */}
      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const items = checklistsByCategory[cat] ?? [];
          const done = items.filter((i) => i.completed).length;
          const critical = items.filter(
            (i) => i.priority === "HIGH" && !i.completed
          ).length;
          const isActive = cat === activeCategory;
          const meta = CATEGORY_LABELS[cat];

          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-[18px] p-4 text-left transition ${
                isActive
                  ? "bg-[#0d0d12] text-white"
                  : "border border-[#e8e8e8] bg-white text-[#0d0d12] hover:border-[#d0d0d0]"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <p
                  className={`text-[13px] font-semibold leading-snug ${
                    isActive ? "text-white" : "text-[#0d0d12]"
                  }`}
                >
                  {meta.label}
                </p>
                {isActive ? (
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                      <path d="M1 5L4.5 8.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                ) : critical > 0 ? (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                    {critical}
                  </span>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#94a3b8]">
                    <path d="M2.5 11.5L11.5 2.5M11.5 2.5H5M11.5 2.5V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>

              <p
                className={`text-[11px] mb-3 leading-4 ${
                  isActive ? "text-white/50" : "text-[#94a3b8]"
                }`}
              >
                {isEn ? "Completed" : "Tamamlandı"}
              </p>

              <p
                className={`text-[20px] font-bold mb-2.5 ${
                  isActive ? "text-white" : "text-[#0d0d12]"
                }`}
              >
                {done}/{items.length}
              </p>
              <SegmentBar completed={done} total={items.length} active={isActive} />
            </button>
          );
        })}
      </div>

      {/* Active category checklist */}
      <div className="rounded-[18px] border border-[#e8e8e8] bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <div className="flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#0d0d12]">
              <path d="M5 7L6.5 8.5L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="1" y="1" width="12" height="12" rx="3" stroke="currentColor" strokeWidth="1.3"/>
            </svg>
            <p className="text-[14px] font-semibold text-[#0d0d12]">
              {categoryMeta.label} {isEn ? "Checklist" : "Checklist"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f6f6f6] transition text-[#5e6678]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <button className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-[#f6f6f6] transition text-[#5e6678]">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="3" r="1" fill="currentColor"/>
                <circle cx="7" cy="7" r="1" fill="currentColor"/>
                <circle cx="7" cy="11" r="1" fill="currentColor"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Items */}
        <div className="flex flex-col gap-2 p-3">
          {activeItems.map((item) => {
            const isExpanded = expandedDesc === item.id;
            const isHigh = item.priority === "HIGH";

            return (
              <div
                key={item.id}
                className={`rounded-[14px] border transition ${
                  loading === item.id ? "opacity-50" : ""
                } ${
                  item.completed
                    ? "border-[#f0dce8] bg-[#fdf4f8]"
                    : isHigh
                      ? "border-[#e8e8e8] bg-white hover:border-[#fecaca]"
                      : "border-[#e8e8e8] bg-white hover:border-[#d8d8d8]"
                }`}
              >
                <div className="flex items-center gap-3 px-4 py-3.5">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    disabled={loading === item.id}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition ${
                      item.completed
                        ? "border-[#2d0e1f] bg-[#2d0e1f]"
                        : "border-[#d0d0d8] bg-white hover:border-[#95dbda]"
                    }`}
                  >
                    {item.completed && (
                      <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                        <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>

                  {/* Title + rationale */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium leading-snug ${item.completed ? "text-[#9ca3af]" : "text-[#0d0d12]"}`}>
                      {item.title}
                    </p>
                    {item.description && !item.completed && (() => {
                      // Parse structured rationale from description
                      const lines = item.description.split("\n").filter(Boolean);
                      const why = lines.find((l) => l.startsWith("Why:"))?.replace("Why:", "").trim();
                      const done = lines.find((l) => l.startsWith("Done when:"))?.replace("Done when:", "").trim();
                      const next = lines.find((l) => l.startsWith("Next action:"))?.replace("Next action:", "").trim();
                      const hasStructured = why || done || next;

                      if (hasStructured) {
                        return (
                          <>
                            <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] leading-4 text-[#8a8fa0]">
                              {why && <span title={isEn ? "Why this matters" : "Neden önemli"}>💡 {why}</span>}
                              {done && <span title={isEn ? "Done when" : "Tamamlanma kriteri"}>✓ {done}</span>}
                              {next && <span title={isEn ? "Next action" : "Sonraki adım"}>→ {next}</span>}
                            </div>
                            <button
                              type="button"
                              onClick={() => setExpandedDesc(isExpanded ? null : item.id)}
                              className="mt-0.5 text-[11px] text-[#94a3b8] hover:text-[#666d80] transition"
                            >
                              {isExpanded ? (isEn ? "Hide ↑" : "Gizle ↑") : (isEn ? "Full detail ↓" : "Tüm detay ↓")}
                            </button>
                            {isExpanded && (
                              <p className="mt-1.5 rounded-[8px] bg-[#f6f6f6] px-3 py-2 text-[12px] leading-5 text-[#5e6678]">
                                {item.description}
                              </p>
                            )}
                          </>
                        );
                      }

                      // Unstructured description fallback
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => setExpandedDesc(isExpanded ? null : item.id)}
                            className="mt-0.5 text-[11px] text-[#94a3b8] hover:text-[#666d80] transition"
                          >
                            {isExpanded ? (isEn ? "Hide ↑" : "Gizle ↑") : (isEn ? "Why this matters ↓" : "Neden önemli ↓")}
                          </button>
                          {isExpanded && (
                            <p className="mt-1.5 rounded-[8px] bg-[#f6f6f6] px-3 py-2 text-[12px] leading-5 text-[#5e6678]">
                              {item.description}
                            </p>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Right: actions + arrow */}
                  <div className="flex shrink-0 items-center gap-1.5">
                    {!item.completed && !item.linkedTaskId && (
                      <button
                        onClick={() => handleCreateTask(item.id)}
                        disabled={loading === item.id}
                        className="hidden h-7 items-center rounded-full bg-[#ffd7ef] px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:flex"
                      >
                        {loading === item.id ? "..." : (isEn ? "Add to tasks" : "Göreve ekle")}
                      </button>
                    )}
                    {!item.completed && !item.linkedTaskId && (
                      <button
                        onClick={() => handleIgnore(item.id, true)}
                        disabled={loading === item.id}
                        className="hidden h-7 items-center rounded-full border border-[#e8e8e8] px-3 text-[11px] font-medium text-[#94a3b8] transition hover:text-[#666d80] sm:flex"
                      >
                        {isEn ? "Ignore" : "Yoksay"}
                      </button>
                    )}
                    {item.linkedTaskId && !item.completed && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#34d399]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                    <span className="flex h-7 w-7 items-center justify-center rounded-full text-[#3b4a9e] hover:bg-[#f0f1fb] transition cursor-pointer">
                      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <path d="M2 11L11 2M11 2H4.5M11 2V8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Ignored items */}
      {ignoredItems.length > 0 && (
        <div className="mt-4 rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                {isEn ? "Ignored" : "Yoksayılanlar"}
              </p>
              <p className="mt-1 text-[13px] text-[#666d80]">
                {isEn
                  ? "These items were skipped. You can restore them anytime."
                  : "Bu maddeler şimdilik atlandı. İstediğinde geri alıp değerlendirebilirsin."}
              </p>
            </div>
            <span className="rounded-full bg-[#f6f6f6] px-3 py-1 text-[12px] font-medium text-[#4c5567]">
              {ignoredItems.length}
            </span>
          </div>

          <div className="mt-4 space-y-2">
            {ignoredItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 rounded-[12px] border border-[#f0f0f0] bg-[#fcfcfc] px-4 py-3"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium text-[#0d0d12]">
                    {item.title}
                  </p>
                  {item.category && (
                    <p className="mt-0.5 text-[11px] text-[#94a3b8]">
                      {CATEGORY_LABELS[item.category]?.label ?? item.category}
                      {item.priority === "HIGH" && (
                        <span className="ml-1.5 font-semibold text-[#ef4444]">
                          · {isEn ? "was critical" : "kritikti"}
                        </span>
                      )}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleIgnore(item.id, false)}
                  disabled={loading === item.id}
                  className="inline-flex h-7 items-center rounded-full border border-[#e8e8e8] px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6]"
                >
                  {isEn ? "Restore" : "Geri al"}
                </button>
                {!item.linkedTaskId && (
                  <button
                    type="button"
                    onClick={() => handleCreateTask(item.id)}
                    disabled={loading === item.id}
                    className="inline-flex h-7 items-center rounded-full bg-[#ffd7ef] px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f5c8e4]"
                  >
                    {isEn ? "Add to tasks" : "Göreve ekle"}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
