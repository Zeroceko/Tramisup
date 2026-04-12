import { NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { buildAgentContext, type AgentType } from "@/lib/agent-context";
import {
  buildAgentSystemPrompt,
  buildAgentUserPrompt,
  buildFallbackResponse,
  type AgentMessage,
  type AgentResponse,
  type AgentAction,
  type AgentSuggestion,
} from "@/lib/agent-prompts";
import { generateStructuredFallback } from "@/BrandLib/ai-client";
import { checkLimit, recordUsageEvent } from "@/lib/plan-limits";
import { tryCreateTaskWithGuards } from "@/lib/task-create";
import { buildTaskDetailFallback } from "@/lib/task-detail-fallback";
import {
  createStoredAgentMessage,
  listStoredAgentMessages,
  resolveMessageActionsForClient,
} from "@/lib/agent-messages";

const VALID_AGENT_TYPES: AgentType[] = ["overview", "launch", "growth"];
const AgentActionSchema = z.object({
  type: z.literal("create_task"),
  payload: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  }),
});

const AgentMessageActionSchema = z.object({
  type: z.enum(["create_task", "open_checklist", "open_tracking"]),
  label: z.string().min(1),
  payload: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  }).optional(),
});

const AgentSuggestionSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1).optional(),
  title: z.string().min(1).optional(),
  intent: z.enum(["ask", "create_task"]).optional(),
  payload: z.object({
    title: z.string().min(1),
    description: z.string().optional(),
    priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  }).optional(),
  description: z.string().nullable().optional(),
  whyItMatters: z.string().optional(),
  doneCriteria: z.string().optional(),
  nextAction: z.string().optional(),
  category: z.string().optional(),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]).optional(),
  source: z.enum(["ai", "fallback"]).optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
  existingTaskId: z.string().optional(),
  existingTaskTitle: z.string().optional(),
}).refine((item) => Boolean(item.label || item.title || item.payload?.title), {
  message: "suggestion requires label, title, or payload.title",
});

const AgentResponseSchema = z.object({
  message: z.string().min(1),
  actions: z.array(AgentActionSchema).default([]),
  messageActions: z.array(AgentMessageActionSchema).default([]),
  suggestions: z.array(AgentSuggestionSchema).default([]),
});

function normalizeSuggestions(rawSuggestions: unknown, locale: "en" | "tr"): AgentSuggestion[] {
  if (!Array.isArray(rawSuggestions)) return [];

  return rawSuggestions.flatMap<AgentSuggestion>((item) => {
    if (typeof item === "string") {
      return [{
        label: item,
        intent: "create_task" as const,
        payload: {
          title: item,
          priority: "MEDIUM",
        },
      }];
    }

    if (!item || typeof item !== "object") return [];
    const suggestion = item as Record<string, unknown>;
    const payload =
      suggestion.payload && typeof suggestion.payload === "object"
        ? suggestion.payload as Record<string, unknown>
        : null;
    const label =
      typeof suggestion.label === "string" && suggestion.label.trim().length > 0
        ? suggestion.label.trim()
        : typeof suggestion.title === "string" && suggestion.title.trim().length > 0
          ? suggestion.title.trim()
          : payload && typeof payload.title === "string"
            ? payload.title.trim()
            : "";
    if (!label) return [];

    const intent = suggestion.intent === "ask" ? "ask" : "create_task";
    const title = payload && typeof payload.title === "string" ? payload.title : label;
    const fallback = buildTaskDetailFallback({
      title,
      category: typeof suggestion.category === "string" ? suggestion.category : null,
      locale,
    });

    return [{
      id: typeof suggestion.id === "string" ? suggestion.id : undefined,
      label,
      title,
      intent,
      payload: payload
        ? {
            title,
            description:
              typeof payload.description === "string" ? payload.description : undefined,
            priority:
              payload.priority === "HIGH" || payload.priority === "LOW"
                ? payload.priority
                : "MEDIUM",
          }
        : undefined,
      description: typeof suggestion.description === "string" ? suggestion.description : null,
      whyItMatters:
        typeof suggestion.whyItMatters === "string" ? suggestion.whyItMatters : fallback.why,
      doneCriteria:
        typeof suggestion.doneCriteria === "string" ? suggestion.doneCriteria : fallback.doneCriteria,
      nextAction:
        typeof suggestion.nextAction === "string" ? suggestion.nextAction : fallback.nextAction,
      category: typeof suggestion.category === "string" ? suggestion.category : undefined,
      priority:
        payload?.priority === "HIGH" || payload?.priority === "LOW"
          ? payload.priority
          : "MEDIUM",
      source: suggestion.source === "fallback" ? "fallback" : "ai",
      confidence:
        suggestion.confidence === "high" || suggestion.confidence === "low"
          ? suggestion.confidence
          : "medium",
      existingTaskId:
        typeof suggestion.existingTaskId === "string" ? suggestion.existingTaskId : undefined,
      existingTaskTitle:
        typeof suggestion.existingTaskTitle === "string" ? suggestion.existingTaskTitle : undefined,
    }];
  }).slice(0, 4);
}

async function executeActions(
  actions: AgentAction[],
  productId: string,
  userId: string,
  locale: "en" | "tr",
): Promise<{ executedActions: string[] }> {
  const executedActions: string[] = [];
  const taskActions = actions.filter((action) => action.type === "create_task");

  if (taskActions.length > 0) {
    const taskLimit = await checkLimit(userId, "tasks", taskActions.length);
    if (!taskLimit.allowed) {
      return { executedActions };
    }
  }

  for (const action of actions) {
    if (action.type === "create_task") {
      const { title, description, priority } = action.payload;
      if (!title) continue;

      // Goes through the canonical guard: validation, dedupe, instrumentation.
      // Agent payloads rarely include structured fields so we accept best-effort
      // by skipping strict validation; dedupe still runs.
      const result = await tryCreateTaskWithGuards({
        productId,
        title,
        description: description ?? null,
        priority: (priority as "HIGH" | "MEDIUM" | "LOW" | undefined) ?? "MEDIUM",
        source: "AGENT_CHAT",
        locale,
        skipValidation: true,
      });
      if (result) {
        executedActions.push(
          result.deduped
            ? `task_deduped:${title}`
            : `task_created:${title}`,
        );
      }
    }
  }

  return { executedActions };
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const agentType = typeof body?.agentType === "string" ? body.agentType.toLowerCase() : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const productId = typeof body?.productId === "string" ? body.productId : "";
    const locale = typeof body?.locale === "string" && body.locale === "tr" ? "tr" : "en";
    if (!VALID_AGENT_TYPES.includes(agentType as AgentType)) {
      return NextResponse.json(
        { error: "Invalid agentType. Must be: overview | launch | growth" },
        { status: 400 }
      );
    }

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    // Verify product ownership
    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const storedMessages = await listStoredAgentMessages(
      prisma,
      session.user.id,
      productId,
      agentType as AgentType,
    );
    const history: AgentMessage[] = storedMessages.length > 0
      ? storedMessages.map((entry) => ({
          role: entry.role,
          content: entry.content,
        }))
      : Array.isArray(body?.conversationHistory)
        ? body.conversationHistory
        : [];

    const messageLimit = await checkLimit(session.user.id, "aiMessages", 1);
    if (!messageLimit.allowed) {
      return NextResponse.json(
        {
          error: `Agent chat limit reached (${messageLimit.used}/${messageLimit.limit}). Upgrade to continue chatting.`,
          code: "AI_MESSAGE_LIMIT_REACHED",
          resource: "aiMessages",
          used: messageLimit.used,
          limit: messageLimit.limit,
          upgradeUrl: `/${locale}/pricing`,
        },
        { status: 403 }
      );
    }

    // Build context and prompts
    const agentContext = await buildAgentContext(agentType as AgentType, productId, locale);
    const systemPrompt = buildAgentSystemPrompt(agentContext);
    const userPrompt = buildAgentUserPrompt(history, message);

    // Call AI
    let agentResponse: AgentResponse;
    try {
      const generated = await generateStructuredFallback<AgentResponse>(
        `${systemPrompt}\n\nUser prompt:\n${userPrompt}`,
        AgentResponseSchema,
        `agent:${agentType}`,
      );
      agentResponse = {
        ...generated,
        suggestions: normalizeSuggestions(generated.suggestions, locale),
      };
    } catch (err) {
      console.error("[agent/chat] AI call failed:", err);
      agentResponse = buildFallbackResponse(agentType, locale);
    }

    // Execute any actions (e.g. create_task)
    const { executedActions } = await executeActions(
      agentResponse.actions,
      productId,
      session.user.id,
      locale,
    );
    const messageActions = resolveMessageActionsForClient(
      agentResponse.messageActions,
      locale,
      productId,
    );

    await prisma.$transaction(async (tx) => {
      await createStoredAgentMessage(tx, {
        userId: session.user.id,
        productId,
        agentType: agentType as AgentType,
        role: "user",
        content: message,
      });
      await createStoredAgentMessage(tx, {
        userId: session.user.id,
        productId,
        agentType: agentType as AgentType,
        role: "assistant",
        content: agentResponse.message,
        messageActions,
      });
    });

    await recordUsageEvent(session.user.id, "aiMessages");

    return NextResponse.json({
      message: agentResponse.message,
      actions: agentResponse.actions,
      messageActions,
      executedActions,
      suggestions: agentResponse.suggestions,
    });
  } catch (error) {
    console.error("[agent/chat] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentType = searchParams.get("agentType")?.toLowerCase() ?? "";
    const productId = searchParams.get("productId") ?? "";
    const locale = searchParams.get("locale") === "tr" ? "tr" : "en";

    if (!VALID_AGENT_TYPES.includes(agentType as AgentType)) {
      return NextResponse.json(
        { error: "Invalid agentType. Must be: overview | launch | growth" },
        { status: 400 },
      );
    }

    if (!productId) {
      return NextResponse.json({ error: "productId is required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const messages = await listStoredAgentMessages(
      prisma,
      session.user.id,
      productId,
      agentType as AgentType,
    );

    return NextResponse.json({
      messages: messages.map((entry) => ({
        ...entry,
        messageActions: resolveMessageActionsForClient(
          entry.messageActions,
          locale,
          productId,
        ),
      })),
    });
  } catch (error) {
    console.error("[agent/chat] Failed to load history:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
