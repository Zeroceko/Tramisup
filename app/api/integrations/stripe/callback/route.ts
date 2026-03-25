import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const state = searchParams.get("state");
    const error = searchParams.get("error");
    const error_description = searchParams.get("error_description");

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";

    if (error || !code || !state) {
      console.error("Stripe Callback Denied:", error_description);
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=stripe_denied`);
    }

    const { productId, userId } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) {
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=unauthorized_product`);
    }

    // Typically STRIPE_SECRET_KEY is the standard platform key
    const secretKey = process.env.STRIPE_SECRET_KEY; 

    if (!secretKey) {
      return NextResponse.redirect(`${baseUrl}/tr/integrations?error=missing_stripe_secret`);
    }

    const tokenRes = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        client_secret: secretKey
      })
    });

    const tokenData = await tokenRes.json();

    if (tokenData.error) {
       console.error("Stripe Token Exch error:", tokenData);
       return NextResponse.redirect(`${baseUrl}/tr/integrations?error=exchange_failed`);
    }

    // Upsert integration with Stripe specific credentials
    await prisma.integration.upsert({
      where: {
        productId_provider: {
          productId,
          provider: "STRIPE"
        }
      },
      update: {
        status: "CONNECTED",
        config: JSON.stringify({
          stripe_user_id: tokenData.stripe_user_id,
          refresh_token: tokenData.refresh_token,
          access_token: tokenData.access_token
        })
      },
      create: {
        productId,
        provider: "STRIPE",
        status: "CONNECTED",
        config: JSON.stringify({
          stripe_user_id: tokenData.stripe_user_id,
          refresh_token: tokenData.refresh_token,
          access_token: tokenData.access_token
        })
      }
    });

    return NextResponse.redirect(`${baseUrl}/tr/integrations?success=stripe_connected`);

  } catch(e) {
    console.error("Stripe callback crash", e);
    const fallback = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    return NextResponse.redirect(`${fallback}/tr/integrations?error=oauth_crash`);
  }
}
