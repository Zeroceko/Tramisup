import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import GrowthRoutines from "@/components/GrowthRoutines";
import GoalsSection from "@/components/GoalsSection";
import TimelineFeed from "@/components/TimelineFeed";

export default async function GrowthPage() {
  const session = await getServerSession(authOptions);
  
  const project = await prisma.project.findUnique({
    where: { userId: session?.user?.id },
  });

  if (!project) {
    return <div>Project not found</div>;
  }

  const routines = await prisma.growthRoutine.findMany({
    where: { projectId: project.id },
    orderBy: { createdAt: "desc" },
  });

  const goals = await prisma.goal.findMany({
    where: { projectId: project.id },
    orderBy: { endDate: "asc" },
  });

  const timelineEvents = await prisma.timelineEvent.findMany({
    where: { projectId: project.id },
    orderBy: { date: "desc" },
    take: 20,
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Growth Dashboard</h1>
        <p className="text-gray-600">
          Track routines, set goals, and monitor your progress
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 space-y-8">
          <GoalsSection goals={goals} projectId={project.id} />
          <GrowthRoutines routines={routines} projectId={project.id} />
        </div>
        
        <div>
          <TimelineFeed events={timelineEvents} projectId={project.id} />
        </div>
      </div>
    </div>
  );
}
