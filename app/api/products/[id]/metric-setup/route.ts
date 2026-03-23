import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { SavedMetricSetup } from "@/lib/metric-setup";
import { parseSavedMetricSetup } from "@/lib/metric-setup";

function isValidSetup(input: unknown): input is SavedMetricSetup {
  if (!input || typeof input !== "object") return false;
  const setup = input as SavedMetricSetup;
  return [2, 3].includes(setup.version) && Array.isArray(setup.selections) && Array.isArray(setup.entries);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true, launchGoals: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await request.json();
    if (!isValidSetup(body?.setup)) {
      return NextResponse.json({ error: "Invalid setup payload" }, { status: 400 });
    }

    const existing = parseSavedMetricSetup(product.launchGoals);

    await prisma.product.update({
      where: { id },
      data: {
        launchGoals: JSON.stringify({
          version: existing?.founderSummary ? 3 : 2,
          selections: body.setup.selections,
          entries: existing?.entries ?? [],
          ...(existing?.platforms?.length ? { platforms: existing.platforms } : {}),
          ...(existing?.founderSummary ? { founderSummary: existing.founderSummary } : {}),
        } satisfies SavedMetricSetup),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to save metric setup:", error);
    return NextResponse.json({ error: "Failed to save metric setup" }, { status: 500 });
  }
}
