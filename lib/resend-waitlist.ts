import { getAppBaseUrl } from "@/lib/app-urls";

type WaitlistLead = {
  email: string;
  name?: string | null;
  source?: string;
  locale?: string;
};

function getResendConfig() {
  return {
    apiKey: process.env.RESEND_API_KEY,
    fromEmail: process.env.RESEND_FROM_EMAIL || "Tiramisup <onboarding@resend.dev>",
    segmentId: process.env.RESEND_WAITLIST_SEGMENT_ID,
    appUrl: getAppBaseUrl(),
  };
}

async function getResendClient() {
  const { apiKey } = getResendConfig();
  if (!apiKey) return null;

  const { Resend } = await import("resend");
  return new Resend(apiKey);
}

function firstNameFromName(name?: string | null) {
  if (!name) return undefined;
  const trimmed = name.trim();
  if (!trimmed) return undefined;
  return trimmed.split(/\s+/)[0];
}

function isDuplicateContactError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const message = "message" in error ? String(error.message || "") : "";
  const name = "name" in error ? String(error.name || "") : "";
  const combined = `${name} ${message}`.toLowerCase();
  return combined.includes("already exists") || combined.includes("duplicate");
}

export async function syncWaitlistLeadToResend(lead: WaitlistLead) {
  const resend = await getResendClient();
  if (!resend) return;

  const { segmentId } = getResendConfig();

  try {
    await resend.contacts.create({
      email: lead.email,
      firstName: firstNameFromName(lead.name),
      ...(segmentId ? { segments: [{ id: segmentId }] } : {}),
      properties: {
        source: lead.source || "landing",
        locale: lead.locale || "en",
      },
    });
  } catch (error) {
    if (isDuplicateContactError(error)) return;
    console.error("[waitlist] Failed to sync lead to Resend:", error);
  }
}

function getConfirmationCopy(locale: string, appUrl: string) {
  const signupUrl = `${appUrl.replace(/\/$/, "")}/${locale === "tr" ? "tr" : "en"}/waitlist/thank-you`;

  if (locale === "tr") {
    return {
      subject: "Tiramisup — Waitlist'tesin",
      heading: "Waitlist'e katıldın",
      body: "Kaydın alındı. Erken erişimi grup grup açıyoruz ve sıra sana geldiğinde sana e-posta ile haber vereceğiz.",
      cta: "Kaydını görüntüle",
      footer: "Bu e-postayı Tiramisup waitlist formuna kaydolduğun için aldın. Bu mesaja yanıt vermene gerek yok.",
      signupUrl,
    };
  }

  return {
    subject: "Tiramisup — You’re on the waitlist",
    heading: "You’re on the waitlist",
    body: "Your spot is confirmed. We’re opening early access in batches and we’ll email you as soon as it’s your turn.",
    cta: "View your confirmation",
    footer: "You’re receiving this because you joined the Tiramisup waitlist. No reply is needed.",
    signupUrl,
  };
}

export async function sendWaitlistConfirmationEmail(lead: WaitlistLead) {
  const resend = await getResendClient();
  const { fromEmail, appUrl } = getResendConfig();

  if (!resend || !fromEmail) return;

  const copy = getConfirmationCopy(lead.locale || "en", appUrl);

  try {
    await resend.emails.send({
      from: fromEmail,
      to: lead.email,
      subject: copy.subject,
      html: `
        <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',sans-serif;max-width:600px;margin:0 auto;padding:24px;">
          <h1 style="font-size:28px;line-height:1.1;margin:0 0 16px;color:#21231d;">${copy.heading}</h1>
          <p style="font-size:16px;line-height:1.6;color:#4b5563;margin:0 0 24px;">${copy.body}</p>
          <a href="${copy.signupUrl}" style="display:inline-block;background:#21231d;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font-weight:600;">${copy.cta}</a>
          <p style="font-size:12px;line-height:1.6;color:#6b7280;margin:32px 0 0;">${copy.footer}</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[waitlist] Failed to send confirmation email:", error);
  }
}
