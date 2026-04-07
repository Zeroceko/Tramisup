"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { PlanTier } from "@prisma/client";
import PricingCard from "@/components/PricingCard";
import { PLAN_CONFIG, getPlanFeatureList } from "@/lib/plan-config";

export default function PricingPage() {
  const params = useParams();
  const locale = (params?.locale as string) ?? "en";
  const isEn = locale === "en";
  const [interval, setInterval] = useState<"monthly" | "yearly">("monthly");

  const prices = {
    starter: PLAN_CONFIG[PlanTier.STARTER].prices[interval],
    pro: PLAN_CONFIG[PlanTier.PRO].prices[interval],
  };

  return (
    <div className="py-8">
      {/* Header */}
      <div className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
          {isEn ? "Pricing" : "Fiyatlandırma"}
        </p>
        <h1 className="mt-2 text-[30px] font-bold tracking-[-0.03em] text-[#0d0d12]">
          {isEn ? "Simple, honest pricing" : "Sade, dürüst fiyatlandırma"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-[14px] leading-6 text-[#5e6678]">
          {isEn
            ? "Start free. Upgrade when you need more room to build."
            : "Ücretsiz başla. Daha fazla alana ihtiyaç duyduğunda yükselt."}
        </p>
      </div>

      {/* Interval toggle */}
      <div className="mt-6 flex justify-center">
        <div className="inline-flex rounded-full border border-[#e8e8e8] bg-white p-1">
          <button
            type="button"
            onClick={() => setInterval("monthly")}
            className={`h-8 rounded-full px-4 text-[13px] font-medium transition ${
              interval === "monthly" ? "bg-[#0d0d12] text-white" : "text-[#666d80] hover:text-[#0d0d12]"
            }`}
          >
            {isEn ? "Monthly" : "Aylık"}
          </button>
          <button
            type="button"
            onClick={() => setInterval("yearly")}
            className={`h-8 rounded-full px-4 text-[13px] font-medium transition ${
              interval === "yearly" ? "bg-[#0d0d12] text-white" : "text-[#666d80] hover:text-[#0d0d12]"
            }`}
          >
            {isEn ? "Yearly" : "Yıllık"}
            <span className="ml-1.5 rounded-full bg-[#dcfce7] px-1.5 py-0.5 text-[10px] font-semibold text-[#15803d]">
              -25%
            </span>
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <PricingCard
          name={isEn ? "Free" : "Ücretsiz"}
          price={0}
          interval={interval}
          description={isEn ? "Everything you need to get started and explore the platform." : "Başlamak ve platformu keşfetmek için gereken her şey."}
          features={getPlanFeatureList(PlanTier.FREE, locale)}
          cta={isEn ? "Get started" : "Başla"}
          ctaHref={`/${locale}/signup`}
          locale={locale}
        />
        <PricingCard
          name="Starter"
          price={prices.starter}
          interval={interval}
          description={isEn ? "For founders actively building and tracking a real product." : "Gerçek bir ürün inşa eden ve takip eden kurucular için."}
          features={getPlanFeatureList(PlanTier.STARTER, locale)}
          cta={isEn ? "Coming soon" : "Yakında"}
          ctaHref="/"
          ctaDisabled
          highlighted
          locale={locale}
        />
        <PricingCard
          name="Pro"
          price={prices.pro}
          interval={interval}
          description={isEn ? "For teams managing multiple products and needing full access." : "Birden fazla ürün yöneten ve tam erişim isteyen ekipler için."}
          features={getPlanFeatureList(PlanTier.PRO, locale)}
          cta={isEn ? "Coming soon" : "Yakında"}
          ctaHref="/"
          ctaDisabled
          locale={locale}
        />
      </div>

      {/* Footer note */}
      <p className="mt-8 text-center text-[12px] text-[#9ca3af]">
        {isEn
          ? "Payments are coming soon. For now, pricing is for packaging and limits."
          : "Ödeme yakında. Şimdilik fiyatlandırma paketleme ve limitler için."}
      </p>
    </div>
  );
}
