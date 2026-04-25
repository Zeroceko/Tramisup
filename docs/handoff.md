# Engineering Handoff Notes

## Snapshot

- Production domain: `https://tiramisup.app`
- Current active main line: through `0516fa56`; the next pushed release contains the 25 April Metrics founder-view cleanup
- Last docs refresh: `25 April 2026`
- Default locale: English
- Secondary locale: Turkish
- Public positioning: waitlist-first
- Canonical overview doc: `HANDOFF.md`
- Canonical takeover prompt: `docs/team-handoff-prompt.md`

---

## What Is True Right Now

### Production behavior

- `main` is live on Vercel and auto-deploys on push.
- The latest pre-release main commit is `0516fa56`; the 25 April release adds source-aware Metrics behavior for GA4/Stripe-connected founders.
- Signup no longer uses an early access code.
- Signup and waitlist both require email verification.
- Clicking the verification link now auto-logs the user into the app; re-entering credentials is no longer required after verification.
- Credentials login still blocks unverified users.
- Onboarding supports file uploads, Google Drive / URL context, and async plan generation.
- Product creation remains two-phase and async-plan based.
- Settings/account language switching redirects to the chosen locale route.
- Billing remains demo/fake checkout behavior.
- Nav is stage-aware: pre-launch shows Launch, launched/growing shows Metrics + Growth.
- Metrics is source-aware: selected metrics covered by connected GA4/Stripe auto-sync support are removed from manual entry, and fully covered setups show a read-only founder tracking message instead of a daily input form.
- Metrics top-of-page copy now speaks to a founder trying to track signal: tracked / automatic / manual counts replace the old setup-heavy cards.
- Launched/growing products without a growth check-in are gated at the dashboard and redirected to `/growth`.
- Growth diagnosis includes actual metric values and is locale-aware.
- Agent surfaces are still inconsistent in live production checks: Launch remains useful, but Overview and Growth do not yet reliably expose reachable chat/task flows.
- Board is directly reachable from the authenticated header.
- Board rows and agent suggestion rows use a shared preview-first interaction model.
- Overview / Launch / Growth keep the agent column fixed while the right content pane scrolls independently.
- Admin ops panel is live under `/{locale}/admin/*` with overview, users, products, billing, AI usage, and waitlist views.
- Admin routes are protected by allowlisted email access and are excluded from indexing.
- Task lifecycle timestamps are now first-class data on the `Task` row: `startedAt` and `completedAt`.
- The products page has been redesigned, and the product selector now routes `Tümünü gör / View all products` to `/{locale}/products`.
- Authenticated app performance work is shipped: request-level caching, less route refresh churn, lazy/closed initial agent panel, lighter app surfaces, loading skeletons, and DB indexes.
- Free-form agent chat remains fixed after the 13 April production DB sync and route hardening.
- Plan upgrade from the product limit gate now returns the user to the product creation flow.
- Security cleanup from 13 April remains in place: local secret files are not tracked, and exposed Gemini/OpenAI production keys were rotated.
- Transactional email templates were redesigned on 14 April and are already live.
- GROWING-stage onboarding now includes a real inline AARRR setup instead of a lightweight preview.
- After a GROWING onboarding, the founder lands in a richer Growth kickoff instead of a generic overview.
- If onboarding starts GA4/Stripe setup for a GROWING founder, the integrations detour now returns to Growth kickoff.
- Pre-launch checklist locale handling and checklist-item task creation edge cases were fixed.
- Agent suggestion preview is hardened against malformed payloads.
- Agent panel refetch loop was removed to reduce browser churn when the panel is open.
- Main authenticated surfaces received EN/TR cleanup on 22 April so mixed-language leakage should no longer be treated as expected behavior.
- Google Ads tag `AW-18110097199` is live globally from `app/[locale]/layout.tsx`.
- `/{locale}/products` is no longer a storytelling/portfolio surface. If products exist, it should render a compact header, a header-level "new product" action, and only real product cards. The fake "new workspace" card was removed. Empty state should appear only when the account has zero products.

### Recent shipped commits

- 25 April Metrics founder-view release — hide unnecessary manual metric entry for covered sources and clean the founder summary
- `0516fa56` — fix release signoff regressions
- `edd82acb` — prepare release hardening and handoff updates
- 22 April local-worktree deploys — clean EN/TR leaks on app surfaces, install Google Ads tag, simplify products page, remove fake new-workspace card, tighten products header spacing
- `2dc2f428` — strengthen GROWING-stage onboarding kickoff with inline AARRR setup and Growth-first landing
- `9f00908d` — fix checklist locale handling, checklist task creation edge cases, and products spacing
- `e4f8c87a` — stop agent panel refetch loop
- `8287d451` — harden agent suggestion preview against malformed payloads
- `f2f3c6bf` — protect existing work during plan refresh
- `58b950f6` — auto-login after email verification
- `9fe09d82` — redesign password reset email to match the live brand system
- `35c47500` — redesign transactional email templates to match tiramisup.app
- `fb311038` — polish products page and wire product selector "view all" flow
- `15e4ab3f` — improve authenticated app performance
- `35213f9d` — reduce browser load on app surfaces
- `6b61e53f` — speed up route transitions and interactions
- `8fdd6b15` — tighten founder metric-to-growth flow
- `0099dd75` — add admin ops panel and task lifecycle tracking
- `e40b9cab` — harden agent/chat against missing AgentMessage table and DB timeouts
- `a49a57ce` — return to onboarding after upgrade from products/new limit gate

### Local workspace state

The app workspace should be treated as a production repo with recent follow-up work already merged. The only expected local dirt after the 25 April release should be unrelated nested-repo noise under `external/streamlined-solutions`.

Local dirt seen at handoff time is outside app code:

- `external/streamlined-solutions` is a nested repo and intentionally ignored for app work
- `.claude/worktrees/` contains local workspace artifacts and should not be committed
- `tmp/` contains scratch artifacts and should not be committed

---

## Key Changes Since Previous Handoff

### 1. Internal admin ops panel shipped

- Routes now live under `/{locale}/admin/*`
- Shared admin shell/nav for:
  - overview
  - users
  - products
  - billing
  - ai-usage
  - waitlist
- Data is server-side and Prisma-backed; no public API layer was added for v1
- Admin tree is protected from public indexing

### 2. Task lifecycle timestamps shipped

- `Task.startedAt` and `Task.completedAt` are canonical
- Status transitions now keep `startedAt` sticky and clear/rewrite `completedAt` correctly on reopen/complete
- Board and task detail surfaces show `Started` / `Completed` timestamps
- `TaskEvent` remains the audit trail

### 3. Founder metric-to-growth flow tightened

- Metric setup save path now resolves more cleanly
- First baseline entry flows into Growth more reliably
- Fallback recommendation cards prevent empty advisory states
- Growing-state visibility in the dashboard/overview is stronger than before
- Metrics now distinguishes source-covered metrics from manual-only metrics, so GA4-connected founders are not asked to manually enter values the app can already sync
- Fully source-covered setups should read as a tracking dashboard, not a data-entry chore

### 4. Authenticated app performance work shipped

- Request-scoped auth/product cache added
- Repeated route refreshes reduced
- Agent panel defaults to closed and lazy-loads on demand
- Authenticated app surfaces are visually lighter to reduce browser load
- Targeted DB indexes added for common authenticated queries
- Lightweight server perf logging added for slow authenticated routes

### 5. Products page behavior was corrected

- `/{locale}/products` should now behave like a plain product index, not a portfolio-style workspace
- Product selector includes `Tümünü gör / View all products` and routes there directly
- If products exist, show only real product cards plus the compact header action
- If no products exist, show a single empty-state card

### 6. Email verification now leads straight into the app

- Verification route now creates a short-lived auto-login token
- Login route consumes that token and signs the user in automatically
- User no longer needs to re-enter email/password after clicking the verification link

### 7. Transactional email templates were redesigned

- Files:
  - `lib/email.ts`
  - `lib/email-verification.ts`
  - `lib/password-reset.ts`
- Preserve the current HTML structure and brand system unless there is a deliberate email-design change
- `process.env.RESEND_FROM_EMAIL` remains the required sender source

### 8. GROWING-stage onboarding got a new first-run path

- Selecting `GROWING` in onboarding now requires one metric choice for each AARRR stage
- The founder’s exact onboarding metric choices are persisted and saved into `MetricSetup`
- The first landing target for that founder is now `/{locale}/growth?onboarding=1`
- Growth kickoff explains what is already done, shows the chosen AARRR signals, and keeps the short check-in requirement
- After that check-in, the founder should move naturally toward the first baseline instead of being bounced back through setup confusion

---

## Current Open Findings

### 1. Fresh founder continuity is still the biggest product risk

- A portfolio-based production persona run succeeded across five founder personas on existing products
- A 22-April live new-user run still failed at signup submit: the page did not redirect to `/verify-email`, `/dashboard`, or `/onboarding` within the timeout after password entry
- A 21-April handoff stated the reCAPTCHA blocker was resolved, but current production evidence is mixed enough that takeover should treat fresh signup as **unproven**, not fixed
- Existing-account product creation now completes through the UI, but the user still lands in a setup loop instead of an obvious first value moment

### 2. Metrics source-aware founder view needs production freshness validation

- The metrics → growth bridge is stronger than before, and the 25 April release removes unnecessary manual entry when selected metrics are covered by connected sources
- A fresh launched product still needs to prove setup state is always legible and that GA4 sync data appears quickly enough after connection
- On 22 April, a real existing account created a launched product and saw:
  - product created summary
  - CTA into metric setup
  - Growth asking for a short check-in before setup can help
  - Metrics still showing `0` selected metrics and `0` entries
  - Tasks still empty
- Required path: metric setup should feel distinct from first daily entry, and the user should hit a real payoff before being asked for more setup
- Required path now: GA4-connected founders should see automatic coverage, recent entries, and trends without being asked to retype GA4-derived numbers

### 3. `/dashboard` and `/tasks` remain the slowest authenticated pages

- Performance improved materially on 14 April, but those two routes still feel heaviest
- If users still report lag, continue with route/API timing and query profiling there first

### 4. Browser-side 500 resource errors were observed in founder simulation

- Previously seen on `/products/new`, `/growth`, and `/dashboard`
- Root cause still unknown; reproduce with network capture before changing behavior blindly
- A newer late-16-April `/products/new` run with an existing real account did **not** reproduce server `500` responses
- That run only showed several route-transition `net::ERR_ABORTED` requests on `_rsc` / navigation fetches
- So this issue remains open, but the evidence is now mixed and should be revalidated carefully before code changes

### 5. AI helpfulness and task creation are still not proven

- A focused live agent run on 21 April produced this split:
  - Overview: no visible suggestion cards and no reachable chat input
  - Growth: cards visible, but clicking did not produce a confirmed task count increase
  - Launch: context-aware answer still worked
- This means the product still cannot claim that AI reliably helps first-session users or that suggestion cards reliably convert into execution

### 6. New Growth kickoff still needs a clean end-to-end proof

- The new kickoff is live, but it still needs explicit validation that:
  - integrations return to Growth kickoff correctly
  - check-in completion flows into baseline cleanly
  - no stale metric-setup confusion appears after onboarding
- A new-product wizard run on a real existing account reached:
  - product name
  - description
  - category
  - platform
  - audience
  - business model
  - stage
- That run intentionally used `/{locale}/products/new` so it would create a **new product** instead of advancing an existing one
- It did not complete end-to-end yet because the temporary automation harness still needed wider option matching at later steps
- This is useful evidence for the takeover team: new-product flow is traversable partway on a real account, but still not yet fully proven

---

## Current Operational Risks

- **Billing is still fake.** Pricing UX is good enough for testing, but real Stripe checkout is not wired.
- **i18n regressions remain possible.** Major authenticated-surface EN/TR leaks were cleaned up on 22 April, but any new screen work should be checked in both locales before shipping.
- **Roadmap integrations are still UI-first in places.**
- **`Product.launchGoals` is legacy.** Do not build new logic on top of it.
- **Founder continuity still needs validation.** The onboarding → metrics → growth loop has improved, but still needs clean fresh-user proof.
- **Signup status is contradictory across docs and runs.** Treat fresh-signup reliability as an open incident until a clean live run proves otherwise.
- **AI/task bridge still needs proof.** Useful launch answers exist, but the overview/growth execution bridge is not yet dependable.
- **Email delivery latency still matters.** `RESEND_FROM_EMAIL` must be set to `Tiramisup <hello@tiramisup.app>`.
- **Email template redesign is live.** Preserve the structure in the current mail helpers unless intentionally revisiting email design.
- **Public repo secret history still matters.** Previously exposed credentials must still be treated as compromised outside the repo.
- **Notion release logging is part of release signoff now.** Every production version must update the canonical handoff page first: `https://www.notion.so/34ba251bad488125b83cd2dbc5d0a1c3`

---

## Environment / Infra Notes

- Local dev must run on `:3002`
- `DATABASE_URL` must be PgBouncer (port 6543)
- `DIRECT_URL` must be direct Postgres (port 5432)
- `SUPABASE_SERVICE_ROLE_KEY` is required for file upload flow
- Production DB is aligned with current code
- `external/streamlined-solutions` is a nested repo; ignore for app work
- If `npx tsc --noEmit` complains about missing `.next/types/*` files after route churn, regenerate `.next` first with `npx next build --no-lint` or clear `.next` and rerun

---

## What To Read First

1. `HANDOFF.md`
2. `CLAUDE.md`
3. `docs/team-handoff-prompt.md`
4. `docs/ai-agent-system-playbook.md`
5. `docs/product-intake-question-playbook.md`
6. `docs/internal-growth-rules.md`
7. `docs/growth-tactics-layer.md`
8. `docs/growth-transition-checkin-spec.md`

---

## Suggested Reading Order For Takeover

1. Read `HANDOFF.md` for the production truth and current product contract
2. Read this file as the engineering delta and open-findings layer
3. Inspect the signup / verification / auto-login flow in code and note the reCAPTCHA mismatch evidence
4. Inspect the `GROWING` onboarding, Growth kickoff, Metrics bridge, and task-creation path in code
5. Review fake billing, admin ops, and authenticated-app performance work as the current baseline
6. After the team shares the same mental model, decide what to validate or change next

### Current production harness

The latest handoff run used:

```bash
E2E_BASE_URL="https://tiramisup.app" \
E2E_LOCALE="tr" \
E2E_EMAIL="<verified-test-user-email>" \
E2E_PASSWORD="<verified-test-user-password>" \
node --env-file=.env.prod tmp/prod-new-founder-flow.mjs
```

Current behavior of this helper:

- logs in with an existing verified user
- opens `/{locale}/products/new`
- attempts a truly new product flow instead of progressing the active product
- saves screenshots and notes into `tmp/prod-new-founder-*`
- continues into Growth / Metrics / task continuity only if product creation finishes

This helper is recorded here for continuity only. It is not an instruction for the takeover team to run immediately.
