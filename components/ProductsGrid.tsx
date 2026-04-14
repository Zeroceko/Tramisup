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

function stageAccent(status: string | null) {
  const normalized = (status ?? "").toUpperCase();
  if (normalized === "GROWING") return "from-[#e8fff1] to-[#f8fffb] border-[#ccefd8]";
  if (normalized === "LAUNCHED") return "from-[#effcfc] to-[#fbffff] border-[#cceceb]";
  return "from-[#fff8fb] to-[#fffdfd] border-[#f0dbe7]";
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
          className="group flex min-h-[280px] flex-col justify-between overflow-hidden rounded-[26px] border border-dashed border-[#f2bfd9] bg-[radial-gradient(circle_at_top,_rgba(255,215,239,0.7),_transparent_35%),linear-gradient(180deg,_#fff9fc_0%,_#ffffff_100%)] p-6 transition hover:-translate-y-0.5 hover:border-[#e6a8cb] hover:shadow-[0_18px_40px_rgba(23,20,31,0.08)]"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#f0bfd8] bg-white text-[28px] font-light text-[#c581a8] shadow-[0_10px_24px_rgba(23,20,31,0.06)]">
            +
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#b85e88]">
              {locale === "en" ? "New workspace" : "Yeni workspace"}
            </p>
            <p className="mt-2 text-[22px] font-semibold tracking-[-0.03em] text-[#0d0d12]">
              {locale === "en" ? "Create another product" : "Yeni bir ürün oluştur"}
            </p>
            <p className="mt-2 text-[14px] leading-6 text-[#5e6678]">
              {locale === "en"
                ? "Open a fresh founder workspace for a new idea, launch, or growth bet."
                : "Yeni bir fikir, launch ya da growth denemesi için temiz bir founder workspace aç."}
            </p>
          </div>
        </Link>

        {products.map((product) => {
          const isActive = activeProductId === product.id;
          const menuOpen = openMenuId === product.id;

          return (
            <div
              key={product.id}
              className={`relative overflow-hidden rounded-[26px] border bg-white p-5 transition ${
                isActive
                  ? "border-[#95dbda] shadow-[0_18px_40px_rgba(23,20,31,0.08)]"
                  : "border-[#e8e8e8] hover:-translate-y-0.5 hover:border-[#d9d2c8] hover:shadow-[0_18px_40px_rgba(23,20,31,0.06)]"
              }`}
            >
              <div
                className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-br ${stageAccent(product.status)}`}
                aria-hidden="true"
              />

              {/* Header row */}
              <div className="relative mb-4 flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-[18px] font-semibold tracking-[-0.02em] text-[#0d0d12] truncate">
                    {product.name}
                  </p>
                  <p className="mt-2 text-[13px] leading-6 text-[#5e6678] line-clamp-3">
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

              {/* Circular progress row */}
              <div className="relative rounded-[20px] border border-[#f1eee8] bg-[#fcfbf9] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
                    {locale === "en" ? "Execution readiness" : "Execution hazırlığı"}
                  </p>
                </div>
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <CircleProgress value={product.launchPct} color="#ffd7ef" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {product.launchPct}%
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0d0d12]">Launch</p>
                    <p className="text-[11px] text-[#8a8fa0]">
                      {locale === "en" ? "Preparation depth" : "Hazırlık derinliği"}
                    </p>
                  </div>
                  <div className="relative">
                    <CircleProgress value={product.growthPct} color="#95dbda" />
                    <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-[#0d0d12]">
                      {product.growthPct}%
                    </span>
                  </div>
                  <div>
                    <p className="text-[12px] font-semibold text-[#0d0d12]">Growth</p>
                    <p className="text-[11px] text-[#8a8fa0]">
                      {locale === "en" ? "Operating rhythm" : "İşletim ritmi"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Activate / overview button */}
              <button
                type="button"
                onClick={() => handleActivate(product.id)}
                className={`mt-4 h-11 w-full rounded-full text-[13px] font-semibold transition ${
                  isActive
                    ? "bg-[#95dbda] text-[#0d0d12]"
                    : "bg-[#f6f6f6] text-[#4f5668] hover:bg-[#ffd7ef] hover:text-[#0d0d12]"
                }`}
              >
                {isActive
                  ? locale === "en"
                    ? "Active product"
                    : "Aktif ürün"
                  : locale === "en"
                    ? "Make active and open overview"
                    : "Aktif yap ve overview aç"}
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
