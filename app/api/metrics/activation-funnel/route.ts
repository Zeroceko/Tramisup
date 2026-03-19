import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const latestDate = await prisma.activationFunnel.findFirst({
      where: { productId },
      orderBy: { date: "desc" },
      select: { date: true },
    });

    if (!latestDate) {
      return NextResponse.json([]);
    }

    const funnelData = await prisma.activationFunnel.findMany({
      where: {
        productId,
        date: latestDate.date,
      },
      orderBy: { step: "asc" },
    });

    return NextResponse.json(funnelData);
  } catch (error) {
    console.error("Error fetching funnel data:", error);
    return NextResponse.json(
      { error: "Failed to fetch funnel data" },
      { status: 500 }
    );
  }
}
