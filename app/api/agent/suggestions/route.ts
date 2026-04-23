import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAgentContext, type AgentType } from "@/lib/agent-context";
import { checkLimit } from "@/lib/plan-limits";
import { createTaskWithGuards, TaskCreationError } from "@/lib/task-create";
import type { Locale } from "@/lib/task-validator";
import { generateAgentSuggestions, type AgentSuggestionBrief } from "@/lib/agent-suggestions";
import { recordProductEvent } from "@/lib/product-events";

const VALID_AGENT_TYPES: AgentType[] = ["overview", "launch", "growth"];

/**
 * GET /api/agent/suggestions?agentType=overview&productId=xxx&locale=en
 *
 * Returns hybrid AI + fallback suggestion briefs for the agent panel.
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const agentType = url.searchParams.get("agentType") as AgentType;
    const productId = url.searchParams.get("productId") ?? "";
    const locale = (url.searchParams.get("locale") === "tr" ? "tr" : "en") as Locale;

    if (!VALID_AGENT_TYPES.includes(agentType)) {
      return NextResponse.json({ error: "Invalid agentType" }, { status: 400 });
    }
    if (!productId) {
      return NextResponse.json({ error: "productId required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        description: true,
        category: true,
        businessModel: true,
        targetAudience: true,
        launchGoals: true,
      },
    });
    if (!product) {
      return NextResponse.json({ suggestions: [] });
    }

    const [ctx, openTasks, checklistItems] = await Promise.all([
      buildAgentContext(agentType, productId, locale),
      prisma.task.findMany({
        where: {
          productId,
          status: { in: ["TODO", "IN_PROGRESS"] },
        },
        orderBy: [{ priority: "asc" }, { createdAt: "asc" }],
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          category: true,
        },
        take: 12,
      }),
      prisma.launchChecklist.findMany({
        where: { productId },
        orderBy: [{ priority: "asc" }, { order: "asc" }],
        select: {
          id: true,
          title: true,
          category: true,
          completed: true,
          priority: true,
        },
        take: 12,
      }),
    ]);

    const suggestions = await generateAgentSuggestions({
      agentType,
      locale,
      product,
      contextSummary: ctx.contextSummary,
      contextData: JSON.parse(ctx.contextSummary) as Record<string, unknown>,
      openTasks,
      checklistItems: checklistItems.map((item) => ({
        ...item,
        priority: item.priority === "HIGH" || item.priority === "LOW" ? item.priority : "MEDIUM",
      })),
    });

    if (suggestions.length > 0) {
      await recordProductEvent({
        userId: session.user.id,
        productId,
        eventType: "AI_SUGGESTIONS_SHOWN",
        metadata: {
          agentType,
          locale,
          suggestionCount: suggestions.length,
        },
      });
    }

    return NextResponse.json({ suggestions });
  } catch (error) {
    console.error("[agent/suggestions] Error:", error);
    return NextResponse.json({ suggestions: [] });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json() as {
      productId?: string;
      suggestion?: Partial<AgentSuggestionBrief>;
      locale?: string;
      agentType?: AgentType;
      suggestionId?: string;
    };

    const productId = typeof body.productId === "string" ? body.productId : "";
    const locale = (body.locale === "tr" ? "tr" : "en") as Locale;
    const agentType = VALID_AGENT_TYPES.includes(body.agentType as AgentType)
      ? (body.agentType as AgentType)
      : null;
    const suggestionId = typeof body.suggestionId === "string" ? body.suggestionId : null;
    const suggestion = body.suggestion ?? {};

    if (!productId || typeof suggestion.title !== "string") {
      return NextResponse.json({ error: "productId and suggestion.title are required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const taskLimit = await checkLimit(session.user.id, "tasks", 1);
    if (!taskLimit.allowed) {
      return NextResponse.json(
        {
          error: `Task limit reached (${taskLimit.used}/${taskLimit.limit}). Upgrade to add more tasks.`,
          code: "TASK_LIMIT_REACHED",
        },
        { status: 403 },
      );
    }

    try {
      const result = await createTaskWithGuards({
        productId,
        title: suggestion.title,
        description: typeof suggestion.description === "string" ? suggestion.description : null,
        whyItMatters: typeof suggestion.whyItMatters === "string" ? suggestion.whyItMatters : undefined,
        doneCriteria: typeof suggestion.doneCriteria === "string" ? suggestion.doneCriteria : undefined,
        nextAction: typeof suggestion.nextAction === "string" ? suggestion.nextAction : undefined,
        category: typeof suggestion.category === "string" ? suggestion.category : undefined,
        priority: suggestion.priority === "HIGH" || suggestion.priority === "LOW" ? suggestion.priority : "MEDIUM",
        source: "AGENT_CHAT",
        locale,
      });

      await recordProductEvent({
        userId: session.user.id,
        productId,
        eventType: "AI_SUGGESTION_TASK_ACTIVATED",
        metadata: {
          agentType,
          locale,
          suggestionId,
          deduped: result.deduped,
          taskId: result.task.id,
        },
      });

      return NextResponse.json({
        task: {
          id: result.task.id,
          title: result.task.title,
        },
        deduped: result.deduped,
        dedupedAgainst: result.dedupedAgainst ?? null,
      });
    } catch (error) {
      if (error instanceof TaskCreationError) {
        return NextResponse.json(
          { error: error.message, code: error.reason },
          { status: 400 },
        );
      }
      throw error;
    }
  } catch (error) {
    console.error("[agent/suggestions] POST error:", error);
    return NextResponse.json({ error: "Failed to create task from suggestion" }, { status: 500 });
  }
}
