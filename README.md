# Tiramisup - Startup Operating System

> Founder'lar ve startup ekipleri için launch-to-growth döneminde tek bir workspace'de operasyonel rhythm kurmak.

**Status:** Production-ready MVP  
**Last Updated:** 21 March 2026  
**Maintainer:** See HANDOFF.md

---

## 🎯 What is Tiramisup?

Tiramisup is an operating system for early-stage startups to manage the critical period between product launch and growth phase. Instead of juggling Notion, spreadsheets, analytics dashboards, and Slack updates, founders and teams use Tiramisup to:

- **Understand** where the product stands (launch readiness, metrics, blockers)
- **Decide** what to do next (prioritized tasks, goals, routines)
- **Execute** with structure (checklists, workflows, integrations)
- **Review** progress regularly (weekly reviews, scorecards, templates)

### Core Value Prop
> "Launch-to-growth operating rhythm in one product workspace."

---

## 🏗️ Architecture Overview

### Tech Stack
```
Frontend:      Next.js 15, React 19, TypeScript
Styling:       Tailwind CSS 3, custom design system
Database:      PostgreSQL (Prisma 7 ORM)
Authentication: NextAuth 4 (Credentials-based)
Testing:       Vitest (unit), Playwright (e2e)
Deployment:    Vercel (Next.js optimized)
```

### Database Schema (Key Models)
```
User
├── Products (multi-product support)
│   ├── LaunchChecklist (4 categories: Product, Marketing, Legal, Tech)
│   │   ├── priority (LOW, MEDIUM, HIGH)
│   │   └── linkedTaskId (link to task for execution)
│   ├── Tasks (TODO, IN_PROGRESS, DONE)
│   │   ├── priority
│   │   ├── dueDate
│   │   └── launchChecklistItem (reverse)
│   ├── GrowthChecklist (future phase)
│   ├── Metrics (DAU, MAU, MRR, churn)
│   ├── Goals (with progress tracking)
│   ├── GrowthRoutines (weekly/monthly habits)
│   ├── RetentionCohorts (retention analysis)
│   ├── ActivationFunnels (funnel steps)
│   ├── TimelineEvents (milestones)
│   └── Integrations (connected data sources)
```

### File Structure
```
.
├── app/                           # Next.js App Router
│   ├── (auth)/                   # Auth routes (login, signup)
│   ├── dashboard/                # Main dashboard
│   ├── products/                 # Product management
│   │   └── new/                 # 7-step product wizard
│   ├── pre-launch/               # Launch readiness system (SPRINT 2)
│   ├── tasks/                    # Task management page (SPRINT 2)
│   ├── metrics/                  # Analytics dashboard
│   ├── growth/                   # Growth management
│   ├── integrations/             # Integration setup
│   ├── api/                      # API routes
│   │   ├── actions/              # Task CRUD
│   │   ├── checklist/            # Checklist item CRUD
│   │   ├── products/             # Product management
│   │   └── auth/                 # Authentication
│   └── settings/                 # User settings
├── components/                    # Reusable React components
│   ├── DashboardNav.tsx          # Main navigation
│   ├── ProductSelector.tsx       # Product switcher
│   ├── LaunchReviewSummary.tsx   # Launch score summary (SPRINT 2)
│   ├── BlockerSummary.tsx        # Blocker extraction (SPRINT 2)
│   ├── ChecklistSection.tsx      # Category checklists (SPRINT 2)
│   ├── TasksList.tsx             # Task listing (SPRINT 2)
│   └── [...]
├── lib/                           # Utilities and helpers
│   ├── auth.ts                   # NextAuth configuration
│   ├── prisma.ts                 # Prisma client singleton
│   ├── activeProduct.ts          # Product context management
│   └── [...]
├── prisma/
│   ├── schema.prisma             # Database schema
│   └── migrations/               # Database migrations
├── tests/
│   ├── e2e/                      # Playwright e2e tests
│   │   ├── sprint-1-manual.spec.ts    # Critical path tests
│   │   └── wizard-pill-smoke.spec.ts  # Wizard tests
│   └── unit/                     # Vitest unit tests (future)
├── .env.local                    # Local environment variables
├── vitest.config.ts              # Unit test configuration
├── playwright.config.ts          # E2E test configuration
├── HANDOFF.md                    # Developer onboarding (THIS FILE)
├── SPRINT_STATUS.md              # Current sprint details
└── PROJECT_SNAPSHOT.md           # Current state snapshot
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Setup

```bash
# 1. Clone and install
git clone <repo>
cd tiramisup
npm install

# 2. Environment setup
cp .env.example .env.local
# Edit .env.local with your database URL and NextAuth secret

# 3. Database setup
npx prisma migrate dev --name init
npx prisma db seed  # Populate with sample data

# 4. Start development
npm run dev
# Open http://localhost:3000

# 5. Run tests
npm run test        # Unit tests (Vitest)
npm run test:e2e    # E2E tests (Playwright)
npm run test:all    # Both
```

### Development Commands
```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server
npm run lint             # Run ESLint
npm run test             # Run unit tests (Vitest)
npm run test:watch       # Unit tests in watch mode
npm run test:e2e         # Run e2e tests (Playwright)
npm run test:e2e:ui      # E2E tests with UI
npm run test:e2e:headed  # E2E tests headed (with browser)
npm run test:all         # Run all tests (unit + e2e)
```

---

## 📊 Current Status (21 March 2026)

### Completed
- ✅ **Sprint 0:** Foundation & auth stabilization
- ✅ **Sprint 1:** Multi-product support + 7-step wizard
- ✅ **Sprint 2:** Launch Operating System (JUST SHIPPED)
  - LaunchReviewSummary component (readiness score)
  - BlockerSummary component (HIGH priority tracking)
  - ChecklistSection component (category-based)
  - /tasks page (full task management)
  - Proper test suite separation

### Test Status
```
Unit Tests:      24 passed ✅
E2E Tests:       38 passed, 4 skipped ✅ (Chromium + Mobile)
Build:           Passing ✅
Production:      Ready ✅
```

### Git Status
```
Branch:          main
Commits ahead:   7 (ready to push)
Last commit:     8a63bd0 - Test suite refactor
```

---

## 🔄 Next Steps (Roadmap)

### Sprint 2.5 - iOS App Store Preflight (Optional)
Scan iOS projects for App Store rejection risks, auto-create tasks.

### Sprint 3 - SEO & Content Integration
Integrate SEO audit, content generation, copywriting skills into pre-launch.

### Sprint 4 - Growth Readiness
Growth checklist, goal tracking, retention/funnel analytics, routine calendar.

### Sprint 5+ - Platform Maturity
Real integrations (GA4, Stripe, PostHog), weekly reviews, AI recommendations, multi-team collaboration.

---

## 🔐 Authentication & Security

- **Strategy:** NextAuth 4 with Credentials provider
- **Session:** JWT-based, httpOnly cookies
- **Password:** Hashed with bcryptjs
- **Protected Routes:** Middleware guards app/* routes

**Setup:**
```typescript
// lib/auth.ts
// Configure NextAuth options, session callbacks, etc.
```

---

## 🗄️ Database

- **Provider:** PostgreSQL
- **ORM:** Prisma 7
- **Migrations:** Managed by prisma migrate

**Key Commands:**
```bash
npx prisma migrate dev --name <migration-name>
npx prisma db seed
npx prisma studio  # Visual DB explorer
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Location: `tests/unit/` (currently no tests, add as needed)
- Config: `vitest.config.ts`
- Run: `npm run test`

### E2E Tests (Playwright)
- Location: `tests/e2e/`
- Config: `playwright.config.ts`
- Run: `npm run test:e2e`
- Auth: Global setup in `tests/e2e/global-setup.ts` (creates test user)

**Important:** Vitest is configured to exclude e2e tests. Playwright is configured separately.

---

## 🚢 Deployment

### Vercel (Recommended)
1. Connect GitHub repo to Vercel
2. Set environment variables:
   ```
   DATABASE_URL=postgresql://...
   NEXTAUTH_SECRET=<generate with: openssl rand -base64 32>
   NEXTAUTH_URL=https://your-domain.com
   ```
3. Deploy (auto on push to main)

### Self-Hosted
```bash
npm run build
npm run start
# Server runs on port 3000
```

### Environment Variables
```
DATABASE_URL              # PostgreSQL connection string
NEXTAUTH_SECRET           # Random secret for signing tokens
NEXTAUTH_URL              # Public URL (e.g., http://localhost:3000)
NODE_ENV                  # development | production
```

---

## 📚 Documentation

- **HANDOFF.md** - Developer onboarding, architecture deep dive
- **SPRINT_STATUS.md** - Current sprint details and progress
- **PROJECT_SNAPSHOT.md** - State snapshot for handing off
- **ROADMAP.md** - Long-term vision and product strategy
- **SPRINT_PLAN.md** - Detailed sprint definitions

---

## 🤝 Contributing

See HANDOFF.md for contribution guidelines, code patterns, and development workflow.

---

## 📝 License

Private project (Tiramisup)

---

## 🙋 Questions?

Refer to HANDOFF.md for detailed developer documentation, or check SPRINT_STATUS.md for current work in progress.
