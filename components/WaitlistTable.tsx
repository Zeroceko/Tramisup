"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { WaitlistStatus } from "@prisma/client"
import { format } from "date-fns"
import { enUS, tr } from "date-fns/locale"

interface WaitlistEntry {
  id: string
  email: string
  name: string | null
  source: string
  status: WaitlistStatus
  inviteCode: string | null
  createdAt: Date
}

interface WaitlistTableProps {
  entries: WaitlistEntry[]
  locale?: string
}

const statusColors: Record<WaitlistStatus, string> = {
  PENDING: "bg-[#fff1f0] text-[#ff4d4f] border-[#ffccc7]",
  APPROVED: "bg-[#f0fffe] text-[#2d9d9b] border-[#95dbda]",
  INVITED: "bg-[#f6f6f6] text-[#666d80] border-[#e8e8e8]",
  REJECTED: "bg-[#f6f6f6] text-[#999] border-[#e8e8e8]",
}

export default function WaitlistTable({ entries, locale }: WaitlistTableProps) {
  const router = useRouter()
  const isEn = locale === "en"
  const [loading, setLoading] = useState<string | null>(null)
  const statusLabels: Record<WaitlistStatus, string> = isEn
    ? {
        PENDING: "Pending",
        APPROVED: "Approved",
        INVITED: "Invited",
        REJECTED: "Rejected",
      }
    : {
        PENDING: "Bekleme",
        APPROVED: "Onaylandı",
        INVITED: "Davet Edildi",
        REJECTED: "Reddedildi",
      }

  const handleApprove = async (id: string) => {
    setLoading(id)
    try {
      const res = await fetch(`/api/waitlist/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "APPROVED" }),
      })

      if (res.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Error approving entry:", error)
    } finally {
      setLoading(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm(isEn ? "Are you sure you want to delete this entry?" : "Silmek istediğinden emin misin?")) {
      setLoading(id)
      try {
        const res = await fetch(`/api/waitlist/${id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          router.refresh()
        }
      } catch (error) {
        console.error("Error deleting entry:", error)
      } finally {
        setLoading(null)
      }
    }
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#e8e8e8]">
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              Email
            </th>
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              {isEn ? "Name" : "Ad"}
            </th>
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              {isEn ? "Date" : "Tarih"}
            </th>
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              {isEn ? "Invite Code" : "Davet Kodu"}
            </th>
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              {isEn ? "Status" : "Durum"}
            </th>
            <th className="px-6 py-4 text-left text-[12px] font-semibold text-[#666d80] uppercase tracking-[0.1em]">
              {isEn ? "Actions" : "İşlem"}
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center">
                <p className="text-[14px] text-[#666d80]">
                  {isEn ? "Nobody has joined the waitlist yet" : "Henüz kimse kaydolmamış"}
                </p>
              </td>
            </tr>
          ) : (
            entries.map((entry) => (
              <tr key={entry.id} className="border-b border-[#e8e8e8] hover:bg-[#f6f6f6] transition">
                <td className="px-6 py-4 text-[13px] text-[#0d0d12]">{entry.email}</td>
                <td className="px-6 py-4 text-[13px] text-[#0d0d12]">
                  {entry.name || "-"}
                </td>
                <td className="px-6 py-4 text-[13px] text-[#666d80]">
                  {format(new Date(entry.createdAt), "d MMM yyyy", { locale: isEn ? enUS : tr })}
                </td>
                <td className="px-6 py-4">
                  {entry.inviteCode ? (
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(entry.inviteCode!);
                      }}
                      className="px-3 py-1.5 rounded text-[11px] font-semibold bg-[#f0fffe] text-[#2d9d9b] border border-[#95dbda] hover:bg-[#dff8f7] transition"
                      title={isEn ? "Click to copy" : "Kopyalamak için tıkla"}
                    >
                      {entry.inviteCode}
                    </button>
                  ) : (
                    <span className="text-[13px] text-[#999]">—</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full text-[11px] font-semibold border ${
                      statusColors[entry.status]
                    }`}
                  >
                    {statusLabels[entry.status]}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {entry.status !== "APPROVED" && (
                      <button
                        onClick={() => handleApprove(entry.id)}
                        disabled={loading === entry.id}
                        className="px-3 h-8 rounded text-[11px] font-semibold bg-[#75fc96] text-[#0d0d12] hover:bg-[#5fd984] transition disabled:opacity-50"
                      >
                        {loading === entry.id ? "..." : isEn ? "Approve" : "Onayla"}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(entry.id)}
                      disabled={loading === entry.id}
                      className="px-3 h-8 rounded text-[11px] font-semibold bg-[#f6f6f6] text-[#ff4d4f] hover:bg-[#ffe8e8] transition disabled:opacity-50"
                    >
                      {isEn ? "Delete" : "Sil"}
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
