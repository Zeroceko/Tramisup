import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import AppShell from "@/components/AppShell";

export default async function IntegrationsLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    select: { id: true, name: true, status: true },
    orderBy: { createdAt: "desc" },
  });

  const activeProductId = await getActiveProductId();

  return <AppShell products={products} activeProductId={activeProductId}>{children}</AppShell>;
}
