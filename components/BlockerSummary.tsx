interface Blocker {
  id: string;
  title: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH";
  linkedTaskId?: string;
}

interface BlockerSummaryProps {
  blockers: Blocker[];
  onCreateTask: (blockerId: string) => Promise<void>;
  isLoading?: boolean;
}

export default function BlockerSummary({ blockers, onCreateTask, isLoading = false }: BlockerSummaryProps) {
  if (blockers.length === 0) {
    return null; // Don't render if no blockers
  }

  // Sort by priority: CRITICAL/HIGH first
  const sortedBlockers = [...blockers].sort((a, b) => {
    const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[16px] font-bold text-[#0d0d12]">
          ⚠️ Blockers ({blockers.length})
        </h3>
        <p className="text-[12px] text-[#666d80]">Preventing launch</p>
      </div>

      <div className="space-y-3">
        {sortedBlockers.map((blocker) => {
          const isHighPriority = blocker.priority === "HIGH";
          const borderColor = isHighPriority ? "border-[#ff4d4f]" : "border-[#ffa940]";
          const bgColor = isHighPriority ? "bg-[#fff1f0]" : "bg-[#fffbe6]";
          const badgeColor = isHighPriority ? "bg-[#ff4d4f]" : "bg-[#ffa940]";

          return (
            <form
              key={blocker.id}
              action={async () => {
                await onCreateTask(blocker.id);
              }}
              className={`rounded-[12px] border-l-4 ${borderColor} ${bgColor} p-4 flex items-start justify-between gap-3`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-[13px] font-semibold text-[#0d0d12] flex-1 break-words">
                    {blocker.title}
                  </p>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white whitespace-nowrap ${badgeColor}`}
                  >
                    {blocker.priority}
                  </span>
                </div>
                <p className="text-[11px] text-[#666d80]">{blocker.category}</p>
              </div>

              {!blocker.linkedTaskId ? (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="text-[12px] font-semibold text-[#95dbda] hover:text-[#75bcbb] disabled:opacity-50 whitespace-nowrap"
                >
                  + Create Task
                </button>
              ) : (
                <a
                  href={`/tasks#${blocker.linkedTaskId}`}
                  className="text-[12px] font-semibold text-[#666d80] hover:text-[#0d0d12] whitespace-nowrap"
                >
                  → View Task
                </a>
              )}
            </form>
          );
        })}
      </div>
    </div>
  );
}
