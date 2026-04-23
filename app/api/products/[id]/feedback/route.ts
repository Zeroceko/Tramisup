import { randomUUID } from "crypto";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { appendFeedbackToAdditionalContext } from "@/lib/product-feedback";
import { recordProductEvent } from "@/lib/product-events";

function normalizeOptionalText(value: unknown) {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(
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

    const body = await request.json().catch(() => null);
    const name = normalizeOptionalText(body?.name);
    const email = normalizeOptionalText(body?.email);
    const message = normalizeOptionalText(body?.message);

    if (!message || message.length < 3) {
      return NextResponse.json({ error: "Feedback message is too short" }, { status: 400 });
    }

    const entry = {
      id: randomUUID(),
      name,
      email,
      message: message.slice(0, 1000),
      createdAt: new Date().toISOString(),
    };

    const additionalContext = appendFeedbackToAdditionalContext({
      currentValue: product.additionalContext,
      entry,
    });

    await prisma.product.update({
      where: { id },
      data: { additionalContext },
    });

    await recordProductEvent({
      userId: session.user.id,
      productId: id,
      eventType: "PRODUCT_FEEDBACK_SUBMITTED",
      metadata: {
        hasName: Boolean(name),
        hasEmail: Boolean(email),
        messageLength: entry.message.length,
      },
    });

    return NextResponse.json({ success: true, entry });
  } catch (error) {
    console.error("Failed to save product feedback:", error);
    return NextResponse.json({ error: "Failed to save feedback" }, { status: 500 });
  }
}
