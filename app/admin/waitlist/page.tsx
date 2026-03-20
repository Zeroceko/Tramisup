import { prisma } from "@/lib/prisma"
import WaitlistTable from "@/components/WaitlistTable"

export default async function AdminWaitlistPage() {
  const entries = await prisma.waitlist.findMany({
    orderBy: { createdAt: "desc" },
  })

  const stats = {
    total: entries.length,
    pending: entries.filter((e) => e.status === "PENDING").length,
    approved: entries.filter((e) => e.status === "APPROVED").length,
  }

  return (
    <div className="min-h-screen bg-[#f6f6f6] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-[32px] font-bold text-[#0d0d12] mb-2">Waitlist Yönetimi</h1>
          <p className="text-[14px] text-[#666d80]">Kaydolan emailleri yönet ve onayla</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
            <p className="text-[12px] font-semibold text-[#666d80] mb-2">TOPLAM</p>
            <p className="text-[32px] font-bold text-[#0d0d12]">{stats.total}</p>
          </div>
          <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
            <p className="text-[12px] font-semibold text-[#666d80] mb-2">BEKLEME</p>
            <p className="text-[32px] font-bold text-[#ff7a45]">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-6">
            <p className="text-[12px] font-semibold text-[#666d80] mb-2">ONAYLANDI</p>
            <p className="text-[32px] font-bold text-[#75fc96]">{stats.approved}</p>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[15px] border border-[#e8e8e8] overflow-hidden">
          <WaitlistTable entries={entries} />
        </div>
      </div>
    </div>
  )
}
