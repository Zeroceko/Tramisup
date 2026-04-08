/**
 * Shared parser/normalizer for task structured fields.
 *
 * Two purposes:
 * 1. Until every old task is backfilled, descriptions may carry the structured
 *    fields ("Why: …\nDone when: …\nNext action: …") in free text. The parser
 *    extracts them so we can render real columns or fall back gracefully.
 * 2. AI generation rules require all three fields. The parser is what the
 *    validator and createTaskWithGuards lean on to lift the fields into
 *    real columns at save time.
 *
 * Used by lib/task-validator.ts, lib/task-create.ts, components/TasksList.tsx.
 */

export type StructuredDescription = {
  why: string | null;
  doneCriteria: string | null;
  nextAction: string | null;
  /** Anything in the description that wasn't a labeled line (rare). */
  leftover: string | null;
};

const PATTERNS: Array<{ key: "why" | "doneCriteria" | "nextAction"; regex: RegExp }> = [
  { key: "why",          regex: /^\s*(?:why|neden)\s*[:：\-]\s*(.+)$/im },
  { key: "doneCriteria", regex: /^\s*(?:done\s*when|biten\s*hali|biten\s*durum|tamamland[ıi]\s*say[ıi]l[ıi]r)\s*[:：\-]\s*(.+)$/im },
  { key: "nextAction",   regex: /^\s*(?:next\s*action|sonraki\s*ad[ıi]m|ilk\s*ad[ıi]m)\s*[:：\-]\s*(.+)$/im },
];

export function parseStructuredDescription(raw?: string | null): StructuredDescription {
  if (!raw || typeof raw !== "string") {
    return { why: null, doneCriteria: null, nextAction: null, leftover: null };
  }
  const text = raw.replace(/\r\n/g, "\n");
  const fields: { why: string | null; doneCriteria: string | null; nextAction: string | null } = {
    why: null,
    doneCriteria: null,
    nextAction: null,
  };
  let leftover = text;
  for (const { key, regex } of PATTERNS) {
    const match = text.match(regex);
    if (match) {
      fields[key] = match[1].trim();
      leftover = leftover.replace(match[0], "").trim();
    }
  }
  const matched = fields.why || fields.doneCriteria || fields.nextAction;
  return {
    ...fields,
    leftover: matched ? (leftover.length > 0 ? leftover : null) : text,
  };
}

/**
 * Build a deterministic, semantic-aware key from a task title for dedupe.
 * Strips punctuation, lowercases (locale-aware), drops common stop words and
 * generic verbs that produce false uniqueness ("set up", "kur", "olustur").
 */
export function normalizeTaskTitleKey(title: string): string {
  if (!title) return "";
  // Lowercase with Turkish locale awareness so İ→i and I→ı behave correctly.
  const lower = title.toLocaleLowerCase("tr-TR");
  // Strip everything that isn't a letter (incl. Turkish chars), digit, or whitespace.
  const cleaned = lower.replace(/[^\p{L}\p{N}\s]/gu, " ");
  const STOP = new Set([
    // EN
    "the", "a", "an", "to", "of", "for", "on", "in", "and", "or", "with", "your", "our",
    "set", "up", "setup", "create", "build", "make", "do", "start", "begin", "ensure",
    "first", "next", "new",
    // TR
    "ve", "ile", "icin", "için", "bir", "ilk", "yeni",
    "kur", "olustur", "oluştur", "yap", "ekle", "baslat", "başlat", "hazirla", "hazırla",
  ]);
  const words = cleaned
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && !STOP.has(w));
  return words.sort().join(" ");
}

/** Return true when two tasks are likely the same outcome described differently. */
export function tasksAreNearDuplicate(a: string, b: string): boolean {
  const ka = normalizeTaskTitleKey(a);
  const kb = normalizeTaskTitleKey(b);
  if (!ka || !kb) return false;
  if (ka === kb) return true;
  // Token overlap heuristic: ≥75% shared meaningful tokens means same outcome.
  const sa = new Set(ka.split(" "));
  const sb = new Set(kb.split(" "));
  const inter = [...sa].filter((t) => sb.has(t)).length;
  const union = new Set([...sa, ...sb]).size;
  if (union === 0) return false;
  return inter / union >= 0.75;
}
