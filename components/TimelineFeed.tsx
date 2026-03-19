"use client";

import { format } from "date-fns";

interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description: string | null;
  date: Date;
}

const eventIcons: Record<string, string> = {
  LAUNCH: "🚀",
  MILESTONE: "🎯",
  GOAL_COMPLETED: "✅",
  INTEGRATION_CONNECTED: "🔌",
  METRIC_THRESHOLD: "📊",
  CUSTOM: "📌",
};

export default function TimelineFeed({
  events,
  productId,
}: {
  events: TimelineEvent[];
  productId: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Timeline</h2>
      
      {events.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No events yet</p>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                <span className="text-lg">{eventIcons[event.eventType] || "📌"}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                {event.description && (
                  <p className="text-sm text-gray-600 mt-1">{event.description}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(event.date), "MMM d, yyyy")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
