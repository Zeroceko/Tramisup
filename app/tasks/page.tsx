import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import PageHeader from "@/components/PageHeader";
import TasksList from "@/components/TasksList";

export default async function TasksPage() {
  const session = await getServerSession(authOptions);

  const activeId = await getActiveProductId();
  const product = await prisma.product.findFirst({
    where: {
      userId: session?.user?.id,
      ...(activeId ? { id: activeId } : {}),
    },
  });

  const tasks = await prisma.task.findMany({
    where: { productId: product?.id },
    orderBy: [
      { dueDate: "asc" },
      { priority: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <div>
      <PageHeader
        eyebrow="Görevler"
        title="İş Yönetimi"
        description="Tüm görevlerini bir yerde yönet ve takip et."
      />

      <TasksList tasks={tasks} productId={product?.id || ""} />
    </div>
  );
}
