"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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

const categoryIcons: Record<string, string> = {
  PRODUCT: "🎯",
  MARKETING: "📢",
  LEGAL: "⚖️",
  TECH: "⚙️",
};

const categoryLabels: Record<string, string> = {
  PRODUCT: "Product Readiness",
  MARKETING: "Marketing Readiness",
  LEGAL: "Legal Readiness",
  TECH: "Technical Readiness",
};

export default function ChecklistSection({
  checklistsByCategory,
  productId,
  onCreateTask,
}: ChecklistSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleToggle = async (itemId: string, currentStatus: boolean) => {
    setLoading(itemId);
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
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

  return (
    <div className="space-y-6">
      {Object.entries(checklistsByCategory).map(([category, items]) => {
        if (items.length === 0) return null;

        const completedCount = items.filter((i) => i.completed).length;

        return (
          <div
            key={category}
            className="rounded-[15px] border border-[#e8e8e8] bg-white p-5"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[20px]">{categoryIcons[category]}</span>
              <div className="flex-1">
                <h3 className="text-[14px] font-bold text-[#0d0d12]">
                  {categoryLabels[category]}
                </h3>
                <p className="text-[11px] text-[#666d80]">
                  {completedCount} of {items.length} complete
                </p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-bold text-[#95dbda]">
                  {Math.round((completedCount / items.length) * 100)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4 h-1.5 w-full bg-[#f6f6f6] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#95dbda] rounded-full transition-all"
                style={{
                  width: `${(completedCount / items.length) * 100}%`,
                }}
              />
            </div>

            {/* Items */}
            <div className="space-y-2">
              {items.map((item) => (
                <label
                  key={item.id}
                  className={`flex items-start gap-3 p-3 rounded-[10px] cursor-pointer transition ${
                    loading === item.id ? "opacity-60" : ""
                  } ${
                    item.completed
                      ? "bg-[#f0fffe] border border-[#95dbda]"
                      : "bg-white border border-[#e8e8e8] hover:bg-[#f6f6f6]"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => handleToggle(item.id, item.completed)}
                    disabled={loading === item.id}
                    className="mt-0.5 h-4 w-4 rounded border-[#d0d0d0] accent-[#95dbda] cursor-pointer shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-[13px] font-medium ${
                        item.completed
                          ? "text-[#9ca3af] line-through"
                          : "text-[#0d0d12]"
                      }`}
                    >
                      {item.title}
                    </p>
                  </div>

                  {/* Actions */}
                  {!item.completed && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      {item.linkedTaskId ? (
                        <Link
                          href="/tasks"
                          className="px-2 h-6 rounded text-[10px] font-semibold bg-[#95dbda] text-white hover:bg-[#7ac9c7] transition"
                        >
                          → View Task
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleCreateTask(item.id)}
                          disabled={loading === item.id}
                          className="px-2 h-6 rounded text-[10px] font-semibold bg-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50"
                        >
                          {loading === item.id ? "..." : "+ Task"}
                        </button>
                      )}
                    </div>
                  )}
                </label>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
