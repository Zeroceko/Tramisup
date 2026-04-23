import { Manrope, Outfit } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import GoogleAnalyticsScript from "@/components/analytics/GoogleAnalyticsScript";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600"],
});

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${manrope.variable} ${outfit.variable}`}>
      <body className="font-manrope bg-[#f8f5f1] text-[#0d0d12] antialiased">
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalyticsScript measurementId="AW-18110097199" />
          {children}
          <Toaster />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
