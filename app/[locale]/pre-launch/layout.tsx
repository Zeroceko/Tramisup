import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import AgentLayoutShell from "@/components/AgentLayoutShell";
import PlainPageShell from "@/components/PlainPageShell";
import RouteScopedBoundary from "@/components/RouteScopedBoundary";
import { getRequestSession, getRequestShellContext } from "@/lib/request-cache";

export default async function PreLaunchLayout({
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
      analyticsSurface="pre-launch"
    >
      <RouteScopedBoundary key="pre-launch" scope="pre-launch">
        {effectiveActiveProductId ? (
          <AgentLayoutShell agentType="launch" productId={effectiveActiveProductId} locale={locale}>
            {children}
          </AgentLayoutShell>
        ) : (
          <PlainPageShell>{children}</PlainPageShell>
        )}
      </RouteScopedBoundary>
    </AppShell>
  );
}
