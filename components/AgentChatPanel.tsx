"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentType } from "@/lib/agent-types";
import UsageLimitModal from "@/components/UsageLimitModal";
export type { AgentType };

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AgentAction {
  type: "create_task";
  payload: { title: string; description?: string; priority?: string };
}

interface AgentSuggestion {
  label: string;
  intent?: "ask" | "create_task";
  payload?: { title: string; description?: string; priority?: string };
}

interface AgentApiResponse {
  message: string;
  actions: AgentAction[];
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
  const copy = getCopy(agentType, locale);
  const isEn = locale === "en";
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: copy.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AgentSuggestion[]>(copy.initialSuggestions);
  const [limitModal, setLimitModal] = useState<{
    title: string;
    description: string;
    upgradeHref: string;
  } | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const nextCopy = getCopy(agentType, locale);
    setMessages([{ id: "greeting", role: "assistant", content: nextCopy.greeting }]);
    setSuggestions(nextCopy.initialSuggestions);
    setInput("");
  }, [agentType, locale]);

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
        const history = messages
          .filter((m) => m.id !== "greeting")
          .slice(-6)
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await fetch("/api/agent/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            agentType,
            message: text,
            productId,
            locale,
            conversationHistory: history,
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
    [agentType, copy.genericError, isEn, loading, locale, messages, onTasksCreated, productId]
  );

  async function createTaskFromSuggestion(suggestion: AgentSuggestion) {
    const title = suggestion.payload?.title?.trim() || suggestion.label.trim();
    if (!title || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          title,
          description: suggestion.payload?.description ?? copy.recommendationsHint,
          priority:
            suggestion.payload?.priority === "HIGH" || suggestion.payload?.priority === "LOW"
              ? suggestion.payload.priority
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
      setSuggestions((prev) => prev.filter((item) => item.label !== suggestion.label));
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage(input);
    }
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

      <div className="flex h-full flex-col">
        <div className="border-b border-[#f0ede8] px-4 py-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {copy.panelTitle}
        </p>
        <p className="mt-1 text-[12px] leading-5 text-[#5e6678]">
          {copy.recommendationsHint}
        </p>

        {suggestions.length > 0 && !loading && (
          <div className="mt-3 space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9aa1af]">
              {copy.recommendationsTitle}
            </p>
            {suggestions.map((suggestion) => (
              <button
                key={`${suggestion.intent ?? "create_task"}-${suggestion.label}`}
                onClick={() =>
                  suggestion.intent === "ask"
                    ? void sendMessage(suggestion.label)
                    : void createTaskFromSuggestion(suggestion)
                }
                className="w-full rounded-[14px] border border-[#ece7e2] bg-[#faf8f5] px-3 py-3 text-left text-[12px] font-medium leading-5 text-[#3d4658] transition hover:border-[#d8d1ca] hover:bg-white"
              >
                {suggestion.label}
              </button>
            ))}
          </div>
        )}
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
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-[#0d0d12] text-white rounded-br-sm"
                  : "bg-[#f0f0f0] text-[#0d0d12] rounded-bl-sm"
              }`}
            >
              {msg.content}
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
