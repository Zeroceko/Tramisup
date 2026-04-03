import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AIAuthType, AIConnectionStatus, AIProvider } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";

const PROVIDER_LABELS: Record<string, string> = {
  OPENAI: "ChatGPT",
  ANTHROPIC: "Claude",
};

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const provider =
      body?.provider === "OPENAI" || body?.provider === "ANTHROPIC"
        ? (body.provider as AIProvider)
        : null;
    const apiKey = typeof body?.apiKey === "string" ? body.apiKey.trim() : "";

    if (!provider || !apiKey) {
      return NextResponse.json({ error: "provider and apiKey are required" }, { status: 400 });
    }

    const connection = await prisma.aIConnection.upsert({
      where: {
        userId_provider: {
          userId: session.user.id,
          provider,
        },
      },
      update: {
        authType: AIAuthType.API_KEY,
        status: AIConnectionStatus.CONNECTED,
        label: PROVIDER_LABELS[provider] ?? provider,
        encryptedApiKey: encryptSecret(apiKey),
        encryptedAccessToken: null,
        encryptedRefreshToken: null,
        tokenExpiresAt: null,
      },
      create: {
        userId: session.user.id,
        provider,
        authType: AIAuthType.API_KEY,
        status: AIConnectionStatus.CONNECTED,
        label: PROVIDER_LABELS[provider] ?? provider,
        encryptedApiKey: encryptSecret(apiKey),
      },
    });

    return NextResponse.json({
      id: connection.id,
      provider: connection.provider,
      status: connection.status,
    });
  } catch (error) {
    console.error("Failed to save AI API key connection:", error);
    return NextResponse.json({ error: "Failed to save AI connection" }, { status: 500 });
  }
}
