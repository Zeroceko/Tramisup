import { randomBytes } from "crypto";
import { getAppBaseUrl } from "@/lib/app-urls";

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  // Dynamic import to avoid loading Resend when key is absent
  return import("resend").then(({ Resend }) => new Resend(apiKey));
}

function getFrom() {
  return process.env.RESEND_FROM_EMAIL || "Tiramisup <onboarding@resend.dev>";
}

// ─── User: signup verification ────────────────────────────────────────────────

export async function sendUserVerificationEmail(params: {
  email: string;
  name?: string | null;
  token: string;
  locale: string;
}) {
  const { email, name, token, locale } = params;
  const isEn = locale === "en";
  const baseUrl = getAppBaseUrl();
  const safeLocale = locale === "tr" ? "tr" : "en";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&type=user&locale=${safeLocale}`;

  const firstName = name?.trim().split(/\s+/)[0] ?? null;
  const greeting = firstName
    ? isEn ? `Hi ${firstName},` : `Merhaba ${firstName},`
    : isEn ? "Hi there," : "Merhaba,";

  const subject = isEn
    ? "Tiramisup — Verify your email"
    : "Tiramisup — E-postanı doğrula";

  const heading = isEn ? "One more step" : "Son bir adım";
  const body = isEn
    ? "Verify your email address to activate your Tiramisup account."
    : "Tiramisup hesabını etkinleştirmek için e-posta adresini doğrula.";
  const cta = isEn ? "Verify my email →" : "E-postamı doğrula →";
  const note = isEn
    ? "If you didn't create a Tiramisup account, you can ignore this email."
    : "Tiramisup hesabı oluşturmadıysan bu e-postayı yoksay.";

  const html = buildEmail({ greeting, heading, body, cta, verifyUrl, note });

  const resend = await getResend();
  if (!resend) {
    console.log(`[verify] No RESEND_API_KEY — verification link for ${email}: ${verifyUrl}`);
    return;
  }

  try {
    await resend.emails.send({ from: getFrom(), to: email, subject, html });
  } catch (err) {
    console.error("[verify] Failed to send user verification email:", err);
  }
}

// ─── Waitlist: lead confirmation + verification ───────────────────────────────

export async function sendWaitlistVerificationEmail(params: {
  email: string;
  name?: string | null;
  token: string;
  locale: string;
}) {
  const { email, name, token, locale } = params;
  const isEn = locale === "en";
  const baseUrl = getAppBaseUrl();
  const safeLocale = locale === "tr" ? "tr" : "en";
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&type=waitlist&locale=${safeLocale}`;

  const firstName = name?.trim().split(/\s+/)[0] ?? null;
  const greeting = firstName
    ? isEn ? `Hi ${firstName},` : `Merhaba ${firstName},`
    : isEn ? "Hi there," : "Merhaba,";

  const subject = isEn
    ? "Tiramisup — Confirm your waitlist spot"
    : "Tiramisup — Waitlist kaydını onayla";

  const heading = isEn ? "Confirm your email" : "E-postanı onayla";
  const body = isEn
    ? "You're on the Tiramisup waitlist. Click below to confirm your email and secure your spot."
    : "Tiramisup waitlist'indesin. E-postanı onaylamak ve yerini garantilemek için aşağıya tıkla.";
  const cta = isEn ? "Confirm my spot →" : "Kaydımı onayla →";
  const note = isEn
    ? "If you didn't sign up for the Tiramisup waitlist, you can ignore this email."
    : "Tiramisup waitlist'ine kaydolmadıysan bu e-postayı yoksay.";

  const html = buildEmail({ greeting, heading, body, cta, verifyUrl, note });

  const resend = await getResend();
  if (!resend) {
    console.log(`[verify] No RESEND_API_KEY — waitlist verification link for ${email}: ${verifyUrl}`);
    return;
  }

  try {
    await resend.emails.send({ from: getFrom(), to: email, subject, html });
  } catch (err) {
    console.error("[verify] Failed to send waitlist verification email:", err);
  }
}

// ─── HTML template ────────────────────────────────────────────────────────────

function buildEmail(p: {
  greeting: string;
  heading: string;
  body: string;
  cta: string;
  verifyUrl: string;
  note: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#FFF8F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFF8F2;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:20px;border:1px solid #E8DED7;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="padding:28px 32px 20px;border-bottom:1px solid #F3EDE8;">
            <span style="font-size:17px;font-weight:900;color:#21231D;letter-spacing:-0.01em;">Tiramisup</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px 32px 8px;">
            <p style="margin:0 0 4px;font-size:13px;color:#A88C80;">${p.greeting}</p>
            <h1 style="margin:0 0 16px;font-size:24px;font-weight:900;color:#21231D;line-height:1.15;">${p.heading}</h1>
            <p style="margin:0 0 28px;font-size:15px;line-height:1.65;color:#5C5048;">${p.body}</p>
            <a href="${p.verifyUrl}"
               style="display:inline-block;background:#21231D;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:12px;font-size:14px;font-weight:700;letter-spacing:-0.01em;">
              ${p.cta}
            </a>
          </td>
        </tr>
        <!-- Fallback URL -->
        <tr>
          <td style="padding:24px 32px 8px;">
            <p style="margin:0;font-size:12px;color:#A88C80;line-height:1.6;">
              If the button doesn't work, copy this link into your browser:<br>
              <a href="${p.verifyUrl}" style="color:#C45D97;word-break:break-all;">${p.verifyUrl}</a>
            </p>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px 28px;border-top:1px solid #F3EDE8;margin-top:16px;">
            <p style="margin:0;font-size:12px;color:#B8A9A0;">${p.note}</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
