import { AIMode, AIProvider, type ProductAISettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type AIConnectionSummary = {
  id: string;
  provider: AIProvider;
  authType: string;
  status: string;
  label: string | null;
  remoteAccountEmail: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function getAISettingsForProduct(productId: string) {
  return prisma.productAISettings.findUnique({
    where: { productId },
    include: {
      selectedConnection: {
        select: {
          id: true,
          provider: true,
          authType: true,
          status: true,
          label: true,
          remoteAccountEmail: true,
        },
      },
    },
  });
}

export async function listAIConnectionsForUser(userId: string): Promise<AIConnectionSummary[]> {
  const connections = await prisma.aIConnection.findMany({
    where: { userId },
    orderBy: { updatedAt: "desc" },
    select: {
      id: true,
      provider: true,
      authType: true,
      status: true,
      label: true,
      remoteAccountEmail: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return connections.map((connection) => ({
    ...connection,
    createdAt: connection.createdAt.toISOString(),
    updatedAt: connection.updatedAt.toISOString(),
  }));
}

export async function upsertProductAISelection(args: {
  productId: string;
  mode: AIMode;
  selectedConnectionId?: string | null;
}) {
  const { productId, mode, selectedConnectionId } = args;

  return prisma.productAISettings.upsert({
    where: { productId },
    update: {
      mode,
      selectedConnectionId: selectedConnectionId ?? null,
    },
    create: {
      productId,
      mode,
      selectedConnectionId: selectedConnectionId ?? null,
    },
  });
}

export function getAIModeLabel(args: {
  mode: AIMode | null | undefined;
  selectedConnection?: Pick<ProductAISettings, "selectedConnectionId"> | null;
  selectedConnectionProvider?: AIProvider | null;
}) {
  if (args.mode === AIMode.CONNECTED_MODEL && args.selectedConnectionProvider === AIProvider.GOOGLE_AI) {
    return "Google AI";
  }

  return "Tiramisup AI";
}
