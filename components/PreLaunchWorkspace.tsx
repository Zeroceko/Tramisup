"use client";

import { useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import { ProductStatus } from "@prisma/client";
import BlockerSummary from "@/components/BlockerSummary";
import ChecklistSection from "@/components/ChecklistSection";
import LaunchButton from "@/components/LaunchButton";
import LaunchGateStatus, { type ConfidenceIndicator, type GateState } from "@/components/launch/LaunchGateStatus";
import { normalizeLaunchChecklistPriority } from "@/lib/launch-checklist-priority";
import type { LaunchStageKey } from "@/lib/launch-stage";
import { computePreLaunchReadiness } from "@/lib/prelaunch-readiness";

type ChecklistItem = {
  id: string;
  title: string;
  description?: string | null;
  category: string;
  completed: boolean;
  priority: string;
  linkedTaskId: string | null;
};

export default function PreLaunchWorkspace({
  locale,
  productId,
  productStatus,
  launchStageKey,
  initialActiveChecklists,
  initialIgnoredItems,
  initialPendingTaskCount,
  onCreateTask,
  onIgnore,
  onToggleComplete,
}: {
  locale: string;
  productId: string;
  productStatus: ProductStatus;
  launchStageKey?: LaunchStageKey | null;
  initialActiveChecklists: ChecklistItem[];
  initialIgnoredItems: ChecklistItem[];
  initialPendingTaskCount: number;
  onCreateTask: (itemId: string) => Promise<{
    taskId: string;
    title: string;
    deduped: boolean;
    pendingTaskCount: number;
  }>;
  onIgnore: (itemId: string, ignored: boolean) => Promise<{ itemId: string; ignored: boolean }>;
  onToggleComplete: (itemId: string, completed: boolean) => Promise<{
    itemId: string;
    completed: boolean;
    pendingTaskCount: number;
  }>;
}) {
  const pathname = usePathname();
  const isEn = locale === "en";
  const [activeItems, setActiveItems] = useState(initialActiveChecklists);
  const [ignoredItems, setIgnoredItems] = useState(initialIgnoredItems);
  const [pendingTaskCount, setPendingTaskCount] = useState(initialPendingTaskCount);

  const checklistsByCategory = useMemo(
    () => ({
      PRODUCT: activeItems.filter((c) => c.category === "PRODUCT"),
      MARKETING: activeItems.filter((c) => c.category === "MARKETING"),
      LEGAL: activeItems.filter((c) => c.category === "LEGAL"),
      TECH: activeItems.filter((c) => c.category === "TECH"),
    }),
    [activeItems],
  );

  const blockers = useMemo(
    () =>
      activeItems
        .filter((item) => normalizeLaunchChecklistPriority(item) === "HIGH" && !item.completed)
        .map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          priority: item.priority,
          linkedTaskId: item.linkedTaskId || undefined,
        })),
    [activeItems],
  );

  const ignoredBlockers = useMemo(
    () =>
      ignoredItems
        .filter((item) => normalizeLaunchChecklistPriority(item) === "HIGH" && !item.completed)
        .map((item) => ({
          id: item.id,
          title: item.title,
          category: item.category,
          priority: item.priority,
          linkedTaskId: item.linkedTaskId || undefined,
        })),
    [ignoredItems],
  );

  const weightedScore = useMemo(() => {
    return computePreLaunchReadiness(activeItems, launchStageKey).score;
  }, [activeItems, launchStageKey]);

  const confidence = useMemo(() => {
    function getCategoryConfidence(category: string, label: string): ConfidenceIndicator {
      const items = activeItems.filter((c) => c.category === category);
      if (items.length === 0) {
        return { label, score: 100, status: "CLEAR" };
      }
      const score = computePreLaunchReadiness(items, launchStageKey).score;
      const hasBlocker = items.some(
        (item) => normalizeLaunchChecklistPriority(item) === "HIGH" && !item.completed,
      );

      return {
        label,
        score,
        status: hasBlocker ? "BLOCKED" : score === 100 ? "CLEAR" : "PARTIAL",
      };
    }

    return [
      getCategoryConfidence("PRODUCT", isEn ? "Product" : "Ürün"),
      getCategoryConfidence("TECH", isEn ? "Technical" : "Teknik"),
      getCategoryConfidence("LEGAL", isEn ? "Legal" : "Legal"),
      getCategoryConfidence("MARKETING", isEn ? "Marketing" : "Pazarlama"),
    ];
  }, [activeItems, isEn, launchStageKey]);

  const totalItems = activeItems.length;
  const completedItems = activeItems.filter((item) => item.completed).length;
  const nonCriticalRemaining = activeItems.filter(
    (item) => !item.completed && normalizeLaunchChecklistPriority(item) !== "HIGH",
  ).length;

  const gateState: GateState =
    blockers.length > 0
      ? "HARD_BLOCKED"
      : ignoredBlockers.length > 0 || nonCriticalRemaining > 0
        ? "WARNING"
        : "CLEAR";

  if (!pathname?.includes("/pre-launch")) {
    return null;
  }

  async function handleCreateTask(itemId: string) {
    const result = await onCreateTask(itemId);
    setPendingTaskCount(result.pendingTaskCount);
    setActiveItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, linkedTaskId: result.taskId } : item,
      ),
    );
    setIgnoredItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, linkedTaskId: result.taskId } : item,
      ),
    );
    return result;
  }

  async function handleToggleComplete(itemId: string, completed: boolean) {
    const result = await onToggleComplete(itemId, completed);
    setPendingTaskCount(result.pendingTaskCount);
    setActiveItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, completed: result.completed }
          : item,
      ),
    );
    window.dispatchEvent(new CustomEvent("tiramisup:checklist-updated"));
    return undefined;
  }

  async function handleIgnore(itemId: string, ignored: boolean) {
    const result = await onIgnore(itemId, ignored);
    if (result.ignored) {
      setActiveItems((prev) => {
        const item = prev.find((entry) => entry.id === itemId);
        if (!item) return prev;
        setIgnoredItems((ignoredPrev) => [...ignoredPrev, item]);
        return prev.filter((entry) => entry.id !== itemId);
      });
      return;
    }

    setIgnoredItems((prev) => {
      const item = prev.find((entry) => entry.id === itemId);
      if (!item) return prev;
      setActiveItems((activePrev) => [...activePrev, item]);
      return prev.filter((entry) => entry.id !== itemId);
    });
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-[13px] font-medium text-[#6f7482]">
          {isEn ? "How ready is your product?" : "Ürünün ne kadar hazır?"}
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          Launch Readiness
        </h1>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#737988]">
            {isEn ? "Readiness" : "Hazırlık"}
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
            %{weightedScore}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[#e8e8e8]">
            <div className="h-1.5 rounded-full bg-[#95dbda] transition-all" style={{ width: `${weightedScore}%` }} />
          </div>
          <p className="mt-2 text-[11px] text-[#98a0ae]">
            {isEn
              ? "Includes completed items, active task coverage, and current stage."
              : "Tamamlanan maddeleri, aktif görev kapsamını ve mevcut stage'i içerir."}
          </p>
        </div>

        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#737988]">
            {isEn ? "Completed" : "Tamamlanan"}
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] text-[#065f46]">
            {completedItems}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-[#34d399]" />
            <p className="text-[11px] text-[#98a0ae]">/ {totalItems} {isEn ? "items" : "madde"}</p>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#737988]">
            {isEn ? "Blockers" : "Blokajlar"}
          </p>
          <p className={`mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] ${blockers.length > 0 ? "text-[#991b1b]" : "text-[#065f46]"}`}>
            {blockers.length}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-1 w-6 rounded-full ${blockers.length > 0 ? "bg-[#f87171]" : "bg-[#34d399]"}`} />
            <p className="text-[11px] text-[#98a0ae]">
              {blockers.length > 0 ? (isEn ? "need resolution" : "çözülmeli") : (isEn ? "all clear" : "sorun yok")}
            </p>
          </div>
        </div>

        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[#737988]">
            {isEn ? "Pending Tasks" : "Bekleyen Görev"}
          </p>
          <p className="mt-2 text-[32px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
            {pendingTaskCount}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-[#fbbf24]" />
            <p className="text-[11px] text-[#98a0ae]">{isEn ? "open tasks" : "açık görev"}</p>
          </div>
        </div>
      </div>

      <LaunchGateStatus
        gateState={gateState}
        weightedScore={weightedScore}
        activeBlockerCount={blockers.length}
        ignoredBlockerCount={ignoredBlockers.length}
        nonCriticalRemaining={nonCriticalRemaining}
        confidence={confidence}
        locale={locale}
      />

      {(blockers.length > 0 || ignoredBlockers.length > 0) && (
        <BlockerSummary
          blockers={blockers}
          ignoredBlockers={ignoredBlockers}
          onCreateTask={handleCreateTask}
          onToggleComplete={handleToggleComplete}
          onIgnore={handleIgnore}
          locale={locale}
        />
      )}

      <ChecklistSection
        checklistsByCategory={checklistsByCategory}
        productId={productId}
        onCreateTask={handleCreateTask}
        onToggleComplete={handleToggleComplete}
        onIgnore={handleIgnore}
        ignoredItems={ignoredItems}
        locale={locale}
      />

      {productStatus === ProductStatus.PRE_LAUNCH && (
        <div className="rounded-[18px] border border-[#e8e4de] bg-white p-6 text-center">
          <p className="text-[14px] font-semibold text-[#0d0d12]">
            {isEn ? "Ready to go live?" : "Ürününü yayınladın mı?"}
          </p>
          <p className="mt-1 text-[13px] text-[#666d80]">
            {isEn
              ? "Mark as launched — your dashboard shifts to growth mode."
              : "Launch'ını kaydet — dashboard büyüme moduna geçer."}
          </p>
          <div className="mt-4">
            <LaunchButton
              productId={productId}
              locale={locale}
              gateOpen={gateState !== "HARD_BLOCKED"}
              ignoredBlockers={ignoredBlockers}
              nonCriticalRemaining={nonCriticalRemaining}
            />
          </div>
        </div>
      )}
    </div>
  );
}
