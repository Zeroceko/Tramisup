import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { prisma } from "@/lib/prisma";
import { PlanTier, BillingInterval, SubStatus } from "@prisma/client";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) return NextResponse.json({ error: "Missing signature" }, { status: 400 });

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (!userId || !session.subscription) return NextResponse.json({ ok: true });

    const stripeCustomerId = typeof session.customer === "string" ? session.customer : null;
    const sub = await stripe.subscriptions.retrieve(session.subscription as string);
    const plan = (sub.metadata?.plan ?? "STARTER") as PlanTier;
    const interval = (sub.metadata?.interval ?? "MONTHLY") as BillingInterval;
    const periodEndTs = sub.items?.data?.[0]?.current_period_end;
    const periodEnd = periodEndTs ? new Date(periodEndTs * 1000) : null;

    await prisma.subscription.upsert({
      where: { userId },
      create: {
        userId,
        plan,
        interval,
        status: SubStatus.ACTIVE,
        stripeSubId: sub.id,
        stripeCustomerId,
        currentPeriodEnd: periodEnd,
      },
      update: {
        plan,
        interval,
        status: SubStatus.ACTIVE,
        stripeSubId: sub.id,
        stripeCustomerId,
        currentPeriodEnd: periodEnd,
      },
    });
  }

  if (event.type === "customer.subscription.updated") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    const plan = (sub.metadata?.plan ?? "STARTER") as PlanTier;
    const interval = (sub.metadata?.interval ?? "MONTHLY") as BillingInterval;
    const periodEndTs = sub.items?.data?.[0]?.current_period_end;
    const periodEnd = periodEndTs
      ? new Date(periodEndTs * 1000)
      : null;

    const statusMap: Record<string, SubStatus> = {
      active: SubStatus.ACTIVE,
      past_due: SubStatus.PAST_DUE,
      canceled: SubStatus.CANCELED,
    };
    const status = statusMap[sub.status] ?? SubStatus.ACTIVE;

    await prisma.subscription.upsert({
      where: { userId },
      create: { userId, plan, interval, status, stripeSubId: sub.id, currentPeriodEnd: periodEnd },
      update: { plan, interval, status, currentPeriodEnd: periodEnd },
    });
  }

  if (event.type === "customer.subscription.deleted") {
    const sub = event.data.object as Stripe.Subscription;
    const userId = sub.metadata?.userId;
    if (!userId) return NextResponse.json({ ok: true });

    await prisma.subscription.update({
      where: { userId },
      data: { status: SubStatus.CANCELED, plan: PlanTier.FREE },
    });
  }

  return NextResponse.json({ ok: true });
}
