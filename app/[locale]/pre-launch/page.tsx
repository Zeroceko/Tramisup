import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { getActiveProductId } from "@/lib/activeProduct";
import PreLaunchWorkspace from "@/components/PreLaunchWorkspace";
import { updateIgnoredChecklistIds } from "@/lib/metric-setup";
import { prisma as prismaClient } from "@/lib/prisma";
import {
  normalizeLaunchChecklistPriority,
  normalizeStoredLaunchChecklistPriorities,
} from "@/lib/launch-checklist-priority";
import { createTaskWithGuards } from "@/lib/task-create";
import { parseStructuredDescription } from "@/lib/task-parsing";
import { normalizeLaunchStageKey } from "@/lib/launch-stage";
import { emitTaskLifecycleEvent } from "@/lib/task-events";
import { buildTaskStatusTransition } from "@/lib/task-status-transition";

// Server action: Create task from checklist item
async function createTaskFromChecklistItem(locale: string, itemId: string) {
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

    const structured = parseStructuredDescription(checklistItem.description);
    const result = await prisma.$transaction(async (tx) => {
      const hasStructuredChecklistFields = Boolean(
        structured.why || structured.doneCriteria || structured.nextAction,
      );
      const taskResult = await createTaskWithGuards(
        {
          productId: checklistItem.productId,
          title: checklistItem.title,
          description: hasStructuredChecklistFields
            ? structured.leftover ?? null
            : checklistItem.description ?? checklistItem.title,
          whyItMatters: structured.why ?? undefined,
          doneCriteria: structured.doneCriteria ?? undefined,
          nextAction: structured.nextAction ?? undefined,
          priority: normalizeLaunchChecklistPriority(checklistItem),
          category: checklistItem.category,
          source: "CHECKLIST",
          locale: locale === "tr" ? "tr" : "en",
        },
        tx,
      );

      if (!checklistItem.linkedTaskId || checklistItem.linkedTaskId !== taskResult.task.id) {
        await tx.launchChecklist.update({
          where: { id: itemId },
          data: { linkedTaskId: taskResult.task.id },
        });
      }

      const pendingTaskCount = await tx.task.count({
        where: {
          productId: checklistItem.productId,
          status: { not: "DONE" },
        },
      });

      return { ...taskResult, pendingTaskCount };
    });

    revalidatePath(`/${locale}/pre-launch`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/dashboard`);
    return {
      taskId: result.task.id,
      title: result.task.title,
      deduped: result.deduped,
      pendingTaskCount: result.pendingTaskCount,
    };
  } catch (error) {
    console.error("Error creating task from checklist item:", error);
    throw error;
  }
}

async function setChecklistItemIgnored(locale: string, itemId: string, ignored: boolean) {
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

    revalidatePath(`/${locale}/pre-launch`);
    revalidatePath(`/${locale}/dashboard`);
    return { itemId, ignored };
  } catch (error) {
    console.error("Error updating ignored checklist item:", error);
    throw error;
  }
}

async function setChecklistItemCompleted(locale: string, itemId: string, completed: boolean) {
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

    const result = await prisma.$transaction(async (tx) => {
      await tx.launchChecklist.update({
        where: { id: itemId },
        data: {
          completed,
          completedAt: completed ? new Date() : null,
        },
      });

      if (checklistItem.linkedTaskId) {
        const linkedTask = await tx.task.findUnique({
          where: { id: checklistItem.linkedTaskId },
          select: {
            id: true,
            productId: true,
            status: true,
            startedAt: true,
            completedAt: true,
          },
        });

        if (linkedTask) {
          const transition = buildTaskStatusTransition(
            linkedTask,
            completed ? "DONE" : "TODO",
          );
          await tx.task.update({
            where: { id: checklistItem.linkedTaskId },
            data: transition.data,
          });

          if (transition.eventType) {
            await emitTaskLifecycleEvent({
              taskId: linkedTask.id,
              productId: linkedTask.productId,
              eventType: transition.eventType,
              metadata: { source: "CHECKLIST_SURFACE" },
            });
          }
        }
      }

      const pendingTaskCount = await tx.task.count({
        where: {
          productId: checklistItem.productId,
          status: { not: "DONE" },
        },
      });

      return { itemId, completed, pendingTaskCount };
    });

    revalidatePath(`/${locale}/pre-launch`);
    revalidatePath(`/${locale}/tasks`);
    revalidatePath(`/${locale}/dashboard`);
    return result;
  } catch (error) {
    console.error("Error updating checklist completion:", error);
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

  if (product?.id) {
    await normalizeStoredLaunchChecklistPriorities(product.id);
  }

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

  const createChecklistTask = createTaskFromChecklistItem.bind(null, locale);
  const toggleChecklistComplete = setChecklistItemCompleted.bind(null, locale);

  return (
    <PreLaunchWorkspace
      locale={locale}
      productId={product?.id || ""}
      productStatus={product?.status ?? ProductStatus.PRE_LAUNCH}
      launchStageKey={normalizeLaunchStageKey(product?.launchStatus) ?? "PREPARING"}
      initialActiveChecklists={activeChecklists.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        completed: item.completed,
        priority: item.priority,
        linkedTaskId: item.linkedTaskId,
      }))}
      initialIgnoredItems={ignoredChecklistItems.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category,
        completed: item.completed,
        priority: item.priority,
        linkedTaskId: item.linkedTaskId,
      }))}
      initialPendingTaskCount={tasks.length}
      onCreateTask={createChecklistTask}
      onToggleComplete={toggleChecklistComplete}
      onIgnore={setChecklistItemIgnored.bind(null, locale)}
    />
  );
}
