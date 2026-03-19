import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, productName, launchDate, status } = await request.json();

    await prisma.user.update({
      where: { id: session.user.id },
      data: { name },
    });

    const product = await prisma.product.findFirst({
      where: { userId: session.user.id },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: productName,
          launchDate: launchDate ? new Date(launchDate) : null,
          status,
        },
      });
    }

    return NextResponse.json({ message: "Settings updated successfully" });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
