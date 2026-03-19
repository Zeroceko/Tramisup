import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChecklistSection from "@/components/ChecklistSection";
import ActionsSection from "@/components/ActionsSection";

export default async function PreLaunchPage() {
  const session = await getServerSession(authOptions);

  const product = await prisma.product.findFirst({
    where: { userId: session?.user?.id },
  });

  const checklists = await prisma.launchChecklist.findMany({
    where: { productId: product?.id },
    orderBy: [{ category: "asc" }, { order: "asc" }],
  });

  const tasks = await prisma.task.findMany({
    where: { productId: product?.id, status: { not: "DONE" } },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });

  const totalItems = checklists.length;
  const completedItems = checklists.filter(item => item.completed).length;
  const readinessScore = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  const checklistsByCategory = {
    PRODUCT: checklists.filter(c => c.category === "PRODUCT"),
    MARKETING: checklists.filter(c => c.category === "MARKETING"),
    LEGAL: checklists.filter(c => c.category === "LEGAL"),
    TECH: checklists.filter(c => c.category === "TECH"),
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Pre-Launch Readiness</h1>
        <p className="text-gray-600">
          Track your launch preparation and ensure everything is ready
        </p>
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Readiness Score</h2>
            <p className="text-gray-600">
              {completedItems} of {totalItems} items completed
            </p>
          </div>
          <div className="text-5xl font-bold text-indigo-600">{readinessScore}%</div>
        </div>
        <div className="w-full bg-white rounded-full h-4 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 transition-all duration-500"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <ChecklistSection
            checklistsByCategory={checklistsByCategory}
            productId={product?.id || ""}
          />
        </div>

        <div>
          <ActionsSection
            tasks={tasks}
            productId={product?.id || ""}
          />
        </div>
      </div>
    </div>
  );
}
