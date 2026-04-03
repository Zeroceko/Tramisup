import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOAuthCallbackBaseUrl } from "@/lib/app-urls";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");
    const locale = searchParams.get("locale") || "tr";

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.json({ error: "GOOGLE_CLIENT_ID is not configured." }, { status: 500 });
    }

    const state = Buffer.from(
      JSON.stringify({
        flow: "ai_connection",
        userId: session.user.id,
        productId,
        locale,
      })
    ).toString("base64");

    const authUrl =
      "https://accounts.google.com/o/oauth2/v2/auth?" +
      `client_id=${encodeURIComponent(clientId)}` +
      `&redirect_uri=${encodeURIComponent(`${getOAuthCallbackBaseUrl()}/api/ai/connections/google/callback`)}` +
      "&response_type=code" +
      `&scope=${encodeURIComponent("openid email profile https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/generative-language.retriever")}` +
      "&access_type=offline" +
      "&prompt=consent" +
      `&state=${encodeURIComponent(state)}`;

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error("Google AI Link Error:", error);
    return NextResponse.json({ error: "Failed to generate Google AI OAuth link" }, { status: 500 });
  }
}
