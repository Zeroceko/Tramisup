"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { notifyTasksUpdated } from "@/lib/browser-events";

type Blocker = {
  id: string;
  title: string;
  /** Where this blocker lives — used for the link */
  href: string;
  /** Optional linked task for one-click completion */
  taskId?: string;
  /** Source label: "Launch checklist", "Entegrasyon", etc. */
  source: string;
};

type BlockerAlertProps = {
  blockers: Blocker[];
  locale: string;
  productId: string;
};

export default function BlockerAlert({ blockers, locale, productId }: BlockerAlertProps) {
  const storageKey = `blocker_dismissed_${productId}`;
  const [dismissed, setDismissed] = useState(false);
  const [completingId, setCompletingId] = useState<string | null>(null);
  const [blockerItems, setBlockerItems] = useState(blockers);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(storageKey) === "1");
  }, [storageKey]);

  useEffect(() => {
    setBlockerItems(blockers);
  }, [blockers]);

  if (blockerItems.length === 0 || dismissed) return null;

  function dismiss() {
    sessionStorage.setItem(storageKey, "1");
    setDismissed(true);
  }

  async function completeTask(taskId: string) {
    setCompletingId(taskId);
    try {
      await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "DONE" }),
      });
      setBlockerItems((current) =>
        current.filter((blocker) => blocker.taskId !== taskId)
      );
      notifyTasksUpdated();
    } finally {
      setCompletingId(null);
    }
  }

  const countLabel =
    locale === "en"
      ? `${blockerItems.length} blocker${blockerItems.length > 1 ? "s" : ""} need${blockerItems.length === 1 ? "s" : ""} attention`
      : `${blockerItems.length} kritik blokaj dikkatini bekliyor`;

  return (
    <div className="rounded-[26px] border border-[#f6df9c] bg-[#fff9e8] px-5 py-4 shadow-[0_10px_28px_rgba(23,20,31,0.05)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="shrink-0 text-[#f59e0b]"
          >
            <path
              d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-[13px] font-semibold text-[#92400e]">
            {countLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="flex h-6 w-6 items-center justify-center rounded-full text-[#b0934a] transition hover:bg-[#fef3c7] hover:text-[#92400e]"
          aria-label={locale === "en" ? "Dismiss" : "Gizle"}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Blocker list */}
      <ul className="mt-3 space-y-2">
        {blockerItems.map((b) => (
          <li key={b.id}>
            <div className="group flex items-start gap-2.5 rounded-[10px] px-3 py-2 transition hover:bg-[#fef3c7]/50">
              {b.taskId ? (
                <button
                  type="button"
                  onClick={() => completeTask(b.taskId!)}
                  disabled={completingId === b.taskId}
                  className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#f59e0b]/40 bg-white text-[#f59e0b] transition hover:bg-[#fef3c7] disabled:opacity-60"
                  aria-label={locale === "en" ? "Mark done" : "Tamamlandı işaretle"}
                >
                  {completingId === b.taskId ? (
                    <span className="h-2 w-2 animate-pulse rounded-full bg-[#f59e0b]" />
                  ) : (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ) : (
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#f59e0b]" />
              )}
              <div className="min-w-0 flex-1">
                <Link href={b.href} className="block">
                  <p className="text-[13px] font-medium text-[#0d0d12] group-hover:text-[#92400e] transition">
                    {b.title}
                  </p>
                </Link>
                <p className="text-[11px] text-[#94a3b8]">
                  {b.source}
                  {b.taskId
                    ? locale === "en"
                      ? " · Direct task"
                      : " · Direkt görev"
                    : ""}
                </p>
              </div>
              <Link href={b.href} className="mt-0.5 shrink-0 opacity-0 transition group-hover:opacity-100">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#b0b8c8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
