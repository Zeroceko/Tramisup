import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { BillingInterval, PlanTier, SubStatus } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const INTERVALS: Record<string, BillingInterval> = {
  MONTHLY: BillingInterval.MONTHLY,
  YEARLY: BillingInterval.YEARLY,
};

const ALLOWED_PLANS = new Set<PlanTier>([PlanTier.STARTER, PlanTier.PRO]);

function getNextPeriodEnd(interval: BillingInterval) {
  const end = new Date();
  if (interval === BillingInterval.YEARLY) {
    end.setFullYear(end.getFullYear() + 1);
  } else {
    end.setMonth(end.getMonth() + 1);
  }
  return end;
}

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.redirect(new URL("/en/login", req.url));
  }

  const { searchParams } = new URL(req.url);
  const locale = searchParams.get("locale") ?? "en";
  const plan = (searchParams.get("plan") ?? "STARTER").toUpperCase() as PlanTier;
  const interval = INTERVALS[(searchParams.get("interval") ?? "MONTHLY").toUpperCase()];

  if (!ALLOWED_PLANS.has(plan) || !interval) {
    return NextResponse.json({ error: "Invalid plan or interval" }, { status: 400 });
  }

  await prisma.subscription.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      plan,
      interval,
      status: SubStatus.ACTIVE,
      currentPeriodEnd: getNextPeriodEnd(interval),
    },
    update: {
      plan,
      interval,
      status: SubStatus.ACTIVE,
      currentPeriodEnd: getNextPeriodEnd(interval),
    },
  });

  return NextResponse.redirect(
    new URL(`/${locale}/settings?section=billing&checkout=success`, req.url),
  );
}
