import { describe, expect, it } from "vitest";
import { computePreLaunchReadiness } from "@/lib/prelaunch-readiness";

describe("computePreLaunchReadiness", () => {
  it("starts at zero when nothing is completed or linked yet", () => {
    const result = computePreLaunchReadiness([
      { completed: false, priority: "HIGH", linkedTaskId: null },
      { completed: false, priority: "MEDIUM", linkedTaskId: null },
    ], "PREPARING");

    expect(result.score).toBe(0);
    expect(result.stageBonus).toBe(0);
  });

  it("increases when a checklist item is linked to a task", () => {
    const base = computePreLaunchReadiness([
      { completed: false, priority: "HIGH", linkedTaskId: null },
      { completed: false, priority: "MEDIUM", linkedTaskId: null },
    ], "BUILDING");

    const withTask = computePreLaunchReadiness([
      { completed: false, priority: "HIGH", linkedTaskId: "task_1" },
      { completed: false, priority: "MEDIUM", linkedTaskId: null },
    ], "BUILDING");

    expect(withTask.score).toBeGreaterThan(base.score);
  });

  it("increases when stage maturity advances after work has started", () => {
    const building = computePreLaunchReadiness([
      { completed: false, priority: "HIGH", linkedTaskId: "task_1" },
    ], "BUILDING");

    const preparing = computePreLaunchReadiness([
      { completed: false, priority: "HIGH", linkedTaskId: "task_1" },
    ], "PREPARING");

    expect(preparing.score).toBeGreaterThan(building.score);
  });

  it("reaches 100 when all items are complete", () => {
    const result = computePreLaunchReadiness([
      { completed: true, priority: "HIGH", linkedTaskId: null },
      { completed: true, priority: "MEDIUM", linkedTaskId: "task_1" },
      { completed: true, priority: "LOW", linkedTaskId: null },
    ], "PREPARING");

    expect(result.score).toBe(100);
  });
});
