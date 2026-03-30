"use client";

import { useEffect, useRef } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type SectionViewTrackerProps = {
  eventName: string;
  params?: Record<string, string | number | boolean>;
  targetId: string;
};

export default function SectionViewTracker({
  eventName,
  params = {},
  targetId,
}: SectionViewTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target || hasTrackedRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || hasTrackedRef.current) return;
        hasTrackedRef.current = true;
        trackAnalyticsEvent(eventName, params);
        observer.disconnect();
      },
      { threshold: 0.45 },
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [eventName, params, targetId]);

  return null;
}
