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

const statusLabel: Record<string, string> = {
  PRE_LAUNCH: "Pre-Launch",
  LAUNCHED:   "Launched",
  GROWING:    "Growing",
};

const statusStyle: Record<string, string> = {
  PRE_LAUNCH: "bg-[#ffd7ef] text-[#0d0d12]",
  LAUNCHED:   "bg-[#75fc96] text-[#0d0d12]",
  GROWING:    "bg-[#95dbda] text-[#0d0d12]",
};

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
    select: { id: true, name: true, category: true, status: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });

  const activeProductId = await getActiveProductId();

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#666d80]">Ürünler</p>
          <h1 className="mt-1 text-[28px] font-bold text-[#0d0d12] tracking-[-0.02em]">
            Tüm ürünlerin
          </h1>
        </div>
        <Link
          href={`/${locale}/products/new`}
          className="inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
        >
          <span className="text-lg leading-none">+</span>
          Yeni ürün
        </Link>
      </div>

      {/* Empty */}
      {products.length === 0 ? (
        <div className="rounded-[20px] border border-dashed border-[#e8e8e8] bg-white px-8 py-16 text-center">
          <div className="w-14 h-14 rounded-full bg-[#f6f6f6] flex items-center justify-center mx-auto mb-4">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="#95dbda" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </div>
          <p className="text-[15px] font-semibold text-[#0d0d12]">Henüz ürün yok</p>
          <p className="mt-2 text-[13px] text-[#666d80]">İlk ürününü oluştur ve takibine başla.</p>
          <Link
            href={`/${locale}/products/new`}
            className="mt-6 inline-flex items-center gap-2 px-5 h-10 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
          >
            İlk ürünü oluştur
          </Link>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((product) => {
            const isActive = activeProductId === product.id;
            return (
              <div
                key={product.id}
                className={`rounded-[15px] border bg-white p-5 transition ${
                  isActive ? "border-[#95dbda]" : "border-[#e8e8e8] hover:border-[#d0d0d0]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-4">
                  {/* Logo placeholder */}
                  <div className="w-10 h-10 rounded-full bg-[#fee74e] flex items-center justify-center shrink-0">
                    <span className="font-outfit font-semibold text-[14px] text-[#2e2e2e]">
                      {product.name[0]?.toUpperCase()}
                    </span>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusStyle[product.status] ?? "bg-[#f6f6f6] text-[#666d80]"}`}>
                    {statusLabel[product.status] ?? product.status}
                  </span>
                </div>

                <p className="text-[16px] font-semibold text-[#0d0d12] truncate">{product.name}</p>
                {product.category && (
                  <p className="mt-1 text-[13px] text-[#666d80]">{product.category}</p>
                )}
                <p className="mt-3 text-[11px] text-[#9ca3af]">
                  {new Date(product.createdAt).toLocaleDateString("tr-TR")}
                </p>

                <div className="mt-5">
                  <form
                    action={async () => {
                      "use server";
                      await SetActiveProductAction(product.id, locale);
                    }}
                  >
                    <button
                      type="submit"
                      className={`w-full h-9 rounded-full text-[13px] font-semibold transition ${
                        isActive
                          ? "bg-[#95dbda] text-[#0d0d12]"
                          : "bg-[#ffd7ef] text-[#0d0d12] hover:bg-[#f5c8e4]"
                      }`}
                    >
                      {isActive ? "Dashboard'a git →" : "Aktif yap ve aç →"}
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
