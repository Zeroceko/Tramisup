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
  const firstName = input.name?.trim()?.split(/\s+/)[0] ?? null;
  const resetUrl = `${appUrl}/${locale}/reset-password?token=${encodeURIComponent(input.token)}`;
  const copy = getCopy(locale, resetUrl);
  const isEn = locale === "en";

  const greeting = firstName
    ? isEn ? `Hi ${firstName},` : `Merhaba ${firstName},`
    : isEn ? "Hi there," : "Merhaba,";

  const preheader = isEn
    ? "Use the link below to set a new password. Expires in 1 hour."
    : "Şifreni sıfırlamak için bağlantıya tıkla. 1 saat içinde sona erer.";

  const linkLabel = isEn
    ? "Button not working? Copy this link:"
    : "Buton çalışmıyor mu? Bu bağlantıyı kopyala:";

  const html = `<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiramisup</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f5f1; font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">

  <!-- Preheader -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f8f5f1;">${preheader}</div>

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f8f5f1;">
    <tr>
      <td align="center" style="padding:40px 16px 48px 16px;">
        <table width="560" cellpadding="0" cellspacing="0" border="0" style="max-width:560px; width:100%;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="vertical-align:middle; padding-right:8px;">
                    <img src="https://tiramisup.app/assets/illus-tiramisu-slice.png"
                         width="32" height="32" alt="Tiramisup"
                         style="display:block; width:32px; height:32px; object-fit:contain;">
                  </td>
                  <td style="vertical-align:middle;">
                    <span style="font-size:16px; font-weight:800; color:#0d0d12; letter-spacing:-0.02em;">Tiramisup</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background-color:#ffffff; border-radius:20px; border:1px solid #e8e8e8; overflow:hidden; box-shadow:0 2px 12px rgba(13,13,18,0.06);">

              <!-- Teal accent bar -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="background:linear-gradient(90deg,#95dbda 0%,#b8e8e7 60%,#d4f0ef 100%); height:3px; font-size:0; line-height:0;">&nbsp;</td>
                </tr>
              </table>

              <!-- Content -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:40px 40px 32px 40px;">

                    <!-- Greeting -->
                    <p style="margin:0 0 6px 0; font-size:13px; color:#8a8fa0;">${greeting}</p>

                    <!-- Heading -->
                    <h1 style="margin:0 0 14px 0; font-size:26px; font-weight:700; color:#0d0d12; letter-spacing:-0.02em; line-height:1.25;">${copy.heading}</h1>

                    <!-- Body -->
                    <p style="margin:0 0 28px 0; font-size:14px; line-height:1.7; color:#666d80;">${copy.body}</p>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0d0d12; border-radius:100px;">
                          <a href="${copy.resetUrl}" target="_blank"
                             style="display:block; padding:15px 32px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:-0.01em;">
                            ${copy.cta} &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>

                <!-- Fallback link -->
                <tr>
                  <td style="padding:0 40px 32px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#f8f5f1; border-radius:12px; border:1px solid #e8e8e8; padding:14px 16px;">
                          <p style="margin:0 0 5px 0; font-size:11px; font-weight:600; letter-spacing:0.2em; color:#8a8fa0; text-transform:uppercase;">${linkLabel}</p>
                          <a href="${copy.resetUrl}" target="_blank" style="font-size:12px; color:#666d80; word-break:break-all; text-decoration:underline;">${copy.resetUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider + note -->
                <tr>
                  <td style="border-top:1px solid #e8e8e8; padding:20px 40px 28px 40px;">
                    <p style="margin:0; font-size:12px; line-height:1.6; color:#8a8fa0;">${copy.footer}</p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Copyright -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0; font-size:12px; color:#8a8fa0;">
                &copy; 2026 Tiramisup &mdash; <a href="https://tiramisup.app" target="_blank" style="color:#8a8fa0; text-decoration:underline;">tiramisup.app</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;

  const { Resend } = await import("resend");
  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: fromEmail,
    to: input.email,
    subject: copy.subject,
    html,
    text: `${greeting}\n\n${copy.body}\n\n${copy.resetUrl}\n\n${copy.footer}`,
  });
}
