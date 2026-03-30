import TrackEventOnMount from "@/components/analytics/TrackEventOnMount";
import TrackedLink from "@/components/analytics/TrackedLink";

const COPY = {
  en: {
    title: "Thanks, you're on the list.",
    subtitle: "Your early-access request is in. We'll send your invite by email as soon as the next batch opens.",
    boxTitle: "What happens next",
    boxText: "Keep an eye on your inbox and spam folder. We'll reach out with access details and onboarding instructions.",
    back: "Back to early access",
  },
  tr: {
    title: "Teşekkürler, listedesin.",
    subtitle: "Erken erişim talebin alındı. Sıradaki davet grubu açıldığında sana email göndereceğiz.",
    boxTitle: "Sırada ne var",
    boxText: "Gelen kutunu ve spam klasörünü kontrol et. Erişim detaylarını ve onboarding adımlarını email ile paylaşacağız.",
    back: "Erken erişim sayfasına dön",
  },
} as const;

export default async function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "tr" ? "tr" : "en";
  const copy = COPY[locale];

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
