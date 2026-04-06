import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
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

  const statCards = [
    {
      label: isEn ? "Total" : "Toplam",
      value: total,
      sub: isEn ? "tasks" : "görev",
    },
    {
      label: isEn ? "In progress" : "Yapılıyor",
      value: inProgress,
      accent: "#95dbda",
    },
    {
      label: isEn ? "Completed" : "Tamamlandı",
      value: done,
      accent: "#75fc96",
    },
    {
      label: isEn ? "Blockers" : "Blokajlar",
      value: blockers,
      accent: blockers > 0 ? "#ef4444" : "#75fc96",
    },
  ];

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-4 gap-3 px-5 pt-5 pb-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-[14px] border border-[#e8e8e8] bg-[#f9f9f9] p-4"
          >
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#8a8fa0]">
              {card.label}
            </p>
            <p
              className="mt-1 text-[26px] font-bold leading-none"
              style={{ color: card.accent ?? "#0d0d12" }}
            >
              {card.value}
            </p>
            {card.sub && (
              <p className="mt-0.5 text-[11px] text-[#b0b7c3]">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="px-5 pb-5">
        <TasksList tasks={tasks} productId={product.id} locale={locale} />
      </div>
    </div>
  );
}
