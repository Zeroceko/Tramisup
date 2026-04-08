import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import type { FunnelMetricSelection } from "@/lib/metric-setup";
import {
  normalizeLaunchChecklistPriority,
  normalizeStoredLaunchChecklistPriorities,
} from "@/lib/launch-checklist-priority";
import { tryCreateTaskWithGuards } from "@/lib/task-create";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CompletionEffects = {
  checklistCompleted: { id: string; title: string; category: string } | null;
  blockersRemaining: number;
  milestones: ("ALL_HIGH_BLOCKERS_CLEARED" | "ALL_CHECKLIST_COMPLETE")[];
  followUpTaskCreated: { id: string; title: string } | null;
  suggestion: string | null;
};

type LinkedChecklist = {
  id: string;
  title: string;
  category: string;
  completed: boolean;
  priority: string;
};

// ─── Forward: Task → DONE ─────────────────────────────────────────────────────

export async function computeCompletionEffects(
  productId: string,
  checklist: LinkedChecklist | null
): Promise<CompletionEffects> {
  await normalizeStoredLaunchChecklistPriorities(productId);

  const effects: CompletionEffects = {
    checklistCompleted: null,
    blockersRemaining: 0,
    milestones: [],
    followUpTaskCreated: null,
    suggestion: null,
  };

  // 1. Auto-complete linked checklist item with timestamp
  if (checklist && !checklist.completed) {
    await prisma.launchChecklist.update({
      where: { id: checklist.id },
      data: { completed: true, completedAt: new Date() },
    });
    effects.checklistCompleted = {
      id: checklist.id,
      title: checklist.title,
      category: checklist.category,
    };
  }

  // 2. Count remaining blockers (HIGH priority, incomplete)
  const [highBlockers, totalIncomplete] = await Promise.all([
    prisma.launchChecklist.count({
      where: { productId, completed: false, priority: "HIGH" },
    }),
    prisma.launchChecklist.count({
      where: { productId, completed: false },
    }),
  ]);
  effects.blockersRemaining = highBlockers;

  // 3. Detect milestones
  //    Only trigger blocker milestone if THIS completion cleared a HIGH item
  if (
    effects.checklistCompleted &&
    checklist &&
    normalizeLaunchChecklistPriority(checklist) === "HIGH" &&
    highBlockers === 0
  ) {
    effects.milestones.push("ALL_HIGH_BLOCKERS_CLEARED");
  }

  if (effects.checklistCompleted && totalIncomplete === 0) {
    effects.milestones.push("ALL_CHECKLIST_COMPLETE");
  }

  // 4. Generate follow-up tasks for major milestones
  // Both follow-ups go through tryCreateTaskWithGuards: dedupe is automatic
  // (no more manual { contains } findFirst), and structured fields land in
  // the new columns.
  if (effects.milestones.includes("ALL_HIGH_BLOCKERS_CLEARED")) {
    const result = await tryCreateTaskWithGuards({
      productId,
      title: "Launch tarihini belirle ve duyur",
      whyItMatters:
        "Kritik blokajlar temizlendi; gerçek bir tarih olmadan momentum kaybolur.",
      doneCriteria:
        "Belirlenen launch tarihi takvime ve duyuru kanallarına yazılmış olmalı.",
      nextAction:
        "Önümüzdeki 14 gün içinden bir tarih seç ve launch listesine ekle.",
      category: "MARKETING",
      priority: "MEDIUM",
      source: "COMPLETION_EFFECT",
      locale: "tr",
    });
    if (result && !result.deduped) {
      effects.followUpTaskCreated = { id: result.task.id, title: result.task.title };
    }
  }

  if (
    effects.milestones.includes("ALL_CHECKLIST_COMPLETE") &&
    !effects.followUpTaskCreated
  ) {
    const [product, metricSetup] = await Promise.all([
      prisma.product.findUnique({
        where: { id: productId },
        select: { status: true },
      }),
      prisma.metricSetup.findUnique({
        where: { productId },
        select: { selections: true },
      }),
    ]);
    const selections =
      (metricSetup?.selections as FunnelMetricSelection[] | null) ?? [];
    const hasSetup = selections.some((s) => s.selectedMetricKeys.length > 0);

    if (!hasSetup && product?.status === ProductStatus.PRE_LAUNCH) {
      const result = await tryCreateTaskWithGuards({
        productId,
        title: "AARRR metrik kurulumunu yap",
        whyItMatters:
          "Launch checklist tamamlandı; growth'u körlemesine takip etmek için zaman yok.",
        doneCriteria:
          "Her AARRR aşaması için en az bir tracked metrik seçilmiş olmalı.",
        nextAction:
          "Growth ekranındaki metric setup wizard'ını aç ve ilk seçimi yap.",
        category: "MEASUREMENT",
        priority: "HIGH",
        source: "COMPLETION_EFFECT",
        locale: "tr",
      });
      if (result && !result.deduped) {
        effects.followUpTaskCreated = {
          id: result.task.id,
          title: result.task.title,
        };
      }
    }
  }

  // 5. Build suggestion text
  if (effects.milestones.includes("ALL_CHECKLIST_COMPLETE")) {
    effects.suggestion =
      "Tüm launch maddelerini tamamladın. Yayına çıkmayı değerlendir.";
  } else if (effects.milestones.includes("ALL_HIGH_BLOCKERS_CLEARED")) {
    effects.suggestion =
      "Kritik blokajlar temizlendi. Launch planlamaya hazırsın.";
  } else if (effects.checklistCompleted && highBlockers > 0) {
    effects.suggestion = `${highBlockers} kritik blokaj kaldı.`;
  }

  // 6. Revalidate affected pages
  revalidateAffectedPages();

  return effects;
}

// ─── Reverse: DONE → TODO/IN_PROGRESS ─────────────────────────────────────────

export async function reverseCompletionEffects(
  checklist: LinkedChecklist | null
): Promise<boolean> {
  if (!checklist?.completed) return false;

  await prisma.launchChecklist.update({
    where: { id: checklist.id },
    data: { completed: false, completedAt: null },
  });

  revalidateAffectedPages();
  return true;
}

// ─── Shared ───────────────────────────────────────────────────────────────────

function revalidateAffectedPages() {
  for (const loc of ["tr", "en"]) {
    revalidatePath(`/${loc}/pre-launch`);
    revalidatePath(`/${loc}/dashboard`);
    revalidatePath(`/${loc}/tasks`);
  }
}
