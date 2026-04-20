import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getOAuthCallbackBaseUrl } from "@/lib/app-urls";
import { encryptSecret } from "@/lib/crypto";

export const dynamic = "force-dynamic";

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

    // Try to extract locale from state before failing, default to master locale "en"
    let earlyLocale = "en";
    if (state) {
      try {
        const parsed = JSON.parse(Buffer.from(state, "base64").toString("utf8")) as { locale?: string };
        earlyLocale = parsed.locale === "tr" ? "tr" : "en";
      } catch {
        // state unreadable — use default
      }
    }

    if (error || !code || !state) {
      return NextResponse.redirect(buildReturnUrl({ locale: earlyLocale, error: "google_play_denied" }));
    }

    const { productId, userId, locale, returnTo } = JSON.parse(Buffer.from(state, "base64").toString("utf8")) as {
      productId: string;
      userId: string;
      locale?: string;
      returnTo?: string;
    };
    const resolvedLocale = locale === "en" ? "en" : "tr";

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, userId: true },
    });
    if (!product || product.userId !== userId) {
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "unauthorized_product" }));
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "missing_env_secrets" }));
    }

    const redirectUri = `${getOAuthCallbackBaseUrl()}/api/integrations/google-play/callback`;
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
      console.error("Google Play token exchange failed:", tokenData);
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "exchange_failed" }));
    }

    const userInfoRes = await fetch("https://openidconnect.googleapis.com/v1/userinfo", {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
      cache: "no-store",
    });
    const userInfo = userInfoRes.ok ? await userInfoRes.json() : null;

    await prisma.integration.upsert({
      where: {
        productId_provider: {
          productId,
          provider: "GOOGLE_PLAY",
        },
      },
      update: {
        status: "CONNECTED",
        config: JSON.stringify({
          encryptedRefreshToken: tokenData.refresh_token
            ? encryptSecret(tokenData.refresh_token)
            : null,
          encryptedAccessToken: encryptSecret(tokenData.access_token),
          scope: tokenData.scope,
          accountDisplayName:
            typeof userInfo?.email === "string" ? userInfo.email : "Google Play account",
        }),
      },
      create: {
        productId,
        provider: "GOOGLE_PLAY",
        status: "CONNECTED",
        config: JSON.stringify({
          encryptedRefreshToken: tokenData.refresh_token
            ? encryptSecret(tokenData.refresh_token)
            : null,
          encryptedAccessToken: encryptSecret(tokenData.access_token),
          scope: tokenData.scope,
          accountDisplayName:
            typeof userInfo?.email === "string" ? userInfo.email : "Google Play account",
        }),
      },
    });

    return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, success: "google_play_connected" }));
  } catch (error) {
    console.error("Google Play callback failed:", error);
    return NextResponse.redirect(buildReturnUrl({ locale: "en", error: "oauth_crash" }));
  }
}
