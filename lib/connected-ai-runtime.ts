import OpenAI from "openai";
import { AIProvider, AIMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { decryptSecret, encryptSecret } from "@/lib/crypto";

const GOOGLE_AI_MODEL =
  process.env.GOOGLE_AI_CONNECTED_MODEL ||
  process.env.GEMINI_CONNECTED_MODEL ||
  "gemini-2.5-flash";

const GOOGLE_AI_API_BASE =
  process.env.GOOGLE_AI_API_BASE || "https://generativelanguage.googleapis.com/v1beta";

const GOOGLE_AI_BILLING_PROJECT =
  process.env.GOOGLE_CLOUD_PROJECT ||
  process.env.GOOGLE_AI_PROJECT ||
  process.env.GOOGLE_GENAI_PROJECT ||
  null;

const OPENAI_CONNECTED_MODEL =
  process.env.OPENAI_CONNECTED_MODEL || "gpt-4.1-mini";

const ANTHROPIC_CONNECTED_MODEL =
  process.env.ANTHROPIC_CONNECTED_MODEL || "claude-sonnet-4-20250514";

type SelectedConnection = {
  id: string;
  provider: AIProvider;
  encryptedApiKey: string | null;
  encryptedAccessToken: string | null;
  encryptedRefreshToken: string | null;
  tokenExpiresAt: Date | null;
};

async function getSelectedConnection(productId: string, userId: string) {
  const settings = await prisma.productAISettings.findUnique({
    where: { productId },
    include: {
      selectedConnection: {
        select: {
          id: true,
          userId: true,
          provider: true,
          status: true,
          encryptedApiKey: true,
          encryptedAccessToken: true,
          encryptedRefreshToken: true,
          tokenExpiresAt: true,
        },
      },
    },
  });

  if (
    !settings ||
    settings.mode !== AIMode.CONNECTED_MODEL ||
    !settings.selectedConnection ||
    settings.selectedConnection.userId !== userId ||
    settings.selectedConnection.status !== "CONNECTED"
  ) {
    return null;
  }

  return settings.selectedConnection as SelectedConnection;
}

async function refreshGoogleAccessToken(connection: SelectedConnection) {
  if (!connection.encryptedRefreshToken) {
    throw new Error("Missing refresh token for Google AI connection.");
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing Google OAuth client configuration.");
  }

  const refreshToken = decryptSecret(connection.encryptedRefreshToken);
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
    cache: "no-store",
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
    await prisma.aIConnection.update({
      where: { id: connection.id },
      data: { status: "EXPIRED" },
    });
    throw new Error("Google AI access token refresh failed.");
  }

  const encryptedAccessToken = encryptSecret(tokenData.access_token);
  const tokenExpiresAt = tokenData.expires_in
    ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
    : null;

  await prisma.aIConnection.update({
    where: { id: connection.id },
    data: {
      encryptedAccessToken,
      tokenExpiresAt,
      status: "CONNECTED",
    },
  });

  return tokenData.access_token as string;
}

async function getGoogleAccessToken(connection: SelectedConnection) {
  if (!connection.encryptedAccessToken) {
    return refreshGoogleAccessToken(connection);
  }

  const expiresSoon =
    connection.tokenExpiresAt != null &&
    connection.tokenExpiresAt.getTime() <= Date.now() + 60_000;

  if (expiresSoon) {
    return refreshGoogleAccessToken(connection);
  }

  return decryptSecret(connection.encryptedAccessToken);
}

function extractGoogleText(payload: unknown) {
  const candidate = (payload as { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> })
    ?.candidates?.[0];
  const parts = candidate?.content?.parts ?? [];
  return (
    parts
      .map((part) => (typeof part.text === "string" ? part.text : ""))
      .join("")
      .trim() || null
  );
}

async function requestGoogleAI(prompt: string, accessToken: string) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  if (GOOGLE_AI_BILLING_PROJECT) {
    headers["x-goog-user-project"] = GOOGLE_AI_BILLING_PROJECT;
  }

  const res = await fetch(`${GOOGLE_AI_API_BASE}/models/${GOOGLE_AI_MODEL}:generateContent`, {
    method: "POST",
    headers,
    cache: "no-store",
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.4,
      },
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } } | null)?.error?.message ||
      `Google AI request failed with ${res.status}`;
    throw new Error(message);
  }

  return extractGoogleText(data);
}

async function requestOpenAI(prompt: string, apiKey: string) {
  const client = new OpenAI({ apiKey });
  const response = await client.chat.completions.create({
    model: OPENAI_CONNECTED_MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.4,
  });

  return response.choices[0]?.message?.content?.trim() || null;
}

async function requestAnthropic(prompt: string, apiKey: string) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    cache: "no-store",
    body: JSON.stringify({
      model: ANTHROPIC_CONNECTED_MODEL,
      max_tokens: 1800,
      temperature: 0.4,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }),
  });

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (data as { error?: { message?: string } } | null)?.error?.message ||
      `Anthropic request failed with ${res.status}`;
    throw new Error(message);
  }

  const parts = (data as { content?: Array<{ type?: string; text?: string }> } | null)?.content ?? [];
  return (
    parts
      .filter((part) => part.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("")
      .trim() || null
  );
}

async function requestWithSelectedConnection(connection: SelectedConnection, prompt: string) {
  if (connection.provider === AIProvider.GOOGLE_AI) {
    const accessToken = await getGoogleAccessToken(connection);
    return requestGoogleAI(prompt, accessToken);
  }

  if (!connection.encryptedApiKey) {
    throw new Error("Missing API key for selected AI connection.");
  }

  const apiKey = decryptSecret(connection.encryptedApiKey);
  if (connection.provider === AIProvider.OPENAI) {
    return requestOpenAI(prompt, apiKey);
  }

  if (connection.provider === AIProvider.ANTHROPIC) {
    return requestAnthropic(prompt, apiKey);
  }

  return null;
}

export async function generateConnectedAITextForProduct(args: {
  productId: string;
  userId: string;
  prompt: string;
}) {
  const connection = await getSelectedConnection(args.productId, args.userId);
  if (!connection) {
    return null;
  }

  try {
    return await requestWithSelectedConnection(connection, args.prompt);
  } catch (error) {
    console.warn("[connected-ai-runtime] Falling back to platform AI:", error);

    if (connection.provider === AIProvider.GOOGLE_AI && connection.encryptedRefreshToken) {
      try {
        const refreshedAccessToken = await refreshGoogleAccessToken(connection);
        return await requestGoogleAI(args.prompt, refreshedAccessToken);
      } catch (retryError) {
        console.warn("[connected-ai-runtime] Google retry after refresh failed:", retryError);
      }
    }

    return null;
  }
}
