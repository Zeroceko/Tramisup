# Project Snapshot - 29 March 2026

**Purpose:** Current state of Tiramisup for handoff or deployment planning

---

## 📦 Codebase Status

### Repository
```
Branch:              main
Commits ahead:       0 (synced)
Last commit:         5fbd0336 - docs: update handoff with language rollout
Last sprint:         Language Support Rollout (EN/TR) + preference persistence (COMPLETE)
```

### Build Status
```
npm run build:       ✅ PASSING (last known)
Type checking:       ✅ 0 errors (last known)
Linting:             ✅ Clean (last known)
Console errors:      ✅ None (last known)
Production ready:    ✅ YES
```

### Test Status (29 March 2026)
```
Unit Tests:          68 passed ✅ (Vitest with dummy AI keys)
E2E Tests:           Not run in this update
Test Platforms:      —
Test Duration:       ~1s (unit only)
Critical Path:       Core unit tests passing
```

---

## 🗄️ Database Schema (Current)

### User Authentication
- `User`: email, name, passwordHash, **preferredLocale**, createdAt, updatedAt
- Auth via NextAuth 4 (Credentials provider)
- Sessions: JWT-based, httpOnly cookies

### Products
- `Product`: Stores multi-product context
  - Fields: name, status (PRE_LAUNCH/LAUNCHED/GROWING), category, targetAudience, businessModel
  - Onboarding fields: description, website, logoUrl, launchGoals
  - Relations: launchChecklists, growthChecklists, tasks, metrics, goals, routines, integrations

### Launch Readiness
- `LaunchChecklist`: 4 categories (PRODUCT, MARKETING, LEGAL, TECH)
  - Fields: title, description, completed, completedAt, **priority** (NEW), **linkedTaskId** (NEW)
  - 24 seeded items across 4 categories
  - Calculation: Category % = completed/total, Overall % = all completed/all total

### Task Management
- `Task`: Execution items
  - Status: TODO, IN_PROGRESS, DONE
  - Priority: LOW, MEDIUM, HIGH
  - Fields: title, description, dueDate, priority, status, productId
  - Relations: **launchChecklistItem** (NEW) - reverse link to checklist

### Analytics (Framework Ready, No Sync Yet)
- `Metric`: DAU, MAU, MRR, churn, activeSubscriptions, newSignups, activationRate
- `RetentionCohort`: Cohort-based retention tracking
- `ActivationFunnel`: 4-step funnel (SIGNUP, ONBOARDING, FIRST_ACTION, ACTIVATED)

### Growth & Goals
- `Goal`: OKR-style tracking (not yet UI)
- `GrowthChecklist`: Similar structure to LaunchChecklist (not yet UI)
- `GrowthRoutine`: Weekly/monthly habits (not yet UI)
- `TimelineEvent`: Milestones (LAUNCH, GOAL_COMPLETED, etc.)

### Integrations (Framework Ready, Not Implemented)
- `Integration`: OAuth/API connections
  - Providers: STRIPE, GA4, MIXPANEL, SEGMENT, AMPLITUDE, POSTHOG
  - Status: DISCONNECTED, CONNECTED, ERROR
- `SyncJob`: Track data sync operations

---

## 🖥️ Frontend Architecture (Current)

### Key Pages (App Router)
```
/                      → Landing page (EN/TR, default EN)
/login, /signup        → Auth pages
/dashboard             → Main dashboard (overview)
/products              → Product list + selector
/products/new          → 7-step product wizard
/pre-launch            → Launch readiness (redesigned Sprint 2)
/tasks                 → Task management (new Sprint 2)
/metrics               → Analytics dashboard
/growth                → Growth management (framework ready)
/integrations          → Integration setup (framework ready)
/settings              → User settings
```

### Key Components (Latest)
```
DashboardNav           → Main navigation + product selector
LaunchReviewSummary    → Overall score + ready status (SPRINT 2)
BlockerSummary         → HIGH priority items (SPRINT 2)
ChecklistSection       → Category-based checklists (SPRINT 2)
TasksList              → Task listing with status (SPRINT 2)
ActionsSection         → Task quick view with toggles
ProductSelector        → Multi-product dropdown
PageHeader             → Standard page header
```

### Styling
- Tailwind CSS 3 only (no CSS-in-JS)
- Color palette: Teal (#95dbda), Pink (#ffd7ef), Red (#ff4d4f), Green (#75fc96)
- Responsive: Mobile-first, tested on iPhone 12 + Chromium

---

## 🔌 API Endpoints (Current)

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/[...nextauth]` - NextAuth routes

### Products
- `GET /api/products` - List products
- `POST /api/products` - Create product
- `GET /api/products/[id]` - Get product details
- `PATCH /api/products/[id]` - Update product

### Tasks
- `POST /api/actions` - Create task
- `GET /api/actions` - List tasks
- `PATCH /api/actions/[id]` - Update task status

### Checklists
- `PATCH /api/checklist/[id]` - Toggle completion

### Other (Framework Ready, Not Implemented)
- `/api/metrics`, `/api/goals`, `/api/routines`, `/api/integrations`

---

## 🧪 Testing Infrastructure

### Vitest (Unit Tests)
- Config: `vitest.config.ts`
- Exclude pattern: `tests/e2e/**`
- 68 tests currently passing (with dummy AI keys)
- Future: Add component and utility tests

### Playwright (E2E Tests)
- Config: `playwright.config.ts`
- Test directory: `tests/e2e/`
- Files: `sprint-1-manual.spec.ts` (21 tests), `wizard-pill-smoke.spec.ts` (21 tests)
- Auth setup: `global-setup.ts` (creates test user, stores auth state)
- Projects: Chromium (desktop) + Mobile (iPhone 12)

### Test Commands
```
npm run test           → Unit tests (Vitest)
npm run test:watch    → Unit tests in watch mode
npm run test:e2e      → E2E tests (Playwright, headed)
npm run test:e2e:ui   → E2E tests with UI
npm run test:all      → Both unit + e2e
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

---

## 🌍 Deployment Status

### Vercel Deployment (Recommended)
- ✅ Next.js 15 optimized
- ✅ Automatic deployments on `main` push
- ✅ Environment variables configured
- ✅ PostgreSQL connection via Supabase ready

### Environment Variables (Needed)
```
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...
NEXTAUTH_SECRET=<32-char secret>
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### Database (Production)
- **Recommended:** Supabase PostgreSQL
- **Current:** PostgreSQL via Prisma
- **Migrations:** Ready with `npx prisma migrate deploy`
- Includes `User.preferredLocale`

### Pre-Deployment Checklist
- [ ] All env variables set in Vercel
- [ ] Database migrations run
- [ ] Tests passing in CI
- [ ] Build successful
- [ ] Signup → dashboard flow tested
- [ ] Product wizard works end-to-end

---

## 📊 Key Metrics & Stats

### Code
```
Frontend components:   ~20 (growing)
API routes:            ~10 (framework ready for more)
Database models:       11 (7 partially implemented)
Lines of code:         ~8,000 (est.)
TypeScript coverage:   100%
```

### Tests
```
Unit tests:            68
E2E tests:             Not run in this update
Code coverage:         20% (last known)
Test run time:         ~1s (unit only)
```

### Performance
```
Dashboard load:        ~800ms (verified TC-072)
Pre-launch page:       ~700-800ms
Wizard step change:    Instant
Build size:            ~102kb shared JS
```

---

## 🎯 Current Limitations & Known Issues

### Not Implemented Yet
- Full cookie policy / privacy surface for language preference
- Sync jobs for data collection
- Growth readiness system
- Weekly review workflow
- AI-assisted recommendations
- Multi-team collaboration
- Mobile app (web-only)

### Framework Ready (Not Wired)
- Growth checklist system (schema exists)
- Metrics calculations (schema exists)
- Goal tracking (schema exists)
- Integration connections (schema exists)

### Future Considerations
- Need error tracking (Sentry)
- Need performance monitoring (Vercel Analytics)
- Need user analytics (PostHog)
- Rate limiting on API routes
- Input validation on forms
- Email notifications (future)

---

## 🚀 Next Steps (Immediate)

### Option 1: Sprint 3 (SEO & Content)
- Integrate SEO audit skill
- Add content generation
- Estimate: 2-3 weeks

### Option 2: Sprint 2.5 (iOS App Store)
- iOS project scanning
- Rejection pattern detection
- Estimate: 1-2 weeks (optional)

### Option 3: Polish & Deploy
- Add more unit tests
- Performance optimization
- Deploy to Vercel
- Launch to beta users

---

## 📋 Files to Know

### Critical
- `prisma/schema.prisma` - Database blueprint
- `app/pre-launch/page.tsx` - Most complex page (Sprint 2)
- `app/tasks/page.tsx` - Task management (Sprint 2)
- `components/DashboardNav.tsx` - Navigation & product context
- `lib/auth.ts` - NextAuth configuration

### Important
- `vitest.config.ts` - Unit test config (recently fixed)
- `playwright.config.ts` - E2E test config
- `app/api/actions/route.ts` - Task CRUD
- `components/LaunchReviewSummary.tsx` - Launch score display (NEW)
- `components/BlockerSummary.tsx` - Blocker highlighting (NEW)

### Reference
- `README.md` - Quick start
- `HANDOFF.md` - Developer guide
- `SPRINT_STATUS.md` - Sprint details
- `ROADMAP.md` - Long-term vision

---

## 💡 Key Decision Records

1. **Multi-product from day 1** - Founders have multiple startups
2. **Server components first** - Real-time data, simpler architecture
3. **Tailwind only** - Fast iteration, design system via config
4. **Checklist → Task linkage** - One item creates one executable task
5. **Cookie-based product context** - Persistent across sessions
6. **Separated unit/e2e tests** - Different runners (Vitest vs Playwright)

---

## 🎓 Learning Resources for New Dev

1. **Start here:** HANDOFF.md → "Quick Orientation"
2. **Understand:** How multi-product context works (lib/activeProduct.ts)
3. **Study:** Sprint 2 components (LaunchReviewSummary, BlockerSummary, ChecklistSection)
4. **Read:** SPRINT_STATUS.md for next steps
5. **Run:** E2E tests to understand user flows
6. **Build:** Add one new component to /growth page

---

## 📞 Questions?

- **Setup issues?** See README.md "Quick Start"
- **Code patterns?** See HANDOFF.md "Code Patterns"
- **What to build next?** See SPRINT_STATUS.md
- **Architecture?** See HANDOFF.md "Architecture Deep Dive"
- **Tests failing?** See HANDOFF.md "Debugging"

---

**Ready to handoff! 🚀**
