"use client";

import { useState, useEffect } from "react";

type Action = {
  title: string;
  why: string;
  priority: "high" | "medium";
};

type WeeklyAdvice = {
  focus: string;
  actions: Action[];
  encouragement: string;
};

interface AdvisorCardProps {
  productId: string;
  productName: string;
}

export default function AdvisorCard({
  productId,
  productName: _productName,
}: AdvisorCardProps) {
  const [advice, setAdvice] = useState<WeeklyAdvice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${productId}/advice`)
      .then((r) => r.json())
      .then((data: WeeklyAdvice) => {
        setAdvice(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [productId]);

  if (loading) {
    return (
      <div className="rounded-[20px] bg-[#0d0d12] p-6 animate-pulse">
        <div className="h-4 w-32 bg-white/10 rounded mb-3" />
        <div className="h-6 w-3/4 bg-white/10 rounded mb-6" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-white/5 rounded-[10px]" />
          ))}
        </div>
      </div>
    );
  }

  if (!advice) return null;

  return (
    <div className="rounded-[20px] bg-[#0d0d12] p-6 text-white">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/40">
          AI Danışman
        </span>
        <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/60">
          Bu hafta
        </span>
      </div>

      <p className="text-[18px] font-semibold leading-snug tracking-[-0.01em] mb-5">
        {advice.focus}
      </p>

      <div className="space-y-2 mb-5">
        {advice.actions.map((action, i) => (
          <div
            key={i}
            className="flex items-start gap-3 rounded-[12px] bg-white/5 px-4 py-3 border border-white/5"
          >
            <span
              className={`mt-0.5 shrink-0 w-1.5 h-1.5 rounded-full ${action.priority === "high" ? "bg-[#ffd7ef]" : "bg-white/30"}`}
            />
            <div>
              <p className="text-[13px] font-semibold text-white">
                {action.title}
              </p>
              <p className="mt-0.5 text-[12px] text-white/50 leading-5">
                {action.why}
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="text-[12px] text-white/40 italic">{advice.encouragement}</p>
    </div>
  );
}
