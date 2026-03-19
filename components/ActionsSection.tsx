"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Task {
  id: string;
  title: string;
  dueDate: Date | null;
  status: "TODO" | "IN_PROGRESS" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH";
}

const priorityColors = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-green-100 text-green-700 border-green-200",
};

export default function ActionsSection({
  tasks,
  productId,
}: {
  tasks: Task[];
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAction, setNewAction] = useState({
    title: "",
    dueDate: "",
    priority: "MEDIUM" as "LOW" | "MEDIUM" | "HIGH",
  });

  const toggleTask = async (taskId: string, currentStatus: string) => {
    setLoading(taskId);
    try {
      await fetch(`/api/actions/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: currentStatus === "DONE" ? "TODO" : "DONE" }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update task:", error);
    } finally {
      setLoading(null);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("new");
    try {
      await fetch("/api/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newAction,
          productId,
          dueDate: newAction.dueDate || null,
        }),
      });
      setNewAction({ title: "", dueDate: "", priority: "MEDIUM" });
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setLoading(null);
    }
  };

  const pendingTasks = tasks.filter(a => a.status !== "DONE");
  const completedTasks = tasks.filter(a => a.status === "DONE");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Action Items</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addTask} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <input
              type="text"
              placeholder="Action title"
              value={newAction.title}
              onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={newAction.dueDate}
              onChange={(e) => setNewAction({ ...newAction, dueDate: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <select
              value={newAction.priority}
              onChange={(e) =>
                setNewAction({ ...newAction, priority: e.target.value as "LOW" | "MEDIUM" | "HIGH" })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading === "new" ? "Adding..." : "Add Task"}
          </button>
        </form>
      )}

      <div className="space-y-4">
        {pendingTasks.length === 0 && !showAddForm && (
          <p className="text-center text-gray-500 py-8">No pending tasks</p>
        )}

        {pendingTasks.map((task) => (
          <div
            key={task.id}
            className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                checked={task.status === "DONE"}
                onChange={() => toggleTask(task.id, task.status)}
                disabled={loading === task.id}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{task.title}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-0.5 text-xs rounded border ${priorityColors[task.priority]}`}>
                    {task.priority}
                  </span>
                  {task.dueDate && (
                    <span className="text-xs text-gray-600">
                      Due: {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {completedTasks.length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <p className="text-sm font-medium text-gray-500 mb-3">Completed ({completedTasks.length})</p>
            <div className="space-y-2">
              {completedTasks.map((task) => (
                <div key={task.id} className="flex items-center space-x-3 p-2">
                  <input
                    type="checkbox"
                    checked={true}
                    onChange={() => toggleTask(task.id, task.status)}
                    disabled={loading === task.id}
                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <p className="text-sm text-gray-400 line-through flex-1">{task.title}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
