import type { Metadata } from "next";
import { locales } from "@/i18n";

export const metadata: Metadata = {
  title: "Tiramisup — Launch OS",
  description: "Launch checklist, live metrics, and growth routines in one platform",
  icons: {
    icon: "/assets/illus-tiramisu-slice.png",
    apple: "/assets/illus-tiramisu-slice.png",
  },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
