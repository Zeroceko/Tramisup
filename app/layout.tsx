import type { Metadata } from "next";
import { Manrope, Outfit } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Tiramisup — Launch OS",
  description: "From pre-launch discipline to post-launch growth, in one system.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr" className={`${manrope.variable} ${outfit.variable}`}>
      <body className="font-manrope bg-[#f6f6f6] text-[#0d0d12] antialiased">
        {children}
      </body>
    </html>
  );
}
