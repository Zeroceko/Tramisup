import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { recordProductEvent, type ProductEventType } from "@/lib/product-events";

const CLIENT_EVENT_TYPES = new Set<ProductEventType>(["APP_SESSION"]);

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = String(body?.productId ?? "").trim();
    const eventType = String(body?.eventType ?? "").trim() as ProductEventType;
    const metadata =
      body?.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata)
        ? body.metadata as Record<string, unknown>
        : undefined;

    if (!productId || !CLIENT_EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await recordProductEvent({
      userId: session.user.id,
      productId,
      eventType,
      metadata,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[product-events] POST failed:", error);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }
}
