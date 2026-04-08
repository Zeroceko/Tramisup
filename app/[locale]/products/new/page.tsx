import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { checkLimit } from "@/lib/plan-limits";

/**
 * /products/new is the entry gate for creating another product.
 * If the user still has capacity, continue into onboarding.
 * If the user is at the product limit, stop here and show the upgrade CTA
 * before they invest time in the wizard.
 */
export default async function ProductsNewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect(`/${locale}/login?callbackUrl=/${locale}/products/new`);
  }

  const productLimit = await checkLimit(session.user.id, "products", 1);

  if (productLimit.allowed) {
    redirect(`/${locale}/onboarding`);
  }

  const planName = productLimit.plan === "FREE" ? "Free" : productLimit.plan;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(255,146,178,0.35),_transparent_38%),radial-gradient(circle_at_bottom_right,_rgba(120,158,255,0.28),_transparent_34%),linear-gradient(135deg,_#ffd2df_0%,_#f1d8ff_46%,_#c9dcff_100%)] p-2 sm:p-4">
      <div className="mx-auto flex min-h-[calc(100vh-1rem)] max-w-[1100px] items-center justify-center rounded-[24px] border border-white/60 bg-white p-6 shadow-[0_24px_72px_rgba(65,38,72,0.22)] backdrop-blur sm:min-h-[calc(100vh-2rem)] sm:p-10">
        <div className="w-full max-w-[560px] rounded-[28px] border border-[#f0e6ef] bg-[#fff9fc] p-6 shadow-[0_16px_48px_rgba(23,20,31,0.06)] sm:p-8">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
            {isEn ? "Product limit" : "Ürün limiti"}
          </p>
          <h1 className="mt-2 text-[28px] font-bold tracking-[-0.03em] text-[#0d0d12] sm:text-[34px]">
            {isEn ? "Upgrade before creating another product" : "Yeni ürün oluşturmadan önce planını yükselt"}
          </h1>
          <p className="mt-3 text-[15px] leading-7 text-[#5e6678]">
            {isEn
              ? `Your ${planName} plan is already using ${productLimit.used}/${productLimit.limit} product workspace${productLimit.limit > 1 ? "s" : ""}. Upgrade first so we can open a new product without making you finish the full setup and fail at the end.`
              : `${planName} planında ${productLimit.used}/${productLimit.limit} ürün workspace hakkını kullanmış durumdasın. Wizard'ı tamamlayıp en sonda hata görmek yerine önce planını yükselt, sonra yeni ürünü açalım.`}
          </p>

          <div className="mt-6 rounded-[20px] border border-[#f3d7e7] bg-white p-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[12px] font-semibold uppercase tracking-[0.14em] text-[#8a8fa0]">
                  {isEn ? "Current package" : "Mevcut paket"}
                </p>
                <p className="mt-1 text-[18px] font-semibold text-[#0d0d12]">
                  {planName}
                </p>
              </div>
              <div className="rounded-full bg-[#fff3d7] px-3 py-1 text-[12px] font-semibold text-[#8a6400]">
                {productLimit.used}/{productLimit.limit}
              </div>
            </div>
            <p className="mt-3 text-[13px] leading-6 text-[#666d80]">
              {isEn
                ? "Upgrade to unlock multiple products and continue without friction."
                : "Birden fazla ürün açmak ve kesintisiz devam etmek için planını yükselt."}
            </p>
          </div>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href={`/${locale}/pricing`}
              className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d0d12] px-6 text-[14px] font-semibold text-white transition hover:bg-[#23232b]"
            >
              {isEn ? "See plans" : "Paketleri gör"}
            </Link>
            <Link
              href={`/${locale}/products`}
              className="inline-flex h-11 items-center justify-center rounded-full border border-[#e5dbe4] bg-white px-6 text-[14px] font-semibold text-[#5e6678] transition hover:border-[#d0c4cf] hover:text-[#0d0d12]"
            >
              {isEn ? "Back to products" : "Ürünlere geri dön"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
