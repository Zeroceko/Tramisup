# Tiramisup Handoff

**Date:** 1 April 2026
**Production:** `https://tiramisup.app`
**Status:** Live and handoff-ready
**Trusted production baseline commit:** `626543d9`

## What is live right now

### Public site
- Simplified waitlist-first landing page is the production homepage.
- The original fuller landing page is preserved on `/yayinda`.
- Privacy and Terms are live.
- Consent-aware Clarity and GA4 are live on the public site.
- Production-only invisible reCAPTCHA is live on waitlist and auth flows.

### Waitlist
- Waitlist email collection is live.
- Waitlist confirmation emails are live via Resend.
- Thank-you page tracking is live.

### Auth
- Early-access signup is live.
- Login is live.
- Forgot password is live.
- Reset password is live.
- Change password from Settings is live.
- Password strength requirements are enforced in both UI and backend.

### Product app
- Dashboard, onboarding, integrations, growth, metrics, tasks, and settings are live.
- Dashboard and onboarding work should remain aligned with:
  - `docs/ai-agent-system-playbook.md`
  - `docs/product-intake-question-playbook.md`
- Current surface split:
  - `Growth` = recommendation + weak-link + execution surface
  - `Metrics` = measurement setup + source flow + manual entry + trends
  - `Settings` = account, product, sources, tracking, and security
- `Growth` now also includes a deterministic tactics layer:
  - max 3 tactics
  - diagnosis-led, not generic
  - hidden for pre-launch products
  - guarded by measurement readiness
- Dashboard `Ask Tiramisup` is currently the restored simple card version on the right side of Overview.
- New launcher/blob experiments were intentionally reverted and should not be treated as the approved baseline.

## Production routes that matter most

### Marketing / public
- `/en`
- `/tr`
- `/en/yayinda`
- `/tr/yayinda`
- `/en/privacy`
- `/tr/privacy`
- `/en/terms`
- `/tr/terms`

### Auth
- `/en/signup`
- `/tr/signup`
- `/en/login`
- `/tr/login`
- `/en/forgot-password`
- `/tr/forgot-password`
- `/en/reset-password`
- `/tr/reset-password`

### App
- `/en/dashboard`
- `/tr/dashboard`
- `/en/settings`
- `/tr/settings`
- `/en/integrations`
- `/tr/integrations`

## Critical implementation decisions

### 1. English is the master language
- Default locale is `en`.
- Turkish is secondary.
- Do not flip the source language back to Turkish.

### 2. Public domain and OAuth callback are intentionally separated
- Public app URL is `tiramisup.app`.
- OAuth callback base is separately configurable via `OAUTH_CALLBACK_BASE_URL`.
- This prevents Google/Stripe OAuth from breaking when the public domain changes.

### 3. Password reset is stateless
- No password-reset DB table is required.
- Reset links are signed.
- Links expire automatically.
- Links are invalidated when the password changes.

### 4. Waitlist root and preserved landing must remain separate
- `/` is now conversion-oriented.
- `/yayinda` is the preserved fuller page.
- Do not overwrite one with the other by accident.

### 5. Stage-appropriate navigation matters
- `Launch` should not appear in top navigation for `LAUNCHED` or `GROWING` products.
- `Sources` should not appear as a top-level app nav item.
- Source management now lives under `Settings`.

### 6. Metrics entry constraints are intentional
- Manual entries should be integers by default.
- Decimals are allowed only for revenue-style monetary metrics such as `mrr` and `arpu`.
- This is enforced in both client and backend to avoid dirty data.

### 7. Free-text onboarding understanding is now part of core product logic
- Product description free text is normalized into structured inferred context.
- This understanding feeds downstream AI planning and evidence mapping.
- Treat this as product logic, not decorative copy.

### 8. Growth tactics belong in Growth first
- Tactical advice should be diagnosis-led and stage-appropriate.
- `Growth` is the primary home for tactics.
- `Metrics` can support tactic readiness, but should not become a channel-tip surface.
- `Settings`, auth, and public landing should not become tactic surfaces.

### 9. Do not ship from the dirty worktree by accident
- This repo currently has local modified/untracked files that are not the trusted production baseline.
- Especially watch:
  - `app/[locale]/settings/page.tsx`
  - `app/api/settings/route.ts`
  - `components/SettingsForm.tsx`
  - `components/SettingsWorkspace.tsx`
  - untracked `app/[locale]/account/`
  - untracked `components/AccountWorkspace.tsx`
  - local smoke/spec scaffolding
- Before release, compare staged/committed code against the deployed baseline instead of assuming local files are canonical.

## Files new teams should inspect first

Before starting, use `docs/team-handoff-prompt.md` as the default takeover brief for any new dev/product team.

### Product and routing
- `app/[locale]/page.tsx`
- `app/[locale]/waitlist/page.tsx`
- `app/[locale]/yayinda/page.tsx`
- `middleware.ts`
- `i18n.ts`

### Auth
- `app/[locale]/signup/page.tsx`
- `app/[locale]/login/page.tsx`
- `app/[locale]/forgot-password/page.tsx`
- `app/[locale]/reset-password/page.tsx`
- `app/api/auth/signup/route.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`
- `app/api/auth/change-password/route.ts`
- `lib/password-rules.ts`
- `lib/password-reset.ts`
- `lib/auth.ts`
- `lib/signup-bypass.ts`

### Public analytics and waitlist
- `components/analytics/`
- `lib/analytics.ts`
- `lib/recaptcha.ts`
- `components/RecaptchaField.tsx`
- `app/api/waitlist/join/route.ts`
- `lib/resend-waitlist.ts`

### OAuth and app URLs
- `lib/app-urls.ts`
- `app/api/integrations/google/link/route.ts`
- `app/api/integrations/google/callback/route.ts`
- `app/api/integrations/stripe/link/route.ts`
- `app/api/integrations/stripe/callback/route.ts`

### Settings and security
- `components/SettingsForm.tsx`
- `components/SettingsWorkspace.tsx`

### Growth / metrics split
- `app/[locale]/growth/page.tsx`
- `app/[locale]/metrics/page.tsx`
- `components/GrowthTacticsPanel.tsx`
- `components/GrowthIntegrationRecommendations.tsx`
- `components/MetricEntryForm.tsx`
- `lib/growth-tactics.ts`
- `docs/growth-tactics-layer.md`

### AI context and onboarding understanding
- `components/OnboardingWizard.tsx`
- `lib/normalize-product-context.ts`
- `lib/ai-plan.ts`
- `lib/build-evidence-map.ts`
- `lib/founder-coach.ts`
- `docs/internal-growth-rules.md`
- `docs/free-text-understanding-plan.md`
- `docs/free-text-eval-rubric.md`
- `docs/free-text-dataset-schema.md`
- `docs/free-text-normalize-pipeline.md`

## Production env checklist

These should exist and be correct in Vercel production:
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `RECAPTCHA_ENABLED`
- `NEXT_PUBLIC_RECAPTCHA_ENABLED`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_CLIENT_ID`
- `STRIPE_SECRET_KEY`
- `OAUTH_CALLBACK_BASE_URL`

## Known operational lessons

### Vercel env hygiene
There was a real production issue caused by env values saved with trailing `\\n` characters. If production starts behaving inexplicably, inspect the exact raw env values first.

### OAuth testing
If Google OAuth shows verification warnings, that is not a code bug by itself. It usually means either:
- test user not whitelisted in Google Cloud, or
- OAuth app verification is incomplete for broader access.

### Resend dependency
Forgot-password and waitlist confirmation emails depend on Resend being healthy and the sender domain staying verified.

### Server-to-client serialization
Do not pass functions from server components into client components in settings/dashboard composition. This caused a real runtime crash during the settings workspace refactor.

### Dashboard design regression lesson
- Several redesign passes were attempted on the `Ask Tiramisup` surface.
- The approved fallback is the restored simple card.
- Any future redesign should happen in preview first, not directly on the live dashboard.

### Local E2E caveat
Local founder-flow tests depend on a working database connection. If Prisma cannot reach the local database, signup will fail with a server error before product-flow UX can be evaluated.

### Current product debt worth keeping visible
- Some locale-routed app screens still contain Turkish-first hardcoded copy.
- Signup currently asks for a product-type selection that is not sent to the backend.
- Dashboard routing for launched products without metrics still needs careful review so Metrics ownership stays clear.
- Local settings/account work is currently ahead of the trusted production baseline and must be reviewed before shipping.

## Safe next steps for a new team
1. Validate the live `Growth` tactics layer with real founder flows before expanding tactics into other surfaces.
2. Refine settings polish and tab interaction without re-expanding all sections at once.
3. Improve locale consistency so English stays the master language across app surfaces.
4. Tighten dashboard and onboarding flow details while staying inside the playbooks.
5. Add better event naming and funnel reporting in GA4.
6. Clean the dirty worktree and separate local experiments from the committed release line.
