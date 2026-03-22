import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateWeeklyAdvice } from "@/lib/ai-advice";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      include: {
        _count: { select: { launchChecklists: true } },
      },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const [completedCount, highBlocked, latestMetric] = await Promise.all([
      prisma.launchChecklist.count({ where: { productId: id, completed: true } }),
      prisma.launchChecklist.count({ where: { productId: id, completed: false, priority: "HIGH" } }),
      prisma.metric.findFirst({ where: { productId: id }, orderBy: { date: "desc" } }),
    ]);

    const daysSinceMetric = latestMetric
      ? Math.floor((Date.now() - new Date(latestMetric.date).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const advice = await generateWeeklyAdvice({
      name: product.name,
      launchStatus: product.launchStatus ?? product.status,
      checklistTotal: product._count.launchChecklists,
      checklistCompleted: completedCount,
      highPriorityBlocked: highBlocked,
      daysSinceMetric,
      hasWebsite: !!product.website,
    });

    return NextResponse.json(advice);
  } catch (error) {
    console.error("Failed to generate advice:", error);
    return NextResponse.json({ error: "Failed to generate advice" }, { status: 500 });
  }
}
