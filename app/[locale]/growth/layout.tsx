import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getActiveProductId } from "@/lib/activeProduct";
import AppShell from "@/components/AppShell";
import AgentLayoutShell from "@/components/AgentLayoutShell";
import { getShellProducts } from "@/lib/shell-products";

export default async function GrowthLayout({
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
  const effectiveActiveId =
    products.find((p) => p.id === activeProductId)?.id ?? products[0]?.id;

  return (
    <AppShell products={products} activeProductId={effectiveActiveId} userName={session.user.name ?? undefined}>
      {effectiveActiveId ? (
        <AgentLayoutShell agentType="growth" productId={effectiveActiveId}>
          {children}
        </AgentLayoutShell>
      ) : (
        children
      )}
    </AppShell>
  );
}
