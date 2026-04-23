"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteProductModal from "./DeleteProductModal";
import { getProductStatusLabel } from "@/lib/launch-stage";

type ProductItem = {
  id: string;
  name: string;
  category: string | null;
  status: string | null;
  description: string | null;
  launchPct: number;
  growthPct: number;
};

function statusBadge(status: string | null) {
  const s = (status ?? "").toUpperCase();
  if (s === "LAUNCHED")
    return "bg-[#e6f7f7] text-[#0d8a85]";
  if (s === "GROWING")
    return "bg-[#e8f8ed] text-[#1a7a3a]";
  if (s.includes("PRE"))
    return "bg-[#f4f4f8] text-[#5e6678]";
  return "bg-[#fff3d7] text-[#8a6400]";
}

function stageAccent(status: string | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "GROWING") return "bg-[#daf4df]";
  if (normalized === "LAUNCHED") return "bg-[#d8f2f1]";
  return "bg-[#f7d8e7]";
}

export default function ProductsGrid({
  products,
  locale,
  activeProductId,
}: {
  products: ProductItem[];
  locale: string;
  activeProductId: string | undefined;
}) {
  const router = useRouter();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    if (openMenuId) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuId]);

  function handleActivate(productId: string) {
    document.cookie = `activeProductId=${productId}; path=/; max-age=31536000`;
    router.push(`/${locale}/products/${productId}/overview`);
  }

  return (
    <>
      {products.length === 0 ? (
        <Link
          href={`/${locale}/products/new`}
          className="flex min-h-[280px] flex-col items-center justify-center rounded-[32px] border border-dashed border-[#d9d0c5] bg-white text-center shadow-[0_18px_40px_rgba(23,20,31,0.04)] transition hover:-translate-y-0.5 hover:border-[#cbbfb0] hover:shadow-[0_22px_44px_rgba(23,20,31,0.07)]"
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-full border border-[#e7ddd0] bg-[#f8f4ee] text-[32px] font-light text-[#7d7465]">
            +
          </div>
          <p className="mt-6 text-[24px] font-semibold tracking-[-0.04em] text-[#111017]">
            {locale === "en" ? "Create your first product" : "İlk ürününü oluştur"}
          </p>
          <p className="mt-2 max-w-[28ch] text-[14px] leading-7 text-[#666d80]">
            {locale === "en"
              ? "Start with one product and make it your active workspace."
              : "Bir ürünle başla ve onu aktif çalışma alanın yap."}
          </p>
        </Link>
      ) : (
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => {
          const isActive = activeProductId === product.id;
          const menuOpen = openMenuId === product.id;

          return (
            <div
              key={product.id}
              className={`relative flex min-h-[320px] flex-col overflow-hidden rounded-[28px] border bg-white p-6 transition ${
                isActive
                  ? "border-[#9fd9d7] shadow-[0_22px_48px_rgba(23,20,31,0.08)]"
                  : "border-[#e8e1d8] hover:-translate-y-0.5 hover:border-[#d8cec2] hover:shadow-[0_18px_40px_rgba(23,20,31,0.06)]"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-2 ${stageAccent(product.status)}`}
                aria-hidden="true"
              />

              {/* Header row */}
              <div className="relative mb-5 flex items-start justify-between gap-3 pt-2">
                <div className="flex-1 min-w-0">
                  <p className="text-[24px] font-semibold leading-tight tracking-[-0.04em] text-[#111017]">
                    {product.name}
                  </p>
                  <p className="mt-3 text-[14px] leading-7 text-[#5e6678] line-clamp-2">
                    {product.description || product.category || "—"}
                  </p>
                </div>

                {/* Icon row: external link + 3-dot menu */}
                <div className="flex items-center gap-1 ml-2 shrink-0 relative" ref={menuOpen ? menuRef : null}>
                  {/* External link → overview */}
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}/products/${product.id}/overview`)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[#b0b8c8] transition hover:text-[#5e6678] hover:bg-[#f6f6f6]"
                    title={locale === "en" ? "Open product" : "Ürünü aç"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M7 17L17 7M17 7H7M17 7v10" />
                    </svg>
                  </button>

                  {/* 3-dot menu trigger */}
                  <button
                    type="button"
                    onClick={() => setOpenMenuId(menuOpen ? null : product.id)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-[#b0b8c8] transition hover:text-[#5e6678] hover:bg-[#f6f6f6]"
                    title={locale === "en" ? "Options" : "Seçenekler"}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="5" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none"/>
                      <circle cx="12" cy="19" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </button>

                  {/* Dropdown */}
                  {menuOpen && (
                    <div
                      ref={menuRef}
                      className="absolute right-0 top-8 z-20 w-40 rounded-[12px] border border-[#e8e8e8] bg-white py-1 shadow-[0_8px_24px_rgba(0,0,0,0.10)]"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          setDeleteTarget({ id: product.id, name: product.name });
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-[13px] font-medium text-red-600 transition hover:bg-red-50"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6l-1 14H6L5 6"/>
                          <path d="M10 11v6M14 11v6"/>
                          <path d="M9 6V4h6v2"/>
                        </svg>
                        {locale === "en" ? "Delete product" : "Ürünü sil"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div className="relative mb-5 flex flex-wrap gap-1.5">
                <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${statusBadge(product.status)}`}>
                  {getProductStatusLabel(product.status, locale) ?? "—"}
                </span>
                {product.category && (
                  <span className="rounded-full bg-[#f3f4f7] px-3 py-1 text-[11px] font-medium text-[#666d80]">
                    {product.category}
                  </span>
                )}
                {isActive && (
                  <span className="rounded-full bg-[#0d0d12] px-3 py-1 text-[11px] font-semibold text-white">
                    {locale === "en" ? "Active now" : "Şu an aktif"}
                  </span>
                )}
              </div>

              {/* Meter row */}
              <div className="relative mt-auto rounded-[20px] border border-[#f0e8de] bg-[#fbf8f3] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#8a8fa0]">
                    {locale === "en" ? "Execution readiness" : "Execution hazırlığı"}
                  </p>
                </div>

                {[
                  {
                    label: "Launch",
                    value: product.launchPct,
                    color: "bg-[#f0a8c8]",
                  },
                  {
                    label: "Growth",
                    value: product.growthPct,
                    color: "bg-[#7dd5d4]",
                  },
                ].map((meter) => (
                  <div key={meter.label} className="mb-3 last:mb-0">
                    <div className="mb-2 flex items-center justify-between">
                      <p className="text-[13px] font-semibold text-[#111017]">{meter.label}</p>
                      <span className="text-[16px] font-semibold tracking-[-0.03em] text-[#111017]">
                        {meter.value}%
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-white">
                      <div
                        className={`h-2.5 rounded-full ${meter.color}`}
                        style={{ width: `${meter.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Activate / overview button */}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => handleActivate(product.id)}
                  className={`h-11 flex-1 rounded-full px-4 text-[13px] font-semibold transition ${
                    isActive
                      ? "bg-[#111017] text-white"
                      : "bg-[#f2eee8] text-[#3f4657] hover:bg-[#111017] hover:text-white"
                  }`}
                >
                  {isActive
                    ? locale === "en"
                      ? "Currently active"
                      : "Şu an aktif"
                    : locale === "en"
                      ? "Focus here"
                      : "Buraya odaklan"}
                </button>
                <button
                  type="button"
                  onClick={() => router.push(`/${locale}/products/${product.id}/overview`)}
                  className="h-11 rounded-full border border-[#e1d8cc] px-4 text-[13px] font-semibold text-[#5e6678] transition hover:border-[#cfc4b7] hover:bg-[#f8f4ee] hover:text-[#111017]"
                >
                  {locale === "en" ? "Overview" : "Genel bakış"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}

      {/* Delete modal */}
      {deleteTarget && (
        <DeleteProductModal
          productId={deleteTarget.id}
          productName={deleteTarget.name}
          locale={locale}
          open={true}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
