"use client";

import { useEffect } from "react";

export default function ProductEventTracker({
  productId,
  surface,
}: {
  productId?: string;
  surface: string;
}) {
  useEffect(() => {
    if (!productId) return;

    const dayKey = new Date().toISOString().slice(0, 10);
    const storageKey = `tiramisup:event:app-session:${productId}:${dayKey}`;

    if (window.localStorage.getItem(storageKey) === "1") return;

    window.localStorage.setItem(storageKey, "1");

    void fetch("/api/product-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        productId,
        eventType: "APP_SESSION",
        metadata: {
          surface,
          dayKey,
        },
      }),
      keepalive: true,
    }).catch(() => {
      window.localStorage.removeItem(storageKey);
    });
  }, [productId, surface]);

  return null;
}
