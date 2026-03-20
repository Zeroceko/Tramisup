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

const inputCls = "w-full px-3 py-2 rounded-[10px] border border-[#e8e8e8] text-[13px] text-[#0d0d12] placeholder-[#9ca3af] outline-none focus:border-[#95dbda] transition";

const freqLabel: Record<string, string> = { WEEKLY: "Haftalık", MONTHLY: "Aylık" };

export default function GrowthRoutines({
  routines,
  productId,
}: {
  routines: Routine[];
  productId: string;
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
      await fetch(`/api/routines/${routineId}/complete`, { method: "POST" });
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
        body: JSON.stringify({ ...newRoutine, productId }),
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
    <div className="bg-white rounded-[15px] border border-[#e8e8e8] p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#666d80] mb-0.5">Alışkanlıklar</p>
          <h2 className="text-[16px] font-semibold text-[#0d0d12]">Growth Rutinler</h2>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-1 px-3 h-8 rounded-full border border-[#e8e8e8] text-[12px] font-semibold text-[#0d0d12] hover:bg-[#f6f6f6] transition"
        >
          {showAddForm ? "İptal" : "+ Ekle"}
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={addRoutine} className="mb-4 p-4 bg-[#f6f6f6] rounded-[12px] space-y-3">
          <input
            type="text"
            placeholder="Rutin başlığı"
            value={newRoutine.title}
            onChange={(e) => setNewRoutine({ ...newRoutine, title: e.target.value })}
            required
            className={inputCls}
          />
          <textarea
            placeholder="Açıklama (opsiyonel)"
            value={newRoutine.description}
            onChange={(e) => setNewRoutine({ ...newRoutine, description: e.target.value })}
            rows={2}
            className={inputCls + " resize-none"}
          />
          <select
            value={newRoutine.frequency}
            onChange={(e) => setNewRoutine({ ...newRoutine, frequency: e.target.value as "WEEKLY" | "MONTHLY" })}
            className={inputCls}
          >
            <option value="WEEKLY">Haftalık</option>
            <option value="MONTHLY">Aylık</option>
          </select>
          <button
            type="submit"
            disabled={loading === "new"}
            className="w-full h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition disabled:opacity-50"
          >
            {loading === "new" ? "Ekleniyor…" : "Rutin Ekle"}
          </button>
        </form>
      )}

      {routines.length === 0 && !showAddForm ? (
        <p className="text-center text-[13px] text-[#9ca3af] py-8">Henüz rutin yok. Bir tane ekle!</p>
      ) : (
        <div className="space-y-2">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="flex items-start gap-3 p-4 border border-[#e8e8e8] rounded-[12px] hover:bg-[#fafafa] transition"
            >
              <div className="flex-1 min-w-0">
                <h3 className="text-[14px] font-semibold text-[#0d0d12]">{routine.title}</h3>
                {routine.description && (
                  <p className="text-[12px] text-[#666d80] mt-0.5">{routine.description}</p>
                )}
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#ffd7ef] text-[11px] font-semibold text-[#0d0d12]">
                    {freqLabel[routine.frequency]}
                  </span>
                  {routine.lastCompletedAt && (
                    <span className="text-[11px] text-[#9ca3af]">
                      Son: {new Date(routine.lastCompletedAt).toLocaleDateString("tr-TR")}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => completeRoutine(routine.id)}
                disabled={loading === routine.id}
                className="inline-flex items-center gap-1 px-3 h-8 rounded-full bg-[#75fc96] text-[12px] font-semibold text-[#0d0d12] hover:opacity-80 transition disabled:opacity-50 shrink-0"
              >
                ✓ Tamamla
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
