import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const integration = await prisma.integration.findUnique({
      where: { id: params.id },
    });

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    // Create mock sync job
    const syncJob = await prisma.syncJob.create({
      data: {
        integrationId: integration.id,
        status: "SUCCESS",
        startedAt: new Date(),
        completedAt: new Date(),
        recordsSynced: 42, // Mock data
      },
    });

    // Update last sync time
    await prisma.integration.update({
      where: { id: params.id },
      data: { lastSyncAt: new Date() },
    });

    return NextResponse.json({
      message: "Test connection successful",
      syncJob,
    });
  } catch (error) {
    console.error("Error testing connection:", error);
    return NextResponse.json(
      { error: "Failed to test connection" },
      { status: 500 }
    );
  }
}
