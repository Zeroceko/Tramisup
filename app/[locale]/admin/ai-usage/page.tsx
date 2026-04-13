import AdminStatCard from "@/components/admin/AdminStatCard";
import { getAdminAiUsageData } from "@/lib/admin/queries";
import { formatPlanLabel } from "@/lib/admin/insights";

export default async function AdminAiUsagePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const data = await getAdminAiUsageData();

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / AI usage" : "Admin / AI kullanımı"}
        </p>
        <h2 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Current-month AI load" : "Bu ayki AI yükü"}
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "UsageEvent is the source of truth here, so this view focuses on volume rather than cost."
            : "Burada source of truth UsageEvent olduğu için bu görünüm maliyetten çok hacme odaklanır."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label={isEn ? "AI messages" : "AI mesajı"}
          value={data.totals.aiMessages}
          hint={isEn ? "Current month total" : "Bu ay toplam"}
          tone="pink"
        />
        <AdminStatCard
          label={isEn ? "AI suggestions" : "AI önerisi"}
          value={data.totals.aiSuggestions}
          hint={isEn ? "Current month total" : "Bu ay toplam"}
          tone="teal"
        />
        <AdminStatCard
          label={isEn ? "Tracked users" : "Takip edilen kullanıcı"}
          value={data.rows.length}
          hint={isEn ? "Users with at least one event this month" : "Bu ay en az bir event üreten kullanıcı"}
          tone="green"
        />
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
                  {isEn ? "Products" : "Ürün"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Messages" : "Mesaj"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Suggestions" : "Öneri"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Total usage" : "Toplam kullanım"}
                </th>
              </tr>
            </thead>
            <tbody>
              {data.rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-[14px] text-[#5e6678]">
                    {isEn ? "No AI usage recorded this month." : "Bu ay henüz AI kullanımı kaydedilmedi."}
                  </td>
                </tr>
              ) : (
                data.rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f3eee7] align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-[14px] font-semibold text-[#0d0d12]">
                        {row.name || (isEn ? "Unnamed user" : "İsimsiz kullanıcı")}
                      </p>
                      <p className="mt-1 text-[13px] text-[#5e6678]">{row.email}</p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {formatPlanLabel(row.currentPlan, locale)}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {row.productCount}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {row.aiMessagesThisMonth}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {row.aiSuggestionsThisMonth}
                    </td>
                    <td className="px-4 py-4 text-[13px] font-semibold text-[#0d0d12]">
                      {row.totalUsageThisMonth}
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
