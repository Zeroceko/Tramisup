type AnalyticsParams = Record<string, string | number | boolean>;

type AnalyticsWindow = Window & {
  gtag?: (...args: unknown[]) => void;
};

const GTAG_RETRY_DELAY_MS = 250;
const GTAG_RETRY_LIMIT = 12;

function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;

  const consent =
    window.localStorage.getItem("tiramisup-analytics-consent") ||
    document.cookie
      .split("; ")
      .find((item) => item.startsWith("analytics_consent="))
      ?.split("=")[1];

  return consent === "granted";
}

function getGtag() {
  if (!hasAnalyticsConsent()) return null;

  const gtag = (window as AnalyticsWindow).gtag;
  return typeof gtag === "function" ? gtag : null;
}

function dispatchWithRetry(
  args: ["event", string, AnalyticsParams],
  attempt = 0,
) {
  const gtag = getGtag();
  if (gtag) {
    gtag(...args);
    return;
  }

  if (!hasAnalyticsConsent() || attempt >= GTAG_RETRY_LIMIT) return;

  window.setTimeout(() => {
    dispatchWithRetry(args, attempt + 1);
  }, GTAG_RETRY_DELAY_MS);
}

export function trackAnalyticsEvent(eventName: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  dispatchWithRetry(["event", eventName, params]);
}

export function trackAnalyticsPageView(pagePath: string, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  dispatchWithRetry(["event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
    ...params,
  }]);
}
