"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CheckCircle2, Circle, Eye, Play, RotateCcw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { toast } from "@/components/ui/sonner";
import type { CompletionEffects } from "@/lib/task-completion-effects";
import { parseStructuredDescription } from "@/lib/task-parsing";
import { buildTaskDetailFallback } from "@/lib/task-detail-fallback";
import { notifyTasksUpdated } from "@/lib/browser-events";

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
  /** Sprint-3 structured fields. Populated for new AI-generated and guarded tasks. */
  whyItMatters?: string | null;
  doneCriteria?: string | null;
  nextAction?: string | null;
  /** PRODUCT|MARKETING|LEGAL|TECH|ACQUISITION|ACTIVATION|RETENTION|REVENUE|MEASUREMENT */
  category?: string | null;
  source?: string | null;
  dueDate: Date | null;
  status: TaskStatus;
  priority: Priority;
  startedAt?: Date | string | null;
  completedAt?: Date | string | null;
  launchChecklistItem?: LinkedChecklist | null;
}

/** Resolve a task's effective category. Prefers the new task.category column,
 * falls back to the linked launch checklist for legacy data. */
function effectiveCategory(t: Task): string | null {
  return t.category || t.launchChecklistItem?.category || null;
}

interface TasksListProps {
  tasks: Task[];
  productId: string;
  locale?: string;
  taskLimit?: {
    used: number;
    limit: number;
    isNearLimit: boolean;
    isAtLimit: boolean;
  };
}

const PRIORITY_CONFIG: Record<Priority, { label: string; labelEn: string; dot: string; textColor: string }> = {
  HIGH:   { label: "Yüksek etki",  labelEn: "High impact",   dot: "bg-[#ef4444]", textColor: "text-[#ef4444]" },
  MEDIUM: { label: "Orta etki",    labelEn: "Medium impact",  dot: "bg-[#f59e0b]", textColor: "text-[#f59e0b]" },
  LOW:    { label: "Düşük etki",   labelEn: "Low impact",     dot: "bg-[#94a3b8]", textColor: "text-[#94a3b8]" },
};

const CATEGORY_CONFIG: Record<string, { label: string; labelEn: string; cls: string }> = {
  LEGAL:       { label: "Hukuki hazırlık", labelEn: "Legal",       cls: "bg-red-50 text-red-700 border-red-100" },
  TECH:        { label: "Teknik hazırlık", labelEn: "Tech",        cls: "bg-blue-50 text-blue-700 border-blue-100" },
  PRODUCT:     { label: "Ürün hazırlığı",  labelEn: "Product",     cls: "bg-purple-50 text-purple-700 border-purple-100" },
  MARKETING:   { label: "Pazarlama",       labelEn: "Marketing",   cls: "bg-green-50 text-green-700 border-green-100" },
  ACQUISITION: { label: "Edinim",          labelEn: "Acquisition", cls: "bg-amber-50 text-amber-700 border-amber-100" },
  ACTIVATION:  { label: "Aktivasyon",      labelEn: "Activation",  cls: "bg-teal-50 text-teal-700 border-teal-100" },
  RETENTION:   { label: "Tutma",           labelEn: "Retention",   cls: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  REVENUE:     { label: "Gelir",           labelEn: "Revenue",     cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
  MEASUREMENT: { label: "Ölçümleme",       labelEn: "Measurement", cls: "bg-sky-50 text-sky-700 border-sky-100" },
};

const inputCls =
  "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition bg-white";

export default function TasksList({ tasks, productId, locale, taskLimit }: TasksListProps) {
  const isEn = locale === "en";

  type CategoryFilter =
    | "PRODUCT" | "TECH" | "LEGAL" | "MARKETING"
    | "ACQUISITION" | "ACTIVATION" | "RETENTION" | "REVENUE" | "MEASUREMENT"
    | "NONE" | null;

  const [loading, setLoading] = useState<string | null>(null);
  const [taskItems, setTaskItems] = useState(tasks);
  const [showAdd, setShowAdd] = useState(false);
  const [showLater, setShowLater] = useState(false);
  const [showDone, setShowDone] = useState(false);
  const [detailTaskId, setDetailTaskId] = useState<string | null>(null);

  // Fire-and-forget DETAIL_OPENED event so the task quality report can answer
  // "did the founder actually read the task before acting on it?". Failures
  // are silent — instrumentation must never block the UI.
  function openDetail(taskId: string) {
    setDetailTaskId(taskId);
    fetch(`/api/actions/${taskId}/event`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventType: "DETAIL_OPENED" }),
    }).catch(() => {});
  }
  const [activeCategory, setActiveCategory] = useState<CategoryFilter>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM" as Priority,
  });
  const taskLimitReached = Boolean(taskLimit?.isAtLimit);
  const showTaskWarning = Boolean(taskLimit && (taskLimit.isNearLimit || taskLimit.isAtLimit));

  useEffect(() => {
    setTaskItems(tasks);
  }, [tasks]);

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

  function formatTimestamp(value?: Date | string | null) {
    if (!value) return null;

    return new Intl.DateTimeFormat(isEn ? "en-US" : "tr-TR", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  }

  function getLifecycleMeta(task: Task) {
    if (task.status === "IN_PROGRESS" && task.startedAt) {
      return `${isEn ? "Started" : "Başladı"} ${formatTimestamp(task.startedAt)}`;
    }

    if (task.status === "DONE" && task.completedAt) {
      return `${isEn ? "Completed" : "Tamamlandı"} ${formatTimestamp(task.completedAt)}`;
    }

    return null;
  }

  // Category filter application — uses effectiveCategory so the new
  // task.category column is the primary source of truth, with launchChecklist
  // category as legacy fallback.
  const filteredTasks = activeCategory === null
    ? taskItems
    : activeCategory === "NONE"
    ? taskItems.filter((t) => !effectiveCategory(t))
    : taskItems.filter((t) => effectiveCategory(t) === activeCategory);

  // Categories that have at least one task
  const KNOWN_CATEGORIES = [
    "PRODUCT", "TECH", "LEGAL", "MARKETING",
    "ACQUISITION", "ACTIVATION", "RETENTION", "REVENUE", "MEASUREMENT",
  ] as const;
  const presentCategories = KNOWN_CATEGORIES.filter((cat) =>
    taskItems.some((t) => effectiveCategory(t) === cat)
  );
  const hasUnlinked = taskItems.some((t) => !effectiveCategory(t));

  // Section assignment
  const activeTasks = filteredTasks.filter((t) => t.status !== "DONE");
  const doneTasks = filteredTasks.filter((t) => t.status === "DONE");
  const detailTask = detailTaskId ? taskItems.find((task) => task.id === detailTaskId) ?? null : null;

  // NOW eligibility: IN_PROGRESS OR (HIGH + overdue/today)
  // Hard cap to 3 to keep founder's working memory clear.
  const NOW_HARD_CAP = 3;

  const nowEligible = activeTasks.filter(
    (t) =>
      t.status === "IN_PROGRESS" ||
      (t.priority === "HIGH" && (isOverdue(t.dueDate) || isDueToday(t.dueDate)))
  );

  // Sort: IN_PROGRESS first, then HIGH-overdue, then HIGH-today
  const nowSorted = [...nowEligible].sort((a, b) => {
    const aRank = a.status === "IN_PROGRESS" ? 0 : isOverdue(a.dueDate) ? 1 : 2;
    const bRank = b.status === "IN_PROGRESS" ? 0 : isOverdue(b.dueDate) ? 1 : 2;
    if (aRank !== bRank) return aRank - bRank;
    if (a.priority !== b.priority) {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return order[a.priority] - order[b.priority];
    }
    return 0;
  });

  // If Now is below cap, fill empty slots from highest-priority TODO tasks
  let focusTasks = nowSorted.slice(0, NOW_HARD_CAP);
  if (focusTasks.length < NOW_HARD_CAP) {
    const focusIdsLocal = new Set(focusTasks.map((t) => t.id));
    const fillCandidates = activeTasks
      .filter((t) => !focusIdsLocal.has(t.id) && t.status === "TODO")
      .sort((a, b) => {
        const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (a.priority !== b.priority) return order[a.priority] - order[b.priority];
        // Earlier due date first; null due dates last
        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return 0;
      });
    focusTasks = focusTasks.concat(
      fillCandidates.slice(0, NOW_HARD_CAP - focusTasks.length),
    );
  }
  const focusIds = new Set(focusTasks.map((t) => t.id));

  // LATER: every active task that did not make it into Now
  // (was previously split into "Up next" + "Backlog")
  const laterTasks = activeTasks
    .filter((t) => !focusIds.has(t.id))
    .sort((a, b) => {
      const order = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      if (a.priority !== b.priority) return order[a.priority] - order[b.priority];
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      if (a.dueDate) return -1;
      if (b.dueDate) return 1;
      return 0;
    });

  const allDone = taskItems.filter((t) => t.status === "DONE").length;
  const completionRate =
    taskItems.length > 0 ? Math.round((allDone / taskItems.length) * 100) : 0;

  async function updateStatus(taskId: string, status: TaskStatus) {
    setLoading(taskId);
    try {
      const res = await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => null) as {
        effects?: CompletionEffects | null;
        reversed?: boolean;
        task?: Partial<Task>;
      } | null;

      // Show feedback based on effects
      if (status === "DONE" && data?.effects) {
        const e = data.effects;
        if (e.milestones.includes("ALL_CHECKLIST_COMPLETE")) {
          toast.success(isEn ? "All launch items complete!" : "Tüm launch maddeleri tamamlandı!", {
            description: e.suggestion ?? undefined,
          });
        } else if (e.milestones.includes("ALL_HIGH_BLOCKERS_CLEARED")) {
          toast.success(isEn ? "All critical blockers cleared!" : "Kritik blokajlar temizlendi!", {
            description: e.suggestion ?? undefined,
          });
        } else if (e.checklistCompleted) {
          toast.success(isEn ? "Task completed" : "Görev tamamlandı", {
            description: e.checklistCompleted.title,
          });
        } else {
          toast.success(isEn ? "Task completed" : "Görev tamamlandı");
        }
        if (e.followUpTaskCreated) {
          toast(isEn ? "Follow-up task created" : "Yeni görev oluşturuldu", {
            description: e.followUpTaskCreated.title,
          });
        }
      } else if (data?.reversed) {
        toast(isEn ? "Linked checklist item also reopened" : "Bağlı checklist maddesi de geri açıldı");
      }
      if (data?.task) {
        setTaskItems((current) =>
          current.map((task) => (task.id === taskId ? { ...task, ...data.task } : task))
        );
      }
      notifyTasksUpdated();
    } finally {
      setLoading(null);
    }
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading("new");
    try {
      const res = await fetch("/api/actions", {
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
      const payload = await res.json().catch(() => null) as
        | ({ error?: string } & Partial<Task> & { deduped?: boolean })
        | null;
      if (!res.ok) {
        setFormError(
          payload?.error ??
            (isEn ? "The task could not be added right now." : "Görev şu anda eklenemedi.")
        );
        return;
      }
      if (payload?.id) {
        const payloadId = payload.id;
        setTaskItems((current) => {
          const existingIndex = current.findIndex((task) => task.id === payloadId);
          if (existingIndex >= 0) return current;
          return [
            {
              id: payloadId,
              title: payload.title ?? newTask.title,
              description: payload.description ?? newTask.description ?? null,
              whyItMatters: payload.whyItMatters ?? null,
              doneCriteria: payload.doneCriteria ?? null,
              nextAction: payload.nextAction ?? null,
              category: payload.category ?? null,
              source: payload.source ?? "MANUAL",
              dueDate: payload.dueDate ? new Date(payload.dueDate) : newTask.dueDate ? new Date(newTask.dueDate) : null,
              status: payload.status ?? "TODO",
              priority: payload.priority ?? newTask.priority,
              startedAt: payload.startedAt ?? null,
              completedAt: payload.completedAt ?? null,
              launchChecklistItem: payload.launchChecklistItem ?? null,
            },
            ...current,
          ];
        });
        notifyTasksUpdated();
      }
      setNewTask({ title: "", description: "", dueDate: "", priority: "MEDIUM" });
      setShowAdd(false);
    } finally {
      setLoading(null);
    }
  }

  function normalizeTurkishText(input?: string | null) {
    if (!input) return "";
    if (isEn) return input;

    const replacements: Array<[RegExp, string]> = [
      [/\bIlk\b/g, "İlk"],
      [/\bilk\b/g, "ilk"],
      [/\bkaynagini\b/g, "kaynağını"],
      [/\bnetlestir\b/g, "netleştir"],
      [/\bkullanicilarin\b/g, "kullanıcıların"],
      [/\bgeldigi\b/g, "geldiği"],
      [/\bayirmadan\b/g, "ayırmadan"],
      [/\bkarari\b/g, "kararı"],
      [/\bbulunir\b/g, "bulunur"],
      [/\bgunu\b/g, "günü"],
      [/\bdagitim\b/g, "dağıtım"],
      [/\bsoylenecegi\b/g, "söyleneceği"],
      [/\bolmali\b/g, "olmalı"],
      [/\bdeger\b/g, "değer"],
      [/\blaunch oncesi\b/g, "launch öncesi"],
      [/\bygina\b/g, "yayına"],
      [/\bciktiginda\b/g, "çıktığında"],
      [/\bgelistiriciler\b/g, "geliştiriciler"],
      [/\bgordugunu\b/g, "gördüğünü"],
      [/\banlamali\b/g, "anlamalı"],
      [/\bGeri donen\b/g, "Geri dönen"],
      [/\bdonen\b/g, "dönen"],
      [/\bolc\b/g, "ölç"],
      [/\bkaliciligini\b/g, "kalıcılığını"],
      [/\bgosterir\b/g, "gösterir"],
      [/\baksiyonunu\b/g, "aksiyonunu"],
      [/\baha moment\b/g, "aha moment"],
      [/\bnoktasini\b/g, "noktasını"],
      [/\bizle\b/g, "izle"],
    ];

    let text = input;
    for (const [pattern, replacement] of replacements) {
      text = text.replace(pattern, replacement);
    }
    return text;
  }

  // Resolve structured fields for a task. Prefers the new DB columns, falls
  // back to parsing the legacy free-text description for tasks created before
  // the schema migration. parseStructuredDescription is imported from lib.
  function resolveStructured(task: Task): {
    why: string | null;
    doneCriteria: string | null;
    nextAction: string | null;
    leftover: string | null;
  } {
    if (task.whyItMatters || task.doneCriteria || task.nextAction) {
      return {
        why: task.whyItMatters ?? null,
        doneCriteria: task.doneCriteria ?? null,
        nextAction: task.nextAction ?? null,
        leftover: task.description ?? null,
      };
    }
    const parsed = parseStructuredDescription(task.description);
    return {
      why: parsed.why,
      doneCriteria: parsed.doneCriteria,
      nextAction: parsed.nextAction,
      leftover: parsed.leftover,
    };
  }

  function getTaskTips(task: Task): string[] {
    const cat = effectiveCategory(task);
    if (isEn) {
      if (cat === "LEGAL") {
        return [
          "Define the exact legal deliverable first.",
          "Use one owner and one deadline.",
          "Collect links or files in one place.",
        ];
      }
      if (cat === "MARKETING") {
        return [
          "Write one clear message before channel planning.",
          "Keep launch day distribution simple.",
          "Track one conversion metric from day one.",
        ];
      }
      if (cat === "TECH") {
        return [
          "Define done criteria before implementation.",
          "Test with one realistic scenario.",
          "Write down rollback or fallback action.",
        ];
      }
      return [
        "Clarify expected output in one sentence.",
        "Set one concrete owner and due date.",
        "Close the task only after real-world execution.",
      ];
    }

    if (cat === "LEGAL") {
      return [
        "Önce net hukuki çıktıyı tanımla.",
        "Tek sorumlu ve tek son tarih belirle.",
        "Link ve dosyaları tek yerde topla.",
      ];
    }
    if (cat === "MARKETING") {
      return [
        "Kanal planından önce tek net mesajı yaz.",
        "Launch günü dağıtım planını sade tut.",
        "İlk günden tek dönüşüm metriğini izle.",
      ];
    }
    if (cat === "TECH") {
      return [
        "Geliştirmeden önce done kriterini yaz.",
        "En az bir gerçek senaryoda test et.",
        "Geri alma/fallback adımını netleştir.",
      ];
    }
    return [
      "Beklenen çıktıyı tek cümlede netleştir.",
      "Tek sorumlu ve gerçekçi tarih belirle.",
      "Gerçekte tamamlamadan işi kapatma.",
    ];
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

  function actionLabel(status: TaskStatus) {
    if (status === "TODO") return isEn ? "Start" : "Başla";
    if (status === "IN_PROGRESS") return isEn ? "Mark done" : "Bitti";
    return isEn ? "Reopen" : "Yeniden aç";
  }

  function actionIcon(status: TaskStatus) {
    if (status === "TODO") return <Play className="h-3.5 w-3.5" />;
    if (status === "IN_PROGRESS") return <CheckCircle2 className="h-3.5 w-3.5" />;
    return <RotateCcw className="h-3.5 w-3.5" />;
  }

  function actionClass(status: TaskStatus) {
    if (status === "TODO") {
      return "border border-[#e8e8e8] bg-white text-[#5e6678] hover:bg-[#f6f6f6]";
    }
    if (status === "IN_PROGRESS") {
      return "bg-[#75fc96]/25 text-[#0d0d12] hover:bg-[#75fc96]/40";
    }
    return "border border-[#e8e8e8] bg-white text-[#5e6678] hover:bg-[#f6f6f6]";
  }

  function statusAction(task: Task) {
    if (task.status === "TODO") return () => updateStatus(task.id, "IN_PROGRESS");
    if (task.status === "IN_PROGRESS") return () => updateStatus(task.id, "DONE");
    return () => updateStatus(task.id, "TODO");
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

  function TaskRow({ task, emphasized = false }: { task: Task; emphasized?: boolean }) {
    const overdue = isOverdue(task.dueDate);
    const today = isDueToday(task.dueDate);
    const isLoading = loading === task.id;
    const cat = effectiveCategory(task);
    const catCfg = cat ? CATEGORY_CONFIG[cat] : null;
    const priCfg = PRIORITY_CONFIG[task.priority];
    const done = task.status === "DONE";
    const structured = resolveStructured(task);
    const summary = structured.nextAction || structured.why || task.description || null;
    const lifecycleMeta = getLifecycleMeta(task);

    return (
      <div
        className={`rounded-[16px] border bg-white transition ${
          done
            ? "border-[#e8e8e8] opacity-65"
            : emphasized
            ? "border-[#f3d7ea] shadow-[0_10px_30px_rgba(255,215,239,0.22)]"
            : overdue
            ? "border-red-100"
            : "border-[#e8e8e8]"
        }`}
      >
        <div className="flex items-start gap-3 px-4 py-4 sm:px-5">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => updateStatus(task.id, done ? "TODO" : "DONE")}
            className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition disabled:opacity-50 ${
              done
                ? "border-[#75fc96] bg-[#75fc96]"
                : "border-[#cfcfcf] bg-white hover:border-[#95dbda]"
            }`}
          >
            {isLoading ? (
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#95dbda]" />
            ) : done ? (
              <CheckIcon />
            ) : null}
          </button>

          <div className="min-w-0 flex-1">
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
              {today && !overdue && !done && (
                <span className="rounded-full bg-[#fff7ed] px-2 py-0.5 text-[11px] font-semibold text-[#c2410c]">
                  {isEn ? "Due today" : "Bugün son gün"}
                </span>
              )}
              {catCfg && (
                <span
                  className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${catCfg.cls}`}
                >
                  {isEn ? catCfg.labelEn : catCfg.label}
                </span>
              )}
              <span
                className={`flex items-center gap-1 text-[11px] font-medium ${priCfg.textColor}`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${priCfg.dot}`} />
                {isEn ? priCfg.labelEn : priCfg.label}
              </span>
              {task.dueDate && !done && (
                <span className={`text-[11px] ${overdue ? "font-semibold text-red-600" : "text-[#8a8fa0]"}`}>
                  {today ? (isEn ? "Today" : "Bugün") : format(new Date(task.dueDate), emphasized ? "d MMM yyyy" : "d MMM")}
                </span>
              )}
            </div>

            <h3 className={`text-[15px] font-semibold leading-snug ${done ? "text-[#8a8fa0] line-through" : "text-[#0d0d12]"}`}>
              {normalizeTurkishText(task.title)}
            </h3>

            {summary && (
              <p className={`mt-1 line-clamp-2 text-[13px] leading-5 ${done ? "text-[#b0b7c3]" : "text-[#666d80]"}`}>
                {normalizeTurkishText(summary)}
              </p>
            )}

            {lifecycleMeta && (
              <p className={`mt-2 text-[11px] font-medium ${done ? "text-[#9ea6b4]" : "text-[#7b8393]"}`}>
                {lifecycleMeta}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => openDetail(task.id)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#e8e8e8] text-[#5e6678] transition hover:bg-[#f6f6f6]"
              aria-label={isEn ? "Preview task" : "Görevi önizle"}
            >
              <Eye className="h-4 w-4" />
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={statusAction(task)}
              className={`inline-flex h-9 items-center justify-center gap-1.5 rounded-full px-4 text-[12px] font-semibold transition disabled:opacity-50 ${actionClass(task.status)}`}
            >
              {actionIcon(task.status)}
              <span>{actionLabel(task.status)}</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- Render ---

  return (
    <div className="space-y-4">
      {showTaskWarning && taskLimit && (
        <div
          className={`rounded-[16px] border px-4 py-4 ${
            taskLimitReached
              ? "border-[#ffd7ef] bg-[#fff7fc]"
              : "border-[#f7dfb0] bg-[#fffaf0]"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#8a8fa0]">
                {isEn ? "Plan usage" : "Plan kullanımı"}
              </p>
              <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">
                {taskLimitReached
                  ? isEn
                    ? "You reached the Free task limit."
                    : "Ücretsiz plan görev limitine ulaştın."
                  : isEn
                  ? `You are close to the task limit: ${taskLimit.used}/${taskLimit.limit}.`
                  : `Görev limitine yaklaştın: ${taskLimit.used}/${taskLimit.limit}.`}
              </p>
              <p className="mt-1 text-[12px] leading-5 text-[#5e6678]">
                {taskLimitReached
                  ? isEn
                    ? "Upgrade to keep adding tasks across your products."
                    : "Ürünlerin genelinde yeni görev eklemeye devam etmek için planını yükselt."
                  : isEn
                  ? "Starter removes the 50-task cap before your queue gets blocked."
                  : "Görev kuyruğu bloklanmadan önce Starter planına geçerek 50 görev sınırını kaldırabilirsin."}
              </p>
            </div>
            <a
              href={`/${locale ?? "en"}/pricing`}
              className="inline-flex h-9 items-center justify-center rounded-full bg-[#0d0d12] px-4 text-[12px] font-semibold text-white transition hover:bg-[#1a1a24]"
            >
              {isEn ? "See plans" : "Planları gör"}
            </a>
          </div>
        </div>
      )}

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
                {allDone}/{tasks.length}{" "}
                {isEn ? "done" : "tamamlandı"}
              </span>
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          disabled={taskLimitReached}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border border-[#e8e8e8] px-3 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f6f6f6] disabled:cursor-not-allowed disabled:opacity-40"
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

      {/* Category filter strip */}
      {(presentCategories.length > 0 || hasUnlinked) && (
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={`h-7 rounded-full border px-3 text-[12px] font-medium transition ${
              activeCategory === null
                ? "border-[#95dbda] bg-[#95dbda]/15 text-[#0d0d12]"
                : "border-[#e8e8e8] text-[#666d80] hover:bg-[#f6f6f6]"
            }`}
          >
            {isEn ? "All" : "Tümü"}
            <span className="ml-1 text-[11px] text-[#8a8fa0]">{tasks.length}</span>
          </button>
          {presentCategories.map((cat) => {
            const cfg = CATEGORY_CONFIG[cat];
            const count = tasks.filter((t) => effectiveCategory(t) === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
                className={`h-7 rounded-full border px-3 text-[12px] font-medium transition ${
                  activeCategory === cat
                    ? "border-[#95dbda] bg-[#95dbda]/15 text-[#0d0d12]"
                    : "border-[#e8e8e8] text-[#666d80] hover:bg-[#f6f6f6]"
                }`}
              >
                {isEn ? cfg.labelEn : cfg.label}
                <span className="ml-1 text-[11px] text-[#8a8fa0]">{count}</span>
              </button>
            );
          })}
          {hasUnlinked && (
            <button
              type="button"
              onClick={() => setActiveCategory(activeCategory === "NONE" ? null : "NONE")}
              className={`h-7 rounded-full border px-3 text-[12px] font-medium transition ${
                activeCategory === "NONE"
                  ? "border-[#95dbda] bg-[#95dbda]/15 text-[#0d0d12]"
                  : "border-[#e8e8e8] text-[#666d80] hover:bg-[#f6f6f6]"
              }`}
            >
              {isEn ? "Other" : "Diğer"}
              <span className="ml-1 text-[11px] text-[#8a8fa0]">
                {tasks.filter((t) => !t.launchChecklistItem).length}
              </span>
            </button>
          )}
        </div>
      )}

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
            disabled={loading === "new" || taskLimitReached}
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
          {formError && (
            <p className="text-[12px] text-red-600">{formError}</p>
          )}
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
              : "Görev ekleyerek çalışma yüzeyini oluştur. Yayın kontrol listesinden bağlanan görevler burada otomatik görünür."}
          </p>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            disabled={taskLimitReached}
            className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isEn ? "Add first task" : "İlk görevi ekle"}
          </button>
        </div>
      )}

      {/* NOW — Şimdi (max 3) */}
      {focusTasks.length > 0 && (
        <div>
          <SectionLabel
            dot="bg-[#ffd7ef]"
            label={isEn ? "Now" : "Şimdi"}
            count={focusTasks.length}
          />
          <div className="space-y-2">
            {focusTasks.map((task) => (
              <TaskRow key={task.id} task={task} emphasized />
            ))}
          </div>
        </div>
      )}

      {/* NOW empty but Later has items — invite founder to promote one */}
      {focusTasks.length === 0 && laterTasks.length > 0 && (
        <div className="rounded-[14px] border border-dashed border-[#e8e8e8] bg-white px-5 py-6 text-center">
          <p className="text-[13px] font-semibold text-[#0d0d12]">
            {isEn ? "Nothing on your plate right now" : "Şu an üstünde aktif iş yok"}
          </p>
          <p className="mt-1 text-[12px] leading-5 text-[#666d80]">
            {isEn
              ? `Pick one from Later (${laterTasks.length}) to start the day with a single focus.`
              : `Sonra listesinden (${laterTasks.length}) bir tanesini seçerek güne tek odakla başla.`}
          </p>
          <button
            type="button"
            onClick={() => setShowLater(true)}
            className="mt-3 inline-flex h-8 items-center justify-center rounded-full bg-[#ffd7ef] px-4 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {isEn ? "Open Later" : "Sonra'yı aç"}
          </button>
        </div>
      )}

      {/* LATER — Sonra (collapsed by default; merges old "Up next" + "Backlog") */}
      {laterTasks.length > 0 && (
        <div>
          <button
            type="button"
            onClick={() => setShowLater((v) => !v)}
            className="mb-2 flex items-center gap-2"
          >
            <span className="h-2 w-2 rounded-full bg-[#95dbda]" />
            <span className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#0d0d12]">
              {isEn ? "Later" : "Sonra"}
            </span>
            <span className="text-[11px] text-[#8a8fa0]">{laterTasks.length}</span>
            <ChevronIcon open={showLater} />
          </button>
          {showLater && (
            <div className="space-y-2">
              {laterTasks.map((task) => (
                <TaskRow key={task.id} task={task} />
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
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          )}
        </div>
      )}

      <Sheet open={Boolean(detailTask)} onOpenChange={(open) => !open && setDetailTaskId(null)}>
        {detailTask ? (
          <SheetContent
            side="right"
            className="w-full overflow-y-auto border-l border-[#ececec] bg-white p-0 sm:max-w-[560px]"
          >
            <div className="flex min-h-full flex-col">
              <SheetHeader className="border-b border-[#f0f0f0] px-6 py-5">
                <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-[#8a8fa0]">
                  {isEn ? "Board / Task preview" : "Pano / Görev önizleme"}
                </p>
                <SheetTitle className="pr-10 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#0d0d12]">
                  {normalizeTurkishText(detailTask.title)}
                </SheetTitle>
                <SheetDescription className="text-[14px] leading-6 text-[#5e6678]">
                  {normalizeTurkishText(
                    resolveStructured(detailTask).nextAction ||
                      resolveStructured(detailTask).why ||
                      detailTask.description ||
                      (isEn ? "Task detail preview" : "Görev detay önizlemesi"),
                  )}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 px-6 py-5">
                {(() => {
                  const structured = resolveStructured(detailTask);
                  const fallback = buildTaskDetailFallback({
                    title: detailTask.title,
                    category: effectiveCategory(detailTask),
                    linkedChecklistTitle: detailTask.launchChecklistItem?.title ?? null,
                    locale,
                  });
                  const cat = effectiveCategory(detailTask);
                  const catCfg = cat ? CATEGORY_CONFIG[cat] : null;
                  const priCfg = PRIORITY_CONFIG[detailTask.priority];
                  const startedLabel = formatTimestamp(detailTask.startedAt);
                  const completedLabel = formatTimestamp(detailTask.completedAt);
                  const sections: Array<{ label: string; value: string | null; accent: string }> = [
                    {
                      label: isEn ? "Why it matters" : "Neden önemli",
                      value: structured.why ?? fallback.why,
                      accent: "border-l-[#ffd7ef]",
                    },
                    {
                      label: isEn ? "Done when" : "Biten hali",
                      value: structured.doneCriteria ?? fallback.doneCriteria,
                      accent: "border-l-[#75fc96]",
                    },
                    {
                      label: isEn ? "Next action" : "Sonraki adım",
                      value: structured.nextAction ?? fallback.nextAction,
                      accent: "border-l-[#95dbda]",
                    },
                  ];

                  return (
                    <div className="space-y-5">
                      <div className="flex flex-wrap items-center gap-2">
                        {catCfg ? (
                          <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${catCfg.cls}`}>
                            {isEn ? catCfg.labelEn : catCfg.label}
                          </span>
                        ) : null}
                        <span className={`inline-flex items-center gap-1.5 rounded-full bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold ${priCfg.textColor}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${priCfg.dot}`} />
                          {isEn ? priCfg.labelEn : priCfg.label}
                        </span>
                        <span className="rounded-full bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#5e6678]">
                          {detailTask.status === "IN_PROGRESS"
                            ? isEn ? "In progress" : "Yapılıyor"
                            : detailTask.status === "DONE"
                            ? isEn ? "Done" : "Tamamlandı"
                            : isEn ? "Todo" : "Yapılacak"}
                        </span>
                        {detailTask.dueDate ? (
                          <span className="rounded-full bg-[#fafafa] px-2.5 py-1 text-[11px] font-semibold text-[#5e6678]">
                            {format(new Date(detailTask.dueDate), "d MMM yyyy")}
                          </span>
                        ) : null}
                      </div>

                      {(startedLabel || completedLabel) && (
                        <div className="grid gap-3 sm:grid-cols-2">
                          {startedLabel ? (
                            <div className="rounded-[14px] border border-[#ece8df] bg-[#fcfbf8] px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                                {isEn ? "Started" : "Başladı"}
                              </p>
                              <p className="mt-1 text-[14px] font-medium text-[#0d0d12]">
                                {startedLabel}
                              </p>
                            </div>
                          ) : null}
                          {completedLabel ? (
                            <div className="rounded-[14px] border border-[#ece8df] bg-[#fcfbf8] px-4 py-3">
                              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                                {isEn ? "Completed" : "Tamamlandı"}
                              </p>
                              <p className="mt-1 text-[14px] font-medium text-[#0d0d12]">
                                {completedLabel}
                              </p>
                            </div>
                          ) : null}
                        </div>
                      )}

                      {sections.map((section) =>
                        section.value ? (
                          <div
                            key={section.label}
                            className={`rounded-r-[14px] border-l-[3px] bg-[#fafafa] px-4 py-3 ${section.accent}`}
                          >
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                              {section.label}
                            </p>
                            <p className="mt-1 text-[14px] leading-6 text-[#0d0d12]">
                              {normalizeTurkishText(section.value)}
                            </p>
                          </div>
                        ) : null,
                      )}

                      {structured.leftover ? (
                        <div className="rounded-[14px] border border-[#f0f0f0] bg-white px-4 py-3">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                            {isEn ? "Notes" : "Notlar"}
                          </p>
                          <p className="mt-1 text-[14px] leading-6 text-[#5e6678]">
                            {normalizeTurkishText(structured.leftover)}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  );
                })()}
              </div>

              <div className="border-t border-[#f0f0f0] px-6 py-4">
                <button
                  type="button"
                  disabled={loading === detailTask.id}
                  onClick={() => {
                    statusAction(detailTask)();
                    if (detailTask.status !== "TODO") setDetailTaskId(null);
                  }}
                  className={`inline-flex h-10 items-center justify-center gap-2 rounded-full px-4 text-[13px] font-semibold transition disabled:opacity-50 ${actionClass(detailTask.status)}`}
                >
                  {actionIcon(detailTask.status)}
                  <span>{actionLabel(detailTask.status)}</span>
                </button>
              </div>
            </div>
          </SheetContent>
        ) : null}
      </Sheet>
    </div>
  );
}
