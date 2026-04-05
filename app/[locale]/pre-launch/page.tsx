import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { getActiveProductId } from "@/lib/activeProduct";
import ChecklistSection from "@/components/ChecklistSection";
import BlockerSummary from "@/components/BlockerSummary";
import LaunchButton from "@/components/LaunchButton";
import LaunchGateStatus, { GateState, ConfidenceIndicator } from "@/components/launch/LaunchGateStatus";
import { updateIgnoredChecklistIds } from "@/lib/metric-setup";
import { prisma as prismaClient } from "@/lib/prisma";

// Server action: Create task from checklist item
async function createTaskFromChecklistItem(itemId: string) {
  "use server";

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const checklistItem = await prisma.launchChecklist.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!checklistItem || checklistItem.product.userId !== session.user.id) {
      throw new Error("Item not found or unauthorized");
    }

    // Create task
    const task = await prisma.task.create({
      data: {
        productId: checklistItem.productId,
        title: checklistItem.title,
        description: `From launch checklist: ${checklistItem.title}`,
        priority: checklistItem.priority,
        status: "TODO",
      },
    });

    // Link checklist to task
    await prisma.launchChecklist.update({
      where: { id: itemId },
      data: { linkedTaskId: task.id },
    });

    revalidatePath("/pre-launch");
    revalidatePath("/tasks");
  } catch (error) {
    console.error("Error creating task from checklist item:", error);
    throw error;
  }
}

async function setChecklistItemIgnored(itemId: string, ignored: boolean) {
  "use server";

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      throw new Error("Unauthorized");
    }

    const checklistItem = await prisma.launchChecklist.findUnique({
      where: { id: itemId },
      include: { product: true },
    });

    if (!checklistItem || checklistItem.product.userId !== session.user.id) {
      throw new Error("Item not found or unauthorized");
    }

    const setup = await prismaClient.metricSetup.findUnique({
      where: { productId: checklistItem.productId },
    });
    const ignoredIds = new Set<string>(setup?.ignoredChecklistIds ?? []);

    if (ignored) {
      ignoredIds.add(itemId);
    } else {
      ignoredIds.delete(itemId);
    }

    await updateIgnoredChecklistIds(checklistItem.productId, Array.from(ignoredIds));

    revalidatePath("/pre-launch");
  } catch (error) {
    console.error("Error updating ignored checklist item:", error);
    throw error;
  }
}

// Weight map: HIGH=3, MEDIUM=2, LOW=1
function getWeight(priority: string): number {
  if (priority === "HIGH") return 3;
  if (priority === "MEDIUM") return 2;
  return 1;
}

export default async function PreLaunchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  const checklists = await prisma.launchChecklist.findMany({
    where: { productId: product?.id },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const metricSetup = product
    ? await prismaClient.metricSetup.findUnique({ where: { productId: product.id } })
    : null;
  const ignoredChecklistIds = new Set<string>(metricSetup?.ignoredChecklistIds ?? []);
  const activeChecklists = checklists.filter((item) => !ignoredChecklistIds.has(item.id));
  const ignoredChecklistItems = checklists.filter((item) => ignoredChecklistIds.has(item.id));

  const tasks = await prisma.task.findMany({
    where: { productId: product?.id, status: { not: "DONE" } },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });

  // --- Weighted score ---
  const totalWeight = activeChecklists.reduce((sum, item) => sum + getWeight(item.priority), 0);
  const completedWeight = activeChecklists
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + getWeight(item.priority), 0);
  const weightedScore = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;

  // --- Blockers ---
  const blockers = activeChecklists
    .filter((item) => item.priority === "HIGH" && !item.completed)
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      linkedTaskId: item.linkedTaskId || undefined,
    }));

  const ignoredBlockers = ignoredChecklistItems
    .filter((item) => item.priority === "HIGH" && !item.completed)
    .map((item) => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      linkedTaskId: item.linkedTaskId || undefined,
    }));

  // Non-critical remaining = incomplete items that are not HIGH priority blockers
  const nonCriticalRemaining = activeChecklists.filter(
    (item) => !item.completed && item.priority !== "HIGH"
  ).length;

  // --- Gate state ---
  let gateState: GateState;
  if (blockers.length > 0) {
    gateState = "HARD_BLOCKED";
  } else if (ignoredBlockers.length > 0 || nonCriticalRemaining > 0) {
    gateState = "WARNING";
  } else {
    gateState = "CLEAR";
  }

  // --- Confidence indicators ---
  // Compute per-category weighted score and status
  function getCategoryConfidence(
    category: string,
    label: string
  ): ConfidenceIndicator {
    const items = activeChecklists.filter((c) => c.category === category);
    if (items.length === 0) {
      return { label, score: 100, status: "CLEAR" };
    }
    const catTotal = items.reduce((s, i) => s + getWeight(i.priority), 0);
    const catDone = items
      .filter((i) => i.completed)
      .reduce((s, i) => s + getWeight(i.priority), 0);
    const score = catTotal > 0 ? Math.round((catDone / catTotal) * 100) : 0;
    const hasBlocker = items.some((i) => i.priority === "HIGH" && !i.completed);
    const status = hasBlocker ? "BLOCKED" : score === 100 ? "CLEAR" : "PARTIAL";
    return { label, score, status };
  }

  const isEn = locale === "en";
  const confidence: ConfidenceIndicator[] = [
    getCategoryConfidence("PRODUCT", isEn ? "Product" : "Ürün"),
    getCategoryConfidence("TECH", isEn ? "Technical" : "Teknik"),
    getCategoryConfidence("LEGAL", isEn ? "Legal" : "Legal"),
    getCategoryConfidence("MARKETING", isEn ? "Marketing" : "Pazarlama"),
  ];

  // --- Checklist by category ---
  const checklistsByCategory = {
    PRODUCT: activeChecklists.filter((c) => c.category === "PRODUCT"),
    MARKETING: activeChecklists.filter((c) => c.category === "MARKETING"),
    LEGAL: activeChecklists.filter((c) => c.category === "LEGAL"),
    TECH: activeChecklists.filter((c) => c.category === "TECH"),
  };

  // Category progress for stat cards
  const catProgress = (["PRODUCT", "TECH", "LEGAL", "MARKETING"] as const).map((cat) => {
    const items = activeChecklists.filter((c) => c.category === cat);
    const done = items.filter((i) => i.completed).length;
    return { cat, done, total: items.length };
  }).filter((c) => c.total > 0);

  const totalItems = activeChecklists.length;
  const completedItems = activeChecklists.filter((i) => i.completed).length;

  return (
    <div className="space-y-4">
      {/* 1. Compact header */}
      <div>
        <p className="text-[13px] font-medium text-[#6f7482]">
          {isEn ? "How ready is your product?" : "Ürünün ne kadar hazır?"}
        </p>
        <h1 className="mt-1 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          Launch Readiness
        </h1>
      </div>

      {/* 2. Stat cards — prominent numbers */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium text-[#737988] uppercase tracking-[0.08em]">
            {isEn ? "Readiness" : "Hazırlık"}
          </p>
          <p className="mt-2 text-[32px] font-bold tracking-[-0.03em] leading-none text-[#0d0d12]">
            %{weightedScore}
          </p>
          <div className="mt-2 h-1.5 rounded-full bg-[#e8e8e8]">
            <div
              className="h-1.5 rounded-full bg-[#95dbda] transition-all"
              style={{ width: `${weightedScore}%` }}
            />
          </div>
        </div>
        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium text-[#737988] uppercase tracking-[0.08em]">
            {isEn ? "Completed" : "Tamamlanan"}
          </p>
          <p className="mt-2 text-[32px] font-bold tracking-[-0.03em] leading-none text-[#065f46]">
            {completedItems}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-[#34d399]" />
            <p className="text-[11px] text-[#98a0ae]">/ {totalItems} {isEn ? "items" : "madde"}</p>
          </div>
        </div>
        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium text-[#737988] uppercase tracking-[0.08em]">
            {isEn ? "Blockers" : "Blokajlar"}
          </p>
          <p className={`mt-2 text-[32px] font-bold tracking-[-0.03em] leading-none ${blockers.length > 0 ? "text-[#991b1b]" : "text-[#065f46]"}`}>
            {blockers.length}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`h-1 w-6 rounded-full ${blockers.length > 0 ? "bg-[#f87171]" : "bg-[#34d399]"}`} />
            <p className="text-[11px] text-[#98a0ae]">{blockers.length > 0 ? (isEn ? "need resolution" : "çözülmeli") : (isEn ? "all clear" : "sorun yok")}</p>
          </div>
        </div>
        <div className="rounded-[18px] border border-[#e8e4de] bg-white px-4 py-4">
          <p className="text-[11px] font-medium text-[#737988] uppercase tracking-[0.08em]">
            {isEn ? "Pending Tasks" : "Bekleyen Görev"}
          </p>
          <p className="mt-2 text-[32px] font-bold tracking-[-0.03em] leading-none text-[#0d0d12]">
            {tasks.length}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1 w-6 rounded-full bg-[#fbbf24]" />
            <p className="text-[11px] text-[#98a0ae]">{isEn ? "open tasks" : "açık görev"}</p>
          </div>
        </div>
      </div>

      {/* 3. Gate status — compact */}
      <LaunchGateStatus
        gateState={gateState}
        weightedScore={weightedScore}
        activeBlockerCount={blockers.length}
        ignoredBlockerCount={ignoredBlockers.length}
        nonCriticalRemaining={nonCriticalRemaining}
        confidence={confidence}
        locale={locale}
      />

      {/* 4. Blockers — only shown when there are active or ignored blockers */}
      {(blockers.length > 0 || ignoredBlockers.length > 0) && (
        <BlockerSummary
          blockers={blockers}
          ignoredBlockers={ignoredBlockers}
          onCreateTask={createTaskFromChecklistItem}
          onIgnore={setChecklistItemIgnored}
          locale={locale}
        />
      )}

      {/* 5. Checklist by category */}
      <ChecklistSection
        checklistsByCategory={checklistsByCategory}
        productId={product?.id || ""}
        onCreateTask={createTaskFromChecklistItem}
        ignoredItems={ignoredChecklistItems}
        locale={locale}
      />

      {/* 6. Launch button — only for PRE_LAUNCH products */}
      {product && product.status === ProductStatus.PRE_LAUNCH && (
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
              productId={product.id}
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
