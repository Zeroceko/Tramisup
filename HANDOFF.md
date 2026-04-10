# Tiramisup - Team Handoff Document

**Date:** 10 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (main branch auto-deploys to Vercel)
**Status:** Live, stable, handoff-ready
**Current HEAD:** `20c7c811`

---

## 1. What is Tiramisup?

Tiramisup is a founder operating system for early-stage product teams. It helps founders track launch readiness, growth metrics, and daily execution. Everything is product-scoped: one user can have multiple products, one active at a time.

Core surfaces:
- **Dashboard** - "What should I do next?" single-question answer
- **Tasks** - Execution queue with smart prioritization
- **Pre-Launch** - Launch checklist with readiness scoring
- **Metrics** - AARRR funnel setup, manual entry, trends, source connections
- **Growth** - Diagnosis, weak-link detection, tactics, goals, routines
- **Settings** - Account, product, language, security

---

## 2. First-Day Setup

```bash
# 1. Clone the repo
git clone <repo-url> && cd Tiramisup

# 2. Install dependencies
npm install

# 3. Copy environment variables
cp .env.example .env.local
# Fill in all values - see "Environment Variables" section below

# 4. Generate Prisma client
npx prisma generate

# 5. Push schema to database (or run migrations)
npx prisma db push          # quick sync
# OR
npx prisma migrate dev      # full migration history

# 6. Start dev server (PORT 3002 - not 3000!)
npm run dev

# 7. Verify build
npx tsc --noEmit && npx next build

# 8. Run tests
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

**Local port is 3002.** Google and Stripe OAuth redirect URIs are configured for port 3002. Do not change this.

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Auth | NextAuth 4 (Credentials + JWT) |
| i18n | next-intl (EN/TR, default: English) |
| AI Providers | Qwen > DeepSeek > Gemini > Gemini backup > static fallback |
| Email | Resend |
| Analytics | GA4 + Microsoft Clarity (public pages only) |
| Bot Protection | reCAPTCHA v3 (production only, not on login) |
| Hosting | Vercel (auto-deploy from main) |
| Testing | Vitest (unit) + Playwright (E2E) |

---

## 4. Architecture

### Layout Shells

Two layout patterns for authenticated pages:

- **`AgentLayoutShell`** - Split panel: 360px agent chat on the left + content on the right. Used by Dashboard, Pre-Launch, Growth.
- **`PlainPageShell`** - Full-width content with `max-w-[1080px]` constraint. Used by Settings, Metrics, Tasks.

Both shells enforce `max-w-[1080px]` to prevent content from stretching across wide screens.

### Route Structure

```
app/
  [locale]/               # All pages locale-prefixed (en or tr)
    dashboard/            # Product overview + next action
    tasks/                # Task execution queue
    pre-launch/           # Launch checklist + readiness score
    metrics/              # AARRR metric dashboard
    growth/               # Growth diagnosis + execution
    integrations/         # Source connections (GA4, Stripe)
    onboarding/           # Product creation wizard
    settings/             # User profile + preferences
    admin/waitlist/       # Admin-only waitlist management
  api/
    actions/              # Task CRUD + completion cascade
    agent/                # AI chat + deterministic suggestions
    integrations/         # OAuth flows + sync + validation
    products/             # Product CRUD + AI insights
    metrics/              # Metric entry + activation funnel
    goals/                # Goal CRUD
    routines/             # Daily ritual completion
    users/me/             # User profile update
```

### AI Pipeline

```
Onboarding intake
  -> normalizeProductContext()       lib/normalize-product-context.ts
  -> buildEvidenceMap()              lib/build-evidence-map.ts
  -> getFounderCoachContext()        lib/founder-coach-context.ts
  -> evidence-readiness gate         lib/founder-coach.ts
  -> AI prompt (normalized context)  lib/founder-coach.ts
  -> sanitizeRecommendationOutput()  lib/founder-coach.ts
  -> applyCriticPass()               lib/founder-coach.ts
  -> CoachRecommendationOutput       rendered in components/AdvisorCard.tsx
```

AI provider fallback chain (do NOT change priority order):
1. **Qwen** (`qwen-plus` via Alibaba Cloud) - fastest, cheapest
2. **DeepSeek** (`deepseek-chat`) - first fallback
3. **Gemini** (`gemini-2.0-flash`, `GEMINI_API_KEY`) - second fallback
4. **Gemini backup** (`gemini-2.0-flash`, `GEMINI_API_KEY_2`) - last resort
5. **Static fallback** - hardcoded safe responses, no crash

### Task Creation Pipeline

```
AI/checklist trigger
  -> lib/task-completion-effects.ts    # Forward/reverse cascade
  -> app/api/actions/[id]/route.ts     # PATCH with effects
  -> components/TasksList.tsx          # Reads effects, shows toasts
```

Task completion can auto-complete linked checklist items and trigger milestone follow-ups (e.g., `ALL_HIGH_BLOCKERS_CLEARED`).

### Deterministic Suggestions

`/api/agent/suggestions` returns max 3 context-driven suggestion cards based on product state. No AI call - pure logic. These appear in the agent panel before any chat interaction.

---

## 5. Completed Work (Sprints 0, 1, UX Audit)

### Sprint 0 - Production Safety (Done)
- **S0-1** Post-deploy smoke flow for product creation
- **S0-2** Deploy verification script (`npm run verify:deploy`)
- **S0-3** Metrics hydration fix (#418)

### Sprint 1 - Founder Trust (Done)
- **S1-1** Static recommendation cards replaced with context-driven cards
- **S1-2** Founder summary deduplication via `tasksAreNearDuplicate`
- **S1-3** Checklist rationale visibility (Why / Done when / Next action inline hints)

### UX Audit Fixes (Done)
- Dashboard: stat cards reduced to 3, empty chart hidden when < 3 data points
- Dashboard: "Workspace pulse" filler card removed
- Metrics: trend chart requires >= 5 entries to show
- Growth: pre-launch state simplified to single centered message
- Growth: empty sections (Goals, Routines, Timeline, Tactics) hidden when no data
- Growth: source recommendations collapsed to single compact row
- Goals: verbose "Tracked areas" hint removed
- Agent panel: removed robotic initial greeting, shows skeleton loader then dynamic suggestions
- Site-wide: max-width constraint added to both layout shells

---

## 6. Remaining Work (Sprints 2 & 3)

### Sprint 2 - Historical Product Repair (Todo)
| ID | Item | Priority |
|---|---|---|
| S2-1 | Safe "regenerate plan" action for existing products | P1 |
| S2-2 | One-off admin repair path for broken historical products | P1 |
| S2-3 | Persist plan generation source metadata (ai/sanitized_ai/fallback) | P1 |

### Sprint 3 - Quality Loop (Todo)
| ID | Item | Priority |
|---|---|---|
| S3-1 | Minimum plan quality guard (reject thin plans) | P1 |
| S3-2 | Observability for plan quality and fallback rates | P2 |
| S3-3 | Routine founder walkthrough regression script | P2 |

Full details: `docs/production-stabilization-board.md`

---

## 7. Rules That Must Not Break

1. **No fake product on signup.** Product data starts after the onboarding wizard completes.
2. **Launched products must not see pre-launch language.** Stage-appropriate UI everywhere.
3. **Growth setup stays calm.** One primary metric per AARRR category, not a giant form.
4. **Metric entry is tied to what the user selected.** No free-form metric creation.
5. **AI must not speculate without evidence.** Low confidence -> data_collection fallback, no AI call.
6. **User's product description is central context for all AI calls.** Never override with generic text.
7. **English is the master language.** Default locale is `en`. Turkish is secondary.
8. **`HIGH` priority means true launch blocker only.** Compliance, security, store-review risks. Everything else is `MEDIUM`.
9. **Recommendations create tasks, not chat messages.** Action cards behave like actions.

---

## 8. Known Technical Debt

| Item | Details |
|---|---|
| `Product.launchGoals` field | Legacy. Only holds `{ goalKey, growthGoal }` from onboarding. Not source of truth for metrics. Should be removed in future migration. |
| Billing is fake | Stripe Checkout flow exists but is in demo mode. No real payments processed. |
| Some TR-first hardcoded copy | A few authenticated screens still have Turkish-first strings instead of using next-intl. |
| Roadmap integrations | RevenueCat, App Store Connect, Google Play Console, Meta/Google/TikTok Ads - UI visible but not functional. |
| Signup product-type selection | Collected in UI but not sent to backend. |
| `external/streamlined-solutions` | Nested repo, not part of main app. Ignore its git status. |

---

## 9. Environment Variables

```bash
# AI providers (in priority order)
QWEN_API_KEY                # Primary
DEEPSEEK_API_KEY            # Fallback 1
GEMINI_API_KEY              # Fallback 2
GEMINI_API_KEY_2            # Fallback 3

# Auth
NEXTAUTH_SECRET             # Long random string
NEXTAUTH_URL                # https://tiramisup.app (local: http://localhost:3002)
ACCESS_CODE                 # TT31623SEN (signup gate)

# Database
DATABASE_URL                # Supabase PgBouncer (port 6543, ?pgbouncer=true)
DIRECT_URL                  # Supabase direct (port 5432, for migrations)

# Google OAuth (GA4)
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET

# Stripe
STRIPE_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_REDIRECT_URI

# OAuth
OAUTH_CALLBACK_BASE_URL    # Separate from public URL to prevent OAuth breakage

# Email
RESEND_API_KEY
RESEND_FROM_EMAIL

# Analytics (public pages)
NEXT_PUBLIC_GA_MEASUREMENT_ID

# reCAPTCHA (production only)
RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY

# App
NEXT_PUBLIC_APP_URL         # https://tiramisup.app (local: http://localhost:3002)
```

**Critical:** `DATABASE_URL` must use PgBouncer transaction mode (port 6543). Direct connection (port 5432) goes in `DIRECT_URL` only. Without this split, Vercel serverless hits `MaxClientsInSessionMode` errors.

---

## 10. OAuth Flows

### GA4
1. `GET /api/integrations/google/link?productId=X` -> Google OAuth
2. Callback: `GET /api/integrations/google/callback`
3. Property selection: `GET/PUT /api/integrations/[id]/ga4-properties`
4. Sync: `POST /api/integrations/[id]/sync`

### Stripe
1. `GET /api/integrations/stripe/link?productId=X` -> Stripe Connect
2. Callback: `GET /api/integrations/stripe/callback`
3. Sync: `POST /api/integrations/[id]/sync`

### Integration States
`DISCONNECTED -> CONNECTED(NEEDS_SETUP) -> CONNECTED(SYNCED)` or `ERROR` / `STALE` (>48h)

**Warning:** If Google OAuth shows verification warnings, check test user whitelist in Google Cloud, not code.

---

## 11. Verification Commands

```bash
# Type check
npx tsc --noEmit

# Build
npx next build

# Unit tests (dummy keys needed for AI modules to load)
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run

# Deploy verification against production
npm run verify:deploy

# E2E (needs dev server running on :3002)
npx playwright test --config=playwright-waitlist.config.ts

# If dev becomes flaky
rm -rf .next && npm run dev
```

---

## 12. Pre-Release Smoke Test Checklist

Before any production deploy, manually verify:

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` succeeds
- [ ] All unit tests pass
- [ ] `/en` and `/tr` load correctly
- [ ] `/en/login` works (no reCAPTCHA on login)
- [ ] Create new product through onboarding wizard
- [ ] New product gets >= 5 launch checklist items
- [ ] No leaked product names from other products
- [ ] Dashboard shows correct next action for product stage
- [ ] Metrics page loads without hydration errors
- [ ] Growth page shows appropriate content for product stage
- [ ] Agent panel shows context-driven suggestions (not static cards)
- [ ] Task completion cascades correctly to checklist items

---

## 13. Document Reading Order

Read these in order to understand the full system:

1. **This file** (`HANDOFF.md`) - overview and setup
2. **`CLAUDE.md`** - detailed architecture, AI pipeline, design system, coding rules
3. **`docs/production-stabilization-board.md`** - sprint board with remaining work
4. **`docs/ai-agent-system-playbook.md`** - AI agent architecture specification
5. **`docs/product-intake-question-playbook.md`** - onboarding question set and normalization
6. **`docs/growth-tactics-layer.md`** - growth tactics design
7. **`docs/internal-growth-rules.md`** - growth logic rules

---

## 14. Access Transfer Checklist

Transfer these to the new team:

- [ ] GitHub repo access (collaborator or transfer)
- [ ] Vercel project access (`zerocekos-projects/tramisup`)
- [ ] Supabase project access (`ojecebxxcbxrofnbkaae`, eu-west-3)
- [ ] Google Cloud Console (OAuth client for GA4)
- [ ] Stripe Dashboard (Connect app + API keys)
- [ ] Resend account (email sending)
- [ ] Domain DNS (`tiramisup.app`)
- [ ] All `.env` values from Vercel production settings

**Supabase note:** Free tier pauses after 7 days of inactivity. Resume from supabase.com/dashboard if needed.

---

## 15. Design System (Quick Reference)

| Token | Value |
|---|---|
| Page background | `#f6f6f6` |
| Card background | `#ffffff` |
| Border | `#e8e8e8` |
| Text primary | `#0d0d12` |
| Text secondary | `#5e6678` |
| Text muted | `#8a8fa0` |
| Accent teal | `#95dbda` |
| Accent pink | `#ffd7ef` |
| Accent green | `#75fc96` |
| Card radius | `24px` |
| Inner card radius | `18px` |
| Buttons/tags | `rounded-full` |
| Eyebrow text | `11px`, `tracking-[0.18em]`, uppercase |

No emojis in UI. All decorative elements use inline SVG. No Shadcn - Tiramisup has its own aesthetic.
