type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";
type SuggestionConfidence = "high" | "medium" | "low";
type SuggestionSource = "ai" | "fallback";

export type SafeAgentSuggestion = {
  id?: string;
  label: string;
  title?: string;
  intent?: "create_task";
  payload?: { title: string; description?: string; priority?: string };
  description?: string | null;
  whyItMatters?: string;
  doneCriteria?: string;
  nextAction?: string;
  category?: string;
  priority?: SuggestionPriority;
  source?: SuggestionSource;
  confidence?: SuggestionConfidence;
  existingTaskId?: string;
  existingTaskTitle?: string;
};

const VALID_CATEGORIES = new Set([
  "PRODUCT",
  "TECH",
  "LEGAL",
  "MARKETING",
  "ACQUISITION",
  "ACTIVATION",
  "RETENTION",
  "REVENUE",
  "MEASUREMENT",
]);

function asString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

export function sanitizeAgentSuggestion(raw: unknown): SafeAgentSuggestion | null {
  if (!raw || typeof raw !== "object") return null;
  const source = raw as Record<string, unknown>;

  const label =
    asString(source.label) ??
    asString(source.title) ??
    asString((source.payload as Record<string, unknown> | undefined)?.title);

  if (!label) return null;

  const category = asString(source.category);
  const priority = asString(source.priority);
  const confidence = asString(source.confidence);
  const suggestionSource = asString(source.source);
  const payload = source.payload && typeof source.payload === "object"
    ? source.payload as Record<string, unknown>
    : undefined;

  return {
    id: asString(source.id),
    label,
    title: asString(source.title),
    intent: "create_task",
    payload: payload && asString(payload.title)
      ? {
          title: asString(payload.title)!,
          description: asString(payload.description),
          priority: asString(payload.priority),
        }
      : undefined,
    description: typeof source.description === "string" ? source.description.trim() : null,
    whyItMatters: asString(source.whyItMatters),
    doneCriteria: asString(source.doneCriteria),
    nextAction: asString(source.nextAction),
    category: category && VALID_CATEGORIES.has(category) ? category : undefined,
    priority:
      priority === "HIGH" || priority === "LOW" || priority === "MEDIUM"
        ? priority
        : "MEDIUM",
    source:
      suggestionSource === "ai" || suggestionSource === "fallback"
        ? suggestionSource
        : undefined,
    confidence:
      confidence === "high" || confidence === "low" || confidence === "medium"
        ? confidence
        : undefined,
    existingTaskId: asString(source.existingTaskId),
    existingTaskTitle: asString(source.existingTaskTitle),
  };
}

export function sanitizeAgentSuggestions(raw: unknown): SafeAgentSuggestion[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => sanitizeAgentSuggestion(item))
    .filter((item): item is SafeAgentSuggestion => Boolean(item));
}
