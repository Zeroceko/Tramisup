"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

interface TasksListProps {
  tasks: Task[];
  productId: string;
}

const priorityLabel: Record<string, string> = {
  HIGH: "Yüksek",
  MEDIUM: "Orta",
  LOW: "Düşük",
};

export default function TasksList({ tasks }: TasksListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const now = new Date();
  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < now;
  };

  const todoTasks = tasks.filter((task) => task.status === "TODO");
  const inProgressTasks = tasks.filter((task) => task.status === "IN_PROGRESS");
  const doneTasks = tasks.filter((task) => task.status === "DONE");

  async function updateTaskStatus(taskId: string, status: Task["status"]) {
    setLoading(taskId);
    try {
      await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function TaskCard({ task }: { task: Task }) {
    const overdue = isOverdue(task.dueDate) && task.status !== "DONE";

    return (
      <div className={`rounded-[12px] border p-4 ${task.status === "DONE" ? "border-[#d8f5df] bg-[#f6fff8]" : "border-[#e8e8e8] bg-white"}`}>
        <div className="flex items-start gap-3">
          <button
            type="button"
            disabled={loading === task.id}
            onClick={() => updateTaskStatus(task.id, task.status === "DONE" ? "TODO" : "DONE")}
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
              task.status === "DONE"
                ? "border-[#75fc96] bg-[#75fc96]"
                : "border-[#cfcfcf] bg-white hover:border-[#95dbda]"
            }`}
          >
            {task.status === "DONE" ? (
              <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
                <path d="M1 3L3 5L7 1" stroke="#0d0d12" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : null}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className={`text-[14px] font-semibold ${task.status === "DONE" ? "text-[#8a8fa0] line-through" : "text-[#0d0d12]"}`}>
                {task.title}
              </p>
              <span className="rounded-full bg-[#f6f6f6] px-2 py-0.5 text-[11px] font-semibold text-[#0d0d12]">
                {priorityLabel[task.priority]}
              </span>
              {overdue ? (
                <span className="rounded-full border border-[#ffccc7] bg-[#fff1f0] px-2 py-0.5 text-[11px] font-semibold text-[#cf1322]">
                  Gecikmiş
                </span>
              ) : null}
            </div>

            {task.description ? <p className="mt-1 text-[12px] leading-5 text-[#666d80]">{task.description}</p> : null}

            <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-[#8a8fa0]">
              {task.dueDate ? <span>Tarih: {format(new Date(task.dueDate), "d MMM yyyy")}</span> : null}
              {task.status !== "DONE" ? (
                <button
                  type="button"
                  onClick={() => updateTaskStatus(task.id, task.status === "TODO" ? "IN_PROGRESS" : "TODO")}
                  disabled={loading === task.id}
                  className="rounded-full border border-[#e8e8e8] px-3 py-1 text-[11px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6]"
                >
                  {task.status === "IN_PROGRESS" ? "Yapılıyor olarak işaretli" : "Yapılıyor olarak başlat"}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const sections = [
    { title: "Sıradaki işler", items: todoTasks },
    { title: "Üzerinde çalıştıkların", items: inProgressTasks },
    { title: "Tamamlananlar", items: doneTasks },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-[12px] border border-[#e8e8e8] bg-white p-4">
          <p className="text-[12px] text-[#666d80]">Yapılacak</p>
          <p className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">{todoTasks.length}</p>
        </div>
        <div className="rounded-[12px] border border-[#e8e8e8] bg-white p-4">
          <p className="text-[12px] text-[#666d80]">Yapılıyor</p>
          <p className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">{inProgressTasks.length}</p>
        </div>
        <div className="rounded-[12px] border border-[#e8e8e8] bg-white p-4">
          <p className="text-[12px] text-[#666d80]">Tamamlandı</p>
          <p className="mt-1 text-[28px] font-bold tracking-[-0.02em] text-[#0d0d12]">{doneTasks.length}</p>
        </div>
      </div>

      {sections.map((section) =>
        section.items.length > 0 ? (
          <div key={section.title}>
            <h3 className="mb-3 text-[16px] font-semibold text-[#0d0d12]">{section.title}</h3>
            <div className="space-y-3">
              {section.items.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </div>
        ) : null
      )}

      {tasks.length === 0 && (
        <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white px-8 py-16 text-center">
          <p className="text-[15px] font-semibold text-[#0d0d12]">Henüz görev yok</p>
          <p className="mt-2 text-[13px] text-[#666d80]">Ürün planı oluştukça burada gerçekten işaretleyebileceğin işler görünecek.</p>
        </div>
      )}
    </div>
  );
}
