import { getServerSession } from "next-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import ProductEventTracker from "@/components/analytics/ProductEventTracker";
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
    <div className="mx-auto w-full max-w-[1360px] space-y-4">
      <ProductEventTracker productId={activeProductId ?? undefined} surface="products" />
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8fa0]">
            {locale === "en" ? "Products" : "Ürünler"}
          </p>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.04em] text-[#111017] sm:text-[28px]">
            {locale === "en" ? "Your products" : "Ürünlerin"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="rounded-full border border-[#e7ddd0] bg-white px-4 py-2 text-[13px] font-medium text-[#5e6678]">
            {productItems.length} {locale === "en" ? "items" : "ürün"}
          </div>
          <Link
            href={`/${locale}/products/new`}
            className="inline-flex h-11 items-center rounded-full bg-[#111017] px-5 text-[13px] font-semibold text-white transition hover:bg-[#23202b]"
          >
            {locale === "en" ? "New product" : "Yeni ürün"}
          </Link>
        </div>
      </div>

      <ProductsGrid
        products={productItems}
        locale={locale}
        activeProductId={activeProductId}
      />
    </div>
  );
}
