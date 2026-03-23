import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parseSavedMetricSetup, type FunnelStageKey, type SavedMetricSetup } from "@/lib/metric-setup";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const { productId, date, values } = data as {
      productId: string;
      date: string;
      values: Partial<Record<FunnelStageKey, number>>;
    };

    if (!productId || !date || !values || typeof values !== "object") {
      return NextResponse.json({ error: "productId, date ve values zorunlu" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true, launchGoals: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const existing = parseSavedMetricSetup(product.launchGoals);
    if (!existing) {
      return NextResponse.json({ error: "Önce metrik setup'ını oluştur" }, { status: 400 });
    }

    const sanitizedValues = Object.fromEntries(
      Object.entries(values)
        .filter(([, value]) => value !== null && value !== undefined && !Number.isNaN(Number(value)))
        .map(([key, value]) => [key, Number(value)])
    ) as Partial<Record<FunnelStageKey, number>>;

    const nextEntries = existing.entries.filter((entry) => entry.date !== date);
    nextEntries.push({ date, values: sanitizedValues });
    nextEntries.sort((a, b) => a.date.localeCompare(b.date));

    const nextPayload: SavedMetricSetup = {
      version: existing.founderSummary ? 3 : 2,
      selections: existing.selections,
      entries: nextEntries,
      ...(existing.platforms?.length ? { platforms: existing.platforms } : {}),
      ...(existing.founderSummary ? { founderSummary: existing.founderSummary } : {}),
    };

    await prisma.product.update({
      where: { id: productId },
      data: { launchGoals: JSON.stringify(nextPayload) },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving metric setup entry:", error);
    return NextResponse.json({ error: "Failed to save metrics" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { launchGoals: true },
    });

    const setup = parseSavedMetricSetup(product?.launchGoals);
    return NextResponse.json({ entries: setup?.entries ?? [], selections: setup?.selections ?? [] });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
