import type { TaskStatus } from "@prisma/client";
import type { TaskLifecycleEvent } from "@/lib/task-events";

type TaskStatusSnapshot = {
  status: TaskStatus;
  startedAt: Date | null;
  completedAt: Date | null;
};

type TaskStatusTransition = {
  data: {
    status: TaskStatus;
    startedAt?: Date | null;
    completedAt?: Date | null;
  };
  eventType: Exclude<TaskLifecycleEvent, "CREATED" | "DEDUPED" | "DETAIL_OPENED" | "DISMISSED"> | null;
};

export function buildTaskStatusTransition(
  task: TaskStatusSnapshot,
  nextStatus: TaskStatus,
  now = new Date(),
): TaskStatusTransition {
  const data: TaskStatusTransition["data"] = { status: nextStatus };

  if (task.status === nextStatus) {
    return { data, eventType: null };
  }

  if (task.status === "DONE" && nextStatus !== "DONE") {
    data.completedAt = null;
    if (nextStatus === "IN_PROGRESS" && !task.startedAt) {
      data.startedAt = now;
    }
    return { data, eventType: "REOPENED" };
  }

  if (nextStatus === "DONE") {
    if (!task.startedAt) {
      data.startedAt = now;
    }
    data.completedAt = now;
    return { data, eventType: "COMPLETED" };
  }

  if (nextStatus === "IN_PROGRESS") {
    if (!task.startedAt) {
      data.startedAt = now;
    }
    data.completedAt = null;
    return { data, eventType: "STARTED" };
  }

  return { data, eventType: null };
}
