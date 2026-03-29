# Tiramisup - Project Instructions

## Source of Truth Documents

Before making any changes to the AI layer, onboarding, recommendation system, or evidence map — read and follow these documents:

- [`docs/ai-agent-system-playbook.md`](docs/ai-agent-system-playbook.md) — defines the full AI agent architecture: normalized context → evidence map → recommendation engine → critic pass → structured output contract
- [`docs/product-intake-question-playbook.md`](docs/product-intake-question-playbook.md) — defines the intake question set, normalization rules, stage/goal enums, and onboarding UX guidelines

These are non-negotiable. Code must stay aligned with them.

---

## What Must Not Regress

1. No fake product/workspace created on signup — product data starts after the product creation wizard
2. Launched products must not feel trapped in pre-launch language or UX
3. Growth setup must stay calm and staged — one primary metric per AARRR category, not a giant form
4. Metric entry must remain tied to what the user selected in growth setup
5. Founder Coach must not speculate without evidence — no default "SEO kur" or "onboarding optimize et" type advice
6. User-written product description must remain central context for all AI calls
7. The app should guide, not lecture

---

## AI Agent System — Current State

The AI layer is fully implemented. Here is what exists:

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

### AI provider chain (lib/founder-coach.ts, lib/ai-advice.ts)
All AI calls fall through this chain in order — do not break this priority:
1. **Qwen** (`qwen-plus` via Alibaba Cloud MaaS) — fastest, cheapest
2. **DeepSeek** (`deepseek-chat`) — fallback if Qwen unavailable
3. **Gemini** (`gemini-2.0-flash`, `GEMINI_API_KEY`) — second fallback
4. **Gemini backup** (`gemini-2.0-flash`, `GEMINI_API_KEY_2`) — last resort

If all fail, static hardcoded fallback responses are returned — no crash, no unhandled error.

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

### Stage-awareness rule
Founder Coach is stage-aware: `PRE_LAUNCH` products must never receive GA4/growth tool suggestions — only launch blocker guidance.

### Onboarding wizard (components/OnboardingWizard.tsx)
Steps: `name → description → category → platform → stage → timing (pre-launch only) → business → audience → goal → sources (optional) → metrics (optional)`
- Platform is universal (Web, iOS, Android, Desktop, API, Multi-platform)
- Audience is structured selection (10 options from playbook)
- Goal sets both `growthGoal` (display label) and `goalKey` (normalized enum key)
- `goalKey` is serialized into `launchGoals` JSON field on the Product model
- `getActiveSteps(data)` computes which steps are active based on collected data
- Skip logic: timing only for PRE_LAUNCH, metrics skipped for very early stage
- UI is modal-style multi-phase onboarding (phase pills + compact action bar)
- If user selects `GA4` or `Stripe` in onboarding sources, successful product creation redirects to `/{locale}/integrations` with auto-open setup intent

---

## Known Architectural Shortcuts (Tech Debt)

### `Product.launchGoals` legacy field
`Product.launchGoals` is **no longer** the source of truth for metric setup or daily entries. Metric setup and daily entries live in `MetricSetup` and `MetricEntry` tables.

The `launchGoals` field is still used only for **legacy onboarding goal context** (`{ goalKey, growthGoal }`) and backward compatibility. Avoid building new logic on top of it. It should be removed in a future migration once fully retired.

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
- Prisma 6 (PostgreSQL via Supabase)
- NextAuth 4 (Credentials + JWT)
- Tailwind CSS 3
- next-intl (EN/TR internationalization)
- Vitest (unit tests) + Playwright (E2E)

---

## Language & Internationalization

- All pages are locale-prefixed: `/tr/...` and `/en/...`
- **Default locale: English (`en`)**
- Language preference is persisted in two places:
  - `NEXT_LOCALE` cookie (read by Next.js middleware for routing)
  - `User.preferredLocale` DB field (restored on next session)
- `components/LanguageSwitcher.tsx` — custom dropdown in the nav/landing that switches locale and updates the cookie
- `components/SettingsForm.tsx` — settings page language preference, writes to both cookie and DB via `PATCH /api/users/me`
- Auth: locale-aware routing — login redirects to `/{locale}/dashboard`, not hardcoded `/tr/`

---

## Architecture Overview

Tiramisup is a founder operating system — it helps early-stage product teams track launch readiness, growth metrics, and daily execution. Everything is product-scoped: one user can have multiple products, one active product at a time.

### Key domain concepts

| Concept | What it is |
|---|---|
| **Product** | The central unit. All data belongs to a product. |
| **LaunchChecklist** | Priority-ordered items a product must clear before launch. Linked to Tasks. |
| **Task** | Executable work item. Can auto-complete a linked LaunchChecklist item when done. |
| **MetricSetup** | AARRR funnel config per product — stored in `MetricSetup` table. |
| **MetricEntry** | Daily values for tracked metrics — stored in `MetricEntry` table. |
| **Integration** | OAuth connection to an external data source (GA4, Stripe). |
| **SyncJob** | Record of a data pull from an Integration. |
| **Routine** | Daily growth ritual with completion tracking. |

### Route structure

```
app/
  [locale]/           ← All pages are locale-prefixed (tr or en)
    dashboard/        ← Product overview + next action
    tasks/            ← Task execution queue (one main task surfaced first)
    pre-launch/       ← Launch checklist + readiness score
    metrics/          ← Adaptive growth metrics dashboard
    growth/           ← AARRR metric setup + growth management
    integrations/     ← Source connections (GA4, Stripe)
    onboarding/       ← Guided product creation wizard
    settings/         ← User profile + language preference
    admin/waitlist/   ← Admin-only waitlist management
  api/
    actions/          ← Task CRUD + completion cascade
    integrations/     ← OAuth flows + sync + validation
    products/         ← Product CRUD + AI insights
    metrics/          ← Metric entry + activation funnel
    routines/         ← Daily ritual completion
    users/me/         ← User profile + language preference update
```

### Active product selection

`lib/activeProduct.ts` — reads/writes a cookie `active_product_id`. All server pages call `getActiveProductId()` to scope data queries.

### Dashboard behavior rule
The dashboard answers one question: **"What is the next correct step for this product right now?"**

States:
- no product → welcome/orientation, CTA to create product
- pre-launch product → continue launch preparation
- launched product, no metric setup → set up tracking first
- launched product, setup but no data → make first metric entry
- launched product with data → review current progress

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
Also supports onboarding handoff query params (`onboarding`, `connect`, `queued`) to auto-open selected provider setup right after product creation.

### Onboarding
**`components/OnboardingWizard.tsx`** — Multi-step product creation (see wizard steps in AI Agent System section above).

**`app/[locale]/onboarding/page.tsx`** — Server wrapper with auth guard.

### Metrics dashboard
**`app/[locale]/metrics/page.tsx`** — Adaptive state based on data:
- `no_setup` — no metrics configured → CTA to growth screen
- `first_entry` — metrics selected but no data → prominent entry form
- `building` (1–4 entries) — funnel strip + progress + mini table
- `active` (5+ entries) — full dashboard with WeakLinkCallout, stage cards, trend, sticky form

### Metric setup & AARRR recommendations
**`lib/metric-setup.ts`** — All reads/writes to `MetricSetup`/`MetricEntry` tables (legacy JSON helpers retained for compatibility).
**`lib/integration-recommendations.ts`** — Maps metric keys → recommended providers.
Also exposes stage automation guides used by Growth setup to prioritize source-compatible metric choices.
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

### Roadmap integrations (UI visible, not functional yet)
RevenueCat, App Store Connect, Google Play Console, Meta Ads, Google Ads, TikTok Ads, AppsFlyer

---

## Data sync
Both GA4 and Stripe syncs write to the legacy `Metric` model (DAU, MRR, etc). These values are bridged into `MetricEntry` via `lib/sync-to-metric-entry.ts`.

GA4 sync supports modes through `/api/integrations/[id]/sync`:
- `overwrite`: mapped stage values are updated from GA4
- `missing_dates`: only fills dates that do not already have a `MetricEntry`

---

## Authentication
- NextAuth 4, Credentials provider, JWT session
- Login redirects to `/{locale}/dashboard` — locale-aware, not hardcoded to `/tr/`
- Access code required at signup: `TT31623SEN` (stored in `env.ACCESS_CODE`)
- Admin gate: `admin@tiramisup` — used in `/[locale]/admin/waitlist`

---

## Environment variables required

```bash
# AI provider chain (in priority order)
QWEN_API_KEY                # Primary — Qwen via Alibaba Cloud MaaS
DEEPSEEK_API_KEY            # Fallback 1 — DeepSeek
GEMINI_API_KEY              # Fallback 2 — Gemini 2.0 Flash
GEMINI_API_KEY_2            # Fallback 3 — Gemini backup key

# Auth
NEXTAUTH_SECRET             # Any long random string
NEXTAUTH_URL                # https://tramisup.vercel.app (local: http://localhost:3002)
ACCESS_CODE                 # TT31623SEN

# Database
DATABASE_URL                # Supabase PgBouncer transaction mode URL — port 6543, ?pgbouncer=true&connection_limit=1&prepared_statements=false
DIRECT_URL                  # Supabase direct connection URL — port 5432 (used by Prisma for migrations)

# Google OAuth (GA4 integration)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Stripe
STRIPE_CLIENT_ID            # For Stripe Connect OAuth
STRIPE_SECRET_KEY           # For Stripe API calls
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_REDIRECT_URI         # https://tramisup.vercel.app/api/integrations/stripe/callback

# App
NEXT_PUBLIC_APP_URL         # https://tramisup.vercel.app (local: http://localhost:3002)
```

> **Important:** `DATABASE_URL` must point to the PgBouncer **transaction mode** pooler (port 6543), not the direct connection. Direct connection (port 5432) goes in `DIRECT_URL`. Without this split, Vercel serverless functions hit `MaxClientsInSessionMode` and prepared statement errors.

---

## Running locally

```bash
npm install
npx prisma generate
npx prisma migrate dev    # or db push for quick sync
npm run dev               # runs on localhost:3002
```

> **Local port is 3002** — Google and Stripe OAuth redirect URIs are configured for port 3002. Do not run on 3000.

Tests:
```bash
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run   # unit tests (AI keys needed as dummy)
npx playwright test --config=playwright-waitlist.config.ts  # E2E (needs dev server on :3002)
```

Build check:
```bash
npx tsc --noEmit
npx next build
```

If dev becomes flaky, clear cache:
```bash
rm -rf .next && npm run dev
```

---

## Production
- Deployed on Vercel (auto-deploy from main branch) at `https://tramisup.vercel.app`
- Vercel project: `zerocekos-projects/tramisup`
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
- Zero emojis in UI — all decorative elements use inline SVG icons
- Brand logos for all integration providers in `components/BrandLogo.tsx` (inline SVG, no external deps)

No Shadcn design language — Tiramisup has its own aesthetic. Avoid generic AI UI patterns.
