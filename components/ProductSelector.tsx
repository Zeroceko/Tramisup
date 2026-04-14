"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
}

interface ProductSelectorProps {
  products: Product[];
  activeProductId?: string;
}

export default function ProductSelector({ products, activeProductId }: ProductSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] || "en";
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeProduct = products.find((p) => p.id === activeProductId);
  const labels = locale === "en"
    ? {
        empty: "Select product",
        none: "No products found",
        add: "Add product",
        viewAll: "View all products",
      }
    : {
        empty: "Ürün seç",
        none: "Ürün bulunamadı",
        add: "Yeni ürün ekle",
        viewAll: "Tümünü gör",
      };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleEscape);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const handleSelect = (productId: string) => {
    document.cookie = `activeProductId=${productId}; path=/`;
    setIsOpen(false);
    router.refresh();
  };

  return (
    <div className="relative hidden items-center sm:flex" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-[34px] items-center gap-2 rounded-full bg-white border border-[#e0ddd6] px-4 text-[13px] font-semibold text-[#0d0d12] transition hover:bg-[#f9f7f3]"
      >
        <span className="h-2 w-2 rounded-full bg-[#95dbda] shrink-0" />
        <span className="max-w-[130px] truncate">{activeProduct?.name ?? labels.empty}</span>
        <svg
          className={`h-3.5 w-3.5 text-[#8a8fa0] transition-transform shrink-0 ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-[18px] border border-[#e8e4de] bg-white shadow-[0_16px_48px_rgba(0,0,0,0.12)]">
          <div className="p-2">
            {products.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[#666d80]">{labels.none}</p>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className={`flex w-full items-center gap-2 rounded-[14px] px-3 py-2.5 text-left text-[13px] font-medium transition ${
                    product.id === activeProductId
                      ? "bg-[#ffe5f2] text-[#0d0d12]"
                      : "text-[#0d0d12] hover:bg-[#f7f7fa]"
                  }`}
                >
                  <span className={`h-2 w-2 shrink-0 rounded-full ${product.id === activeProductId ? "bg-[#95dbda]" : "bg-[#d8dde5]"}`} />
                  {product.name}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-[#edf0f4] p-2">
            <Link
              href={`/${locale}/products`}
              onClick={() => setIsOpen(false)}
              className="mb-1 flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f7f7fa]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f4f7] text-[11px] leading-none text-[#666d80]">
                ≡
              </span>
              {labels.viewAll}
            </Link>
            <Link
              href={`/${locale}/products/new`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 rounded-[14px] px-3 py-2.5 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f7f7fa]"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f3f4f7] text-lg leading-none text-[#666d80]">+</span>
              {labels.add}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
