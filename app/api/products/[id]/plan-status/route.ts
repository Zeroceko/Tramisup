import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    select: { planMeta: true },
  });

  if (!product) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let step = "pending";
  if (product.planMeta) {
    try {
      const meta = JSON.parse(product.planMeta as string);
      step = typeof meta?.step === "string" ? meta.step : "pending";
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ step });
}
