interface CategoryScore {
  name: string;
  score: number;
  status: "READY" | "BLOCKED" | "IN_PROGRESS";
}

interface LaunchReviewSummaryProps {
  overallScore: number;
  readyToLaunch: boolean;
  categories: CategoryScore[];
  blockersCount: number;
  nonCriticalRemaining: number;
}

export default function LaunchReviewSummary({
  overallScore,
  readyToLaunch,
  categories,
  blockersCount,
  nonCriticalRemaining,
}: LaunchReviewSummaryProps) {
  return (
    <div className="mb-6 rounded-[15px] border border-[#e8e8e8] bg-white p-6">
      <div className="flex items-start justify-between gap-6">
        {/* Left: Score */}
        <div className="flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-2">
            Launch hazırlık skoru
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-[56px] font-bold text-[#95dbda]">
              {overallScore}%
            </span>
            <span className="text-[14px] font-semibold text-[#666d80]">
              tamamlandı
            </span>
          </div>

          {/* Status */}
          <div className="mt-4">
            <div className="inline-flex items-center gap-2 px-3 h-8 rounded-full bg-[#f6f6f6]">
              {readyToLaunch ? (
                <>
                  <span className="text-[16px]">✅</span>
                  <span className="text-[13px] font-semibold text-[#0d0d12]">
                    Launch&apos;a hazır
                  </span>
                </>
              ) : (
                <>
                  <span className="text-[16px]">📋</span>
                  <span className="text-[13px] font-semibold text-[#0d0d12]">
                    Henüz tam değil
                  </span>
                </>
              )}
            </div>
            {readyToLaunch && nonCriticalRemaining > 0 ? (
              <p className="mt-3 text-[13px] leading-6 text-[#666d80]">
                Kritik blokaj yok. Ancak {nonCriticalRemaining} kritik olmayan madde hâlâ açık; launch sonrası bu sayfada onları tamamlamaya devam edebilirsin.
              </p>
            ) : null}
          </div>
        </div>

        {/* Right: Blockers */}
        <div className="flex-1">
          <p className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-4">
            Kapatılması gerekenler
          </p>
          <div className="space-y-3">
            {blockersCount > 0 ? (
              <>
                <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#fff1f0] border border-[#ffccc7]">
                  <span className="text-[20px]">⚠️</span>
                  <div>
                    <p className="text-[14px] font-semibold text-[#ff4d4f]">
                      {blockersCount} kritik blokaj
                    </p>
                    <p className="text-[12px] text-[#ff7a7a]">
                      Yüksek öncelikli ve henüz kapanmamış maddeler
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-[12px] bg-[#f0fffe] border border-[#95dbda]">
                <span className="text-[20px]">✨</span>
                <div>
                  <p className="text-[14px] font-semibold text-[#2d9d9b]">
                    Kritik blokaj yok
                  </p>
                  <p className="text-[12px] text-[#6bc4c1]">
                    Launch sayfası hâlâ kalan işleri gösterebilir
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <div
              key={category.name}
              className={`rounded-[12px] border px-3 py-3 ${
                category.status === "READY"
                  ? "border-[#95dbda] bg-[#f0fffe]"
                  : category.status === "BLOCKED"
                    ? "border-[#ffccc7] bg-[#fff1f0]"
                    : "border-[#e8e8e8] bg-[#fafafa]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-[12px] font-semibold text-[#0d0d12]">{category.name}</p>
                <span className="text-[12px] font-semibold text-[#666d80]">{category.score}%</span>
              </div>
              <p className="mt-1 text-[11px] text-[#666d80]">
                {category.status === "READY"
                  ? "Hazır"
                  : category.status === "BLOCKED"
                    ? "Kritik eksik var"
                    : "İlerliyor"}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
