import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrackedLink from "@/components/analytics/TrackedLink";

const COPY = {
  en: {
    pending: {
      title: "Confirm your email to keep your spot.",
      subtitle: "We sent a confirmation email to the address you entered. Click the link there to lock in your waitlist spot.",
      boxTitle: "What happens next",
      boxText: "After you confirm, your spot is secured. When the next batch opens, we'll email you with access details.",
      back: "Back to early access",
    },
    verified: {
      title: "Your waitlist spot is confirmed.",
      subtitle: "Your email is verified and your place in the next invite batches is secured.",
      boxTitle: "What happens next",
      boxText: "Keep an eye on your inbox and spam folder. We'll reach out with access details and onboarding instructions.",
      back: "Back to early access",
    },
  },
  tr: {
    pending: {
      title: "Yerini korumak için e-postanı doğrula.",
      subtitle: "Girdiğin adrese bir onay maili gönderdik. Waitlist yerini netleştirmek için içindeki bağlantıya tıkla.",
      boxTitle: "Sırada ne var",
      boxText: "Onayladıktan sonra yerin kesinleşir. Yeni davet grubu açıldığında erişim detaylarını sana e-posta ile yollarız.",
      back: "Erken erişim sayfasına dön",
    },
    verified: {
      title: "Waitlist yerin doğrulandı.",
      subtitle: "E-posta adresin doğrulandı ve sıradaki davet grupları için yerin kesinleşti.",
      boxTitle: "Sırada ne var",
      boxText: "Gelen kutunu ve spam klasörünü kontrol et. Erişim detaylarını ve onboarding adımlarını email ile paylaşacağız.",
      back: "Erken erişim sayfasına dön",
    },
  },
} as const;

export default async function ThankYouPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{ verified?: string }>;
}) {
  const { locale: rawLocale } = await params;
  const resolvedSearchParams = (await searchParams) ?? {};
  const locale = rawLocale === "tr" ? "tr" : "en";
  const copy = resolvedSearchParams.verified === "1" ? COPY[locale].verified : COPY[locale].pending;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffafc_0%,_#f5f7fb_100%)] px-4">
      <TrackEventOnMount eventName="thank_you_view" params={{ locale, page: "waitlist_thank_you" }} />
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(26,18,29,0.08)] backdrop-blur sm:p-10">
        <div className="mb-6 flex items-center justify-center">
          <img src="/assets/illus-tiramisu-slice.png" alt="Tiramisup" className="h-20 w-20 object-contain" />
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111118] sm:text-[42px]">{copy.title}</h1>
        <p className="mt-4 text-[16px] leading-8 text-[#5d6679]">{copy.subtitle}</p>

        <div className="mt-8 rounded-[22px] bg-[#f6f7fb] px-6 py-6 text-left">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7d8495]">{copy.boxTitle}</p>
          <p className="mt-3 text-[14px] leading-7 text-[#3f4655]">{copy.boxText}</p>
        </div>

        <TrackedLink
          href={`/${locale}/waitlist`}
          eventName="thank_you_back_click"
          params={{ locale, destination: "waitlist" }}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-[#111118] px-6 text-[14px] font-semibold text-white transition hover:bg-[#242432]"
        >
          {copy.back}
        </TrackedLink>
      </div>
    </div>
  );
}
