"use client";

import Link from "next/link";
import { useState } from "react";

type TaskItem = {
  id: string;
  title: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "TODO" | "IN_PROGRESS";
  dueDate?: string | null;
  source?: string;
};

type TodayTasksProps = {
  tasks: TaskItem[];
  totalPending: number;
  locale: string;
};

const PRIORITY_INDICATOR: Record<TaskItem["priority"], { dot: string; label: string }> = {
  HIGH: { dot: "bg-[#ef4444]", label: "Yüksek" },
  MEDIUM: { dot: "bg-[#f59e0b]", label: "Orta" },
  LOW: { dot: "bg-[#94a3b8]", label: "Düşük" },
};

const STATUS_RING: Record<TaskItem["status"], string> = {
  TODO: "border-[#d1d5db]",
  IN_PROGRESS: "border-[#95dbda] bg-[#95dbda]/10",
};

function isOverdue(dueDate: string | null | undefined): boolean {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return due < today;
}

export default function TodayTasks({ tasks, totalPending, locale }: TodayTasksProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());

  async function handleComplete(taskId: string) {
    setCompletingId(taskId);
    try {
      const res = await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      if (res.ok) {
        setRemovedIds((prev) => new Set(prev).add(taskId));
      }
    } catch {
      // silently fail — task stays visible
    } finally {
      setCompletingId(null);
    }
  }

  const visibleTasks = tasks.filter((t) => !removedIds.has(t.id));

  // Empty state
  if (visibleTasks.length === 0 && totalPending === 0) {
    return (
      <div className="rounded-[14px] border border-dashed border-[#e0e0e0] bg-[#fafafa] px-5 py-6 text-center">
        <p className="text-[13px] font-medium text-[#94a3b8]">
          {locale === "en"
            ? "No tasks yet. They appear as you work through your checklist."
            : "Henüz görev yok. Checklist'te ilerledikçe burada belirir."}
        </p>
      </div>
    );
  }

  // All completed in this session
  if (visibleTasks.length === 0) {
    return (
      <div className="rounded-[14px] border border-[#d1fae5] bg-[#ecfdf5] px-5 py-5 text-center">
        <p className="text-[14px] font-semibold text-[#065f46]">
          {locale === "en" ? "All top tasks completed" : "Bugünkü öncelikli görevler tamamlandı"}
        </p>
        <Link
          href={`/${locale}/tasks`}
          className="mt-2 inline-block text-[13px] font-medium text-[#059669] hover:underline"
        >
          {locale === "en" ? "View all tasks" : "Tüm görevleri gör"} →
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Section header */}
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
          {locale === "en" ? "Priority tasks" : "Öncelikli görevler"}
        </h3>
        {totalPending > visibleTasks.length && (
          <Link
            href={`/${locale}/tasks`}
            className="text-[11px] font-medium text-[#666d80] hover:text-[#0d0d12] transition"
          >
            {locale === "en"
              ? `+${totalPending - visibleTasks.length} more`
              : `+${totalPending - visibleTasks.length} görev daha`}
          </Link>
        )}
      </div>

      {/* Task list */}
      <ul className="space-y-2">
        {visibleTasks.map((task) => {
          const pri = PRIORITY_INDICATOR[task.priority];
          const overdue = isOverdue(task.dueDate);
          const completing = completingId === task.id;

          return (
            <li
              key={task.id}
              className={`group flex items-start gap-3 rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-3 transition ${
                completing ? "opacity-50" : "hover:border-[#d0d0d0]"
              }`}
            >
              {/* Complete button (checkbox circle) */}
              <button
                type="button"
                onClick={() => handleComplete(task.id)}
                disabled={completing}
                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${STATUS_RING[task.status]} hover:border-[#34d399] hover:bg-[#34d399]/10`}
                aria-label="Tamamla"
              >
                {completing && (
                  <svg className="h-3 w-3 animate-spin text-[#94a3b8]" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.3" strokeWidth="3" />
                    <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-medium text-[#0d0d12] leading-snug">
                  {task.title}
                </p>
                <div className="mt-1 flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <span className={`h-1.5 w-1.5 rounded-full ${pri.dot}`} />
                    <span className="text-[10px] text-[#94a3b8]">{pri.label}</span>
                  </span>
                  {task.source && (
                    <span className="text-[10px] text-[#94a3b8]">
                      {task.source}
                    </span>
                  )}
                  {overdue && task.dueDate && (
                    <span className="text-[10px] font-semibold text-[#ef4444]">
                      {locale === "en" ? "Overdue" : "Gecikmiş"}
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
