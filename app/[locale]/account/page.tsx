import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import PageHeader from "@/components/PageHeader";
import AccountWorkspace from "@/components/AccountWorkspace";

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const activeProductId = await getActiveProductId();
  const userWithProducts = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { products: true },
  });

  const user = userWithProducts
    ? {
        ...userWithProducts,
        product:
          userWithProducts.products.find((product) => product.id === activeProductId) ||
          userWithProducts.products[0] ||
          null,
      }
    : null;

  const isEn = locale === "en";

  return (
    <div className="max-w-5xl">
      <PageHeader
        eyebrow={isEn ? "Account" : "Hesap"}
        title={isEn ? "Account settings" : "Hesap ayarları"}
        description={
          isEn
            ? "Manage your personal profile, language preference, and password from here."
            : "Kişisel profilini, dil tercihini ve şifreni buradan yönet."
        }
      />

      <AccountWorkspace user={user} locale={locale} />
    </div>
  );
}
