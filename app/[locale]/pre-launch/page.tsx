import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { getActiveProductId } from "@/lib/activeProduct";
import ChecklistSection from "@/components/ChecklistSection";
import ActionsSection from "@/components/ActionsSection";
import PageHeader from "@/components/PageHeader";
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

  return (
    <div className="space-y-4">
      <PageHeader
        eyebrow={isEn ? "How ready is your product for launch?" : "Ürünün laucha ne kadar hazır?"}
        title="Launch Readiness"
      />

      {/* Gate status hero */}
      <LaunchGateStatus
        gateState={gateState}
        weightedScore={weightedScore}
        activeBlockerCount={blockers.length}
        ignoredBlockerCount={ignoredBlockers.length}
        nonCriticalRemaining={nonCriticalRemaining}
        confidence={confidence}
        locale={locale}
      />

      {/* Blockers — only shown when there are active or ignored blockers */}
      {(blockers.length > 0 || ignoredBlockers.length > 0) && (
        <BlockerSummary
          blockers={blockers}
          ignoredBlockers={ignoredBlockers}
          onCreateTask={createTaskFromChecklistItem}
          onIgnore={setChecklistItemIgnored}
          locale={locale}
        />
      )}

      {/* Checklist by category */}
      <ChecklistSection
        checklistsByCategory={checklistsByCategory}
        productId={product?.id || ""}
        onCreateTask={createTaskFromChecklistItem}
        ignoredItems={ignoredChecklistItems}
        locale={locale}
      />

      {/* Pending tasks linked to this product */}
      {tasks.length > 0 && (
        <ActionsSection tasks={tasks} productId={product?.id || ""} />
      )}

      {/* Launch button — only for PRE_LAUNCH products */}
      {product && product.status === ProductStatus.PRE_LAUNCH && (
        <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-8 text-center">
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
