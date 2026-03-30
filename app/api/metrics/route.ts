import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { FunnelStageKey } from "@/lib/metric-setup";
import { saveMetricEntry } from "@/lib/metric-setup";

const DECIMAL_METRIC_KEYS = new Set(["mrr", "arpu"]);

function stageAllowsDecimals(stage: FunnelStageKey, metricKey: string | null | undefined) {
  return stage === "Revenue" && !!metricKey && DECIMAL_METRIC_KEYS.has(metricKey);
}

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
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const setup = await prisma.metricSetup.findUnique({
      where: { productId },
      select: {
        selections: true,
      },
    });
    if (!setup) {
      return NextResponse.json({ error: "Önce metrik setup'ını oluştur" }, { status: 400 });
    }

    const selections =
      (setup.selections as Array<{ stage: FunnelStageKey; selectedMetricKeys: string[] }>) ?? [];
    const selectedMetricKeyByStage = new Map(
      selections.map((selection) => [selection.stage, selection.selectedMetricKeys[0] ?? null] as const)
    );

    for (const [stageKey, value] of Object.entries(values)) {
      const numericValue = Number(value);
      const stage = stageKey as FunnelStageKey;

      if (Number.isNaN(numericValue) || numericValue < 0) {
        return NextResponse.json({ error: "Geçersiz metrik değeri" }, { status: 400 });
      }

      if (!stageAllowsDecimals(stage, selectedMetricKeyByStage.get(stage)) && !Number.isInteger(numericValue)) {
        return NextResponse.json(
          { error: `${stage} aşaması için yalnızca tam sayı kaydedebilirsin.` },
          { status: 400 }
        );
      }
    }

    const sanitizedValues = Object.fromEntries(
      Object.entries(values)
        .filter(([, value]) => value !== null && value !== undefined && !Number.isNaN(Number(value)))
        .map(([key, value]) => [key, Number(value)])
    ) as Partial<Record<FunnelStageKey, number>>;

    await saveMetricEntry(productId, date, sanitizedValues);

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    console.error("Error saving metric entry:", error);
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
      select: { id: true },
    });

    if (!product) {
      return NextResponse.json({ error: "Ürün bulunamadı" }, { status: 404 });
    }

    const setup = await prisma.metricSetup.findUnique({
      where: { productId },
      include: {
        entries: { orderBy: { date: "asc" } },
      },
    });

    const selections = (setup?.selections as Array<{ stage: string; selectedMetricKeys: string[] }>) ?? [];
    const entries = (setup?.entries ?? []).map((e) => ({
      date: e.date.toISOString().slice(0, 10),
      values: e.values as Partial<Record<FunnelStageKey, number>>,
    }));

    return NextResponse.json({ entries, selections });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500 });
  }
}
