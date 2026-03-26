import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getActiveProductId } from "@/lib/activeProduct";
import Link from "next/link";
import PageHeader from "@/components/PageHeader";
import StatCard from "@/components/StatCard";
import FirstRunOnboarding from "@/components/FirstRunOnboarding";
import { getMetricSetup } from "@/lib/metric-setup";
import TiramisupAdviceCard from "@/components/TiramisupAdviceCard";
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
          eyebrow={locale === "en" ? "Overview" : "Ürünün laucha ne kadar hazır?"}
          title={locale === "en"
            ? `Welcome${session?.user?.name ? `, ${session.user.name}` : ""}`
            : `Hoş geldin${session?.user?.name ? `, ${session.user.name}` : ""}`}
          titleSuffix="👋"
        />
        <FirstRunOnboarding locale={locale} userName={session?.user?.name} userEmail={session?.user?.email} />
      </div>
    );
  }

  const [completedLaunchChecklists, completedGrowthChecklists, latestMetric, taskCounts] =
    await Promise.all([
      prisma.launchChecklist.count({ where: { productId: product.id, completed: true } }),
      prisma.growthChecklist.count({ where: { productId: product.id, completed: true } }),
      prisma.metric.findFirst({ where: { productId: product.id }, orderBy: { date: "desc" } }),
      prisma.task.groupBy({
        by: ["status"],
        where: { productId: product.id },
        _count: true,
      }),
    ]);

  const launchTotal = product._count.launchChecklists || 0;
  const growthTotal = product._count.growthChecklists || 0;
  const savedMetricSetup = await getMetricSetup(product.id);
  const founderSummary = savedMetricSetup?.founderSummary;
  const selectedMetricCount =
    savedMetricSetup?.selections.reduce(
      (sum, item) => sum + item.selectedMetricKeys.length,
      0
    ) ?? 0;

  const isLaunched = product.status === "LAUNCHED" || product.status === "GROWING";
  const readinessScore =
    launchTotal > 0 ? Math.round((completedLaunchChecklists / launchTotal) * 100) : 0;
  const growthScore =
    growthTotal > 0 ? Math.round((completedGrowthChecklists / growthTotal) * 100) : 0;

  const totalTasks = product._count.tasks;
  const pendingTasks = taskCounts.find((t) => t.status === "TODO")?._count ?? 0;
  const doneTasks = taskCounts.find((t) => t.status === "DONE")?._count ?? 0;

  const nextStep = !isLaunched
    ? {
        href: `/${locale}/pre-launch`,
        label: "Launch hazırlığına git →",
        title: "Yayına hazırlığı tamamla",
        description: `${completedLaunchChecklists}/${launchTotal} hazırlık maddesi tamamlandı`,
      }
    : selectedMetricCount === 0
      ? {
          href: `/${locale}/growth`,
          label: "Growth setup'a git →",
          title: "Büyüme takibini kur",
          description: "Her kategori için 1 metrik seç",
        }
      : !latestMetric
        ? {
            href: `/${locale}/metrics`,
            label: "Metrik gir →",
            title: "İlk metrik girişini yap",
            description: "Seçtiğin metrikler hazır, bugünkü değerleri gir",
          }
        : {
            href: `/${locale}/metrics`,
            label: "Performansı gör →",
            title: "Bugünkü performansı kontrol et",
            description: "Günlük AARRR verilerini güncelle",
          };

  return (
    <div>
      {/* Page header — Figma style */}
      <PageHeader
        eyebrow="Ürünün laucha ne kadar hazır?"
        title={product.name}
        titleSuffix="👋"
        description={
          founderSummary?.summary
            ?? (isLaunched
              ? "Yayındaki ürünün için growth ve hedef takibini buradan yönet."
              : "Launch checklist'i tamamlayıp yayına hazırlığını ilerlet.")
        }
      />

      {/* Stat cards row — 3 cards like Figma */}
      <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-3">
        <StatCard
          label="Toplam Görev"
          value={String(totalTasks)}
          hint={`${pendingTasks} bekliyor`}
          accent="teal"
          progress={totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}
        />
        <StatCard
          label="Bekleyen Görev"
          value={String(pendingTasks)}
          hint="Henüz başlanmadı"
          accent="pink"
          progress={totalTasks > 0 ? Math.round((pendingTasks / totalTasks) * 100) : 0}
        />
        <StatCard
          label={isLaunched ? "Growth skoru" : "Hazırlık skoru"}
          value={isLaunched ? `${growthScore}%` : `${readinessScore}%`}
          hint={
            isLaunched
              ? `${completedGrowthChecklists}/${growthTotal} growth maddesi`
              : `${completedLaunchChecklists}/${launchTotal} launch maddesi`
          }
          accent="yellow"
          progress={isLaunched ? growthScore : readinessScore}
        />
      </section>

      {/* Main 2-col layout */}
      <section className="mt-6 grid gap-4 xl:grid-cols-[1fr_360px]">

        {/* Left col */}
        <div className="space-y-4">

          {/* Tiramisup summary (if available) */}
          {founderSummary && (
            <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                Tiramisup özeti
              </p>
              <h2 className="mt-2 text-[20px] font-semibold tracking-[-0.02em] text-[#0d0d12]">
                {founderSummary.headline}
              </h2>
              <p className="mt-2 text-[14px] leading-7 text-[#5e6678]">
                {founderSummary.summary}
              </p>
              <div className="mt-4 rounded-[12px] bg-[#f8fbfb] px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                  Bir sonraki doğru adım
                </p>
                <p className="mt-1 text-[14px] font-semibold text-[#0d0d12]">
                  {founderSummary.nextStep}
                </p>
              </div>
            </div>
          )}

          {/* AI Advisor Integrated Card */}
          <TiramisupAdviceCard productId={product.id} stage={product.launchStatus || (product.status?.replace("_", " ") ?? "PRE_LAUNCH")} />

          {/* Next step card */}
          <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                  Sıradaki adım
                </p>
                <h2 className="mt-1.5 text-[18px] font-semibold tracking-[-0.01em] text-[#0d0d12]">
                  {nextStep.title}
                </h2>
                <p className="mt-1 text-[13px] leading-6 text-[#666d80]">
                  {nextStep.description}
                </p>
              </div>
            </div>
            <Link
              href={nextStep.href}
              className="mt-5 inline-flex h-10 items-center rounded-full bg-[#ffd7ef] px-5 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {nextStep.label}
            </Link>
          </div>

          {/* Product details card */}
          <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
              Ürün özeti
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                <p className="text-[11px] text-[#666d80]">Aşama</p>
                <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                  {product.launchStatus || product.status.replace("_", " ")}
                </p>
              </div>
              {product.category && (
                <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                  <p className="text-[11px] text-[#666d80]">Kategori</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                    {product.category}
                  </p>
                </div>
              )}
              {product.targetAudience && (
                <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                  <p className="text-[11px] text-[#666d80]">Kitle</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                    {product.targetAudience}
                  </p>
                </div>
              )}
              {product.businessModel && (
                <div className="rounded-[12px] bg-[#f8f8f8] px-4 py-3">
                  <p className="text-[11px] text-[#666d80]">Model</p>
                  <p className="mt-0.5 text-[14px] font-semibold text-[#0d0d12]">
                    {product.businessModel}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col — Figma: notes/quick links panel */}
        <div className="space-y-4">

          {/* Quick links panel */}
          <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
              Hızlı erişim
            </p>
            <div className="space-y-2">
              {[
                {
                  href: `/${locale}/pre-launch`,
                  label: "Launch hazırlığı",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/><path d="M12 8v4l3 3"/>
                    </svg>
                  ),
                  sub: `${completedLaunchChecklists}/${launchTotal} tamamlandı`,
                },
                {
                  href: `/${locale}/growth`,
                  label: isLaunched ? "Metrik odağı" : "Growth önizlemesi",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/>
                    </svg>
                  ),
                  sub: isLaunched
                    ? selectedMetricCount > 0
                      ? `${selectedMetricCount} ana metrik seçili`
                      : "Takip setini seç"
                    : "Launch sonrası burada açılacak",
                },
                {
                  href: `/${locale}/tasks`,
                  label: "Görevler",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
                    </svg>
                  ),
                  sub: totalTasks > 0 ? `${pendingTasks} sırada bekliyor` : "Henüz görev yok",
                },
                {
                  href: `/${locale}/metrics`,
                  label: "Metrikler",
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="12" width="4" height="9"/><rect x="10" y="7" width="4" height="14"/><rect x="17" y="3" width="4" height="18"/>
                    </svg>
                  ),
                  sub: latestMetric ? "Bugünkü değişimi gör" : "İlk veri girişini başlat",
                },
              ].map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-[10px] border border-[#f0f0f0] bg-[#fafafa] px-4 py-3 transition hover:border-[#e0e0e0] hover:bg-white"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-white border border-[#ebebeb] text-[#5e6678]">{link.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#0d0d12]">{link.label}</p>
                    <p className="text-[11px] text-[#666d80]">{link.sub}</p>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#b0b8c8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Goals panel */}
          <div className="rounded-[15px] border border-[#e8e8e8] bg-white p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80]">
                Aktif hedefler
              </p>
              <span className="text-[20px] font-bold text-[#0d0d12] leading-none">
                {product._count.goals || "—"}
              </span>
            </div>
            {product._count.goals === 0 ? (
              <p className="text-[13px] text-[#666d80]">
                {isLaunched
                  ? "Growth setup'ını seç, sonra hedef koy."
                  : "Önce yayına hazırlığı bitir, sonra hedef koy."}
              </p>
            ) : (
              <Link
                href={`/${locale}/growth`}
                className="text-[13px] font-semibold text-[#0d0d12] hover:text-[#666d80] transition"
              >
                Hedeflere git →
              </Link>
            )}
          </div>

          {/* Metric tracking panel */}
          <div className="rounded-[15px] border border-[#0d0d12] bg-[#0d0d12] p-5 text-white">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-2">
              Metrik takibi
            </p>
            <p className="text-[16px] font-semibold leading-snug">
              {selectedMetricCount > 0
                ? `${selectedMetricCount} metrik aktif takipte`
                : "Henüz metrik seçilmedi"}
            </p>
            <Link
              href={selectedMetricCount > 0 ? `/${locale}/metrics` : `/${locale}/growth`}
              className="mt-4 inline-flex h-9 w-full items-center justify-center rounded-full bg-[#ffd7ef] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {selectedMetricCount > 0
                ? latestMetric
                  ? "Bugünkü veriyi gir"
                  : "İlk veriyi gir"
                : "Takip setini seç"}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
