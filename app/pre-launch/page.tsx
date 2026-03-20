import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import ChecklistSection from "@/components/ChecklistSection";
import ActionsSection from "@/components/ActionsSection";
import PageHeader from "@/components/PageHeader";
import LaunchReviewSummary from "@/components/LaunchReviewSummary";
import BlockerSummary from "@/components/BlockerSummary";

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

export default async function PreLaunchPage() {
  const session = await getServerSession(authOptions);

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

  const tasks = await prisma.task.findMany({
    where: { productId: product?.id, status: { not: "DONE" } },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });

  // Category scoring
  const categoryNames = {
    PRODUCT: "Product Readiness",
    MARKETING: "Marketing Readiness",
    LEGAL: "Legal Readiness",
    TECH: "Technical Readiness",
  };

  const categoryScores = Object.entries(categoryNames).map(([key, name]) => {
    const items = checklists.filter(c => c.category === key);
    const completed = items.filter(c => c.completed).length;
    const total = items.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Status: READY if 100%, BLOCKED if has HIGH priority uncompleted, else IN_PROGRESS
    const status =
      percentage === 100
        ? ("READY" as const)
        : items.some(i => i.priority === "HIGH" && !i.completed)
          ? ("BLOCKED" as const)
          : ("IN_PROGRESS" as const);

    return { name, score: percentage, status };
  });

  // Overall readiness score
  const totalItems = checklists.length;
  const completedItems = checklists.filter(item => item.completed).length;
  const overallScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  const readyToLaunch = overallScore === 100;

  // Extract blockers (HIGH priority + not completed)
  const blockers = checklists
    .filter(item => item.priority === "HIGH" && !item.completed)
    .map(item => ({
      id: item.id,
      title: item.title,
      category: item.category,
      priority: item.priority,
      linkedTaskId: item.linkedTaskId || undefined,
    }));

  const checklistsByCategory = {
    PRODUCT: checklists.filter(c => c.category === "PRODUCT"),
    MARKETING: checklists.filter(c => c.category === "MARKETING"),
    LEGAL: checklists.filter(c => c.category === "LEGAL"),
    TECH: checklists.filter(c => c.category === "TECH"),
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pre-Launch"
        title="Launch Hazırlık Skoru"
        description="Launch öncesi her şeyin hazır olduğundan emin ol."
      />

      {/* Launch Review Summary */}
      <LaunchReviewSummary
        overallScore={overallScore}
        readyToLaunch={readyToLaunch}
        categories={categoryScores}
        blockersCount={blockers.length}
      />

      {/* Category Scorecards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {categoryScores.map((cat) => (
          <div
            key={cat.name}
            className="rounded-[15px] border border-[#e8e8e8] bg-white p-4"
          >
            <p className="text-[12px] font-semibold text-[#666d80] mb-2">{cat.name}</p>
            <p className="text-[24px] font-bold text-[#0d0d12] mb-2">{cat.score}%</p>
            <div className="w-full h-1.5 bg-[#f6f6f6] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  cat.status === "READY"
                    ? "bg-[#75fc96]"
                    : cat.status === "BLOCKED"
                      ? "bg-[#ff4d4f]"
                      : "bg-[#95dbda]"
                }`}
                style={{ width: `${cat.score}%` }}
              />
            </div>
            <p className="text-[11px] font-semibold text-[#666d80] mt-2">
              {cat.status === "READY"
                ? "✓ Ready"
                : cat.status === "BLOCKED"
                  ? "⚠️ Blocked"
                  : "→ In Progress"}
            </p>
          </div>
        ))}
      </div>

      {/* Blocker Summary */}
      <BlockerSummary
        blockers={blockers}
        onCreateTask={createTaskFromChecklistItem}
      />

      {/* Checklist and Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <ChecklistSection
            checklistsByCategory={checklistsByCategory}
            productId={product?.id || ""}
            onCreateTask={createTaskFromChecklistItem}
          />
        </div>
        <div>
          <ActionsSection
            tasks={tasks}
            productId={product?.id || ""}
          />
        </div>
      </div>
    </div>
  );
}
