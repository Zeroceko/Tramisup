import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/lib/auth";
import { isAdminEmail } from "@/lib/admin-access";
import AdminNav from "@/components/admin/AdminNav";
import AdminUnauthorized from "@/components/admin/AdminUnauthorized";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  const isEn = locale === "en";

  if (!session?.user?.email) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/admin/overview`);
  }

  if (!isAdminEmail(session.user.email)) {
    return <AdminUnauthorized locale={locale} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,215,239,0.65),_transparent_32%),radial-gradient(circle_at_top_right,_rgba(255,235,105,0.18),_transparent_38%),linear-gradient(180deg,_#fdf9f6_0%,_#f8f5f0_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[32px] border border-[#e8e4de] bg-[rgba(255,255,255,0.92)] p-6 shadow-[0_25px_70px_rgba(17,16,20,0.08)] backdrop-blur">
          <div className="flex flex-col gap-5 border-b border-[#efeae2] pb-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#7b8393]">
                  {isEn ? "Internal ops" : "İç operasyonlar"}
                </p>
                <h1 className="mt-2 text-[32px] font-bold tracking-[-0.04em] text-[#0d0d12]">
                  {isEn ? "Tiramisup admin panel" : "Tiramisup admin paneli"}
                </h1>
                <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
                  {isEn
                    ? "Track real users, plan mix, product stage, and AI usage without leaving the app."
                    : "Gerçek kullanıcıları, paket dağılımını, ürün aşamalarını ve AI kullanımını uygulama içinden takip et."}
                </p>
              </div>
              <p className="text-[12px] text-[#7b8393]">
                {isEn ? `Signed in as ${session.user.email}` : `${session.user.email} ile giriş yapıldı`}
              </p>
            </div>

            <AdminNav locale={locale} />
          </div>

          <div className="pt-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
