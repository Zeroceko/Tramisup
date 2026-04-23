import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import AgentLayoutShell from "@/components/AgentLayoutShell";
import RouteScopedBoundary from "@/components/RouteScopedBoundary";
import { getRequestSession, getRequestShellContext } from "@/lib/request-cache";

export default async function GrowthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getRequestSession();

  if (!session?.user?.id) {
    redirect(`/${locale}/login`);
  }

  const { products, effectiveActiveProductId } = await getRequestShellContext(session.user.id);

  return (
    <AppShell
      products={products}
      activeProductId={effectiveActiveProductId}
      userName={session.user.name ?? undefined}
      analyticsSurface="growth"
    >
      <RouteScopedBoundary key="growth" scope="growth">
        {effectiveActiveProductId ? (
          <AgentLayoutShell agentType="growth" productId={effectiveActiveProductId} locale={locale}>
            {children}
          </AgentLayoutShell>
        ) : (
          children
        )}
      </RouteScopedBoundary>
    </AppShell>
  );
}
