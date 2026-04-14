import { randomBytes } from "crypto";
import { getAppBaseUrl } from "@/lib/app-urls";

export function generateVerificationToken(): string {
  return randomBytes(32).toString("hex");
}

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
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

  const preheader = isEn
    ? "Verify your email to activate your Tiramisup account."
    : "Tiramisup hesabını etkinleştirmek için e-postanı doğrula.";

  const heading = isEn ? "One more step" : "Son bir adım";
  const body = isEn
    ? "Verify your email address to activate your Tiramisup account."
    : "Tiramisup hesabını etkinleştirmek için e-posta adresini doğrula.";
  const cta = isEn ? "Verify my email →" : "E-postamı doğrula →";
  const linkLabel = isEn
    ? "Button not working? Copy this link:"
    : "Buton çalışmıyor mu? Bu bağlantıyı kopyala:";
  const note = isEn
    ? "If you didn't create a Tiramisup account, you can ignore this email."
    : "Tiramisup hesabı oluşturmadıysan bu e-postayı yoksay.";

  const html = buildEmail({ greeting, preheader, heading, body, cta, verifyUrl, linkLabel, note });

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

  const preheader = isEn
    ? "Confirm your email to secure your spot on the Tiramisup waitlist."
    : "Tiramisup waitlist'indeki yerini garantilemek için e-postanı onayla.";

  const heading = isEn ? "Confirm your email" : "E-postanı onayla";
  const body = isEn
    ? "You're on the Tiramisup waitlist. Click below to confirm your email and secure your spot."
    : "Tiramisup waitlist'indesin. E-postanı onaylamak ve yerini garantilemek için aşağıya tıkla.";
  const cta = isEn ? "Confirm my spot →" : "Kaydımı onayla →";
  const linkLabel = isEn
    ? "Button not working? Copy this link:"
    : "Buton çalışmıyor mu? Bu bağlantıyı kopyala:";
  const note = isEn
    ? "If you didn't sign up for the Tiramisup waitlist, you can ignore this email."
    : "Tiramisup waitlist'ine kaydolmadıysan bu e-postayı yoksay.";

  const html = buildEmail({ greeting, preheader, heading, body, cta, verifyUrl, linkLabel, note });

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

// ─── Shared HTML template ─────────────────────────────────────────────────────

function buildEmail(p: {
  greeting: string;
  preheader: string;
  heading: string;
  body: string;
  cta: string;
  verifyUrl: string;
  linkLabel: string;
  note: string;
}) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiramisup</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f5f1; font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">

  <!-- Preheader -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f8f5f1;">${p.preheader}</div>

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
                    <p style="margin:0 0 6px 0; font-size:13px; color:#8a8fa0;">${p.greeting}</p>

                    <!-- Heading -->
                    <h1 style="margin:0 0 14px 0; font-size:26px; font-weight:700; color:#0d0d12; letter-spacing:-0.02em; line-height:1.25;">${p.heading}</h1>

                    <!-- Body -->
                    <p style="margin:0 0 28px 0; font-size:14px; line-height:1.7; color:#666d80;">${p.body}</p>

                    <!-- CTA -->
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#0d0d12; border-radius:100px;">
                          <a href="${p.verifyUrl}" target="_blank"
                             style="display:block; padding:15px 32px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:-0.01em;">
                            ${p.cta}
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
                          <p style="margin:0 0 5px 0; font-size:11px; font-weight:600; letter-spacing:0.2em; color:#8a8fa0; text-transform:uppercase;">${p.linkLabel}</p>
                          <a href="${p.verifyUrl}" target="_blank" style="font-size:12px; color:#666d80; word-break:break-all; text-decoration:underline;">${p.verifyUrl}</a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- Divider + note -->
                <tr>
                  <td style="border-top:1px solid #e8e8e8; padding:20px 40px 28px 40px;">
                    <p style="margin:0; font-size:12px; line-height:1.6; color:#8a8fa0;">${p.note}</p>
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
}
