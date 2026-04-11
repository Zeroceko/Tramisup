import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncWaitlistLeadToResend } from "@/lib/resend-waitlist"
import { getRequestIp, verifyRecaptchaToken } from "@/lib/recaptcha"
import { generateVerificationToken, sendWaitlistVerificationEmail } from "@/lib/email-verification"

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isValidEmail(email: string): boolean {
  return emailRegex.test(email.trim().toLowerCase())
}

export async function POST(request: Request) {
  try {
    const { email, name, source = "landing", locale = "en", captchaToken } = await request.json()
    const t =
      locale === "tr"
        ? {
            emailRequired: "Email gerekli",
            invalidEmail: "Geçersiz email formatı",
            alreadyJoined: "Bu email zaten listede",
            thankYou: "Listeye katıldığın için teşekkürler!",
            failed: "Waitlist'e katılırken bir hata oluştu",
            captchaRequired: "Lütfen reCAPTCHA doğrulamasını tamamla.",
            captchaFailed: "reCAPTCHA doğrulaması başarısız oldu. Lütfen tekrar dene.",
          }
        : {
            emailRequired: "Email is required",
            invalidEmail: "Invalid email format",
            alreadyJoined: "Email already in waitlist",
            thankYou: "Thank you for joining the waitlist!",
            failed: "Failed to join waitlist",
            captchaRequired: "Please complete the reCAPTCHA check.",
            captchaFailed: "reCAPTCHA verification failed. Please try again.",
          }

    const recaptchaResult = await verifyRecaptchaToken({
      token: captchaToken,
      remoteIp: getRequestIp(request),
    })

    if (!recaptchaResult.success) {
      return NextResponse.json(
        {
          error:
            recaptchaResult.error === "recaptcha_required"
              ? t.captchaRequired
              : t.captchaFailed,
        },
        { status: 400 }
      )
    }

    // Validate email
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { error: t.emailRequired },
        { status: 400 }
      )
    }

    const cleanEmail = email.trim().toLowerCase()
    if (!isValidEmail(cleanEmail)) {
      return NextResponse.json(
        { error: t.invalidEmail },
        { status: 400 }
      )
    }

    // Check if already in waitlist
    const existing = await prisma.waitlist.findUnique({
      where: { email: cleanEmail },
    })

    if (existing) {
      return NextResponse.json(
        { error: t.alreadyJoined },
        { status: 409 }
      )
    }

    const verificationToken = generateVerificationToken()

    // Create waitlist entry
    const entry = await prisma.waitlist.create({
      data: {
        email: cleanEmail,
        name: name || null,
        source,
        status: "PENDING",
        verificationToken,
      },
    })

    await Promise.allSettled([
      syncWaitlistLeadToResend({
        email: cleanEmail,
        name: name || null,
        source,
        locale,
      }),
      sendWaitlistVerificationEmail({
        email: cleanEmail,
        name: name || null,
        token: verificationToken,
        locale,
      }),
    ])

    return NextResponse.json(
      {
        success: true,
        message: t.thankYou,
        email: entry.email,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Error in POST /api/waitlist/join:", error)
    return NextResponse.json(
      { error: "Failed to join waitlist" },
      { status: 500 }
    )
  }
}
