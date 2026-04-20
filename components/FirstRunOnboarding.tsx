import Link from "next/link";

type FirstRunOnboardingProps = {
  locale: string;
};

const COPY = {
  tr: {
    eyebrow: "İlk adım",
    title: "Ürün yolculuğuna başla",
    description: "Birkaç kısa soruyla ürününü tanıyalım, sonra Tiramisup sana ürüne özel bir dashboard hazırlasın.",
    createProduct: "Ürün yolculuğuna başla",
    productsLink: "Daha sonra",
    trustNote: "Fake veri yok. Aksiyonlar gerçek bağlam oluşunca görünür.",
  },
  en: {
    eyebrow: "First step",
    title: "Start the product journey",
    description: "Answer a few short questions about your product, then Tiramisup will set up a dashboard tailored to it.",
    createProduct: "Start the product journey",
    productsLink: "Maybe later",
    trustNote: "No fake data. Surfaces appear once real product context exists.",
  },
} as const;

export default function FirstRunOnboarding({ locale }: FirstRunOnboardingProps) {
  const copy = locale === "en" ? COPY.en : COPY.tr;

  return (
    <div className="mx-auto max-w-xl pt-12">
      <div className="rounded-[24px] border border-[#e8e8e8] bg-white p-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">{copy.eyebrow}</p>
        <h1 className="mt-2 text-[28px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
          {copy.title}
        </h1>
        <p className="mt-3 text-[14px] leading-6 text-[#5e6678]">
          {copy.description}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href={`/${locale}/onboarding`}
            className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-6 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {copy.createProduct}
          </Link>
          <Link
            href={`/${locale}`}
            className="inline-flex h-11 items-center justify-center rounded-full border border-[#e8e8e8] px-6 text-[14px] font-medium text-[#5e6678] transition hover:bg-[#f6f6f6]"
          >
            {copy.productsLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
