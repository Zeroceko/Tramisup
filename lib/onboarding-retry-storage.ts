export const ONBOARDING_RETRY_STORAGE_KEY = "tiramisup_onboarding_retry_v1";

export type SavedOnboardingRetryDraft = {
  locale: string;
  useMetrics: boolean;
  savedAt: string;
  data: Record<string, unknown>;
};

export function loadOnboardingRetryDraft(): SavedOnboardingRetryDraft | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(ONBOARDING_RETRY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedOnboardingRetryDraft;
  } catch {
    return null;
  }
}

export function saveOnboardingRetryDraft(draft: SavedOnboardingRetryDraft) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ONBOARDING_RETRY_STORAGE_KEY, JSON.stringify(draft));
}

export function clearOnboardingRetryDraft() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ONBOARDING_RETRY_STORAGE_KEY);
}

