import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import { parseSavedMetricSetup } from "@/lib/metric-setup";

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
        growthChecklists: true,
        tasks: true,
        metrics: true,
        goals: true,
        integrations: { where: { status: "CONNECTED" } },
      },
    },
  } as const;

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

        <section className="mt-6 rounded-[20px] border border-dashed border-[#d9d9d9] bg-white p-8 text-center sm:p-10">
          <div className="mx-auto max-w-2xl">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#f0fafa] text-[24px]">
              🚀
            </div>
            <h2 className="text-[24px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
              Henüz bir ürünün yok
            </h2>
            <p className="mt-3 text-[14px] leading-7 text-[#666d80]">
              İlk ürünü oluşturduğunda Founder Coach buna göre checklist ve growth başlangıcını hazırlar.
            </p>
            <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={`/${locale}/products/new`}
                className="inline-flex h-11 items-center justify-center rounded-full bg-[#ffd7ef] px-5 text-[14px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                İlk ürününü oluştur
              </Link>
              <Link
                href={`/${locale}/products`}
                className="inline-flex h-11 items-center justify-center rounded-full border border-[#e8e8e8] px-5 text-[14px] font-medium text-[#666d80] transition hover:bg-[#f6f6f6]"
              >
                Ürünler sayfasına git
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  const [completedLaunchChecklists, completedGrowthChecklists, latestMetric] = await Promise.all([
    prisma.launchChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.growthChecklist.count({ where: { productId: product.id, completed: true } }),
    prisma.metric.findFirst({ where: { productId: product.id }, orderBy: { date: "desc" } }),
  ]);

  const launchTotal = product._count.launchChecklists || 0;
  const growthTotal = product._count.growthChecklists || 0;
  const savedMetricSetup = parseSavedMetricSetup(product.launchGoals);
  const selectedMetricCount = savedMetricSetup?.selections.reduce(
    (sum, item) => sum + item.selectedMetricKeys.length,
    0
  ) ?? 0;

  const isLaunched = product.status === "LAUNCHED";
  const readinessScore = launchTotal > 0 ? Math.round((completedLaunchChecklists / launchTotal) * 100) : 0;
  const growthScore = growthTotal > 0 ? Math.round((completedGrowthChecklists / growthTotal) * 100) : 0;

  const metricStatusLabel = selectedMetricCount > 0
    ? `${selectedMetricCount} metrik seçildi`
    : "Henüz seçim yok";
  const nextStep = !isLaunched
    ? {
        href: `/${locale}/pre-launch`,
        title: "Yayına hazırlığı tamamla",
        description: `${completedLaunchChecklists}/${launchTotal} hazırlık maddesi tamamlandı. Önce kritik eksikleri kapat.`,
      }
    : selectedMetricCount === 0
      ? {
          href: `/${locale}/growth`,
          title: "Büyüme takibini kur",
          description: "Önce her kategori için 1 ana metrik seç. Sonraki adım günlük veri girişi olacak.",
        }
      : !latestMetric && !(savedMetricSetup?.entries?.length)
        ? {
            href: `/${locale}/metrics`,
            title: "İlk metrik girişini yap",
            description: "Seçtiğin metrikler hazır. Şimdi bugünkü ilk değerleri gir.",
          }
        : {
            href: `/${locale}/metrics`,
            title: "Bugünkü performansı kontrol et",
            description: "Günlük veri girişini güncelle ve seçtiğin AARRR metriklerinin nasıl gittiğini gör.",
          };

  return (
    <div>
      <PageHeader
        eyebrow="Genel Bakış"
        title={`Hoş geldin${session?.user?.name ? `, ${session.user.name}` : ""}`}
        description={
          isLaunched
            ? "Yayındaki ürünün için growth setup'ını, hedeflerini ve takip düzenini buradan yönet."
            : "Founder Coach’un hazırladığı launch checklist'i tamamlayıp yayına hazırlığını buradan ilerlet."
        }
        actions={
          <>
            <Link
              href={isLaunched ? `/${locale}/growth` : `/${locale}/pre-launch`}
              className="inline-flex h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {isLaunched ? "Growth setup" : "Launch board"}
            </Link>
            <Link
              href={`/${locale}/metrics`}
              className="inline-flex h-9 items-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-medium text-[#666d80] transition hover:bg-[#f6f6f6]"
            >
              Metrics ekranı
            </Link>
          </>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Ürün durumu"
          value={product.launchStatus || product.status.replace("_", " ")}
          hint="Seçtiğin mevcut aşama"
          accent="pink"
        />
        <StatCard
          label={isLaunched ? "Growth checklist" : "Hazırlık skoru"}
          value={isLaunched ? `${growthScore}%` : `${readinessScore}%`}
          hint={
            isLaunched
              ? `${completedGrowthChecklists}/${growthTotal} growth maddesi tamamlandı`
              : `${completedLaunchChecklists}/${launchTotal} launch maddesi tamamlandı`
          }
          accent="teal"
        />
        <StatCard
          label="Takip setup'ı"
          value={metricStatusLabel}
          hint="Growth sayfasında seçilen funnel metrikleri"
          accent="green"
        />
        <StatCard
          label="Aktif hedefler"
          value={product._count.goals ? String(product._count.goals) : "—"}
          hint={product._count.goals ? "Tanımlanmış hedef sayısı" : "Henüz hedef eklenmedi"}
          accent="yellow"
        />
      </section>

      <section className="mt-6 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
          <div className="mb-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Sıradaki adım</p>
            <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
              {nextStep.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[13px] leading-6 text-[#666d80]">{nextStep.description}</p>
          </div>

          <Link
            href={nextStep.href}
            className="inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
          >
            Devam et
          </Link>
        </div>

        <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">Hedef nabzı</p>
          <h2 className="mt-1 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">Aktif büyüme hedefleri</h2>

          {product._count.goals === 0 ? (
            <div className="mt-6 rounded-[12px] border border-dashed border-[#e8e8e8] bg-[#f6f6f6] px-5 py-10 text-center">
              <p className="text-[14px] font-semibold text-[#0d0d12]">Henüz hedef yok</p>
              <p className="mt-1 text-[13px] text-[#666d80]">
                {isLaunched
                  ? "Metrik setup'ını seçtikten sonra bunları bir growth hedefine bağla."
                  : "Şimdilik normal. Önce yayına hazırlığı bitir, sonra hedef koy."}
              </p>
              <Link
                href={isLaunched ? `/${locale}/growth` : `/${locale}/pre-launch`}
                className="mt-5 inline-flex h-9 items-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
              >
                {isLaunched ? "Growth alanına git" : "Launch board'a git"}
              </Link>
            </div>
          ) : (
            <div className="mt-6 rounded-[12px] border border-[#e8e8e8] bg-white px-5 py-5">
              <p className="text-[36px] font-bold leading-none tracking-[-0.03em] text-[#0d0d12]">
                {product._count.goals}
              </p>
              <p className="mt-2 text-[13px] text-[#666d80]">
                Aktif hedefler growth workspace&apos;te takip ediliyor.
              </p>
              <Link
                href={`/${locale}/growth`}
                className="mt-4 inline-flex text-[13px] font-semibold text-[#0d0d12] transition hover:text-[#666d80]"
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
