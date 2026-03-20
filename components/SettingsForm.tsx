"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface User {
  id: string;
  name: string | null;
  email: string;
  product: {
    id: string;
    name: string;
    launchDate: Date | null;
    status: string;
  } | null;
}

const inputCls = "w-full px-4 py-3 rounded-[12px] border border-[#e8e8e8] text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";
const labelCls = "block text-[12px] font-semibold text-[#0d0d12] mb-1.5";

export default function SettingsForm({ user }: { user: User | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: user?.name || "",
    projectName: user?.product?.name || "",
    launchDate: user?.product?.launchDate
      ? format(new Date(user.product.launchDate), "yyyy-MM-dd")
      : "",
    status: user?.product?.status || "PRE_LAUNCH",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to update settings");

      setSuccess("Ayarlar başarıyla güncellendi.");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-[10px] bg-red-50 border border-red-200 text-[13px] text-red-600">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-[10px] bg-[#75fc96]/20 border border-[#75fc96]/40 text-[13px] text-[#1a7a36]">
          {success}
        </div>
      )}

      {/* Personal */}
      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">Kişisel Bilgiler</p>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Ad Soyad</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>E-posta</label>
            <input
              type="email"
              value={user?.email}
              disabled
              className={inputCls + " bg-[#f6f6f6] text-[#9ca3af] cursor-not-allowed"}
            />
          </div>
        </div>
      </div>

      {/* Project */}
      <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">Proje Bilgileri</p>
        <div className="space-y-3">
          <div>
            <label className={labelCls}>Proje Adı</label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Launch Tarihi <span className="font-normal text-[#9ca3af]">(opsiyonel)</span></label>
            <input
              type="date"
              value={formData.launchDate}
              onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Durum</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className={inputCls}
            >
              <option value="PRE_LAUNCH">Pre-Launch</option>
              <option value="LAUNCHED">Launched</option>
              <option value="GROWING">Growing</option>
            </select>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full h-11 rounded-full bg-[#ffd7ef] text-[14px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
      </button>
    </form>
  );
}
