import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import ChecklistSection from "@/components/ChecklistSection";
import ActionsSection from "@/components/ActionsSection";
import PageHeader from "@/components/PageHeader";
import LaunchReviewSummary from "@/components/LaunchReviewSummary";
import BlockerSummary from "@/components/BlockerSummary";
import LaunchButton from "@/components/LaunchButton";

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

  const nonCriticalRemaining = Math.max(totalItems - completedItems - blockers.length, 0);
  const readyToLaunch = blockers.length === 0 && totalItems > 0;

  const checklistsByCategory = {
    PRODUCT: checklists.filter(c => c.category === "PRODUCT"),
    MARKETING: checklists.filter(c => c.category === "MARKETING"),
    LEGAL: checklists.filter(c => c.category === "LEGAL"),
    TECH: checklists.filter(c => c.category === "TECH"),
  };

  return (
    <div>
      <PageHeader
        eyebrow="Ürünün laucha ne kadar hazır?"
        title="Launch Readiness"
        titleSuffix="👋"
      />

      <LaunchReviewSummary
        overallScore={overallScore}
        readyToLaunch={readyToLaunch}
        categories={categoryScores}
        blockersCount={blockers.length}
        nonCriticalRemaining={nonCriticalRemaining}
      />

      <ChecklistSection
        checklistsByCategory={checklistsByCategory}
        productId={product?.id || ""}
        onCreateTask={createTaskFromChecklistItem}
      />

      {/* Blocker summary — only show when there are blockers */}
      {blockers.length > 0 && (
        <div className="mt-4">
          <BlockerSummary
            blockers={blockers}
            onCreateTask={createTaskFromChecklistItem}
          />
        </div>
      )}

      {/* Actions / pending tasks */}
      {tasks.length > 0 && (
        <div className="mt-4">
          <ActionsSection tasks={tasks} productId={product?.id || ""} />
        </div>
      )}

      {/* Launch button */}
      {product && product.status === "PRE_LAUNCH" && (
        <div className="mt-6 rounded-[20px] border border-[#e8e8e8] bg-white p-8 text-center">
          <p className="text-[14px] font-semibold text-[#0d0d12]">
            Ürününü yayınladın mı?
          </p>
          <p className="mt-1 text-[13px] text-[#666d80]">
            Launch&apos;ını kaydet — dashboard büyüme moduna geçer.
          </p>
          <div className="mt-4">
            <LaunchButton productId={product.id} locale={locale} />
          </div>
        </div>
      )}
    </div>
  );
}
