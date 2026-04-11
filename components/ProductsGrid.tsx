"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DeleteProductModal from "./DeleteProductModal";

type ProductItem = {
  id: string;
  name: string;
  category: string | null;
  status: string | null;
  description: string | null;
  launchPct: number;
  growthPct: number;
};

function CircleProgress({
  value,
  color,
  size = 44,
}: {
  value: number;
  color: string;
  size?: number;
}) {
  const r = (size - 6) / 2;
  const circ = 2 * Math.PI * r;
  const filled = circ * (value / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f0f0f0" strokeWidth="3" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={`${filled} ${circ}`}
      />
    </svg>
  );
}

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
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {/* New product card */}
        <Link
          href={`/${locale}/products/new`}
          className="flex min-h-[180px] items-center justify-center rounded-[15px] border-2 border-dashed border-[#ffd7ef] bg-white transition hover:border-[#f5c8e4] hover:bg-[#fff8fc]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#ffd7ef] text-[22px] font-light text-[#c8a0b8]">
            +
          </div>
        </Link>

        {products.map((product) => {
          const isActive = activeProductId === product.id;
          const menuOpen = openMenuId === product.id;

          return (
            <div
              key={product.id}
              className={`relative rounded-[15px] border bg-white p-5 transition ${
                isActive ? "border-[#95dbda] shadow-sm" : "border-[#e8e8e8] hover:border-[#d0d0d0]"
              }`}
            >
              {/* Header row */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-[#0d0d12] truncate">
                    {product.name}
                  </p>
                  <p className="mt-0.5 text-[12px] text-[#666d80] line-clamp-2">
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
                    title="Ürünü görüntüle"
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
                    title="Seçenekler"
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
              <div className="flex flex-wrap gap-1.5 mb-4">
                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${statusBadge(product.status)}`}>
                  {(product.status ?? "—").replaceAll("_", " ")}
                </span>
                {product.category && (
                  <span className="rounded-full bg-[#f0f0f0] px-2.5 py-0.5 text-[11px] font-medium text-[#666d80]">
                    {product.category}
                  </span>
                )}
              </div>

              {/* Circular progress row */}
              <div className="flex items-center gap-4 pt-3 border-t border-[#f0f0f0]">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CircleProgress value={product.launchPct} color="#ffd7ef" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {product.launchPct}%
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#666d80]">Launch</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <CircleProgress value={product.growthPct} color="#95dbda" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {product.growthPct}%
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#666d80]">Growth</span>
                </div>
              </div>

              {/* Activate / overview button */}
              <button
                type="button"
                onClick={() => handleActivate(product.id)}
                className={`mt-4 w-full h-8 rounded-full text-[12px] font-semibold transition ${
                  isActive
                    ? "bg-[#95dbda] text-[#0d0d12]"
                    : "bg-[#f6f6f6] text-[#666d80] hover:bg-[#ffd7ef] hover:text-[#0d0d12]"
                }`}
              >
                {isActive ? "Aktif ürün ✓" : "Aktif yap →"}
              </button>
            </div>
          );
        })}
      </div>

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
