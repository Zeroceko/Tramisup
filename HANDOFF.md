# Tiramisup - Team Handoff Document

**Date:** 16 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (`main` auto-deploys to Vercel)
**Current active `main` line:** includes all commits through `2dc2f428`
**Status:** Production is live. The 13 April critical bugs remain fixed, the 14 April follow-up line is shipped, and the 15–16 April line is now also live: checklist locale/task fixes, agent preview hardening, agent-panel refetch fix, and GROWING-stage onboarding with inline AARRR setup plus a stronger first Growth kickoff are all in production.

---

## 1. What Tiramisup Is

Tiramisup is a founder operating system for early-stage product teams.

It has two active faces:
- **Public site**: waitlist-first marketing surface on `/{locale}`
- **Authenticated app**: founder workflow for onboarding, launch prep, metrics, growth, tasks, settings, and integrations

Core product surfaces:
- **Dashboard**: answers "what should I do next?"
- **Tasks / Board**: execution queue
- **Pre-Launch**: checklist, blockers, readiness — only visible to pre-launch products
- **Metrics**: AARRR setup, manual entry, source-backed trend tracking — standalone nav item for launched products
- **Growth**: diagnosis-led growth workflow for launched products
- **Integrations**: GA4 / Stripe source connection setup
- **Settings / Account**: profile, locale, product context, billing, security
- **Onboarding**: staged product creation wizard

Everything is product-scoped. A user can have multiple products, one active at a time.

See `docs/tiramisup-manifesto.md` for the product vision and decision filter.

---

## 2. Current Production Truth

As of **16 April 2026**, these are true in production:

- `tiramisup.app` is live and serving the current `main` line.
- Public landing is still **waitlist-first**.
- Signup no longer requires an early access code.
- Signup and waitlist both use **email verification**.
- **Email verification now auto-logs the user in**: clicking the verification link verifies the account, creates a short-lived verification login token, and lands the user in the app without re-entering credentials.
- Onboarding supports **file upload**, **Google Drive / URL context**, and **async plan generation**.
- Locale preference is persisted to both DB and cookie. Settings-side language switching redirects to the correct localized route.
- Billing is still **fake checkout / demo activation** — not real Stripe payments.
- AI guidance remains **stage-aware** and must not invent advice when evidence is weak.
- **Nav is stage-aware**: pre-launch products see Overview + Launch; launched/growing products see Overview + Metrics + Growth.
- **Growth intake gate**: launched/growing products without a completed growth check-in are redirected to `/growth` before seeing the dashboard.
- **Growth diagnosis is data-driven**: includes actual metric values (current, baseline, rate) and is locale-aware (EN/TR).
- **Agent panel cards are all task-creation**: every card creates a task when clicked. No "ask"-intent cards remain.
- **Board access is now directly visible in the authenticated header** as a secondary CTA.
- **Board rows and agent suggestion rows now share the same preview-first interaction model**: compact row, preview surface, explicit create/action control.
- **Overview / Launch / Growth shell scrolling is fixed**: left agent column stays fixed-height while right content pane scrolls independently.
- **Admin ops panel is live** under `/{locale}/admin/*` with overview, users, products, billing, AI usage, and waitlist views. It is allowlist-protected and excluded from indexing via `noindex`, `nofollow`, and `robots` disallow rules.
- **Task lifecycle timestamps are canonical**: `Task.startedAt` and `Task.completedAt` drive board/detail surfaces while `TaskEvent` remains the audit trail.
- **Products page has been redesigned** into a portfolio-style workspace, and the product selector's `Tümünü gör / View all products` link now routes to `/{locale}/products`.
- **Authenticated app performance work is shipped**: request-level auth/product caching, reduced refresh churn, lazy/closed initial agent panel, route loading skeletons, lighter app surfaces, and targeted DB indexes are all on the active line.
- **Founder metric-to-growth flow is tightened**: setup save, first baseline transition, fallback recommendations, and growing-state visibility were improved after live founder simulation.
- **GROWING-stage onboarding is now stronger**: if a founder selects `GROWING`, onboarding no longer treats AARRR as an optional preview. The founder chooses one primary metric for every AARRR stage before the workspace opens.
- **Growth kickoff is onboarding-aware**: after a `GROWING` onboarding, the founder lands in a richer Growth kickoff that shows the selected AARRR signals, what is already done, and the next step toward the first baseline.
- **Integrations now return to Growth kickoff** for onboarding-driven `GROWING` founders instead of dumping them into a generic integrations-only destination.
- **Checklist locale handling and task-creation reliability were tightened** on pre-launch surfaces, including mixed EN/TR rendering and checklist-item-to-task creation.
- **Agent suggestion preview is hardened**: malformed suggestion payloads should no longer crash the preview sheet.
- **Agent panel refetch loop is fixed**: a render-loop/refetch issue in the panel was removed, reducing browser churn when the panel is open.
- **Transactional email templates were redesigned** to match the live brand system and are already in production.
- **Free-form agent chat is fixed**: the root cause was a missing `AgentMessage` table in the production DB (schema updated but `prisma db push` was not run). The table has been pushed and the `/api/agent/chat` route is now fully hardened — every non-critical DB operation (message history, limit check, context build, action execution, message persistence, usage recording) is wrapped in independent try/catch so a single DB failure never aborts the response.
- **Plan upgrade → product creation flow is fixed**: when a user hits the product limit on `/products/new`, upgrades their plan, and returns, they are now correctly redirected to onboarding instead of landing on the settings page. The `next` param flows through pricing → checkout → back to `/products/new` → onboarding.
- **Security cleanup shipped on 13 April 2026**: local secret files were removed from git tracking, and Gemini/OpenAI production env keys were rotated in Vercel after exposed keys were found in the public repo.

Recent shipped commits on the active line:
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
- `f87af053` — fix agent chat intermittent 500s by isolating non-critical DB writes
- `53b5e694` — stop tracking local secrets and remove hardcoded production DB URLs from seed scripts
- `72e598ba` — tighten free-form agent chat guidance and action defaults
- `e3e5f79c` — make Board access visible across authenticated app surfaces
- `beb5022e` — unify board task interactions with preview-first UX
- `21dcae07` — improve agent suggestion quality and add preview/create split
- `947d392c` — fix route boundary height so agent layouts keep independent scroll behavior
- `e6d1954f` — fix agent shell scroll and metrics flow regressions
- `5232e299` — fix right-side content scrolling in Overview / Launch / Growth shell
- `0f9fc76a` — fix growth goals render, growth route isolation, launched dashboard status copy, trend delta calculation, growth checklist completion bridge
- `9c3a1e58` — ship launch flow follow-up fixes: launch modal hint/pulse, route boundary remount keys, agent suggestion refresh, metric funnel warning

---

## 2.5 Current Workspace State

The workspace is no longer "ahead by three uncommitted fixes". Those fixes and several follow-up UI changes have already shipped. The current workspace should be treated as a **production repo with live follow-up work already merged**.

What is now true:
- the metric setup / growth transition fixes are in the active line
- board discoverability and task-preview UX changes are in the active line
- hybrid agent suggestions are in the active line
- the security cleanup that stops tracking local secret files is in the active line
- admin ops, task lifecycle timestamps, and products page polish are in the active line
- authenticated-app performance work from 14 April is in the active line
- email verification auto-login is in the active line
- redesigned transactional email templates are in the active line
- checklist locale/task fixes and agent preview hardening are in the active line
- GROWING-stage onboarding now includes real AARRR setup and a Growth-first kickoff path

What was fixed after the previous handoff:
- free-form agent chat 500 → root cause was missing `AgentMessage` table in production DB; table pushed, route fully hardened
- plan upgrade dead-end → checkout now returns user to the flow that triggered the upgrade via `next` param
- `normalizeStoredLaunchChecklistPriorities` was running unnecessarily on every agent context build regardless of stage → now only runs for launch agent or PRE_LAUNCH products
- admin panel and internal ops reporting shipped
- task started/completed timestamps shipped
- founder metric-to-growth transition cleaned up
- heavy authenticated route refreshes reduced, agent panel lazy-loaded, and app surfaces lightened
- verification-link auto-login shipped so email verification no longer requires manual credentials re-entry
- pre-launch checklist locale/task creation regressions were fixed
- GROWING-stage onboarding now captures real AARRR setup before workspace entry and routes back into a richer Growth kickoff

### Pre-existing test failures
8 tests in `__tests__/api/waitlist/admin.test.ts` fail with 401. This remains a pre-existing auth mock issue unrelated to the current handoff-critical bugs. All other tests are expected to pass.

---

## 3. Open Founder-Simulation Findings

These came from using the live app as a real founder with an upgraded account — not narrow code-path tests.

### 1. Existing product surfaces are usable across multiple founder personas
- A portfolio-based founder simulation was run against production with five distinct personas
- Pre-launch checklist, dashboard guidance, AI plain-language prompt, metrics surface, growth surface, and products portfolio all remained navigable in the run
- No page-level browser errors were observed in that portfolio-based run

### 2. Fresh product creation is still the highest-risk path
- Earlier production simulation attempts observed onboarding stalling around the AARRR recommendation step
- A production call to `POST /api/products/[id]/generate-plan` also timed out at roughly 50 seconds during that testing window
- Because the onboarding flow has changed again on 16 April for `GROWING` users, the full fresh-user path now needs a new clean re-validation:
  signup → verify email → onboarding → inline AARRR setup → async plan generation → Growth kickoff

### 3. Dashboard and tasks are improved, but still the slowest authenticated surfaces
- TTFB and browser load improved materially on 14 April, but `/dashboard` and `/tasks` remain the highest-friction authenticated pages
- Next team should continue with route/API timing and query profiling if users still report lag

### 4. Growth kickoff still needs fresh-account validation after the 16 April change
- The new behavior is intentional and shipped: `GROWING` founders now set up all six AARRR signals during onboarding and land in Growth instead of a generic overview
- What still needs proof is the end-to-end feeling:
  - no stale metric state
  - integrations detour returns to Growth kickoff correctly
  - check-in completion moves naturally to baseline entry

### 6. ~~Free-form agent chat currently fails on user-written questions~~ FIXED
- Root cause: `AgentMessage` table existed in the Prisma schema but had never been pushed to the production Supabase DB. Every `listStoredAgentMessages` call threw "table does not exist", which was caught only by the outer 500 handler.
- Fix: `prisma db push` run against production on 13 April, plus route hardened so every non-critical DB operation has its own try/catch and never aborts the AI response.
- Relevant commits: `f87af053`, `e40b9cab`

---

## 4. Unvalidated Product Risks

These are the things the founding team does not yet know. They are the highest-priority questions for the new team.

**1. Does the AI actually help?**
The agent recommendations have not been tested with a real founder on a real product outside the founding team. It is unknown whether the output is meaningfully better than generic startup advice.

**2. Is the core loop sticky?**
The intended loop is: create product → enter metrics → receive diagnosis → create tasks → repeat.
Whether users return after the first session is unknown.

**3. Does the onboarding-to-value path work end-to-end?**
A fresh user creating a product → finishing onboarding → reaching a useful Growth diagnosis has not been cleanly validated on the newest `GROWING` onboarding flow. This remains the top end-to-end product risk.

---

## 5. Recommended First Sprint for New Team

1. Re-run the full fresh-account founder path on the new `GROWING` onboarding flow
2. Validate plan-generation reliability and isolate the earlier `generate-plan` timeout if it still reproduces
3. Profile `/dashboard` and `/tasks` with real authenticated timings if users still report lag
4. Wire real Stripe billing (fake checkout is the only thing blocking paid users)
5. Run 5 external users through the product — observe, do not explain
6. Decide: is the AI recommendation quality good enough to charge for?

---

## 6. First-Day Setup

```bash
git clone <repo-url> && cd Tiramisup
npm install
npx prisma generate
npx prisma db push
npm run dev
```

Verify:
```bash
npx tsc --noEmit
npx next build
QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run
```

**Local dev runs on port `3002`** — Google and Stripe OAuth redirect settings are aligned to this port.

If `npx tsc --noEmit` complains about missing `.next/types/*` files after route churn, regenerate `.next` first with `npx next build --no-lint` or clear `.next` and rerun.

---

## 7. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Auth | NextAuth 4 (Credentials + JWT) |
| i18n | next-intl (`en`, `tr`, default `en`) |
| AI | Qwen → DeepSeek → Gemini → Gemini backup → static fallback |
| Email | Resend |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Testing | Vitest + Playwright |

---

## 8. Architecture Overview

### Layout shells

- **`AgentLayoutShell`**: left agent panel + right content — Dashboard, Pre-Launch, Growth
- **`PlainPageShell`**: full-width — Settings, Metrics, Integrations, Account

### Nav structure (stage-aware)

| Product status | Nav items shown |
|---|---|
| PRE_LAUNCH | Overview · Launch |
| LAUNCHED / GROWING | Overview · Metrics · Growth |
| No product | Overview only |

Key file: `components/DashboardNav.tsx`

### Growth workspace modes

```
intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
```

Intake answers stored in `Product.additionalContext.growthCheckin`.

### Growth diagnosis

`lib/funnel-health.ts` builds the funnel health summary:
- Locale-aware (EN/TR) — accepts `locale` parameter
- Data-driven: `nextFocus` text includes actual metric values, direction, and rate vs target

### Agent panel (left sidebar)

`components/AgentChatPanel.tsx` — all suggestion cards use `createTaskFromSuggestion`:
- Clicking any card creates a task immediately via `POST /api/actions`
- No "ask"-intent cards remain
- Suggestion content is product-specific and generated deterministically in `app/api/agent/suggestions/route.ts`

### Product creation (two-phase)

1. `POST /api/products` — fast create
2. `POST /api/products/[id]/generate-plan` — async AI plan generation
3. `GET /api/products/[id]/plan-status` — polled until complete

### AI provider chain (must not change)

1. Qwen (`qwen-plus`)
2. DeepSeek (`deepseek-chat`)
3. Gemini (`gemini-2.0-flash`, `GEMINI_API_KEY`)
4. Gemini backup (`gemini-2.0-flash`, `GEMINI_API_KEY_2`)
5. Static fallback — no crash

---

## 9. Rules That Must Not Break

1. **No fake product on signup.** Product data begins only after onboarding.
2. **Launched products must not get pre-launch language or nav.**
3. **Growth must stay diagnosis-led, not generic startup advice.**
4. **Metric entry must stay tied to configured metrics.**
5. **AI must not speculate without evidence.**
6. **User-written product description remains central context for all AI calls.**
7. **English is the master locale.** Default is `en`.
8. **`HIGH` priority means a true blocker only.**
9. **Agent panel cards create tasks — they do not open chat.**
10. **Public landing remains waitlist-first unless explicitly decided otherwise.**
11. **Billing is not real payments. Do not present it as complete Stripe commerce.**

---

## 10. Known Debt

- **Billing**: still fake checkout / demo activation
- **i18n gaps**: some authenticated copy still has hardcoded strings
- **Roadmap integrations**: RevenueCat, App Store Connect, Google Play Console, ads connectors are UI-first only
- **`Product.launchGoals`**: legacy field, do not build new logic on it
- **Dashboard first impression**: what a user sees on first login after onboarding is not sharp enough
- **Fresh onboarding reliability**: the new `GROWING` onboarding path is stronger, but still needs explicit fresh-user validation in production
- **Email delivery**: `RESEND_FROM_EMAIL` must be set in Vercel env to `Tiramisup <hello@tiramisup.app>`. If unset, fallback is `onboarding@resend.dev` — causes spam filter delays. Domain `tiramisup.app` is already verified in Resend.
- **Email templates were redesigned on 14 April 2026**: preserve the existing HTML structure in `lib/email.ts`, `lib/email-verification.ts`, and `lib/password-reset.ts`; do not rewrite those templates casually.
- **Free-form agent chat**: fixed — but AI response quality with the current Gemini→Qwen fallback chain in `BrandLib/ai-client.ts` has not been validated with real founders. The provider priority in `BrandLib/ai-client.ts` (Gemini first) differs from the canonical chain in `lib/founder-coach.ts` (Qwen first) — unify if this becomes a quality issue
- **Public repo secret history**: tracking of local secret files has been stopped, but any previously exposed keys must still be treated as compromised and rotated outside the repo

---

## 11. Database and Schema

Current schema includes live support for:
- `Product.additionalContext` — including `growthCheckin` envelope
- `Product.uploadedFiles`
- `Product.planMeta`
- `User.emailVerified` / `User.verificationToken`
- `Waitlist.emailVerifiedAt` / `Waitlist.verificationToken`
- `MetricSetup` / `MetricEntry` tables
- `AgentMessage` table (chat history persistence — pushed to production 13 April)
- `Subscription` / `UsageEvent` tables (plan limits and usage tracking)
- Structured task columns and `TaskEvent`
- Canonical task lifecycle timestamps: `Task.startedAt` / `Task.completedAt`

For a new environment:
```bash
npx prisma generate
npx prisma db push
```

---

## 12. Environment Variables

```bash
# AI
QWEN_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
GEMINI_API_KEY_2
GOOGLE_GENERATIVE_AI_API_KEY
OPENAI_API_KEY

# Auth / app
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL

# Database
DATABASE_URL        # PgBouncer — port 6543
DIRECT_URL          # Direct Postgres — port 5432

# Email
RESEND_API_KEY
RESEND_FROM_EMAIL   # Must be: Tiramisup <hello@tiramisup.app>

# Supabase
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY   # required for upload flow

# OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_REDIRECT_URI
OAUTH_CALLBACK_BASE_URL

# Analytics / protection
NEXT_PUBLIC_GA_MEASUREMENT_ID
RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_ENABLED
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
RECAPTCHA_SECRET_KEY
```

Important environment notes:
- Vercel env is the source of truth for production
- `.env.prod` must not be recommitted; it was intentionally removed from git tracking on 13 April 2026
- Gemini and OpenAI keys were rotated on 13 April 2026 after exposed secrets were found in the public repo
- Other previously exposed secrets should be assumed compromised until rotated

---

## 13. Pre-Release Smoke Checklist

Before shipping any meaningful change:

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` passes
- [ ] `QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run` — all pass (8 admin waitlist tests are pre-existing failures, acceptable)
- [ ] `/en` and `/tr` both load
- [ ] Signup → email verify → auto-login → dashboard flow works
- [ ] Waitlist join → email verify flow works
- [ ] Onboarding creates product, file upload works, async plan generates
- [ ] `GROWING` onboarding requires one selected metric for all 6 AARRR stages
- [ ] `GROWING` onboarding lands on Growth kickoff instead of generic overview
- [ ] If onboarding selected GA4/Stripe, integrations detour returns to Growth kickoff
- [ ] Pre-launch product sees Overview + Launch in nav (not Metrics/Growth)
- [ ] Launched/growing product sees Overview + Metrics + Growth in nav (not Launch)
- [ ] Launched product without growth check-in redirects from dashboard to `/growth`
- [ ] Settings/account language change moves to the correct locale route
- [ ] Agent panel cards create tasks when clicked — not chat messages
- [ ] Free-form agent chat in Overview / Launch / Growth answers a user-written question without returning the generic retry copy
- [ ] Hit product limit → upgrade plan → returned to onboarding (not settings)
- [ ] Right content pane scrolls correctly on Overview / Launch / Growth
- [ ] Metrics shows a coherent setup state before daily entry for a fresh launched product
- [ ] First metric save is reflected by Growth — Growth no longer says "no data"
- [ ] Growth kickoff for a fresh `GROWING` product shows selected AARRR setup and moves naturally from check-in to baseline
- [ ] Agent recommendation cards appear for a launched product with metrics
- [ ] `/admin/overview` is accessible to an allowlisted admin, blocked for non-admins, and excluded from indexing
- [ ] Product selector `Tümünü gör / View all products` link lands on `/{locale}/products`
- [ ] Board/task detail shows task `Started` / `Completed` timestamps correctly

---

## 14. Access Transfer Checklist

- GitHub repo access
- Vercel project access (`zerocekos-projects/tramisup`)
- Supabase project access (`ojecebxxcbxrofnbkaae`, eu-west-3)
- Google Cloud Console access (OAuth)
- Stripe Dashboard access
- Resend account access
- Domain / DNS access for `tiramisup.app`
- All Vercel production environment variables
