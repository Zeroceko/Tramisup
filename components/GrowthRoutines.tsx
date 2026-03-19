"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Routine {
  id: string;
  title: string;
  description: string | null;
  frequency: "WEEKLY" | "MONTHLY";
  lastCompletedAt: Date | null;
}

export default function GrowthRoutines({
  routines,
  projectId,
}: {
  routines: Routine[];
  projectId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRoutine, setNewRoutine] = useState({
    title: "",
    description: "",
    frequency: "WEEKLY" as "WEEKLY" | "MONTHLY",
  });

  const completeRoutine = async (routineId: string) => {
    setLoading(routineId);
    try {
      await fetch(`/api/routines/${routineId}/complete`, {
        method: "POST",
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to complete routine:", error);
    } finally {
      setLoading(null);
    }
  };

  const addRoutine = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("new");
    try {
      await fetch("/api/routines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newRoutine, projectId }),
      });
      setNewRoutine({ title: "", description: "", frequency: "WEEKLY" });
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add routine:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Growth Routines</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Routine"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addRoutine} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <input
              type="text"
              placeholder="Routine title"
              value={newRoutine.title}
              onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <textarea
              placeholder="Description (optional)"
              value={newRoutine.description}
              onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <select
              value={newRoutine.frequency}
              onChange={(e) =>
                setNewRoutine({ ...newRoutine, frequency: e.target.value as "WEEKLY" | "MONTHLY" })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="WEEKLY">Weekly</option>
              <option value="MONTHLY">Monthly</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading === "new" ? "Adding..." : "Add Routine"}
          </button>
        </form>
      )}

      {routines.length === 0 && !showAddForm ? (
        <p className="text-center text-gray-500 py-8">No routines yet. Add one to get started!</p>
      ) : (
        <div className="space-y-3">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{routine.title}</h3>
                  {routine.description && (
                    <p className="text-sm text-gray-600 mt-1">{routine.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded">
                      {routine.frequency}
                    </span>
                    {routine.lastCompletedAt && (
                      <span className="text-xs text-gray-500">
                        Last: {new Date(routine.lastCompletedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => completeRoutine(routine.id)}
                  disabled={loading === routine.id}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  ✓ Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
