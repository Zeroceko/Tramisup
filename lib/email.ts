export async function sendInviteEmail(
  to: string,
  name: string | null,
  code: string
): Promise<void> {
  // If no API key is configured, just log it
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[email] RESEND_API_KEY not configured. Invite code for ${to}: ${code}`
    );
    return;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: "Tiramisup <invite@tiramisup.com>",
      to,
      subject: "Tiramisup — Erken Erişim Davetiyeniz",
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Merhaba${name ? ` ${name}` : ""},</h2>
          <p>Erken erişim davetiyeniz hazır. Kayıt olmak için bu kodu kullanın:</p>
          <div style="background: #f6f6f6; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <code style="font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #0d0d12;">${code}</code>
          </div>
          <p><a href="https://tramisup.vercel.app/tr/signup" style="color: #95dbda; text-decoration: none; font-weight: 600;">Şimdi kayıt ol →</a></p>
          <hr style="border: none; border-top: 1px solid #e8e8e8; margin: 40px 0;" />
          <p style="font-size: 12px; color: #999; margin: 0;">Bu bir otomatik e-postadır. Lütfen yanıt vermeyin.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("[email] Failed to send invite email:", error);
    // Don't throw - we don't want to break the approval flow if email fails
  }
}
