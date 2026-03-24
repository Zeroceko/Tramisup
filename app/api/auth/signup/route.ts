import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

const EARLY_ACCESS_CODE = process.env.EARLY_ACCESS_CODE || "TT31623SEN";

function isPoolLimitError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return /MaxClientsInSessionMode|max clients reached|pool_size/i.test(message);
}

async function withDbRetry<T>(operation: () => Promise<T>, attempts = 3): Promise<T> {
  let lastError: unknown;

  for (let index = 0; index < attempts; index += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (!isPoolLimitError(error) || index === attempts - 1) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * (index + 1)));
    }
  }

  throw lastError;
}

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
    const isValidFallbackCode = normalizedCode === EARLY_ACCESS_CODE;

    let inviteCodeEntry = null;

    if (!isValidFallbackCode) {
      try {
        inviteCodeEntry = await withDbRetry(() =>
          prisma.waitlist.findFirst({
            where: { inviteCode: normalizedCode },
          })
        );
      } catch (lookupErr) {
        console.error("Waitlist lookup failed, falling back to static code:", lookupErr);
      }
    }

    if (!inviteCodeEntry && !isValidFallbackCode) {
      return NextResponse.json(
        { error: "Geçersiz erken erişim kodu" },
        { status: 400 }
      );
    }

    const existingUser = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email } })
    );
    if (existingUser) {
      return NextResponse.json(
        { error: "Bu e-posta adresi zaten kayıtlı" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await withDbRetry(() =>
      prisma.user.create({
        data: { email, name: name || email.split("@")[0], passwordHash },
      })
    );

    if (inviteCodeEntry) {
      withDbRetry(() =>
        prisma.waitlist.update({
          where: { id: inviteCodeEntry.id },
          data: { inviteCodeUsedAt: new Date() },
        })
      )
        .catch((err) => console.error("Failed to mark invite code as used:", err));
    }

    return NextResponse.json(
      { message: "Hesap oluşturuldu", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Sunucu hatası, lütfen tekrar deneyin", details: (error as Error).message || String(error) },
      { status: 500 }
    );
  }
}
