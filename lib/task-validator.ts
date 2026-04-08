/**
 * Post-generation validator for AI-produced tasks and checklist items.
 *
 * Why this exists:
 * Prompt rules ("output in English", "no filler", "every item has Why/Done/Next")
 * are advisory — the model often violates them. Until now we trusted the prompt.
 * This validator is the contract enforced in code, so a misbehaving model is
 * caught before its output ever reaches the founder.
 *
 * Failure here = the candidate is dropped. Generation pipelines should call
 * filterValidCandidates() and either accept the trimmed list or fall back.
 */

import { parseStructuredDescription } from "@/lib/task-parsing";

export type Locale = "en" | "tr";

export type TaskCandidate = {
  title: string;
  description?: string | null;
  whyItMatters?: string | null;
  doneCriteria?: string | null;
  nextAction?: string | null;
  category?: string | null;
  priority?: "HIGH" | "MEDIUM" | "LOW";
};

export type ValidationResult =
  | { valid: true; normalized: Required<Pick<TaskCandidate, "title" | "whyItMatters" | "doneCriteria" | "nextAction" | "category" | "priority">> & { description: string | null } }
  | { valid: false; reason: ValidationFailureReason; detail?: string };

export type ValidationFailureReason =
  | "title_too_short"
  | "title_filler"
  | "wrong_locale"
  | "missing_why"
  | "missing_done"
  | "missing_next_action"
  | "missing_category"
  | "invalid_category"
  | "invalid_priority";

const TITLE_MIN = 12;

/** Generic phrases that almost always indicate filler. Lowercased, partial match. */
const FILLER_PATTERNS: RegExp[] = [
  /^set up (ga4|stripe|analytics)$/i,
  /^do the launch$/i,
  /^launch (the )?product$/i,
  /^talk to users?$/i,
  /^kullanıcılarla konuş$/i,
  /^başla(yın)?$/i,
  /^todo$/i,
  /^placeholder/i,
  /^example task/i,
  /^örnek görev/i,
];

/** Allowed categories. No OTHER bucket — items without category get rejected. */
const CATEGORY_WHITELIST = new Set([
  "PRODUCT",
  "MARKETING",
  "LEGAL",
  "TECH",
  "ACQUISITION",
  "ACTIVATION",
  "RETENTION",
  "REVENUE",
  "MEASUREMENT",
]);

/**
 * Detect if a string contains characters that strongly suggest a specific
 * locale. Used to catch the "model returned Turkish for an English user" bug.
 */
function looksTurkish(text: string): boolean {
  // Turkish-only diacritics. The only false positive risk is "ç" appearing in
  // a borrowed word, but in practice these chars almost never show up in EN.
  return /[şŞğĞıİçÇöÖüÜ]/.test(text);
}

function looksEnglish(text: string): boolean {
  // Heuristic: contains at least 3 English stop words and no Turkish diacritics.
  // Avoids false positives on TR text that happens to include "the" inside a URL.
  if (looksTurkish(text)) return false;
  const stops = ["the ", " the", "and ", " and", "with ", "your ", "for ", "this ", "you "];
  let hits = 0;
  const lower = ` ${text.toLowerCase()} `;
  for (const s of stops) if (lower.includes(s)) hits++;
  return hits >= 3;
}

/** Lift structured fields out of free-text description if columns are blank. */
function liftStructuredFromDescription(c: TaskCandidate): TaskCandidate {
  if (c.whyItMatters && c.doneCriteria && c.nextAction) return c;
  const parsed = parseStructuredDescription(c.description ?? null);
  return {
    ...c,
    whyItMatters: c.whyItMatters ?? parsed.why,
    doneCriteria: c.doneCriteria ?? parsed.doneCriteria,
    nextAction: c.nextAction ?? parsed.nextAction,
  };
}

export function validateTaskCandidate(
  raw: TaskCandidate,
  locale: Locale,
): ValidationResult {
  const candidate = liftStructuredFromDescription(raw);
  const title = (candidate.title ?? "").trim();

  if (title.length < TITLE_MIN) {
    return { valid: false, reason: "title_too_short", detail: title };
  }

  for (const pattern of FILLER_PATTERNS) {
    if (pattern.test(title)) {
      return { valid: false, reason: "title_filler", detail: title };
    }
  }

  // Locale enforcement: catches the "model ignored OUTPUT LANGUAGE" failure mode.
  // Only fire when there is enough surface area to judge — short titles are noisy.
  const surface = `${title} ${candidate.whyItMatters ?? ""} ${candidate.nextAction ?? ""}`.trim();
  if (locale === "en" && looksTurkish(surface)) {
    return { valid: false, reason: "wrong_locale", detail: "expected en, got tr" };
  }
  if (locale === "tr" && surface.length > 30 && looksEnglish(surface) && !looksTurkish(surface)) {
    return { valid: false, reason: "wrong_locale", detail: "expected tr, got en" };
  }

  if (!candidate.whyItMatters || candidate.whyItMatters.trim().length < 10) {
    return { valid: false, reason: "missing_why" };
  }
  if (!candidate.doneCriteria || candidate.doneCriteria.trim().length < 10) {
    return { valid: false, reason: "missing_done" };
  }
  if (!candidate.nextAction || candidate.nextAction.trim().length < 10) {
    return { valid: false, reason: "missing_next_action" };
  }

  const cat = (candidate.category ?? "").toUpperCase().trim();
  if (!cat) return { valid: false, reason: "missing_category" };
  if (!CATEGORY_WHITELIST.has(cat)) {
    return { valid: false, reason: "invalid_category", detail: cat };
  }

  const priority = candidate.priority ?? "MEDIUM";
  if (!["HIGH", "MEDIUM", "LOW"].includes(priority)) {
    return { valid: false, reason: "invalid_priority" };
  }

  return {
    valid: true,
    normalized: {
      title,
      description: candidate.description?.trim() || null,
      whyItMatters: candidate.whyItMatters.trim(),
      doneCriteria: candidate.doneCriteria.trim(),
      nextAction: candidate.nextAction.trim(),
      category: cat,
      priority,
    },
  };
}

/**
 * Filter a list of candidates to those that pass validation.
 * Returns both the survivors and the rejection log so the caller can decide
 * whether to fall back when too many were dropped.
 */
export function filterValidCandidates(
  candidates: TaskCandidate[],
  locale: Locale,
): {
  valid: Array<Extract<ValidationResult, { valid: true }>["normalized"]>;
  rejected: Array<{ candidate: TaskCandidate; reason: ValidationFailureReason; detail?: string }>;
} {
  const valid: Array<Extract<ValidationResult, { valid: true }>["normalized"]> = [];
  const rejected: Array<{ candidate: TaskCandidate; reason: ValidationFailureReason; detail?: string }> = [];
  for (const c of candidates) {
    const result = validateTaskCandidate(c, locale);
    if (result.valid) {
      valid.push(result.normalized);
    } else {
      rejected.push({ candidate: c, reason: result.reason, detail: result.detail });
    }
  }
  return { valid, rejected };
}

export const CATEGORY_VALUES = Array.from(CATEGORY_WHITELIST);
