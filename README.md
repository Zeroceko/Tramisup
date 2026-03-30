# Tiramisup

Tiramisup is a launch-to-growth workspace for startup teams. The current production setup is intentionally narrow: collect early demand on the public site, onboard approved users into the app, and guide them through a staged product workflow without overwhelming them.

**Production domain:** `https://tiramisup.app`
**Default language:** English
**Secondary language:** Turkish
**Last updated:** 30 March 2026
**Current status:** Production live

## Live routes

### Public marketing and legal
- `/en` and `/tr`: simplified waitlist-first landing page
- `/en/yayinda` and `/tr/yayinda`: preserved full landing page
- `/en/privacy` and `/tr/privacy`: privacy policy
- `/en/terms` and `/tr/terms`: terms
- `/en/waitlist/thank-you` and `/tr/waitlist/thank-you`: waitlist confirmation page

### Auth
- `/en/signup` and `/tr/signup`: early-access signup
- `/en/login` and `/tr/login`: login
- `/en/forgot-password` and `/tr/forgot-password`: password reset request
- `/en/reset-password` and `/tr/reset-password`: password reset form

### App
- `/en/dashboard` and `/tr/dashboard`
- `/en/onboarding` and `/tr/onboarding`
- `/en/settings` and `/tr/settings`
- `/en/integrations` and `/tr/integrations`
- `/en/growth`, `/en/metrics`, `/en/tasks`, `/en/pre-launch` and TR equivalents

## Production behavior

### Landing and waitlist
- Root marketing experience is the simplified waitlist page.
- The original long-form landing page is preserved on `/yayinda` and should stay intact unless intentionally redesigned.
- Waitlist signup sends a confirmation email.
- Public analytics are consent-aware.

### Auth and password rules
- Signup requires an early-access code.
- Current fallback access code: `TT31623SEN`
- Password rules are enforced in UI and backend:
  - minimum 8 characters
  - at least 1 number
  - at least 1 special character
- Forgot-password flow is live.
- Logged-in users can also change password from Settings.

### App language rules
- English is the source-of-truth language.
- Turkish is supported as a secondary locale.
- `defaultLocale` is `en`.
- Locale is persisted through `NEXT_LOCALE` and `User.preferredLocale`.

### OAuth and integrations
- Public app URL is `https://tiramisup.app`.
- OAuth callback base URL is currently separated via `OAUTH_CALLBACK_BASE_URL`.
- This was added to avoid Google and Stripe OAuth breakage when the public domain changed.
- Current production callback base is expected to remain compatible with whitelisted OAuth redirects.

## Key product rules

These are important and should not be casually changed:
- The product should feel staged and calm.
- Do not dump every system in front of the user at once.
- Growth answers: `Where is the weak link, what matters now, and what should we do next?`
- Metrics answers: `What do we measure, how does data get here, and what happened today?`
- Dashboard answers: `What is the next correct step right now?`
- Stay within:
  - `docs/ai-agent-system-playbook.md`
  - `docs/product-intake-question-playbook.md`
  - `docs/internal-growth-rules.md`
  - `docs/free-text-understanding-plan.md`
  - `docs/free-text-eval-rubric.md`
  - `docs/free-text-dataset-schema.md`
  - `docs/free-text-normalize-pipeline.md`
  - `docs/growth-tactics-layer.md`

## Current in-app information architecture

### Settings
- `Settings` is now the home for account, product, source, tracking, and security management.
- Top-level app nav no longer shows `Sources`.
- Inside `Settings`, the main categories are shown as top tabs:
  - Profile
  - Product
  - Sources
  - Tracking
  - Security
- Only the active settings section is shown at a time.

### Growth vs Metrics
- `Growth` is now a decision and execution surface.
- `Metrics` is now the measurement workspace.
- `Growth` should emphasize:
  - current weak link
  - next focus
  - evidence-aware recommendation
  - diagnosis-led tactical suggestions
  - checklist, goals, and routines
- `Metrics` should emphasize:
  - AARRR metric selection
  - source recommendations and source health
  - manual entry and trend history
  - data cadence / measurement system quality
- Do not re-merge these surfaces casually.

### Growth tactics layer
- `Growth` now includes a deterministic V1 tactics layer for launched and growing products.
- Tactics are diagnosis-led, not generic tip lists.
- Tactics should only appear when the product is out of pre-launch and measurement readiness is sufficient.
- V1 is intentionally narrow:
  - rendered only on `Growth`
  - maximum 3 tactics
  - each tactic explains `why now`, `how to start`, and `success signal`
- Keep tactic expansion inside the rules in `docs/growth-tactics-layer.md`.

### Launch visibility by stage
- `Launch` should not appear in top navigation for `LAUNCHED` or `GROWING` products.
- Launch artifacts may still exist in data, but the user-facing nav must remain stage-appropriate.

### Onboarding behavior
- `Category`, `Target audience`, and `Business model` support multi-select.
- Selecting `Other` opens a required clarification field.
- After stage selection, onboarding asks for the user’s current number-one priority.
- Product description guidance now explicitly tells the user this field is critical for understanding the product and generating a product-specific plan.
- AI-generated setup and task suggestions must remain stage-appropriate:
  - no launch-prep tasks for already launched / growing products
  - no generic AI advice outside the playbooks

### Free-text understanding
- Product description free text is now part of the normalized product context.
- The system extracts deterministic signals such as:
  - problem summary
  - user segments
  - pain points
  - value props
  - use cases
  - acquisition channel hints
  - monetization hints
- These signals are treated as inferred context and should be cross-checked against structured onboarding selections, not treated as unquestioned truth.

### Metric entry rules
- Manual metric entry should default to integers.
- Decimal entry is only allowed for revenue-style monetary metrics, currently:
  - `mrr`
  - `arpu`
- This rule is enforced in both UI and backend.

### Source recommendations
- Recommended source blocks inside `Metrics` are collapsible by default.
- Provider logos are rendered with `BrandLogo`.

## Important production systems

### Analytics
- Microsoft Clarity is integrated for public-site analytics and is consent-aware.
- GA4 is integrated and consent-aware.
- Current GA4 measurement ID is configured in production.
- Current public funnel events:
  - `waitlist_cta_click`
  - `waitlist_signup`
  - `thank_you_view`

### Email
- Waitlist confirmation emails are sent via Resend.
- Password reset emails are sent via Resend.
- Production sender uses the `tiramisup.app` domain.

### Legal
- Privacy and Terms pages are live and linked from the public site.
- Consent banner copy has already been adjusted for Turkish.

## Important environment variables

### Core app
- `NEXT_PUBLIC_APP_URL`
- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

### Database
- `DATABASE_URL`
- `DIRECT_URL`

### Email
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `RESEND_WAITLIST_SEGMENT_ID` optional

### Analytics
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- Clarity project ID is currently wired in code for the public site
- Current GA4 production stream measurement ID: `G-GEK1MNJM94`

### OAuth / integrations
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_CLIENT_ID`
- `STRIPE_SECRET_KEY`
- `OAUTH_CALLBACK_BASE_URL`

## Operational notes

### Known env hygiene issue that was fixed
Some Vercel env values had been saved with trailing `\\n` characters, which caused hard-to-diagnose issues, especially around database and app URLs. If anything starts behaving strangely again, inspect the raw env values first.

### Password reset implementation detail
Password reset is currently stateless. It does not rely on a password-reset DB table. The reset token is signed and becomes invalid after expiry or after the password changes.

### Local founder-flow caveat
Local founder-flow testing depends on a working database connection. If Prisma cannot reach the local database, signup and product creation flows will fail before app logic can be evaluated.

### Current known UX inconsistencies to keep in view
- Some locale-routed product surfaces still contain Turkish-first hardcoded copy.
- Local signup still asks for a product-type choice that is not currently submitted to backend state.
- Dashboard primary routing for launched products without metrics should remain under review so it does not blur the Dashboard vs Metrics boundary.

### Do not accidentally undo these routes
- Keep `/` as the waitlist-first landing page.
- Keep `/yayinda` as the preserved long-form landing page.
- Keep English as the default locale.

## Local development

```bash
npm install
npx prisma generate
npm run dev
```

Default local dev server:
- `http://localhost:3002`

## Validation commands

```bash
npm run build
npm run test:e2e:prod -- tests/e2e/prod-add-product.spec.ts
```

Release validation note:
- `npm run build` is currently the most reliable release gate.
- `npx tsc --noEmit` can false-fail in this repo when `.next/types` is stale or missing because of the current `tsconfig` include pattern.

## Recommended reading order for a new team
1. `README.md`
2. `HANDOFF.md`
3. `docs/handoff.md`
4. `docs/ai-agent-system-playbook.md`
5. `docs/product-intake-question-playbook.md`
6. `docs/internal-growth-rules.md`
7. `docs/free-text-understanding-plan.md`
8. `docs/free-text-eval-rubric.md`
9. `docs/free-text-dataset-schema.md`
10. `docs/free-text-normalize-pipeline.md`
11. `docs/growth-tactics-layer.md`
