import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createPasswordResetToken, sendPasswordResetEmail } from "@/lib/password-reset";
import { checkRateLimit, getRequestIpFromHeaders } from "@/lib/rate-limit";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: Request) {
  const ip = getRequestIpFromHeaders(request);
  const rl = checkRateLimit(`forgot-password:${ip}`, 3, 15 * 60 * 1000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(rl.retryAfterMs / 1000)) } },
    );
  }

  try {
    const { email, locale } = await request.json();

    if (!email || typeof email !== "string" || !isValidEmail(email.trim().toLowerCase())) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, preferredLocale: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    const rawToken = createPasswordResetToken(user.id, user.passwordHash);

    await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      locale: locale === "tr" ? "tr" : user.preferredLocale,
      token: rawToken,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth] forgot-password error:", error);
    return NextResponse.json({ error: "Failed to create reset request" }, { status: 500 });
  }
}
