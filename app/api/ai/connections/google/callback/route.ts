import { NextRequest, NextResponse } from "next/server";
import { AIAuthType, AIConnectionStatus, AIProvider, AIMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";
import { getAppBaseUrl, getOAuthCallbackBaseUrl } from "@/lib/app-urls";

export const dynamic = "force-dynamic";

type OAuthState = {
  userId: string;
  productId?: string | null;
  locale?: string;
};

function buildSettingsUrl(locale: string, params: Record<string, string>) {
  const search = new URLSearchParams({ section: "ai", ...params });
  return `${getAppBaseUrl()}/${locale}/settings?${search.toString()}`;
}

export async function GET(req: NextRequest) {
  const appBaseUrl = getAppBaseUrl();

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    if (error || !code || !state) {
      let earlyLocale = "en";
      try {
        if (state) {
          const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8")) as OAuthState;
          earlyLocale = decoded.locale === "tr" ? "tr" : "en";
        }
      } catch { /* ignore */ }
      return NextResponse.redirect(buildSettingsUrl(earlyLocale, { error: "google_ai_denied" }));
    }

    const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8")) as OAuthState;
    const locale = decoded.locale === "en" ? "en" : "tr";

    if (!decoded.userId) {
      return NextResponse.redirect(buildSettingsUrl(locale, { error: "google_ai_invalid_state" }));
    }

    if (decoded.productId) {
      const product = await prisma.product.findUnique({
        where: { id: decoded.productId },
        select: { id: true, userId: true },
      });

      if (!product || product.userId !== decoded.userId) {
        return NextResponse.redirect(buildSettingsUrl(locale, { error: "google_ai_unauthorized_product" }));
      }
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(buildSettingsUrl(locale, { error: "google_ai_missing_env" }));
    }

    const redirectUri = `${getOAuthCallbackBaseUrl()}/api/ai/connections/google/callback`;
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || tokenData.error || !tokenData.access_token) {
      console.error("Google AI token exchange failed:", tokenData);
      return NextResponse.redirect(buildSettingsUrl(locale, { error: "google_ai_exchange_failed" }));
    }

    const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });
    const userInfo = userInfoRes.ok ? await userInfoRes.json() : null;

    const connection = await prisma.aIConnection.upsert({
      where: {
        userId_provider: {
          userId: decoded.userId,
          provider: AIProvider.GOOGLE_AI,
        },
      },
      update: {
        authType: AIAuthType.OAUTH,
        status: AIConnectionStatus.CONNECTED,
        label: "Google AI",
        encryptedAccessToken: encryptSecret(tokenData.access_token),
        encryptedRefreshToken: tokenData.refresh_token
          ? encryptSecret(tokenData.refresh_token)
          : undefined,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
          : null,
        scopes: typeof tokenData.scope === "string" ? tokenData.scope : null,
        remoteAccountId: typeof userInfo?.sub === "string" ? userInfo.sub : null,
        remoteAccountEmail: typeof userInfo?.email === "string" ? userInfo.email : null,
      },
      create: {
        userId: decoded.userId,
        provider: AIProvider.GOOGLE_AI,
        authType: AIAuthType.OAUTH,
        status: AIConnectionStatus.CONNECTED,
        label: "Google AI",
        encryptedAccessToken: encryptSecret(tokenData.access_token),
        encryptedRefreshToken: tokenData.refresh_token
          ? encryptSecret(tokenData.refresh_token)
          : null,
        tokenExpiresAt: tokenData.expires_in
          ? new Date(Date.now() + Number(tokenData.expires_in) * 1000)
          : null,
        scopes: typeof tokenData.scope === "string" ? tokenData.scope : null,
        remoteAccountId: typeof userInfo?.sub === "string" ? userInfo.sub : null,
        remoteAccountEmail: typeof userInfo?.email === "string" ? userInfo.email : null,
      },
    });

    if (decoded.productId) {
      await prisma.productAISettings.upsert({
        where: { productId: decoded.productId },
        update: {
          mode: AIMode.CONNECTED_MODEL,
          selectedConnectionId: connection.id,
        },
        create: {
          productId: decoded.productId,
          mode: AIMode.CONNECTED_MODEL,
          selectedConnectionId: connection.id,
        },
      });
    }

    return NextResponse.redirect(buildSettingsUrl(locale, { success: "google_ai_connected" }));
  } catch (error) {
    console.error("Google AI callback failed:", error);
    return NextResponse.redirect(`${appBaseUrl}/en/settings?section=ai&error=google_ai_oauth_crash`);
  }
}
