"use client";

import { useState } from "react";

type Props = {
  label: string;
  defaultCollapsed?: boolean;
  children: React.ReactNode;
};

export default function CollapsibleSection({ label, defaultCollapsed = false, children }: Props) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <div>
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        className="mb-2 flex items-center gap-2 text-[12px] font-medium text-[#8a8fa0] transition hover:text-[#0d0d12]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className={`transition-transform ${collapsed ? "" : "rotate-90"}`}
        >
          <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
      </button>
      {!collapsed && children}
    </div>
  );
}
