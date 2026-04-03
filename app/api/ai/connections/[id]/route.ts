import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { AIMode } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const connection = await prisma.aIConnection.findUnique({
      where: { id },
      select: { id: true, userId: true },
    });

    if (!connection || connection.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.productAISettings.updateMany({
        where: { selectedConnectionId: id },
        data: {
          selectedConnectionId: null,
          mode: AIMode.PLATFORM_DEFAULT,
        },
      }),
      prisma.aIConnection.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Failed to delete AI connection:", error);
    return NextResponse.json({ error: "Failed to delete AI connection" }, { status: 500 });
  }
}
