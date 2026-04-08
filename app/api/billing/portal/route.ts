import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2026-02-25.clover" });
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/en/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "en";

  const sub = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
    select: { stripeCustomerId: true },
  });

  if (!sub?.stripeCustomerId) {
    return NextResponse.redirect(new URL(`/${locale}/pricing`, req.url));
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: sub.stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/${locale}/settings?section=billing`,
  });

  return NextResponse.redirect(portalSession.url);
}
