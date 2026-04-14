"use client";

import dynamic from "next/dynamic";
import { useState, useCallback, useEffect } from "react";
import type { AgentType } from "@/lib/agent-types";
import { notifyTasksUpdated } from "@/lib/browser-events";

const LazyAgentChatPanel = dynamic(() => import("@/components/AgentChatPanel"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full min-h-0 flex-col gap-3 p-4">
      <div className="h-4 w-28 animate-pulse rounded bg-[#ece7df]" />
      <div className="h-24 animate-pulse rounded-[18px] bg-[#f6f3ee]" />
      <div className="h-24 animate-pulse rounded-[18px] bg-[#f6f3ee]" />
      <div className="mt-auto h-10 animate-pulse rounded-[14px] bg-[#f1ede6]" />
    </div>
  ),
});

const AGENT_COLORS: Record<AgentType, { bg: string; text: string; initials: string }> = {
  overview: { bg: "#ffeb69", text: "#0d0d12", initials: "OA" },
  launch:   { bg: "#ffd7ef", text: "#0d0d12", initials: "LA" },
  growth:   { bg: "#95dbda", text: "#0d0d12", initials: "GA" },
};

interface Props {
  agentType: AgentType;
  productId: string;
  locale: string;
  children: React.ReactNode;
}

function getAgentLabel(agentType: AgentType, locale: string) {
  const isEn = locale === "en";
  if (agentType === "growth") return isEn ? "Growth Recommendations" : "Growth Önerileri";
  if (agentType === "launch") return isEn ? "Launch Recommendations" : "Launch Önerileri";
  return isEn ? "Tiramisup Recommendations" : "Tiramisup Önerileri";
}

export default function AgentLayoutShell({ agentType, productId, locale, children }: Props) {
  const storageKey = `tiramisup:agent-panel:${agentType}:${productId}`;
  const [open, setOpen] = useState(false);
  const { bg } = AGENT_COLORS[agentType];
  const label = getAgentLabel(agentType, locale);
  const handleTasksCreated = useCallback((_titles: string[]) => {
    notifyTasksUpdated();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setOpen(window.sessionStorage.getItem(storageKey) === "open");
  }, [storageKey]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (open) {
      window.sessionStorage.setItem(storageKey, "open");
      return;
    }
    window.sessionStorage.removeItem(storageKey);
  }, [open, storageKey]);

  return (
    <div className="flex h-full min-h-0 w-full overflow-hidden gap-3 p-3">
      {/* ── Left: Agent chat panel ── */}
      {open ? (
        <div
          className="flex h-full min-h-0 shrink-0 flex-col overflow-hidden rounded-2xl border border-[#e8e4de] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]"
          style={{ width: 360 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-11 border-b border-[#f0ede8] shrink-0">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: bg }}
              >
                <img
                  src="/assets/illus-tiramisu-slice.png"
                  alt=""
                  className="w-5 h-5 object-contain"
                />
              </div>
              <span className="text-[13px] font-semibold text-[#0d0d12]">
                {label}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#f5f2ec] transition-colors border-0 bg-transparent cursor-pointer text-[#8a8fa0]"
              title="Close panel"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10" />
                <path d="M9 3v18" />
                <path d="m16 8 4 4-4 4" />
              </svg>
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <LazyAgentChatPanel
              agentType={agentType}
              productId={productId}
              locale={locale}
              onTasksCreated={handleTasksCreated}
            />
          </div>
        </div>
      ) : (
        /* Collapsed: floating badge */
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 w-9 h-9 mt-1 rounded-xl border border-[#e8e4de] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          title={label}
          style={{ backgroundColor: bg }}
        >
          <img src="/assets/illus-tiramisu-slice.png" alt="" className="w-6 h-6 object-contain" />
        </button>
      )}

      {/* ── Right: Page content ── */}
      <div className="flex h-full min-h-0 min-w-0 flex-1 overflow-y-auto rounded-2xl border border-[#e8e4de] bg-white shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="px-7 py-7 mx-auto max-w-[1080px]">
          {children}
        </div>
      </div>
    </div>
  );
}
