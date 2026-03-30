const LOCAL_APP_URL = "http://localhost:3002";

function sanitizeUrl(value?: string | null) {
  return value?.trim().replace(/\/+$/, "");
}

export function getAppBaseUrl() {
  return (
    sanitizeUrl(process.env.NEXT_PUBLIC_APP_URL) ||
    sanitizeUrl(process.env.NEXTAUTH_URL) ||
    LOCAL_APP_URL
  );
}

export function getOAuthCallbackBaseUrl() {
  return (
    sanitizeUrl(process.env.OAUTH_CALLBACK_BASE_URL) ||
    sanitizeUrl(process.env.NEXTAUTH_URL) ||
    getAppBaseUrl()
  );
}
