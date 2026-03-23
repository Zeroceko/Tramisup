import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFounderCoachContext } from "@/lib/founder-coach-context";
import { getFounderCoachAnswer, getFounderCoachSuggestion } from "@/lib/founder-coach";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(request.url);
    const eventType = url.searchParams.get("event") ?? undefined;
    const context = await getFounderCoachContext(id, eventType ? { type: eventType } : undefined);
    const suggestion = await getFounderCoachSuggestion(context);

    return NextResponse.json(suggestion);
  } catch (error) {
    console.error("Failed to generate founder-coach suggestion:", error);
    return NextResponse.json({ error: "Failed to generate suggestion" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { id, userId: session.user.id },
      select: { id: true },
    });
    if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const body = await request.json();
    const message = String(body?.message ?? "").trim();
    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const eventType = body?.recentEvent?.type ? String(body.recentEvent.type) : undefined;
    const context = await getFounderCoachContext(id, eventType ? { type: eventType } : undefined);
    const answer = await getFounderCoachAnswer(context, message);

    return NextResponse.json(answer);
  } catch (error) {
    console.error("Failed to generate founder-coach answer:", error);
    return NextResponse.json({ error: "Failed to generate answer" }, { status: 500 });
  }
}
