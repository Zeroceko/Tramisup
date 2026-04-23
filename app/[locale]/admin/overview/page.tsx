import Link from "next/link";
import { PlanTier, ProductStatus, SubStatus } from "@prisma/client";
import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminOverviewData } from "@/lib/admin/queries";
import {
  formatPlanLabel,
  formatProductStatusLabel,
  formatSubscriptionStatusLabel,
  formatGrowthStateLabel,
  type GrowthReadinessState,
} from "@/lib/admin/insights";

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default async function AdminOverviewPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const data = await getAdminOverviewData();
  const paidUsers = data.users.planCounts.STARTER + data.users.planCounts.PRO;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / Overview" : "Admin / Genel bakış"}
        </p>
        <h2 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Core ops snapshot" : "Temel operasyon görünümü"}
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "See where demand, paid conversion, product stage, and AI load stand right now."
            : "Talep, ücretli dönüşüm, ürün aşaması ve AI yükünün şu anki durumunu tek ekranda gör."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard
          label={isEn ? "Total users" : "Toplam kullanıcı"}
          value={data.users.total}
          hint={isEn ? `${data.users.verified} verified users` : `${data.users.verified} doğrulanmış kullanıcı`}
          tone="teal"
        />
        <AdminStatCard
          label={isEn ? "Paid users" : "Ücretli kullanıcı"}
          value={paidUsers}
          hint={isEn ? "Starter + Pro" : "Starter + Pro"}
          tone="green"
        />
        <AdminStatCard
          label={isEn ? "Products" : "Ürün"}
          value={data.products.total}
          hint={isEn ? "Across all founders" : "Tüm kurucular genelinde"}
          tone="yellow"
        />
        <AdminStatCard
          label={isEn ? "AI messages" : "AI mesajı"}
          value={data.usageTotals.aiMessages}
          hint={isEn ? "Current month" : "Bu ay"}
          tone="pink"
        />
        <AdminStatCard
          label={isEn ? "Founder return" : "Geri dönen kurucu"}
          value={formatPercent(data.founderReturn.returnedRate)}
          hint={isEn ? `Proxy, last ${data.founderReturn.windowDays} days` : `Proxy, son ${data.founderReturn.windowDays} gün`}
          tone="teal"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Is AI helping?" : "AI gerçekten yardım ediyor mu?"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn
              ? "Proxy: do AI-created tasks turn into real action?"
              : "Proxy: AI'dan gelen görevler gerçekten harekete dönüşüyor mu?"}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <AdminStatCard label={isEn ? "AI tasks" : "AI görevi"} value={data.aiEffectiveness.totalAiTasks} tone="teal" />
            <AdminStatCard label={isEn ? "Coach tasks" : "Coach görevi"} value={data.aiEffectiveness.coachTasks} tone="yellow" />
            <AdminStatCard
              label={isEn ? "Suggestion loads" : "Öneri yüklenmesi"}
              value={data.aiEffectiveness.suggestionLoads}
              hint={isEn ? "Agent panels with visible suggestions" : "Öneri görünen agent panelleri"}
              tone="teal"
            />
            <AdminStatCard
              label={isEn ? "Suggestion -> task" : "Öneriden göreve"}
              value={formatPercent(data.aiEffectiveness.suggestionActivationRate)}
              hint={`${data.aiEffectiveness.suggestionActivations}/${data.aiEffectiveness.suggestionLoads}`}
              tone="green"
            />
            <AdminStatCard
              label={isEn ? "Acted on" : "Aksiyona dönen"}
              value={formatPercent(data.aiEffectiveness.actedOnRate)}
              hint={`${data.aiEffectiveness.actedOnTasks}/${data.aiEffectiveness.totalAiTasks}`}
              tone="green"
            />
            <AdminStatCard
              label={isEn ? "Completed" : "Tamamlanan"}
              value={formatPercent(data.aiEffectiveness.completedRate)}
              hint={
                data.aiEffectiveness.suggestionDedupedActivations > 0
                  ? `${data.aiEffectiveness.completedTasks}/${data.aiEffectiveness.totalAiTasks} · ${data.aiEffectiveness.suggestionDedupedActivations} deduped`
                  : `${data.aiEffectiveness.completedTasks}/${data.aiEffectiveness.totalAiTasks}`
              }
              tone="pink"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Where does AI convert?" : "AI en çok nerede dönüyor?"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn
              ? "Suggestion-to-task conversion by product surface."
              : "Öneriden göreve dönüşümün ürün yüzeyine göre dağılımı."}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <AdminStatCard
              label={isEn ? "Overview" : "Genel Bakış"}
              value={formatPercent(data.aiEffectiveness.bySurface.overview.activationRate)}
              hint={`${data.aiEffectiveness.bySurface.overview.activations}/${data.aiEffectiveness.bySurface.overview.loads}`}
              tone="teal"
            />
            <AdminStatCard
              label={isEn ? "Launch" : "Yayın Hazırlığı"}
              value={formatPercent(data.aiEffectiveness.bySurface.launch.activationRate)}
              hint={`${data.aiEffectiveness.bySurface.launch.activations}/${data.aiEffectiveness.bySurface.launch.loads}`}
              tone="yellow"
            />
            <AdminStatCard
              label={isEn ? "Growth" : "Büyüme"}
              value={formatPercent(data.aiEffectiveness.bySurface.growth.activationRate)}
              hint={`${data.aiEffectiveness.bySurface.growth.activations}/${data.aiEffectiveness.bySurface.growth.loads}`}
              tone="green"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Do founders return?" : "Kurucular geri dönüyor mu?"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn
              ? `Current proxy on founders with a new product in the last ${data.founderReturn.windowDays} days.`
              : `Son ${data.founderReturn.windowDays} günde yeni ürün oluşturan kurucular için mevcut proxy.`}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <AdminStatCard label={isEn ? "Cohort" : "Kohort"} value={data.founderReturn.cohortUsers} tone="teal" />
            <AdminStatCard label={isEn ? "Returned" : "Geri dönen"} value={data.founderReturn.returnedUsers} tone="green" />
            <AdminStatCard
              label={isEn ? "Return rate" : "Dönüş oranı"}
              value={formatPercent(data.founderReturn.returnedRate)}
              hint={
                data.founderReturn.mode === "event"
                  ? isEn ? "Measured from onboarding + app-session events" : "Onboarding + app-session event'lerinden ölçülüyor"
                  : isEn ? "Proxy until app-session event cohort fills in" : "App-session event kohortu dolana kadar proxy"
              }
              tone="yellow"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6 xl:col-span-2">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Onboarding to value" : "Onboarding'den değere gidiş"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn
              ? `Current-state funnel for products created in the last ${data.onboardingToValue.windowDays} days.`
              : `Son ${data.onboardingToValue.windowDays} günde oluşturulan ürünler için mevcut durum funnel'ı.`}
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-5">
            <AdminStatCard label={isEn ? "Created" : "Oluşturulan"} value={data.onboardingToValue.created} tone="teal" />
            <AdminStatCard label={isEn ? "Check-in" : "Check-in"} value={data.onboardingToValue.growthCheckin} tone="yellow" />
            <AdminStatCard label={isEn ? "Metric setup" : "Metric setup"} value={data.onboardingToValue.metricSetup} tone="green" />
            <AdminStatCard label={isEn ? "First entry" : "İlk veri girişi"} value={data.onboardingToValue.firstMetricEntry} tone="pink" />
            <AdminStatCard
              label={isEn ? "Diagnosis ready" : "Tanıya hazır"}
              value={data.onboardingToValue.diagnosisReady}
              hint={
                data.onboardingToValue.mode === "event"
                  ? isEn ? "Pure event funnel" : "Tam event funnel"
                  : isEn ? "Hybrid: event + current-state fallback" : "Hibrit: event + mevcut durum fallback"
              }
              tone="teal"
            />
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-[#0d0d12]">
                {isEn ? "Plan mix" : "Paket dağılımı"}
              </h3>
              <p className="mt-1 text-[13px] text-[#5e6678]">
                {isEn ? "Current effective plan by user." : "Kullanıcı başına efektif güncel plan."}
              </p>
            </div>
            <Link href={`/${locale}/admin/billing`} className="text-[12px] font-semibold text-[#0d0d12] underline-offset-4 hover:underline">
              {isEn ? "Open billing" : "Paket görünümüne git"}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {Object.entries(data.users.planCounts).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between rounded-[18px] bg-[#faf8f4] px-4 py-3">
                <span className="text-[14px] font-medium text-[#0d0d12]">
                  {formatPlanLabel(plan as PlanTier, locale)}
                </span>
                <span className="text-[18px] font-semibold text-[#0d0d12]">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Subscription health" : "Abonelik sağlığı"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn ? "Only active subscription records live here." : "Yalnızca abonelik kayıtlarının durumu."}
          </p>
          <div className="mt-5 space-y-3">
            {Object.entries(data.subscriptions).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-[18px] bg-[#faf8f4] px-4 py-3">
                <span className="text-[14px] font-medium text-[#0d0d12]">
                  {formatSubscriptionStatusLabel(status as SubStatus, locale)}
                </span>
                <span className="text-[18px] font-semibold text-[#0d0d12]">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-[#0d0d12]">
                {isEn ? "Product stage mix" : "Ürün aşama dağılımı"}
              </h3>
              <p className="mt-1 text-[13px] text-[#5e6678]">
                {isEn ? "Where founders are across pre-launch, launch, and growth." : "Kurucuların launch öncesi, yayında ve büyüme aşamalarındaki dağılımı."}
              </p>
            </div>
            <Link href={`/${locale}/admin/products`} className="text-[12px] font-semibold text-[#0d0d12] underline-offset-4 hover:underline">
              {isEn ? "Open products" : "Ürünlere git"}
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {Object.entries(data.products.stageCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between rounded-[18px] bg-[#faf8f4] px-4 py-3">
                <span className="text-[14px] font-medium text-[#0d0d12]">
                  {formatProductStatusLabel(status as ProductStatus, locale)}
                </span>
                <span className="text-[18px] font-semibold text-[#0d0d12]">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6">
          <h3 className="text-[18px] font-semibold text-[#0d0d12]">
            {isEn ? "Growth readiness funnel" : "Growth readiness funnel"}
          </h3>
          <p className="mt-1 text-[13px] text-[#5e6678]">
            {isEn
              ? "Launched and growing products only."
              : "Yalnızca yayında ve büyüyen ürünler için."}
          </p>
          <div className="mt-5 space-y-3">
            {Object.entries(data.products.growthReadiness).map(([state, count]) => (
              <div key={state} className="flex items-center justify-between rounded-[18px] bg-[#faf8f4] px-4 py-3">
                <span className="text-[14px] font-medium text-[#0d0d12]">
                  {formatGrowthStateLabel(state as GrowthReadinessState, locale)}
                </span>
                <span className="text-[18px] font-semibold text-[#0d0d12]">{count}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-[24px] border border-[#e8e4de] bg-white p-6 xl:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h3 className="text-[18px] font-semibold text-[#0d0d12]">
                {isEn ? "Waitlist pulse" : "Waitlist durumu"}
              </h3>
              <p className="mt-1 text-[13px] text-[#5e6678]">
                {isEn ? "Quick read on top-of-funnel demand." : "Funnel üstü talebin hızlı görünümü."}
              </p>
            </div>
            <Link href={`/${locale}/admin/waitlist`} className="text-[12px] font-semibold text-[#0d0d12] underline-offset-4 hover:underline">
              {isEn ? "Open waitlist" : "Waitlist'e git"}
            </Link>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-5">
            <AdminStatCard label={isEn ? "Total" : "Toplam"} value={data.waitlist.total} tone="teal" />
            <AdminStatCard label={isEn ? "Pending" : "Bekleyen"} value={data.waitlist.pending} tone="yellow" />
            <AdminStatCard label={isEn ? "Approved" : "Onaylanan"} value={data.waitlist.approved} tone="green" />
            <AdminStatCard label={isEn ? "Invited" : "Davet edilen"} value={data.waitlist.invited} tone="pink" />
            <AdminStatCard label={isEn ? "Rejected" : "Reddedilen"} value={data.waitlist.rejected} tone="pink" />
          </div>
        </section>
      </div>
    </div>
  );
}
