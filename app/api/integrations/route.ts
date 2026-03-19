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

    const { productId, provider, apiKey } = await request.json();

    const integration = await prisma.integration.upsert({
      where: {
        productId_provider: {
          productId,
          provider,
        },
      },
      update: {
        status: "CONNECTED",
        config: JSON.stringify({ apiKey }),
      },
      create: {
        productId,
        provider,
        status: "CONNECTED",
        config: JSON.stringify({ apiKey }),
      },
    });

    await prisma.timelineEvent.create({
      data: {
        productId,
        eventType: "INTEGRATION_CONNECTED",
        title: `${provider} connected`,
        date: new Date(),
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error("Error connecting integration:", error);
    return NextResponse.json(
      { error: "Failed to connect integration" },
      { status: 500 }
    );
  }
}
