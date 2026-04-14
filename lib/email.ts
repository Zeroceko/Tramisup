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

  const firstName = name ? name.split(" ")[0] : null;

  const html = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tiramisup — Erken Erişim Davetiyeniz</title>
</head>
<body style="margin:0; padding:0; background-color:#f8f5f1; font-family:'Manrope',-apple-system,BlinkMacSystemFont,'Segoe UI','Helvetica Neue',Arial,sans-serif;">

  <!-- Preheader -->
  <div style="display:none; max-height:0; overflow:hidden; font-size:1px; line-height:1px; color:#f8f5f1;">
    Erken erişim davetiyeniz hazır. Ürününüzü kurmaya başlamak için tıklayın.
  </div>

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

              <!-- Body -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:40px 40px 0 40px;">

                    <!-- Eyebrow -->
                    <p style="margin:0 0 18px 0; font-size:11px; font-weight:600; letter-spacing:0.2em; color:#8a8fa0; text-transform:uppercase;">Erken Erişim</p>

                    <!-- Heading -->
                    <h1 style="margin:0 0 14px 0; font-size:26px; font-weight:700; color:#0d0d12; letter-spacing:-0.02em; line-height:1.25;">
                      ${firstName ? `Merhaba ${firstName},` : "Merhaba,"}
                    </h1>

                    <!-- Body text -->
                    <p style="margin:0 0 28px 0; font-size:14px; line-height:1.7; color:#666d80;">
                      Tiramisup erken erişim listenize alındınız. Aşağıdaki kodu kullanarak kayıt olabilir ve ürününüzü kurmaya başlayabilirsiniz.
                    </p>

                  </td>
                </tr>

                <!-- Access code -->
                <tr>
                  <td style="padding:0 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="background-color:#f8f5f1; border-radius:14px; border:1px solid #e8e8e8; padding:24px; text-align:center;">
                          <p style="margin:0 0 10px 0; font-size:11px; font-weight:600; letter-spacing:0.2em; color:#8a8fa0; text-transform:uppercase;">Erişim Kodunuz</p>
                          <p style="margin:0; font-size:30px; font-weight:700; letter-spacing:5px; color:#0d0d12;">${code}</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- What to expect -->
                <tr>
                  <td style="padding:28px 40px 0 40px;">
                    <p style="margin:0 0 12px 0; font-size:13px; font-weight:600; color:#0d0d12; letter-spacing:-0.01em;">Neler sizi bekliyor:</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr><td style="padding:3px 0; font-size:14px; line-height:1.6; color:#666d80;">&bull;&nbsp;&nbsp;Lansman hazırlığı — checklist ve görev takibi</td></tr>
                      <tr><td style="padding:3px 0; font-size:14px; line-height:1.6; color:#666d80;">&bull;&nbsp;&nbsp;AARRR metrik takibi ve büyüme kurulumu</td></tr>
                      <tr><td style="padding:3px 0; font-size:14px; line-height:1.6; color:#666d80;">&bull;&nbsp;&nbsp;AI destekli Founder Coach — kanıta dayalı öneriler</td></tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA -->
                <tr>
                  <td style="padding:28px 40px 36px 40px;">
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background-color:#0d0d12; border-radius:100px;">
                          <a href="https://tramisup.vercel.app/tr/signup" target="_blank"
                             style="display:block; padding:15px 32px; font-size:14px; font-weight:600; color:#ffffff; text-decoration:none; letter-spacing:-0.01em;">
                            Hesabınızı oluşturun &rarr;
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

              </table>

              <!-- Divider + footer -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="border-top:1px solid #e8e8e8; padding:20px 40px 28px 40px;">
                    <p style="margin:0; font-size:12px; line-height:1.6; color:#8a8fa0;">
                      Bu davetiyeyi siz talep ettiniz. Hesap oluşturmak istemiyorsanız bu e-postayı görmezden gelebilirsiniz.
                    </p>
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

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from:
        process.env.RESEND_FROM_EMAIL ?? "Tiramisup <noreply@tiramisup.app>",
      to,
      subject: "Tiramisup — Erken Erişim Davetiyeniz Hazır",
      html,
      text: `Merhaba${firstName ? ` ${firstName}` : ""},\n\nTiramisup erken erişim davetiyeniz hazır.\n\nErişim kodunuz: ${code}\n\nKayıt olmak için: https://tramisup.vercel.app/tr/signup`,
    });
  } catch (error) {
    console.error("[email] Failed to send invite email:", error);
    // Don't throw - we don't want to break the approval flow if email fails
  }
}
