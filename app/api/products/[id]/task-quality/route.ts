import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getTaskQualityReport } from "@/lib/task-events";

/**
 * Task quality report for a single product.
 *
 * Sprint-3 measurement endpoint: answers "are users acting on fewer but
 * better tasks?" using TaskEvent counts. Read-only, owner-scoped.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(request.url);
    const daysParam = url.searchParams.get("days");
    const daysBack = daysParam ? Math.max(1, Math.min(365, parseInt(daysParam, 10) || 30)) : 30;

    const report = await getTaskQualityReport(id, daysBack);
    return NextResponse.json(report);
  } catch (error) {
    console.error("[task-quality] Failed:", error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
