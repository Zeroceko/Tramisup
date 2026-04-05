import { prisma } from "@/lib/prisma";
import type { Priority } from "@prisma/client";

export type LaunchChecklistPriorityCandidate = {
  id?: string;
  title?: string;
  description?: string | null;
  category?: string | null;
  priority: Priority | string;
  completed?: boolean;
};

const LEGAL_BLOCKER_PATTERNS = [
  /\b(kvkk|gdpr|privacy policy|gizlilik politikası|privacy notice|terms of service|kullanım şartları|çerez|cookie consent|consent)\b/i,
];

const SECURITY_BLOCKER_PATTERNS = [
  /\b(güvenlik|security|critical security|auth bypass|authentication|authorization|password reset|vulnerability|encryption|rate limit|data leak|veri sızıntısı)\b/i,
];

const STORE_BLOCKER_PATTERNS = [
  /\b(app store|play store|store review|reject|rejection|submission|metadata rejection|review account|store listing approval)\b/i,
];

const TECH_BLOCKER_PATTERNS = [
  /\b(crash|fatal error|production outage|downtime|cannot sign up|can not sign up|cannot pay|can not pay|ödeme alınamıyor|kayıt olunamıyor)\b/i,
];

function matchesAny(text: string, patterns: RegExp[]) {
  return patterns.some((pattern) => pattern.test(text));
}

export function shouldStayHighPriority(candidate: LaunchChecklistPriorityCandidate) {
  if (candidate.priority !== "HIGH") return false;

  const haystack = `${candidate.title ?? ""} ${candidate.description ?? ""}`.toLowerCase();
  const category = (candidate.category ?? "").toUpperCase();

  if (matchesAny(haystack, LEGAL_BLOCKER_PATTERNS)) return true;
  if (matchesAny(haystack, SECURITY_BLOCKER_PATTERNS)) return true;
  if (matchesAny(haystack, STORE_BLOCKER_PATTERNS)) return true;
  if (matchesAny(haystack, TECH_BLOCKER_PATTERNS)) return true;

  if (category === "LEGAL" && /\b(policy|compliance|uyumluluk|legal|required|required before launch)\b/i.test(haystack)) {
    return true;
  }

  return false;
}

export function normalizeLaunchChecklistPriority(
  candidate: LaunchChecklistPriorityCandidate
): Priority {
  if (candidate.priority === "LOW") return "LOW";
  if (candidate.priority !== "HIGH") return "MEDIUM";
  return shouldStayHighPriority(candidate) ? "HIGH" : "MEDIUM";
}

export async function normalizeStoredLaunchChecklistPriorities(
  productId: string
) {
  const highItems = await prisma.launchChecklist.findMany({
    where: { productId, priority: "HIGH" },
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      completed: true,
    },
  });

  const idsToDowngrade = highItems
    .filter((item) =>
      normalizeLaunchChecklistPriority({ ...item, priority: "HIGH" }) !== "HIGH"
    )
    .map((item) => item.id);

  if (idsToDowngrade.length === 0) return 0;

  const result = await prisma.launchChecklist.updateMany({
    where: { id: { in: idsToDowngrade } },
    data: { priority: "MEDIUM" },
  });

  return result.count;
}
