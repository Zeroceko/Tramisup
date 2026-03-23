import Link from "next/link";

type FirstRunOnboardingProps = {
  locale: string;
  userName?: string | null;
  userEmail?: string | null;
};

const COPY = {
  tr: {
    eyebrow: "İlk adım",
    title: "Hoş geldin",
    description: "Kısa bir profile check-in yap, sonra ilk ürününü ekleyip Tiramisup'ın sana doğru çalışma akışını kurmasına izin ver.",
    calmStart: "Sakin başlangıç",
    calmTitle: "Boş dashboard yerine kısa bir başlangıç akışı",
    calmDescription: "Seni sahte kartlar ya da örnek verilerle karşılamıyoruz. Önce hesabını doğrula, sonra ürün yolculuğunu başlat.",
    principles: [
      "Önce kim olduğunu ve hangi dilde çalıştığını net gör.",
      "Tek ana adım: ilk ürününü eklemek.",
      "Ürünü ekledikten sonra bir sonraki doğru ekran otomatik netleşsin.",
    ],
    createProduct: "Ürün yolculuğuna başla",
    productsLink: "Ürünler sayfasını aç",
    profileEyebrow: "Profil özeti",
    profileTitle: "İlk check-in",
    profileDescription: "İsim ve hesap bilgilerin hazır görünüyor. İstersen ayarlardan düzenleyebilirsin.",
    nameLabel: "İsim",
    emailLabel: "E-posta",
    localeLabel: "Workspace dili",
    localeValue: "Türkçe",
    readyLabel: "Durum",
    readyValue: "Yeni çalışma alanı, ürün bekleniyor",
    settingsLink: "Profili düzenle",
    journeyEyebrow: "Ürün yolculuğu",
    journeyTitle: "Bundan sonra ne olacak?",
    journeyDescription: "İlk ürün oluşturulduğunda Tiramisup yüzeyleri ürün aşamana göre açılır. Böylece ilk günden kalabalık yerine net bir sıra görürsün.",
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
    title: "Welcome",
    description: "Do a quick profile check-in, then add your first product so Tiramisup can set up the right working flow for you.",
    calmStart: "Calm start",
    calmTitle: "A short starting flow instead of an empty dashboard",
    calmDescription: "We do not greet you with fake cards or sample data. First confirm your account context, then start your product journey.",
    principles: [
      "See who you are and which workspace language you are using.",
      "Keep one main action: add your first product.",
      "Let the next correct screen become clear after product setup.",
    ],
    createProduct: "Start the product journey",
    productsLink: "Open products page",
    profileEyebrow: "Profile snapshot",
    profileTitle: "Quick check-in",
    profileDescription: "Your account basics look ready. You can still refine them in settings.",
    nameLabel: "Name",
    emailLabel: "Email",
    localeLabel: "Workspace language",
    localeValue: "English",
    readyLabel: "Status",
    readyValue: "Fresh workspace, waiting for first product",
    settingsLink: "Edit profile",
    journeyEyebrow: "Product journey",
    journeyTitle: "What happens next?",
    journeyDescription: "Once the first product exists, Tiramisup opens the workspace according to your product stage, so day one feels guided instead of crowded.",
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
                href={`/${locale}/products`}
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
