const FALLBACK_ADMIN_EMAILS = ["chef@tiramisup.app"] as const;

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function getAllowedAdminEmails() {
  const envList = [process.env.ADMIN_EMAIL, process.env.ADMIN_EMAILS]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .flatMap((value) => value.split(","))
    .map(normalizeEmail)
    .filter(Boolean);

  return new Set<string>([...envList, ...FALLBACK_ADMIN_EMAILS]);
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return getAllowedAdminEmails().has(normalizeEmail(email));
}
