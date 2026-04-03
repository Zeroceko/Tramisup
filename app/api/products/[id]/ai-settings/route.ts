import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AIMode } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { upsertProductAISelection } from "@/lib/ai-connections";

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
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const mode = body?.mode === AIMode.CONNECTED_MODEL
      ? AIMode.CONNECTED_MODEL
      : AIMode.PLATFORM_DEFAULT;
    const selectedConnectionId =
      typeof body?.selectedConnectionId === "string" ? body.selectedConnectionId : null;

    if (mode === AIMode.CONNECTED_MODEL) {
      if (!selectedConnectionId) {
        return NextResponse.json({ error: "selectedConnectionId is required" }, { status: 400 });
      }

      const connection = await prisma.aIConnection.findFirst({
        where: {
          id: selectedConnectionId,
          userId: session.user.id,
          status: "CONNECTED",
        },
        select: { id: true },
      });

      if (!connection) {
        return NextResponse.json({ error: "Selected connection is not available" }, { status: 400 });
      }
    }

    const settings = await upsertProductAISelection({
      productId: product.id,
      mode,
      selectedConnectionId,
    });

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Failed to update product AI settings:", error);
    return NextResponse.json({ error: "Failed to update AI settings" }, { status: 500 });
  }
}
