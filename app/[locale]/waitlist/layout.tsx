import type { ReactNode } from "react";
import AnalyticsConsentBanner from "@/components/analytics/AnalyticsConsentBanner";
import AnalyticsScripts from "@/components/analytics/AnalyticsScripts";
import RoutePageViewTracker from "@/components/analytics/RoutePageViewTracker";

export default function WaitlistLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AnalyticsScripts clarityProjectId="w2uovepi9h" />
      <RoutePageViewTracker params={{ funnel: "waitlist" }} />
      {children}
      <AnalyticsConsentBanner />
    </>
  );
}
