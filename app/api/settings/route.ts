import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function deriveProductStatus(launchStatus?: string) {
  if (launchStatus === "Büyüme aşamasında") return "GROWING" as const;
  if (launchStatus === "Yayında") return "LAUNCHED" as const;
  return "PRE_LAUNCH" as const;
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      productId,
      name,
      productName,
      description,
      website,
      category,
      targetAudience,
      businessModel,
      launchStatus,
      growthGoal,
      goalKey,
      contextLinks,
      launchDate,
      status,
      preferredLocale,
    } = await request.json();
    const safeLocale = preferredLocale === "en" || preferredLocale === "tr" ? preferredLocale : undefined;

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        ...(safeLocale ? { preferredLocale: safeLocale } : {}),
      },
    });

    const product = await prisma.product.findFirst({
      where: { userId: session.user.id, ...(productId ? { id: productId } : {}) },
    });

    if (product) {
      const existingLaunchGoals = (() => {
        if (!product.launchGoals) return {};
        try {
          return JSON.parse(product.launchGoals) as Record<string, unknown>;
        } catch {
          return {};
        }
      })();

      await prisma.product.update({
        where: { id: product.id },
        data: {
          name: productName,
          description,
          website,
          category,
          targetAudience,
          businessModel,
          launchStatus,
          launchDate: launchDate ? new Date(launchDate) : null,
          status: launchStatus ? deriveProductStatus(launchStatus) : status,
          launchGoals: JSON.stringify({
            ...existingLaunchGoals,
            ...(typeof growthGoal === "string" ? { growthGoal } : {}),
            ...(typeof goalKey === "string" ? { goalKey } : {}),
            contextLinks:
              typeof contextLinks === "string"
                ? contextLinks
                    .split("\n")
                    .map((item) => item.trim())
                    .filter(Boolean)
                : Array.isArray(contextLinks)
                  ? contextLinks
                  : [],
          }),
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
