"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteProductModal({
  productId,
  productName,
  locale,
  open,
  onClose,
}: {
  productId: string;
  productName: string;
  locale: string;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const isEn = locale === "en";
  const [typed, setTyped] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const confirmed = typed.trim() === productName.trim();

  const copy = isEn
    ? {
        title: "Delete product",
        warning: "This action is permanent and cannot be undone.",
        desc: (name: string) =>
          `All tasks, metrics, integrations, and checklist data for "${name}" will be permanently deleted.`,
        label: (name: string) => `Type "${name}" to confirm`,
        placeholder: "Type the product name…",
        cancel: "Cancel",
        confirm: "Delete permanently",
        deleting: "Deleting…",
        error: "Something went wrong. Please try again.",
      }
    : {
        title: "Ürünü sil",
        warning: "Bu işlem kalıcıdır ve geri alınamaz.",
        desc: (name: string) =>
          `"${name}" ürününe ait tüm görevler, metrikler, entegrasyonlar ve checklist verileri kalıcı olarak silinecek.`,
        label: (name: string) => `Onaylamak için "${name}" yaz`,
        placeholder: "Ürün adını yaz…",
        cancel: "İptal",
        confirm: "Kalıcı olarak sil",
        deleting: "Siliniyor…",
        error: "Bir hata oluştu. Tekrar dene.",
      };

  async function handleDelete() {
    setDeleting(true);
    setError("");
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
      // Belt-and-suspenders: clear cookie client-side too
      document.cookie = "activeProductId=; path=/; max-age=0";
      router.push(`/${locale}/products`);
    } catch {
      setError(copy.error);
      setDeleting(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-[24px] border border-[#e8e8e8] bg-white p-6 shadow-[0_24px_64px_rgba(0,0,0,0.15)]">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full border border-[#e8e8e8] text-[#5e6678] transition hover:bg-[#f6f6f6]"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div className="mb-5 rounded-[14px] border border-red-100 bg-red-50 px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-red-400">
            {isEn ? "Danger zone" : "Tehlikeli bölge"}
          </p>
          <p className="mt-1 text-[15px] font-semibold text-red-700">{copy.title}</p>
          <p className="mt-1 text-[13px] leading-5 text-red-600">{copy.warning}</p>
        </div>

        <p className="text-[13px] leading-6 text-[#5e6678]">{copy.desc(productName)}</p>

        {/* Confirmation input */}
        <div className="mt-5">
          <label className="mb-1.5 block text-[12px] font-semibold text-[#0d0d12]">
            {copy.label(productName)}
          </label>
          <input
            type="text"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder={copy.placeholder}
            className="w-full rounded-[12px] border border-[#e8e8e8] px-4 py-3 text-[14px] text-[#0d0d12] placeholder-[#9ca3af] outline-none transition focus:border-red-300"
            autoComplete="off"
          />
        </div>

        {error && (
          <p className="mt-3 text-[13px] text-red-600">{error}</p>
        )}

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 rounded-full border border-[#e8e8e8] bg-[#f7f7fa] text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f0f0f4]"
          >
            {copy.cancel}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!confirmed || deleting}
            className="flex-1 h-11 rounded-full bg-red-500 text-[13px] font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {deleting ? copy.deleting : copy.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
