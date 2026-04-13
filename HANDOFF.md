# Tiramisup - Team Handoff Document

**Date:** 13 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (`main` auto-deploys to Vercel)
**Current active `main` line:** includes `53b5e694`, `72e598ba`, `e3e5f79c`, `beb5022e`, `21dcae07`, `947d392c`, `e6d1954f`, `5232e299`
**Status:** Production baseline is live, but handoff priority has changed: the app now includes recent navigation / board / suggestion improvements, an active free-form agent chat regression, and a security cleanup after exposed secrets were discovered in the public repo history.

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

As of **13 April 2026**, these are true in production:

- `tiramisup.app` is live and serving the current `main` line.
- Public landing is still **waitlist-first**.
- Signup no longer requires an early access code.
- Signup and waitlist both use **email verification**.
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
- **Free-form agent chat is currently unstable in production**: user-written messages can fail with the generic UI copy "Bir sorun oluştu, tekrar dener misin?" because `/api/agent/chat` is intermittently returning 500. This is the top unresolved product bug at handoff time.
- **Security cleanup shipped on 13 April 2026**: local secret files were removed from git tracking, and Gemini/OpenAI production env keys were rotated in Vercel after exposed keys were found in the public repo.

Recent shipped commits on the active line:
- `53b5e694` — stop tracking local secrets (`.env.prod`, OAuth client secret JSON, e2e auth artifact, supabase temp file) and remove hardcoded production DB URLs from seed scripts
- `72e598ba` — tighten free-form agent chat guidance and action defaults
- `e3e5f79c` — make Board access visible across authenticated app surfaces
- `beb5022e` — unify board task interactions with preview-first UX
- `21dcae07` — improve agent suggestion quality and add preview/create split
- `947d392c` — fix route boundary height so agent layouts keep independent scroll behavior
- `e6d1954f` — fix agent shell scroll and metrics flow regressions
- `5232e299` — fix right-side content scrolling in Overview / Launch / Growth shell
- `0f9fc76a` — fix growth goals render, growth route isolation, launched dashboard status copy, trend delta calculation, growth checklist completion bridge
- `9c3a1e58` — ship launch flow follow-up fixes: launch modal hint/pulse, route boundary remount keys, agent suggestion refresh, metric funnel warning
- `27dfd71d` — allow `chef@tiramisup.app` admin access for `/[locale]/admin/waitlist`
- `eded8530` — finish Trust Sprint 2 hardening and verification

---

## 2.5 Current Workspace State

The workspace is no longer "ahead by three uncommitted fixes". Those fixes and several follow-up UI changes have already shipped. The current workspace should be treated as a **production repo with live follow-up work already merged**.

What is now true:
- the metric setup / growth transition fixes are in the active line
- board discoverability and task-preview UX changes are in the active line
- hybrid agent suggestions are in the active line
- the security cleanup that stops tracking local secret files is in the active line

What is still open:
- free-form agent chat is returning 500s intermittently in production
- the generic client copy hides the real server error, so the next team must inspect `/api/agent/chat` and Vercel logs first

### Pre-existing test failures
8 tests in `__tests__/api/waitlist/admin.test.ts` fail with 401. This remains a pre-existing auth mock issue unrelated to the current handoff-critical bugs. All other tests are expected to pass.

---

## 3. Open Founder-Simulation Findings

These came from using the live app as a real founder with an upgraded account — not narrow code-path tests.

### 1. AARRR onboarding exit feels broken
- Wizard can remain on `Önerilen AARRR kurulumun` step after submission
- Fix 2 above addresses the race condition
- Needs end-to-end testing: create product → AARRR step → accept → loading screen → overview

### 2. Metrics setup vs daily entry state is confusing
- On `/metrics`, setup cards can be absent while daily numeric entry inputs are already visible
- User cannot tell if setup is complete, skipped, or broken
- Files: `app/[locale]/metrics/page.tsx`, `components/MetricSetupSelector.tsx`

### 3. First metric save does not propagate cleanly into Growth
- After entering and saving metric values, Growth can still show "no data yet"
- Fix 1 and Fix 3 partially address this — needs full propagation validation

### 4. Agent recommendation cards did not appear in launched-product journey
- In the founder simulation, agent card count was 0 for a launched product
- Fix 1 corrects the `has_setup` bug that caused this — needs end-to-end re-validation

### 5. Repeated browser-side 500 resource errors
- Observed on `/products/new`, `/growth`, `/dashboard` during production simulation
- Root cause not isolated — next team should reproduce with network capture and trace the failing request

### 6. Free-form agent chat currently fails on user-written questions
- Repro: open Overview / Launch / Growth agent panel, type a real question, submit
- Current user-visible result: generic retry copy (`Bir sorun oluştu, tekrar dener misin?`)
- Actual shape: client catch path is masking a server-side failure from `/api/agent/chat`
- Important: suggestion cards and board/task creation are still working; this is specifically the free-form chat path
- Likely starting points: `app/api/agent/chat/route.ts`, `components/AgentChatPanel.tsx`, Vercel logs for `/api/agent/chat`

---

## 4. Unvalidated Product Risks

These are the things the founding team does not yet know. They are the highest-priority questions for the new team.

**1. Does the AI actually help?**
The agent recommendations have not been tested with a real founder on a real product outside the founding team. It is unknown whether the output is meaningfully better than generic startup advice.

**2. Is the core loop sticky?**
The intended loop is: create product → enter metrics → receive diagnosis → create tasks → repeat.
Whether users return after the first session is unknown.

**3. Does the onboarding-to-value path work end-to-end?**
A fresh user creating a product → finishing onboarding → reaching a useful Growth diagnosis has not been cleanly validated. Several breakpoints exist between these steps.

---

## 5. Recommended First Sprint for New Team

1. Commit the three local fixes and deploy to production
2. Do a full founder simulation with a fresh account — document every point of confusion
3. Fix the onboarding exit and the metrics setup/entry state confusion (Issues 1 and 2 above)
4. Re-run simulation: onboarding exits cleanly → metrics setup state is clear → first save propagates to Growth → agent cards appear
5. Wire real Stripe billing (fake checkout is the only thing blocking paid users)
6. Run 5 external users through the product — observe, do not explain
7. Decide: is the AI recommendation quality good enough to charge for?

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
- **Email delivery**: `RESEND_FROM_EMAIL` must be set in Vercel env to `Tiramisup <hello@tiramisup.app>`. If unset, fallback is `onboarding@resend.dev` — causes spam filter delays. Domain `tiramisup.app` is already verified in Resend.
- **Free-form agent chat reliability**: the compact chat/policy work landed, but `/api/agent/chat` is still intermittently failing in production and must be stabilized before more AI UX work ships
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
- Structured task columns and `TaskEvent`

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
- [ ] Signup → email verify → login flow works
- [ ] Waitlist join → email verify flow works
- [ ] Onboarding creates product, file upload works, async plan generates
- [ ] Onboarding exits cleanly after the AARRR recommendation step
- [ ] Pre-launch product sees Overview + Launch in nav (not Metrics/Growth)
- [ ] Launched/growing product sees Overview + Metrics + Growth in nav (not Launch)
- [ ] Launched product without growth check-in redirects from dashboard to `/growth`
- [ ] Settings/account language change moves to the correct locale route
- [ ] Agent panel cards create tasks when clicked — not chat messages
- [ ] Free-form agent chat in Overview / Launch / Growth answers a user-written question without returning the generic retry copy
- [ ] Right content pane scrolls correctly on Overview / Launch / Growth
- [ ] Metrics shows a coherent setup state before daily entry for a fresh launched product
- [ ] First metric save is reflected by Growth — Growth no longer says "no data"
- [ ] Agent recommendation cards appear for a launched product with metrics

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
