import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 });
    }

    const clientId = process.env.STRIPE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "STRIPE_CLIENT_ID not configured locally." }, { status: 500 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3002";
    const redirectUri = `${baseUrl}/api/integrations/stripe/callback`;

    // Encode contextual data
    const state = Buffer.from(JSON.stringify({ productId, userId: session.user.id })).toString('base64');

    const authUrl = `https://connect.stripe.com/oauth/authorize?response_type=code` +
      `&client_id=${clientId}` +
      `&scope=read_only` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&state=${state}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Stripe Link Error:", error);
    return NextResponse.json({ error: "Failed to generate Stripe OAuth link" }, { status: 500 });
  }
}
