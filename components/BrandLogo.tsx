import { cn } from "@/lib/utils";

function GA4Logo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3" y="17" width="5.5" height="8" rx="1.5" fill="#F9AB00" />
      <rect x="11.25" y="11" width="5.5" height="14" rx="1.5" fill="#E37400" />
      <rect x="19.5" y="3" width="5.5" height="22" rx="1.5" fill="#E37400" />
    </svg>
  );
}

function StripeLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#635BFF" />
      <path
        d="M13.18 10.64c0-.96.79-1.33 2.1-1.33 1.87 0 4.24.57 5.92 1.58V5.87C19.54 5.2 17.73 5 15.28 5 10.85 5 8 7.36 8 11.07c0 5.8 8.04 4.87 8.04 7.37 0 1.14-.99 1.51-2.38 1.51-2.06 0-4.69-.84-6.66-1.97v5.14C8.67 23.87 10.77 24 13.3 24c4.5 0 7.7-2.22 7.7-5.97 0-6.26-8.04-5.13-7.82-7.39z"
        fill="white"
      />
    </svg>
  );
}

function RevenueCatLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#FF6B35" />
      <path d="M7 8h5.5c2.2 0 3.8 1.4 3.8 3.4 0 1.5-.8 2.6-2 3.1L17.5 20H14.8l-2.9-5.1H9.5V20H7V8zm2.5 2.2v2.7h2.8c.9 0 1.4-.5 1.4-1.35 0-.85-.5-1.35-1.4-1.35H9.5z" fill="white" />
      <circle cx="20.5" cy="19.5" r="2.5" fill="white" opacity="0.9" />
    </svg>
  );
}

function AppStoreLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="url(#app-store-gradient)" />
      <defs>
        <linearGradient id="app-store-gradient" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop stopColor="#17C8FF" />
          <stop offset="1" stopColor="#1D6AFF" />
        </linearGradient>
      </defs>
      <path
        d="M14 5.5c-.18 0-2.9 4.98-2.9 4.98s-3.38-.05-3.6 0c-.22.05.27 1.04.27 1.04l2.88 4.97-1.44 2.5H7.5l-.5.87h13.5l-.5-.87h-1.72l-1.44-2.5 2.88-4.97s.5-.99.27-1.04c-.22-.05-3.6 0-3.6 0S14.18 5.5 14 5.5zm0 10.7L12.7 14h2.6L14 16.2z"
        fill="white"
      />
    </svg>
  );
}

function GooglePlayLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M5.5 5.32c-.3.16-.5.49-.5.87v15.62c0 .38.2.71.5.87l.08.07 8.75-8.75v-.2L5.58 5.25l-.08.07z" fill="#4ECDE6" />
      <path d="M17.25 17.25l-2.92-2.92v-.2l2.92-2.92.07.04 3.46 1.97c.99.56.99 1.48 0 2.04l-3.46 1.97-.07.02z" fill="#FFCA28" />
      <path d="M17.32 17.23L14.33 14.2 5.5 23.03c.33.34.86.39 1.46.04l10.36-5.84z" fill="#F43249" />
      <path d="M17.32 10.77L6.96 4.93C6.36 4.58 5.83 4.63 5.5 4.97l8.83 8.83 2.99-3.03z" fill="#00EE76" />
    </svg>
  );
}

function MetaLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#0082FB" />
      <path
        d="M5 16.5c0 1.38.3 2.44.77 3.1.47.66 1.12.9 1.73.9 .83 0 1.56-.48 2.64-2.07l1.1-1.63c.76-1.13 1.63-2.42 2.76-2.42 1.13 0 1.83 1.09 2.59 2.65l.62 1.26c.81 1.66 1.65 2.21 2.69 2.21 2.1 0 3.1-2.42 3.1-5.5 0-3.15-1.06-5.5-3-5.5-1.16 0-2.07.96-3.2 2.78l-.37.59c-.46.74-.98 1.54-1.43 2.04-.45-1.25-1.12-3.31-2.65-3.31-1.38 0-2.3 1.3-3.1 2.84-.6 1.1-1.02 1.5-1.5 1.5-.42 0-.75-.26-.75-1.44 0-.54.07-1.03.2-1.44H5.1C5.03 14.92 5 15.7 5 16.5z"
        fill="white"
      />
    </svg>
  );
}

function GoogleAdsLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4 20.5l6.5-11.27 3.5 6.06L10 20.5H4z" fill="#FBBC04" />
      <path d="M10.5 9.23L14 15.29 17.5 9.23C16.07 7.05 13.93 7.05 12.5 7.05c-1.43 0-2.57.64-2 2.18z" fill="#4285F4" />
      <path d="M17.5 9.23L24 20.5h-6l-3.5-6.06 3-5.21z" fill="#34A853" />
    </svg>
  );
}

function TikTokLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#010101" />
      <path
        d="M19.5 7.5c-1.08-.68-1.83-1.74-2.05-3H15v12.25c0 1.24-1.01 2.25-2.25 2.25S10.5 17.99 10.5 16.75s1.01-2.25 2.25-2.25c.22 0 .43.03.63.09V12.1a5.25 5.25 0 00-.63-.04A5.25 5.25 0 007.5 17.31a5.25 5.25 0 005.25 5.19 5.25 5.25 0 005.25-5.25V11.8A8.94 8.94 0 0022.5 12V9.59a6.7 6.7 0 01-3-.09z"
        fill="white"
      />
      <path d="M20.45 9.5a6.7 6.7 0 01-3-.09V12a8.94 8.94 0 004.5-.2V9.59a6.7 6.7 0 01-1.5-.09z" fill="#EE1D52" />
      <path d="M17.45 4.5H15v12.25a2.25 2.25 0 01-2.25 2.25 2.25 2.25 0 01-1.63-.7 2.25 2.25 0 00.63-4.54v2.49c.2-.06.41-.09.63-.09 1.24 0 2.25 1.01 2.25 2.25s-1.01 2.25-2.25 2.25S10.13 18 10.5 16.75V4.5H8.06v12.25A5.25 5.25 0 0013.25 22a5.25 5.25 0 005.25-5.25V11.8c.96.55 2.01.9 3 1.01V9.91a4.98 4.98 0 01-4.05-5.41z" fill="#69C9D0" />
    </svg>
  );
}

function AppsFlyerLogo({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="7" fill="#1B1F3A" />
      <path d="M14 6L7 22h3.5l3.5-8 3.5 8H21L14 6z" fill="#00B1FF" />
      <path d="M14 6l3.5 8H14V6z" fill="#FF6B35" opacity="0.85" />
    </svg>
  );
}

function DefaultLogo({ provider, className }: { provider: string; className?: string }) {
  return (
    <span className={cn("flex items-center justify-center text-[13px] font-bold text-[#6d6571]", className)}>
      {provider.slice(0, 2)}
    </span>
  );
}

const LOGO_MAP: Record<string, (props: { className?: string }) => React.ReactElement> = {
  GA4: GA4Logo,
  STRIPE: StripeLogo,
  REVENUECAT: RevenueCatLogo,
  APP_STORE_CONNECT: AppStoreLogo,
  GOOGLE_PLAY: GooglePlayLogo,
  META_ADS: MetaLogo,
  GOOGLE_ADS: GoogleAdsLogo,
  TIKTOK_ADS: TikTokLogo,
  APPSFLYER: AppsFlyerLogo,
};

export function BrandLogo({ provider, className }: { provider: string; className?: string }) {
  const Logo = LOGO_MAP[provider];
  if (!Logo) return <DefaultLogo provider={provider} className={className} />;
  return <Logo className={className} />;
}
