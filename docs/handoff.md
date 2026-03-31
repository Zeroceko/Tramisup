# Engineering Handoff Notes

## Snapshot

This repo is already in production and should be treated as a live system, not a prototype sandbox.

- Production domain: `https://tiramisup.app`
- Default locale: English
- Secondary locale: Turkish
- Main public goal: waitlist conversion
- Main app goal: staged launch-to-growth workflow
- Trusted production baseline commit: `626543d9`
- Last docs refresh: `1 April 2026`

## Non-obvious architecture choices

### Public domain vs OAuth callback base
The app intentionally separates public URLs from OAuth callback URLs.

Why:
- marketing and email links should use `tiramisup.app`
- Google/Stripe OAuth can break if callback domains drift from the ones whitelisted in provider dashboards

Implementation:
- public URL helpers come from `lib/app-urls.ts`
- callback URLs can use `OAUTH_CALLBACK_BASE_URL`

### Stateless password reset
Password reset does not use a Prisma reset-token table.

Why:
- avoids extra migration risk in production
- easier operationally
- existing links automatically become invalid when password changes

Implementation:
- `lib/password-reset.ts`
- `app/api/auth/forgot-password/route.ts`
- `app/api/auth/reset-password/route.ts`

### Shared password rules
The same password rules are reused across signup, reset, and in-app password change.

Implementation:
- `lib/password-rules.ts`
- `components/ui/PasswordChecklist.tsx`

## Public-site analytics

Current setup:
- Clarity: integrated on public site, consent-aware
- GA4: integrated on public site, consent-aware
- event coverage includes CTA clicks, waitlist signup, and thank-you page
- invisible reCAPTCHA is enabled in production on waitlist join, signup, and login

Do not casually move analytics scripts into authenticated product pages without an explicit product/privacy decision.

## Product rules that should survive team transition

- English remains the source-of-truth locale.
- `/` remains the simplified waitlist-first landing page.
- `/yayinda` remains the preserved fuller landing page.
- Dashboard/onboarding logic should stay aligned with:
  - `docs/ai-agent-system-playbook.md`
  - `docs/product-intake-question-playbook.md`
- Do not inflate the product with generic AI surfaces that are not grounded in those playbooks.
- `Growth` and `Metrics` now have intentionally different jobs:
  - `Growth` = evidence-aware next step, weak link, and execution focus
  - `Metrics` = metric definition, source setup, manual entry, and trend reading
- `Growth` now also contains a deterministic V1 tactics layer:
  - tactics are diagnosis-led
  - tactics are not generic startup tips
  - tactics appear only when stage and measurement readiness allow it
  - the current home for tactics is `Growth`, not `Metrics` or `Settings`
- `Launch` should stay hidden in top nav for launched/growing products.
- `Sources` should stay out of top nav and live under `Settings`.
- Free-text onboarding understanding is now part of normalized product context and should remain aligned with the related eval and normalization docs.
- Dashboard `Ask Tiramisup` should stay on the restored simple card baseline unless a new design is explicitly approved.

## Current production baseline to preserve

Canonical right now:
- `/` and `/{locale}` remain waitlist-first
- `/yayinda` remains the preserved fuller landing page
- `Growth` and `Metrics` stay separate surfaces
- `Launch` stays hidden in top nav for launched/growing products
- `Ask Tiramisup` on Dashboard is the restored simple right-side card
- public GA4 + Clarity remain consent-aware
- invisible reCAPTCHA remains production-only

Not canonical right now:
- local uncommitted settings/account work
- abandoned `Ask Tiramisup` launcher/blob experiments
- editor-specific config files
- temp CLI artifacts

## Current UI architecture notes

### Settings
- Settings now uses top category tabs instead of a long all-sections page.
- Only one settings category should be visible at a time.
- Current categories:
  - Profile
  - Product
  - Sources
  - Tracking
  - Security

### Metrics
- Recommended source suggestions are collapsible by default.
- Manual metric inputs accept integers by default.
- Decimal values are only allowed for monetary revenue metrics such as `mrr` and `arpu`.

### Onboarding
- Category, audience, and business model now support multi-select.
- Choosing `Other` reveals a clarification field.
- Onboarding asks for current top priority after stage selection.
- Product description guidance now explicitly asks for a concrete explanation because this field is used to build a product-specific plan.
- Skip/continue flows should remain product-first, not drop the user into generic AI surfaces without a product context.

### Growth
- The current V1 tactics layer is intentionally deterministic and narrow.
- Do not broaden it into a generic “tips feed.”
- If tactics expand later, keep the order:
  1. diagnosis
  2. tactic eligibility
  3. tactic ranking
  4. surface placement

## Quick smoke tests after any risky release

### Public
1. Open `/en`
2. Accept cookies
3. Submit waitlist email
4. Confirm thank-you page load
5. Check GA4 realtime if relevant
6. Confirm invisible reCAPTCHA does not break real-user submit

### Auth
1. Open `/en/forgot-password`
2. Request reset email
3. Open reset link
4. Set a password that satisfies rules
5. Log in with new password
6. Open `/en/settings` and change password again from the security section

### OAuth
1. Log in
2. Open `/en/integrations`
3. Start GA4 connect
4. Confirm redirect and callback complete successfully

### Local founder flow
1. Confirm local database is reachable before testing signup
2. Create a new account from `/en/signup`
3. Complete onboarding with a realistic free-text description
4. Confirm product creation succeeds
5. Review dashboard, growth, and metrics surfaces in sequence

### Dashboard regression guard
1. Open `/en/dashboard`
2. Confirm `Ask Tiramisup` appears as the simple right-side card, not an experimental launcher/blob
3. Confirm launched products without metric setup still route toward metric setup via Growth/Metrics logic
4. Confirm `Launch` is not shown in nav for launched/growing products

## If something breaks first

Check in this order:
1. Vercel production env values
2. Resend domain / API key health
3. OAuth provider whitelists and test-user settings
4. GA4 and Clarity consent gating
5. reCAPTCHA envs and verify behavior
6. Only then app code

## Current known product debt

- Some locale-routed product screens still contain Turkish-first hardcoded copy.
- Local signup and founder-flow testing fail early if Prisma cannot reach the local database.
- Signup still asks for a product-type selection that is not submitted to backend state.
- Dashboard-to-Metrics ownership still needs careful review for launched products that have no metric setup yet.
- The repo currently has local modified/untracked files around settings/account work and smoke scaffolding that are not part of the trusted production baseline.
- New teams must separate committed release truth from local workstation state before shipping anything.
