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
    label: "Store & Listing",
    risk: "Kullanıcı deneyimini ve ilk izlenimi etkiler",
    riskEn: "Affects user experience and first impression",
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
          className={`h-[5px] flex-1 rounded-[2px] transition-colors ${
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
              className={`rounded-[15px] p-4 text-left transition ${
                isActive
                  ? "bg-[#0d0d12] text-white"
                  : "border border-[#e8e8e8] bg-white text-[#0d0d12] hover:border-[#d0d0d0]"
              }`}
            >
              <div className="flex items-start justify-between mb-1">
                <p
                  className={`text-[13px] font-semibold leading-snug ${
                    isActive ? "text-white" : "text-[#0d0d12]"
                  }`}
                >
                  {meta.label}
                </p>
                {critical > 0 && (
                  <span className="ml-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#ef4444] text-[9px] font-bold text-white">
                    {critical}
                  </span>
                )}
              </div>

              <p
                className={`text-[11px] mb-2.5 leading-4 ${
                  isActive ? "text-white/50" : "text-[#94a3b8]"
                }`}
              >
                {isEn ? meta.riskEn : meta.risk}
              </p>

              <p
                className={`text-[13px] font-bold mb-2 ${
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
      <div className="rounded-[15px] border border-[#e8e8e8] bg-white overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-[#f0f0f0]">
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[14px] font-semibold text-[#0d0d12]">
                {categoryMeta.label}
              </p>
              <span className="text-[12px] text-[#94a3b8]">
                {activeCompleted}/{activeItems.length}
              </span>
              {activeCritical > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#fee2e2] px-2 py-0.5 text-[10px] font-semibold text-[#b91c1c]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#ef4444]" />
                  {activeCritical} {isEn ? "critical" : "kritik"}
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-[#94a3b8]">
              {isEn ? categoryMeta.riskEn : categoryMeta.risk}
            </p>
          </div>
        </div>

        {/* Items */}
        <div className="divide-y divide-[#f6f6f6]">
          {activeItems.map((item) => {
            const pri = PRIORITY_CONFIG[item.priority] ?? PRIORITY_CONFIG.LOW;
            const isExpanded = expandedDesc === item.id;
            const isHigh = item.priority === "HIGH";

            return (
              <div
                key={item.id}
                className={`transition ${
                  loading === item.id ? "opacity-50" : ""
                } ${
                  item.completed
                    ? "bg-[#fafffe]"
                    : isHigh && !item.completed
                      ? "bg-[#fff8f8]"
                      : "hover:bg-[#fafafa]"
                }`}
              >
                <div className="flex items-start gap-4 px-6 py-4">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleToggle(item.id, item.completed)}
                    disabled={loading === item.id}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition ${
                      item.completed
                        ? "border-[#95dbda] bg-[#95dbda]"
                        : isHigh
                          ? "border-[#ef4444] hover:border-[#ef4444] hover:bg-[#fee2e2]"
                          : "border-[#d9d9d9] hover:border-[#95dbda]"
                    }`}
                  >
                    {item.completed && (
                      <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                        <path
                          d="M1 4L3.5 6.5L9 1"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    )}
                  </button>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <p
                        className={`flex-1 text-[14px] leading-snug ${
                          item.completed
                            ? "line-through text-[#9ca3af]"
                            : "text-[#0d0d12]"
                        }`}
                      >
                        {item.title}
                      </p>

                      {/* Priority badge — only for HIGH and MEDIUM */}
                      {!item.completed && item.priority !== "LOW" && (
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#e8e8e8]">
                          <span className={`h-1.5 w-1.5 rounded-full ${pri.dot}`} />
                          <span className="text-[#666d80]">
                            {isEn ? pri.labelEn : pri.label}
                          </span>
                        </span>
                      )}
                    </div>

                    {/* Description — expandable */}
                    {item.description && !item.completed && (
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedDesc(isExpanded ? null : item.id)
                        }
                        className="mt-1 text-[11px] font-medium text-[#94a3b8] hover:text-[#666d80] transition"
                      >
                        {isExpanded
                          ? (isEn ? "Hide detail" : "Detayı gizle")
                          : (isEn ? "Why this matters" : "Neden önemli")}
                        {" "}
                        {isExpanded ? "↑" : "↓"}
                      </button>
                    )}
                    {isExpanded && item.description && (
                      <p className="mt-1.5 rounded-[8px] bg-[#f6f6f6] px-3 py-2 text-[12px] leading-5 text-[#5e6678]">
                        {item.description}
                      </p>
                    )}

                    {/* Task link status */}
                    {item.linkedTaskId && !item.completed && (
                      <span className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-[#34d399]">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        {isEn ? "Task created" : "Görev oluşturuldu"}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  {!item.completed && (
                    <div className="flex shrink-0 items-center gap-1.5">
                      {!item.linkedTaskId && (
                        <button
                          onClick={() => handleCreateTask(item.id)}
                          disabled={loading === item.id}
                          className="hidden h-7 items-center rounded-full bg-[#ffd7ef] px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:flex"
                        >
                          {loading === item.id
                            ? "..."
                            : (isEn ? "Add to tasks" : "Göreve ekle")}
                        </button>
                      )}
                      {!item.linkedTaskId && (
                        <button
                          onClick={() => handleIgnore(item.id, true)}
                          disabled={loading === item.id}
                          className="hidden h-7 items-center rounded-full border border-[#e8e8e8] px-3 text-[11px] font-medium text-[#94a3b8] transition hover:border-[#d5d9e2] hover:text-[#666d80] sm:flex"
                        >
                          {isEn ? "Ignore" : "Yoksay"}
                        </button>
                      )}
                    </div>
                  )}
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
