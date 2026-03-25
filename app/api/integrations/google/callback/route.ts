import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";

    if (error || !code || !state) {
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=missing_params_or_denied`);
    }

    // Decode state
    const { productId, userId } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) {
       return NextResponse.redirect(`${baseUrl}/tr/integrations?error=unauthorized_product`);
    }

    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${baseUrl}/api/integrations/google/callback`;

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=missing_env_secrets`);
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
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=exchange_failed`);
    }

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
        config: JSON.stringify({
          refresh_token: tokenData.refresh_token || undefined,
          access_token: tokenData.access_token,
          expires_in: tokenData.expires_in
        })
      },
      create: {
        productId,
        provider: "GA4",
        status: "CONNECTED",
        config: JSON.stringify({
           refresh_token: tokenData.refresh_token,
           access_token: tokenData.access_token,
           expires_in: tokenData.expires_in
        })
      }
    });

    return NextResponse.redirect(`${baseUrl}/tr/integrations?success=ga4_connected`);
  } catch(e) {
    console.error("Callback crash:", e);
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002"}/tr/integrations?error=oauth_crash`);
  }
}
