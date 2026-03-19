"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  category: string;
  title: string;
  description: string | null;
  completed: boolean;
  completedAt: Date | null;
  order: number;
}

interface ChecklistsByCategory {
  PRODUCT: ChecklistItem[];
  MARKETING: ChecklistItem[];
  LEGAL: ChecklistItem[];
  TECH: ChecklistItem[];
}

const categoryInfo = {
  PRODUCT: { icon: "🎯", label: "Product" },
  MARKETING: { icon: "📢", label: "Marketing" },
  LEGAL: { icon: "⚖️", label: "Legal" },
  TECH: { icon: "⚙️", label: "Tech" },
};

export default function ChecklistSection({
  checklistsByCategory,
  productId,
}: {
  checklistsByCategory: ChecklistsByCategory;
  productId: string;
}) {
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Launch Checklist</h2>
      </div>

      <div className="space-y-6">
        {(Object.keys(checklistsByCategory) as Array<keyof ChecklistsByCategory>).map((category) => {
          const items = checklistsByCategory[category];
          if (items.length === 0) return null;

          const info = categoryInfo[category];
          const completedCount = items.filter(item => item.completed).length;

          return (
            <div key={category} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <span className="mr-2">{info.icon}</span>
                  {info.label}
                </h3>
                <span className="text-sm text-gray-600">
                  {completedCount}/{items.length}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => toggleChecklistItem(item.id, item.completed)}
                      disabled={loading === item.id}
                      className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.completed ? "text-gray-400 line-through" : "text-gray-900"
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
