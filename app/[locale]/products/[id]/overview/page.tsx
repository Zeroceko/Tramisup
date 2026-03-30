import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

export default async function ProductOverviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string; id: string }>;
  searchParams?: Promise<{ onboarding?: string }>;
}) {
  const { locale, id } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: {
      metricSetup: true,
      _count: {
        select: {
          launchChecklists: true,
          growthChecklists: true,
          tasks: true,
        },
      },
    },
  });

  if (!product) redirect(`/${locale}/dashboard`);

  const isLaunched = product.status === ProductStatus.LAUNCHED || product.status === ProductStatus.GROWING;
  const founderSummary = product.metricSetup?.founderSummary as {
    headline?: string;
    summary?: string;
    nextStep?: string;
    strengths?: string[];
    focusAreas?: string[];
  } | null;

  const nextHref = isLaunched
    ? `/${locale}/growth`
    : `/${locale}/pre-launch`;

  const nextLabel = isLaunched
    ? "Growth setup'a git"
    : "Launch hazırlığına git";
  const showContinueOnboarding = resolvedSearch.onboarding === "continue";
  const preparedItems = isLaunched ? product._count.growthChecklists : product._count.launchChecklists;
  const preparedLabel = isLaunched ? "Growth checklist maddesi" : "Launch hazırlık maddesi";

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <div className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#f0fffe]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#0d9488" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
          Ürün oluşturuldu
        </p>
        <h1 className="mt-2 text-[32px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
          {product.name}
        </h1>
        {founderSummary?.summary && (
          <p className="mx-auto mt-3 max-w-lg text-[15px] leading-7 text-[#5e6678]">
            {founderSummary.summary}
          </p>
        )}
      </div>

      <div className="mt-10 space-y-4">
        {showContinueOnboarding && (
          <div className="rounded-[20px] border border-[#ffd7ef] bg-[#fff7fc] p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#a55b83] mb-2">
              Onboarding durumu
            </p>
            <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              Ürün oluşturmaya devam et
            </h2>
            <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
              Ürünün oluşturuldu. Şimdi kurduğumuz bağlama göre sonraki adımı tamamlayıp workspace&apos;i tam kullanıma hazır hale getirebilirsin.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link
                href={nextHref}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#0d0d12] px-5 text-[14px] font-semibold text-white transition hover:bg-[#1a1a24]"
              >
                {isLaunched ? "Growth kurulumuna devam et" : "Launch hazırlığına devam et"}
              </Link>
              <Link
                href={`/${locale}/integrations`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#e8e8e8] bg-white px-5 text-[14px] font-medium text-[#5e6678] transition hover:bg-[#f6f6f6]"
              >
                Kaynakları daha sonra bağla
              </Link>
            </div>
          </div>
        )}

        {/* Product details */}
        <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
            Ürün özeti
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {product.category && (
              <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                <p className="text-[11px] text-[#666d80]">Kategori</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">{product.category}</p>
              </div>
            )}
            {product.targetAudience && (
              <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                <p className="text-[11px] text-[#666d80]">Hedef kitle</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">{product.targetAudience}</p>
              </div>
            )}
            {product.businessModel && (
              <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                <p className="text-[11px] text-[#666d80]">İş modeli</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">{product.businessModel}</p>
              </div>
            )}
            <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
              <p className="text-[11px] text-[#666d80]">Aşama</p>
              <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                {product.launchStatus || (product.status ?? "—").replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* What Tiramisup prepared */}
        <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
            Tiramisup neler hazırladı?
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[12px] bg-[#f8fbfb] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] text-[14px] font-semibold text-[#0d0d12]">
                {preparedItems}
              </div>
              <p className="text-[14px] text-[#0d0d12]">{preparedLabel}</p>
            </div>
            <div className="flex items-center gap-3 rounded-[12px] bg-[#f8fbfb] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] text-[14px] font-semibold text-[#0d0d12]">
                {product._count.tasks}
              </div>
              <p className="text-[14px] text-[#0d0d12]">Görev oluşturuldu</p>
            </div>
          </div>
        </div>

        {/* Next step */}
        {founderSummary?.nextStep && (
          <div className="rounded-[20px] border border-[#0d0d12] bg-[#0d0d12] p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">
              Şimdi ne yapmalısın?
            </p>
            <p className="text-[16px] font-semibold leading-relaxed">
              {founderSummary.nextStep}
            </p>
          </div>
        )}

        {/* CTA */}
        <div className="flex justify-center pt-2">
          <Link
            href={nextHref}
            className="inline-flex h-12 items-center justify-center rounded-full bg-[#ffd7ef] px-8 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            {nextLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}
