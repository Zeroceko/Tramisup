# Tiramisup - Developer Handoff Guide

**Last Updated:** 21 March 2026  
**Status:** Production-ready MVP, 3 Sprints completed  
**Next Developer:** [Your name here]

---

## 📖 Table of Contents

1. [Quick Orientation](#quick-orientation)
2. [Architecture Deep Dive](#architecture-deep-dive)
3. [Code Patterns & Conventions](#code-patterns--conventions)
4. [Development Workflow](#development-workflow)
5. [Common Tasks](#common-tasks)
6. [Debugging & Troubleshooting](#debugging--troubleshooting)
7. [Deployment](#deployment)

---

## 🧭 Quick Orientation (30 minutes)

### What You Need to Know

**Tiramisup is:**
- A workspace for startup founders to manage launch→growth phase
- Multi-product support (one founder, multiple startups)
- Focus: clarity of state, decision-making, ritual execution

**Not:**
- A full project management tool (Jira/Monday)
- A metrics aggregator (Segment/Mixpanel)
- A team collaboration platform (yet)

### The User Flow (How Tiramisup Works)

```
User Signup
    ↓
Create Product (7-step wizard)
    ↓
Product Dashboard
    ├─ /dashboard (main summary)
    ├─ /pre-launch (launch readiness) ← MOST COMPLEX
    ├─ /tasks (kanban/list view)
    ├─ /metrics (analytics)
    └─ /growth (future phase)
    ↓
Launch Operations
    ├─ Checklist → Task creation
    ├─ Task status tracking (TODO → IN_PROGRESS → DONE)
    ├─ Priority & overdue visibility
    └─ Weekly review (future)
```

### Key Entry Points

**For new developers, start here:**

1. **API Routes:** `app/api/actions/`, `app/api/checklist/`
2. **Components:** `components/LaunchReviewSummary.tsx`, `components/TasksList.tsx`
3. **Pages:** `app/pre-launch/page.tsx`, `app/tasks/page.tsx`
4. **Database:** `prisma/schema.prisma`
5. **Tests:** `tests/e2e/sprint-1-manual.spec.ts`

---

## 🏛️ Architecture Deep Dive

### 1. Technology Decisions & Trade-offs

**Why Next.js 15 + React 19?**
- Server components for real-time data (checklist updates, task lists)
- Built-in API routes (no separate backend needed at this stage)
- Deployment simplicity (Vercel)
- TypeScript for safety

**Why Prisma?**
- Type-safe database access
- Migrations as code
- Good DX for prototyping
- Easy to scale to multiple databases later

**Why PostgreSQL?**
- Relational queries (product ↔ checklist ↔ task linkage)
- ACID guarantees for financial data (future revenue tracking)
- Good integration with Prisma

**Why Tailwind CSS?**
- Rapid UI iteration (critical at MVP stage)
- Responsive by default (mobile users important)
- Design system via config (easy brand consistency)

### 2. Database Architecture

**Core Entities:**

```
User
├── Products (one user, multiple products)
│   ├── LaunchChecklist items (4 categories)
│   │   ├── PRODUCT (product-market fit items)
│   │   ├── MARKETING (go-to-market items)
│   │   ├── LEGAL (compliance items)
│   │   └── TECH (technical readiness items)
│   ├── Tasks (execution items)
│   │   ├── Created manually
│   │   ├── Created from checklist items
│   │   └── Tracked by status & priority
│   ├── Goals (OKR-style tracking, future)
│   └── Metrics (usage data from integrations)
```

**Key Design Decisions:**

1. **Checklist → Task Linkage**
   ```prisma
   model LaunchChecklist {
     linkedTaskId String? @unique  // One checklist can create one task
     linkedTask   Task?   @relation(...)
   }
   ```
   Why? So users can turn a checklist item into a task without duplicating data.

2. **Priority Field on Checklist**
   ```prisma
   priority Priority @default(MEDIUM)  // LOW, MEDIUM, HIGH
   ```
   Why? To surface HIGH priority blockers (blocking launch).

3. **Multi-Product Context**
   ```prisma
   Product {
     userId String  // Founder owns product
     // ...
   }
   ```
   Why? Tiramisup supports founders with multiple startups.

4. **Task Status Enum**
   ```
   TODO → IN_PROGRESS → DONE
   ```
   Why? Simple, clear workflow. Future phases might add more states.

### 3. Server Components vs Client Components

**Server Components (in `app/` routes):**
- `app/pre-launch/page.tsx` - Fetches checklists, tasks, calculates scores
- `app/tasks/page.tsx` - Fetches all tasks for active product
- **Reason:** Real-time data without client-side loading states

**Client Components (in `components/`):**
- `LaunchReviewSummary.tsx` - Display only, no state
- `BlockerSummary.tsx` - Display + button handlers (client)
- `ChecklistSection.tsx` - Checkboxes, toggles (client)
- `TasksList.tsx` - Task status cycling (client)
- **Reason:** Interactivity, form handling, button clicks

**Pattern:**
```typescript
// app/pre-launch/page.tsx (Server)
export default async function PreLaunchPage() {
  const checklists = await prisma.launchChecklist.findMany(...)
  return <ChecklistSection checklists={checklists} onCreateTask={serverAction} />
}

// components/ChecklistSection.tsx (Client)
"use client"
export default function ChecklistSection({ checklists, onCreateTask }) {
  const handleToggle = async (itemId) => {
    await fetch(`/api/checklist/${itemId}`, ...)
    router.refresh()  // Revalidate server component
  }
}
```

### 4. API Route Patterns

All API routes follow this pattern:

```typescript
// app/api/[resource]/[id]/route.ts

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Check auth
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // 2. Parse request
    const { id } = await context.params
    const body = await request.json()

    // 3. Update data
    const item = await prisma.checklist.update({
      where: { id },
      data: body,
    })

    // 4. Return response
    return NextResponse.json(item)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json(
      { error: "Failed to update" },
      { status: 500 }
    )
  }
}
```

**Key points:**
- Always check auth first
- Await params (Next.js 15+ pattern)
- Use try/catch
- Return JSON
- Log errors

### 5. Active Product Context

**Problem:** User has multiple products. How do we know which one they're working on?

**Solution:** Cookie-based context

```typescript
// lib/activeProduct.ts
export async function getActiveProductId() {
  const cookieStore = await cookies()
  return cookieStore.get("activeProductId")?.value
}

// Usage in server component
const activeId = await getActiveProductId()
const product = await prisma.product.findFirst({
  where: {
    userId: session.user.id,
    ...(activeId ? { id: activeId } : {}),
  },
})
```

**Key points:**
- Context is stored in cookie (survives page reload)
- ProductSelector component updates cookie
- All pages default to first product if none selected

---

## 🎨 Code Patterns & Conventions

### 1. Component Structure

**File naming:**
- `PascalCase.tsx` for components
- `kebab-case.ts` for utilities

**Component template:**
```typescript
"use client"  // Only if interactive

import { useState } from "react"
import { useRouter } from "next/navigation"

interface Props {
  items: Item[]
  onAction?: (id: string) => Promise<void>
}

export default function MyComponent({ items, onAction }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState<string | null>(null)

  const handleClick = async (id: string) => {
    setLoading(id)
    try {
      await onAction?.(id)
      router.refresh()  // Revalidate from server
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      {items.map(item => (
        <button
          key={item.id}
          onClick={() => handleClick(item.id)}
          disabled={loading === item.id}
        >
          {item.name}
        </button>
      ))}
    </div>
  )
}
```

### 2. Styling Conventions

**Tailwind classes only.** No CSS modules or styled-components.

**Color palette (from design system):**
- Primary: `#95dbda` (teal)
- Secondary: `#ffd7ef` (pink)
- Dark text: `#0d0d12`
- Light text: `#666d80`
- Borders: `#e8e8e8`
- Success: `#75fc96` (green)
- Warning: `#ff7a45` (orange)
- Danger: `#ff4d4f` (red)

**Common patterns:**
```tsx
// Buttons
<button className="px-4 h-9 rounded-full bg-[#ffd7ef] text-[13px] font-semibold text-[#0d0d12] hover:bg-[#f5c8e4] transition" />

// Cards
<div className="rounded-[15px] border border-[#e8e8e8] bg-white p-5" />

// Labels
<span className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[#666d80]" />
```

### 3. Error Handling

**API routes:**
- Always wrap in try/catch
- Return meaningful error messages
- Log errors to console (for debugging)

**Client-side:**
- Show loading state during async operations
- Disable buttons while loading
- Log errors to console (future: Sentry integration)

```typescript
const handleSubmit = async (data) => {
  setLoading(true)
  try {
    const res = await fetch("/api/actions", {
      method: "POST",
      body: JSON.stringify(data),
    })
    if (!res.ok) {
      console.error("API error:", res.status)
      return
    }
    router.refresh()
  } catch (error) {
    console.error("Error:", error)
  } finally {
    setLoading(false)
  }
}
```

### 4. TypeScript

**Use strict types. Avoid `any`.**

```typescript
// Good
interface Task {
  id: string
  title: string
  status: "TODO" | "IN_PROGRESS" | "DONE"
  priority: "LOW" | "MEDIUM" | "HIGH"
  dueDate: Date | null
}

function TaskCard({ task }: { task: Task }) {
  // ...
}

// Bad
function TaskCard({ task }: { task: any }) {
  // ...
}
```

**Use enums from Prisma:**
```typescript
import { Priority, TaskStatus } from "@prisma/client"

// Prisma generates these types automatically
const task: Task = {
  priority: Priority.HIGH,  // Typed!
  status: TaskStatus.TODO,  // Typed!
}
```

---

## 🔄 Development Workflow

### Setup

```bash
# 1. Clone
git clone <repo>
cd tiramisup

# 2. Install deps
npm install

# 3. Setup environment
cp .env.example .env.local
# Edit .env.local:
# DATABASE_URL=postgresql://user:pass@localhost/tiramisup
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
# NEXTAUTH_URL=http://localhost:3000

# 4. Database
npx prisma migrate dev
npx prisma db seed

# 5. Start
npm run dev
# http://localhost:3000
```

### Local Development Loop

```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Watch tests (optional)
npm run test:watch

# Terminal 3: Prisma Studio (optional, for DB inspection)
npx prisma studio
```

### Making Changes

**For feature work:**
1. Create feature branch: `git checkout -b feat/short-description`
2. Make changes
3. Run tests: `npm run test && npm run test:e2e`
4. Commit: `git commit -m "feat: description"`
5. Push: `git push origin feat/short-description`
6. Create PR, merge to main

**For bug fixes:**
1. Create bug branch: `git checkout -b fix/short-description`
2. Write failing test first (optional)
3. Fix the bug
4. Test: `npm run test && npm run test:e2e`
5. Commit: `git commit -m "fix: description"`

**For docs:**
1. Branch: `git checkout -b docs/short-description`
2. Update docs
3. Commit: `git commit -m "docs: description"`

### Database Migrations

**Adding a field:**
```bash
# 1. Update prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name add_field_name

# 3. This auto-runs the migration and regenerates Prisma client
# 4. Commit the migration file

# Later, when someone pulls:
npx prisma migrate deploy  # Applies pending migrations
```

**Important:** Never `git push` before running migrations locally. Test migrations work:
```bash
npx prisma migrate reset  # Start fresh (dev only!)
npx prisma db seed        # Repopulate with test data
```

---

## 🛠️ Common Tasks

### Task 1: Add a New API Endpoint

**Example: Create a new endpoint for goals**

```bash
# 1. Create file
touch app/api/goals/route.ts

# 2. Implement
# app/api/goals/route.ts
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { productId, title, targetValue, unit } = await request.json()

  const goal = await prisma.goal.create({
    data: { productId, title, targetValue, unit, startDate: new Date() },
  })

  return NextResponse.json(goal, { status: 201 })
}

# 3. Test with curl
curl -X POST http://localhost:3000/api/goals \
  -H "Content-Type: application/json" \
  -d '{"productId":"...", "title":"...", ...}'

# 4. Use from client
const res = await fetch("/api/goals", {
  method: "POST",
  body: JSON.stringify({ productId, title, ... }),
})
```

### Task 2: Add a New Page

**Example: /growth page (already exists, but here's the pattern)**

```bash
# 1. Create directory
mkdir app/growth

# 2. Create page
# app/growth/page.tsx
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import PageHeader from "@/components/PageHeader"
import GrowthSection from "@/components/GrowthSection"

export default async function GrowthPage() {
  const session = await getServerSession(authOptions)
  const product = await prisma.product.findFirst({
    where: { userId: session.user.id },
  })

  return (
    <div>
      <PageHeader title="Growth" description="..." />
      <GrowthSection productId={product.id} />
    </div>
  )
}

# 3. Add link to DashboardNav
# components/DashboardNav.tsx - add to navItems array
{ href: "/growth", label: "Büyüme" }

# 4. Test
npm run dev
# http://localhost:3000/growth
```

### Task 3: Modify Database Schema

**Example: Add a new field to Goal**

```bash
# 1. Update schema
# prisma/schema.prisma
model Goal {
  id           String   @id @default(cuid())
  # ... existing fields ...
  completedAt  DateTime?  # NEW FIELD
}

# 2. Create migration
npx prisma migrate dev --name add_goal_completed_at

# 3. Test migration
npx prisma migrate reset  # Reset to test from scratch

# 4. Commit
git add prisma/migrations/
git commit -m "feat: add completedAt to Goal"
```

### Task 4: Add a Component

**Example: Add TaskPriorityBadge component**

```bash
# 1. Create file
# components/TaskPriorityBadge.tsx
"use client"

import { Priority } from "@prisma/client"

const colors: Record<Priority, string> = {
  HIGH: "bg-red-50 text-red-600 border-red-100",
  MEDIUM: "bg-yellow-50 text-yellow-600 border-yellow-100",
  LOW: "bg-green-50 text-green-600 border-green-100",
}

const labels: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
}

export default function TaskPriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span className={`px-2 py-1 rounded text-[12px] font-semibold border ${colors[priority]}`}>
      {labels[priority]}
    </span>
  )
}

# 2. Use in component
import TaskPriorityBadge from "@/components/TaskPriorityBadge"

<TaskPriorityBadge priority={task.priority} />
```

### Task 5: Write a Test

**Example: Test TaskPriorityBadge component**

```bash
# 1. Create test file
# tests/unit/components/TaskPriorityBadge.test.tsx
import { render, screen } from "@testing-library/react"
import { Priority } from "@prisma/client"
import TaskPriorityBadge from "@/components/TaskPriorityBadge"

describe("TaskPriorityBadge", () => {
  it("renders HIGH priority with correct styling", () => {
    render(<TaskPriorityBadge priority={Priority.HIGH} />)
    const badge = screen.getByText("High")
    expect(badge).toHaveClass("text-red-600")
  })
})

# 2. Run test
npm run test

# 3. E2E test (test in real browser)
# tests/e2e/tasks.spec.ts
test("task shows priority badge", async ({ page }) => {
  await page.goto("/tasks")
  const badge = await page.getByText("High")
  expect(badge).toBeVisible()
})

npm run test:e2e
```

---

## 🔍 Debugging & Troubleshooting

### Issue: Build fails with type errors

```bash
# 1. Check types
npm run build

# 2. Generate Prisma types
npx prisma generate

# 3. Clear cache
rm -rf .next
npm run build
```

### Issue: Database connection fails

```bash
# 1. Check .env.local
cat .env.local | grep DATABASE_URL

# 2. Test connection
psql $DATABASE_URL -c "SELECT 1"

# 3. Check Prisma can connect
npx prisma db execute --stdin < /dev/null

# 4. Recreate dev database
npx prisma migrate reset --force
```

### Issue: Tests fail locally but pass in CI

```bash
# 1. Clear node_modules
rm -rf node_modules
npm install

# 2. Clear Playwright browsers
npx playwright install

# 3. Run tests again
npm run test:all
```

### Issue: Checklist item not updating

```bash
# 1. Check browser console for errors
# Open DevTools → Console

# 2. Check server logs
# Look at npm run dev terminal for error messages

# 3. Check database
npx prisma studio
# Find the checklist item, verify it exists

# 4. Check API response
# Open DevTools → Network → find PATCH request
# Check if response is 200 and contains updated data
```

### Useful Debugging Commands

```bash
# View database in GUI
npx prisma studio

# Check Prisma schema
npx prisma validate

# Generate types from schema
npx prisma generate

# Reset database (dev only!)
npx prisma migrate reset

# See all environment variables
env | grep DATABASE_URL
```

---

## 🚀 Deployment

### To Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin main

# 2. Connect repo to Vercel (one-time)
# Go to vercel.com → Import project

# 3. Set environment variables in Vercel dashboard
# DATABASE_URL = your Supabase PostgreSQL URL
# NEXTAUTH_SECRET = openssl rand -base64 32
# NEXTAUTH_URL = https://your-domain.vercel.app

# 4. Deploy
# Auto-deploys on push to main
# Or manually via Vercel dashboard

# 5. Verify
# Check logs: vercel logs <project-name>
# Test: https://your-domain.vercel.app
```

### Self-Hosted

```bash
# 1. Build
npm run build

# 2. Start production server
npm run start
# Server on :3000

# 3. Proxy with nginx/Apache
# Point domain to http://localhost:3000
```

### Database Deployment

```bash
# If using Supabase (PostgreSQL):
# 1. Create Supabase project
# 2. Get DATABASE_URL from Settings → Database
# 3. Set in .env.local for local development
# 4. Run migrations:
npx prisma migrate deploy

# 5. Set DATABASE_URL in Vercel environment
```

### Post-Deployment Checklist

- [ ] All env variables set
- [ ] Database migrations run (`prisma migrate deploy`)
- [ ] Can signup and create product
- [ ] Can create checklist items and tasks
- [ ] Tests pass in CI/CD
- [ ] Error monitoring set up (future: Sentry)
- [ ] Performance monitoring set up (future: Vercel Analytics)

---

## 📞 Key Contacts & Resources

**Code:**
- GitHub repo: [your-repo-url]
- Main branch: `main`
- Deployment: Vercel

**Documentation:**
- README.md - Quick start & overview
- SPRINT_STATUS.md - Current sprint details
- PROJECT_SNAPSHOT.md - State snapshot
- ROADMAP.md - Long-term vision

**External Tools:**
- Database: PostgreSQL (Supabase recommended)
- Auth: NextAuth 4
- Deployment: Vercel
- Testing: Playwright for e2e, Vitest for unit (future)

---

## ✅ Final Checklist for New Developer

Before starting work:

- [ ] Clone repo and install deps
- [ ] Setup .env.local with DATABASE_URL and NEXTAUTH_SECRET
- [ ] Run `npx prisma migrate dev`
- [ ] Run `npm run dev` and verify localhost:3000 loads
- [ ] Run `npm run test:all` and verify all tests pass
- [ ] Create test account and create a product
- [ ] Understand active product context (how multiple products work)
- [ ] Read SPRINT_STATUS.md to understand current work
- [ ] Review one API route and one component
- [ ] Read the next sprint definition to understand what you'll be building

---

**Welcome aboard! Questions? Check README.md or reach out.**
