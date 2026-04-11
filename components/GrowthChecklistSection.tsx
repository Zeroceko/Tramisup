"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type GrowthItem = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  completed: boolean;
  order: number;
};

type CategoryMeta = { label: string; risk: string };

const CATEGORY_META_EN: Record<string, CategoryMeta> = {
  ACQUISITION: {
    label: "Acquisition & Distribution",
    risk: "Defines where new users come from and whether traffic quality is strong enough.",
  },
  ACTIVATION: {
    label: "Activation & Onboarding",
    risk: "Shows whether users reach first value fast enough after they arrive.",
  },
  RETENTION: {
    label: "Retention & Habit",
    risk: "Keeps Growth honest about whether users return or usage fades out.",
  },
  REVENUE: {
    label: "Revenue & Monetization",
    risk: "Clarifies whether value is turning into paid behavior or repeat revenue.",
  },
};

const CATEGORY_META_TR: Record<string, CategoryMeta> = {
  ACQUISITION: {
    label: "Edinim & Dağıtım",
    risk: "Yeni kullanıcıların nereden geldiğini ve trafik kalitesinin yeterince güçlü olup olmadığını tanımlar.",
  },
  ACTIVATION: {
    label: "Aktivasyon & İlk Değer",
    risk: "Kullanıcıların geldikten sonra ilk değere ne kadar hızlı ulaştığını gösterir.",
  },
  RETENTION: {
    label: "Tutundurma & Alışkanlık",
    risk: "Kullanıcıların geri dönüp dönmediğini veya kullanımın azalıp azalmadığını ortaya koyar.",
  },
  REVENUE: {
    label: "Gelir & Monetizasyon",
    risk: "Değerin ödeme davranışına veya tekrarlayan gelire dönüşüp dönüşmediğini netleştirir.",
  },
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

function parseStructuredDescription(description: string | null) {
  if (!description) return null;

  const lines = description
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const why = lines.find((line) => line.startsWith("Why:"))?.replace("Why:", "").trim();
  const done = lines.find((line) => line.startsWith("Done when:"))?.replace("Done when:", "").trim();
  const next = lines.find((line) => line.startsWith("Next action:"))?.replace("Next action:", "").trim();

  if (!why && !done && !next) {
    return {
      plain: description,
      why: null,
      done: null,
      next: null,
      hasStructuredFields: false,
    };
  }

  return {
    plain: description,
    why: why ?? null,
    done: done ?? null,
    next: next ?? null,
    hasStructuredFields: true,
  };
}

interface GrowthChecklistSectionProps {
  items: GrowthItem[];
  locale: string;
  productId: string;
  initialCategory?: string;
  focusNote?: string | null;
}

export default function GrowthChecklistSection({
  items: initialItems,
  locale,
  productId,
  initialCategory,
  focusNote = null,
}: GrowthChecklistSectionProps) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [loadingItemId, setLoadingItemId] = useState<string | null>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [taskAddedIds, setTaskAddedIds] = useState<string[]>([]);
  const isEn = locale === "en";
  const CATEGORY_META = isEn ? CATEGORY_META_EN : CATEGORY_META_TR;
  const categories = Object.keys(CATEGORY_META_EN).filter((cat) =>
    items.some((i) => i.category === cat)
  );
  const firstIncompleteCategory =
    categories.find((cat) =>
      items.some((item) => item.category === cat && !item.completed)
    ) ?? categories[0] ?? "ACQUISITION";
  const defaultCategory =
    initialCategory && categories.includes(initialCategory)
      ? initialCategory
      : firstIncompleteCategory;
  const [activeCategory, setActiveCategory] = useState(defaultCategory);

  async function toggleItem(id: string, current: boolean) {
    setLoadingItemId(id);
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
    setLoadingItemId(null);
  }

  async function createTaskFromItem(item: GrowthItem) {
    setLoadingItemId(item.id);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          title: item.title,
          description: item.description,
          priority: "MEDIUM",
          category: item.category,
        }),
      });

      if (!res.ok) {
        throw new Error("task_create_failed");
      }

      setTaskAddedIds((current) =>
        current.includes(item.id) ? current : [...current, item.id]
      );
      router.refresh();
    } finally {
      setLoadingItemId(null);
    }
  }

  const activeItems = useMemo(
    () =>
      items
        .filter((item) => item.category === activeCategory)
        .sort((a, b) => a.order - b.order),
    [activeCategory, items]
  );
  const activeCompleted = activeItems.filter((item) => item.completed).length;
  const totalCompleted = items.filter((item) => item.completed).length;
  const activeOpen = activeItems.filter((item) => !item.completed).length;
  const activeMeta = CATEGORY_META[activeCategory];

  if (items.length === 0) {
    return (
      <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white p-10 text-center">
        <p className="text-[14px] font-semibold text-[#0d0d12]">{isEn ? "No growth checklist yet" : "Henüz growth checklist oluşmadı"}</p>
        <p className="mt-1 text-[13px] text-[#666d80]">
          {isEn
            ? "Growth execution items have not been generated for this product yet. Metric setup still works; the checklist will appear here once it is ready."
            : "Bu ürün için growth execution maddeleri henüz üretilmedi. Metric setup yine çalışır; checklist hazır olduğunda burada görünür."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {focusNote ? (
        <div className="mb-4 rounded-[15px] border border-[#e8ecf3] bg-[#f8fbfd] px-5 py-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6f7482]">
            {isEn ? "Current diagnosis" : "Mevcut teşhis"}
          </p>
          <p className="mt-1 text-[13px] leading-6 text-[#4c5567]">{focusNote}</p>
        </div>
      ) : null}

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {categories.map((cat) => {
          const catItems = items.filter((i) => i.category === cat);
          const done = catItems.filter((i) => i.completed).length;
          const isActive = cat === activeCategory;
          const meta = CATEGORY_META[cat];

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
              <div className="mb-2 flex items-start justify-between">
                <p className={`text-[13px] font-semibold leading-snug ${isActive ? "text-white" : "text-[#0d0d12]"}`}>
                  {meta.label}
                </p>
                {isActive && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                )}
              </div>
              <p className={`mb-3 text-[11px] leading-4 ${isActive ? "text-white/60" : "text-[#666d80]"}`}>
                {meta.risk}
              </p>
              <p className={`mb-3 text-[13px] font-bold ${isActive ? "text-white" : "text-[#0d0d12]"}`}>
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
          <div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#0d0d12" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              <p className="text-[14px] font-semibold text-[#0d0d12]">
                {activeMeta.label} {isEn ? "Checklist" : "Checklist"}
              </p>
            </div>
            <p className="mt-1 text-[12px] leading-5 text-[#7b8393]">
              {activeMeta.risk}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[12px] text-[#666d80]">
              {activeCompleted}/{activeItems.length}
            </span>
            <p className="mt-1 text-[11px] text-[#94a3b8]">
              {activeOpen > 0
                ? isEn
                  ? `${activeOpen} open`
                  : `${activeOpen} açık`
                : isEn
                  ? "All complete"
                  : "Tamamlandı"}
            </p>
          </div>
        </div>

        <div className="border-b border-[#f5f5f5] bg-[#fbfbfb] px-6 py-3">
          <p className="text-[12px] text-[#666d80]">
            {isEn ? "Overall progress:" : "Toplam ilerleme:"} <span className="font-semibold text-[#0d0d12]">{totalCompleted}/{items.length}</span>
          </p>
        </div>

        <div className="flex flex-col gap-2 p-3">
          {activeItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-[14px] border transition ${
                item.completed
                  ? "border-[#e6f5f2] bg-[#f6fffc]"
                  : "border-[#e8e8e8] bg-white hover:border-[#d8d8d8]"
              } ${loadingItemId === item.id ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3 px-4 py-3.5">
                <button
                  type="button"
                  onClick={() => toggleItem(item.id, item.completed)}
                  disabled={loadingItemId === item.id}
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-[7px] border-2 transition ${
                    item.completed
                      ? "border-[#0d0d12] bg-[#0d0d12]"
                      : "border-[#d0d0d8] bg-white hover:border-[#95dbda]"
                  }`}
                >
                  {item.completed && (
                    <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
                      <path d="M1 4.5L4 7.5L10 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <p className={`text-[14px] font-medium leading-snug ${item.completed ? "text-[#9ca3af] line-through" : "text-[#0d0d12]"}`}>
                    {item.title}
                  </p>

                  {item.description && (() => {
                    const structured = parseStructuredDescription(item.description);
                    if (!structured) return null;

                    const isExpanded = expandedItemId === item.id;

                    if (structured.hasStructuredFields) {
                      return (
                        <>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {structured.why ? (
                              <span className="rounded-full bg-[#f6f6f6] px-2.5 py-1 text-[11px] text-[#5e6678]">
                                {isEn ? "Why" : "Neden"}: {structured.why}
                              </span>
                            ) : null}
                            {structured.done ? (
                              <span className="rounded-full bg-[#f6f6f6] px-2.5 py-1 text-[11px] text-[#5e6678]">
                                {isEn ? "Done when" : "Tamamlanma"}: {structured.done}
                              </span>
                            ) : null}
                            {structured.next ? (
                              <span className="rounded-full bg-[#f6f6f6] px-2.5 py-1 text-[11px] text-[#5e6678]">
                                {isEn ? "Next" : "Sonraki"}: {structured.next}
                              </span>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="mt-1.5 text-[11px] text-[#94a3b8] transition hover:text-[#666d80]"
                          >
                            {isExpanded
                              ? isEn ? "Hide detail ↑" : "Detayı gizle ↑"
                              : isEn ? "Full detail ↓" : "Tüm detay ↓"}
                          </button>
                          {isExpanded ? (
                            <p className="mt-2 rounded-[8px] bg-[#f6f6f6] px-3 py-2 text-[12px] leading-5 text-[#5e6678]">
                              {structured.plain}
                            </p>
                          ) : null}
                        </>
                      );
                    }

                    return !item.completed ? (
                      <p className="mt-1.5 text-[12px] leading-5 text-[#666d80]">
                        {structured.plain}
                      </p>
                    ) : null;
                  })()}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  {!item.completed && !taskAddedIds.includes(item.id) ? (
                    <button
                      type="button"
                      onClick={() => createTaskFromItem(item)}
                      disabled={loadingItemId === item.id}
                      className="hidden h-7 items-center rounded-full bg-[#ffd7ef] px-3 text-[11px] font-medium text-[#0d0d12] transition hover:bg-[#f5c8e4] sm:inline-flex"
                    >
                      {loadingItemId === item.id
                        ? "..."
                        : isEn ? "Add to tasks" : "Göreve ekle"}
                    </button>
                  ) : null}

                  {taskAddedIds.includes(item.id) ? (
                    <span className="hidden rounded-full bg-[#f0fffe] px-3 py-1 text-[11px] font-medium text-[#0f766e] sm:inline-flex">
                      {isEn ? "Task added" : "Görev eklendi"}
                    </span>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                    className="flex h-7 w-7 items-center justify-center rounded-full text-[#8a8fa0] transition hover:bg-[#f4f4f5]"
                    aria-label={isEn ? "Toggle detail" : "Detayı aç"}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      {expandedItemId === item.id ? (
                        <path d="m18 15-6-6-6 6" />
                      ) : (
                        <path d="m6 9 6 6 6-6" />
                      )}
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
