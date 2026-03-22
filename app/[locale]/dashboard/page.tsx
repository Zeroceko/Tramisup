import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const session = await getServerSession(authOptions);

  const activeId = await getActiveProductId();
  const productInclude = {
    _count: {
      select: {
        launchChecklists: true,
        tasks: true,
        metrics: true,
        goals: true,
        integrations: { where: { status: "CONNECTED" } },
      },
    },
  } as const;

  // Try active product first, fall back to first product for user
  let product = await prisma.product.findFirst({
    where: { userId: session?.user?.id, ...(activeId ? { id: activeId } : {}) },
    include: productInclude,
  });

  if (!product && activeId) {
    product = await prisma.product.findFirst({
      where: { userId: session?.user?.id },
      include: productInclude,
    });
  }

  if (!product) {
    return (
      <div>
        <PageHeader
          eyebrow="Genel Bakış"
          title={`Hoş geldin${session?.user?.name ? `, ${session.user.name}` : ""}`}
          description="İlk ürününü oluşturarak launch hazırlığını, metriklerini ve büyüme akışını başlat."
        />

        <section className="mt-6 rounded-[20px] border border-dashed border-[#d9d9d9] bg-white p-8 sm:p-10 text-center">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fafa] text-[24px]">
              🚀
            </div>
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              Henüz bir ürünün yok
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[#666d80]">
              Sahte veri göstermiyoruz. İlk ürününü oluştur, wizard&apos;ı tamamla; checklist, görevler ve diğer içerikler gerçek başlangıç verileriyle otomatik hazırlansın.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/products/new`}
                className="inline-flex items-center justify-center rounded-full bg-[#ffd7ef] px-5 h-11 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                İlk ürününü oluştur
              </Link>
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center justify-center rounded-full border border-[#e8e8e8] px-5 h-11 text-[14px] font-medium text-[#666d80] transition hover:bg-[#f6f6f6]"
              >
                Ürünler sayfasına git
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const completedChecklists = await prisma.launchChecklist.count({
    where: { productId: product.id, completed: true },
  });

  const totalChecklists = product?._count.launchChecklists || 0;
  const readinessScore = totalChecklists > 0 ? Math.round((completedChecklists / totalChecklists) * 100) : 0;

  const recentMetrics = await prisma.metric.findMany({
    where: { productId: product?.id },
    orderBy: { date: "desc" },
    take: 1,
  });

  const latestMetric = recentMetrics[0];

  return (
    <div>
      <PageHeader
        eyebrow="Genel Bakış"
        title={`Hoş geldin${session?.user?.name ? `, ${session.user.name}` : ""}`}
        description="Launch hazırlığını, metrikleri ve büyümeyi tek yerden takip et."
        actions={
          <>
            <Link
              href={`/${locale}/metrics`}
              className="inline-flex items-center px-4 h-9 rounded-full border border-[#e8e8e8] text-[13px] font-medium text-[#666d80] hover:bg-[#f6f6f6] transition"
            >
              Metrik gir
            </Link>
            <Link
              href={`/${locale}/pre-launch`}
              className="inline-flex items-center px-4 h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
            >
              Launch board
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ürün durumu"
          value={product?.status.replace("_", " ") ?? "Ürün yok"}
          hint="Mevcut aşama"
          accent="pink"
        />
        <StatCard
          label="Hazırlık skoru"
          value={`${readinessScore}%`}
          hint={`${completedChecklists}/${totalChecklists} checklist tamamlandı`}
          accent="teal"
        />
        <StatCard
          label="Günlük aktif kullanıcı"
          value={latestMetric?.dau?.toLocaleString() || "—"}
          hint="Son takip edilen gün"
          accent="green"
        />
        <StatCard
          label="MRR"
          value={latestMetric?.mrr ? `$${latestMetric.mrr.toLocaleString()}` : "—"}
          hint="En son recurring gelir"
          accent="yellow"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        {/* Quick actions */}
        <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Hızlı erişim</p>
              <h2 className="mt-1 text-[18px] font-semibold text-[#0d0d12] tracking-[-0.01em]">Döngüyü canlı tut</h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-[#f6f6f6] text-[11px] font-semibold text-[#666d80]">
              Bu hafta
            </span>
          </div>

          <div className="space-y-2">
            {[
              {
                href: `/${locale}/pre-launch`,
                title: "Pre-launch checklist",
                description: `${product?._count.tasks ?? 0} bekleyen görev var`,
              },
              {
                href: `/${locale}/metrics`,
                title: "Bugünün metriklerini gir",
                description: "DAU, MRR ve aktivasyonu güncel tut.",
              },
              {
                href: `/${locale}/integrations`,
                title: "Entegrasyonları bağla",
                description: `${product?._count.integrations ?? 0} aktif bağlantı, daha fazlası hazır.`,
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-start gap-3 rounded-[12px] border border-[#e8e8e8] bg-white px-4 py-3 transition hover:border-[#d0d0d0] hover:bg-[#fafafa]"
              >
                <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-[#95dbda] shrink-0" />
                <div>
                  <p className="text-[14px] font-semibold text-[#0d0d12]">{item.title}</p>
                  <p className="mt-0.5 text-[13px] text-[#666d80]">{item.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Goal pulse */}
        <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Hedef nabzı</p>
          <h2 className="mt-1 text-[18px] font-semibold text-[#0d0d12] tracking-[-0.01em]">Aktif büyüme hedefleri</h2>

          {product?._count.goals === 0 ? (
            <div className="mt-6 rounded-[12px] border border-dashed border-[#e8e8e8] bg-[#f6f6f6] px-5 py-10 text-center">
              <p className="text-[14px] font-semibold text-[#0d0d12]">Henüz hedef yok</p>
              <p className="mt-1 text-[13px] text-[#666d80]">
                Haftalık rutinlerin bir yönü olsun diye ölçülebilir bir hedef belirle.
              </p>
              <Link
                href={`/${locale}/growth`}
                className="mt-5 inline-flex items-center px-4 h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition"
              >
                İlk hedefi oluştur
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-[12px] border border-[#e8e8e8] bg-white px-5 py-5">
              <p className="text-[36px] font-bold text-[#0d0d12] leading-none tracking-[-0.03em]">
                {product?._count.goals}
              </p>
              <p className="mt-2 text-[13px] text-[#666d80]">
                Aktif hedef{product?._count.goals !== 1 ? "" : ""} growth workspace&apos;te takip ediliyor.
              </p>
              <Link
                href={`/${locale}/growth`}
                className="mt-4 inline-flex text-[13px] font-semibold text-[#0d0d12] hover:text-[#666d80] transition"
              >
                Hedeflere git →
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
