import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVerificationToken, sendUserVerificationEmail } from "@/lib/email-verification";

export async function POST(request: Request) {
  try {
    const { email, locale = "en" } = await request.json() as { email?: string; locale?: string };

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.trim().toLowerCase() },
      select: { id: true, email: true, emailVerified: true, name: true },
    });

    // Always return 200 to avoid email enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    const token = generateVerificationToken();
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: token },
    });

    await sendUserVerificationEmail({ email: user.email, name: user.name, token, locale });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[resend-verification]", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
