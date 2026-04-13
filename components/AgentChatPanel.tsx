"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { AgentType } from "@/lib/agent-types";
import UsageLimitModal from "@/components/UsageLimitModal";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
export type { AgentType };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  messageActions?: AgentMessageAction[];
}

interface AgentAction {
  type: "create_task";
  payload: { title: string; description?: string; priority?: string };
}

interface AgentMessageAction {
  type: "create_task" | "open_checklist" | "open_tracking";
  label: string;
  payload?: { title?: string; description?: string; priority?: string };
}

interface AgentSuggestion {
  id?: string;
  label: string;
  title?: string;
  intent?: "ask" | "create_task";
  payload?: { title: string; description?: string; priority?: string };
  description?: string | null;
  whyItMatters?: string;
  doneCriteria?: string;
  nextAction?: string;
  category?: string;
  priority?: "HIGH" | "MEDIUM" | "LOW";
  source?: "ai" | "fallback";
  confidence?: "high" | "medium" | "low";
  existingTaskId?: string;
  existingTaskTitle?: string;
}

interface AgentApiResponse {
  message: string;
  actions: AgentAction[];
  messageActions?: AgentMessageAction[];
  executedActions: string[];
  suggestions: AgentSuggestion[];
}

type LimitErrorPayload = {
  error?: string;
  code?: string;
  upgradeUrl?: string;
};

type Copy = {
  panelTitle: string;
  recommendationsTitle: string;
  recommendationsHint: string;
  chatTitle: string;
  chatPlaceholder: string;
  sendLabel: string;
  taskAdded: (title: string) => string;
  taskFailed: string;
  genericError: string;
  initialSuggestions: AgentSuggestion[];
  greeting: string;
};

function getCopy(agentType: AgentType, locale: string): Copy {
  const isEn = locale === "en";

  const shared = {
    chatTitle: isEn ? "Ask for detail" : "Detay sor",
    chatPlaceholder: isEn ? "Ask a specific question..." : "Belirli bir soru sor...",
    sendLabel: isEn ? "Send" : "Gönder",
    taskAdded: (title: string) => (isEn ? `Task added: ${title}` : `Görev eklendi: ${title}`),
    taskFailed: isEn ? "There was a problem while creating the task." : "Görev oluşturulurken bir sorun oluştu.",
    genericError: isEn ? "Something went wrong. Try again?" : "Bir sorun oluştu, tekrar dener misin?",
  };

  if (agentType === "growth") {
    return {
      ...shared,
      panelTitle: isEn ? "Growth Recommendations" : "Growth Önerileri",
      recommendationsTitle: isEn ? "Recommended next actions" : "Önerilen sonraki adımlar",
      recommendationsHint: isEn
        ? "These cards are task-first actions for the Growth surface."
        : "Bu kartlar Growth ekranı için görev odaklı aksiyonlardır.",
      chatTitle: isEn ? "Ask Growth Agent" : "Growth Agent'a sor",
      greeting: isEn
        ? "Growth recommendations are separated from chat now. Use the cards for actions, use chat for deeper questions."
        : "Growth önerileri artık chat'ten ayrıldı. Aksiyon için kartları, derinleşmek için chat'i kullan.",
      initialSuggestions: [
        { label: isEn ? "Make the first live dashboard work within 48 hours" : "Metrikleri takip eden ilk dashboard'ı 48 saat içinde çalışır hale getir", intent: "create_task", payload: { title: isEn ? "Make the first live dashboard work within 48 hours" : "Metrikleri takip eden ilk dashboard'ı 48 saat içinde çalışır hale getir", priority: "MEDIUM" } },
        { label: isEn ? "Analyze first-session drop-off after 7 days of data" : "İlk 7 günlük veriyi topladıktan sonra ilk oturum drop-off'unu analiz et", intent: "create_task", payload: { title: isEn ? "Analyze first-session drop-off after 7 days of data" : "İlk 7 günlük veriyi topladıktan sonra ilk oturum drop-off'unu analiz et", priority: "MEDIUM" } },
        { label: isEn ? "Measure chat-to-meeting conversion" : "Chat başlatma oranıyla çay buluşması talebi sayısını karşılaştır", intent: "create_task", payload: { title: isEn ? "Measure chat-to-meeting conversion" : "Chat başlatma oranıyla çay buluşması talebi sayısını karşılaştır", priority: "MEDIUM" } },
      ],
    };
  }

  if (agentType === "launch") {
    return {
      ...shared,
      panelTitle: isEn ? "Launch Recommendations" : "Launch Önerileri",
      recommendationsTitle: isEn ? "Recommended launch actions" : "Önerilen launch aksiyonları",
      recommendationsHint: isEn
        ? "These cards are task-first actions for launch readiness."
        : "Bu kartlar launch hazırlığı için görev odaklı aksiyonlardır.",
      chatTitle: isEn ? "Ask Launch Agent" : "Launch Agent'a sor",
      greeting: isEn
        ? "Launch recommendations are separated from chat now. Use the cards to create actions, use chat for questions."
        : "Launch önerileri artık chat'ten ayrıldı. Aksiyon için kartları, soru için chat'i kullan.",
      initialSuggestions: [
        { label: isEn ? "Close the top launch blocker" : "En kritik launch blocker'ını kapat", intent: "create_task", payload: { title: isEn ? "Close the top launch blocker" : "En kritik launch blocker'ını kapat", priority: "HIGH" } },
        { label: isEn ? "Prepare store submission evidence" : "Store submission için gerekli kanıtları hazırla", intent: "create_task", payload: { title: isEn ? "Prepare store submission evidence" : "Store submission için gerekli kanıtları hazırla", priority: "MEDIUM" } },
        { label: isEn ? "Review compliance requirements before launch" : "Launch öncesi compliance gerekliliklerini gözden geçir", intent: "create_task", payload: { title: isEn ? "Review compliance requirements before launch" : "Launch öncesi compliance gerekliliklerini gözden geçir", priority: "HIGH" } },
      ],
    };
  }

  return {
    ...shared,
    panelTitle: isEn ? "Tiramisup Recommendations" : "Tiramisup Önerileri",
    recommendationsTitle: isEn ? "Recommended next actions" : "Önerilen sonraki adımlar",
    recommendationsHint: isEn
      ? "These cards summarize the most useful next moves across the product."
      : "Bu kartlar ürün genelinde şu an en faydalı sonraki hamleleri özetler.",
    chatTitle: isEn ? "Ask Tiramisup" : "Tiramisup'a sor",
    greeting: isEn
      ? "General recommendations are now separate from chat. Use the cards to act, use chat to explore."
      : "Genel öneriler artık chat'ten ayrı. Aksiyon için kartları, keşif için chat'i kullan.",
    initialSuggestions: [
      { label: isEn ? "Clarify the single most important next step" : "Şu anki tek en önemli sonraki adımı netleştir", intent: "create_task", payload: { title: isEn ? "Clarify the single most important next step" : "Şu anki tek en önemli sonraki adımı netleştir", priority: "MEDIUM" } },
      { label: isEn ? "Turn this week's priority into one task" : "Bu haftanın önceliğini tek göreve çevir", intent: "create_task", payload: { title: isEn ? "Turn this week's priority into one task" : "Bu haftanın önceliğini tek göreve çevir", priority: "MEDIUM" } },
      { label: isEn ? "Review what is blocking progress today" : "Bugün ilerlemeyi neyin blokladığını gözden geçir", intent: "create_task", payload: { title: isEn ? "Review what is blocking progress today" : "Bugün ilerlemeyi neyin blokladığını gözden geçir", priority: "MEDIUM" } },
    ],
  };
}

function AgentAvatar({ agentType }: { agentType: AgentType }) {
  const colors: Record<AgentType, { bg: string; fg: string }> = {
    overview: { bg: "#95dbda", fg: "#0d0d12" },
    launch: { bg: "#ffd7ef", fg: "#0d0d12" },
    growth: { bg: "#75fc96", fg: "#0d0d12" },
  };
  const { bg, fg } = colors[agentType];
  const initials: Record<AgentType, string> = {
    overview: "OA",
    launch: "LA",
    growth: "GA",
  };
  return (
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-bold shrink-0"
      style={{ backgroundColor: bg, color: fg }}
    >
      {initials[agentType]}
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex gap-1 items-center px-3 py-2">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-[#8a8fa0] animate-bounce"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

interface AgentChatPanelProps {
  agentType: AgentType;
  productId: string;
  locale: string;
  onTasksCreated?: (titles: string[]) => void;
}

export default function AgentChatPanel({
  agentType,
  productId,
  locale,
  onTasksCreated,
}: AgentChatPanelProps) {
  const router = useRouter();
  const copy = getCopy(agentType, locale);
  const isEn = locale === "en";
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(true);
  const [previewSuggestion, setPreviewSuggestion] = useState<AgentSuggestion | null>(null);
  const [limitModal, setLimitModal] = useState<{
    title: string;
    description: string;
    upgradeHref: string;
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([]);
    setSuggestions([]);
    setSuggestionsLoading(true);
    setInput("");

    const controller = new AbortController();
    fetch(
      `/api/agent/suggestions?agentType=${agentType}&productId=${productId}&locale=${locale}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch(() => {})
      .finally(() => setSuggestionsLoading(false));

    fetch(
      `/api/agent/chat?agentType=${agentType}&productId=${productId}&locale=${locale}`,
      { signal: controller.signal }
    )
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.messages)) {
          setMessages(data.messages);
        }
      })
      .catch(() => {});

    return () => controller.abort();
  }, [agentType, locale, productId]);

  const refetchSuggestions = useCallback(() => {
    setSuggestionsLoading(true);
    fetch(`/api/agent/suggestions?agentType=${agentType}&productId=${productId}&locale=${locale}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
      })
      .catch(() => {})
      .finally(() => setSuggestionsLoading(false));
  }, [agentType, locale, productId]);

  useEffect(() => {
    window.addEventListener("tiramisup:checklist-updated", refetchSuggestions);
    return () => window.removeEventListener("tiramisup:checklist-updated", refetchSuggestions);
  }, [refetchSuggestions]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentType,
            message: text,
            productId,
            locale,
          }),
        });

        const data = await res.json().catch(() => null) as AgentApiResponse & LimitErrorPayload;

        if (!res.ok) {
          if (data?.code === "AI_MESSAGE_LIMIT_REACHED") {
            setLimitModal({
              title: isEn ? "Agent chat limit reached" : "Agent chat limiti doldu",
              description: isEn
                ? "Your current plan has no chat messages left for this month. Upgrade to keep using the agent."
                : "Mevcut planındaki aylık agent chat mesaj hakkı doldu. Agent'ı kullanmaya devam etmek için planını yükselt.",
              upgradeHref: data.upgradeUrl ?? `/${locale}/pricing`,
            });
            setMessages((prev) => [
              ...prev,
              {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: isEn
                  ? "You reached the chat limit for this plan. Open pricing to continue."
                  : "Bu planın chat limitine ulaştın. Devam etmek için fiyatlandırmayı aç.",
              },
            ]);
            return;
          }

          throw new Error(data?.error ?? "chat failed");
        }

        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: data.message,
            messageActions: data.messageActions ?? [],
          },
        ]);

        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions.slice(0, 4));
        }

        if (data.executedActions?.length > 0 && onTasksCreated) {
          const taskTitles = data.executedActions
            .filter((a) => a.startsWith("task_created:"))
            .map((a) => a.replace("task_created:", ""));
          if (taskTitles.length > 0) onTasksCreated(taskTitles);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            role: "assistant",
            content: copy.genericError,
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [agentType, copy.genericError, isEn, loading, locale, onTasksCreated, productId]
  );

  async function createTask(inputTask: {
    title: string;
    description?: string;
    priority?: string;
  }) {
    const title = inputTask.title.trim();
    if (!title || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          title,
          description: inputTask.description ?? copy.recommendationsHint,
          priority:
            inputTask.priority === "HIGH" || inputTask.priority === "LOW"
              ? inputTask.priority
              : "MEDIUM",
        }),
      });

      const data = await res.json().catch(() => null) as LimitErrorPayload;
      if (!res.ok) {
        throw new Error(data?.error ?? "create task failed");
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          role: "assistant",
          content: copy.taskAdded(title),
        },
      ]);
      onTasksCreated?.([title]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : copy.taskFailed,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function createTaskFromSuggestion(suggestion: AgentSuggestion) {
    if (suggestion.existingTaskId) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          role: "assistant",
          content: isEn
            ? `That work is already on the board as "${suggestion.existingTaskTitle ?? suggestion.title ?? suggestion.label}".`
            : `Bu iş zaten board'da: "${suggestion.existingTaskTitle ?? suggestion.title ?? suggestion.label}".`,
        },
      ]);
      router.push(`/${locale}/tasks`);
      setPreviewSuggestion(null);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/agent/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          locale,
          suggestion: {
            title: suggestion.title ?? suggestion.payload?.title ?? suggestion.label,
            description: suggestion.description ?? suggestion.payload?.description ?? null,
            whyItMatters: suggestion.whyItMatters,
            doneCriteria: suggestion.doneCriteria,
            nextAction: suggestion.nextAction,
            category: suggestion.category,
            priority: suggestion.priority ?? suggestion.payload?.priority ?? "MEDIUM",
          },
        }),
      });

      const data = await res.json().catch(() => null) as {
        error?: string;
        task?: { title: string };
        deduped?: boolean;
        dedupedAgainst?: string | null;
      } | null;

      if (!res.ok) {
        throw new Error(data?.error ?? copy.taskFailed);
      }

      const title = data?.task?.title ?? suggestion.title ?? suggestion.label;
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          role: "assistant",
          content:
            data?.deduped
              ? isEn
                ? `Already on the board: ${data.dedupedAgainst ?? title}`
                : `Zaten board'da: ${data.dedupedAgainst ?? title}`
              : copy.taskAdded(title),
        },
      ]);
      setPreviewSuggestion(null);
      refetchSuggestions();
      onTasksCreated?.([title]);
      if (data?.deduped) {
        router.push(`/${locale}/tasks`);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}`,
          role: "assistant",
          content: err instanceof Error ? err.message : copy.taskFailed,
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  async function handleMessageAction(action: AgentMessageAction) {
    if (action.type === "create_task") {
      await createTask({
        title: action.payload?.title?.trim() || action.label.trim(),
        description: action.payload?.description,
        priority: action.payload?.priority,
      });
      return;
    }

    const destination =
      action.payload?.description ||
      (action.type === "open_checklist"
        ? `/${locale}/pre-launch#blockers`
        : `/${locale}/settings?section=tracking&productId=${productId}`);
    router.push(destination);
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
  };

  const categoryMeta: Record<string, { en: string; tr: string; cls: string }> = {
    PRODUCT: { en: "Product", tr: "Ürün hazırlığı", cls: "bg-purple-50 text-purple-700 border-purple-100" },
    TECH: { en: "Tech", tr: "Teknik hazırlık", cls: "bg-blue-50 text-blue-700 border-blue-100" },
    LEGAL: { en: "Legal", tr: "Hukuki hazırlık", cls: "bg-red-50 text-red-700 border-red-100" },
    MARKETING: { en: "Marketing", tr: "Pazarlama", cls: "bg-green-50 text-green-700 border-green-100" },
    ACQUISITION: { en: "Acquisition", tr: "Edinim", cls: "bg-amber-50 text-amber-700 border-amber-100" },
    ACTIVATION: { en: "Activation", tr: "Aktivasyon", cls: "bg-teal-50 text-teal-700 border-teal-100" },
    RETENTION: { en: "Retention", tr: "Tutma", cls: "bg-indigo-50 text-indigo-700 border-indigo-100" },
    REVENUE: { en: "Revenue", tr: "Gelir", cls: "bg-emerald-50 text-emerald-700 border-emerald-100" },
    MEASUREMENT: { en: "Measurement", tr: "Ölçümleme", cls: "bg-sky-50 text-sky-700 border-sky-100" },
  };

  const confidenceLabel = (confidence?: "high" | "medium" | "low") => {
    if (confidence === "high") return isEn ? "High confidence" : "Yüksek güven";
    if (confidence === "low") return isEn ? "Low confidence" : "Düşük güven";
    return isEn ? "Medium confidence" : "Orta güven";
  };

  return (
    <>
      <UsageLimitModal
        open={Boolean(limitModal)}
        locale={locale}
        title={limitModal?.title ?? ""}
        description={limitModal?.description ?? ""}
        upgradeHref={limitModal?.upgradeHref ?? `/${locale}/pricing`}
        onClose={() => setLimitModal(null)}
      />

      <Sheet open={Boolean(previewSuggestion)} onOpenChange={(open) => !open && setPreviewSuggestion(null)}>
        <SheetContent
          side="right"
          className="w-full overflow-y-auto border-l border-[#e8e8e8] bg-white p-0 sm:max-w-[560px]"
        >
          {previewSuggestion ? (
            <div className="flex min-h-full flex-col">
              <SheetHeader className="border-b border-[#f0f0f0] px-6 py-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
                  {copy.panelTitle}
                </p>
                <SheetTitle className="pr-10 text-[24px] font-bold leading-tight tracking-[-0.02em] text-[#0d0d12]">
                  {previewSuggestion.title ?? previewSuggestion.label}
                </SheetTitle>
                <SheetDescription className="text-[13px] leading-5 text-[#5e6678]">
                  {previewSuggestion.description ??
                    (isEn
                      ? "Review the reason, done criteria, and first action before adding this to the board."
                      : "Bu işi board'a eklemeden önce nedeni, bitmiş hali ve ilk aksiyonu gözden geçir.")}
                </SheetDescription>
              </SheetHeader>

              <div className="flex-1 space-y-4 px-6 py-5">
                <div className="flex flex-wrap items-center gap-2">
                  {previewSuggestion.category && categoryMeta[previewSuggestion.category] ? (
                    <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${categoryMeta[previewSuggestion.category].cls}`}>
                      {isEn ? categoryMeta[previewSuggestion.category].en : categoryMeta[previewSuggestion.category].tr}
                    </span>
                  ) : null}
                  <span className="rounded-full border border-[#ece7e2] bg-[#faf8f5] px-2.5 py-1 text-[11px] font-semibold text-[#5e6678]">
                    {previewSuggestion.priority === "HIGH"
                      ? isEn ? "High impact" : "Yüksek etki"
                      : previewSuggestion.priority === "LOW"
                        ? isEn ? "Low impact" : "Düşük etki"
                        : isEn ? "Medium impact" : "Orta etki"}
                  </span>
                  <span className="rounded-full border border-[#ece7e2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5e6678]">
                    {confidenceLabel(previewSuggestion.confidence)}
                  </span>
                  <span className="rounded-full border border-[#ece7e2] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#5e6678]">
                    {previewSuggestion.source === "fallback" ? "Fallback" : "AI"}
                  </span>
                </div>

                {previewSuggestion.existingTaskTitle ? (
                  <div className="rounded-[14px] border border-[#d7efdf] bg-[#f5fcf7] px-4 py-3">
                    <p className="text-[12px] font-semibold text-[#166534]">
                      {isEn ? "Already on the board" : "Zaten board'da"}
                    </p>
                    <p className="mt-1 text-[12px] leading-5 text-[#166534]">
                      {previewSuggestion.existingTaskTitle}
                    </p>
                  </div>
                ) : null}

                {[
                  {
                    label: isEn ? "Why it matters" : "Neden önemli",
                    value: previewSuggestion.whyItMatters,
                    accent: "border-l-[#ffd7ef]",
                  },
                  {
                    label: isEn ? "Done when" : "Biten hali",
                    value: previewSuggestion.doneCriteria,
                    accent: "border-l-[#75fc96]",
                  },
                  {
                    label: isEn ? "Next action" : "Sonraki adım",
                    value: previewSuggestion.nextAction,
                    accent: "border-l-[#95dbda]",
                  },
                ].map((section) => (
                  <div
                    key={section.label}
                    className={`rounded-r-[14px] border-l-[3px] bg-[#fafafa] px-4 py-3 ${section.accent}`}
                  >
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
                      {section.label}
                    </p>
                    <p className="mt-1 text-[14px] leading-6 text-[#0d0d12]">
                      {section.value}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#f0f0f0] px-6 py-4">
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void createTaskFromSuggestion(previewSuggestion)}
                  className="inline-flex h-10 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24] disabled:opacity-50"
                >
                  {previewSuggestion.existingTaskId
                    ? isEn ? "Open board" : "Board'u aç"
                    : isEn ? "Create task" : "Görev oluştur"}
                </button>
              </div>
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      <div className="flex h-full flex-col">
        <div className="border-b border-[#f0ede8] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {copy.panelTitle}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[#5e6678]">
          {copy.recommendationsHint}
        </p>

        {suggestionsLoading ? (
          <div className="mt-3 space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-[14px] bg-[#f0ede8]" />
            ))}
          </div>
        ) : suggestions.length > 0 && !loading ? (
          <div className="mt-3 space-y-2">
            {suggestions.map((suggestion) => (
              <div
                key={suggestion.id ?? `${suggestion.intent ?? "create_task"}-${suggestion.label}`}
                className="flex items-center gap-2 rounded-[14px] border border-[#ece7e2] bg-[#faf8f5] px-3 py-3 transition hover:border-[#d8d1ca] hover:bg-white"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-[12px] font-medium leading-5 text-[#3d4658]">
                    {suggestion.title ?? suggestion.label}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewSuggestion(suggestion)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#ddd6ce] bg-white text-[#5e6678] transition hover:border-[#c8c0b7] hover:bg-[#faf8f5]"
                  aria-label={isEn ? "Preview suggestion" : "Öneri detayını aç"}
                  title={isEn ? "Preview" : "Önizle"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => void createTaskFromSuggestion(suggestion)}
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0d0d12] text-white transition hover:bg-[#1a1a24]"
                  aria-label={suggestion.existingTaskId
                    ? isEn ? "Open existing task on board" : "Var olan görevi board'da aç"
                    : isEn ? "Create task" : "Görev oluştur"}
                  title={suggestion.existingTaskId
                    ? isEn ? "Open board" : "Board'u aç"
                    : isEn ? "Create task" : "Görev oluştur"}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : null}
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa1af]">
          {copy.chatTitle}
        </p>

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && <AgentAvatar agentType={agentType} />}
            <div className="max-w-[85%]">
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#0d0d12] text-white rounded-br-sm"
                    : "bg-[#f0f0f0] text-[#0d0d12] rounded-bl-sm"
                }`}
              >
                {msg.content}
              </div>
              {msg.role === "assistant" && (msg.messageActions?.length ?? 0) > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.messageActions?.map((action, index) => (
                    <button
                      key={`${msg.id}-${action.type}-${index}`}
                      type="button"
                      onClick={() => void handleMessageAction(action)}
                      className="rounded-full border border-[#ddd6ce] bg-white px-3 py-1.5 text-[11px] font-medium text-[#3d4658] transition hover:border-[#c8c0b7] hover:bg-[#faf8f5]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start gap-2">
            <AgentAvatar agentType={agentType} />
            <div className="bg-[#f0f0f0] rounded-2xl rounded-bl-sm">
              <Spinner />
            </div>
          </div>
        )}

        <div ref={endRef} />
        </div>

        <div className="border-t border-[#e8e8e8] px-3 py-3">
          <div className="flex items-center gap-2 rounded-xl bg-[#f6f6f6] px-3 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={copy.chatPlaceholder}
            disabled={loading}
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[#0d0d12] placeholder:text-[#8a8fa0] disabled:opacity-50"
          />
          <button
            onClick={() => void sendMessage(input)}
            disabled={!input.trim() || loading}
            className="rounded-lg bg-[#0d0d12] p-1.5 text-white transition-opacity hover:opacity-80 disabled:opacity-30 border-0 cursor-pointer"
            aria-label={copy.sendLabel}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
      </div>
    </>
  );
}
