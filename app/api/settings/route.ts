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

    const { name, productName, launchDate, status, preferredLocale } = await request.json();
    const safeLocale = preferredLocale === "en" || preferredLocale === "tr" ? preferredLocale : undefined;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(safeLocale ? { preferredLocale: safeLocale } : {}),
      },
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

    const response = NextResponse.json({ message: "Settings updated successfully" });
    if (safeLocale) {
      response.cookies.set("NEXT_LOCALE", safeLocale, {
        path: "/",
        maxAge: 60 * 60 * 24 * 365,
      });
    }
    return response;
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
