type StoredGrowthCheckin = {
  version: 1;
  completedAt: string;
  answers: Record<string, string>;
};

type ProductFeedbackEntry = {
  id: string;
  name: string | null;
  email: string | null;
  message: string;
  createdAt: string;
};

type AdditionalContextEnvelope = {
  version: 1;
  legacyText: string | null;
  growthCheckin: StoredGrowthCheckin | null;
  feedbackInbox?: ProductFeedbackEntry[] | null;
};

export type FeedbackEntry = ProductFeedbackEntry;

function isFeedbackEntry(value: unknown): value is ProductFeedbackEntry {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.message === "string" &&
    typeof candidate.createdAt === "string" &&
    (candidate.name === null || typeof candidate.name === "string" || typeof candidate.name === "undefined") &&
    (candidate.email === null || typeof candidate.email === "string" || typeof candidate.email === "undefined")
  );
}

function readEnvelope(value: string | null | undefined): AdditionalContextEnvelope {
  if (!value) {
    return {
      version: 1,
      legacyText: null,
      growthCheckin: null,
      feedbackInbox: [],
    };
  }

  try {
    const parsed = JSON.parse(value) as Partial<AdditionalContextEnvelope>;
    if (parsed?.version === 1) {
      const feedbackInbox = Array.isArray(parsed.feedbackInbox)
        ? parsed.feedbackInbox.filter(isFeedbackEntry)
        : [];

      return {
        version: 1,
        legacyText: typeof parsed.legacyText === "string" ? parsed.legacyText : null,
        growthCheckin:
          parsed.growthCheckin &&
          typeof parsed.growthCheckin === "object" &&
          parsed.growthCheckin.version === 1
            ? (parsed.growthCheckin as StoredGrowthCheckin)
            : null,
        feedbackInbox,
      };
    }
  } catch {
    // Legacy plain-text additionalContext stays valid.
  }

  return {
    version: 1,
    legacyText: value,
    growthCheckin: null,
    feedbackInbox: [],
  };
}

export function readFeedbackFromAdditionalContext(value: string | null | undefined) {
  return readEnvelope(value).feedbackInbox ?? [];
}

export function appendFeedbackToAdditionalContext(input: {
  currentValue: string | null | undefined;
  entry: FeedbackEntry;
  limit?: number;
}) {
  const envelope = readEnvelope(input.currentValue);
  const nextInbox = [input.entry, ...(envelope.feedbackInbox ?? [])].slice(0, input.limit ?? 20);

  return JSON.stringify({
    version: 1,
    legacyText: envelope.legacyText,
    growthCheckin: envelope.growthCheckin,
    feedbackInbox: nextInbox,
  } satisfies AdditionalContextEnvelope);
}
