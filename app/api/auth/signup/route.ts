import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EARLY_ACCESS_CODE = process.env.EARLY_ACCESS_CODE || "TT31623SEN";

export async function POST(request: Request) {
  try {
    const { name, email, password, accessCode } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email ve şifre zorunludur" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Şifre en az 8 karakter olmalıdır" },
        { status: 400 }
      );
    }

    if (!accessCode) {
      return NextResponse.json(
        { error: "Erken erişim kodu gereklidir" },
        { status: 400 }
      );
    }

    const normalizedCode = accessCode.toUpperCase();

    // Fallback: check if code matches the static fallback code
    const isValidFallbackCode = normalizedCode === EARLY_ACCESS_CODE;

    // Check if code matches a DB invite code (non-blocking — fallback still works if DB lookup fails)
    let inviteCodeEntry = null;
    try {
      inviteCodeEntry = await prisma.waitlist.findFirst({
        where: { inviteCode: normalizedCode },
      });
    } catch (lookupErr) {
      console.error("Waitlist lookup failed, falling back to static code:", lookupErr);
    }

    // Code must match either a DB code or the fallback code
    if (!inviteCodeEntry && !isValidFallbackCode) {
      return NextResponse.json(
        { error: "Geçersiz erken erişim kodu" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, name: name || email.split("@")[0], passwordHash },
    });

    // Mark DB invite code as used (best-effort — user is already created)
    if (inviteCodeEntry) {
      prisma.waitlist
        .update({
          where: { id: inviteCodeEntry.id },
          data: { inviteCodeUsedAt: new Date() },
        })
        .catch((err) => console.error("Failed to mark invite code as used:", err));
    }

    return NextResponse.json(
      { message: "Hesap oluşturuldu", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası, lütfen tekrar deneyin" },
      { status: 500 }
    );
  }
}
