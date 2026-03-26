import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FunnelMetricSelection } from "@/lib/metric-setup";
import { saveMetricSelections } from "@/lib/metric-setup";

function isValidSelections(input: unknown): input is FunnelMetricSelection[] {
  if (!Array.isArray(input)) return false;
  return input.every(
    (item) =>
      typeof item === "object" &&
      item !== null &&
      typeof item.stage === "string" &&
      Array.isArray(item.selectedMetricKeys)
  );
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
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    const selections = body?.setup?.selections;

    if (!isValidSelections(selections)) {
      return NextResponse.json({ error: "Invalid setup payload" }, { status: 400 });
    }

    await saveMetricSelections(id, selections);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save metric setup:", error);
    return NextResponse.json({ error: "Failed to save metric setup" }, { status: 500 });
  }
}
