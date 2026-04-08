import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkLimit } from "@/lib/plan-limits";
import { createTaskWithGuards, TaskCreationError } from "@/lib/task-create";

type CreateTaskInput = {
  productId: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: "LOW" | "MEDIUM" | "HIGH";
  category: string | null;
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as
      | { tasks?: unknown[] }
      | Record<string, unknown>
      | null;
    const items: unknown[] = Array.isArray(body?.tasks)
      ? body.tasks
      : body
        ? [body]
        : [];

    if (items.length === 0) {
      return NextResponse.json({ error: "No tasks provided" }, { status: 400 });
    }

    const normalizedItems = items
      .map((rawItem) => {
        const item = (rawItem ?? {}) as Record<string, unknown>;
        const description =
          item?.description == null ? null : String(item.description).trim();
        const rawCategory = item?.category == null ? null : String(item.category).trim().toUpperCase();

        return {
          productId: String(item?.productId ?? "").trim(),
          title: String(item?.title ?? "").trim(),
          description: description || null,
          dueDate: item?.dueDate == null ? null : String(item.dueDate),
          priority:
            item?.priority === "LOW" || item?.priority === "HIGH"
              ? item.priority
              : "MEDIUM",
          category: rawCategory || null,
        };
      })
      .filter((item): item is CreateTaskInput => Boolean(item.productId && item.title));

    if (normalizedItems.length === 0) {
      return NextResponse.json({ error: "Valid tasks are required" }, { status: 400 });
    }

    const taskLimit = await checkLimit(session.user.id, "tasks", normalizedItems.length);
    if (!taskLimit.allowed) {
      return NextResponse.json(
        {
          error: `Task limit reached (${taskLimit.used}/${taskLimit.limit}). Upgrade to add more tasks.`,
          code: "TASK_LIMIT_REACHED",
          resource: "tasks",
          used: taskLimit.used,
          limit: taskLimit.limit,
        },
        { status: 403 }
      );
    }

    const productIds: string[] = Array.from(
      new Set(normalizedItems.map((item: CreateTaskInput) => item.productId))
    );
    const ownedProducts = await prisma.product.findMany({
      where: {
        userId: session.user.id,
        id: { in: productIds },
      },
      select: { id: true },
    });
    const ownedProductIds = new Set(ownedProducts.map((product) => product.id));

    if (ownedProductIds.size !== productIds.length) {
      return NextResponse.json({ error: "Unauthorized product access" }, { status: 403 });
    }

    // Manual user-typed tasks go through createTaskWithGuards with skipValidation:
    // we still want dedupe + instrumentation, but the founder can legitimately
    // type a one-word reminder that wouldn't pass strict validation.
    const createdTasks: Array<{ task: { id: string; title: string }; deduped: boolean }> = [];
    try {
      for (const item of normalizedItems) {
        const result = await createTaskWithGuards({
          productId: item.productId,
          title: item.title,
          description: item.description,
          dueDate: item.dueDate ? new Date(item.dueDate) : null,
          priority: item.priority,
          category: item.category,
          source: "MANUAL",
          locale: "en",
          skipValidation: true,
        });
        createdTasks.push({ task: result.task, deduped: result.deduped });
      }
    } catch (err) {
      if (err instanceof TaskCreationError) {
        return NextResponse.json(
          { error: err.message, code: err.reason },
          { status: 400 },
        );
      }
      throw err;
    }

    if (createdTasks.length === 1) {
      return NextResponse.json(
        { ...createdTasks[0].task, deduped: createdTasks[0].deduped },
        { status: 201 },
      );
    }

    return NextResponse.json(
      {
        count: createdTasks.length,
        tasks: createdTasks.map((c) => ({ ...c.task, deduped: c.deduped })),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
