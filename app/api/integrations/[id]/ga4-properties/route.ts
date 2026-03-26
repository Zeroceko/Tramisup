import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { listGa4Properties } from "@/lib/ga4-admin";

async function getOwnedGa4Integration(id: string, userId: string) {
  const integration = await prisma.integration.findUnique({
    where: { id },
    include: { product: true },
  });

  if (!integration || integration.product.userId !== userId) {
    return null;
  }

  if (integration.provider !== "GA4") {
    throw new Error("Integration is not a GA4 connection");
  }

  if (!integration.config) {
    throw new Error("Missing integration configuration");
  }

  return integration;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const integration = await getOwnedGa4Integration(id, session.user.id);

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const config = JSON.parse(integration.config!) as {
      propertyId?: string;
      propertyDisplayName?: string;
    };
    const properties = await listGa4Properties(integration.config!);

    return NextResponse.json({
      properties,
      selectedPropertyId: config.propertyId ?? null,
      selectedPropertyDisplayName: config.propertyDisplayName ?? null,
    });
  } catch (error) {
    console.error("Error listing GA4 properties:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to list GA4 properties" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await context.params;
    const integration = await getOwnedGa4Integration(id, session.user.id);

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 });
    }

    const body = await request.json();
    const propertyId = typeof body.propertyId === "string" ? body.propertyId : "";

    if (!propertyId) {
      return NextResponse.json({ error: "Property ID is required" }, { status: 400 });
    }

    const properties = await listGa4Properties(integration.config!);
    const selectedProperty = properties.find((property) => property.propertyId === propertyId);

    if (!selectedProperty) {
      return NextResponse.json({ error: "Selected GA4 property not found" }, { status: 404 });
    }

    const currentConfig = JSON.parse(integration.config!) as Record<string, unknown>;
    const nextConfig = {
      ...currentConfig,
      propertyId: selectedProperty.propertyId,
      propertyName: selectedProperty.propertyName,
      propertyDisplayName: selectedProperty.propertyDisplayName,
      accountName: selectedProperty.accountName,
      accountDisplayName: selectedProperty.accountDisplayName,
    };

    await prisma.integration.update({
      where: { id: integration.id },
      data: {
        config: JSON.stringify(nextConfig),
      },
    });

    return NextResponse.json({
      propertyId: selectedProperty.propertyId,
      propertyDisplayName: selectedProperty.propertyDisplayName,
      accountDisplayName: selectedProperty.accountDisplayName,
    });
  } catch (error) {
    console.error("Error saving GA4 property:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to save GA4 property" },
      { status: 500 },
    );
  }
}
