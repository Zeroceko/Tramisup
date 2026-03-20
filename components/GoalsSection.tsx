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

const inputCls = "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

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
        body: JSON.stringify({ ...newGoal, productId, targetValue: parseFloat(newGoal.targetValue) }),
      });
      setNewGoal({ title: "", targetValue: "", unit: "", startDate: format(new Date(), "yyyy-MM-dd"), endDate: "" });
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
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-0.5">Büyüme</p>
          <h2 className="text-[16px] font-semibold text-[#0d0d12]">Hedefler</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1 px-3 h-8 rounded-full border border-[#e8e8e8] text-[12px] font-semibold text-[#0d0d12] hover:bg-[#f6f6f6] transition"
        >
          {showAddForm ? "İptal" : "+ Hedef Ekle"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addGoal} className="mb-4 p-4 bg-[#f6f6f6] rounded-[12px] space-y-3">
          <input
            type="text"
            placeholder="Hedef başlığı (örn. 1000 kullanıcıya ulaş)"
            value={newGoal.title}
            onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
            required
            className={inputCls}
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              step="0.01"
              placeholder="Hedef değer"
              value={newGoal.targetValue}
              onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
              required
              className={inputCls}
            />
            <input
              type="text"
              placeholder="Birim (kullanıcı, $)"
              value={newGoal.unit}
              onChange={(e) => setNewGoal({ ...newGoal, unit: e.target.value })}
              required
              className={inputCls}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[11px] font-semibold text-[#666d80] mb-1">Başlangıç</p>
              <input type="date" value={newGoal.startDate} onChange={(e) => setNewGoal({ ...newGoal, startDate: e.target.value })} required className={inputCls} />
            </div>
            <div>
              <p className="text-[11px] font-semibold text-[#666d80] mb-1">Bitiş</p>
              <input type="date" value={newGoal.endDate} onChange={(e) => setNewGoal({ ...newGoal, endDate: e.target.value })} required className={inputCls} />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50"
          >
            {loading === "new" ? "Ekleniyor…" : "Hedef Ekle"}
          </button>
        </form>
      )}

      {activeGoals.length === 0 && !showAddForm ? (
        <p className="text-center text-[13px] text-[#9ca3af] py-8">Aktif hedef yok. İlk hedefinizi oluşturun!</p>
      ) : (
        <div className="space-y-3">
          {activeGoals.map((goal) => {
            const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
            return (
              <div key={goal.id} className="p-4 border border-[#e8e8e8] rounded-[12px]">
                <div className="mb-3">
                  <h3 className="text-[14px] font-semibold text-[#0d0d12]">{goal.title}</h3>
                  <div className="flex items-center gap-2 mt-1 text-[12px] text-[#666d80]">
                    <span>{goal.currentValue.toLocaleString()} / {goal.targetValue.toLocaleString()} {goal.unit}</span>
                    <span>·</span>
                    <span>Bitiş {format(new Date(goal.endDate), "d MMM yyyy")}</span>
                  </div>
                </div>
                <div className="w-full bg-[#f0f0f0] rounded-full h-1.5 mb-3">
                  <div
                    className="bg-[#95dbda] h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-semibold text-[#666d80]">{Math.round(progress)}% tamamlandı</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Güncelle"
                    onBlur={(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value) && value !== goal.currentValue) updateProgress(goal.id, value);
                      e.target.value = "";
                    }}
                    disabled={loading === goal.id}
                    className="w-24 px-2 py-1 text-[12px] rounded-[8px] border border-[#e8e8e8] outline-none focus:border-[#95dbda] transition"
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {completedGoals.length > 0 && (
        <div className="mt-4 pt-4 border-t border-[#e8e8e8]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9ca3af] mb-2">
            Tamamlandı ({completedGoals.length})
          </p>
          <div className="space-y-2">
            {completedGoals.map((goal) => (
              <div key={goal.id} className="flex items-center gap-2 px-3 py-2 bg-[#f6fffe] border border-[#95dbda]/30 rounded-[10px]">
                <span className="w-4 h-4 rounded-full bg-[#75fc96] flex items-center justify-center shrink-0">
                  <svg width="8" height="7" viewBox="0 0 10 8" fill="none">
                    <path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <p className="text-[13px] font-medium text-[#0d0d12]">{goal.title}</p>
                <span className="ml-auto text-[11px] text-[#666d80]">{goal.targetValue.toLocaleString()} {goal.unit}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
