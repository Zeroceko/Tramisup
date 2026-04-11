# Engineering Handoff Notes

## Snapshot

This repo should be treated as a **live production system**, not a prototype sandbox.

- Production domain: `https://tiramisup.app`
- Current live app release: `80fbb9f5`
- Last docs refresh: `12 April 2026`
- Default locale: English
- Secondary locale: Turkish
- Public positioning: waitlist-first
- Main app purpose: founder workflow from onboarding to launch and growth
- Canonical overview doc: `HANDOFF.md`
- Canonical takeover prompt: `docs/team-handoff-prompt.md`

---

## What Is True Right Now

### Production behavior

- `main` is live on Vercel.
- Public landing still pushes waitlist, not open self-serve positioning.
- Signup no longer uses an early access code.
- Signup and waitlist both require email verification.
- Credentials login blocks unverified users.
- Onboarding supports file uploads and richer source/context ingestion.
- Product creation is now two-phase and async-plan based.
- Settings/account language switching now actually redirects to the chosen locale route.
- Billing remains demo/fake checkout behavior.

### Recent shipped commits on the live line

- `39563b2f` — onboarding uploads and email verification flow
- `7579757f` — lazy init fix for Supabase storage on Vercel
- `d05b97be` — mobile-only onboarding guidance fix
- `7c8bf648` — locale switch fix from settings/account
- `80fbb9f5` — growth workflow hardening with intake-driven setup

---

## The Most Important Changes Since The Older Handoff

### 1. Email verification is real now

Shipped and live:
- signup sends verification email
- waitlist join sends verification email
- verify endpoint exists
- resend verification endpoint exists
- invalid/used tokens land on a dedicated verify-email page
- unverified login is blocked

Relevant files:
- `app/api/auth/signup/route.ts`
- `app/api/auth/verify-email/route.ts`
- `app/api/auth/resend-verification/route.ts`
- `app/api/waitlist/join/route.ts`
- `app/[locale]/verify-email/page.tsx`
- `lib/auth.ts`
- `lib/email-verification.ts`

### 2. Rich onboarding context intake shipped

Shipped and live:
- Supabase Storage upload path
- file content extraction
- Google Drive URL scraping support
- better onboarding context assembly

Relevant files:
- `app/api/upload/route.ts`
- `lib/supabase-storage.ts`
- `lib/extract-file-content.ts`
- `lib/url-scraper.ts`
- `components/OnboardingWizard.tsx`

### 3. Product creation no longer waits on full plan generation

Shipped and live:
- create product fast
- trigger plan generation separately
- poll plan status

Relevant files:
- `app/api/products/route.ts`
- `app/api/products/[id]/generate-plan/route.ts`
- `app/api/products/[id]/plan-status/route.ts`
- `components/OnboardingWizard.tsx`

### 4. Several post-release production fixes already landed

- Supabase storage client no longer breaks Vercel build at module load
- non-mobile products no longer get store-submission advice
- settings/account locale change now navigates correctly

### 5. Growth workflow is now intake-driven

Shipped and live:
- Growth now separates:
  - `intake_needed`
  - `metric_setup_needed`
  - `baseline_needed`
  - `diagnosis_ready`
- a bounded growth intake now collects product-specific context before metric setup
- intake answers are stored in `Product.additionalContext`
- Metrics setup now reads that context and slightly personalizes recommendation copy
- source guidance is lighter and routes into Integrations instead of opening into a heavy inline panel
- Growth checklist now supports stronger execution details and direct task creation

Relevant files:
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

## Current Operational Risks

These are the main things the next team should know, but they are not active fires:

- **Billing is still fake.** Pricing UX is usable for testing, but real Stripe checkout is not the canonical live path.
- **Some copy is still not fully i18n-clean.** There are still a few hardcoded strings in authenticated areas.
- **Roadmap integrations are not production-complete.** Some integration surfaces are still UI-first placeholders.
- **`Product.launchGoals` is legacy.** Do not build new core logic on top of it.
- **Growth transition is cleaner now, but still worth founder-style smoke testing after future changes.**

---

## Environment / Infra Notes

### Required environment groups

- AI: `QWEN_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `GEMINI_API_KEY_2`
- auth/app: `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `NEXT_PUBLIC_APP_URL`
- DB: `DATABASE_URL`, `DIRECT_URL`
- email: `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- storage: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
- OAuth: Google + Stripe credentials
- public analytics / protection: GA + reCAPTCHA envs

### Important infra truths

- local dev must run on `:3002`
- `DATABASE_URL` must be PgBouncer
- `DIRECT_URL` must be direct Postgres
- the production DB is already aligned with the current code
- this repo historically used `prisma db push` more than a perfect migration history

---

## What The New Team Should Read

Recommended order:

1. `HANDOFF.md`
2. `CLAUDE.md`
3. `docs/team-handoff-prompt.md`
4. `docs/production-stabilization-board.md`
5. `docs/ai-agent-system-playbook.md`
6. `docs/product-intake-question-playbook.md`
7. `docs/internal-growth-rules.md`
8. `docs/growth-tactics-layer.md`
9. `docs/growth-transition-checkin-spec.md`

---

## What The New Team Should Test First

1. run local setup and `npx prisma generate && npx prisma db push`
2. walk signup -> verify email -> login
3. walk waitlist join -> verify email
4. create a fake product with onboarding, including file upload and context URLs
5. confirm plan generation completes
6. test language switch from settings/account in both directions
7. confirm a web-only SaaS product does not receive App Store / Google Play launch advice
8. verify the growth transition flow: intake -> metrics setup -> baseline -> diagnosis
9. verify pricing/billing behavior so the team explicitly understands it is still a demo checkout path

---

## Bottom Line

The project is in a much better place than the older handoff suggested.

This is no longer a stabilization emergency. The next team is inheriting a live, functioning product with a clear architecture, but they should still move carefully around:
- billing
- growth transition polish
- i18n cleanup
- legacy onboarding fields
- future integrations
