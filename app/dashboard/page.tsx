import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const project = await prisma.project.findUnique({
    where: { userId: session?.user?.id },
    include: {
      _count: {
        select: {
          checklists: true,
          actions: true,
          metrics: true,
          goals: true,
          integrations: { where: { status: "CONNECTED" } }
        }
      }
    }
  });

  const completedChecklists = await prisma.preLaunchChecklist.count({
    where: { projectId: project?.id, completed: true }
  });

  const totalChecklists = project?._count.checklists || 0;
  const readinessScore = totalChecklists > 0 
    ? Math.round((completedChecklists / totalChecklists) * 100) 
    : 0;

  // Get recent metrics
  const recentMetrics = await prisma.metric.findMany({
    where: { projectId: project?.id },
    orderBy: { date: "desc" },
    take: 1
  });

  const latestMetric = recentMetrics[0];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {session?.user?.name}!
        </h1>
        <p className="text-gray-600">
          Here's your startup at a glance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Project Status</h3>
            <span className="text-2xl">🎯</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {project?.status.replace("_", " ")}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Readiness</h3>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{readinessScore}%</p>
          <p className="text-xs text-gray-500 mt-1">
            {completedChecklists}/{totalChecklists} items complete
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">Active Users (DAU)</h3>
            <span className="text-2xl">👥</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestMetric?.dau?.toLocaleString() || "—"}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-600">MRR</h3>
            <span className="text-2xl">💰</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {latestMetric?.mrr ? `$${latestMetric.mrr.toLocaleString()}` : "—"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link
              href="/pre-launch"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Review Pre-Launch Checklist</p>
                  <p className="text-sm text-gray-600">{project?._count.actions} pending actions</p>
                </div>
                <span className="text-2xl">📋</span>
              </div>
            </Link>

            <Link
              href="/metrics"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Enter Today's Metrics</p>
                  <p className="text-sm text-gray-600">Keep your data up to date</p>
                </div>
                <span className="text-2xl">📈</span>
              </div>
            </Link>

            <Link
              href="/integrations"
              className="block p-4 border border-gray-200 rounded-lg hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">Connect Integrations</p>
                  <p className="text-sm text-gray-600">
                    {project?._count.integrations || 0} connected
                  </p>
                </div>
                <span className="text-2xl">🔌</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Active Goals</h2>
          {project?._count.goals === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="mb-4">No active goals yet</p>
              <Link
                href="/growth"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                Set Your First Goal
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                You have {project?._count.goals} active goal{project?._count.goals !== 1 ? "s" : ""}
              </p>
              <Link
                href="/growth"
                className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
              >
                View All Goals
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
