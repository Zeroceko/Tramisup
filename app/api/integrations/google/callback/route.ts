import { NextRequest, NextResponse } from "next/server";
import { AIAuthType, AIConnectionStatus, AIProvider, AIMode } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getOAuthCallbackBaseUrl } from "@/lib/app-urls";
import { encryptSecret } from "@/lib/crypto";

export const dynamic = 'force-dynamic';

type GoogleOAuthState =
  | {
      flow: "ai_connection";
      userId: string;
      productId?: string | null;
      locale?: string;
    }
  | {
      productId: string;
      userId: string;
      locale?: string;
      returnTo?: string;
      flow?: string;
    };

function buildReturnUrl(args: {
  locale: string;
  returnTo?: string;
  success?: string;
  error?: string;
}) {
  const page =
    args.returnTo === "settings"
      ? `/${args.locale}/settings?section=sources`
      : args.returnTo === "onboarding_growth"
      ? `/${args.locale}/growth?onboarding=1&sourceSetup=1`
      : args.returnTo === "onboarding_overview"
      ? `/${args.locale}/dashboard`
      : `/${args.locale}/integrations`;
  const url = new URL(page, getAppBaseUrl());
  if (args.success) url.searchParams.set("success", args.success);
  if (args.error) url.searchParams.set("error", args.error);
  return url.toString();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const appBaseUrl = getAppBaseUrl();
    const oauthBaseUrl = getOAuthCallbackBaseUrl();

    if (error || !code || !state) {
      return NextResponse.redirect(buildReturnUrl({ locale: "tr", error: "missing_params_or_denied" }));
    }

    const decoded = JSON.parse(Buffer.from(state, "base64").toString("utf8")) as GoogleOAuthState;
    const resolvedLocale = decoded.locale === "en" ? "en" : "tr";

    if (decoded.flow === "ai_connection") {
      if (!decoded.userId) {
        return NextResponse.redirect(`${getAppBaseUrl()}/tr/settings?section=ai&error=google_ai_invalid_state`);
      }

      if (decoded.productId) {
        const product = await prisma.product.findUnique({
          where: { id: decoded.productId },
          select: { id: true, userId: true },
        });

        if (!product || product.userId !== decoded.userId) {
          return NextResponse.redirect(
            `${getAppBaseUrl()}/${resolvedLocale}/settings?section=ai&error=google_ai_unauthorized_product`
          );
        }
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
      const redirectUri = `${getOAuthCallbackBaseUrl()}/api/integrations/google/callback`;

      if (!clientId || !clientSecret) {
        return NextResponse.redirect(
          `${getAppBaseUrl()}/${resolvedLocale}/settings?section=ai&error=google_ai_missing_env`
        );
      }

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
        return NextResponse.redirect(
          `${getAppBaseUrl()}/${resolvedLocale}/settings?section=ai&error=google_ai_exchange_failed`
        );
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

      return NextResponse.redirect(
        `${getAppBaseUrl()}/${resolvedLocale}/settings?section=ai&success=google_ai_connected`
      );
    }

    const { productId, userId, returnTo } = decoded as Extract<
      GoogleOAuthState,
      { productId: string }
    >;

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) {
       return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "unauthorized_product" }));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${oauthBaseUrl}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "missing_env_secrets" }));
    }

    // Exchange authorization code for refresh token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      })
    });

    const tokenData = await tokenRes.json();
    
    if (tokenData.error) {
      console.error("Token Exchange Error:", tokenData);
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "exchange_failed" }));
    }

    const existingIntegration = await prisma.integration.findUnique({
      where: {
        productId_provider: {
          productId,
          provider: "GA4",
        },
      },
    });

    const existingConfig = existingIntegration?.config
      ? JSON.parse(existingIntegration.config)
      : null;

    const mergedConfig = {
      refresh_token: tokenData.refresh_token ?? existingConfig?.refresh_token,
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      propertyId: existingConfig?.propertyId,
      propertyName: existingConfig?.propertyName,
      propertyDisplayName: existingConfig?.propertyDisplayName,
      accountName: existingConfig?.accountName,
      accountDisplayName: existingConfig?.accountDisplayName,
    };

    // Upsert into our Integrations database allowing robust future background cron syncs
    await prisma.integration.upsert({
      where: {
        productId_provider: {
          productId,
          provider: "GA4"
        }
      },
      update: {
        status: "CONNECTED",
        config: JSON.stringify(mergedConfig)
      },
      create: {
        productId,
        provider: "GA4",
        status: "CONNECTED",
        config: JSON.stringify(mergedConfig)
      }
    });

    return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, success: "ga4_connected" }));
  } catch(e) {
    console.error("Callback crash:", e);
    return NextResponse.redirect(buildReturnUrl({ locale: "tr", error: "oauth_crash" }));
  }
}
