import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import ProductsGrid from "@/components/ProductsGrid";

export default async function ProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const products = await prisma.product.findMany({
    where: { userId: session.user.id },
    select: {
      id: true,
      name: true,
      category: true,
      status: true,
      description: true,
      _count: {
        select: {
          launchChecklists: true,
          growthChecklists: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const productIds = products.map((p) => p.id);
  const [launchDone, growthDone] = productIds.length
    ? await Promise.all([
        prisma.launchChecklist.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds }, completed: true },
          _count: { _all: true },
        }),
        prisma.growthChecklist.groupBy({
          by: ["productId"],
          where: { productId: { in: productIds }, completed: true },
          _count: { _all: true },
        }),
      ])
    : [[], []];

  const launchMap = Object.fromEntries(launchDone.map((r) => [r.productId, r._count._all]));
  const growthMap = Object.fromEntries(growthDone.map((r) => [r.productId, r._count._all]));
  const activeProductId = await getActiveProductId();

  const productItems = products.map((product) => {
    const launchTotal = product._count.launchChecklists;
    const growthTotal = product._count.growthChecklists;
    const launchCompleted = launchMap[product.id] ?? 0;
    const growthCompleted = growthMap[product.id] ?? 0;
    return {
      id: product.id,
      name: product.name,
      category: product.category,
      status: product.status,
      description: product.description,
      launchPct: launchTotal > 0 ? Math.round((launchCompleted / launchTotal) * 100) : 0,
      growthPct: growthTotal > 0 ? Math.round((growthCompleted / growthTotal) * 100) : 0,
    };
  });

  return (
    <div>
      <div className="mb-8">
        <p className="text-[13px] text-[#666d80]">Ürünün büyümeyi destekleyecek kadar hazır mı?</p>
        <h1 className="mt-0.5 text-[32px] font-bold text-[#0d0d12] tracking-[-0.03em]">
          Your Products
        </h1>
      </div>

      <ProductsGrid
        products={productItems}
        locale={locale}
        activeProductId={activeProductId}
      />
    </div>
  );
}
