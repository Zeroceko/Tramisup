"use client";

import { useState } from "react";
import AgentChatPanel from "@/components/AgentChatPanel";
import type { AgentType } from "@/lib/agent-types";

const AGENT_COLORS: Record<AgentType, { bg: string; text: string; initials: string }> = {
  overview: { bg: "#ffeb69", text: "#0d0d12", initials: "OA" },
  launch:   { bg: "#ffd7ef", text: "#0d0d12", initials: "LA" },
  growth:   { bg: "#95dbda", text: "#0d0d12", initials: "GA" },
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
  const { bg, text, initials } = AGENT_COLORS[agentType];

  return (
    <div className="flex gap-3 h-full p-3">
      {/* ── Left: Agent chat panel ── */}
      {open ? (
        <div
          className="shrink-0 flex flex-col rounded-2xl bg-white border border-[#e8e4de] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-hidden"
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
                {AGENT_LABELS[agentType]}
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
            <AgentChatPanel agentType={agentType} productId={productId} />
          </div>
        </div>
      ) : (
        /* Collapsed: floating badge */
        <button
          onClick={() => setOpen(true)}
          className="shrink-0 w-9 h-9 mt-1 rounded-xl border border-[#e8e4de] flex items-center justify-center cursor-pointer hover:scale-105 transition-transform shadow-sm"
          title={AGENT_LABELS[agentType]}
          style={{ backgroundColor: bg }}
        >
          <img src="/assets/illus-tiramisu-slice.png" alt="" className="w-6 h-6 object-contain" />
        </button>
      )}

      {/* ── Right: Page content ── */}
      <div className="flex-1 min-w-0 overflow-y-auto rounded-2xl bg-white border border-[#e8e4de] shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
        <div className="px-7 py-7">
          {children}
        </div>
      </div>
    </div>
  );
}
