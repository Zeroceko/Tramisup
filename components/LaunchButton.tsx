"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface LaunchButtonProps {
  productId: string;
  locale: string;
}

export default function LaunchButton({ productId, locale }: LaunchButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLaunch() {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "LAUNCHED" }),
      });
      if (res.ok) {
        router.push(`/${locale}/dashboard`);
        router.refresh();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleLaunch}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full bg-[#0d0d12] px-5 h-11 text-[14px] font-semibold text-white transition hover:bg-[#333] disabled:opacity-50"
    >
      {loading ? "Launch ediliyor…" : "Ürünümü launch ettim →"}
    </button>
  );
}
