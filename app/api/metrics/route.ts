import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const {
      projectId,
      date,
      dau,
      mau,
      mrr,
      activeSubscriptions,
      newSignups,
      churnedUsers,
      activationRate,
    } = data;

    // Upsert metric (update if exists for same date, create if not)
    const metric = await prisma.metric.upsert({
      where: {
        projectId_date: {
          projectId,
          date: new Date(date),
        },
      },
      update: {
        dau,
        mau,
        mrr,
        activeSubscriptions,
        newSignups,
        churnedUsers,
        activationRate,
        source: "MANUAL",
      },
      create: {
        projectId,
        date: new Date(date),
        dau,
        mau,
        mrr,
        activeSubscriptions,
        newSignups,
        churnedUsers,
        activationRate,
        source: "MANUAL",
      },
    });

    return NextResponse.json(metric, { status: 201 });
  } catch (error) {
    console.error("Error saving metric:", error);
    return NextResponse.json(
      { error: "Failed to save metric" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json({ error: "Project ID required" }, { status: 400 });
    }

    const metrics = await prisma.metric.findMany({
      where: { projectId },
      orderBy: { date: "desc" },
      take: 30,
    });

    return NextResponse.json(metrics);
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json(
      { error: "Failed to fetch metrics" },
      { status: 500 }
    );
  }
}
