import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  buildLaunchStageRepairData,
  canonicalLaunchStageFromProductStatus,
  normalizeLaunchStageKey,
} from "@/lib/launch-stage";

export async function DELETE(
  request: NextRequest,
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
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id } });

    const response = NextResponse.json({ success: true });

    // Clear active product cookie if it matched the deleted product
    const activeCookie = request.cookies.get("active_product_id")?.value;
    if (activeCookie === id) {
      response.cookies.set("active_product_id", "", { maxAge: 0, path: "/" });
    }

    return response;
  } catch (error) {
    console.error("Failed to delete product:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
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
    const body = await request.json();
    const nextLaunchStage =
      normalizeLaunchStageKey(body.launchStageKey ?? body.launchStatus) ??
      canonicalLaunchStageFromProductStatus(body.status);

    if (!nextLaunchStage) {
      return NextResponse.json({ error: "Invalid launch stage" }, { status: 400 });
    }

    // Verify product belongs to user
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const repairData = buildLaunchStageRepairData({
      launchStatus: nextLaunchStage,
      status: body.status,
    });

    if (!repairData) {
      return NextResponse.json({ error: "Invalid launch stage" }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: repairData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Failed to update product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}
