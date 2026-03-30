const PRIVACY_COPY = {
  en: {
    title: "Privacy Policy",
    updated: "Last updated: March 29, 2026",
    intro:
      "Tiramisup collects only the information we need to operate the site, manage the waitlist, and communicate about product access.",
    sections: [
      {
        heading: "What we collect",
        body:
          "When you join the waitlist, we collect your email address and, if you provide it, your name. We also store technical information needed to run the website, such as language preference and analytics consent status.",
      },
      {
        heading: "How we use it",
        body:
          "We use your information to confirm your waitlist signup, send early-access updates, improve the landing page, and protect the site from misuse.",
      },
      {
        heading: "Analytics and cookies",
        body:
          "We use essential cookies for site functionality. If you allow analytics cookies, we may use tools such as Microsoft Clarity and, when enabled, Google Analytics 4 to understand traffic and improve conversion flows.",
      },
      {
        heading: "Email delivery",
        body:
          "Waitlist emails are delivered through Resend. Your information may be processed by service providers acting on our behalf to deliver email and operate infrastructure.",
      },
      {
        heading: "How long we keep data",
        body:
          "We keep waitlist information for as long as needed to manage early access, communicate with you, and meet legal or operational obligations.",
      },
      {
        heading: "Your choices",
        body:
          "You can ask us to update or delete your waitlist information, and you can opt out of emails at any time by replying to our messages or contacting us directly.",
      },
      {
        heading: "Contact",
        body:
          "For privacy questions, contact hello@tiramisup.app.",
      },
    ],
  },
  tr: {
    title: "Gizlilik Politikası",
    updated: "Son güncelleme: 29 Mart 2026",
    intro:
      "Tiramisup, siteyi çalıştırmak, waitlist'i yönetmek ve ürüne erişimle ilgili iletişim kurmak için gereken minimum bilgiyi toplar.",
    sections: [
      {
        heading: "Neleri topluyoruz",
        body:
          "Waitlist'e katıldığında e-posta adresini ve paylaşırsan adını toplarız. Ayrıca siteyi çalıştırmak için gereken dil tercihi ve analytics onayı gibi teknik bilgileri saklarız.",
      },
      {
        heading: "Nasıl kullanıyoruz",
        body:
          "Bilgilerini waitlist kaydını onaylamak, erken erişim güncellemeleri göndermek, landing page'i iyileştirmek ve siteyi kötüye kullanımdan korumak için kullanırız.",
      },
      {
        heading: "Analytics ve çerezler",
        body:
          "Site işlevleri için zorunlu çerezler kullanırız. Analytics çerezlerine izin verirsen, trafik ve dönüşüm akışını anlamak için Microsoft Clarity ve etkinleştirilirse Google Analytics 4 gibi araçlar kullanabiliriz.",
      },
      {
        heading: "E-posta gönderimi",
        body:
          "Waitlist e-postaları Resend üzerinden gönderilir. Bilgilerin, e-posta teslimi ve altyapı işletimi için bizim adımıza hizmet veren sağlayıcılar tarafından işlenebilir.",
      },
      {
        heading: "Veriyi ne kadar tutuyoruz",
        body:
          "Waitlist bilgilerini erken erişimi yönetmek, seninle iletişim kurmak ve yasal ya da operasyonel yükümlülükleri yerine getirmek için gereken süre boyunca saklarız.",
      },
      {
        heading: "Seçimlerin",
        body:
          "Waitlist bilgilerini güncellememizi ya da silmemizi isteyebilirsin. Mesajlarımıza yanıt vererek ya da bize ulaşarak e-postalardan çıkabilirsin.",
      },
      {
        heading: "İletişim",
        body:
          "Gizlilikle ilgili sorular için hello@tiramisup.app adresine yazabilirsin.",
      },
    ],
  },
} as const;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "tr" ? PRIVACY_COPY.tr : PRIVACY_COPY.en;

  return (
    <main className="min-h-screen bg-[#fffafc] px-6 py-16 text-[#21231d]">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#b03b64]">Tiramisup</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.03em]">{copy.title}</h1>
        <p className="mt-3 text-sm text-[#666d80]">{copy.updated}</p>
        <p className="mt-8 text-base leading-8 text-[#3f4556]">{copy.intro}</p>

        <div className="mt-10 space-y-7">
          {copy.sections.map((section) => (
            <section key={section.heading} className="border-b border-[#f0e6eb] pb-7 last:border-b-0 last:pb-0">
              <h2 className="text-[22px] font-bold tracking-[-0.02em]">{section.heading}</h2>
              <p className="mt-3 text-[15px] leading-8 text-[#4b5563]">{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
