import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tramisu - Startup Command Center",
  description: "Manage your startup's growth journey from pre-launch to scale",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
