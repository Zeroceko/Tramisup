import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import SettingsForm from "@/components/SettingsForm";
import PageHeader from "@/components/PageHeader";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("settings");

  const userWithProducts = await prisma.user.findUnique({
    where: { id: session?.user?.id },
    include: { products: { take: 1 } },
  });

  const user = userWithProducts ? {
    ...userWithProducts,
    product: userWithProducts.products[0] || null,
  } : null;

  return (
    <div className="max-w-xl">
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />
      <SettingsForm user={user} />
    </div>
  );
}
