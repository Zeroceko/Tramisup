import { redirect } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getRequestSession, getRequestShellContext } from "@/lib/request-cache";

export default async function TasksLayout({
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
      analyticsSurface="tasks"
    >
      {/* Tasks/Board fills full height */}
      <div className="h-full overflow-hidden p-3">
        <div className="h-full rounded-2xl bg-white border border-[#e8e4de] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-y-auto">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
