"use client";

import ClarityScript from "@/components/analytics/ClarityScript";
import GoogleAnalyticsScript from "@/components/analytics/GoogleAnalyticsScript";

type AnalyticsScriptsProps = {
  clarityProjectId?: string;
};

export default function AnalyticsScripts({ clarityProjectId }: AnalyticsScriptsProps) {
  if (typeof window === "undefined") return null;

  const consent =
    window.localStorage.getItem("tiramisup-analytics-consent") ||
    document.cookie
      .split("; ")
      .find((item) => item.startsWith("analytics_consent="))
      ?.split("=")[1];

  if (consent !== "granted") return null;

  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  if (!gaMeasurementId && process.env.NODE_ENV !== "production") {
    console.warn(
      "[analytics] Consent granted but NEXT_PUBLIC_GA_MEASUREMENT_ID is not set. GA4 will not load."
    );
  }

  return (
    <>
      {clarityProjectId ? <ClarityScript projectId={clarityProjectId} /> : null}
      {gaMeasurementId ? <GoogleAnalyticsScript measurementId={gaMeasurementId} /> : null}
    </>
  );
}
