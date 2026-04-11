/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

const COPY = {
  en: {
    user: {
      sentTitle: "Check your email",
      sentBody:
        "We sent a verification link to your inbox. Open it to activate your Tiramisup account before logging in.",
      action: "Go to login",
    },
    waitlist: {
      sentTitle: "Check your email",
      sentBody:
        "We sent a confirmation link to your inbox. Open it to secure your place on the waitlist.",
      action: "Back to early access",
    },
    missing: {
      title: "This verification link is incomplete",
      body: "Please open the latest verification email again or request a fresh link.",
    },
    invalid: {
      title: "This verification link is invalid or expired",
      body: "Request a fresh verification email and try again with the newest link.",
    },
    emailLabel: "Sent to",
  },
  tr: {
    user: {
      sentTitle: "E-postanı kontrol et",
      sentBody:
        "Tiramisup hesabını etkinleştirmek için gelen kutuna bir doğrulama bağlantısı gönderdik. Giriş yapmadan önce bağlantıyı aç.",
      action: "Giriş ekranına git",
    },
    waitlist: {
      sentTitle: "E-postanı kontrol et",
      sentBody:
        "Waitlist yerini kesinleştirmek için gelen kutuna bir doğrulama bağlantısı gönderdik. Yerini onaylamak için bağlantıyı aç.",
      action: "Erken erişim sayfasına dön",
    },
    missing: {
      title: "Bu doğrulama bağlantısı eksik",
      body: "Son gönderdiğimiz doğrulama e-postasını tekrar aç ya da yeni bir bağlantı iste.",
    },
    invalid: {
      title: "Bu doğrulama bağlantısı geçersiz veya süresi dolmuş",
      body: "Yeni bir doğrulama e-postası isteyip en güncel bağlantıyla tekrar dene.",
    },
    emailLabel: "Gönderilen adres",
  },
} as const;

export default async function VerifyEmailPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams?: Promise<{
    sent?: string;
    error?: string;
    type?: string;
    email?: string;
  }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = rawLocale === "tr" ? "tr" : "en";
  const copy = COPY[locale];
  const resolvedSearchParams = (await searchParams) ?? {};
  const verificationType = resolvedSearchParams.type === "waitlist" ? "waitlist" : "user";
  const email = typeof resolvedSearchParams.email === "string" ? resolvedSearchParams.email : "";
  const isSentState = resolvedSearchParams.sent === "1" && !resolvedSearchParams.error;
  const actionHref = verificationType === "waitlist" ? `/${locale}/waitlist` : `/${locale}/login${email ? `?email=${encodeURIComponent(email)}` : ""}`;

  const state = (() => {
    if (resolvedSearchParams.error === "missing_token") {
      return { ...copy.missing, action: copy[verificationType].action };
    }
    if (resolvedSearchParams.error === "invalid_token") {
      return { ...copy.invalid, action: copy[verificationType].action };
    }
    return {
      title: copy[verificationType].sentTitle,
      body: copy[verificationType].sentBody,
      action: copy[verificationType].action,
    };
  })();

  return (
    <div className="flex min-h-screen items-center justify-center bg-[linear-gradient(180deg,_#fffafc_0%,_#f5f7fb_100%)] px-4">
      <div className="w-full max-w-xl rounded-[32px] border border-white/70 bg-white/90 p-8 text-center shadow-[0_24px_80px_rgba(26,18,29,0.08)] backdrop-blur sm:p-10">
        <div className="mb-6 flex items-center justify-center">
          <img src="/assets/illus-tiramisu-slice.png" alt="Tiramisup" className="h-20 w-20 object-contain" />
        </div>

        <h1 className="text-[34px] font-semibold tracking-[-0.04em] text-[#111118] sm:text-[42px]">
          {state.title}
        </h1>
        <p className="mt-4 text-[16px] leading-8 text-[#5d6679]">{state.body}</p>

        {isSentState && email ? (
          <div className="mt-8 rounded-[22px] bg-[#f6f7fb] px-6 py-6 text-left">
            <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7d8495]">
              {copy.emailLabel}
            </p>
            <p className="mt-3 break-all text-[14px] leading-7 text-[#3f4655]">{email}</p>
          </div>
        ) : null}

        <Link
          href={actionHref}
          className="mt-8 inline-flex h-12 items-center rounded-full bg-[#111118] px-6 text-[14px] font-semibold text-white transition hover:bg-[#242432]"
        >
          {state.action}
        </Link>
      </div>
    </div>
  );
}
