"use client"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useLocale } from "next-intl"

interface WaitlistModalProps {
  open: boolean
  onClose: () => void
}

export default function WaitlistModal({ open, onClose }: WaitlistModalProps) {
  const router = useRouter()
  const locale = useLocale()
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/waitlist/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || null,
          source: "landing",
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Failed to join waitlist")
        return
      }

      setSuccess(true)
      setTimeout(() => {
        router.push(`/${locale}/waitlist/thank-you`)
      }, 1000)
    } catch (err) {
      console.error("Error joining waitlist:", err)
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[20px] shadow-2xl w-full max-w-md p-8 animate-in">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[24px] font-bold text-[#0d0d12]">
              Waitlist&apos;e Katıl
            </h2>
            <button
              onClick={onClose}
              className="text-[#666d80] hover:text-[#0d0d12] text-[24px] w-8 h-8 flex items-center justify-center"
            >
              ✕
            </button>
          </div>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-[#0d0d12] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition"
                  disabled={loading}
                />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-[#0d0d12] mb-2">
                  Name (optional)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 rounded-[10px] bg-[#fff1f0] border border-[#ffccc7] text-[#ff4d4f] text-[13px]">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 rounded-full bg-[#95dbda] text-white text-[14px] font-semibold hover:bg-[#7ac9c7] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Kaydediliyor..." : "Waitlist'e Katıl"}
              </button>

              <div className="space-y-2 pt-1 text-center">
                <p className="text-[12px] text-[#666d80]">
                  Yakında seni davet edeceğiz 🎉
                </p>
                <Link
                  href={`/${locale}/signup`}
                  onClick={onClose}
                  className="inline-flex text-[12px] font-semibold text-[#0d0d12] underline underline-offset-2 hover:text-[#666d80] transition"
                >
                  Erken erişim kodum var
                </Link>
              </div>
            </form>
          ) : (
            <div className="text-center py-6">
              <div className="text-[48px] mb-4">✅</div>
              <h3 className="text-[18px] font-bold text-[#0d0d12] mb-2">
                Başarılı!
              </h3>
              <p className="text-[14px] text-[#666d80]">
                Sıradayısın. En kısa sürede seni davet edeceğiz.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
