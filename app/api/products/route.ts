import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { seedProductData } from "@/lib/seed";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      where: { userId: session.user.id },
      select: {
        id: true,
        name: true,
        status: true,
        category: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Failed to fetch products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      category,
      description,
      targetAudience,
      businessModel,
      website,
      launchGoals,
      seedData = false,
    } = body;

    // Validate required fields (description is optional)
    if (!name || !category || !targetAudience || !businessModel) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400 }
      );
    }

    // Create product
    const product = await prisma.product.create({
      data: {
        userId: session.user.id,
        name,
        status: "PRE_LAUNCH",
        category,
        description,
        targetAudience,
        businessModel,
        website: website || null,
        launchGoals: launchGoals ? JSON.stringify(launchGoals) : null,
      },
    });

    // Optionally seed demo data
    if (seedData) {
      await seedProductData(product.id);
    }

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error("Failed to create product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
