import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getActiveProductId } from "@/lib/activeProduct";
import AppShell from "@/components/AppShell";
import { getShellProducts } from "@/lib/shell-products";

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

  const products = await getShellProducts(session.user.id);

  const activeProductId = await getActiveProductId();

  return <AppShell products={products} activeProductId={activeProductId} userName={session.user.name ?? undefined}>{children}</AppShell>;
}
