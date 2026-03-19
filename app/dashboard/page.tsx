import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  const product = await prisma.product.findFirst({
    where: { userId: session?.user?.id },
    include: {
      _count: {
        select: {
          launchChecklists: true,
          tasks: true,
          metrics: true,
          goals: true,
          integrations: { where: { status: "CONNECTED" } },
        },
      },
    },
  });

  const completedChecklists = await prisma.launchChecklist.count({
    where: { productId: product?.id, completed: true },
  });

  const totalChecklists = product?._count.launchChecklists || 0;
  const readinessScore = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  const recentMetrics = await prisma.metric.findMany({
    where: { productId: product?.id },
    orderBy: { date: "desc" },
    take: 1,
  });

  const latestMetric = recentMetrics[0];

  return (
    <div>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome back${session?.user?.name ? `, ${session.user.name}` : ""}`}
        description="Track launch readiness, metrics rhythm, and growth execution from one operator view."
        actions={
          <>
            <Link
              href="/metrics"
              className="inline-flex rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-950"
            >
              Update metrics
            </Link>
            <Link
              href="/pre-launch"
              className="inline-flex rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Review launch board
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Product status"
          value={product?.status.replace("_", " ") ?? "No product"}
          hint="Current operating phase"
          accent="blue"
        />
        <StatCard
          label="Readiness"
          value={`${readinessScore}%`}
          hint={`${completedChecklists}/${totalChecklists} checklist items complete`}
          accent="violet"
        />
        <StatCard
          label="Daily active users"
          value={latestMetric?.dau?.toLocaleString() || "—"}
          hint="Latest tracked day"
          accent="emerald"
        />
        <StatCard
          label="MRR"
          value={latestMetric?.mrr ? `$${latestMetric.mrr.toLocaleString()}` : "—"}
          hint="Most recent recurring revenue snapshot"
          accent="amber"
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Quick actions</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Keep the operating loop moving</h2>
            </div>
            <div className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-blue-700">
              This week
            </div>
          </div>

          <div className="mt-6 grid gap-3">
            {[
              {
                href: "/pre-launch",
                title: "Review pre-launch checklist",
                description: `${product?._count.tasks ?? 0} pending tasks still open`,
              },
              {
                href: "/metrics",
                title: "Enter today's metrics",
                description: "Keep DAU, MRR, and activation current before the next review.",
              },
              {
                href: "/integrations",
                title: "Connect integrations",
                description: `${product?._count.integrations ?? 0} active connectors, more ready to map.`,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 transition hover:border-slate-300 hover:bg-slate-50"
              >
                <p className="text-base font-semibold tracking-[-0.02em] text-slate-950">{item.title}</p>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">Goal pulse</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-slate-950">Active growth goals</h2>

          {product?._count.goals === 0 ? (
            <div className="mt-8 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center">
              <p className="text-base font-medium text-slate-900">No active goals yet</p>
              <p className="mt-2 text-sm text-slate-600">
                Set a measurable target so weekly routines have a direction.
              </p>
              <Link
                href="/growth"
                className="mt-5 inline-flex rounded-full bg-[linear-gradient(135deg,#2458ff_0%,#6d8dff_100%)] px-4 py-2 text-sm font-semibold text-white shadow-[0_18px_32px_-18px_rgba(36,88,255,0.9)]"
              >
                Create first goal
              </Link>
            </div>
          ) : (
            <div className="mt-8 rounded-[24px] border border-slate-200 bg-white px-5 py-5">
              <p className="text-4xl font-semibold tracking-[-0.05em] text-slate-950">{product?._count.goals}</p>
              <p className="mt-2 text-sm text-slate-600">
                Active goal{product?._count.goals !== 1 ? "s" : ""} currently tracked in the growth workspace.
              </p>
              <Link href="/growth" className="mt-5 inline-flex text-sm font-semibold text-blue-700 hover:text-blue-800">
                Open goals →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
