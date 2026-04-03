import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/app-urls";

export const dynamic = 'force-dynamic';

function buildReturnUrl(args: {
  locale: string;
  returnTo?: string;
  success?: string;
  error?: string;
}) {
  const page =
    args.returnTo === "settings"
      ? `/${args.locale}/settings?section=sources`
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
    const error_description = searchParams.get("error_description");

    const appBaseUrl = getAppBaseUrl();

    if (error || !code || !state) {
      console.error("Stripe Callback Denied:", error_description);
      return NextResponse.redirect(buildReturnUrl({ locale: "tr", error: "stripe_denied" }));
    }

    const { productId, userId, locale, returnTo } = JSON.parse(Buffer.from(state, 'base64').toString('ascii'));
    const resolvedLocale = locale === "en" ? "en" : "tr";

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.userId !== userId) {
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "unauthorized_product" }));
    }

    // Typically STRIPE_SECRET_KEY is the standard platform key
    const secretKey = process.env.STRIPE_SECRET_KEY; 

    if (!secretKey) {
      return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "missing_stripe_secret" }));
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
       return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, error: "exchange_failed" }));
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

    return NextResponse.redirect(buildReturnUrl({ locale: resolvedLocale, returnTo, success: "stripe_connected" }));

  } catch(e) {
    console.error("Stripe callback crash", e);
    return NextResponse.redirect(buildReturnUrl({ locale: "tr", error: "oauth_crash" }));
  }
}
