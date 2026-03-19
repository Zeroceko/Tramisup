import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MetricsOverview from "@/components/MetricsOverview";
import MetricEntryForm from "@/components/MetricEntryForm";
import RetentionCohortTable from "@/components/RetentionCohortTable";
import ActivationFunnelChart from "@/components/ActivationFunnelChart";

export default async function MetricsPage() {
  const session = await getServerSession(authOptions);
  
  const project = await prisma.project.findUnique({
    where: { userId: session?.user?.id },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  // Get last 30 days of metrics
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const metrics = await prisma.metric.findMany({
    where: {
      projectId: project.id,
      date: {
        gte: thirtyDaysAgo,
      },
    },
    orderBy: { date: "asc" },
  });

  const retentionCohorts = await prisma.retentionCohort.findMany({
    where: { projectId: project.id },
    orderBy: { cohortDate: "desc" },
    take: 10,
  });

  const latestMetric = await prisma.metric.findFirst({
    where: { projectId: project.id },
    orderBy: { date: "desc" },
  });

  const activationFunnels = await prisma.activationFunnel.findMany({
    where: {
      projectId: project.id,
    },
    orderBy: { date: "desc" },
    take: 1,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Metrics Dashboard</h1>
        <p className="text-gray-600">
          Track your key performance indicators
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2">
          <MetricsOverview metrics={metrics} />
        </div>
        <div>
          <MetricEntryForm projectId={project.id} latestMetric={latestMetric} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <ActivationFunnelChart projectId={project.id} />
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics</h2>
          {latestMetric ? (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600">Daily Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestMetric.dau?.toLocaleString() || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Active Users</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestMetric.mau?.toLocaleString() || "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Monthly Recurring Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestMetric.mrr ? `$${latestMetric.mrr.toLocaleString()}` : "—"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Activation Rate</p>
                <p className="text-2xl font-bold text-gray-900">
                  {latestMetric.activationRate ? `${latestMetric.activationRate}%` : "—"}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No metrics data yet</p>
          )}
        </div>
      </div>

      <RetentionCohortTable cohorts={retentionCohorts} />
    </div>
  );
}
