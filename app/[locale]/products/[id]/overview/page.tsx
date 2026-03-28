import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";

export default async function ProductOverviewPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) redirect(`/${locale}/login`);

  const product = await prisma.product.findFirst({
    where: { id, userId: session.user.id },
    include: {
      metricSetup: true,
      _count: {
        select: {
          launchChecklists: true,
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
          Urun olusturuldu
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
        {/* Product details */}
        <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
            Urun ozeti
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
                <p className="text-[11px] text-[#666d80]">Is modeli</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">{product.businessModel}</p>
              </div>
            )}
            <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
              <p className="text-[11px] text-[#666d80]">Asama</p>
              <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                {product.launchStatus || (product.status ?? "—").replaceAll("_", " ")}
              </p>
            </div>
          </div>
        </div>

        {/* What Tiramisup prepared */}
        <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
            Tiramisup neler hazirladi?
          </p>
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-[12px] bg-[#f8fbfb] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] text-[14px] font-semibold text-[#0d0d12]">
                {product._count.launchChecklists}
              </div>
              <p className="text-[14px] text-[#0d0d12]">Launch hazirlık maddesi</p>
            </div>
            <div className="flex items-center gap-3 rounded-[12px] bg-[#f8fbfb] px-4 py-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#e8e8e8] text-[14px] font-semibold text-[#0d0d12]">
                {product._count.tasks}
              </div>
              <p className="text-[14px] text-[#0d0d12]">Gorev olusturuldu</p>
            </div>
          </div>
        </div>

        {/* Next step */}
        {founderSummary?.nextStep && (
          <div className="rounded-[20px] border border-[#0d0d12] bg-[#0d0d12] p-6 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50 mb-2">
              Simdi ne yapmalisin?
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
