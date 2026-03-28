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
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="hidden sm:inline-flex items-center gap-2 px-3 h-9 rounded-full border border-[#e8e8e8] bg-white text-[13px] font-medium text-[#0d0d12] hover:border-[#d0d0d0] transition"
      >
        <span className="w-2 h-2 rounded-full bg-[#95dbda] shrink-0" />
        <span className="truncate max-w-[120px]">{activeProduct?.name ?? "Ürün seç"}</span>
        <svg
          className={`w-3.5 h-3.5 text-[#666d80] transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 rounded-[15px] border border-[#e8e8e8] bg-white shadow-card z-50 overflow-hidden">
          <div className="p-2">
            {products.length === 0 ? (
              <p className="px-3 py-2 text-[12px] text-[#666d80]">Ürün bulunamadı</p>
            ) : (
              products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product.id)}
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-[10px] text-[13px] font-medium transition ${
                    product.id === activeProductId
                      ? "bg-[#ffd7ef] text-[#0d0d12]"
                      : "text-[#0d0d12] hover:bg-[#f6f6f6]"
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full shrink-0 ${product.id === activeProductId ? "bg-[#95dbda]" : "bg-[#e8e8e8]"}`} />
                  {product.name}
                </button>
              ))
            )}
          </div>

          <div className="border-t border-[#e8e8e8] p-2">
            <Link
              href={`/${locale}/products/new`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-[10px] text-[13px] font-medium text-[#0d0d12] hover:bg-[#f6f6f6] transition"
            >
              <span className="w-5 h-5 rounded-full bg-[#f6f6f6] flex items-center justify-center text-[#666d80] text-lg leading-none">+</span>
              Yeni ürün ekle
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
