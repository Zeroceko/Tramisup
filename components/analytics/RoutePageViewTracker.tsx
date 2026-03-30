"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackAnalyticsPageView } from "@/lib/analytics";

type RoutePageViewTrackerProps = {
  params?: Record<string, string | number | boolean>;
};

export default function RoutePageViewTracker({ params = {} }: RoutePageViewTrackerProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.toString();
    const currentPath = search ? `${pathname}?${search}` : pathname;
    const storageKey = "tiramisup-last-page-view-path";
    const lastTrackedPath = window.sessionStorage.getItem(storageKey);

    if (lastTrackedPath === null) {
      window.sessionStorage.setItem(storageKey, currentPath);
      return;
    }

    if (lastTrackedPath !== currentPath) {
      trackAnalyticsPageView(currentPath, params);
      window.sessionStorage.setItem(storageKey, currentPath);
    }
  }, [pathname, searchParams, params]);

  return null;
}
