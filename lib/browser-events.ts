"use client";

export const APP_EVENT_TASKS_UPDATED = "tiramisup:tasks-updated";
export const APP_EVENT_CHECKLIST_UPDATED = "tiramisup:checklist-updated";

function dispatch(name: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(name));
}

export function notifyTasksUpdated() {
  dispatch(APP_EVENT_TASKS_UPDATED);
}

export function notifyChecklistUpdated() {
  dispatch(APP_EVENT_CHECKLIST_UPDATED);
}
