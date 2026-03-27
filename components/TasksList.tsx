"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

type Priority = "LOW" | "MEDIUM" | "HIGH";
type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE";

interface LinkedChecklist {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

interface Task {
  id: string;
  title: string;
  description?: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  priority: Priority;
  launchChecklistItem?: LinkedChecklist | null;
}

interface TasksListProps {
  tasks: Task[];
  productId: string;
  locale?: string;
}

const PRIORITY_CONFIG: Record<Priority, { label: string; labelEn: string; dot: string; textColor: string }> = {
  HIGH:   { label: "Yüksek etki",  labelEn: "High impact",   dot: "bg-[#ef4444]", textColor: "text-[#ef4444]" },
  MEDIUM: { label: "Orta etki",    labelEn: "Medium impact",  dot: "bg-[#f59e0b]", textColor: "text-[#f59e0b]" },
  LOW:    { label: "Düşük etki",   labelEn: "Low impact",     dot: "bg-[#94a3b8]", textColor: "text-[#94a3b8]" },
};

const CATEGORY_CONFIG: Record<string, { label: string; labelEn: string; cls: string }> = {
  LEGAL:     { label: "Hukuki hazırlık", labelEn: "Legal",   cls: "bg-red-50 text-red-700 border-red-100" },
  TECH:      { label: "Teknik hazırlık", labelEn: "Tech",    cls: "bg-blue-50 text-blue-700 border-blue-100" },
  PRODUCT:   { label: "Ürün hazırlığı",  labelEn: "Product", cls: "bg-purple-50 text-purple-700 border-purple-100" },
  MARKETING: { label: "Pazarlama",       labelEn: "Marketing", cls: "bg-green-50 text-green-700 border-green-100" },
};

const inputCls =
  "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition bg-white";

export default function TasksList({ tasks, productId, locale }: TasksListProps) {
  const router = useRouter();
  const isEn = locale === "en";

  const [loading, setLoading] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [showAdd, setShowAdd] = useState(false);
  const [showBacklog, setShowBacklog] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as Priority,
  });

  // Date helpers
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrowStart = new Date(todayStart.getTime() + 86_400_000);

  function isOverdue(d: Date | null) {
    return d ? new Date(d) < todayStart : false;
  }
  function isDueToday(d: Date | null) {
    if (!d) return false;
    const dd = new Date(d);
    return dd >= todayStart && dd < tomorrowStart;
  }

  // Section assignment
  const activeTasks = tasks.filter((t) => t.status !== "DONE");
  const doneTasks = tasks.filter((t) => t.status === "DONE");

  // FOCUS: in_progress OR (HIGH + overdue/today)
  const focusTasks = activeTasks.filter(
    (t) =>
      t.status === "IN_PROGRESS" ||
      (t.priority === "HIGH" && (isOverdue(t.dueDate) || isDueToday(t.dueDate)))
  );
  const focusIds = new Set(focusTasks.map((t) => t.id));

  // NEXT: HIGH or MEDIUM TODO, not in focus
  const nextTasks = activeTasks.filter(
    (t) =>
      !focusIds.has(t.id) &&
      t.status === "TODO" &&
      (t.priority === "HIGH" || t.priority === "MEDIUM")
  );

  // BACKLOG: LOW TODO
  const backlogTasks = activeTasks.filter(
    (t) => !focusIds.has(t.id) && t.status === "TODO" && t.priority === "LOW"
  );

  const completionRate =
    tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  async function updateStatus(taskId: string, status: TaskStatus) {
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

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    setLoading("new");
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          title: newTask.title,
          description: newTask.description || null,
          dueDate: newTask.dueDate || null,
          priority: newTask.priority,
        }),
      });
      setNewTask({ title: "", description: "", dueDate: "", priority: "MEDIUM" });
      setShowAdd(false);
      router.refresh();
    } finally {
      setLoading(null);
    }
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // --- Render helpers ---

  function CheckIcon() {
    return (
      <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
        <path
          d="M1 3L3 5L7 1"
          stroke="#0d0d12"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function ChevronIcon({ open }: { open: boolean }) {
    return (
      <svg
        width="10"
        height="6"
        viewBox="0 0 10 6"
        fill="none"
        className={`transition-transform ${open ? "rotate-180" : ""}`}
      >
        <path
          d="M1 1l4 4 4-4"
          stroke="#94a3b8"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  function SectionLabel({
    dot,
    label,
    count,
    dim,
  }: {
    dot: string;
    label: string;
    count?: number;
    dim?: boolean;
  }) {
    return (
      <div className="mb-2 flex items-center gap-2">
        <span className={`h-2 w-2 rounded-full ${dot}`} />
        <h3
          className={`text-[12px] font-semibold uppercase tracking-[0.14em] ${
            dim ? "text-[#94a3b8]" : "text-[#0d0d12]"
          }`}
        >
          {label}
        </h3>
        {count !== undefined && (
          <span className="text-[11px] text-[#8a8fa0]">{count}</span>
        )}
      </div>
    );
  }

  // Focus card — prominent, full-width
  function FocusCard({ task }: { task: Task }) {
    const overdue = isOverdue(task.dueDate);
    const today = isDueToday(task.dueDate);
    const isLoading = loading === task.id;
    const linked = task.launchChecklistItem;
    const catCfg = linked ? CATEGORY_CONFIG[linked.category] : null;
    const priCfg = PRIORITY_CONFIG[task.priority];

    return (
      <div className="rounded-[16px] border border-[#e8e8e8] bg-white p-5">
        <div className="flex items-start gap-4">
          {/* Done circle */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => updateStatus(task.id, "DONE")}
            className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-[#cfcfcf] bg-white transition hover:border-[#75fc96] disabled:opacity-50"
          >
            {isLoading && (
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#95dbda]" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            {/* Badges row */}
            <div className="mb-2 flex flex-wrap items-center gap-1.5">
              {task.status === "IN_PROGRESS" && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#95dbda]/20 px-2 py-0.5 text-[11px] font-semibold text-[#2a7c7a]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2a7c7a] animate-pulse" />
                  {isEn ? "In progress" : "Yapılıyor"}
                </span>
              )}
              {overdue && (
                <span className="rounded-full bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                  {isEn ? "Overdue" : "Gecikmiş"}
                </span>
              )}
              {today && !overdue && (
                <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c]">
                  {isEn ? "Due today" : "Bugün son gün"}
                </span>
              )}
              {catCfg && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${catCfg.cls}`}
                >
                  Launch → {isEn ? catCfg.labelEn : catCfg.label}
                </span>
              )}
            </div>

            {/* Title */}
            <h3 className="text-[16px] font-semibold leading-snug text-[#0d0d12]">
              {task.title}
            </h3>

            {/* Description */}
            {task.description && (
              <p className="mt-1 text-[13px] leading-5 text-[#666d80]">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span
                className={`flex items-center gap-1 text-[12px] font-medium ${priCfg.textColor}`}
              >
                <span className={`h-2 w-2 rounded-full ${priCfg.dot}`} />
                {isEn ? priCfg.labelEn : priCfg.label}
              </span>
              {task.dueDate && (
                <span
                  className={`text-[12px] ${
                    overdue ? "font-semibold text-red-600" : "text-[#8a8fa0]"
                  }`}
                >
                  {format(new Date(task.dueDate), "d MMM yyyy")}
                </span>
              )}
            </div>
          </div>

          {/* CTA */}
          <div className="shrink-0">
            {task.status === "TODO" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                className="inline-flex h-8 items-center justify-center rounded-full bg-[#ffd7ef] px-4 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:opacity-50"
              >
                {isEn ? "Start" : "Başla"}
              </button>
            )}
            {task.status === "IN_PROGRESS" && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => updateStatus(task.id, "DONE")}
                className="inline-flex h-8 items-center justify-center rounded-full bg-[#75fc96]/30 px-4 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#75fc96]/50 disabled:opacity-50"
              >
                {isEn ? "Mark done ✓" : "Bitti ✓"}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Regular card — compact
  function TaskCard({ task }: { task: Task }) {
    const overdue = isOverdue(task.dueDate) && task.status !== "DONE";
    const today = isDueToday(task.dueDate);
    const isLoading = loading === task.id;
    const isExp = expanded.has(task.id);
    const linked = task.launchChecklistItem;
    const catCfg = linked ? CATEGORY_CONFIG[linked.category] : null;
    const priCfg = PRIORITY_CONFIG[task.priority];
    const done = task.status === "DONE";

    return (
      <div
        className={`rounded-[12px] border bg-white transition ${
          done
            ? "border-[#e8e8e8] opacity-55"
            : overdue
            ? "border-red-100"
            : "border-[#e8e8e8]"
        }`}
      >
        <div className="flex items-start gap-3 p-4">
          {/* Checkbox */}
          <button
            type="button"
            disabled={isLoading}
            onClick={() => updateStatus(task.id, done ? "TODO" : "DONE")}
            className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50 ${
              done
                ? "border-[#75fc96] bg-[#75fc96]"
                : "border-[#cfcfcf] bg-white hover:border-[#95dbda]"
            }`}
          >
            {done && <CheckIcon />}
          </button>

          <div className="min-w-0 flex-1">
            {/* Title row */}
            <div className="flex items-start justify-between gap-2">
              <p
                className={`text-[14px] font-semibold leading-snug ${
                  done ? "text-[#8a8fa0] line-through" : "text-[#0d0d12]"
                }`}
              >
                {task.title}
              </p>
              {task.description && !done && (
                <button
                  type="button"
                  onClick={() => toggleExpand(task.id)}
                  className="shrink-0 text-[11px] text-[#94a3b8] transition hover:text-[#666d80]"
                >
                  {isExp ? "↑" : "↓"}
                </button>
              )}
            </div>

            {/* Expanded description */}
            {isExp && task.description && (
              <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
                {task.description}
              </p>
            )}

            {/* Meta row */}
            {!done && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={`flex items-center gap-1 text-[11px] font-medium ${priCfg.textColor}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${priCfg.dot}`} />
                  {isEn ? priCfg.labelEn : priCfg.label}
                </span>

                {catCfg && (
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${catCfg.cls}`}
                  >
                    {isEn ? catCfg.labelEn : catCfg.label}
                  </span>
                )}

                {overdue && (
                  <span className="text-[11px] font-semibold text-red-600">
                    {isEn ? "Overdue" : "Gecikmiş"}
                  </span>
                )}

                {task.dueDate && !overdue && (
                  <span className="text-[11px] text-[#8a8fa0]">
                    {today
                      ? isEn
                        ? "Today"
                        : "Bugün"
                      : format(new Date(task.dueDate), "d MMM")}
                  </span>
                )}

                {task.status === "IN_PROGRESS" && (
                  <span className="flex items-center gap-1 rounded-full bg-[#95dbda]/20 px-2 py-0.5 text-[11px] font-semibold text-[#2a7c7a]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2a7c7a] animate-pulse" />
                    {isEn ? "In progress" : "Yapılıyor"}
                  </span>
                )}

                {task.status === "TODO" && (
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => updateStatus(task.id, "IN_PROGRESS")}
                    className="rounded-full border border-[#e8e8e8] px-2.5 py-0.5 text-[11px] font-medium text-[#666d80] transition hover:bg-[#f6f6f6] disabled:opacity-50"
                  >
                    {isEn ? "Start" : "Başla"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- Render ---

  return (
    <div className="space-y-4">
      {/* Momentum bar + add button */}
      <div className="flex items-center justify-between">
        <div>
          {tasks.length > 0 && (
            <div className="flex items-center gap-3">
              <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#f0f0f0]">
                <div
                  className="h-full rounded-full bg-[#75fc96] transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <span className="text-[12px] text-[#8a8fa0]">
                {doneTasks.length}/{tasks.length}{" "}
                {isEn ? "done" : "tamamlandı"}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#e8e8e8] px-3 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6]"
        >
          {showAdd ? (
            isEn ? "Cancel" : "İptal"
          ) : (
            <>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M5 1v8M1 5h8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
              {isEn ? "Add task" : "Görev ekle"}
            </>
          )}
        </button>
      </div>

      {/* Add task form */}
      {showAdd && (
        <form
          onSubmit={addTask}
          className="rounded-[14px] border border-[#e8e8e8] bg-white p-4 space-y-3"
        >
          <input
            type="text"
            placeholder={isEn ? "Task title" : "Görev başlığı"}
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            required
            autoFocus
            className={inputCls}
          />
          <textarea
            placeholder={isEn ? "Description (optional)" : "Açıklama (isteğe bağlı)"}
            value={newTask.description}
            onChange={(e) =>
              setNewTask({ ...newTask, description: e.target.value })
            }
            rows={2}
            className={`${inputCls} resize-none`}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) =>
                setNewTask({ ...newTask, dueDate: e.target.value })
              }
              className={inputCls}
            />
            <select
              value={newTask.priority}
              onChange={(e) =>
                setNewTask({
                  ...newTask,
                  priority: e.target.value as Priority,
                })
              }
              className={inputCls}
            >
              <option value="HIGH">{isEn ? "High impact" : "Yüksek etki"}</option>
              <option value="MEDIUM">{isEn ? "Medium impact" : "Orta etki"}</option>
              <option value="LOW">{isEn ? "Low impact" : "Düşük etki"}</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:opacity-50"
          >
            {loading === "new"
              ? isEn
                ? "Adding…"
                : "Ekleniyor…"
              : isEn
              ? "Add"
              : "Ekle"}
          </button>
        </form>
      )}

      {/* Empty state */}
      {tasks.length === 0 && !showAdd && (
        <div className="rounded-[15px] border border-dashed border-[#e8e8e8] bg-white px-8 py-16 text-center">
          <p className="text-[15px] font-semibold text-[#0d0d12]">
            {isEn ? "No tasks yet" : "Henüz görev yok"}
          </p>
          <p className="mt-2 text-[13px] text-[#666d80]">
            {isEn
              ? "Add tasks to build your execution queue. Tasks linked from your launch checklist will appear here automatically."
              : "Görev ekleyerek çalışma yüzeyini oluştur. Launch checklist'inden bağlanan görevler burada otomatik görünür."}
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {isEn ? "Add first task" : "İlk görevi ekle"}
          </button>
        </div>
      )}

      {/* FOCUS — Şimdi Yap */}
      {focusTasks.length > 0 && (
        <div>
          <SectionLabel
            dot="bg-[#ffd7ef]"
            label={isEn ? "Do now" : "Şimdi yap"}
            count={focusTasks.length}
          />
          <div className="space-y-2">
            {focusTasks.map((task) => (
              <FocusCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* NEXT — Sırada */}
      {nextTasks.length > 0 && (
        <div>
          <SectionLabel
            dot="bg-[#95dbda]"
            label={isEn ? "Up next" : "Sırada"}
            count={nextTasks.length}
          />
          <div className="space-y-2">
            {nextTasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </div>
        </div>
      )}

      {/* BACKLOG — Bekleyen (collapsible) */}
      {backlogTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowBacklog((v) => !v)}
            className="mb-2 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#e8e8e8]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
              {isEn ? "Backlog" : "Bekleyen"}
            </span>
            <span className="text-[11px] text-[#94a3b8]">{backlogTasks.length}</span>
            <ChevronIcon open={showBacklog} />
          </button>
          {showBacklog && (
            <div className="space-y-2">
              {backlogTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DONE — Tamamlandı (collapsible) */}
      {doneTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className="mb-2 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#75fc96]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#94a3b8]">
              {isEn ? "Done" : "Tamamlandı"}
            </span>
            <span className="text-[11px] text-[#94a3b8]">{doneTasks.length}</span>
            <ChevronIcon open={showDone} />
          </button>
          {showDone && (
            <div className="space-y-2">
              {doneTasks.map((task) => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
