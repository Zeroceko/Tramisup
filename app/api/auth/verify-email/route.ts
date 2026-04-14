import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAppBaseUrl } from "@/lib/app-urls";
import { createVerificationAutoLoginToken } from "@/lib/verification-autologin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");
  const type = searchParams.get("type"); // "user" | "waitlist"
  const localeParam = searchParams.get("locale");
  const safeLocale = localeParam === "tr" ? "tr" : "en";
  const base = getAppBaseUrl();

  if (!token) {
    return NextResponse.redirect(`${base}/${safeLocale}/verify-email?error=missing_token&type=${type === "waitlist" ? "waitlist" : "user"}`);
  }

  // ── User verification ──────────────────────────────────────────────────────
  if (type !== "waitlist") {
    const user = await prisma.user.findUnique({
      where: { verificationToken: token },
      select: { id: true, email: true, preferredLocale: true },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date(), verificationToken: null },
      });
      const locale = user.preferredLocale === "tr" ? "tr" : "en";
      const verificationLoginToken = createVerificationAutoLoginToken(user.email, user.id);
      const nextSearch = new URLSearchParams({
        verified: "1",
        email: user.email,
      });

      if (verificationLoginToken) {
        nextSearch.set("verificationLoginToken", verificationLoginToken);
        nextSearch.set("callbackUrl", `/${locale}/dashboard`);
      }

      return NextResponse.redirect(`${base}/${locale}/login?${nextSearch.toString()}`);
    }
  }

  // ── Waitlist verification ──────────────────────────────────────────────────
  if (type !== "user") {
    const entry = await prisma.waitlist.findUnique({
      where: { verificationToken: token },
      select: { id: true },
    });

    if (entry) {
      await prisma.waitlist.update({
        where: { id: entry.id },
        data: { emailVerifiedAt: new Date(), verificationToken: null },
      });
      return NextResponse.redirect(`${base}/${safeLocale}/waitlist/thank-you?verified=1`);
    }
  }

  return NextResponse.redirect(`${base}/${safeLocale}/verify-email?error=invalid_token&type=${type === "waitlist" ? "waitlist" : "user"}`);
}
