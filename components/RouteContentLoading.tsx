"use client";

export default function RouteContentLoading({
  variant = "page",
}: {
  variant?: "page" | "board";
}) {
  if (variant === "board") {
    return (
      <div className="animate-pulse px-5 py-5">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="rounded-[20px] border border-[#ece7df] bg-[#faf7f2] p-4">
              <div className="h-3 w-20 rounded bg-[#ece7df]" />
              <div className="mt-4 h-8 w-14 rounded bg-[#ece7df]" />
              <div className="mt-4 h-3 w-24 rounded bg-[#f1ede6]" />
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-[22px] border border-[#ece7df] bg-white p-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="border-b border-[#f3efe8] py-4 last:border-b-0">
              <div className="h-4 w-48 rounded bg-[#ece7df]" />
              <div className="mt-3 h-3 w-64 rounded bg-[#f1ede6]" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse space-y-4 py-2">
      <div className="rounded-[22px] border border-[#ece7df] bg-white p-6">
        <div className="h-3 w-28 rounded bg-[#ece7df]" />
        <div className="mt-4 h-8 w-72 rounded bg-[#ece7df]" />
        <div className="mt-4 h-3 w-full rounded bg-[#f1ede6]" />
        <div className="mt-2 h-3 w-4/5 rounded bg-[#f1ede6]" />
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="rounded-[22px] border border-[#ece7df] bg-white p-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="py-3 first:pt-0 last:pb-0">
              <div className="h-4 w-52 rounded bg-[#ece7df]" />
              <div className="mt-2 h-3 w-full rounded bg-[#f1ede6]" />
            </div>
          ))}
        </div>
        <div className="rounded-[22px] border border-[#ece7df] bg-white p-6">
          <div className="h-4 w-32 rounded bg-[#ece7df]" />
          <div className="mt-4 h-24 rounded-[18px] bg-[#faf7f2]" />
          <div className="mt-4 h-24 rounded-[18px] bg-[#faf7f2]" />
        </div>
      </div>
    </div>
  );
}
