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
  const isEn = locale === "en";
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

  const liveCount = productItems.filter((product) => product.status === "LAUNCHED").length;
  const growingCount = productItems.filter((product) => product.status === "GROWING").length;
  const preLaunchCount = productItems.filter((product) => product.status === "PRE_LAUNCH").length;
  const activeProduct = productItems.find((product) => product.id === activeProductId) ?? null;
  const averageLaunchReadiness =
    productItems.length > 0
      ? Math.round(
          productItems.reduce((sum, product) => sum + product.launchPct, 0) / productItems.length
        )
      : 0;
  const averageGrowthReadiness =
    productItems.length > 0
      ? Math.round(
          productItems.reduce((sum, product) => sum + product.growthPct, 0) / productItems.length
        )
      : 0;

  return (
    <div className="mx-auto w-full max-w-[1320px] space-y-8">
      <section className="overflow-hidden rounded-[30px] border border-[#eadfe6] bg-[radial-gradient(circle_at_top_left,_rgba(255,214,233,0.82),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(149,219,218,0.42),_transparent_30%),linear-gradient(135deg,_#fffafc_0%,_#fffdfb_52%,_#f6fbfb_100%)] px-6 py-7 sm:px-8 sm:py-8 lg:px-9 lg:py-9">
        <div className="grid gap-7 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,380px)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8d6a7b]">
              {isEn ? "Product portfolio" : "Ürün portföyü"}
            </p>
            <h1 className="mt-3 max-w-[12ch] text-[34px] font-bold tracking-[-0.04em] text-[#0d0d12] sm:text-[42px]">
              {isEn ? "All your products, one operating view" : "Tüm ürünlerin, tek çalışma görünümünde"}
            </h1>
            <p className="mt-4 max-w-2xl text-[15px] leading-7 text-[#5e6678]">
              {isEn
                ? "See which product is active, which one is launch-ready, and where growth execution still feels fragile."
                : "Hangi ürünün aktif olduğunu, hangisinin launch'a yakın olduğunu ve hangi üründe growth execution tarafının hâlâ kırılgan kaldığını tek bakışta gör."}
            </p>
          </div>

          <div className="rounded-[24px] border border-white/70 bg-white/85 p-5 shadow-[0_18px_40px_rgba(23,20,31,0.06)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
              {isEn ? "Active focus" : "Aktif odak"}
            </p>
            <p className="mt-3 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              {activeProduct?.name ?? (isEn ? "No active product yet" : "Henüz aktif ürün yok")}
            </p>
            <p className="mt-2 text-[13px] leading-6 text-[#666d80]">
              {activeProduct
                ? isEn
                  ? `Launch readiness ${activeProduct.launchPct}%. Growth readiness ${activeProduct.growthPct}%.`
                  : `Launch hazırlığı %${activeProduct.launchPct}. Growth hazırlığı %${activeProduct.growthPct}.`
                : isEn
                  ? "Pick one product as the active workspace so navigation and AI stay focused."
                  : "Navigasyon ve AI odağı net kalsın diye bir ürünü aktif workspace olarak seç."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-[22px] border border-[#ebe7df] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(23,20,31,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Total products" : "Toplam ürün"}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">{productItems.length}</p>
        </div>
        <div className="rounded-[22px] border border-[#ebe7df] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(23,20,31,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Preparing" : "Hazırlanıyor"}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">{preLaunchCount}</p>
        </div>
        <div className="rounded-[22px] border border-[#ebe7df] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(23,20,31,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Live" : "Yayında"}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">{liveCount}</p>
        </div>
        <div className="rounded-[22px] border border-[#ebe7df] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(23,20,31,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Growing" : "Büyümede"}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">{growingCount}</p>
        </div>
        <div className="rounded-[22px] border border-[#ebe7df] bg-white px-5 py-5 shadow-[0_8px_24px_rgba(23,20,31,0.04)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Average readiness" : "Ortalama hazırlık"}
          </p>
          <p className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12]">
            {Math.round((averageLaunchReadiness + averageGrowthReadiness) / 2)}%
          </p>
        </div>
      </section>

      <div className="flex flex-col gap-2">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
            {isEn ? "Workspace grid" : "Workspace görünümü"}
          </p>
          <h2 className="mt-1 text-[24px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
            {isEn ? "Switch focus or add a new product" : "Odağı değiştir ya da yeni bir ürün ekle"}
          </h2>
          <p className="mt-1 text-[14px] leading-6 text-[#666d80]">
            {isEn
              ? "Choose the product you want to work on now, or open a fresh workspace for a new bet."
              : "Şimdi üzerinde çalışmak istediğin ürünü seç ya da yeni bir deneme için temiz bir workspace aç."}
          </p>
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
