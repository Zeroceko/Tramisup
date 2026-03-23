import Link from "next/link";

type FirstRunOnboardingProps = {
  locale: string;
  userName?: string | null;
  userEmail?: string | null;
};

const COPY = {
  tr: {
    eyebrow: "İlk adım",
    title: "Ürün yolculuğuna başla",
    description: "Sade bir başlangıçla ilerleyelim. Önce birkaç kısa soruyla ürününü tanıyalım, sonra Founder Coach sana ürününün ilk özetini çıkarsın.",
    welcomeTitle: "Hoş geldin, ilk adımı birlikte netleştirelim",
    welcomeDescription: "Bu ilk ekranın amacı seni boş bir dashboard ile karşılamak değil. Önce kim olduğunu ve nasıl ilerleyeceğini netleştiriyoruz.",
    calmStart: "Sakin başlangıç",
    calmTitle: "Önce ürününü tanıyalım",
    calmDescription: "Bu ekranda tek ana adım var: soru akışını başlatmak. Fake dashboard ya da örnek veri göstermiyoruz.",
    principles: [
      "Sorular ürününü, kitleni ve aşamanı anlamak için var.",
      "Cevaplarından sonra Founder Coach sana kısa bir ürün özeti çıkarır.",
      "Sonraki ekran doğrudan ürününün gerçek genel bakışı olur.",
    ],
    createProduct: "Ürün yolculuğuna başla",
    productsLink: "Daha sonra",
    profileEyebrow: "Profil özeti",
    profileTitle: "Hazır profil",
    profileDescription: "Hesabın hazır. Ürün oluştuktan sonra header'da o ürün aktif görünür, istersen oradan başka ürüne geçebilirsin.",
    nameLabel: "İsim",
    emailLabel: "E-posta",
    localeLabel: "Workspace dili",
    localeValue: "Türkçe",
    readyLabel: "Durum",
    readyValue: "Yeni çalışma alanı, ürün bekleniyor",
    settingsLink: "Profili düzenle",
    journeyEyebrow: "Ürün yolculuğu",
    journeyTitle: "Bundan sonra ne olacak?",
    journeyDescription: "İlk ürün oluşturulduğunda dashboard artık boş görünmez. Founder Coach özetin, ürün bağlamın ve bir sonraki doğru adım tek yerde görünür.",
    steps: [
      {
        title: "Ürünü anlat",
        description: "Ürünün ne yaptığını, kime satıldığını ve hangi aşamada olduğunu kendi cümlelerinle ekle.",
      },
      {
        title: "İlk sistemi kur",
        description: "Founder Coach buna göre checklist ve başlangıç growth yapısını oluştursun.",
      },
      {
        title: "Tek sıradaki adıma geç",
        description: "Dashboard seni launch hazırlığına ya da metrik setup'ına yönlendirsin.",
      },
    ],
    trustNote: "Fake veri yok. Aksiyonlar ürün bağlamı oluşunca görünür.",
  },
  en: {
    eyebrow: "First step",
    title: "Start the product journey",
    description: "Let’s keep the start simple. We’ll ask a few short product questions, then Founder Coach will turn your answers into a first summary.",
    welcomeTitle: "Welcome, let’s make the first step obvious",
    welcomeDescription: "This first screen should not feel like an empty dashboard. We first make your role and next move clear.",
    calmStart: "Calm start",
    calmTitle: "First, let’s understand the product",
    calmDescription: "There is one main action here: start the question flow. No fake dashboard and no sample data.",
    principles: [
      "The questions are there to understand your product, audience, and stage.",
      "Founder Coach turns your answers into a short product summary.",
      "The next screen becomes the real overview for that product.",
    ],
    createProduct: "Start the product journey",
    productsLink: "Maybe later",
    profileEyebrow: "Profile snapshot",
    profileTitle: "Profile ready",
    profileDescription: "Your account is ready. Once a product exists, the header shows that active product and you can switch from there.",
    nameLabel: "Name",
    emailLabel: "Email",
    localeLabel: "Workspace language",
    localeValue: "English",
    readyLabel: "Status",
    readyValue: "Fresh workspace, waiting for first product",
    settingsLink: "Edit profile",
    journeyEyebrow: "Product journey",
    journeyTitle: "What happens next?",
    journeyDescription: "Once the first product exists, the dashboard stops feeling empty. Founder Coach summary, product context, and the next correct step show up together.",
    steps: [
      {
        title: "Describe the product",
        description: "Add what it does, who it serves, and which stage it is in using your own words.",
      },
      {
        title: "Set up the first system",
        description: "Let Founder Coach prepare the initial checklist and starter growth structure.",
      },
      {
        title: "Move to the next step",
        description: "The dashboard should guide you into launch preparation or metric setup.",
      },
    ],
    trustNote: "No fake data. Surfaces appear once real product context exists.",
  },
} as const;

export default function FirstRunOnboarding({
  locale,
  userName,
  userEmail,
}: FirstRunOnboardingProps) {
  const copy = locale === "en" ? COPY.en : COPY.tr;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="overflow-hidden rounded-[24px] border border-[#e8e8e8] bg-white">
          <div className="border-b border-[#eef1f2] bg-[radial-gradient(circle_at_top_left,_rgba(149,219,218,0.28),_transparent_45%),linear-gradient(135deg,#fff9d6_0%,#ffffff_58%,#f7fbfb_100%)] px-6 py-6 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{copy.eyebrow}</p>
            <h1 className="mt-2 max-w-xl text-[30px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
              {copy.welcomeTitle}
            </h1>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#5e6678]">
              {copy.welcomeDescription}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-[12px] font-medium text-[#4c5567]">
              <span className="h-2 w-2 rounded-full bg-[#95dbda]" />
              {copy.description}
            </div>
          </div>

          <div className="border-b border-[#eef1f2] px-6 py-5 sm:px-7">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{copy.calmStart}</p>
            <h2 className="mt-2 max-w-xl text-[28px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
              {copy.calmTitle}
            </h2>
            <p className="mt-3 max-w-2xl text-[14px] leading-7 text-[#5e6678]">
              {copy.calmDescription}
            </p>
          </div>

          <div className="px-6 py-6 sm:px-7">
            <div className="grid gap-3 md:grid-cols-3">
              {copy.principles.map((item) => (
                <div key={item} className="rounded-[18px] border border-[#eef1f2] bg-[#fbfcfc] p-4">
                  <p className="text-[13px] leading-6 text-[#3d4658]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href={`/${locale}/products/new`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                {copy.createProduct}
              </Link>
              <Link
                href={`/${locale}`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#e8e8e8] px-5 text-[14px] font-medium text-[#5e6678] transition hover:bg-[#f6f6f6]"
              >
                {copy.productsLink}
              </Link>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{copy.profileEyebrow}</p>
          <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">{copy.profileTitle}</h2>
          <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">{copy.profileDescription}</p>

          <div className="mt-6 space-y-3">
            <div className="rounded-[18px] bg-[#f7f9fa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">{copy.nameLabel}</p>
              <p className="mt-1 text-[15px] font-semibold text-[#0d0d12]">{userName || "—"}</p>
            </div>
            <div className="rounded-[18px] bg-[#f7f9fa] p-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">{copy.emailLabel}</p>
              <p className="mt-1 break-all text-[15px] font-medium text-[#0d0d12]">{userEmail || "—"}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[18px] bg-[#f7f9fa] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">{copy.localeLabel}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#0d0d12]">{copy.localeValue}</p>
              </div>
              <div className="rounded-[18px] bg-[#f7f9fa] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#7b8393]">{copy.readyLabel}</p>
                <p className="mt-1 text-[15px] font-semibold text-[#0d0d12]">{copy.readyValue}</p>
              </div>
            </div>
          </div>

          <Link
            href={`/${locale}/settings`}
            className="mt-6 inline-flex h-10 items-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6]"
          >
            {copy.settingsLink}
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-[#e8e8e8] bg-white p-6 sm:p-7">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{copy.journeyEyebrow}</p>
        <div className="mt-2 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">{copy.journeyTitle}</h2>
            <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">{copy.journeyDescription}</p>
          </div>
          <p className="rounded-full bg-[#f6f6f6] px-4 py-2 text-[12px] font-medium text-[#4c5567]">
            {copy.trustNote}
          </p>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-3">
          {copy.steps.map((step, index) => (
            <div key={step.title} className="rounded-[20px] border border-[#eef1f2] bg-[#fbfcfc] p-5">
              <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b8393]">
                0{index + 1}
              </p>
              <h3 className="mt-3 text-[17px] font-semibold tracking-[-0.02em] text-[#0d0d12]">{step.title}</h3>
              <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">{step.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
