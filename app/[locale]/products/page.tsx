import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import { cookies } from "next/headers";
import Link from "next/link";

async function SetActiveProductAction(productId: string, locale: string) {
  "use server";
  const store = await cookies();
  store.set("activeProductId", productId, { path: "/" });
  redirect(`/${locale}/dashboard`);
}

// SVG circular progress ring
function CircleProgress({
  value,
  color,
  size = 44,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
      />
    </svg>
  );
}

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
      createdAt: true,
      _count: {
        select: {
          launchChecklists: true,
          growthChecklists: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Get completed counts for each product
  const productIds = products.map((p) => p.id);
  const [launchDone, growthDone] = await Promise.all([
    prisma.launchChecklist.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, completed: true },
      _count: true,
    }),
    prisma.growthChecklist.groupBy({
      by: ["productId"],
      where: { productId: { in: productIds }, completed: true },
      _count: true,
    }),
  ]);

  const launchMap = Object.fromEntries(launchDone.map((r) => [r.productId, r._count]));
  const growthMap = Object.fromEntries(growthDone.map((r) => [r.productId, r._count]));

  const activeProductId = await getActiveProductId();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <p className="text-[13px] text-[#666d80]">Ürünün büyümeyi destekleyecek kadar hazır mı?</p>
        <h1 className="mt-0.5 text-[32px] font-bold text-[#0d0d12] tracking-[-0.03em]">
          Your Products !
        </h1>
      </div>

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        
        <Link
          href={`/${locale}/products/new`}
          className="flex min-h-[180px] items-center justify-center rounded-[15px] border-2 border-dashed border-[#ffd7ef] bg-white transition hover:border-[#f5c8e4] hover:bg-[#fff8fc]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ffd7ef] text-[22px] font-light text-[#c8a0b8]">
            +
          </div>
        </Link>

        {products.map((product) => {
          const isActive = activeProductId === product.id;
          const launchTotal = product._count.launchChecklists;
          const growthTotal = product._count.growthChecklists;
          const launchCompleted = launchMap[product.id] ?? 0;
          const growthCompleted = growthMap[product.id] ?? 0;
          const launchPct = launchTotal > 0 ? Math.round((launchCompleted / launchTotal) * 100) : 0;
          const growthPct = growthTotal > 0 ? Math.round((growthCompleted / growthTotal) * 100) : 0;

          return (
            <div
              key={product.id}
              className={`relative rounded-[15px] border bg-white p-5 transition ${
                isActive ? "border-[#95dbda] shadow-sm" : "border-[#e8e8e8] hover:border-[#d0d0d0]"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#0d0d12] truncate">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#666d80] line-clamp-2">
                    {product.description || product.category || "—"}
                  </p>
                </div>
                <div className="flex items-center gap-1 ml-2 shrink-0">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
                  </svg>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className="rounded-full bg-[#fff3d7] px-2.5 py-0.5 text-[11px] font-medium text-[#8a6400]">
                  {product.status.replace("_", " ")}
                </span>
                {product.category && (
                  <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] font-medium text-[#666d80]">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Circular progress row */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#f0f0f0]">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CircleProgress value={launchPct} color="#ffd7ef" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {launchPct}%
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#666d80]">Launch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CircleProgress value={growthPct} color="#95dbda" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {growthPct}%
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#666d80]">Growth</span>
                </div>
              </div>
              
              <form
                action={async () => {
                  "use server";
                  await SetActiveProductAction(product.id, locale);
                }}
                className="mt-4"
              >
                <button
                  type="submit"
                  className={`w-full h-8 rounded-full text-[12px] font-semibold transition ${
                    isActive
                      ? "bg-[#95dbda] text-[#0d0d12]"
                      : "bg-[#f6f6f6] text-[#666d80] hover:bg-[#ffd7ef] hover:text-[#0d0d12]"
                  }`}
                >
                  {isActive ? "Aktif ürün ✓" : "Aktif yap →"}
                </button>
              </form>
            </div>
          );
        })}
      </div>
    </div>
  );
}
