"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

const priorityStyle: Record<string, string> = {
  HIGH:   "bg-red-50 text-red-600 border-red-100",
  MEDIUM: "bg-[#fee74e]/20 text-[#a07800] border-[#fee74e]/30",
  LOW:    "bg-[#75fc96]/20 text-[#1a7a36] border-[#75fc96]/30",
};

const priorityLabel: Record<string, string> = {
  HIGH: "Yüksek", MEDIUM: "Orta", LOW: "Düşük",
};

export default function ActionsSection({
  tasks,
  productId,
}: {
  tasks: Task[];
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    title: "",
    dueDate: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
  });

  const inputCls = "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

  const toggleTask = async (taskId: string, currentStatus: string) => {
    setLoading(taskId);
    try {
      await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus === "DONE" ? "TODO" : "DONE" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setLoading(null);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("new");
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newAction, productId, dueDate: newAction.dueDate || null }),
      });
      setNewAction({ title: "", dueDate: "", priority: "MEDIUM" });
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(null);
    }
  };

  const pendingTasks = tasks.filter(a => a.status !== "DONE");
  const completedTasks = tasks.filter(a => a.status === "DONE");

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-0.5">Görevler</p>
          <h2 className="text-[16px] font-semibold text-[#0d0d12]">Aksiyon Listesi</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1 px-3 h-8 rounded-full border border-[#e8e8e8] text-[12px] font-semibold text-[#0d0d12] hover:bg-[#f6f6f6] transition"
        >
          {showAddForm ? "İptal" : "+ Ekle"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addTask} className="mb-4 p-4 bg-[#f6f6f6] rounded-[12px] space-y-3">
          <input
            type="text"
            placeholder="Görev başlığı"
            value={newAction.title}
            onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
            required
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={newAction.dueDate}
              onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
              className={inputCls}
            />
            <select
              value={newAction.priority}
              onChange={(e) => setNewAction({ ...newAction, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" })}
              className={inputCls}
            >
              <option value="LOW">Düşük</option>
              <option value="MEDIUM">Orta</option>
              <option value="HIGH">Yüksek</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50"
          >
            {loading === "new" ? "Ekleniyor…" : "Görev Ekle"}
          </button>
        </form>
      )}

      <div className="space-y-2">
        {pendingTasks.length === 0 && !showAddForm && (
          <p className="text-center text-[13px] text-[#9ca3af] py-8">Bekleyen görev yok</p>
        )}

        {pendingTasks.map((task) => (
          <label
            key={task.id}
            className={`flex items-start gap-3 p-3 rounded-[10px] border border-[#e8e8e8] cursor-pointer hover:bg-[#f6f6f6] transition ${loading === task.id ? "opacity-60" : ""}`}
          >
            <input
              type="checkbox"
              checked={task.status === "DONE"}
              onChange={() => toggleTask(task.id, task.status)}
              disabled={loading === task.id}
              className="mt-0.5 h-4 w-4 rounded border-[#d0d0d0] accent-[#95dbda] cursor-pointer shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium text-[#0d0d12]">{task.title}</p>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 text-[11px] font-semibold rounded border ${priorityStyle[task.priority]}`}>
                  {priorityLabel[task.priority]}
                </span>
                {task.dueDate && (
                  <span className="text-[11px] text-[#9ca3af]">
                    {format(new Date(task.dueDate), "d MMM")}
                  </span>
                )}
              </div>
            </div>
          </label>
        ))}

        {completedTasks.length > 0 && (
          <div className="pt-3 border-t border-[#e8e8e8]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af] mb-2">
              Tamamlandı ({completedTasks.length})
            </p>
            <div className="space-y-1">
              {completedTasks.map((task) => (
                <label key={task.id} className="flex items-center gap-3 px-2 py-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTask(task.id, task.status)}
                    disabled={loading === task.id}
                    className="h-4 w-4 rounded border-[#d0d0d0] accent-[#95dbda] cursor-pointer shrink-0"
                  />
                  <p className="text-[13px] text-[#9ca3af] line-through flex-1">{task.title}</p>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
