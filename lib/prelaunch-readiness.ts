import type { LaunchStageKey } from "@/lib/launch-stage";

export type ReadinessChecklistItem = {
  completed: boolean;
  priority: string;
  linkedTaskId?: string | null;
};

function getWeight(priority: string): number {
  if (priority === "HIGH") return 3;
  if (priority === "MEDIUM") return 2;
  return 1;
}

function getStageBonus(stageKey?: LaunchStageKey | null) {
  if (stageKey === "PREPARING") return 12;
  if (stageKey === "TESTING") return 8;
  if (stageKey === "BUILDING") return 4;
  return 0;
}

export function computePreLaunchReadiness(
  items: ReadinessChecklistItem[],
  launchStageKey?: LaunchStageKey | null,
) {
  const stageBonus = getStageBonus(launchStageKey);
  if (items.length === 0) {
    return {
      score: 0,
      checklistPercent: 0,
      executionPercent: 0,
      stageBonus: 0,
    };
  }

  const totalWeight = items.reduce((sum, item) => sum + getWeight(item.priority), 0);
  const completedWeight = items
    .filter((item) => item.completed)
    .reduce((sum, item) => sum + getWeight(item.priority), 0);
  const coveredWeight = items
    .filter((item) => !item.completed && item.linkedTaskId)
    .reduce((sum, item) => sum + getWeight(item.priority), 0);
  const appliedStageBonus = completedWeight > 0 || coveredWeight > 0 ? stageBonus : 0;

  const checklistPercent = totalWeight > 0 ? Math.round((completedWeight / totalWeight) * 100) : 0;
  const executionPercent = totalWeight > 0 ? Math.round((coveredWeight / totalWeight) * 100) : 0;
  if (completedWeight === totalWeight) {
    return {
      score: 100,
      checklistPercent,
      executionPercent,
      stageBonus: appliedStageBonus,
    };
  }

  const score = Math.min(
    100,
    Math.round(checklistPercent * 0.75 + executionPercent * 0.13 + appliedStageBonus),
  );

  return {
    score,
    checklistPercent,
    executionPercent,
    stageBonus: appliedStageBonus,
  };
}
