import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encryptSecret } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const productId = typeof body?.productId === "string" ? body.productId : "";
    const issuerId = typeof body?.issuerId === "string" ? body.issuerId.trim() : "";
    const keyId = typeof body?.keyId === "string" ? body.keyId.trim() : "";
    const privateKey = typeof body?.privateKey === "string" ? body.privateKey.trim() : "";
    const appIdentifier =
      typeof body?.appIdentifier === "string" ? body.appIdentifier.trim() : "";

    if (!productId || !issuerId || !keyId || !privateKey) {
      return NextResponse.json(
        { error: "productId, issuerId, keyId and privateKey are required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.findFirst({
      where: { id: productId, userId: session.user.id },
      select: { id: true },
    });
    if (!product) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const integration = await prisma.integration.upsert({
      where: {
        productId_provider: {
          productId,
          provider: "APP_STORE_CONNECT",
        },
      },
      update: {
        status: "CONNECTED",
        config: JSON.stringify({
          issuerId,
          keyId,
          encryptedPrivateKey: encryptSecret(privateKey),
          appIdentifier: appIdentifier || null,
          accountDisplayName: appIdentifier || "App Store Connect key",
        }),
      },
      create: {
        productId,
        provider: "APP_STORE_CONNECT",
        status: "CONNECTED",
        config: JSON.stringify({
          issuerId,
          keyId,
          encryptedPrivateKey: encryptSecret(privateKey),
          appIdentifier: appIdentifier || null,
          accountDisplayName: appIdentifier || "App Store Connect key",
        }),
      },
    });

    await prisma.timelineEvent.create({
      data: {
        productId,
        eventType: "INTEGRATION_CONNECTED",
        title: "App Store Connect connected",
        date: new Date(),
      },
    });

    return NextResponse.json(integration, { status: 201 });
  } catch (error) {
    console.error("App Store Connect setup failed:", error);
    return NextResponse.json(
      { error: "Failed to connect App Store Connect" },
      { status: 500 }
    );
  }
}
