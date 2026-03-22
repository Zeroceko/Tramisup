import { getServerSession } from "next-auth";
import { getTranslations } from "next-intl/server";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import PageHeader from "@/components/PageHeader";
import TasksList from "@/components/TasksList";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations("tasks");

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-[14px] text-[#666d80]">
          Görevleri görmek için bir ürün oluşturmalısın
        </p>
      </div>
    );
  }

  const tasks = await prisma.task.findMany({
    where: { productId: product.id },
    orderBy: [
      { dueDate: "asc" },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        description={t("description")}
      />

      <TasksList tasks={tasks} productId={product.id} />
    </div>
  );
}
