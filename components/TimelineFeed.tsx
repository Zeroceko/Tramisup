"use client";

import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  date: Date;
}

const eventDotColor: Record<string, string> = {
  LAUNCH:                 "bg-[#75fc96]",
  MILESTONE:              "bg-[#fee74e]",
  GOAL_COMPLETED:         "bg-[#95dbda]",
  INTEGRATION_CONNECTED:  "bg-[#ffd7ef]",
  METRIC_THRESHOLD:       "bg-[#95dbda]",
  CUSTOM:                 "bg-[#e8e8e8]",
};

const eventIcon: Record<string, string> = {
  LAUNCH:                 "🚀",
  MILESTONE:              "🎯",
  GOAL_COMPLETED:         "✅",
  INTEGRATION_CONNECTED:  "🔌",
  METRIC_THRESHOLD:       "📊",
  CUSTOM:                 "📌",
};

export default function TimelineFeed({
  events,
  productId,
}: {
  events: TimelineEvent[];
  productId: string;
}) {
  void productId;

  return (
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5 sticky top-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-0.5">Geçmiş</p>
      <h2 className="text-[16px] font-semibold text-[#0d0d12] mb-5">Zaman Tüneli</h2>

      {events.length === 0 ? (
        <p className="text-center text-[13px] text-[#9ca3af] py-8">Henüz olay yok</p>
      ) : (
        <div className="space-y-4">
          {events.map((event, i) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${eventDotColor[event.eventType] ?? "bg-[#e8e8e8]"}`} />
                {i < events.length - 1 && <div className="w-px flex-1 bg-[#e8e8e8] mt-1" />}
              </div>
              <div className="flex-1 min-w-0 pb-4">
                <div className="flex items-start gap-2">
                  <span className="text-[14px] leading-none">{eventIcon[event.eventType] ?? "📌"}</span>
                  <p className="text-[13px] font-semibold text-[#0d0d12] leading-tight">{event.title}</p>
                </div>
                {event.description && (
                  <p className="text-[12px] text-[#666d80] mt-1 ml-6">{event.description}</p>
                )}
                <p className="text-[11px] text-[#9ca3af] mt-1 ml-6">
                  {format(new Date(event.date), "d MMM yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
