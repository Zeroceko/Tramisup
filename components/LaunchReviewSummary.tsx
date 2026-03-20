interface CategoryScore {
  name: string;
  score: number;
  status: "READY" | "IN_PROGRESS" | "BLOCKED";
}

interface LaunchReviewSummaryProps {
  overallScore: number;
  readyToLaunch: boolean;
  categories: CategoryScore[];
  blockersCount: number;
}

export default function LaunchReviewSummary({
  overallScore,
  readyToLaunch,
  categories,
  blockersCount,
}: LaunchReviewSummaryProps) {
  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6 mb-6">
      {/* Overall Status */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-[#0d0d12] mb-4">Launch Review</h2>
        <div className="flex items-center gap-6">
          <div className="text-6xl font-bold text-[#95dbda] leading-none">
            {overallScore}%
          </div>
          <div>
            <p className="text-[16px] font-semibold text-[#0d0d12]">
              {readyToLaunch ? "Ready to Launch! 🚀" : "Not Ready Yet"}
            </p>
            <p className="text-[13px] text-[#666d80] mt-1">
              {blockersCount} {blockersCount === 1 ? "blocker" : "blockers"} remaining
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      {categories.length > 0 && (
        <div className="border-t border-[#e8e8e8] pt-6">
          <p className="text-[13px] font-semibold text-[#0d0d12] mb-4">Category Breakdown</p>
          <div className="space-y-4">
            {categories.map((cat) => (
              <div key={cat.name} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-[#0d0d12]">
                      {cat.name}
                    </span>
                    <span className="text-[12px] font-semibold text-[#666d80]">
                      {cat.score}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-[#f6f6f6] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        cat.status === "READY"
                          ? "bg-[#75fc96]"
                          : cat.status === "BLOCKED"
                            ? "bg-[#ff4d4f]"
                            : "bg-[#95dbda]"
                      }`}
                      style={{ width: `${cat.score}%` }}
                    />
                  </div>
                </div>
                <span
                  className={`ml-3 text-[11px] font-semibold px-2 py-1 rounded-full ${
                    cat.status === "READY"
                      ? "bg-[#f0fffe] text-[#2d9d9b]"
                      : cat.status === "BLOCKED"
                        ? "bg-[#fff1f0] text-[#ff4d4f]"
                        : "bg-[#fef7f0] text-[#ff7a45]"
                  }`}
                >
                  {cat.status === "READY"
                    ? "Ready"
                    : cat.status === "BLOCKED"
                      ? "Blocked"
                      : "In Progress"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
