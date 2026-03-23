import type { FounderCoachContext } from "@/lib/founder-coach-context";
import { loadRelevantFounderCoachSkills } from "@/lib/project-skill-loader";

export type FounderCoachResponseMode =
  | "REACTIVE_ANSWER"
  | "PROACTIVE_SUGGESTION";

export type LoadedFounderCoachSkill = {
  name: string;
  reason: string;
  content: string;
};

export type FounderCoachDecision = {
  mode: FounderCoachResponseMode;
  skills: LoadedFounderCoachSkill[];
};

export async function buildFounderCoachDecision(input: {
  context: FounderCoachContext;
  message?: string;
  mode: FounderCoachResponseMode;
}): Promise<FounderCoachDecision> {
  const message = input.message ?? buildSyntheticPromptFromContext(input.context, input.mode);
  const skills = await loadRelevantFounderCoachSkills(input.context, message);

  return {
    mode: input.mode,
    skills,
  };
}

function buildSyntheticPromptFromContext(
  context: FounderCoachContext,
  mode: FounderCoachResponseMode
) {
  if (mode === "PROACTIVE_SUGGESTION") {
    return [
      context.product.status,
      context.product.launchStatus,
      context.growthWorkspace.metricSetupComplete ? "metric setup complete" : "metric setup missing",
      context.growthWorkspace.entryCount > 0 ? "metric entries present" : "metric entries missing",
      context.growthWorkspace.nextFocus,
      context.metrics.hasActivationMetric ? "activation metric defined" : "activation metric missing",
      context.metrics.hasRetentionMetric ? "retention metric defined" : "retention metric missing",
      context.metrics.hasRevenueMetric ? "revenue metric defined" : "revenue metric missing",
      context.execution.tasks.open > 0 ? "open tasks" : "no open tasks",
      context.execution.launchChecklist.blockers > 0 ? "launch blockers" : "no launch blockers",
      context.storeReadiness.hasSubscription ? "subscription product" : "non subscription product",
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "general founder guidance";
}
