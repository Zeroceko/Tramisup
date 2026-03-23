import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FounderCoachContext } from "@/lib/founder-coach-context";

export async function loadProjectSkill(name: string): Promise<string> {
  const filePath = path.join(process.cwd(), ".gsd", "skills", name, "SKILL.md");
  return readFile(filePath, "utf8");
}

type SkillMatch = {
  name: string;
  reason: string;
};

export async function loadRelevantFounderCoachSkills(
  context: FounderCoachContext,
  message: string
): Promise<Array<SkillMatch & { content: string }>> {
  const lower = message.toLowerCase();
  const matches: SkillMatch[] = [];

  const pushUnique = (name: string, reason: string) => {
    if (!matches.find((match) => match.name === name)) {
      matches.push({ name, reason });
    }
  };

  const platformsText = context.storeReadiness.platforms.join(" ").toLowerCase();
  const looksLikeStoreQuestion =
    /app store|ios|apple|play store|android|google play|review|rejection|rejected|privacy policy|terms|subscription|abonelik|billing|data safety|permissions|paywall/.test(lower);

  if (/app store|ios|apple|sign in with apple/.test(lower) || platformsText.includes("ios")) {
    pushUnique("app-store-submission-advisor", "iOS / App Store readiness or review guidance is relevant.");
  }

  if (/play store|android|google play|data safety|permissions|billing/.test(lower) || platformsText.includes("android")) {
    pushUnique("play-store-submission-advisor", "Android / Google Play readiness or policy guidance is relevant.");
  }

  if (
    /metric|metrics|metrik|analytics|analitik|dashboard|grafik|chart|retention|activation|revenue|conversion|funnel|wau|mau/.test(lower) ||
    context.metrics.hasActivationMetric ||
    context.metrics.hasRevenueMetric ||
    context.metrics.hasRetentionMetric
  ) {
    pushUnique("data-analyst", "The user is asking for metric, analytics, or interpretation guidance.");
  }

  if (
    /roadmap|strategy|strateji|priorit|öncelik|what should i do next|next step|launch plan|go to market|positioning|focus this week|hafta/.test(lower) ||
    context.execution.tasks.open > 0 ||
    context.execution.launchChecklist.blockers > 0
  ) {
    pushUnique("product-strategist", "The user needs prioritization, sequencing, or product strategy guidance.");
  }

  if (
    /privacy|terms|kvkk|gdpr|legal|contract|compliance|policy|tos|eula/.test(lower) ||
    (looksLikeStoreQuestion && context.storeReadiness.hasSubscription)
  ) {
    pushUnique("legal-advisor", "Legal or compliance guidance is relevant to the request.");
  }

  const limitedMatches = matches.slice(0, 4);

  return Promise.all(
    limitedMatches.map(async (match) => ({
      ...match,
      content: await loadProjectSkill(match.name),
    }))
  );
}
