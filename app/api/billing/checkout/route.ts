import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
}

const PRICE_IDS: Record<string, Record<string, string>> = {
  STARTER: {
    MONTHLY: process.env.STRIPE_PRICE_STARTER_MONTHLY ?? "",
    YEARLY: process.env.STRIPE_PRICE_STARTER_YEARLY ?? "",
  },
  PRO: {
    MONTHLY: process.env.STRIPE_PRICE_PRO_MONTHLY ?? "",
    YEARLY: process.env.STRIPE_PRICE_PRO_YEARLY ?? "",
  },
};

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/en/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const plan = searchParams.get("plan") ?? "STARTER";
  const interval = searchParams.get("interval") ?? "MONTHLY";
  const locale = searchParams.get("locale") ?? "en";

  const priceId = PRICE_IDS[plan]?.[interval];
  if (!priceId) {
    return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, subscription: { select: { stripeCustomerId: true } } },
  });

  const checkoutSession = await getStripe().checkout.sessions.create({
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    customer: user?.subscription?.stripeCustomerId ?? undefined,
    customer_email: user?.subscription?.stripeCustomerId ? undefined : (user?.email ?? undefined),
    subscription_data: {
      trial_period_days: 7,
      metadata: { userId: session.user.id, plan, interval },
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/settings?section=billing&checkout=success`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/pricing`,
    metadata: { userId: session.user.id },
  });

  return NextResponse.redirect(checkoutSession.url!);
}
