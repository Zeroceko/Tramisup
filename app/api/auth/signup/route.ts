import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { isStrongPassword } from "@/lib/password-rules";
import { getRequestIp, verifyRecaptchaToken } from "@/lib/recaptcha";
import { createSignupBypassToken } from "@/lib/signup-bypass";

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
  let locale = "tr";

  try {
    const { name, email, password, accessCode, locale: requestLocale = "tr", captchaToken } =
      await request.json();
    locale = requestLocale === "en" ? "en" : "tr";
    const t = locale === "en"
      ? {
          required: "Email and password are required",
          weakPassword:
            "Password must be at least 8 characters and include at least 1 number and 1 special character",
          accessCodeRequired: "Early access code is required",
          invalidAccessCode: "Invalid early access code",
          existingUser: "This email address is already registered",
          created: "Account created",
          serverError: "Server error, please try again",
          captchaRequired: "Please complete the reCAPTCHA check.",
          captchaFailed: "reCAPTCHA verification failed. Please try again.",
        }
      : {
          required: "Email ve şifre zorunludur",
          weakPassword:
            "Şifre en az 8 karakter olmalı; en az 1 sayı ve 1 özel karakter içermelidir",
          accessCodeRequired: "Erken erişim kodu gereklidir",
          invalidAccessCode: "Geçersiz erken erişim kodu",
          existingUser: "Bu e-posta adresi zaten kayıtlı",
          created: "Hesap oluşturuldu",
          serverError: "Sunucu hatası, lütfen tekrar deneyin",
          captchaRequired: "Lütfen reCAPTCHA doğrulamasını tamamla.",
          captchaFailed: "reCAPTCHA doğrulaması başarısız oldu. Lütfen tekrar dene.",
        };

    const recaptchaResult = await verifyRecaptchaToken({
      token: captchaToken,
      remoteIp: getRequestIp(request),
    });

    if (!recaptchaResult.success) {
      const error =
        recaptchaResult.error === "recaptcha_required"
          ? t.captchaRequired
          : t.captchaFailed;

      return NextResponse.json({ error }, { status: 400 });
    }

    if (!email || !password) {
      return NextResponse.json({ error: t.required }, { status: 400 });
    }

    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: t.weakPassword }, { status: 400 });
    }

    if (!accessCode) {
      return NextResponse.json({ error: t.accessCodeRequired }, { status: 400 });
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
      return NextResponse.json({ error: t.invalidAccessCode }, { status: 400 });
    }

    const existingUser = await withDbRetry(() =>
      prisma.user.findUnique({ where: { email } })
    );
    if (existingUser) {
      return NextResponse.json({ error: t.existingUser }, { status: 400 });
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
      {
        message: t.created,
        userId: user.id,
        loginBypassToken: createSignupBypassToken(email),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      {
        error:
          locale === "en"
            ? "Server error, please try again"
            : "Sunucu hatası, lütfen tekrar deneyin",
      },
      { status: 500 },
    );
  }
}
