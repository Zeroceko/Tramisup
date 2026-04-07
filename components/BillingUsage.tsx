import Link from "next/link";
import { PlanTier } from "@/lib/plan-limits";
import { BillingInterval, SubStatus } from "@prisma/client";
import { PLAN_PRICES, getPlanUpsellSummary } from "@/lib/plan-config";

type UsageEntry = {
  key: string;
  label: string;
  used: number;
  limit: number;
};

type BillingUsageProps = {
  plan: PlanTier;
  interval: BillingInterval;
  status: SubStatus;
  currentPeriodEnd: Date | null;
  usage: UsageEntry[];
  locale: string;
};

export default function BillingUsage({
  plan,
  interval,
  status,
  currentPeriodEnd,
  usage,
  locale,
}: BillingUsageProps) {
  const isEn = locale === "en";
  const price = PLAN_PRICES[plan][interval === "YEARLY" ? "yearly" : "monthly"];
  const isFree = plan === PlanTier.FREE;

  const planLabel: Record<PlanTier, string> = {
    FREE: isEn ? "Free" : "Ücretsiz",
    STARTER: "Starter",
    PRO: "Pro",
  };

  const statusLabel: Record<SubStatus, { text: string; color: string }> = {
    ACTIVE: { text: isEn ? "Active" : "Aktif", color: "text-[#15803d] bg-[#dcfce7]" },
    CANCELED: { text: isEn ? "Canceled" : "İptal edildi", color: "text-[#b91c1c] bg-[#fee2e2]" },
    PAST_DUE: { text: isEn ? "Past due" : "Gecikmiş ödeme", color: "text-[#9a3412] bg-[#ffedd5]" },
  };

  return (
    <div className="space-y-5">
      {/* Plan summary */}
      <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
              {isEn ? "Current plan" : "Mevcut plan"}
            </p>
            <h2 className="mt-1.5 text-[24px] font-bold tracking-[-0.02em] text-[#0d0d12]">
              {planLabel[plan]}
              {!isFree && (
                <span className="ml-2 text-[16px] font-normal text-[#5e6678]">
                  ${price}/{isEn ? "mo" : "ay"}
                </span>
              )}
            </h2>
            <div className="mt-2 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusLabel[status].color}`}>
                {statusLabel[status].text}
              </span>
              {!isFree && interval === "YEARLY" && (
                <span className="text-[12px] text-[#8a8fa0]">
                  {isEn ? "· yearly plan" : "· yıllık plan"}
                </span>
              )}
              {currentPeriodEnd && (
                <span className="text-[12px] text-[#8a8fa0]">
                  · {isEn ? "renews" : "yenileme"} {currentPeriodEnd.toLocaleDateString(isEn ? "en-US" : "tr-TR", { month: "short", day: "numeric" })}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {isFree ? (
              <Link
                href={`/${locale}/pricing`}
                className="inline-flex h-9 items-center rounded-full bg-[#0d0d12] px-4 text-[13px] font-semibold text-white transition hover:bg-[#1a1a24]"
              >
                {isEn ? "Upgrade" : "Yükselt"}
              </Link>
            ) : (
              <Link
                href="/api/billing/portal"
                className="inline-flex h-9 items-center rounded-full border border-[#e8e8e8] px-4 text-[13px] font-medium text-[#0d0d12] transition hover:bg-[#f6f6f6]"
              >
                {isEn ? "Manage" : "Yönet"}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8a8fa0]">
          {isEn ? "Usage this period" : "Bu dönem kullanım"}
        </p>
        <div className="mt-4 space-y-4">
          {usage.map((u) => {
            const pct = u.limit === Infinity ? 0 : Math.min(100, Math.round((u.used / u.limit) * 100));
            const isAtLimit = u.limit !== Infinity && u.used >= u.limit;
            const isNearLimit = u.limit !== Infinity && pct >= 80 && !isAtLimit;

            return (
              <div key={u.key}>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-medium text-[#0d0d12]">{u.label}</p>
                  <p className={`text-[12px] font-semibold tabular-nums ${isAtLimit ? "text-[#dc2626]" : isNearLimit ? "text-[#d97706]" : "text-[#666d80]"}`}>
                    {u.limit === Infinity
                      ? `${u.used} / ∞`
                      : `${u.used} / ${u.limit}`}
                  </p>
                </div>
                {u.limit !== Infinity && (
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f0f0f0]">
                    <div
                      className={`h-full rounded-full transition-all ${isAtLimit ? "bg-[#dc2626]" : isNearLimit ? "bg-[#f59e0b]" : "bg-[#95dbda]"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {isFree && (
          <div className="mt-5 rounded-[14px] bg-[#f8f5f1] p-4">
            <p className="text-[13px] font-medium text-[#0d0d12]">
              {isEn ? "Need more?" : "Daha fazlasına ihtiyacın var mı?"}
            </p>
            <p className="mt-1 text-[12px] text-[#5e6678]">
              {getPlanUpsellSummary(PlanTier.STARTER, locale)}
            </p>
            <Link
              href={`/${locale}/pricing`}
              className="mt-3 inline-flex h-8 items-center rounded-full bg-[#ffd7ef] px-4 text-[12px] font-semibold text-[#0d0d12] transition hover:bg-[#f5c8e4]"
            >
              {isEn ? "See plans" : "Planları gör"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
