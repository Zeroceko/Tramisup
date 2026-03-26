import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;

    const integration = await prisma.integration.findUnique({
      where: { id },
      include: { product: true },
    });

    if (!integration || integration.product.userId !== session.user.id) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    await prisma.integration.update({
      where: { id },
      data: {
        status: "DISCONNECTED",
        config: null,
        lastSyncAt: null,
      },
    });

    return NextResponse.json({ message: "Integration disconnected" });
  } catch (error) {
    console.error("Error disconnecting integration:", error);
    return NextResponse.json(
      { error: "Failed to disconnect integration" },
      { status: 500 }
    );
  }
}
