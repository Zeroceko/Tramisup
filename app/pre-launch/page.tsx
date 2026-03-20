import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import ChecklistSection from "@/components/ChecklistSection";
import ActionsSection from "@/components/ActionsSection";
import PageHeader from "@/components/PageHeader";

export default async function PreLaunchPage() {
  const session = await getServerSession(authOptions);

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
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
    <div>
      <PageHeader
        eyebrow="Pre-Launch"
        title="Launch Hazırlık Skoru"
        description="Launch öncesi her şeyin hazır olduğundan emin ol."
      />

      {/* Readiness bar */}
      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-1">Hazırlık</p>
            <p className="text-[14px] text-[#666d80]">
              {completedItems} / {totalItems} madde tamamlandı
            </p>
          </div>
          <span className="text-[42px] font-bold text-[#0d0d12] leading-none tracking-[-0.03em]">
            {readinessScore}%
          </span>
        </div>
        <div className="w-full bg-[#f6f6f6] rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-[#95dbda] rounded-full transition-all duration-500"
            style={{ width: `${readinessScore}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
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
