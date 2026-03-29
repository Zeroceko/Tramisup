# Sprint Status & Roadmap

**Last Updated:** 21 March 2026  
**Current Phase:** Launch Operating System (Sprint 2) - COMPLETE ✅

> Note: This document is historical sprint tracking. For current production flow and routes, use `HANDOFF.md`, `CLAUDE.md`, and `README.md`.

---

## 📊 Sprint Overview

```
Sprint 0: Foundation Reset          ✅ COMPLETE
Sprint 1: Product Creation          ✅ COMPLETE
Sprint 2: Launch Operating System   ✅ COMPLETE
Sprint 2.5: iOS App Store (opt)     ⏳ PLANNED
Sprint 3: SEO & Content Skills      ⏳ PLANNED
Sprint 4: Growth Readiness          🔮 PLANNED
Sprint 5+: Platform Maturity        🔮 ROADMAP
```

---

## ✅ Completed Sprints

### Sprint 0 - Foundation Reset (COMPLETE)
**Goal:** Stabilize development environment and auth flow  
**Duration:** Feb 2026  
**Status:** ✅ Complete

**Deliverables:**
- ✅ Local development environment stabilized (`.next` cache issues fixed)
- ✅ Auth flow smoke tested (signup/login/logout/session)
- ✅ Seed reliability verified
- ✅ Documentation updated to match code reality
- ✅ Build passing without errors

**Verification:**
- ✅ `next build` clean
- ✅ signup → dashboard flow working
- ✅ Docs aligned with codebase

---

### Sprint 1 - Product Creation & Understanding (COMPLETE)
**Goal:** Enable users to create and manage multiple products with context  
**Duration:** Feb-Mar 2026  
**Status:** ✅ Complete

**Deliverables:**
- ✅ Products page (`/products`) - list all user products
- ✅ Create product wizard (`/{locale}/onboarding`) - guided onboarding
- ✅ API: `POST /api/products` - product creation
- ✅ Active product selector in DashboardNav
- ✅ Active product context management (cookie-based)
- ✅ Product profile fields (name, category, audience, business model, etc.)
- ✅ E2E tests covering critical path (21 tests)

**Key Decisions:**
- Product context stored in cookie (persistent across page reloads)
- Wizard has 7 steps: Describe → Type & Channels → Profile → Data & Permissions → Launch Prep → Growth Setup → Priorities
- Multi-product model from day 1 (founder might have multiple startups)

**Verification:**
- ✅ User can create second product
- ✅ Active product changes context on dashboard
- ✅ Onboarding flow takes <5 minutes
- ✅ E2E tests pass (chromium + mobile)

---

### Sprint 2 - Launch Operating System (COMPLETE) ✅ 21 MARCH 2026
**Goal:** Transform launch readiness into a real decision system with visibility and actionability  
**Duration:** Mar 2026  
**Status:** ✅ SHIPPED

**Deliverables:**

#### 1. Launch Review Summary Component
- **File:** `components/LaunchReviewSummary.tsx`
- **Display:** Overall launch readiness % score + Ready/Not Yet status
- **Props:** overallScore, readyToLaunch, categories, blockersCount
- **Design:** Large score display, status badge, blocker counter

#### 2. Blocker Summary Component
- **File:** `components/BlockerSummary.tsx`
- **Display:** HIGH priority items blocking launch
- **Features:** 
  - Lists all HIGH priority uncompleted items
  - "Create Task" button for each blocker
  - Shows which blockers have linked tasks
- **Design:** Red warning box, category badges, action buttons

#### 3. Checklist Section Component
- **File:** `components/ChecklistSection.tsx`
- **Display:** Category-based checklists with progress tracking
- **Features:**
  - 4 categories: Product, Marketing, Legal, Tech
  - Progress bars per category
  - Checkbox toggles for completion
  - "Create Task" / "View Task" buttons for linkage
- **Design:** Category icons, inline completion tracking

#### 4. Category Scorecard Row
- **Location:** `app/pre-launch/page.tsx` (lines 143-172)
- **Display:** 4 inline cards (Product 75%, Marketing 50%, Legal 100%, Tech 60%)
- **Status Indicators:** Ready (green), Blocked (red), In Progress (teal)

#### 5. Tasks Page
- **File:** `app/tasks/page.tsx`
- **Features:**
  - List all tasks (across all statuses)
  - Status transitions: TODO → IN_PROGRESS → DONE
  - Priority sorting (HIGH > MEDIUM > LOW)
  - Overdue detection & highlighting
  - Color-coded by priority/status
- **Design:** Grouped by status, visual indicators

#### 6. Checklist → Task Linkage
- **Server Action:** `createTaskFromChecklistItem` in `app/pre-launch/page.tsx`
- **Flow:** 
  1. Click "Create Task" on checklist item
  2. Creates task with item's title & priority
  3. Links task back to checklist via `linkedTaskId`
  4. ChecklistSection shows "View Task" instead of "Create Task"
- **Database Changes:** LaunchChecklist.linkedTaskId (unique), Task.launchChecklistItem (reverse)

#### 7. Navigation Updates
- **File:** `components/DashboardNav.tsx`
- **Change:** Added "Görevler" (Tasks) link to main navigation

#### 8. Test Suite Refactor
- **Files:** `vitest.config.ts`, `package.json`
- **Changes:**
  - Vitest properly configured to exclude e2e tests
  - Separated unit (Vitest) from e2e (Playwright) test runners
  - New npm scripts:
    - `npm run test:unit` - Unit tests only
    - `npm run test:e2e` - E2E tests only
    - `npm run test:all` - Both
- **Results:**
  - ✅ 24 unit tests passing
  - ✅ 38 e2e tests passing (chromium + mobile)
  - ✅ 0 configuration conflicts

**Test Results (21 March 2026):**
```
Unit Tests:       24 passed ✅
E2E Tests:        38 passed, 4 skipped ✅
Build:            Passing ✅
All pages:        Loading cleanly ✅
```

**Database Changes:**
```prisma
model LaunchChecklist {
  priority     Priority  @default(MEDIUM)   // NEW: LOW, MEDIUM, HIGH
  linkedTaskId String?   @unique            // NEW: Link to task
  linkedTask   Task?     @relation(...)     // NEW: Relation
}

model Task {
  launchChecklistItem LaunchChecklist? @relation(...)  // NEW: Reverse relation
}
```

**Key Design Decisions:**
1. **Launch score at top level** - Users see overall progress immediately
2. **Blockers highlighted separately** - HIGH priority items get visual prominence
3. **Category scoring** - Users understand which area is weak
4. **Checklist → Task linkage** - One item can become one executable task (no duplication)
5. **Task page separate from pre-launch** - Task management (/tasks) is independent view

**Verification:**
- ✅ User sees launch readiness % on pre-launch page
- ✅ HIGH priority items highlighted in BlockerSummary
- ✅ Can click "Create Task" to create executable task
- ✅ Created task shows in /tasks page
- ✅ Overdue items show with red highlighting
- ✅ Priority sorting correct (HIGH first)
- ✅ All E2E tests pass (includes mobile)

---

## ⏳ Upcoming Sprints

### Sprint 2.5 - iOS App Store Preflight (OPTIONAL)
**Goal:** Help iOS developers reduce App Store rejection risk  
**Estimated:** 1-2 weeks  
**Status:** Designed, awaiting development  
**Priority:** Medium (nice-to-have for iOS dev subset)

**Scope:**
- Integrate iOS App Store preflight scanning skill
- Scan local Xcode project or GitHub repo
- Detect rejection patterns (metadata, privacy, entitlements, etc.)
- Generate App Store readiness score
- Auto-create tasks from detected issues

**User Flow:**
1. User on pre-launch page sees "Scan iOS Project" button
2. Clicks → uploads Xcode project or GitHub repo URL
3. Backend runs app-store-preflight-skills
4. Dashboard shows App Store readiness score
5. Each issue has "Create Task" to add to tasks list

**Database Schema:**
```prisma
model Integration {
  provider IntegrationProvider @enum(... APPSTORE_PREFLIGHT ...)
  config   String  // Xcode project path or GitHub repo
  status   String  // PENDING, SCANNING, COMPLETE, ERROR
}

// Issues auto-create as tasks if user clicks "Create Task"
```

**Files to Create:**
- `components/AppStoreScanSection.tsx`
- `app/api/integrations/appstore-scan/route.ts`
- Playwright test for scan flow

**Verification:**
- [ ] User can upload iOS project
- [ ] Scan completes in <2 min
- [ ] Issues listed (Critical/Warning/Passed)
- [ ] Can create task from issue
- [ ] App Store score on dashboard

---

### Sprint 3 - SEO & Content Skills Integration (NEXT)
**Goal:** Provide pre-launch users with SEO audit and copywriting support  
**Estimated:** 2-3 weeks  
**Status:** Designed, awaiting development  
**Priority:** High (critical for launch preparation)

**Scope:**
- Integrate SEO audit skill
- Integrate content generation skill
- Integrate copywriting assistance skill
- Add pre-launch checklist items for SEO/content
- Auto-create tasks from skill recommendations

**User Flow:**
1. User on pre-launch page sees "Run SEO Audit" button (new section)
2. Clicks → scans website (if provided in product wizard)
3. Skill runs, detects SEO issues
4. Results shown: Critical issues, warnings, opportunities
5. User can create tasks from recommendations
6. Content generation option: click "Generate copy" → AI drafts → user edits → adds to task

**Integration Pattern:**
```typescript
// Backend: Invoke skill on button click
const result = await runSkill("seo-audit", { websiteUrl: product.website })
// Store result in Integration
// Return to frontend

// Frontend: Display result, offer task creation
```

**Database:**
```prisma
model Integration {
  provider  IntegrationProvider @enum(... SEO_AUDIT, CONTENT_GEN, COPYWRITING ...)
  status    String  // PENDING, RUNNING, COMPLETE
  result    String  // JSON: { issues: [...], recommendations: [...] }
}
```

**Files to Create:**
- `components/SEOAuditSection.tsx`
- `components/ContentGeneratorSection.tsx`
- `components/CopywritingAssistantSection.tsx`
- `app/api/integrations/seo-audit/route.ts`
- `app/api/integrations/content-gen/route.ts`

**Verification:**
- [ ] SEO audit runs on website
- [ ] Issues categorized (Critical/Warning/Info)
- [ ] Can create task from issue
- [ ] Content generator produces copy
- [ ] Copywriting assistant suggests variations

---

### Sprint 4 - Growth Readiness System (PLANNED)
**Goal:** Help users transition from launch to growth phase  
**Estimated:** 3-4 weeks  
**Status:** Designed (in ROADMAP.md)  
**Priority:** High

**Scope:**
- Growth checklist (similar to launch, but different items)
- Goal tracking (OKR-style)
- Retention cohort visualization
- Activation funnel insights
- Growth routine calendar
- Weekly review workflow (initial version)

**Key Pages:**
- `/growth` redesign
- New components for goals, retention, funnel
- Growth readiness score (similar to launch)

---

### Sprint 5+ - Platform Maturity (ROADMAP)
**Goal:** Real integrations, AI recommendations, multi-team collaboration  
**Status:** Long-term roadmap

**Scope:**
- Real integrations: GA4, Stripe, PostHog, Mixpanel
- Sync jobs (automated data collection)
- Weekly review modal (structured decision-making)
- AI recommendation layer
- Multi-team collaboration
- Benchmarking & templates

---

## 🔗 Dependencies & Critical Path

```
Sprint 0 (Foundation)
    ↓
Sprint 1 (Product Creation)
    ↓
Sprint 2 (Launch OS) ← CURRENT
    ↙        ↘
Sprint 2.5  Sprint 3 (SEO & Content)
(optional)      ↓
            Sprint 4 (Growth)
                ↓
            Sprint 5 (Maturity)
```

**Critical Path:** Sprint 2 → Sprint 3 → Sprint 4  
**Optional Branch:** Sprint 2.5 (iOS developers only)

---

## 📈 Metrics & Success

### Sprint 2 Success Criteria ✅
- [x] Overall launch readiness score visible
- [x] Blockers highlighted and actionable
- [x] Checklist → Task creation working
- [x] /tasks page functional
- [x] All E2E tests passing
- [x] Build clean
- [x] No console errors

### Sprint 3 Success Criteria (TBD)
- [ ] SEO audit runs without errors
- [ ] Issues categorized correctly
- [ ] Tasks created from recommendations
- [ ] Content generation produces usable copy
- [ ] All tests passing

### Sprint 4 Success Criteria (TBD)
- [ ] Growth checklist similar UX to launch
- [ ] Goals tracked with progress
- [ ] Retention/funnel charts rendering
- [ ] Weekly review flow working
- [ ] Growth → launch transition clear

---

## 🚀 Release Timeline

| Sprint | Scope | Target Date | Status |
|--------|-------|-------------|--------|
| 0 | Foundation | Feb 2026 | ✅ Complete |
| 1 | Products & Wizard | Mar 2026 | ✅ Complete |
| 2 | Launch OS | 21 Mar 2026 | ✅ Complete |
| 2.5 | iOS Scan | Apr 2026? | ⏳ Optional |
| 3 | SEO & Content | Apr 2026 | ⏳ Next |
| 4 | Growth OS | May 2026 | 🔮 Planned |
| 5 | Maturity | Jun 2026+ | 🔮 Roadmap |

---

## 📝 Notes for Next Developer

1. **Start with Sprint 3** - It's the logical next step after Sprint 2
2. **Understand skill integration pattern** - Sprint 3 heavily uses external skills
3. **Keep test suite clean** - Don't let unit + e2e tests get mixed again
4. **Design system is strong** - Use existing Tailwind color palette
5. **Server components work well** - Stick with server-side data fetching
6. **E2E tests are valuable** - They catch critical paths (keep them updated)

---

**Questions? See HANDOFF.md or README.md**
