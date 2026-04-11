# Tiramisup - Team Handoff Document

**Date:** 12 April 2026  
**Production:** `https://tiramisup.app`  
**Repo:** GitHub (`main` auto-deploys to Vercel)  
**Current live app release on `main`:** `80fbb9f5`  
**Status:** Live, stable, recently updated, handoff-ready

---

## 1. What Tiramisup Is

Tiramisup is a founder operating system for early-stage product teams.

It has two active faces:
- **Public site**: waitlist-first marketing surface on `/{locale}`
- **Authenticated app**: founder workflow for onboarding, launch prep, metrics, growth, tasks, settings, and integrations

Core product surfaces:
- **Dashboard**: answers "what should I do next?"
- **Tasks**: execution queue with structured task details and dedupe
- **Pre-Launch**: checklist, blockers, readiness, launch prep flow
- **Metrics**: AARRR setup, manual entry, source-backed trend tracking
- **Growth**: diagnosis-led growth workflow for launched products
- **Integrations**: GA4 / Stripe source connection setup
- **Settings / Account**: profile, locale, product context, billing, security
- **Onboarding**: staged product creation wizard

Everything is product-scoped. A user can have multiple products, one active at a time.

---

## 2. Current Production Truth

As of **12 April 2026**, these are true in production:

- `tiramisup.app` is live and serving the current `main` line.
- Public landing is still **waitlist-first**, not a fully open product homepage.
- Signup no longer requires an early access code.
- Signup and waitlist both use **email verification**.
- Onboarding supports **file upload**, **Google Drive / URL context**, and **async plan generation**.
- Locale preference is persisted to both DB and cookie, and settings-side language switching now redirects to the correct localized route.
- Billing is still **fake checkout / demo activation**, not real Stripe payments.
- AI guidance remains **stage-aware** and must not invent advice when evidence is weak.

Recent shipped commits now on the live line:
- `39563b2f` - onboarding uploads and email verification flow
- `7579757f` - Supabase storage lazy init for Vercel build safety
- `d05b97be` - mobile-only onboarding guidance fix
- `7c8bf648` - locale switch fix from settings/account
- `80fbb9f5` - growth workflow hardening with intake-driven setup

---

## 3. First-Day Setup

```bash
# 1. Clone
git clone <repo-url> && cd Tiramisup

# 2. Install
npm install

# 3. Copy envs
cp .env.example .env.local

# 4. Generate Prisma client
npx prisma generate

# 5. Sync schema
npx prisma db push

# 6. Start dev server
npm run dev

# 7. Verify
npx tsc --noEmit
npx next build
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

Important local rule:
- **Local dev runs on port `3002`**, not `3000`

Why it matters:
- Google and Stripe OAuth redirect settings are aligned to `localhost:3002`

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Auth | NextAuth 4 (Credentials + JWT) |
| i18n | next-intl (`en`, `tr`, default `en`) |
| AI | Qwen -> DeepSeek -> Gemini -> Gemini backup -> static fallback |
| Email | Resend |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Testing | Vitest + Playwright |

---

## 5. Architecture Overview

### Layout shells

There are two authenticated layout patterns:

- **`AgentLayoutShell`**: left-side agent panel + right-side content, used on Dashboard / Pre-Launch / Growth
- **`PlainPageShell`**: full-width content shell, used on Settings / Metrics / Integrations / Account-style pages

Both keep content constrained and intentionally calm.

### Locale structure

All pages are locale-prefixed:

```text
/en/...
/tr/...
```

Locale persistence lives in two places:
- `NEXT_LOCALE` cookie
- `User.preferredLocale`

Language can change from:
- nav language switcher
- settings/account language preference

### Product creation architecture

Current onboarding flow is two-phase:

1. **Fast product creation**
   - `POST /api/products`
   - creates product + stores base onboarding context quickly

2. **Async plan generation**
   - `POST /api/products/[id]/generate-plan`
   - kicks off AI-backed plan generation
   - `GET /api/products/[id]/plan-status`
   - polled by onboarding UI until plan generation completes

This prevents the onboarding submit from feeling blocked by heavy AI work.

### Source/context ingestion

Onboarding can now collect context from:
- free-text founder answers
- uploaded files
- normal URLs
- Google Drive URLs

Key files:
- `components/OnboardingWizard.tsx`
- `app/api/upload/route.ts`
- `lib/supabase-storage.ts`
- `lib/extract-file-content.ts`
- `lib/url-scraper.ts`

### AI pipeline

```text
Onboarding intake
  -> normalizeProductContext()
  -> buildEvidenceMap()
  -> getFounderCoachContext()
  -> evidence-readiness gate
  -> AI prompt
  -> sanitize output
  -> critic pass
  -> structured recommendations / plan output
```

Provider priority must not change:
1. Qwen
2. DeepSeek
3. Gemini
4. Gemini backup
5. static fallback

### Auth and verification

Current auth behavior:
- Signup creates the user without a product
- Signup sends verification email
- Waitlist join sends verification email
- Verify link lands through `/api/auth/verify-email`
- Unverified credentials login is blocked
- Resend verification endpoint exists

Key files:
- `app/api/auth/signup/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/resend-verification/route.ts`
- `app/api/waitlist/join/route.ts`
- `app/[locale]/verify-email/page.tsx`
- `lib/email-verification.ts`
- `lib/auth.ts`

---

## 6. What Was Recently Completed

### Production stabilization and quality board

All previously planned stabilization work is effectively complete:
- Sprint 0 safety work
- Sprint 1 founder-trust work
- UX audit cleanups
- Sprint 2 historical repair work
- Sprint 3 quality loop
- CEO audit fixes

Treat those as **done**, not pending.

### 11 April 2026 release line

This is the meaningful new work on top of the earlier board:

#### A. Signup and waitlist email verification
- Early access code removed from signup flow
- Signup now sends verification email
- Waitlist join now sends verification email
- Verify endpoint and resend endpoint are live
- Login blocks unverified users
- Verify-email page exists for invalid/used tokens

#### B. Rich onboarding context intake
- Supabase Storage upload route added
- PDF / DOCX / image extraction support added
- Google Drive URL support added to URL scraping
- Onboarding wizard now supports file uploads and context links in a richer way

#### C. Faster onboarding submit
- Product creation split into:
  - product create
  - async plan generation
  - plan-status polling
- Wizard shows a more resilient loading / preparation flow

#### D. Production fixes after release
- Supabase storage client changed to lazy init so Vercel build does not crash when envs are absent at build time
- Mobile-only launch guidance is no longer incorrectly shown to non-mobile web products
- Settings/account locale change now correctly moves the user onto the new locale route

### 12 April 2026 release line

#### E. Growth workflow hardening
- Growth now has explicit working modes:
  - `intake_needed`
  - `metric_setup_needed`
  - `baseline_needed`
  - `diagnosis_ready`
- launched products no longer drop directly into a mixed growth workspace before context and setup are ready
- a bounded growth intake now asks 3-5 product-specific questions before metric setup
- growth intake answers are stored inside `Product.additionalContext`
- Metrics setup now reads that context and slightly personalizes metric recommendations and setup copy
- source guidance is lighter-weight and now behaves like a contextual note that routes into Integrations instead of a heavy inline block
- Growth checklist now has stronger execution parity:
  - structured `Why / Done when / Next action`
  - expandable details
  - direct task creation
  - weak-link aware focus category

Key files for this release:
- `app/[locale]/growth/page.tsx`
- `app/[locale]/metrics/page.tsx`
- `app/[locale]/integrations/page.tsx`
- `app/api/products/[id]/growth-intake/route.ts`
- `components/GrowthChecklistSection.tsx`
- `components/GrowthTransitionCheckin.tsx`
- `components/MetricSetupSelector.tsx`
- `components/GrowthIntegrationRecommendations.tsx`
- `components/IntegrationsWorkspace.tsx`
- `lib/growth-transition-checkin.ts`
- `lib/growth-metric-recommendations.ts`
- `docs/growth-transition-checkin-spec.md`

---

## 7. Rules That Must Not Break

1. **No fake product on signup.** Product data begins only after onboarding.
2. **Launched products must not get pre-launch language.**
3. **Growth must stay diagnosis-led, not generic startup advice.**
4. **Metric entry must stay tied to configured metrics.**
5. **AI must not speculate without evidence.**
6. **User-written product description remains central context.**
7. **English is the master locale.** Default is `en`.
8. **`HIGH` priority means a true blocker only.**
9. **Recommendation cards create actions/tasks, not fake chat.**
10. **Public landing remains waitlist-first unless product explicitly decides otherwise.**
11. **Agent prompts stay in English internally; user-facing output follows locale.**
12. **Billing is not real payments yet. Do not present it as complete Stripe commerce.**

---

## 8. Database and Schema Reality

Current schema already includes live support for:

- `Product.additionalContext`
- `Product.additionalContext.growthCheckin` envelope on the live line
- `Product.uploadedFiles`
- `Product.planMeta`
- `User.emailVerified`
- `User.verificationToken`
- `Waitlist.emailVerifiedAt`
- `Waitlist.verificationToken`
- structured task columns and `TaskEvent`

Important operational note:
- this repo historically relied on `prisma db push`, not a pristine migration history
- if a new environment is created, the fastest safe path is:

```bash
npx prisma generate
npx prisma db push
```

For production, the current live database is already aligned with the shipped code.

---

## 9. Environment Variables

```bash
# AI
QWEN_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
GEMINI_API_KEY_2

# Auth / app
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL

# Database
DATABASE_URL
DIRECT_URL

# Email
RESEND_API_KEY
RESEND_FROM_EMAIL

# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY

# OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_REDIRECT_URI
OAUTH_CALLBACK_BASE_URL

# Analytics / bot protection
NEXT_PUBLIC_GA_MEASUREMENT_ID
RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

Important notes:
- `DATABASE_URL` must be the Supabase **PgBouncer** connection
- `DIRECT_URL` must be the direct Postgres connection
- `SUPABASE_SERVICE_ROLE_KEY` is required for server-side uploads
- early access / access-code env is no longer part of the signup flow

---

## 10. Known Debt and Open Bets

These are the main non-emergency follow-ups for the next team:

- **Real billing**: current checkout flow still behaves as demo activation
- **Some authenticated copy**: a few screens still carry hardcoded strings rather than clean next-intl coverage
- **Roadmap integrations**: RevenueCat, App Store Connect, Google Play Console, ads connectors are not fully wired
- **`Product.launchGoals`**: still a legacy field carrying onboarding goal context, not the long-term source of truth
- **TaskEvent visibility**: telemetry exists, but there is no strong product-facing analytics UI for it yet
- **Growth transition**: the new intake/setup/baseline separation is live, but founder-style manual walkthroughs should still be done after meaningful future changes

These are product bets, not production fires.

---

## 11. Verification Commands

```bash
npx tsc --noEmit
npx next build
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
npm run verify:deploy
npm run release:signoff
```

If local Next gets flaky:

```bash
rm -rf .next
npm run dev
```

---

## 12. Pre-Release Smoke Checklist

Before shipping any meaningful change, verify:

- `/en` and `/tr` both load
- signup works and sends verification mail
- login blocks unverified users and resend flow works
- waitlist join works and verification flow works
- onboarding creates a product successfully
- onboarding file upload works
- onboarding async plan generation completes
- non-mobile web products do not get App Store / Google Play launch advice
- settings/account language change actually moves to the new locale route
- dashboard shows stage-appropriate next action
- pre-launch / growth split is correct for the product stage
- metrics and integrations pages load without hydration or auth regressions

---

## 13. Recommended Reading Order

Read these in order:

1. `HANDOFF.md`
2. `CLAUDE.md`
3. `docs/handoff.md`
4. `docs/team-handoff-prompt.md`
5. `docs/production-stabilization-board.md`
6. `docs/ai-agent-system-playbook.md`
7. `docs/product-intake-question-playbook.md`
8. `docs/internal-growth-rules.md`
9. `docs/growth-tactics-layer.md`
10. `docs/growth-transition-checkin-spec.md`

---

## 14. Access Transfer Checklist

Transfer these before full ownership handoff:

### Infrastructure
- GitHub repo access
- Vercel project access
- Supabase project access
- Google Cloud Console access
- Stripe Dashboard access
- Resend account access
- domain / DNS access for `tiramisup.app`

### Production secrets
- all Vercel production environment variables
- confirmation of active OAuth callback URLs
- confirmation of Resend sender/domain status
- confirmation of Supabase Storage bucket existence and policy health

### Operational context
- current production baseline is `7c8bf648`
- `main` auto-deploys to Vercel
- `external/streamlined-solutions` is a nested repo and should be ignored during app work

---

## 15. Immediate Advice For The Next Team

If a new team starts tomorrow, the right first moves are:

1. verify local setup
2. walk the full founder journey in both locales
3. inspect the live billing path and decide whether to keep fake checkout or replace it with real Stripe
4. review onboarding quality using realistic product inputs
5. keep all new AI or onboarding changes aligned with:
   - `docs/ai-agent-system-playbook.md`
   - `docs/product-intake-question-playbook.md`

The system is no longer in rescue mode. The next team should treat it as a live product that needs careful product-led iteration, not broad architectural churn.
