import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { getAdminUsersData } from "@/lib/admin/queries";
import {
  formatAdminDate,
  formatAdminDateTime,
  formatPlanLabel,
  formatProductStatusLabel,
  formatSubscriptionStatusLabel,
} from "@/lib/admin/insights";

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

export default async function AdminUsersPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    plan?: string | string[];
    subscriptionStatus?: string | string[];
    emailVerified?: string | string[];
    stage?: string | string[];
  }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const resolvedSearch = await searchParams;
  const filters = {
    q: readSearchParam(resolvedSearch.q),
    plan: readSearchParam(resolvedSearch.plan),
    subscriptionStatus: readSearchParam(resolvedSearch.subscriptionStatus),
    emailVerified: readSearchParam(resolvedSearch.emailVerified),
    stage: readSearchParam(resolvedSearch.stage),
  };

  const rows = await getAdminUsersData(filters, locale);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / Users" : "Admin / Kullanıcılar"}
        </p>
        <h2 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Founder list" : "Kurucu listesi"}
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "Filter users by plan, stage, verification, and current-month AI usage."
            : "Kullanıcıları paket, aşama, doğrulama ve bu ayki AI kullanımı üzerinden filtrele."}
        </p>
      </div>

      <form method="get" className="grid gap-3 rounded-[24px] border border-[#e8e4de] bg-white p-4 md:grid-cols-2 xl:grid-cols-6">
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder={isEn ? "Search email or name" : "Email veya isim ara"}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        />
        <select
          name="plan"
          defaultValue={filters.plan}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All plans" : "Tüm planlar"}</option>
          <option value="FREE">{isEn ? "Free" : "Ücretsiz"}</option>
          <option value="STARTER">Starter</option>
          <option value="PRO">Pro</option>
        </select>
        <select
          name="subscriptionStatus"
          defaultValue={filters.subscriptionStatus}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All billing states" : "Tüm abonelik durumları"}</option>
          <option value="ACTIVE">{isEn ? "Active" : "Aktif"}</option>
          <option value="PAST_DUE">{isEn ? "Past due" : "Gecikmiş"}</option>
          <option value="CANCELED">{isEn ? "Canceled" : "İptal"}</option>
        </select>
        <select
          name="emailVerified"
          defaultValue={filters.emailVerified}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All verification states" : "Tüm doğrulama durumları"}</option>
          <option value="verified">{isEn ? "Verified" : "Doğrulanmış"}</option>
          <option value="unverified">{isEn ? "Unverified" : "Doğrulanmamış"}</option>
        </select>
        <select
          name="stage"
          defaultValue={filters.stage}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All product stages" : "Tüm ürün aşamaları"}</option>
          <option value="PRE_LAUNCH">{formatProductStatusLabel(ProductStatus.PRE_LAUNCH, locale)}</option>
          <option value="LAUNCHED">{formatProductStatusLabel(ProductStatus.LAUNCHED, locale)}</option>
          <option value="GROWING">{formatProductStatusLabel(ProductStatus.GROWING, locale)}</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#0d0d12] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1b1b24]"
          >
            {isEn ? "Apply filters" : "Filtreleri uygula"}
          </button>
          <Link
            href={`/${locale}/admin/users`}
            className="inline-flex h-11 items-center justify-center rounded-[14px] border border-[#e8e4de] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#faf8f4]"
          >
            {isEn ? "Reset" : "Sıfırla"}
          </Link>
        </div>
      </form>

      <div className="overflow-hidden rounded-[24px] border border-[#e8e4de] bg-white shadow-[0_18px_50px_rgba(17,16,20,0.06)]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-[#efeae2] bg-[#fcfbf8]">
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "User" : "Kullanıcı"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Joined" : "Katılım"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Plan" : "Paket"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Products" : "Ürünler"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "AI usage (month)" : "AI kullanımı (ay)"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Stage summary" : "Aşama özeti"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Last activity" : "Son aktivite"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-14 text-center text-[14px] text-[#5e6678]">
                    {isEn ? "No users matched these filters." : "Bu filtrelerle eşleşen kullanıcı bulunamadı."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f3eee7] align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-[14px] font-semibold text-[#0d0d12]">
                        {row.name || (isEn ? "Unnamed user" : "İsimsiz kullanıcı")}
                      </p>
                      <p className="mt-1 text-[13px] text-[#5e6678]">{row.email}</p>
                      <p className="mt-2 text-[12px] text-[#7b8393]">
                        {row.emailVerified ? (isEn ? "Verified" : "Doğrulanmış") : (isEn ? "Unverified" : "Doğrulanmamış")}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {formatAdminDate(row.createdAt, locale)}
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[13px] font-semibold text-[#0d0d12]">
                        {formatPlanLabel(row.currentPlan, locale)}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7b8393]">
                        {formatSubscriptionStatusLabel(row.subscriptionStatus, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {row.productCount}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      <div>{isEn ? "Messages" : "Mesaj"}: {row.aiMessagesThisMonth}</div>
                      <div className="mt-1">{isEn ? "Suggestions" : "Öneri"}: {row.aiSuggestionsThisMonth}</div>
                    </td>
                    <td className="px-4 py-4 text-[13px] leading-6 text-[#5e6678]">
                      {row.stageSummary}
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {formatAdminDateTime(row.lastActivityAt, locale)}
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
