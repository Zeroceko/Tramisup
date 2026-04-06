import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import StatCard from "@/components/StatCard";
import TasksList from "@/components/TasksList";

export default async function TasksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const isEn = locale === "en";

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="py-20 text-center">
        <p className="text-[14px] text-[#666d80]">
          {isEn
            ? "Create a product to start tracking tasks"
            : "Görevleri görmek için bir ürün oluşturmalısın"}
        </p>
      </div>
    );
  }

  const tasks = await prisma.task.findMany({
    where: { productId: product.id },
    include: {
      launchChecklistItem: {
        select: { id: true, title: true, category: true, completed: true },
      },
    },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
  });

  const total = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const blockers = tasks.filter(
    (t) => t.priority === "HIGH" && t.status !== "DONE"
  ).length;
  const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div>
      <div className="grid grid-cols-4 gap-3 px-5 pt-5 pb-4">
        <StatCard
          label={isEn ? "Total tasks" : "Toplam görev"}
          value={String(total)}
          hint={`${completionRate}% ${isEn ? "complete" : "tamamlandı"}`}
          accent="teal"
          progress={completionRate}
        />
        <StatCard
          label={isEn ? "In progress" : "Yapılıyor"}
          value={String(inProgress)}
          accent="yellow"
        />
        <StatCard
          label={isEn ? "Completed" : "Tamamlandı"}
          value={String(done)}
          accent="green"
        />
        <StatCard
          label={isEn ? "Blockers" : "Blokajlar"}
          value={String(blockers)}
          accent={blockers > 0 ? "pink" : "green"}
          hint={blockers > 0 ? (isEn ? "High priority remaining" : "Yüksek öncelikli kalan") : undefined}
        />
      </div>

      <div className="px-5 pb-5">
        <TasksList tasks={tasks} productId={product.id} locale={locale} />
      </div>
    </div>
  );
}
