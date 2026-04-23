# Tiramisup External Handoff (2026-04-22)

This handoff is written to help a new team take over Tiramisup as a live production system.

## Quick facts

- Production: https://tiramisup.app
- Repo: Next.js 15 (App Router), React 19, TypeScript, Prisma, Supabase Postgres, NextAuth.
- Local dev port: `3002`
- Codex operating mode: `docs/CODEX_COMPANY_OPERATING_MODE.md`

## Codex operating mode

- Treat Tiramisup as a live production company, not a casual side project.
- Default company-week rule: `48 real hours = 1 Tiramisup company week` until real active users or a stable public launch.
- Prefer continuity, first-value proof, and measurable repeat usage over feature expansion.
- Use the Notion operating system and executive decision log before asking others to restate context.

## Current production truth (as of 2026-04-22)

1. Fresh signup is not yet trustworthy.
   - Production evidence (Apr 21-22) showed signup submit did not reliably redirect to `/verify-email`, `/dashboard`, or `/onboarding` within expected time.
2. Existing-account product creation can complete via UI, but onboarding-to-value is still weak.
   - Observed loop: product created summary -> Growth check-in/setup -> metrics setup -> tasks empty.
3. Growth diagnosis is intentionally gated on baseline data.
   - Growth becomes "diagnosis-ready" only after enough metric entries exist (see `lib/growth-readiness.ts`).
4. AI/task bridge is inconsistent across surfaces.
   - Launch tends to be more useful than Overview and Growth in live runs.
5. Root landing is intentionally waitlist-first. Evaluate the real landing surface at `/{locale}/yayinda`, not the waitlist capture surface at `/{locale}`.

## What to run (prod-like validation)

### 1) Verified account (recommended first)

Use an existing verified account to validate the core loop without relying on fresh signup:

```bash
E2E_BASE_URL="https://tiramisup.app" \
E2E_LOCALE="tr" \
E2E_EMAIL="<verified-account-email>" \
E2E_PASSWORD="<password>" \
npx playwright test --config playwright-prod.config.ts prod-founder-takeover --reporter=list
```

### 2) Fresh signup continuity (separate incident run)

Treat this as a separate validation track from the existing-account core loop.

If you use the repo’s existing scripts under `tmp/`, review them carefully first: some are designed for internal smoke runs and may contain assumptions (and in some cases hardcoded creds) that should not be reused blindly.

## “Where things live” (code map)

- Signup API: `app/api/auth/signup/route.ts`
- Verify email route: `app/api/auth/verify-email/route.ts`
- Signup UI: `app/[locale]/signup/page.tsx`
- Growth workspace + gating: `app/[locale]/growth/page.tsx`
- Metrics setup + entry states: `app/[locale]/metrics/page.tsx`
- Agent suggestions API: `app/api/agent/suggestions/route.ts`
- Agent panel UI: `components/AgentChatPanel.tsx`

## Release gates

There is a signoff runner that bundles basic gates:

```bash
node scripts/release-signoff.mjs --skip-deploy
```

It runs typecheck, unit tests, build, and (optionally) prod E2E if `E2E_EMAIL` is present.

## Notion execution board

Cross-functional hub:
- Tiramisup Delivery Hub: https://www.notion.so/349a251bad4881b7b3c5d06baec3a178

Execution database:
- Tiramisup Execution Board: https://www.notion.so/14dd308c3c354f28a9687fafc84fd402

Views created:
- Execution Board (group by workflow)
- Team Board
- Priority Queue
- Discipline Queue

Note: This board currently lives under a generic Notion parent page due to workspace constraints. Consider moving it under the team’s real home space once the new team is onboarded.

## Top risks for the new team

- Signup continuity (reCAPTCHA / rate limiting / redirect / prod env mismatch class of issues).
- Onboarding-to-value loop: too much setup before a first payoff; tasks empty feels like “nothing happened”.
- Surface consistency: AI guidance and suggestion-to-task creation should be reliably reachable where users expect it.
- Measurement clarity: setup vs first entry vs baseline-building must remain legible for a first-session founder.

## Non-goals for takeover week

- Avoid feature expansion before the core loop is proven.
- Avoid risky production operations (mass task creation, migrations without review, etc.).
