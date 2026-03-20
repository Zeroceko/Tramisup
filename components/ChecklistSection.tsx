"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: Date | null;
  order: number;
  priority?: "LOW" | "MEDIUM" | "HIGH";
  linkedTaskId?: string | null;
}

interface ChecklistsByCategory {
  PRODUCT: ChecklistItem[];
  MARKETING: ChecklistItem[];
  LEGAL: ChecklistItem[];
  TECH: ChecklistItem[];
}

interface ChecklistSectionProps {
  checklistsByCategory: ChecklistsByCategory;
  productId: string;
  onCreateTask?: (itemId: string) => Promise<void>;
}

const categoryInfo = {
  PRODUCT:   { label: "Ürün" },
  MARKETING: { label: "Pazarlama" },
  LEGAL:     { label: "Hukuki" },
  TECH:      { label: "Teknik" },
};

export default function ChecklistSection({
  checklistsByCategory,
  productId,
  onCreateTask,
}: ChecklistSectionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const toggleChecklistItem = async (itemId: string, completed: boolean) => {
    setLoading(itemId);
    try {
      await fetch(`/api/checklist/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !completed }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update checklist item:", error);
    } finally {
      setLoading(null);
    }
  };

  const handleCreateTask = async (itemId: string) => {
    if (!onCreateTask) return;
    setLoading(itemId);
    try {
      await onCreateTask(itemId);
      router.refresh();
    } catch (error) {
      console.error("Failed to create task:", error);
    } finally {
      setLoading(null);
    }
  };

  void productId;

  return (
    <div className="space-y-3">
      {(Object.keys(checklistsByCategory) as Array<keyof ChecklistsByCategory>).map((category) => {
        const items = checklistsByCategory[category];
        if (items.length === 0) return null;

        const info = categoryInfo[category];
        const completedCount = items.filter(item => item.completed).length;

        return (
          <div key={category} className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[14px] font-semibold text-[#0d0d12]">{info.label}</h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-[#f6f6f6] text-[11px] font-semibold text-[#666d80]">
                {completedCount}/{items.length}
              </span>
            </div>

            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 px-3 py-2.5 rounded-[10px] transition ${
                    loading === item.id ? "opacity-60" : "hover:bg-[#f6f6f6]"
                  }`}
                >
                  <label className="flex items-start gap-3 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id, item.completed)}
                      disabled={loading === item.id}
                      className="mt-0.5 h-4 w-4 rounded border-[#d0d0d0] accent-[#95dbda] cursor-pointer shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-[14px] font-medium ${item.completed ? "text-[#9ca3af] line-through" : "text-[#0d0d12]"}`}>
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-[12px] text-[#666d80] mt-0.5">{item.description}</p>
                      )}
                    </div>
                  </label>

                  {/* Create Task / View Task button */}
                  {!item.completed && onCreateTask && (
                    <div className="shrink-0">
                      {!item.linkedTaskId ? (
                        <button
                          onClick={() => handleCreateTask(item.id)}
                          disabled={loading === item.id}
                          className="text-[12px] text-[#95dbda] hover:text-[#75bcbb] font-medium disabled:opacity-50"
                        >
                          + Task
                        </button>
                      ) : (
                        <Link
                          href={`/tasks#${item.linkedTaskId}`}
                          className="text-[12px] text-[#666d80] hover:text-[#0d0d12] font-medium"
                        >
                          → Task
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
