# Tiramisup - Team Handoff Document

**Date:** 11 April 2026
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

## 5. Completed Work (All Sprints)

### Sprint 0 - Production Safety (Done)
- **S0-1** Post-deploy smoke flow for product creation
- **S0-2** Deploy verification script (`npm run verify:deploy`)
- **S0-3** Metrics hydration fix (#418)

### Sprint 1 - Founder Trust (Done)
- **S1-1** Static recommendation cards replaced with context-driven cards from `/api/agent/suggestions`
- **S1-2** Founder summary deduplication via `tasksAreNearDuplicate`
- **S1-3** Checklist rationale visibility (Why / Done when / Next action inline hints)

### UX Audit (Done)
- Dashboard: stat cards reduced to 3, empty chart hidden when < 3 data points, "Workspace pulse" removed
- Metrics: trend chart requires >= 5 entries to show
- Growth: pre-launch state simplified, empty sections hidden when no data
- Agent panel: removed robotic greeting, shows skeleton then dynamic suggestions
- Site-wide: max-width constraint on both layout shells

### Sprint 2 - Historical Product Repair (Done)
- **S2-1** `POST /api/products/[id]/regenerate` — safe per-product plan rebuild, preserves completed items. Settings page has "Regenerate plan" button.
- **S2-2** `POST /api/admin/repair` — dry-run mode, before/after counts, max 10 products per call
- **S2-3** `planMeta` field on Product — persists `source` (ai/sanitized_ai/fallback), `generatedAt`, item counts on every seed

### Sprint 3 - Quality Loop (Done)
- **S3-1** `isPlanThin()` guard — rejects plans with <5 launch items, <3 tasks, or missing PRODUCT/TECH categories
- **S3-2** `GET /api/admin/plan-quality` — fallback rate, source breakdown, thin product list, launch count buckets
- **S3-3** `npm run release:signoff` — orchestrates all pre-release gates (tsc, vitest, build, verify:deploy, E2E smoke)

### CEO Audit Fixes (Done)
- `ChecklistSection`: English category labels added (was showing Turkish in EN locale)
- `ChecklistSection`: Non-functional `+` and `⋮` buttons removed, replaced with done/total counter
- `tasks/page.tsx`: Added CTA link to `/onboarding` on no-product empty state (was a dead-end)
- `GoalsSection`: Empty state now explains what goals do instead of generic "No goals yet"
- `dashboard/page.tsx`: `funnelOverall` wired to `buildFunnelHealthSummary` (TODO removed)

Full details: `docs/production-stabilization-board.md`

---

## 6. Remaining Work

**All planned sprints are complete.** The board is clear. Next work should be product-driven, not stabilization-driven.

Suggested next bets (not committed):
- Real billing integration (currently Stripe is demo mode)
- Remove remaining TR-first hardcoded copy in authenticated screens
- RevenueCat / App Store Connect integration (UI exists, backend not wired)
- `Product.launchGoals` field retirement (legacy — see technical debt)

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

# Full pre-release signoff (runs all gates in sequence)
npm run release:signoff

# E2E (needs dev server running on :3002)
npx playwright test --config=playwright-waitlist.config.ts

# Prod E2E founder smoke (needs credentials)
E2E_EMAIL=x@x.com E2E_PASSWORD=xxx npx playwright test --config playwright-prod.config.ts prod-founder-takeover

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

Transfer these to the new team before handing over:

### Accounts & Infra
- [ ] GitHub repo access (collaborator or ownership transfer)
- [ ] Vercel project access (`zerocekos-projects/tramisup`)
- [ ] Supabase project access (`ojecebxxcbxrofnbkaae`, eu-west-3)
- [ ] Google Cloud Console (OAuth client for GA4 integration)
- [ ] Stripe Dashboard (Connect app + API keys)
- [ ] Resend account (email sending — forgot-password + waitlist)
- [ ] Domain DNS (`tiramisup.app`)

### Environment Variables
Share all values from Vercel production settings:
```
QWEN_API_KEY, DEEPSEEK_API_KEY, GEMINI_API_KEY, GEMINI_API_KEY_2
NEXTAUTH_SECRET, NEXTAUTH_URL, ACCESS_CODE
DATABASE_URL, DIRECT_URL
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
STRIPE_CLIENT_ID, STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_REDIRECT_URI
OAUTH_CALLBACK_BASE_URL
RESEND_API_KEY, RESEND_FROM_EMAIL
NEXT_PUBLIC_GA_MEASUREMENT_ID
RECAPTCHA_ENABLED, NEXT_PUBLIC_RECAPTCHA_ENABLED, NEXT_PUBLIC_RECAPTCHA_SITE_KEY, RECAPTCHA_SECRET_KEY
NEXT_PUBLIC_APP_URL
```

### One-time Migration (run once after takeover)
The `planMeta` column was added to the `Product` table. Apply it to production:

**Option A — Supabase Dashboard → SQL Editor:**
```sql
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "planMeta" TEXT;
```

**Option B — CLI with direct connection:**
```bash
DIRECT_URL=<supabase-direct-url> npx prisma migrate deploy
```

After running, verify with:
```bash
npm run release:signoff --skip-build
```

**Supabase note:** Free tier pauses after 7 days of inactivity. Resume from supabase.com/dashboard if DB is unreachable.

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

---

## 16. Work In Progress — Pick Up Here

**Last updated:** 11 April 2026  
**Branch:** `main` (all changes committed — but some features require a Supabase migration before going live)

---

### 16a. Completed & Deployed

These are code-complete in `main` and type-check + tests pass (70/70):

| Feature | Files |
|---|---|
| Early access code removed from signup | `app/[locale]/signup/page.tsx`, `app/api/auth/signup/route.ts`, `__tests__/api/auth/signup.test.ts` |
| File upload to Supabase Storage | `app/api/upload/route.ts`, `lib/supabase-storage.ts` |
| PDF/DOCX/image content extraction | `lib/extract-file-content.ts` |
| Google Drive URL scraping support | `lib/url-scraper.ts` |
| Two-phase product creation (fast Phase 1 + async Phase 2) | `app/api/products/route.ts`, `app/api/products/[id]/generate-plan/route.ts`, `app/api/products/[id]/plan-status/route.ts` |
| Onboarding wizard: file upload + URL chips + polling loading screen | `components/OnboardingWizard.tsx` |
| Email verification infrastructure | `lib/email-verification.ts`, `app/api/auth/verify-email/route.ts`, `app/api/auth/resend-verification/route.ts` |
| Signup sends verification email | `app/api/auth/signup/route.ts` |
| Waitlist join sends verification email | `app/api/waitlist/join/route.ts` |
| Login blocks unverified users (bypass token for immediate post-signup) | `lib/auth.ts` |

---

### 16b. Requires Supabase SQL Migration (run before deploying)

Run these in Supabase Dashboard → SQL Editor:

```sql
-- File upload context fields on Product
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "additionalContext" TEXT;
ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "uploadedFiles" TEXT;

-- Email verification on User
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT UNIQUE;

-- Email verification on Waitlist
ALTER TABLE "Waitlist" ADD COLUMN IF NOT EXISTS "emailVerifiedAt" TIMESTAMP(3);
ALTER TABLE "Waitlist" ADD COLUMN IF NOT EXISTS "verificationToken" TEXT UNIQUE;
```

Then run `npx prisma generate` locally.

Also add to Vercel environment variables:
```
SUPABASE_URL=https://ojecebxxcbxrofnbkaae.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service_role_key>
RESEND_API_KEY=<key>
RESEND_FROM_EMAIL=Tiramisup <noreply@tiramisup.app>
```

The Supabase `product-uploads` bucket must exist (private). Already created on the project.

---

### 16c. Still Needs Building — Email Verification UX

The backend is complete but the UI still needs these pieces:

**1. `app/[locale]/verify-email/page.tsx`**  
A simple error landing page for when a verification token is invalid or expired.
- URL: `/{locale}/verify-email?error=invalid_token`
- Show: "This verification link is invalid or has already been used." + link back to login
- No auth required, plain page

**2. Login page: `email_not_verified` state**  
File: `app/[locale]/login/page.tsx`

Currently `handleSubmit` maps any `result?.error` to `t("errors.wrongCredentials")`. It needs to detect `"email_not_verified"` and show a different UI:

```tsx
if (result?.error === "CredentialsSignin") {
  // Check if it's email_not_verified — NextAuth wraps the thrown error
  // The actual thrown message becomes result.error after NextAuth processing
  // Use a dedicated error state: emailNotVerified = true
}
```

Note: NextAuth v4 swallows the original error message from `authorize()` and returns `"CredentialsSignin"` for all thrown errors. To pass the actual error code through, the workaround is:
- In `authorize()`, instead of throwing, return `null` and encode the error in a query param via a custom error redirect — OR use the `error` callback in NextAuth options — OR encode the error in the user object before returning null.

The cleanest approach for NextAuth v4:
```typescript
// In authorize(), instead of throw new Error("email_not_verified"):
// Return null but first set a server-side flag, then detect on client via:
// signIn() → result.error === "CredentialsSignin" + check a separate API endpoint
```

**Simplest working approach:**
1. Change `authorize()` to return `null` when email not verified (instead of throw)  
2. Before returning null, write a short-lived flag to a in-memory store or check via separate endpoint
3. On login page: after `signIn()` returns error, call `GET /api/auth/check-verification-status?email=x` to check if the user exists but is unverified
4. If yes, show the "verify email" state with resend button

**The resend button** calls `POST /api/auth/resend-verification` with `{ email, locale }` — endpoint already exists.

**3. i18n keys to add**

Add to `messages/en.json` and `messages/tr.json` under `"login"`:

```json
"errors": {
  "wrongCredentials": "Incorrect email or password",
  "generic": "An error occurred. Please try again.",
  "emailNotVerified": "Please verify your email before logging in.",
  "emailNotVerifiedHint": "Check your inbox for a verification link.",
  "resendVerification": "Resend verification email",
  "resendSent": "Verification email sent. Check your inbox."
}
```

**4. Signup success message**

After successful signup + auto-login, the user is immediately taken to onboarding. Consider showing a toast or banner: "Check your email to verify your account." No blocking needed since bypass token handles the first login.

---

### 16d. Architecture Notes for Email Verification

**Token flow:**
- Signup → `User.verificationToken` = 32-byte hex stored in DB
- Verification email contains: `{APP_URL}/api/auth/verify-email?token={hex}&type=user`  
- `GET /api/auth/verify-email` → sets `User.emailVerified = now()`, clears `verificationToken`, redirects to `/{locale}/login?verified=1`
- Login page detects `?verified=1` → shows green success banner (same pattern as `?reset=success`)

**Bypass token logic (existing, now wired up):**
- `createSignupBypassToken(email)` in `lib/signup-bypass.ts` — HMAC-signed, 5-minute TTL
- After signup API creates user, it returns `loginBypassToken`
- Signup page calls `signIn("credentials", { ..., signupBypassToken: data.loginBypassToken })`
- `authorize()` in `lib/auth.ts` now checks: if `!user.emailVerified` → verify bypass token → if invalid → throw `"email_not_verified"`
- This means first auto-login (within 5 min of signup) succeeds; all later logins require verification

**Waitlist token flow:**
- Join → `Waitlist.verificationToken` stored in DB
- Verification email: `{APP_URL}/api/auth/verify-email?token={hex}&type=waitlist`
- Click → sets `Waitlist.emailVerifiedAt = now()`, clears token, redirects to `/en/waitlist/thank-you?verified=1`
- The `waitlist/thank-you` page can optionally show "Email confirmed!" if `?verified=1` present
