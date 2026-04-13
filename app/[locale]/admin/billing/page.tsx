import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminBillingData } from "@/lib/admin/queries";
import {
  formatAdminDate,
  formatPlanLabel,
  formatSubscriptionStatusLabel,
} from "@/lib/admin/insights";

export default async function AdminBillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const data = await getAdminBillingData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / Billing" : "Admin / Paketler"}
        </p>
        <h2 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Plan and subscription view" : "Paket ve abonelik görünümü"}
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "Track paid conversion, plan distribution, and the current health of subscription records."
            : "Ücretli dönüşümü, plan dağılımını ve abonelik kayıtlarının güncel durumunu takip et."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label={isEn ? "Free users" : "Ücretsiz kullanıcı"} value={data.freeUsers} tone="yellow" />
        <AdminStatCard label={isEn ? "Paid users" : "Ücretli kullanıcı"} value={data.paidUsers} tone="green" />
        <AdminStatCard label="Free" value={data.planCounts.FREE} tone="teal" />
        <AdminStatCard label="Starter" value={data.planCounts.STARTER} tone="pink" />
        <AdminStatCard label="Pro" value={data.planCounts.PRO} tone="teal" />
      </div>

      <div className="rounded-[24px] border border-[#e8e4de] bg-white p-5">
        <h3 className="text-[18px] font-semibold text-[#0d0d12]">
          {isEn ? "Free vs paid summary" : "Ücretsiz vs ücretli özeti"}
        </h3>
        <p className="mt-2 text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? `${data.paidUsers} users are currently on Starter or Pro, while ${data.freeUsers} remain on Free.`
            : `${data.paidUsers} kullanıcı şu anda Starter veya Pro planında, ${data.freeUsers} kullanıcı ise Free planında.`}
        </p>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#e8e4de] bg-white shadow-[0_18px_50px_rgba(17,16,20,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#efeae2] bg-[#fcfbf8]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "User" : "Kullanıcı"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Plan" : "Paket"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Interval" : "Periyot"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Status" : "Durum"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Current period end" : "Dönem bitişi"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  Stripe
                </th>
              </tr>
            </thead>
            <tbody>
              {data.subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-[14px] text-[#5e6678]">
                    {isEn ? "No subscription records yet." : "Henüz abonelik kaydı yok."}
                  </td>
                </tr>
              ) : (
                data.subscriptions.map((subscription) => (
                  <tr key={subscription.id} className="border-b border-[#f3eee7] align-top last:border-b-0">
                    <td className="px-4 py-4 text-[13px] text-[#0d0d12]">
                      {subscription.user.email}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[13px] font-semibold text-[#0d0d12]">
                        {formatPlanLabel(subscription.plan, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {subscription.interval ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {formatSubscriptionStatusLabel(subscription.status, locale)}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {formatAdminDate(subscription.currentPeriodEnd, locale)}
                    </td>
                    <td className="px-4 py-4 text-[12px] leading-6 text-[#7b8393]">
                      <div>customer: {subscription.stripeCustomerId ?? "—"}</div>
                      <div>subscription: {subscription.stripeSubId ?? "—"}</div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
