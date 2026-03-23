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
  const looksLikeAsoQuestion =
    /aso|app store optimization|keywords?|subtitle|short description|description|screenshot|screenshots|icon|metadata|listing|app title|store page|preview video/.test(lower);
  const looksLikeLaunchQuestion =
    /launch readiness|pre-launch|blocker|blockers|ready to launch|launch review|release readiness|launch checklist|what still blocks|launch score|go live/.test(lower);
  const looksLikeInstrumentationQuestion =
    /instrumentation|tracking plan|event schema|event taxonomy|events?|telemetry|measurement|tagging|product analytics|analytics setup|funnel schema|conversion|segment|mixpanel|amplitude|posthog/.test(lower);
  const looksLikeSkillQuestion =
    /skill gateway|which skill|what skill|find a skill|skill(s)?|route|routing|handoff/.test(lower);

  if (looksLikeAsoQuestion) {
    pushUnique("aso-advisor", "The user is asking about app listing optimization, discoverability, or conversion.");
  }

  if (looksLikeSkillQuestion) {
    pushUnique("skill-gateway", "The user is asking about skill routing, selection, or gateway behavior.");
  }

  if (looksLikeLaunchQuestion || context.execution.launchChecklist.blockers > 0) {
    pushUnique("launch-readiness-advisor", "The user needs launch sequencing, blocker prioritization, or release readiness guidance.");
  }

  if (looksLikeInstrumentationQuestion) {
    pushUnique("analytics-instrumentation-advisor", "The user is asking about tracking plans, event design, or analytics instrumentation.");
  }

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
