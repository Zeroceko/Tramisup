import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getActiveProductId } from "@/lib/activeProduct";
import AppShell from "@/components/AppShell";
import { getShellProducts } from "@/lib/shell-products";

export default async function TasksLayout({
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

  return (
    <AppShell products={products} activeProductId={activeProductId} userName={session.user.name ?? undefined}>
      {/* Tasks/Board fills full height */}
      <div className="h-full overflow-hidden p-3">
        <div className="h-full rounded-2xl bg-white border border-[#e8e4de] shadow-[0_1px_4px_rgba(0,0,0,0.06)] overflow-y-auto">
          {children}
        </div>
      </div>
    </AppShell>
  );
}
