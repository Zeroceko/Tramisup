const TERMS_COPY = {
  en: {
    title: "Terms and Conditions",
    updated: "Last updated: March 29, 2026",
    intro:
      "These terms govern your access to Tiramisup's public website, waitlist, and any early-access invitation we may later provide.",
    sections: [
      {
        heading: "Waitlist only",
        body:
          "Joining the waitlist does not guarantee immediate access, a specific launch date, or a particular pricing plan. Access may be limited, delayed, or withdrawn at our discretion.",
      },
      {
        heading: "Early-access product",
        body:
          "If you receive access to Tiramisup, the product may still be in beta. Features may change, break, or be removed without notice.",
      },
      {
        heading: "Acceptable use",
        body:
          "You agree not to misuse the site, submit false information, attempt unauthorized access, or interfere with the service.",
      },
      {
        heading: "Communications",
        body:
          "By joining the waitlist, you agree that we may email you about access, product updates, and operational notices related to Tiramisup.",
      },
      {
        heading: "Liability",
        body:
          "To the fullest extent allowed by law, Tiramisup is provided without warranties and we are not liable for indirect, incidental, or consequential damages related to your use of the site or early-access product.",
      },
      {
        heading: "Contact",
        body:
          "For questions about these terms, contact hello@tiramisup.app.",
      },
    ],
  },
  tr: {
    title: "Koşullar",
    updated: "Son güncelleme: 29 Mart 2026",
    intro:
      "Bu koşullar Tiramisup'in açık web sitesine, waitlist'ine ve daha sonra sağlanabilecek erken erişim davetlerine erişimini düzenler.",
    sections: [
      {
        heading: "Sadece waitlist",
        body:
          "Waitlist'e katılmak hemen erişim, belirli bir çıkış tarihi ya da belirli bir fiyat planı garantisi vermez. Erişim bizim takdirimize göre sınırlandırılabilir, ertelenebilir veya geri çekilebilir.",
      },
      {
        heading: "Erken erişim ürünü",
        body:
          "Tiramisup'a erişim alırsan ürün hâlâ beta aşamasında olabilir. Özellikler haber vermeden değişebilir, bozulabilir veya kaldırılabilir.",
      },
      {
        heading: "Kabul edilebilir kullanım",
        body:
          "Siteyi kötüye kullanmamayı, yanlış bilgi girmemeyi, yetkisiz erişim denememeyi ve hizmetin çalışmasını bozmamayı kabul edersin.",
      },
      {
        heading: "İletişim",
        body:
          "Waitlist'e katılarak Tiramisup ile ilgili erişim, ürün güncellemeleri ve operasyonel bildirimler için sana e-posta gönderebileceğimizi kabul edersin.",
      },
      {
        heading: "Sorumluluk",
        body:
          "Yasanın izin verdiği en geniş kapsamda, Tiramisup herhangi bir garanti olmadan sunulur ve siteyi ya da erken erişim ürününü kullanmandan doğan dolaylı ya da sonuç niteliğindeki zararlardan sorumlu olmayız.",
      },
      {
        heading: "İletişim",
        body:
          "Bu koşullarla ilgili sorular için hello@tiramisup.app adresine yazabilirsin.",
      },
    ],
  },
} as const;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const copy = locale === "tr" ? TERMS_COPY.tr : TERMS_COPY.en;

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
