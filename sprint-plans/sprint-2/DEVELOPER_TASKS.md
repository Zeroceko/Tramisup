# Sprint 2 - Launch Operating System

**Sprint:** Launch Operating System  
**Goal:** Launch readiness'i gerçek karar sistemine dönüştürmek  
**Duration:** 2 weeks  
**Status:** 🔄 Planning → Ready for Development

---

## 📁 ÖNCE BU DOSYALARI OKU

1. `SPRINT_PLAN.md` - Sprint 2 scope
2. `app/pre-launch/page.tsx` - Mevcut pre-launch page (redesign edilecek)
3. `prisma/schema.prisma` - Task, GrowthChecklist modelleri
4. `components/PreLaunchChecklist.tsx` - Mevcut checklist component

**Figma URL:** [Varsa ekle]

---

## 🔥 PHASE 1: CRITICAL TASKS (Priority Order)

### Task 1: Pre-Launch Page Redesign

**Dosya:** `app/pre-launch/page.tsx`

**İşlem:**
Mevcut checklist'i kategori bazlı scorecard sistemine dönüştür.

**Kategoriler:**
- Product Readiness (ürün hazır mı)
- Marketing Readiness (pazarlama materyalleri)
- Technical Readiness (teknik altyapı)
- Legal Readiness (yasal gereklilikler)

**Her Kategori İçin:**
```typescript
interface CategoryScore {
  category: string;
  completed: number;
  total: number;
  percentage: number;
  status: "READY" | "IN_PROGRESS" | "BLOCKED";
  items: ChecklistItem[];
}
```

**Yeni Layout:**
```tsx
<div className="space-y-6">
  {/* Overall Score Card */}
  <div className="bg-white rounded-[20px] p-6 border border-[#e8e8e8]">
    <h2>Launch Readiness</h2>
    <div className="text-5xl font-bold text-[#95dbda]">{overallScore}%</div>
    <p>Ready to launch: {readyToLaunch ? "YES" : "NOT YET"}</p>
  </div>

  {/* Category Scorecards */}
  {categories.map(cat => (
    <CategoryScorecard key={cat.category} data={cat} />
  ))}
</div>
```

**Referans:**
- Mevcut: `app/pre-launch/page.tsx`
- Component: `components/PreLaunchChecklist.tsx`

---

### Task 2: Blocker Extraction & Visibility

**Yeni Component Oluştur:** `components/BlockerSummary.tsx`

**İçerik:**
```typescript
interface Blocker {
  id: string;
  title: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM";
  dueDate?: Date;
  linkedTaskId?: string;
}

export function BlockerSummary({ blockers }: { blockers: Blocker[] }) {
  // Critical blockers yukarıda
  // Her blocker için:
  // - Title
  // - Category badge
  // - Severity indicator
  // - "Create Task" button
  // - Due date (if any)
}
```

**Design:**
- Critical: Kırmızı border, #ff4d4f bg
- High: Turuncu border, #ffd7ef bg
- Medium: Sarı border, #fee74e bg

**Sonra Bu Dosyaya Ekle:** `app/pre-launch/page.tsx`

**Ekleme:**
```tsx
import { BlockerSummary } from "@/components/BlockerSummary";

// Checklist'ten blocker'ları çıkar
const blockers = checklistItems
  .filter(item => !item.completed && item.priority === "HIGH")
  .map(item => ({
    id: item.id,
    title: item.title,
    category: item.category,
    severity: item.priority,
  }));

// Render
<BlockerSummary blockers={blockers} />
```

---

### Task 3: Task Linkage (Checklist Item → Create Task)

**Dosya:** `app/pre-launch/page.tsx`

**Yeni Action Ekle:**
```typescript
async function createTaskFromChecklistItem(itemId: string) {
  "use server";
  
  const item = await prisma.growthChecklist.findUnique({
    where: { id: itemId },
  });
  
  if (!item) return { error: "Item not found" };
  
  const task = await prisma.task.createTask({
    productId: item.productId,
    title: item.title,
    description: `From launch checklist: ${item.title}`,
    category: "PRE_LAUNCH",
    priority: item.priority,
    status: "TODO",
    linkedChecklistItemId: item.id,
  });
  
  revalidatePath("/pre-launch");
  revalidatePath("/tasks");
  
  return { success: true, taskId: task.id };
}
```

**UI Değişikliği:**
Her checklist item'ın yanına "Create Task" button ekle:
```tsx
{!item.completed && !item.linkedTaskId && (
  <form action={() => createTaskFromChecklistItem(item.id)}>
    <button
      type="submit"
      className="text-[13px] text-[#95dbda] hover:text-[#75bcbb] font-medium"
    >
      + Create Task
    </button>
  </form>
)}

{item.linkedTaskId && (
  <Link
    href={`/tasks#${item.linkedTaskId}`}
    className="text-[13px] text-[#666d80] font-medium"
  >
    → View Task
  </Link>
)}
```

---

### Task 4: Task Priority & Overdue Visibility

**Dosya:** `app/tasks/page.tsx` (veya task board component)

**Değişiklik:**
```tsx
// Priority color coding
const priorityStyle = {
  CRITICAL: "border-l-4 border-[#ff4d4f] bg-[#fff1f0]",
  HIGH: "border-l-4 border-[#ff7a45] bg-[#fff7e6]",
  MEDIUM: "border-l-4 border-[#ffa940] bg-[#fffbe6]",
  LOW: "border-l-4 border-[#d9d9d9] bg-white",
};

// Overdue indicator
const isOverdue = task.dueDate && new Date(task.dueDate) < new Date();

<div className={`rounded-[15px] p-4 ${priorityStyle[task.priority]}`}>
  <div className="flex items-start justify-between gap-3">
    <h3>{task.title}</h3>
    {isOverdue && (
      <span className="text-[11px] font-semibold text-[#ff4d4f] bg-[#fff1f0] px-2 py-1 rounded-full">
        OVERDUE
      </span>
    )}
  </div>
  {task.dueDate && (
    <p className={`text-[12px] mt-2 ${isOverdue ? "text-[#ff4d4f]" : "text-[#666d80]"}`}>
      Due: {new Date(task.dueDate).toLocaleDateString("tr-TR")}
    </p>
  )}
</div>
```

**Sorting:**
Tasks'ı şu sıraya göre göster:
1. Overdue + Critical
2. Overdue + High
3. Critical (not overdue)
4. High (not overdue)
5. Medium
6. Low

---

### Task 5: Launch Review Summary State

**Yeni Component Oluştur:** `components/LaunchReviewSummary.tsx`

**İçerik:**
```typescript
interface LaunchReview {
  overallScore: number;
  readyToLaunch: boolean;
  categories: {
    name: string;
    score: number;
    status: "READY" | "IN_PROGRESS" | "BLOCKED";
  }[];
  blockers: Blocker[];
  recommendations: string[];
}

export function LaunchReviewSummary({ review }: { review: LaunchReview }) {
  return (
    <div className="rounded-[20px] border border-[#e8e8e8] bg-white p-6">
      {/* Overall Status */}
      <div className="mb-6">
        <h2 className="text-[20px] font-bold text-[#0d0d12]">Launch Review</h2>
        <div className="mt-4 flex items-center gap-4">
          <div className="text-5xl font-bold text-[#95dbda]">{review.overallScore}%</div>
          <div>
            <p className="text-[14px] font-semibold text-[#0d0d12]">
              {review.readyToLaunch ? "Ready to Launch! 🚀" : "Not Ready Yet"}
            </p>
            <p className="text-[12px] text-[#666d80]">
              {review.blockers.length} blockers remaining
            </p>
          </div>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3 mb-6">
        {review.categories.map(cat => (
          <div key={cat.name} className="flex items-center justify-between">
            <span className="text-[13px] text-[#0d0d12]">{cat.name}</span>
            <div className="flex items-center gap-2">
              <div className="w-24 h-2 bg-[#f6f6f6] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#95dbda]"
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <span className="text-[12px] font-medium text-[#666d80]">{cat.score}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      {review.recommendations.length > 0 && (
        <div className="border-t border-[#e8e8e8] pt-4">
          <p className="text-[13px] font-semibold text-[#0d0d12] mb-2">Next Steps:</p>
          <ul className="space-y-1">
            {review.recommendations.map((rec, i) => (
              <li key={i} className="text-[12px] text-[#666d80] flex items-start gap-2">
                <span>•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
```

**Sonra Bu Dosyaya Ekle:** `app/pre-launch/page.tsx`

**Ekleme:**
```tsx
import { LaunchReviewSummary } from "@/components/LaunchReviewSummary";

// Calculate review
const review = calculateLaunchReview(checklistItems, tasks);

// Render at top
<LaunchReviewSummary review={review} />
```

---

## ✅ VERIFICATION (Phase 1 Complete)

**Test Senaryosu:**
1. `/pre-launch` sayfasına git
2. Overall launch score görünüyor mu? (percentage)
3. Kategori bazlı scorecards var mı? (4 kategori)
4. Blocker summary görünüyor mu? (incomplete + high priority items)
5. Bir checklist item'dan "Create Task" tıkla
6. Task oluştu mu? → `/tasks` sayfasında görünüyor mu?
7. Task overdue ise kırmızı border/badge var mı?
8. Launch Review Summary görünüyor mu? (top of page)

**Checklist:**
- [ ] Launch readiness score calculated
- [ ] Category scorecards render
- [ ] Blocker summary works
- [ ] "Create Task" action works
- [ ] Task linkage displays
- [ ] Overdue tasks highlighted
- [ ] Launch review summary shows
- [ ] No console errors
- [ ] Build passes

---

## 📐 PHASE 2: HIGH PRIORITY TASKS (OPTIONAL ENHANCEMENTS)

### Task 6: Launch Readiness History

**Dosya:** `app/pre-launch/page.tsx`

**İşlem:**
Launch score'u track et over time. Chart ekle.

**Implementation:**
```typescript
// New table: LaunchScoreHistory
model LaunchScoreHistory {
  id        String   @id @default(cuid())
  productId String
  score     Int      // 0-100
  timestamp DateTime @default(now())
  product   Product  @relation(...)
}

// Daily cron job to record score
// Display as line chart
```

---

### Task 7: Launch Checklist Templates

**Dosya:** `lib/launchTemplates.ts`

**İşlem:**
Industry-specific checklist templates (SaaS, Mobile App, E-commerce, etc.)

**Templates:**
```typescript
export const launchTemplates = {
  saas: [
    { category: "Product", title: "Onboarding flow complete", priority: "HIGH" },
    { category: "Product", title: "Payment integration tested", priority: "CRITICAL" },
    // ...
  ],
  mobileApp: [
    { category: "Technical", title: "App Store screenshots ready", priority: "HIGH" },
    // ...
  ],
  // ...
};
```

---

## 🎯 EXECUTION ORDER

```
1. ✅ Read documentation (SPRINT_PLAN.md, existing pre-launch page)
2. 🔥 Task 1: Pre-launch page redesign (category scorecards)
3. 🔥 Task 2: Blocker summary component
4. 🔥 Task 3: Task linkage (create task action)
5. 🔥 Task 4: Task priority/overdue visibility
6. 🔥 Task 5: Launch review summary
7. ✅ TEST: Verification scenario
8. 📐 Task 6-7: Optional enhancements (if time)
9. ✅ FINAL TEST: Full user flow
```

---

## 📞 HELP

**Key Reference Files:**
- Current pre-launch: `app/pre-launch/page.tsx`
- Checklist component: `components/PreLaunchChecklist.tsx`
- Schema: `prisma/schema.prisma` (Task, GrowthChecklist)
- Tasks page: `app/tasks/page.tsx`

**Sprint Plan:** `SPRINT_PLAN.md` (Sprint 2 section)

**Design Tokens:**
- Primary: `#95dbda` (turquoise)
- CTA: `#ffd7ef` (pink)
- Critical: `#ff4d4f` (red)
- Warning: `#ffa940` (orange)
- Success: `#75fc96` (green)

---

## ✅ DONE WHEN

- [ ] Pre-launch page redesigned (category scorecards)
- [ ] Blocker summary component working
- [ ] Task linkage functional (checklist → task)
- [ ] Task priority/overdue visible
- [ ] Launch review summary displays
- [ ] Verification tests pass
- [ ] Build passes (`npm run build`)
- [ ] Console clean (no errors)
- [ ] User can understand why launch score is low
- [ ] User can create task from checklist item

**Current Status:** 0/10 ✅  
**Target:** 10/10 ✅ (Full sprint complete)

---

**START HERE:**
Read `SPRINT_PLAN.md` Sprint 2 section and `app/pre-launch/page.tsx`, then execute tasks in order. Test after Phase 1. Then do Phase 2 if time allows.

🚀 Let's ship this!
