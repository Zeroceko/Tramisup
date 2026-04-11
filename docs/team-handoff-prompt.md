# New Team Handoff Prompt

Use the prompt below as the default kickoff brief for any new engineering or product team taking over Tiramisup.

---

```text
You are taking over the Tiramisup codebase and product.

Treat this as a live production system, not a prototype sandbox.

## First, read these files in order

1. HANDOFF.md
2. CLAUDE.md
3. docs/handoff.md
4. docs/production-stabilization-board.md
5. docs/ai-agent-system-playbook.md
6. docs/product-intake-question-playbook.md
7. docs/internal-growth-rules.md
8. docs/growth-tactics-layer.md
9. docs/growth-transition-checkin-spec.md

## What is true right now

- Production domain is https://tiramisup.app
- Current live app release on main is 80fbb9f5
- main auto-deploys to Vercel
- Public landing is waitlist-first
- Signup no longer uses an early access code
- Signup and waitlist both use email verification
- Unverified users are blocked at login
- Onboarding now supports file upload, richer URL context, and async plan generation
- Growth now starts with a bounded intake before metric setup when context is missing
- Growth workspace is now explicitly staged: intake -> metric setup -> baseline -> diagnosis
- Billing is still demo / fake checkout behavior, not finished real Stripe commerce
- English is the source-of-truth locale, Turkish is secondary

## Local setup checklist

Run these in order:

1. npm install
2. npx prisma generate
3. npx prisma db push
4. npx tsc --noEmit
5. npx next build
6. OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
7. npm run dev

Local dev runs on port 3002. Do not silently switch it to 3000 because OAuth settings depend on 3002.

## Product walkthrough you should do before changing anything

1. Sign up with a new account
2. Verify the email
3. Log in
4. Create a realistic fake product through onboarding
5. During onboarding, test file upload and at least one context link
6. Confirm async plan generation completes
7. Review Dashboard, Pre-Launch, Metrics, Growth, Settings, and Integrations
8. Change the account language in settings and confirm the route actually moves to the chosen locale
9. Join the waitlist with another email and verify that flow too

## Architecture concepts you must understand

LAYOUT
- AgentLayoutShell is used for Dashboard / Launch / Growth
- PlainPageShell is used for Settings / Metrics / Integrations / Account-style screens

LOCALE
- All app routes are locale-prefixed: /en/... and /tr/...
- Locale preference is stored in NEXT_LOCALE cookie and User.preferredLocale

PRODUCT CREATION
- Product creation is now two-phase:
  - POST /api/products
  - POST /api/products/[id]/generate-plan
  - GET /api/products/[id]/plan-status
- This split is intentional and should not be collapsed casually

CONTEXT INGESTION
- Founder text, URLs, Google Drive links, and uploaded files can all feed product context
- Key files:
  - components/OnboardingWizard.tsx
  - app/api/upload/route.ts
  - lib/supabase-storage.ts
  - lib/extract-file-content.ts
  - lib/url-scraper.ts

AI RULES
- Provider order must stay: Qwen -> DeepSeek -> Gemini -> Gemini backup -> static fallback
- AI must not speculate when evidence is weak
- Stage awareness is mandatory
- User-written product description is central context

AUTH / VERIFICATION
- Signup sends verification mail
- Waitlist join sends verification mail
- Login blocks unverified accounts
- Resend verification exists

GROWTH WORKFLOW
- Growth is no longer one mixed workspace
- The current staged model is:
  - intake_needed
  - metric_setup_needed
  - baseline_needed
  - diagnosis_ready
- Growth intake answers are stored in Product.additionalContext
- Metrics setup now reads that context
- Integrations surfaces source guidance as a lighter contextual layer

## Rules that must not regress

1. No fake product on signup
2. Launched products must not see pre-launch UX
3. Growth guidance must stay diagnosis-led, not generic startup advice
4. Metric entry must remain tied to configured metrics
5. AI must not invent guidance when evidence is weak
6. English remains the master locale
7. HIGH priority means a real blocker only
8. Public landing remains waitlist-first unless a product decision changes it
9. Billing must not be misrepresented as complete real checkout

## Current known debt

- Billing is still fake checkout / demo activation
- Some authenticated copy is still not fully clean next-intl coverage
- Product.launchGoals is legacy and should not become a new source of truth
- Some roadmap integrations are UI-first and not fully wired
- Growth transition polish is improved but should still be founder-tested after meaningful changes

## Before any production release

1. npx tsc --noEmit
2. npx next build
3. OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
4. Manual smoke:
   - /en and /tr load
   - signup + email verification
   - waitlist + email verification
   - onboarding create + file upload + async plan generation
   - settings/account locale change
   - non-mobile products do not get App Store / Google Play guidance
   - growth intake -> metrics setup -> baseline -> growth diagnosis path feels coherent
5. npm run verify:deploy

## Important warnings

- DATABASE_URL must be PgBouncer and DIRECT_URL must be direct Postgres
- SUPABASE_SERVICE_ROLE_KEY is required for server-side upload flow
- Do not instantiate provider SDK clients at module top level in route handlers
- external/streamlined-solutions is a nested repo and should be ignored for app handoff decisions
- Do not assume older handoff docs are correct unless they match HANDOFF.md and the current live commit

When in doubt, preserve the current production baseline, document the tradeoff, and change one surface at a time.
```
