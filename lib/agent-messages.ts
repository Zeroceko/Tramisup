import type { Prisma, PrismaClient } from "@prisma/client";
import type { AgentMessageAction } from "@/lib/agent-prompts";
import type { AgentType } from "@/lib/agent-types";

type AgentMessageDb = PrismaClient | Prisma.TransactionClient;

export type StoredAgentMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
  messageActions: AgentMessageAction[];
};

function parseActionsJson(value?: string | null): AgentMessageAction[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is AgentMessageAction => Boolean(item && typeof item === "object"));
  } catch {
    return [];
  }
}

export async function listStoredAgentMessages(
  db: AgentMessageDb,
  userId: string,
  productId: string,
  agentType: AgentType,
  limit = 40,
): Promise<StoredAgentMessage[]> {
  const rows = await db.agentMessage.findMany({
    where: { userId, productId, agentType },
    orderBy: { createdAt: "asc" },
    take: limit,
  });

  return rows.map((row) => ({
    id: row.id,
    role: row.role === "assistant" ? "assistant" : "user",
    content: row.content,
    createdAt: row.createdAt,
    messageActions: parseActionsJson(row.actionsJson),
  }));
}

export async function createStoredAgentMessage(
  db: AgentMessageDb,
  input: {
    userId: string;
    productId: string;
    agentType: AgentType;
    role: "user" | "assistant";
    content: string;
    messageActions?: AgentMessageAction[];
  },
) {
  return db.agentMessage.create({
    data: {
      userId: input.userId,
      productId: input.productId,
      agentType: input.agentType,
      role: input.role,
      content: input.content,
      actionsJson: input.messageActions?.length ? JSON.stringify(input.messageActions) : null,
    },
  });
}

export function resolveMessageActionsForClient(
  actions: AgentMessageAction[],
  locale: "en" | "tr",
  productId: string,
): AgentMessageAction[] {
  return actions.map((action) => {
    if (action.type === "open_checklist") {
      return {
        ...action,
        payload: {
          ...action.payload,
          description: `/${locale}/pre-launch#blockers`,
        },
      };
    }
    if (action.type === "open_tracking") {
      return {
        ...action,
        payload: {
          ...action.payload,
          description: `/${locale}/settings?section=tracking&productId=${productId}`,
        },
      };
    }
    return action;
  });
}
