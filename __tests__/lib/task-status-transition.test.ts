import { describe, expect, it } from "vitest";
import { buildTaskStatusTransition } from "@/lib/task-status-transition";

describe("buildTaskStatusTransition", () => {
  const now = new Date("2026-04-13T10:30:00.000Z");

  it("sets startedAt the first time a task moves into progress", () => {
    const result = buildTaskStatusTransition(
      { status: "TODO", startedAt: null, completedAt: null },
      "IN_PROGRESS",
      now,
    );

    expect(result.eventType).toBe("STARTED");
    expect(result.data.startedAt).toEqual(now);
    expect(result.data.completedAt).toBeNull();
  });

  it("sets both startedAt and completedAt on direct completion", () => {
    const result = buildTaskStatusTransition(
      { status: "TODO", startedAt: null, completedAt: null },
      "DONE",
      now,
    );

    expect(result.eventType).toBe("COMPLETED");
    expect(result.data.startedAt).toEqual(now);
    expect(result.data.completedAt).toEqual(now);
  });

  it("preserves sticky startedAt and clears completedAt on reopen to in progress", () => {
    const startedAt = new Date("2026-04-11T08:00:00.000Z");
    const completedAt = new Date("2026-04-12T09:00:00.000Z");
    const result = buildTaskStatusTransition(
      { status: "DONE", startedAt, completedAt },
      "IN_PROGRESS",
      now,
    );

    expect(result.eventType).toBe("REOPENED");
    expect(result.data.startedAt).toBeUndefined();
    expect(result.data.completedAt).toBeNull();
  });

  it("does not emit a lifecycle event for redundant transitions", () => {
    const startedAt = new Date("2026-04-11T08:00:00.000Z");
    const result = buildTaskStatusTransition(
      { status: "IN_PROGRESS", startedAt, completedAt: null },
      "IN_PROGRESS",
      now,
    );

    expect(result.eventType).toBeNull();
    expect(result.data).toEqual({ status: "IN_PROGRESS" });
  });
});
