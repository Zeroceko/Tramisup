import { NextResponse } from "next/server";
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
import { generateTextFallback } from "@/BrandLib/ai-client";

const VALID_AGENT_TYPES: AgentType[] = ["overview", "launch", "growth"];

function normalizeSuggestions(rawSuggestions: unknown): AgentSuggestion[] {
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
    const label = typeof suggestion.label === "string" ? suggestion.label.trim() : "";
    if (!label) return [];

    const intent = suggestion.intent === "ask" ? "ask" : "create_task";
    const payload =
      suggestion.payload && typeof suggestion.payload === "object"
        ? suggestion.payload as Record<string, unknown>
        : null;

    return [{
      label,
      intent,
      payload: payload
        ? {
            title: typeof payload.title === "string" ? payload.title : label,
            description:
              typeof payload.description === "string" ? payload.description : undefined,
            priority:
              payload.priority === "HIGH" || payload.priority === "LOW"
                ? payload.priority
                : "MEDIUM",
          }
        : undefined,
    }];
  }).slice(0, 4);
}

function parseAgentResponse(raw: string): AgentResponse | null {
  try {
    // Strip markdown code fences if present
    const cleaned = raw
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const parsed = JSON.parse(cleaned);

    if (typeof parsed.message !== "string") return null;

    return {
      message: parsed.message,
      actions: Array.isArray(parsed.actions) ? parsed.actions : [],
      suggestions: normalizeSuggestions(parsed.suggestions),
    };
  } catch {
    return null;
  }
}

async function executeActions(
  actions: AgentAction[],
  productId: string
): Promise<{ executedActions: string[] }> {
  const executedActions: string[] = [];

  for (const action of actions) {
    if (action.type === "create_task") {
      const { title, description, priority } = action.payload;
      if (!title) continue;

      try {
        await prisma.task.create({
          data: {
            title,
            description: description ?? null,
            priority: priority ?? "MEDIUM",
            status: "TODO",
            productId,
          },
        });
        executedActions.push(`task_created:${title}`);
      } catch (err) {
        console.error("[agent/chat] Failed to create task:", err);
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
    const history: AgentMessage[] = Array.isArray(body?.conversationHistory)
      ? body.conversationHistory
      : [];

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

    // Build context and prompts
    const agentContext = await buildAgentContext(agentType as AgentType, productId);
    const systemPrompt = buildAgentSystemPrompt(agentContext);
    const userPrompt = buildAgentUserPrompt(history, message);

    // Call AI
    let agentResponse: AgentResponse;
    try {
      const raw = await generateTextFallback(systemPrompt, userPrompt, `agent:${agentType}`);
      const parsed = parseAgentResponse(raw);
      agentResponse = parsed ?? buildFallbackResponse(agentType);
    } catch (err) {
      console.error("[agent/chat] AI call failed:", err);
      agentResponse = buildFallbackResponse(agentType);
    }

    // Execute any actions (e.g. create_task)
    const { executedActions } = await executeActions(
      agentResponse.actions,
      productId
    );

    return NextResponse.json({
      message: agentResponse.message,
      actions: agentResponse.actions,
      executedActions,
      suggestions: agentResponse.suggestions,
    });
  } catch (error) {
    console.error("[agent/chat] Unexpected error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
