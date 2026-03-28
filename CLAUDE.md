# Tiramisup - Project Instructions

## Source of Truth Documents

Before making any changes to the AI layer, onboarding, recommendation system, or evidence map — read and follow these documents:

- [`docs/ai-agent-system-playbook.md`](docs/ai-agent-system-playbook.md) — defines the full AI agent architecture: normalized context → evidence map → recommendation engine → critic pass → structured output contract
- [`docs/product-intake-question-playbook.md`](docs/product-intake-question-playbook.md) — defines the intake question set, normalization rules, stage/goal enums, and onboarding UX guidelines

These are non-negotiable. Code must stay aligned with them.

---

## AI Agent System — Current State

The AI layer is fully implemented across Sprints 1–4 (+ QA pass). Here is what exists:

### Pipeline
```
Onboarding intake
  → normalizeProductContext()       lib/normalize-product-context.ts
  → buildEvidenceMap()              lib/build-evidence-map.ts
  → getFounderCoachContext()        lib/founder-coach-context.ts
  → evidence-readiness gate         lib/founder-coach.ts
  → AI prompt (normalized context)  lib/founder-coach.ts
  → sanitizeRecommendationOutput()  lib/founder-coach.ts
  → applyCriticPass()               lib/founder-coach.ts
  → CoachRecommendationOutput       rendered in components/AdvisorCard.tsx
```

### Key types (lib/founder-coach.ts)
- `Recommendation` — 11 fields: title, type, priority, impact_area, why_now, supporting_evidence, assumptions, missing_data, confidence, expected_outcome, user_action
- `CoachRecommendationOutput` — primary_recommendation + supporting_recommendations (max 3) + missing_information_for_better_guidance + critic_status
- `RecommendationType` — launch_blocker | readiness_next_step | source_setup | metric_selection | daily_action | weak_link | data_collection | weekly_focus

### Evidence-readiness gating
- `context_confidence === "low"` → always returns `data_collection` fallback, no AI call
- relevant readiness domain `=== "low"` → same fallback
- domain is mapped per stage: idea/dev/testing/launch_prep → launch, live → metrics, early_growth → growth

### Critic rules (applyCriticPass)
**Reject → buildStageFallback:**
- stage mismatch (e.g. launch_blocker on early_growth, daily_action on launch_prep)
- low confidence + high priority
- empty supporting_evidence array

**Revise → critic_status: "revised":**
- high confidence + 3+ missing_data → downgrade to medium
- medium confidence + high priority → downgrade priority to medium
- supporting recs with stage mismatch → drop
- supporting recs duplicating primary title → drop

### Onboarding wizard (components/OnboardingWizard.tsx)
Steps: `name → description → category → platform → stage → timing → business → audience → goal → sources → metrics`
- Platform is universal (Web, iOS, Android, Desktop, API, Multi-platform)
- Audience is structured selection (10 options)
- Goal sets both `growthGoal` (display label) and `goalKey` (normalized enum key)
- `goalKey` is serialized into `launchGoals` JSON field on the Product model

---

## GSD Skills

This project uses GSD (Get Shit Done) skills. When the user types any of the following commands, execute them according to the instructions below:

### /lint [path]
1. Detect linter: ESLint, Biome, Prettier, or native formatter
2. Run with `--fix` flag
3. Report remaining issues with file:line:column
4. Suggest fixes for unfixable issues

### /review [--staged|--unstaged|commit-hash]
1. Get diff via git (staged by default)
2. Review for: security vulnerabilities, performance issues, bugs, code quality
3. Output: file:line findings with severity (critical/warning/info)
4. Suggest specific fixes

### /test [path]
- If path is source file: generate tests (using Vitest, configured in vitest.config.ts)
- If path is test file: run tests and analyze failures
- No path: run full test suite with `npm test`

### /optimize [path]
Run deep performance audit across: DB queries, memory usage, algorithms, bundle size, rendering, caching, network, async operations, data structures, error handling, build config, API design, state management, type safety.

### /debug [description]
Systematic debugging: gather evidence, form hypotheses, test them, verify fix.

### /design [description]
Create production-grade, distinctive UI components avoiding generic AI aesthetics.

### /a11y [path]
WCAG 2.1 audit: ARIA attributes, keyboard navigation, screen reader support, color contrast.

### /browser [task]
Playwright automation: navigate, click, type, interact.

---

## Tech Stack
- Next.js 15 (App Router)
- React 19
- TypeScript
- Prisma 7 (PostgreSQL via Supabase)
- NextAuth 4 (Credentials + JWT)
- Tailwind CSS 3
- Vitest for testing

---

## Architecture Overview

Tiramisup is a founder operating system — it helps early-stage product teams track launch readiness, growth metrics, and daily execution. Everything is product-scoped: one user can have multiple products, one active product at a time.

### Key domain concepts

| Concept | What it is |
|---|---|
| **Product** | The central unit. All data belongs to a product. |
| **LaunchChecklist** | Priority-ordered items a product must clear before launch. Linked to Tasks. |
| **Task** | Executable work item. Can auto-complete a linked LaunchChecklist item when done. |
| **MetricSetup** | AARRR funnel configuration per product. Stores which metric keys the founder tracks. |
| **MetricEntry** | Daily values for tracked metrics (one row per product per day). |
| **Integration** | OAuth connection to an external data source (GA4, Stripe). |
| **SyncJob** | Record of a data pull from an Integration. |
| **Routine** | Daily growth ritual with completion tracking. |

### Route structure

```
app/
  [locale]/           ← All pages are locale-prefixed (tr or en)
    dashboard/        ← Product overview
    tasks/            ← Task execution queue
    pre-launch/       ← Launch checklist + readiness score
    metrics/          ← Adaptive growth metrics dashboard
    integrations/     ← Source connections (GA4, Stripe)
    onboarding/       ← Guided product creation wizard
    settings/         ← User profile settings
    admin/waitlist/   ← Admin-only waitlist management
  api/
    actions/          ← Task CRUD + completion cascade
    integrations/     ← OAuth flows + sync + validation
    products/         ← Product CRUD + AI insights
    metrics/          ← Metric entry + activation funnel
    routines/         ← Daily ritual completion
```

### Active product selection

`lib/activeProduct.ts` — reads/writes a cookie `active_product_id`. All server pages call `getActiveProductId()` to scope data queries.

---

## Key Files — Where the logic lives

### Task completion cascade
**`lib/task-completion-effects.ts`**
- `computeCompletionEffects(productId, checklist)` — forward cascade when task → DONE
  - Auto-completes linked checklist item
  - Counts remaining HIGH blockers
  - Detects milestones: `ALL_HIGH_BLOCKERS_CLEARED`, `ALL_CHECKLIST_COMPLETE`
  - Creates follow-up tasks (launch date task, AARRR setup task)
- `reverseCompletionEffects(checklist)` — reverse when DONE → TODO/IN_PROGRESS
- Returns `CompletionEffects` type consumed by the API and UI

**`app/api/actions/[id]/route.ts`** — PATCH endpoint. Calls cascade functions, returns `{ task, effects, reversed }`.

**`components/TasksList.tsx`** — Client component. Reads effects from PATCH response, shows contextual toasts. Click-to-expand descriptions via `expandedDescs: Set<string>`.

### Source setup & validation
**`lib/source-validation.ts`**
- `validateGa4(integrationId)` — OAuth check → property list → property selection check → 7-day data check
- `validateStripe(integrationId)` — Account access → subscriptions → recent charges
- Returns `ValidationResult` with `status: TRUSTED | UNTRUSTED | UNKNOWN`, `checks[]`, `errorCode?`, `preview?`

**`app/api/integrations/[id]/validate/route.ts`** — `POST` endpoint wrapping above.

**`components/SourceSetupWizard.tsx`** — Guided wizard modal. Steps vary by provider:
- GA4: `connect → property → validate → sync → done`
- Stripe: `connect → validate → sync → done`
- Auto-advances through steps, shows data preview before first sync.

**`components/IntegrationCard.tsx`** — Card for each integration. Opens wizard on "Bağlan". Shows "Kurulumu tamamla" when `NEEDS_SETUP`. Includes legacy property dialog (for re-selecting property without full wizard).

**`components/IntegrationsWorkspace.tsx`** — Auto-opens wizard on OAuth return (`?success=ga4_connected` or `stripe_connected`).

### Onboarding
**`components/OnboardingWizard.tsx`** — Multi-step product creation. Steps:
`name → description → category → platform → stage → timing (pre-launch only) → business → audience → goal → sources (optional) → metrics (optional)`
- Platform is now universal (6 options), not mobile-only
- Audience is a structured selection step (10 options from playbook)
- Goal sets both `growthGoal` (label) and `goalKey` (normalized enum key)
- `getActiveSteps(data)` computes which steps are active based on collected data
- Submits to `POST /api/products` + optionally `PATCH /api/products/[id]/metric-setup`
- Skip logic: timing only for PRE_LAUNCH, metrics skipped for very early stage

**`app/[locale]/onboarding/page.tsx`** — Server wrapper with auth guard.

### Metrics dashboard
**`app/[locale]/metrics/page.tsx`** — Adaptive state based on data:
- `no_setup` — no metrics configured → CTA to growth screen
- `first_entry` — metrics selected but no data → prominent entry form
- `building` (1–4 entries) — funnel strip + progress + mini table
- `active` (5+ entries) — full dashboard with WeakLinkCallout, stage cards, trend, sticky form

### Metric setup & AARRR recommendations
**`lib/metric-setup.ts`** — DB helpers for MetricSetup and MetricEntry.
**`lib/metric-catalog.ts`** — All metric definitions keyed by AARRR stage.
**`lib/integration-recommendations.ts`** — Maps metric keys → recommended providers.
**`lib/growth-metric-recommendations.ts`** — Pure TS, safe to import in client components.

---

## Integration OAuth flows

### GA4
1. `GET /api/integrations/google/link?productId=X` → redirects to Google OAuth
2. Google redirects to `GET /api/integrations/google/callback`
3. Tokens stored in `Integration.config` (JSON: `refresh_token, access_token, propertyId?`)
4. Property selection: `GET/PUT /api/integrations/[id]/ga4-properties`
5. Sync: `POST /api/integrations/[id]/sync` → calls `BrandLib/sync/ga4.ts`

### Stripe
1. `GET /api/integrations/stripe/link?productId=X` → redirects to Stripe Connect
2. Stripe redirects to `GET /api/integrations/stripe/callback`
3. Tokens stored in `Integration.config` (JSON: `stripe_user_id, access_token`)
4. Sync: `POST /api/integrations/[id]/sync` → calls `BrandLib/sync/stripe.ts`

### Integration states
`DISCONNECTED → CONNECTED(NEEDS_SETUP) → CONNECTED(SYNCED)` or `ERROR` or `STALE` (>48h since sync)

---

## Data sync
Both syncs write to the legacy `Metric` model (DAU, MRR, etc). The newer `MetricEntry` model is used by the AARRR dashboard and is filled via manual entry form (`POST /api/metrics`).

---

## Authentication
- NextAuth 4, Credentials provider, JWT session
- Sign-in path hardcoded to `/tr/login` in `lib/auth.ts`
- Access code required at signup: `TT31623SEN` (stored in `env.ACCESS_CODE`)
- Admin gate: `admin@tiramisup` — used in `/[locale]/admin/waitlist`

---

## Environment variables required

```bash
DATABASE_URL               # Supabase PgBouncer transaction mode URL — port 6543, ?pgbouncer=true&connection_limit=1&prepared_statements=false
DIRECT_URL                 # Supabase direct connection URL — port 5432 (used by Prisma for migrations)
NEXTAUTH_SECRET            # Any long random string
NEXTAUTH_URL               # https://tramisup.vercel.app (or http://localhost:3000)
ACCESS_CODE                # TT31623SEN
GOOGLE_CLIENT_ID           # For GA4 OAuth
GOOGLE_CLIENT_SECRET       # For GA4 OAuth
STRIPE_CLIENT_ID           # For Stripe Connect OAuth
STRIPE_SECRET_KEY          # For Stripe API calls
STRIPE_REDIRECT_URI        # https://tramisup.vercel.app/api/integrations/stripe/callback
GOOGLE_GENERATIVE_AI_API_KEY  # For AI coaching (Gemini)
```

> **Important:** `DATABASE_URL` must point to the PgBouncer **transaction mode** pooler (port 6543), not the direct connection. Direct connection (port 5432) goes in `DIRECT_URL`. Without this split, Vercel serverless functions hit `MaxClientsInSessionMode` and prepared statement errors.

---

## Running locally

```bash
npm install
npx prisma generate
npx prisma db push       # or migrate dev
npm run dev              # localhost:3000
```

Tests:
```bash
npx vitest run           # unit tests
npx playwright test --config=playwright-waitlist.config.ts  # E2E (needs dev server on :3000)
```

Build check:
```bash
npx tsc --noEmit
npx next build
```

---

## Production
- Deployed on Vercel (auto-deploy from main branch) at `https://tramisup.vercel.app`
- DB: Supabase eu-west-3, project `ojecebxxcbxrofnbkaae`
- Prisma datasource uses `url = DATABASE_URL` (pooler) + `directUrl = DIRECT_URL` (direct)
- If Supabase pauses (free tier, 7 days inactivity): resume from supabase.com/dashboard

---

## Design system

All UI follows the same token system:
- Background: `#f6f6f6` page, `#ffffff` cards
- Border: `#e8e8e8` default, `#eef1f2` subtle
- Text primary: `#0d0d12`, secondary: `#5e6678`, muted: `#8a8fa0`
- Accent teal: `#95dbda`, Accent pink: `#ffd7ef`, Accent green: `#75fc96`
- Border radius: cards `24px`, inner cards `18px`, buttons `full`, tags `full`
- Font sizes: eyebrow `11px tracking-[0.18em]`, body `13-14px`, headings `22-30px`

No Shadcn design language — Tiramisup has its own aesthetic. Avoid generic AI UI patterns.
