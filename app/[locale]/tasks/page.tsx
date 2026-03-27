import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import PageHeader from "@/components/PageHeader";
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

  return (
    <div>
      <PageHeader
        eyebrow={isEn ? "Your execution queue" : "Çalışma yüzeyin"}
        title={isEn ? "Tasks" : "Görevler"}
        description={
          isEn
            ? "Focus on highest-impact work first."
            : "En yüksek etkili işe önce odaklan."
        }
      />
      <TasksList tasks={tasks} productId={product.id} locale={locale} />
    </div>
  );
}
