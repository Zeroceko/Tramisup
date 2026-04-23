import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildAdditionalContextWithGrowthCheckin,
  type GrowthCheckinAnswers,
} from "@/lib/growth-transition-checkin";
import { recordProductEvent } from "@/lib/product-events";

function isValidAnswers(input: unknown): input is GrowthCheckinAnswers {
  if (!input || typeof input !== "object" || Array.isArray(input)) return false;
  return Object.values(input).every((value) => typeof value === "string");
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, additionalContext: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const answers = body?.answers;

    if (!isValidAnswers(answers)) {
      return NextResponse.json({ error: "Invalid answers payload" }, { status: 400 });
    }

    const additionalContext = buildAdditionalContextWithGrowthCheckin(
      product.additionalContext,
      answers
    );

    await prisma.product.update({
      where: { id },
      data: { additionalContext },
    });

    await recordProductEvent({
      userId: session.user.id,
      productId: id,
      eventType: "GROWTH_CHECKIN_COMPLETED",
      metadata: {
        answerCount: Object.keys(answers).length,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save growth intake:", error);
    return NextResponse.json({ error: "Failed to save growth intake" }, { status: 500 });
  }
}
