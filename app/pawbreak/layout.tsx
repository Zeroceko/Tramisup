import { Manrope, Outfit } from "next/font/google";
import "../[locale]/globals.css";

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

export default function PawBreakLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${manrope.variable} ${outfit.variable}`}>
      <body className="font-manrope bg-[#f7f8f4] text-[#1f241f] antialiased">
        {children}
      </body>
    </html>
  );
}
