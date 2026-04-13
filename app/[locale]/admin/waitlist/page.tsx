import { prisma } from "@/lib/prisma"
import WaitlistTable from "@/components/WaitlistTable"
import AdminStatCard from "@/components/admin/AdminStatCard"

export default async function AdminWaitlistPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const isEn = locale === "en"

  const entries = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: entries.length,
    pending: entries.filter((entry) => entry.status === "PENDING").length,
    approved: entries.filter((entry) => entry.status === "APPROVED").length,
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#7b8393]">
          {isEn ? "Admin / Waitlist" : "Admin / Waitlist"}
        </p>
        <h1 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Waitlist management" : "Waitlist yönetimi"}
        </h1>
        <p className="mt-2 max-w-3xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "Review incoming signups, approve promising founders, and keep invite flow moving."
            : "Yeni kayıtları gözden geçir, umut veren kurucuları onayla ve davet akışını hareketli tut."}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard
          label={isEn ? "Total" : "Toplam"}
          value={stats.total}
          hint={isEn ? "All waitlist entries" : "Tüm waitlist kayıtları"}
          tone="teal"
        />
        <AdminStatCard
          label={isEn ? "Pending" : "Bekleyen"}
          value={stats.pending}
          hint={isEn ? "Awaiting review" : "İnceleme bekliyor"}
          tone="yellow"
        />
        <AdminStatCard
          label={isEn ? "Approved" : "Onaylanan"}
          value={stats.approved}
          hint={isEn ? "Ready for invite" : "Davete hazır"}
          tone="green"
        />
      </div>

      <div className="overflow-hidden rounded-[24px] border border-[#e8e4de] bg-white shadow-[0_18px_50px_rgba(17,16,20,0.06)]">
        <WaitlistTable entries={entries} locale={locale} />
      </div>
    </div>
  )
}
