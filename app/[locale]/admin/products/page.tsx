import Link from "next/link";
import { ProductStatus } from "@prisma/client";
import { getAdminProductsData } from "@/lib/admin/queries";
import {
  formatAdminDate,
  formatGrowthStateLabel,
  formatProductStatusLabel,
} from "@/lib/admin/insights";

function readSearchParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? "" : value ?? "";
}

function yesNo(value: boolean, locale: string) {
  return value ? (locale === "en" ? "Yes" : "Evet") : (locale === "en" ? "No" : "Hayır");
}

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    q?: string | string[];
    status?: string | string[];
    growthState?: string | string[];
  }>;
}) {
  const { locale } = await params;
  const isEn = locale === "en";
  const resolvedSearch = await searchParams;
  const filters = {
    q: readSearchParam(resolvedSearch.q),
    status: readSearchParam(resolvedSearch.status),
    growthState: readSearchParam(resolvedSearch.growthState),
  };

  const rows = await getAdminProductsData(filters);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / Products" : "Admin / Ürünler"}
        </p>
        <h2 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Product readiness" : "Ürün readiness görünümü"}
        </h2>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "See which products are blocked on check-ins, metrics, integrations, or execution throughput."
            : "Hangi ürünlerin check-in, metrik, entegrasyon veya execution akışında takıldığını gör."}
        </p>
      </div>

      <form method="get" className="grid gap-3 rounded-[24px] border border-[#e8e4de] bg-white p-4 md:grid-cols-2 xl:grid-cols-4">
        <input
          type="text"
          name="q"
          defaultValue={filters.q}
          placeholder={isEn ? "Search product or owner email" : "Ürün adı veya sahip emaili ara"}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        />
        <select
          name="status"
          defaultValue={filters.status}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All stages" : "Tüm aşamalar"}</option>
          <option value="PRE_LAUNCH">{formatProductStatusLabel(ProductStatus.PRE_LAUNCH, locale)}</option>
          <option value="LAUNCHED">{formatProductStatusLabel(ProductStatus.LAUNCHED, locale)}</option>
          <option value="GROWING">{formatProductStatusLabel(ProductStatus.GROWING, locale)}</option>
        </select>
        <select
          name="growthState"
          defaultValue={filters.growthState}
          className="h-11 rounded-[14px] border border-[#e8e4de] px-3 text-[13px] outline-none transition focus:border-[#95dbda]"
        >
          <option value="">{isEn ? "All growth states" : "Tüm growth durumları"}</option>
          <option value="missing_checkin">{formatGrowthStateLabel("missing_checkin", locale)}</option>
          <option value="missing_setup">{formatGrowthStateLabel("missing_setup", locale)}</option>
          <option value="missing_baseline">{formatGrowthStateLabel("missing_baseline", locale)}</option>
          <option value="diagnosis_ready">{formatGrowthStateLabel("diagnosis_ready", locale)}</option>
        </select>
        <div className="flex gap-2">
          <button
            type="submit"
            className="inline-flex h-11 flex-1 items-center justify-center rounded-[14px] bg-[#0d0d12] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1b1b24]"
          >
            {isEn ? "Apply filters" : "Filtreleri uygula"}
          </button>
          <Link
            href={`/${locale}/admin/products`}
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
                  {isEn ? "Product" : "Ürün"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Stage" : "Aşama"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Readiness" : "Hazırlık"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Metrics" : "Metrikler"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Integrations" : "Entegrasyonlar"}
                </th>
                <th className="px-4 py-3 text-left text-[12px] font-semibold uppercase tracking-[0.12em] text-[#7b8393]">
                  {isEn ? "Tasks" : "Görevler"}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-14 text-center text-[14px] text-[#5e6678]">
                    {isEn ? "No products matched these filters." : "Bu filtrelerle eşleşen ürün bulunamadı."}
                  </td>
                </tr>
              ) : (
                rows.map((row) => (
                  <tr key={row.id} className="border-b border-[#f3eee7] align-top last:border-b-0">
                    <td className="px-4 py-4">
                      <p className="text-[14px] font-semibold text-[#0d0d12]">{row.name}</p>
                      <p className="mt-1 text-[13px] text-[#5e6678]">{row.ownerEmail}</p>
                      <p className="mt-2 text-[12px] text-[#7b8393]">
                        {formatAdminDate(row.createdAt, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-[13px] font-semibold text-[#0d0d12]">
                        {formatProductStatusLabel(row.status, locale)}
                      </p>
                      <p className="mt-1 text-[12px] text-[#7b8393]">
                        {formatGrowthStateLabel(row.growthState, locale)}
                      </p>
                    </td>
                    <td className="px-4 py-4 text-[13px] leading-6 text-[#5e6678]">
                      <div>{isEn ? "Growth check-in" : "Büyüme değerlendirmesi"}: {yesNo(row.hasGrowthCheckin, locale)}</div>
                      <div>{isEn ? "Metric setup" : "Metrik kurulumu"}: {yesNo(row.hasMetricSetup, locale)}</div>
                      <div>{isEn ? "Diagnosis ready" : "Tanıya hazır"}: {yesNo(row.diagnosisReady, locale)}</div>
                    </td>
                    <td className="px-4 py-4 text-[13px] leading-6 text-[#5e6678]">
                      <div>{isEn ? "Entries" : "Giriş"}: {row.metricEntryCount}</div>
                      <div>{isEn ? "Latest entry" : "Son giriş"}: {formatAdminDate(row.latestMetricEntryDate, locale)}</div>
                    </td>
                    <td className="px-4 py-4 text-[13px] text-[#5e6678]">
                      {row.connectedIntegrationCount}
                    </td>
                    <td className="px-4 py-4 text-[13px] leading-6 text-[#5e6678]">
                      <div>{isEn ? "Todo" : "Yapılacak"}: {row.taskCounts.todo}</div>
                      <div>{isEn ? "In progress" : "Yapılıyor"}: {row.taskCounts.inProgress}</div>
                      <div>{isEn ? "Done" : "Tamamlandı"}: {row.taskCounts.done}</div>
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
