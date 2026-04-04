"use client";

import { useState } from "react";
import AgentChatPanel from "@/components/AgentChatPanel";
import type { AgentType } from "@/lib/agent-types";

const AGENT_COLORS: Record<AgentType, { bg: string; initials: string }> = {
  overview: { bg: "#95dbda", initials: "OA" },
  launch:   { bg: "#ffd7ef", initials: "LA" },
  growth:   { bg: "#75fc96", initials: "GA" },
};

const AGENT_LABELS: Record<AgentType, string> = {
  overview: "Overview Agent",
  launch:   "Launch Agent",
  growth:   "Growth Agent",
};

interface Props {
  agentType: AgentType;
  productId: string;
  children: React.ReactNode;
}

export default function AgentLayoutShell({ agentType, productId, children }: Props) {
  const [open, setOpen] = useState(true);
  const { bg, initials } = AGENT_COLORS[agentType];

  return (
    <div className="flex gap-3 min-h-0 flex-1">
      {/* ── Left: Agent chat panel ── */}
      {open ? (
        <div
          className="shrink-0 flex flex-col rounded-2xl bg-white border border-[#e8e8e8] shadow-[0_2px_12px_rgba(17,16,20,0.04)] overflow-hidden"
          style={{ width: 360 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 h-12 border-b border-[#e8e8e8] shrink-0">
            <div className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold"
                style={{ backgroundColor: bg, color: "#0d0d12" }}
              >
                {initials}
              </div>
              <span className="text-[13px] font-semibold text-[#0d0d12]">
                {AGENT_LABELS[agentType]}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1.5 rounded-lg hover:bg-[#f6f6f6] transition-colors border-0 bg-transparent cursor-pointer text-[#8a8fa0]"
              title="Paneli kapat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <path d="M9 3v18" />
              </svg>
            </button>
          </div>

          {/* Chat */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <AgentChatPanel agentType={agentType} productId={productId} />
          </div>
        </div>
      ) : (
        /* Collapsed: avatar badge */
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 w-10 h-10 mt-1 rounded-xl shadow-sm border border-[#e8e8e8] bg-white flex items-center justify-center cursor-pointer hover:scale-105 transition-transform"
          title={AGENT_LABELS[agentType]}
          style={{ backgroundColor: bg }}
        >
          <span className="text-[10px] font-bold text-[#0d0d12]">{initials}</span>
        </button>
      )}

      {/* ── Right: Page content ── */}
      <div className="flex-1 min-w-0 overflow-y-auto rounded-2xl bg-white border border-[#e8e8e8] shadow-[0_2px_12px_rgba(17,16,20,0.04)]">
        <div className="max-w-[900px] mx-auto px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
