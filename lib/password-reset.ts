import { createHmac, timingSafeEqual } from "crypto";
import { getAppBaseUrl } from "@/lib/app-urls";

const RESET_TOKEN_TTL_MS = 1000 * 60 * 60;

function getSecret() {
  return process.env.NEXTAUTH_SECRET || "tiramisup-reset-secret";
}

function base64UrlEncode(value: string) {
  return Buffer.from(value, "utf8").toString("base64url");
}

function base64UrlDecode(value: string) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function createSignature(userId: string, expiresAt: number, passwordHash: string) {
  return createHmac("sha256", `${getSecret()}:${passwordHash}`)
    .update(`${userId}.${expiresAt}`)
    .digest("base64url");
}

export function createPasswordResetToken(userId: string, passwordHash: string) {
  const expiresAt = Date.now() + RESET_TOKEN_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  const signature = createSignature(userId, expiresAt, passwordHash);
  return `${base64UrlEncode(payload)}.${signature}`;
}

export function verifyPasswordResetToken(token: string, passwordHash: string) {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const decodedPayload = base64UrlDecode(encodedPayload);
  const [userId, expiresAtRaw] = decodedPayload.split(".");
  const expiresAt = Number(expiresAtRaw);

  if (!userId || !expiresAt || Number.isNaN(expiresAt) || expiresAt < Date.now()) {
    return null;
  }

  const expected = createSignature(userId, expiresAt, passwordHash);
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(signature);

  if (
    expectedBuffer.length !== actualBuffer.length ||
    !timingSafeEqual(expectedBuffer, actualBuffer)
  ) {
    return null;
  }

  return { userId, expiresAt };
}

function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || "Tiramisup <onboarding@resend.dev>",
    appUrl: getAppBaseUrl(),
  };
}

function getCopy(locale: string, resetUrl: string) {
  if (locale === "tr") {
    return {
      subject: "Tiramisup — Şifre sıfırlama bağlantın",
      heading: "Şifreni sıfırla",
      body: "Şifreni sıfırlamak için aşağıdaki butona tıkla. Bu bağlantı 1 saat boyunca geçerli olacak.",
      cta: "Şifremi sıfırla",
      footer: "Bu isteği sen yapmadıysan bu email'i güvenle görmezden gelebilirsin.",
      resetUrl,
    };
  }

  return {
    subject: "Tiramisup — Your password reset link",
    heading: "Reset your password",
    body: "Use the button below to set a new password. This link will expire in 1 hour.",
    cta: "Reset password",
    footer: "If you didn't request this, you can safely ignore this email.",
    resetUrl,
  };
}

type ResetEmailInput = {
  email: string;
  name?: string | null;
  locale?: string;
  token: string;
};

export async function sendPasswordResetEmail(input: ResetEmailInput) {
  const { apiKey, fromEmail, appUrl } = getResendConfig();
  if (!apiKey) {
    console.log(`[auth] RESEND_API_KEY not configured. Password reset link for ${input.email}: ${input.token}`);
    return;
  }

  const locale = input.locale === "tr" ? "tr" : "en";
  const firstName = input.name?.trim()?.split(/\s+/)[0];
  const resetUrl = `${appUrl}/${locale}/reset-password?token=${encodeURIComponent(input.token)}`;
  const copy = getCopy(locale, resetUrl);
  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: copy.subject,
    html: `
      <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
        <h1 style="font-size:28px;line-height:1.1;margin:0 0 16px;color:#21231d;">${copy.heading}</h1>
        <p style="font-size:16px;line-height:1.6;color:#4b5563;margin:0 0 24px;">${firstName ? `${firstName}, ` : ""}${copy.body}</p>
        <a href="${copy.resetUrl}" style="display:inline-block;background:#21231d;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:600;">${copy.cta}</a>
        <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:32px 0 0;">${copy.footer}</p>
      </div>
    `,
  });
}
