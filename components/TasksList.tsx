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

const statusLabel: Record<string, string> = {
  TODO: "Yapılacak",
  IN_PROGRESS: "Yapılıyor",
  DONE: "Tamamlandı",
};

export default function TasksList({ tasks, productId }: TasksListProps) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const now = new Date();
  const isOverdue = (dueDate: Date | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < now;
  };

  const getTaskBorderStyle = (task: Task) => {
    if (task.status === "DONE") return "border-l-4 border-[#75fc96]";
    if (isOverdue(task.dueDate)) return "border-l-4 border-[#ff4d4f]";
    if (task.priority === "HIGH") return "border-l-4 border-[#ff7a45]";
    return "border-l-4 border-[#95dbda]";
  };

  const getBgStyle = (task: Task) => {
    if (task.status === "DONE") return "bg-[#f0fffe]";
    if (isOverdue(task.dueDate)) return "bg-[#fff1f0]";
    return "bg-white";
  };

  // Group and sort tasks
  const sortedTasks = [...tasks].sort((a, b) => {
    // Overdue + not done first
    const aOverdue = isOverdue(a.dueDate) && a.status !== "DONE";
    const bOverdue = isOverdue(b.dueDate) && b.status !== "DONE";

    if (aOverdue && !bOverdue) return -1;
    if (!aOverdue && bOverdue) return 1;

    // Then by priority
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }

    // Then by due date
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }

    return 0;
  });

  const todotasks = sortedTasks.filter(t => t.status === "TODO");
  const inProgressTasks = sortedTasks.filter(t => t.status === "IN_PROGRESS");
  const doneTasks = sortedTasks.filter(t => t.status === "DONE");

  const toggleTaskStatus = async (taskId: string, currentStatus: string) => {
    setLoading(taskId);
    try {
      const nextStatus =
        currentStatus === "TODO"
          ? "IN_PROGRESS"
          : currentStatus === "IN_PROGRESS"
            ? "DONE"
            : "TODO";

      await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setLoading(null);
    }
  };

  const TaskCard = ({ task }: { task: Task }) => {
    const overdue = isOverdue(task.dueDate);
    return (
      <div
        key={task.id}
        className={`rounded-[12px] ${getTaskBorderStyle(task)} ${getBgStyle(task)} p-4 transition`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h4 className={`text-[14px] font-semibold mb-2 ${task.status === "DONE" ? "text-[#9ca3af] line-through" : "text-[#0d0d12]"}`}>
              {task.title}
            </h4>
            {task.description && (
              <p className="text-[12px] text-[#666d80] mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#f6f6f6] text-[#0d0d12]">
                {priorityLabel[task.priority]}
              </span>
              {overdue && task.status !== "DONE" && (
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded bg-[#fff1f0] text-[#ff4d4f] border border-[#ffccc7]">
                  OVERDUE
                </span>
              )}
              {task.dueDate && (
                <span
                  className={`text-[11px] ${
                    overdue && task.status !== "DONE"
                      ? "text-[#ff4d4f] font-semibold"
                      : "text-[#9ca3af]"
                  }`}
                >
                  {format(new Date(task.dueDate), "d MMM yyyy")}
                </span>
              )}
            </div>
          </div>

          {/* Status button */}
          <button
            onClick={() => toggleTaskStatus(task.id, task.status)}
            disabled={loading === task.id}
            className={`shrink-0 px-3 py-1 rounded-full text-[11px] font-semibold border transition disabled:opacity-50 ${
              task.status === "TODO"
                ? "bg-white border-[#e8e8e8] text-[#0d0d12] hover:bg-[#f6f6f6]"
                : task.status === "IN_PROGRESS"
                  ? "bg-[#ffd7ef] border-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4]"
                  : "bg-[#f0fffe] border-[#95dbda] text-[#2d9d9b] hover:bg-[#e0f8f7]"
            }`}
          >
            {statusLabel[task.status]}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* TODO Section */}
      {todotasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-[#ff7a45]" />
            <h3 className="text-[16px] font-bold text-[#0d0d12]">
              Yapılacak ({todotasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {todotasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* IN_PROGRESS Section */}
      {inProgressTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-[#ffd7ef]" />
            <h3 className="text-[16px] font-bold text-[#0d0d12]">
              Yapılıyor ({inProgressTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* DONE Section */}
      {doneTasks.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-6 rounded-full bg-[#75fc96]" />
            <h3 className="text-[16px] font-bold text-[#0d0d12]">
              Tamamlandı ({doneTasks.length})
            </h3>
          </div>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {tasks.length === 0 && (
        <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white px-8 py-16 text-center">
          <p className="text-[15px] font-semibold text-[#0d0d12]">Görev yok</p>
          <p className="mt-2 text-[13px] text-[#666d80]">
            Başlamak için pre-launch sayfasından görev ekle
          </p>
        </div>
      )}
    </div>
  );
}
