import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { validateGa4, validateStripe } from "@/lib/source-validation";

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { product: { select: { userId: true } } },
    });

    if (!integration || integration.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (integration.status !== "CONNECTED") {
      return NextResponse.json(
        { error: "Integration is not connected" },
        { status: 400 }
      );
    }

    let result;
    if (integration.provider === "GA4") {
      result = await validateGa4(id);
    } else if (integration.provider === "STRIPE") {
      result = await validateStripe(id);
    } else {
      return NextResponse.json(
        { error: "Validation not supported for this provider" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Validation error:", error);
    return NextResponse.json(
      { error: "Validation failed" },
      { status: 500 }
    );
  }
}
