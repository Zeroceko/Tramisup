"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  completed: boolean;
}

export default function GoalsSection({
  goals,
  productId,
}: {
  goals: Goal[];
  productId: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    targetValue: "",
    unit: "",
    startDate: format(new Date(), "yyyy-MM-dd"),
    endDate: "",
  });

  const updateProgress = async (goalId: string, currentValue: number) => {
    setLoading(goalId);
    try {
      await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentValue }),
      });
      router.refresh();
    } catch (error) {
      console.error("Failed to update goal:", error);
    } finally {
      setLoading(null);
    }
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading("new");
    try {
      await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newGoal,
          productId,
          targetValue: parseFloat(newGoal.targetValue),
        }),
      });
      setNewGoal({
        title: "",
        targetValue: "",
        unit: "",
        startDate: format(new Date(), "yyyy-MM-dd"),
        endDate: "",
      });
      setShowAddForm(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to add goal:", error);
    } finally {
      setLoading(null);
    }
  };

  const activeGoals = goals.filter((g) => !g.completed);
  const completedGoals = goals.filter((g) => g.completed);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Goals</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-3 py-1 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {showAddForm ? "Cancel" : "+ Add Goal"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addGoal} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3">
          <div>
            <input
              type="text"
              placeholder="Goal title (e.g., Reach 1000 users)"
              value={newGoal.title}
              onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              step="0.01"
              placeholder="Target value"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <input
              type="text"
              placeholder="Unit (e.g., users, $)"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              required
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Start Date</label>
              <input
                type="date"
                value={newGoal.startDate}
                onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">End Date</label>
              <input
                type="date"
                value={newGoal.endDate}
                onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
          >
            {loading === "new" ? "Adding..." : "Add Goal"}
          </button>
        </form>
      )}

      {activeGoals.length === 0 && !showAddForm ? (
        <p className="text-center text-gray-500 py-8">No active goals. Set one to track your progress!</p>
      ) : (
        <div className="space-y-4">
          {activeGoals.map((goal) => {
            const progress = (goal.currentValue / goal.targetValue) * 100;
            return (
              <div
                key={goal.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="mb-3">
                  <h3 className="font-medium text-gray-900">{goal.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                    <span>
                      {goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}
                    </span>
                    <span>•</span>
                    <span>Due {format(new Date(goal.endDate), "MMM d, yyyy")}</span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">{Math.round(progress)}% complete</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Update"
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value !== goal.currentValue) {
                        updateProgress(goal.id, value);
                      }
                      e.target.value = "";
                    }}
                    disabled={loading === goal.id}
                    className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm font-medium text-gray-500 mb-3">Completed ({completedGoals.length})</p>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-medium text-gray-900">✓ {goal.title}</p>
                <p className="text-xs text-gray-600 mt-1">
                  {goal.targetValue.toLocaleString()} {goal.unit} achieved
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
