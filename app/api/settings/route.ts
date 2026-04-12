import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  deriveProductStatusFromLaunchStage,
  normalizeLaunchStageKey,
} from "@/lib/launch-stage";

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
      projectName,
      description,
      website,
      category,
      targetAudience,
      businessModel,
      launchStageKey,
      launchStatus,
      growthGoal,
      goalKey,
      contextLinks,
      launchDate,
      status,
      preferredLocale,
    } = await request.json();
    const safeLocale = preferredLocale === "en" || preferredLocale === "tr" ? preferredLocale : undefined;
    const nextLaunchStageKey = normalizeLaunchStageKey(launchStageKey ?? launchStatus);
    const nextProductName =
      typeof productName === "string" && productName.trim().length > 0
        ? productName.trim()
        : typeof projectName === "string" && projectName.trim().length > 0
          ? projectName.trim()
          : undefined;

    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: session.user.id },
        data: {
          name,
          ...(safeLocale ? { preferredLocale: safeLocale } : {}),
        },
        select: {
          id: true,
          name: true,
          email: true,
          preferredLocale: true,
        },
      });

      const product = await tx.product.findFirst({
        where: { userId: session.user.id, ...(productId ? { id: productId } : {}) },
      });

      let savedProduct: {
        id: string;
        name: string;
        description: string | null;
        website: string | null;
        category: string | null;
        targetAudience: string | null;
        businessModel: string | null;
        launchStatus: string | null;
        status: string;
        launchDate: Date | null;
        launchGoals: string | null;
      } | null = null;

      if (product) {
        const existingLaunchGoals = (() => {
          if (!product.launchGoals) return {};
          try {
            return JSON.parse(product.launchGoals) as Record<string, unknown>;
          } catch {
            return {};
          }
        })();

        savedProduct = await tx.product.update({
          where: { id: product.id },
          data: {
            ...(nextProductName ? { name: nextProductName } : {}),
            description,
            website,
            category,
            targetAudience,
            businessModel,
            ...(nextLaunchStageKey ? { launchStatus: nextLaunchStageKey } : {}),
            launchDate: launchDate ? new Date(launchDate) : null,
            status: nextLaunchStageKey
              ? deriveProductStatusFromLaunchStage(nextLaunchStageKey)
              : status,
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
          select: {
            id: true,
            name: true,
            description: true,
            website: true,
            category: true,
            targetAudience: true,
            businessModel: true,
            launchStatus: true,
            status: true,
            launchDate: true,
            launchGoals: true,
          },
        });
      }

      return { user, product: savedProduct };
    });

    const response = NextResponse.json({
      message: "Settings updated successfully",
      user: result.user,
      product: result.product,
    });
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
