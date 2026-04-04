"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { AgentType } from "@/lib/agent-types";
export type { AgentType };

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AgentAction {
  type: "create_task";
  payload: { title: string; description?: string; priority?: string };
}

interface AgentApiResponse {
  message: string;
  actions: AgentAction[];
  executedActions: string[];
  suggestions: string[];
}

// ─── Config ───────────────────────────────────────────────────────────────────

const AGENT_CONFIG: Record<
  AgentType,
  { label: string; greeting: string; suggestions: string[] }
> = {
  overview: {
    label: "Overview Agent",
    greeting:
      "Ürününün genel durumuna bakıyorum. Soru sor veya aksiyon al.",
    suggestions: [
      "Genel durumu özetle",
      "Öncelikli aksiyonlar neler?",
      "Bu hafta ne yapmalıyım?",
    ],
  },
  launch: {
    label: "Launch Agent",
    greeting:
      "Launch Agent hazır. Checklist'ini inceleyeyim — hangi konuda yardım istiyorsun?",
    suggestions: [
      "Launch için öncelikli adımlar",
      "ASO nasıl yapılır?",
      "Privacy policy şablonu ver",
      "Bu maddeyi task olarak ekle",
    ],
  },
  growth: {
    label: "Growth Agent",
    greeting:
      "Growth Agent aktif. Metriklerini ve büyüme stratejini konuşalım.",
    suggestions: [
      "Metriklerimi analiz et",
      "Retention nasıl artırılır?",
      "Acquisition kanalları öner",
      "A/B test stratejisi",
    ],
  },
};

// ─── Agent Avatar SVG ────────────────────────────────────────────────────────

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

// ─── Spinner ──────────────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

interface AgentChatPanelProps {
  agentType: AgentType;
  productId: string;
  /** Called when agent creates tasks, so parent can refresh task list */
  onTasksCreated?: (titles: string[]) => void;
}

export default function AgentChatPanel({
  agentType,
  productId,
  onTasksCreated,
}: AgentChatPanelProps) {
  const config = AGENT_CONFIG[agentType];
  const [messages, setMessages] = useState<Message[]>([
    { id: "greeting", role: "assistant", content: config.greeting },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>(config.suggestions);
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Reset when agent type changes
  useEffect(() => {
    const cfg = AGENT_CONFIG[agentType];
    setMessages([{ id: "greeting", role: "assistant", content: cfg.greeting }]);
    setSuggestions(cfg.suggestions);
    setInput("");
  }, [agentType]);

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
      setSuggestions([]);
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
            conversationHistory: history,
          }),
        });

        const data: AgentApiResponse = await res.json();

        const assistantMsg: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.message,
        };
        setMessages((prev) => [...prev, assistantMsg]);

        if (data.suggestions?.length > 0) {
          setSuggestions(data.suggestions.slice(0, 4));
        }

        // Notify parent if tasks were created
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
            content: "Bir sorun oluştu, tekrar dener misin?",
          },
        ]);
      } finally {
        setLoading(false);
        inputRef.current?.focus();
      }
    },
    [agentType, productId, messages, loading, onTasksCreated]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} gap-2`}
          >
            {msg.role === "assistant" && (
              <AgentAvatar agentType={agentType} />
            )}
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

      {/* Suggestions */}
      {suggestions.length > 0 && !loading && (
        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => sendMessage(s)}
              className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f0f0f0] text-[#5e6678] hover:bg-[#e8e8e8] transition-colors border-0 cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="px-3 py-3 border-t border-[#e8e8e8]">
        <div className="flex items-center gap-2 bg-[#f6f6f6] rounded-xl px-3 py-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir şey sor..."
            disabled={loading}
            className="flex-1 bg-transparent border-0 outline-none text-[13px] text-[#0d0d12] placeholder:text-[#8a8fa0] disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="p-1.5 rounded-lg bg-[#0d0d12] text-white disabled:opacity-30 hover:opacity-80 transition-opacity border-0 cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
