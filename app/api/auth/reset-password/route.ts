import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isStrongPassword } from "@/lib/password-rules";
import { verifyPasswordResetToken } from "@/lib/password-reset";

export async function POST(request: Request) {
  try {
    const { token, password } = await request.json();

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid reset token" }, { status: 400 });
    }

    if (!password || typeof password !== "string" || !isStrongPassword(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters and include a number and a special character." },
        { status: 400 }
      );
    }

    const segments = token.split(".");
    if (segments.length !== 2) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    const encodedPayload = segments[0];
    const decodedPayload = Buffer.from(encodedPayload, "base64url").toString("utf8");
    const [userId] = decodedPayload.split(".");

    if (!userId) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    const verified = verifyPasswordResetToken(token, user.passwordHash);

    if (!verified || verified.userId !== user.id) {
      return NextResponse.json({ error: "This reset link is invalid or expired." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[auth] reset-password error:", error);
    return NextResponse.json({ error: "Failed to reset password" }, { status: 500 });
  }
}
