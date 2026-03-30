"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "@/lib/analytics";

type TrackEventOnMountProps = {
  eventName: string;
  params?: Record<string, string | number | boolean>;
};

export default function TrackEventOnMount({ eventName, params = {} }: TrackEventOnMountProps) {
  useEffect(() => {
    trackAnalyticsEvent(eventName, params);
  }, [eventName, params]);

  return null;
}
