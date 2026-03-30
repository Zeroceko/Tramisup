import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl, getOAuthCallbackBaseUrl } from "@/lib/app-urls";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const appBaseUrl = getAppBaseUrl();
    const oauthBaseUrl = getOAuthCallbackBaseUrl();

    if (error || !code || !state) {
      return NextResponse.redirect(`${appBaseUrl}/tr/integrations?error=missing_params_or_denied`);
    }

    // Decode state
    const { productId, userId } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) {
       return NextResponse.redirect(`${appBaseUrl}/tr/integrations?error=unauthorized_product`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${oauthBaseUrl}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${appBaseUrl}/tr/integrations?error=missing_env_secrets`);
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
      return NextResponse.redirect(`${appBaseUrl}/tr/integrations?error=exchange_failed`);
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

    return NextResponse.redirect(`${appBaseUrl}/tr/integrations?success=ga4_connected`);
  } catch(e) {
    console.error("Callback crash:", e);
    return NextResponse.redirect(`${getAppBaseUrl()}/tr/integrations?error=oauth_crash`);
  }
}
