# Engineering Handoff Notes

## Snapshot

This repo is already in production and should be treated as a live system, not a prototype sandbox.

- Production domain: `https://tiramisup.app`
- Default locale: English
- Secondary locale: Turkish
- Main public goal: waitlist conversion
- Main app goal: staged launch-to-growth workflow
- Trusted production baseline commit: `626543d9`
- Current live production line: `6237204b` (9 Apr 2026)
- Current repo handoff head: `acc151ed` (9 Apr 2026)
- Last docs refresh: `9 April 2026`
- Recommended new-team kickoff brief: `docs/team-handoff-prompt.md`
- Full-stack team transfer checklist: `docs/full-stack-team-transfer-checklist.md`
- Current sprint board: `docs/production-stabilization-board.md`

Recommended reading order for new teams:
- Test team: start at `How to verify the 8 April 2026 release`
- Dev team: start at `Post-release production follow-up`, then `Latest release`, then `Single canonical task creator`
- Product team: start at `What changed at a glance`

## Full-stack team transfer reality — 9 April 2026

This section is the shortest “what is true right now” snapshot for an incoming team.

### Live behavior

- `tiramisup.app` is serving the 9 April stabilization deploy.
- New pre-launch products now receive `5` launch checklist items instead of the older shallow `2`-item fallback.
- Duplicate / cross-product task explosion is fixed for newly created products.
- Founder smoke now verifies launch or growth checklist quality depending on product stage.
- Metrics hydration regression `React #418` was fixed in production.

### Important distinction for the incoming team

- `6237204b` is the current live application behavior baseline.
- `acc151ed` is the current repo handoff head and includes stronger production smoke assertions.
- Do not confuse `main` head with what is already live unless you confirm the active Vercel alias.

### Transfer package files

- `docs/full-stack-team-transfer-checklist.md` — access, secret, and release transfer checklist
- `docs/team-handoff-prompt.md` — default kickoff prompt for the incoming team
- `docs/production-stabilization-board.md` — current execution board
- `PROJECT_SNAPSHOT.md` — compact status snapshot

## Post-release production follow-up — late 8 April 2026

These changes shipped after the main 8 April release and are what a new dev team should treat as the **current live production behavior**.

Shipped commits:
- `e032aa86` — `Gate product limit before onboarding`
- `d0da9543` — `Remove login recaptcha gate`

### What changed after the main release

| Area | Before | After |
|---|---|---|
| Login | Credentials login still carried reCAPTCHA friction and live prod showed an invalid site key error during review | Login no longer requires reCAPTCHA |
| Product limit UX | Founder could finish onboarding and only then hit the free-plan product limit | `/[locale]/products/new` now gates immediately and points to pricing |
| Upgrade path | Pricing was still conceptually Stripe-backed | Choosing `Starter` / `Pro` currently activates the plan immediately |
| Billing CTA | Paid-plan management implied Stripe portal behavior | Billing CTA now pushes users back to plan selection |

### Files touched in the post-release follow-up

- `app/[locale]/login/page.tsx` — removed login-side reCAPTCHA field and client requirement
- `lib/auth.ts` — removed login-side server reCAPTCHA requirement
- `app/[locale]/products/new/page.tsx` — added pre-onboarding product-limit gate
- `app/[locale]/pricing/page.tsx` — enabled `Starter` / `Pro` CTAs and documented temporary immediate activation
- `app/api/billing/checkout/route.ts` — currently upserts an active subscription directly instead of opening Stripe Checkout
- `components/BillingUsage.tsx` — plan management CTA now routes to pricing

### Temporary product decision that is live right now

Billing is intentionally in a **fake checkout phase**:
- Selecting `Starter` or `Pro` does **not** open Stripe Checkout.
- `GET /api/billing/checkout` directly writes an active subscription row.
- This was done so founder testing could continue without payment friction.

Do not mistake this for finished billing. Before reopening real payments:
1. Restore Stripe Checkout behavior in `app/api/billing/checkout/route.ts`.
2. Re-test the portal flow from billing settings.
3. Reconfirm Vercel build still works with lazy Stripe init.

### Live production verification already completed

- Login page no longer renders reCAPTCHA on `https://tiramisup.app/tr/login`.
- Product-limit gate appears before onboarding on a full free-plan account.
- `Paketleri gör` routes correctly to pricing.
- Choosing `Starter` activates the plan and billing reflects `1 / 3` product capacity.
- After upgrade, `/tr/products/new` correctly opens onboarding instead of blocking.
- Realistic additional products were successfully created on production after the upgrade path was used.

### Founder-testing findings the new team should know

- **Do not skip onboarding answers in QA.** Context quality drops fast when founders skip or thin out description, audience, business model, sources, or AARRR setup.
- The current recommendation cards on Dashboard / Launch / Growth are still effectively static fallback copy. They are defined in `components/AgentChatPanel.tsx`, so do not assume they are proof of healthy product-context understanding.
- A live scripted probe saw `POST /api/agent/chat` abort during navigation churn. Treat chat quality as **not fully re-verified** in this handoff.
- The login reCAPTCHA was removed only for login. If the team wants to reintroduce it later, re-check the prod key configuration first; live review previously surfaced an invalid site key message.

## Latest release — 8 April 2026

This is the most recent shipped work. **Read this section first.** It includes a schema change that's already live in prod Supabase.

### What changed at a glance

| Area | Before | After |
|---|---|---|
| Task creation | 5 different surfaces, no shared validation | Single canonical `createTaskWithGuards` |
| Task structure | Free-text description; whyItMatters/doneCriteria parsed at runtime | First-class DB columns |
| Task category | Inferred from linked LaunchChecklist; standalone tasks fell into "Other" | Dedicated `category` column on Task |
| Task dedupe | Substring match in some surfaces, none in others | Semantic token-set match (TR+EN aware) in single chokepoint |
| Locale leakage | TR users could receive English suggestions | Heuristic detector + critic reject |
| Telemetry | Server-only Prisma counts | `TaskEvent` lifecycle stream |

### Schema migration (already applied to prod)

`prisma/schema.prisma` — pushed to prod via `prisma db push` on 8 April 2026.

**Task table additions:**
- `whyItMatters String?` — why this matters now (10–220 char target)
- `doneCriteria String?` — observable definition of done
- `nextAction   String?` — first concrete next step
- `source       String?` — `AI_PLAN | AGENT_CHAT | MANUAL | COMPLETION_EFFECT | FOUNDER_COACH`
- `category     String?` — `PRODUCT | MARKETING | LEGAL | TECH | ACQUISITION | ACTIVATION | RETENTION | REVENUE | MEASUREMENT`
- New index `Task_productId_category_idx`

That is 5 new columns on `Task` plus the new `TaskEvent` table.

**New TaskEvent table:**
```prisma
model TaskEvent {
  id        String   @id @default(cuid())
  taskId    String
  productId String
  eventType String   // CREATED | DEDUPED | DETAIL_OPENED | STARTED | COMPLETED | REOPENED | DISMISSED
  metadata  String?
  createdAt DateTime @default(now())
  task      Task     @relation(fields: [taskId], references: [id], onDelete: Cascade)
  @@index([productId, eventType, createdAt])
  @@index([taskId, createdAt])
}
```

> **Migrations note:** This repo gitignores `prisma/migrations/`. The workflow is `prisma db push` against `DIRECT_URL`. If `DIRECT_URL` isn't set, fall back: `DIRECT_URL="$DATABASE_URL" npx prisma db push --skip-generate`.

### Single canonical task creator — `lib/task-create.ts`

Every surface that produces a Task now goes through `createTaskWithGuards(input, db?)`:

1. **Validate** the candidate via [lib/task-validator.ts](lib/task-validator.ts) (unless `skipValidation: true` for manual entries).
2. **Dedupe** against existing OPEN tasks for the same product using semantic token-set match (`tasksAreNearDuplicate` from [lib/task-parsing.ts](lib/task-parsing.ts), ≥75% overlap, TR-aware lowercase, drops stop words like "set/kur/oluştur").
3. **Create** the row with structured columns + emit a `CREATED` `TaskEvent`. Dedupe path emits `DEDUPED` instead.

`tryCreateTaskWithGuards` is the no-throw variant for batch surfaces (AI plan seeding, completion-effects follow-ups).

**Surfaces wired through:**
- `lib/seed.ts` — AI plan seeding (`source: AI_PLAN`)
- `app/api/agent/chat/route.ts` — agent chat task actions (`source: AGENT_CHAT`)
- `app/api/actions/route.ts` POST — manual user-typed tasks (`source: MANUAL`, `skipValidation: true`)
- `lib/task-completion-effects.ts` — auto follow-up tasks (`source: COMPLETION_EFFECT`)
- Founder coach recommendation → task path (`source: FOUNDER_COACH`)

### Validator + parser — `lib/task-validator.ts`, `lib/task-parsing.ts`

- **Title rules:** min 12 chars, blocked filler patterns ("test task", "todo", "fix it" etc.)
- **Category whitelist:** 9 explicit values (no `OTHER` bucket, no model-invented categories)
- **Locale enforcement:** `looksTurkish` / `looksEnglish` heuristics — if requested locale is `tr` and the candidate looks English, the candidate is rejected with `wrong_locale`. Inverse for `en`.
- **Structured field rule:** `whyItMatters`, `doneCriteria`, `nextAction` are zod-validated to 10–220 chars in `lib/ai-plan.ts` `PlanSchema` — if the model returns shorter or longer, the candidate is dropped.

`filterValidCandidates(candidates, locale)` returns `{ valid, rejected }` and is used by AI plan post-generation pipeline. Rejected candidates are logged with reason but do not block the rest of the batch.

### TaskEvent telemetry — `lib/task-events.ts`

`emitTaskLifecycleEvent({ taskId, productId, eventType, metadata? })` writes one row. Event types:

| Event | Emitted by |
|---|---|
| `CREATED` | `createTaskWithGuards` (inside the create transaction) |
| `DEDUPED` | `createTaskWithGuards` when an existing task absorbs a candidate |
| `DETAIL_OPENED` | Client (TasksList) when the detail modal opens — fire-and-forget |
| `STARTED` | `PATCH /api/actions/[id]` on `TODO → IN_PROGRESS` |
| `COMPLETED` | `PATCH /api/actions/[id]` on `→ DONE` |
| `REOPENED` | `PATCH /api/actions/[id]` on `DONE → other` |
| `DISMISSED` | Client when founder closes a suggested task without acting on it |

`getTaskQualityReport(productId, daysBack = 30)` aggregates these into `{ counts, actionRate, dedupeSaveRate, completionRate }`. Exposed over HTTP at `GET /api/products/[id]/task-quality?days=30` (owner-scoped).

Client-emitted events go through `POST /api/actions/[id]/event` which only accepts `DETAIL_OPENED` and `DISMISSED` — server-observed transitions are NOT accepted from the client.

### Founder Coach hardening

- **Locale enforcement** in [lib/founder-coach.ts](lib/founder-coach.ts) and [lib/ai-advice.ts](lib/ai-advice.ts) — `locale` is now propagated end-to-end (server → AdvisorCard.tsx → CoachInsight.tsx → advice API GET query + POST body). Without this, TR users could receive English coach output.
- **Critic pass** rejects/revises recommendations on:
  - stage mismatch (e.g. `launch_blocker` on `early_growth`, `daily_action` on `launch_prep`)
  - low confidence + high priority
  - empty `supporting_evidence`
  - 3+ `missing_data` items at high confidence → downgrade to medium
  - supporting recs duplicating primary title → drop

### TasksList UI — [components/TasksList.tsx](components/TasksList.tsx)

- `Task` interface extended with `whyItMatters`, `doneCriteria`, `nextAction`, `category`, `source`.
- New helper `effectiveCategory(t)` — prefers `task.category`, falls back to linked checklist's category.
- New helper `resolveStructured(task)` — prefers DB columns, falls back to parsing the description (kept for legacy rows).
- `CATEGORY_CONFIG` expanded from 4 to **9 entries** (added ACQUISITION, ACTIVATION, RETENTION, REVENUE, MEASUREMENT).
- `CategoryFilter` now supports all 9 plus `NONE`.
- `openDetail(taskId)` fires `DETAIL_OPENED` (fire-and-forget) before opening the modal — used for the detail-open rate signal in `getTaskQualityReport`.

### Landing scroll fix

- `app/[locale]/layout.tsx` — removed `overflow-x-hidden` from body
- `app/[locale]/globals.css` — added `overflow-x: clip` on html instead

`overflow-x-hidden` on body created an unintended scroll context that interacted badly with the Hero's absolute-positioned rotated illustration, locking page scroll. `overflow-x: clip` on html clips horizontal overflow without creating a scroll context, leaving vertical scroll free.

### Vercel build fix — Stripe lazy init

`app/api/billing/checkout/route.ts`, `portal/route.ts`, `webhook/route.ts` previously instantiated `new Stripe(process.env.STRIPE_SECRET_KEY!)` at module load. During Vercel's "Collecting page data" build step the env var isn't injected, causing `Neither apiKey nor config.authenticator provided` and a hard build failure.

Fix: move Stripe construction into a `getStripe()` function called inside the request handler, and add `export const dynamic = "force-dynamic"` so Next doesn't try to prerender the routes.

**Lesson for new code:** never construct provider SDK clients at module top level in App Router route files. Always lazy-instantiate inside the handler.

---

## How to verify the 8 April 2026 release in production

### Task quality smoke test
1. Sign in, open `/en/tasks`.
2. Confirm category filter shows 9 categories (PRODUCT, MARKETING, LEGAL, TECH, ACQUISITION, ACTIVATION, RETENTION, REVENUE, MEASUREMENT).
3. Add a manual task with a 1-word title — should succeed (manual entries skip validation).
4. Open a task's detail modal — `DETAIL_OPENED` should appear in `TaskEvent` table.
5. Toggle `TODO → IN_PROGRESS` — `STARTED` event written.
6. Toggle to `DONE` — `COMPLETED` event written.
7. `GET /api/products/{productId}/task-quality?days=7` should return non-zero counts.

### AI plan dedupe + validation smoke test
1. Trigger AI plan generation for a fresh product.
2. Confirm logs show `[task-create] Skipped task "..."` for any rejected candidate (validator working).
3. Re-run plan generation — second pass should produce fewer new tasks because semantic dedupe absorbs equivalents (e.g. "Set up GA4" vs "GA4 kurulumu").
4. Confirm new Tasks have `whyItMatters`, `doneCriteria`, `nextAction`, `category`, `source: "AI_PLAN"` populated.

### Founder Coach locale smoke test
1. Switch user to Turkish in Settings.
2. Open advisor card on dashboard.
3. Confirm response is fully Turkish — no English fragments in `primary_recommendation.title` or `why_now`.

### Landing scroll smoke test
1. Open `https://tramisup.vercel.app/tr` in a fresh window.
2. Scroll down with mouse wheel and trackpad.
3. Confirm Hero → Problem → HowItWorks sections all reachable.

### Login + upgrade flow smoke test
1. Open `https://tiramisup.app/tr/login`.
2. Confirm credentials login renders without any reCAPTCHA widget, token field, or site-key error.
3. On a free-plan account already using `1/1` products, open `/[locale]/products/new`.
4. Confirm onboarding does **not** start immediately; the product-limit gate should render first.
5. Click `Paketleri gör` / `See plans`.
6. Choose `Starter` or `Pro` and confirm billing redirects to `settings?section=billing&checkout=success`.
7. Re-open `/[locale]/products/new` and confirm onboarding now starts.
8. For founder-quality testing, fill every onboarding question with realistic content. Do not skip sources or AARRR setup when shown.

## Known product debt

- `TaskEvent` telemetry is written and queryable, but there is still no product-facing UI for visualizing that event stream.
- Recommendation cards in `components/AgentChatPanel.tsx` are still static fallback actions, so live founder tests can make the product look more context-aware than it really is unless chat + task generation are inspected separately.
- Billing upgrade is intentionally fake right now. The UI behaves as if a package was purchased, but real Stripe checkout is bypassed.

## Historical: Sprint 1+2+3 committed history

> Everything in this section was uncommitted as of 6 April 2026 and is now shipped as of the 8 April 2026 release line above. Kept for historical traceability — do not treat as a TODO list.

### Sprint 1 — UX friction reduction (complete, now committed)

#### S1-1: OnboardingWizard visual weight reduction
- `components/OnboardingWizard.tsx`
- `OptionCard`: sub text removed, only label shown
- Phase pills: `h-7 px-3 text-[10px]` (was h-8 px-4 text-[11px])
- `StepWrapper` title: `text-[22px] sm:text-[26px]`; subtitle: `text-[13px]`
- Sources skip button: now a full pill button (was underline text link)
- All 11 onboarding questions preserved — only visual weight reduced

#### S1-2: FirstRunOnboarding simplified
- `components/FirstRunOnboarding.tsx`
- Rewritten: single card, title + 2-line description + CTA
- Removed: gradient hero, principles grid, profile card, journey steps
- `userName`/`userEmail` props removed — dashboard call site updated

#### S1-3: Growth page collapse defaults
- `components/CollapsibleSection.tsx` — new `"use client"` toggle wrapper
- `app/[locale]/growth/page.tsx` — GrowthTacticsPanel and TimelineFeed both wrapped with `<CollapsibleSection defaultCollapsed>`

#### S1-4: BlockerAlert session dismiss
- `components/today/BlockerAlert.tsx` — converted to `"use client"`
- Added `productId` prop; dismiss stored in `sessionStorage` key `blocker_dismissed_${productId}`
- Dismiss `×` button added to alert header
- Dashboard caller updated: `<BlockerAlert productId={product.id} ...>`

---

### Sprint 2 — Pricing infrastructure (captured here as committed history)

#### Prisma schema
- `prisma/schema.prisma` — `Subscription` + `UsageEvent` models
- Enums: `PlanTier` / `BillingInterval` / `SubStatus` / `UsageResource`
- Plan limits are now centralized (see `lib/plan-config.ts`)
- Migration added: `prisma/migrations/20260406143000_add_subscription_and_usage_events`
- `prisma generate` done locally

Current plan packaging (single source of truth: `lib/plan-config.ts`):
- `FREE`: 1 product, 20 tasks, 12 agent chat msgs/mo, 8 AI suggestions/mo, 6 metrics tracked
- `STARTER`: 3 products, 150 tasks, 90 agent chat msgs/mo, 30 AI suggestions/mo, 20 metrics tracked
- `PRO`: 10 products, 600 tasks, 300 agent chat msgs/mo, 100 AI suggestions/mo, 60 metrics tracked

Local note:
- If local Postgres is not running: `docker compose up -d postgres`
- If you see `Product_userId_fkey` on product create, your auth user is in a different DB than the app is pointing at.
  - As of local changes, product create now returns a clearer `401 USER_NOT_FOUND` error if the session user row is missing (instead of a raw FK 500).

#### New files
- `lib/plan-config.ts` — single source of truth for plan packaging (limits, prices, feature flags)
- `lib/plan-limits.ts` — runtime limit checks + usage accounting (reads limits/prices from `plan-config`)
- `components/PricingCard.tsx` — reusable pricing card with feature list
- `components/BillingUsage.tsx` — plan status + per-resource usage bars + upgrade CTA
- `app/[locale]/pricing/page.tsx` — monthly/yearly toggle, 3-card layout
- `app/[locale]/pricing/layout.tsx` — wraps in PlainPageShell
- `app/api/billing/checkout/route.ts` — GET → Stripe Checkout, 7-day trial
- `app/api/billing/portal/route.ts` — GET → Stripe Customer Portal
- `app/api/billing/webhook/route.ts` — POST → subscription lifecycle events

#### Updated files
- `components/SettingsWorkspace.tsx` — `"billing"` section added, `BillingUsage` rendered, `navBilling` in copy
- `app/[locale]/settings/page.tsx` — fetches subscription + usage, passes `billingData` to workspace; `section=billing` handled

#### Required new env vars (Stripe Dashboard → Products → Prices)
```
STRIPE_PRICE_STARTER_MONTHLY
STRIPE_PRICE_STARTER_YEARLY
STRIPE_PRICE_PRO_MONTHLY
STRIPE_PRICE_PRO_YEARLY
```

#### ⚠️ Remaining before Sprint 2 ships
1. Apply DB migration in the target environment (production/staging)
2. Add 4 Stripe price ID env vars above
3. Add `STRIPE_WEBHOOK_SECRET` env var
4. Register webhook at `https://tiramisup.app/api/billing/webhook` in Stripe dashboard
5. If payments are not ready to launch: keep pricing page but disable/soft-block checkout CTAs so users do not hit a broken flow
   - Current local behavior: paid plan CTAs on `/[locale]/pricing` are disabled ("Coming soon") and do not redirect to Stripe

#### Sprint 3 — Limit enforcement UI (implemented, now committed)
- Soft warning banner when tasks approach limit + hard block at limit
- Agent chat message limit enforced server-side; upgrade modal shown in UI
- Product creation blocked + upgrade CTA at product limit (OnboardingWizard)
- Usage accounting added via `UsageEvent` (monthly window; used for agent chat)

---

## Latest release note — 6 April 2026

Latest older committed release line:
- `main` advanced to `6be98945` (`Handoff docs: Tasks redesign + Dashboard chart row`)

Older local-only notes preserved for traceability:
- Landing scroll regression fixed by changing locale layout body overflow from `overflow-hidden` → `overflow-x-hidden` (`app/[locale]/layout.tsx`)

What changed since the previous handoff snapshot:

### Tasks page redesign (6 April 2026)
- Stat cards added: Total, In Progress, Completed, Blockers (matching dashboard style).
- Category filter strip added: All, Product, Tech, Legal, Marketing, Other buttons.
- Filter toggles category scope: activeTasks/doneTasks filtered by launchChecklistItem.category.
- Completion bar stays global (unfiltered).
- Scroll fix: layout overflow-y-auto instead of overflow-hidden.
- StatCard component reused from dashboard (not inline JSX).

### Dashboard redesign (6 April 2026)
- Chart row added between stat cards and PrimaryAction.
  - **Left**: TaskProgressChart (recharts BarChart) — last 7 days, created (teal) vs completed (green) bars.
  - **Right**: MetricSparklinePanel (area chart, primary metric trend) OR ReadinessPanel (launch readiness % or metrics CTA).
- New Prisma queries: 7-day recent tasks, 14-day metric entries (launched products only).
- Data computed server-side: taskChartData[], metricSparkData[], daysUntilLaunch.
- PrimaryAction gradient removed: flat white card, accent-colored border, smaller title (20px semibold).
- ReadinessPanel: pre-launch shows %, launched shows metrics CTA.
- MetricSparklinePanel: only renders if data.length >= 2, shows delta %, links to /metrics.

### UI / Layout architecture (April 2026)
- Full viewport split-panel layout shipped: left agent chat panel (360px, fixed) + right scrollable content area.
- `components/AgentLayoutShell.tsx` — wraps all agent-facing pages (Overview, Launch, Growth).
- `components/PlainPageShell.tsx` — wraps non-agent pages (Settings, Account, Integrations, Metrics).
- `components/AppShell.tsx` — top-level layout wrapper with gradient background.
- `components/DashboardNav.tsx` — rewritten: inline logo, pill nav with section-aware active colors (Overview=yellow `#ffeb69`, Launch=pink `#ffd7ef`, Growth=teal `#95dbda`), settings gear, ProductSelector.
- `components/ProductSelector.tsx` — style updated to white outlined button with teal dot.
- Body background changed to `#f8f5f1`, `overflow-hidden` to support full-height layout.

### Page redesigns
- **Dashboard (Overview)**: Compact inline hero (greeting + product name + phase badge), 4 stat cards (Total Tasks, Pending, Completed, Blockers), PrimaryAction + 2×2 DecisionCard grid, BlockerAlert, TodayTasks + SourceHealth columns.
- **Launch (pre-launch)**: Compact inline header, 4 stat cards (Readiness %, Completed, Blockers, Pending Tasks), LaunchGateStatus, BlockerSummary, ChecklistSection. PageHeader and ActionsSection removed.
- **Metrics**: Compact inline header, 3 stat cards (Metrics tracked, Sources connected, Entries recorded). PageHeader removed. `first_entry` state right panel simplified. `no_setup` state text reduced to 2 lines.

### Google OAuth fix
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `OAUTH_CALLBACK_BASE_URL` Vercel env vars had trailing `\n` characters — caused `invalid_client` token exchange failure.
- All three were removed and re-added without trailing newlines via Vercel CLI.
- Callback URL is `https://tiramisup.app/api/integrations/google/callback` — must be registered in Google Cloud Console.

### AI plan priority inflation fix
- `lib/ai-plan.ts` prompt now includes strict `HIGH`/`MEDIUM`/`LOW` rules.
- `HIGH` = only true launch blockers (legal, security, store rejection). Max 2–3 per plan.
- `MEDIUM` = important but product can launch without it.
- `LOW` = nice-to-have, polish.
- Applies to newly generated plans only. Existing products corrected via runtime normalization (`lib/launch-checklist-priority.ts`).

### Agent prompt language architecture
- All three agent system prompts (Overview, Launch, Growth) are now written in English internally.
- Response language is controlled by `locale` field passed from the client to `POST /api/agent/chat`.
- `AgentContext` now includes `locale: string`.
- `buildAgentContext()` accepts a third `locale` parameter (default `"en"`).
- `buildFallbackResponse()` accepts a second `locale` parameter.
- `AgentChatPanel` passes `locale` in the fetch body to `/api/agent/chat`.
- Rule: AI internal instructions = always English. User-facing AI output = user's configured language.

### Agent task creation — instant page refresh
- `AgentLayoutShell` now passes `onTasksCreated` to `AgentChatPanel`.
- When a recommendation card is clicked and a task is created, `router.refresh()` is called immediately.
- The right-panel content (task list, stat cards) updates without a full page reload.
- This applies to all three agent surfaces: Overview, Launch, Growth.

## Non-obvious architecture choices

### Public domain vs OAuth callback base
The app intentionally separates public URLs from OAuth callback URLs.

Why:
- marketing and email links should use `tiramisup.app`
- Google/Stripe OAuth can break if callback domains drift from the ones whitelisted in provider dashboards

Implementation:
- public URL helpers come from `lib/app-urls.ts`
- callback URLs use `OAUTH_CALLBACK_BASE_URL` env var
- `OAUTH_CALLBACK_BASE_URL` must NOT have a trailing newline — caused production OAuth breakage

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
- invisible reCAPTCHA is enabled in production on waitlist join and signup
- login no longer uses reCAPTCHA in production

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
- Free-text onboarding understanding is now part of normalized product context.
- Onboarding should not continue with empty or effectively skipped answers during QA or founder testing. Fill every question with realistic product context, including sources and AARRR setup when shown; otherwise downstream recommendations become noticeably more generic and less trustworthy.
- Recommendation surfaces should stay page-scoped and action-first:
  - `Overview` = `Tiramisup Recommendations`
  - `Growth` = `Growth Recommendations`
  - `Launch` = `Launch Recommendations`
- Recommendation cards and chat should remain separate UI concepts.
- Agent system prompts must remain in English. User-visible output must respect user locale.

## Current production baseline to preserve

Canonical right now:
- `/` and `/{locale}` remain waitlist-first
- `/yayinda` remains the preserved fuller landing page
- `Growth` and `Metrics` stay separate surfaces
- `Launch` stays hidden in top nav for launched/growing products
- split-panel layout: left agent panel (fixed 360px) + right scrollable content
- left-side agent panel available on Overview/Growth/Launch surfaces
- recommendation cards are separate from chat inside the agent panel
- public GA4 + Clarity remain consent-aware
- invisible reCAPTCHA remains production-only where it is still enabled (waitlist + signup)
- agent prompts in English, output in user's configured locale

Not canonical right now:
- any local workstation drift not committed into the main release line
- nested repo changes under `external/streamlined-solutions`
- abandoned `Ask Tiramisup` launcher/blob experiments
- editor-specific config files
- temp CLI artifacts

## Current UI architecture notes

### Layout shells
- `AgentLayoutShell` — used by Overview (`dashboard`), Launch (`pre-launch`), Growth (`growth`) layouts. Provides left agent panel + right scrollable content.
- `PlainPageShell` — used by Settings, Account, Integrations, Metrics layouts. Full-width scrollable white card.
- `AppShell` — wraps everything: gradient bg + DashboardNav + `<main>` with `overflow-hidden`.

### Dashboard stat cards
All three main pages (Dashboard, Launch, Metrics) now open with prominent stat cards showing key numbers before any text.

### Settings
- Settings now uses top category tabs instead of a long all-sections page.
- Only one settings category should be visible at a time.
- Current categories: Profile, Product, Sources, Tracking, Security

### Metrics
- Recommended source suggestions are collapsible by default.
- Manual metric inputs accept integers by default.
- Decimal values are only allowed for monetary revenue metrics such as `mrr` and `arpu`.

### Onboarding
- Category, audience, and business model now support multi-select.
- Choosing `Other` reveals a clarification field.
- Onboarding asks for current top priority after stage selection.
- Product description guidance explicitly asks for a concrete explanation — this field feeds the AI plan.
- Skip/continue flows should remain product-first.

### Growth
- The current V1 tactics layer is intentionally deterministic and narrow.
- Do not broaden it into a generic "tips feed."
- If tactics expand later, keep the order: diagnosis → eligibility → ranking → surface placement.

### Recommendations vs chat
- The authenticated side panel must not mix recommendation cards with chat suggestions.
- Recommendation cards are intended as action-first controls.
- Chat is intended for follow-up questions and deeper exploration.
- If a clickable suggestion looks like a task, it should create or stage a task instead of behaving like a user chat message.

### Agent locale behavior
- Agent prompts (system instructions sent to the AI) are always in English.
- The `locale` field from the user's session/request controls what language the AI writes its responses in.
- Never hardcode language in system prompt instructions — derive it from `ctx.locale`.

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
6. Confirm `/en/login` does not render reCAPTCHA
7. Open `/en/settings` and change password again from the security section

### OAuth
1. Log in
2. Open `/en/integrations`
3. Start GA4 connect
4. Confirm redirect and callback complete successfully
5. Verify no `invalid_client` error on token exchange

### Local founder flow
1. Confirm local database reachable.
2. Create account from `/en/signup`.
3. Complete onboarding with free-text description.
4. Confirm product creation succeeds.
5. Review dashboard, launch, metrics surfaces.
6. Test `/en/tasks` — stat cards, category filter, chart visibility.

### Tasks page smoke test
1. Open `/en/tasks`.
2. Confirm 4 stat cards (Total, In Progress, Completed, Blockers).
3. Confirm category filter shows 9 categories (PRODUCT, MARKETING, LEGAL, TECH, ACQUISITION, ACTIVATION, RETENTION, REVENUE, MEASUREMENT).
4. Click category button — section refreshes.
5. Completion bar stays global (unfiltred).
6. Page scrolls (no overflow-hidden cutoff).

### Dashboard regression guard
1. Open `/en/dashboard`
2. Confirm 4 stat cards appear at top (Total Tasks, Pending, Completed, Blockers)
3. Confirm TaskProgressChart shows last 7 days (created + completed bars)
4. Confirm MetricSparklinePanel or ReadinessPanel appears on right (depends on metric entries)
5. Confirm PrimaryAction is flat white card, not gradient
6. Confirm left panel shows recommendation cards separate from chat
7. Confirm clicking recommendation card creates task (not chat echo)
8. Confirm launched products without metrics route toward Growth/Metrics
9. Confirm `Launch` not shown in nav for launched/growing products

### Agent locale guard
1. Switch user language to Turkish in Settings
2. Open dashboard and interact with the Overview agent
3. Confirm agent responds in Turkish
4. Switch language back to English
5. Confirm agent responds in English

## If something breaks first

Check in this order:
1. Vercel production env values — especially trailing whitespace/newline in `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `OAUTH_CALLBACK_BASE_URL`
2. Resend domain / API key health
3. OAuth provider whitelists and test-user settings
4. GA4 and Clarity consent gating
5. reCAPTCHA envs and verify behavior on waitlist/signup only
6. Only then app code

## Current known product debt

- The TaskEvent stream is collected but **not yet visualized in the UI**. The endpoint `GET /api/products/[id]/task-quality` exists; a dashboard panel that surfaces `actionRate` / `dedupeSaveRate` / `completionRate` is not built. First two weeks of data needed before it would be meaningful.
- Some locale-routed product screens still contain Turkish-first hardcoded copy.
- Local signup and founder-flow testing fail early if Prisma cannot reach the local database.
- Signup still asks for a product-type selection that is not submitted to backend state.
- Dashboard-to-Metrics ownership still needs careful review for launched products with no metric setup.
- New teams must separate committed release truth from local workstation state before shipping anything.
- Existing product launch checklist priorities are normalized at runtime — not retroactively fixed in DB. A future migration could clean these permanently.
- Signed-in manual verification is still needed for the new recommendation-card behavior on live authenticated pages.
