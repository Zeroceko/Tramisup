# Engineering Handoff Notes

## Snapshot

- Production domain: `https://tiramisup.app`
- Current active main line: through `58b950f6`
- Last docs refresh: `14 April 2026`
- Default locale: English
- Secondary locale: Turkish
- Public positioning: waitlist-first
- Canonical overview doc: `HANDOFF.md`
- Canonical takeover prompt: `docs/team-handoff-prompt.md`

---

## What Is True Right Now

### Production behavior

- `main` is live on Vercel and auto-deploys on push.
- Signup no longer uses an early access code.
- Signup and waitlist both require email verification.
- Clicking the verification link now auto-logs the user into the app; re-entering credentials is no longer required after verification.
- Credentials login still blocks unverified users.
- Onboarding supports file uploads, Google Drive / URL context, and async plan generation.
- Product creation remains two-phase and async-plan based.
- Settings/account language switching redirects to the chosen locale route.
- Billing remains demo/fake checkout behavior.
- Nav is stage-aware: pre-launch shows Launch, launched/growing shows Metrics + Growth.
- Launched/growing products without a growth check-in are gated at the dashboard and redirected to `/growth`.
- Growth diagnosis includes actual metric values and is locale-aware.
- Agent panel cards all create tasks; no "ask" cards remain.
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

### Recent shipped commits

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

The app workspace should be treated as a production repo with recent follow-up work already merged. Earlier "three local fixes" are no longer pending; they shipped alongside later board, admin, performance, and auth changes.

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

### 4. Authenticated app performance work shipped

- Request-scoped auth/product cache added
- Repeated route refreshes reduced
- Agent panel defaults to closed and lazy-loads on demand
- Authenticated app surfaces are visually lighter to reduce browser load
- Targeted DB indexes added for common authenticated queries
- Lightweight server perf logging added for slow authenticated routes

### 5. Products page and selector flow improved

- `/{locale}/products` is now a stronger portfolio-style workspace
- Product selector includes `Tümünü gör / View all products` and routes there directly

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

---

## Current Open Findings

### 1. Onboarding still needs one clean founder re-validation

- The AARRR exit race was addressed, but the full fresh-account path still needs a clean end-to-end validation
- Required path: create product → finish onboarding → land in the app without stale or confusing intermediate UI

### 2. Metrics setup clarity still needs verification on fresh launched products

- The metrics → growth bridge is stronger than before, but a fresh launched product still needs to prove setup state is always legible
- Required path: metric setup should feel distinct from first daily entry

### 3. `/dashboard` and `/tasks` remain the slowest authenticated pages

- Performance improved materially on 14 April, but those two routes still feel heaviest
- If users still report lag, continue with route/API timing and query profiling there first

### 4. Browser-side 500 resource errors were observed in founder simulation

- Previously seen on `/products/new`, `/growth`, and `/dashboard`
- Root cause still unknown; reproduce with network capture before changing behavior blindly

---

## Current Operational Risks

- **Billing is still fake.** Pricing UX is good enough for testing, but real Stripe checkout is not wired.
- **i18n gaps remain.** Some authenticated screens still carry hardcoded strings.
- **Roadmap integrations are still UI-first in places.**
- **`Product.launchGoals` is legacy.** Do not build new logic on top of it.
- **Founder continuity still needs validation.** The onboarding → metrics → growth loop has improved, but still needs clean fresh-user proof.
- **Email delivery latency still matters.** `RESEND_FROM_EMAIL` must be set to `Tiramisup <hello@tiramisup.app>`.
- **Email template redesign is live.** Preserve the structure in the current mail helpers unless intentionally revisiting email design.
- **Public repo secret history still matters.** Previously exposed credentials must still be treated as compromised outside the repo.

---

## Environment / Infra Notes

- Local dev must run on `:3002`
- `DATABASE_URL` must be PgBouncer (port 6543)
- `DIRECT_URL` must be direct Postgres (port 5432)
- `SUPABASE_SERVICE_ROLE_KEY` is required for file upload flow
- Production DB is aligned with current code
- `external/streamlined-solutions` is a nested repo; ignore for app work

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

## What To Test First

1. Local setup: `npm install && npx prisma generate && npx prisma db push`
2. `npx tsc --noEmit` and `npx next build` pass clean
3. `QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run` — non-waitlist tests pass
4. Sign up → verify email → auto-login → dashboard
5. Waitlist join → verify email flow
6. Create a product through onboarding with file upload and a context URL
7. Confirm async plan generation completes
8. Verify nav shows the right items for the product stage
9. Confirm launched product without growth check-in redirects to `/growth`
10. Complete growth check-in and confirm dashboard loads
11. Click an agent panel card and confirm it creates a task
12. Open `/{locale}/products` from the product selector `Tümünü gör / View all products` link
13. Verify board/task detail shows `Started` / `Completed` timestamps
14. Confirm allowlisted admin can open `/admin/overview`, non-admin cannot, and the admin tree is not indexed
15. Metrics daily entry on a fresh launched product should clearly distinguish setup vs first baseline
16. Save the first metric baseline and then open `/growth` — Growth should not claim there is no data
17. Overview / Launch / Growth: confirm the right content pane scrolls independently of the left agent sidebar
18. Overview / Launch / Growth: ask a free-form question and confirm `/api/agent/chat` returns a contextual answer
19. If users still report lag: profile `/dashboard` and `/tasks` first
