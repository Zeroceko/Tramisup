# Tiramisup - Team Handoff Document

**Date:** 22 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (`main` auto-deploys to Vercel)
**Current active `main` line:** includes all commits through `0ec4162f`, plus direct 22 April production deploys from the local worktree
**Status:** Production is live. Founder continuity is better on existing accounts, but fresh-signup continuity is still not trustworthy enough to call solved.

---

## 1. What Tiramisup Is

Tiramisup is a founder operating system for early-stage product teams.

It has two faces:
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

---

## 2. Current Production Truth

As of **22 April 2026**, these are true in production:

- `tiramisup.app` is live on the current `main` line.
- Production also includes 22 April direct Vercel deploys from the local worktree. Latest confirmed production deploy: `https://tramisup-obgi3s8wo-zerocekos-projects.vercel.app`, aliased to `https://tiramisup.app`.
- Public root landing is intentionally **waitlist-first**. The self-serve marketing surface at `/{locale}` is for waitlist capture. The real landing experience lives at `/{locale}/yayinda`.
- Signup requires email verification. No early access code is required.
- Fresh signup cannot currently be treated as reliably working. On 22 April live validation, the signup form filled successfully but did not redirect to `/verify-email`, `/dashboard`, or `/onboarding` within the expected timeout after submit.
- **Email verification auto-logs the user in**: clicking the link verifies the account and signs the user in without re-entering credentials.
- Billing is still **fake/demo checkout** — not real Stripe commerce.
- AI guidance remains **stage-aware** and must not invent advice when evidence is weak.
- **Nav is stage-aware**: pre-launch → Overview + Launch; launched/growing → Overview + Metrics + Growth.
- **AARRR metrics step in onboarding** is shown for LIVE and GROWING stages (not just GROWING). This was tightened on 21 April.
- **Growth kickoff (`/growth?onboarding=1`) is now a single-focus screen**: only the check-in form is shown. The "tamamlananlar" banner, AARRR signal grid, progress tracker, and coach card are all hidden when `?onboarding=1` is present.
- **Empty dashboard state is clean**: when no product exists, the settings gear, product selector, and "Add product" link are hidden. First-run screen no longer shows a "No fake data" trust note.
- **Onboarding step transitions are animated**: directional slide-fade (forward/backward) when navigating between steps.
- **EN/TR user-facing copy was cleaned up on authenticated surfaces**: a Turkish user should not see stray English labels, and an English user should not see stray Turkish labels, across the main app surfaces touched on 22 April.
- **Google Ads tag is live globally** via `app/[locale]/layout.tsx`: `AW-18110097199`.
- **Products page is intentionally minimal now**: when products exist, the route shows only the compact page header, header-level new-product action, and real product cards. The decorative "new workspace" card is gone. Empty state appears only when there are zero products.
- **Auth security is hardened**: bcrypt cost factor is 8 (was 10, caused 5–10s signup latency on Vercel), rate limiting on signup (5/15min per IP) and forgot-password (3/15min per IP), NEXTAUTH_SECRET fallback removed (throws instead of silently using empty string), error messages sanitized.
- Agent panel behavior is inconsistent across surfaces. Launch can still produce context-aware answers, but Overview and Growth do not yet reliably expose reachable chat/task flows in live runs.
- **Growth diagnosis is data-driven**: includes actual metric values and is locale-aware (EN/TR).
- **Admin ops panel is live** under `/{locale}/admin/*` — overview, users, products, billing, AI usage, waitlist. Allowlist-protected and excluded from indexing.
- **Free-form agent chat is live** and hardened after the 13 April AgentMessage table fix.
- **Transactional email templates are live** — do not rewrite them without deliberate intent.

Recent shipped commits:
- 22 April local-worktree deploys — EN/TR surface cleanup, Google Ads tag install, products page simplification, removal of fake new-workspace card, tighter products spacing/header
- `0ec4162f` — simplify growth kickoff for onboarding flow (remove banner/tracker/coach card)
- `3bcc21c4` — add directional slide-fade animation to onboarding step transitions
- `ea1b6ee8` — harden auth: remove fallback secrets, add rate limiting, sanitize error messages
- `c1d52af5` — lower bcrypt cost factor 10→8 on all auth routes
- `312c3026` — hide nav controls and remove trust note on empty product state
- `abad3fa7` — tighten AARRR gate to LIVE+GROWING, fix MetricSetupSelector auto-fill in onboarding
- `9c6eefed` — refresh handoff docs for 16 April
- `2dc2f428` — strengthen GROWING-stage onboarding kickoff with inline AARRR setup

---

## 3. Open Product / Engineering Findings

### 1. The highest-priority unknowns are product questions, not code questions

These remain unanswered as of 22 April:

- **Does the AI actually help real founders?** Recommendations have not been tested with real non-founder users on real products. This is the most important open question.
- **Is the core loop sticky?** Create product → enter metrics → receive diagnosis → create tasks → repeat. Whether users return after the first session is unknown.
- **Does onboarding-to-value work?** Fresh user → onboarding → Growth diagnosis has been improved but not cleanly validated with a real first-time user.

### 2. Signup and first-run continuity are still the biggest product risk

Fresh signup itself is not yet stable enough to trust:
- On 22 April live validation, signup submit did not redirect within 25s after password entry.
- Existing-account product creation did complete, but the user was then sent back into setup: post-create summary → Growth check-in → Metrics setup, with no clear first value moment.

### 3. Onboarding-to-value still feels like setup recursion

Live founder testing on 22 April showed this sequence on a newly created launched product:
- product created summary page
- CTA into metric setup
- Growth asks for a short check-in before setup can help
- Metrics still starts at `0` selected metrics / `0` entries
- Tasks remains empty

This means the user still does not reach a concrete value moment quickly enough.

### 4. AI/helpfulness and task creation are still not proven

Live agent checks on 22 April showed:
- Overview: no visible suggestion cards, no reachable chat input
- Growth: suggestion cards visible, but clicking did not produce a confirmed task count increase
- Launch: context-aware answer still works

The product cannot yet claim that AI reliably helps or that suggestion cards reliably convert into execution.

### 5. Nav links only appear once a product exists

This is intentional behavior. The test confirmed: with no product, nav shows only "Overview". Growth, Metrics, Tasks, Pre-launch links appear only after a product is created. A new user's first session is essentially one-path: create product → onboarding.

### 6. Dashboard and tasks remain the slowest authenticated surfaces

TTFB and load improved on 14 April, but `/dashboard` and `/tasks` are still the heaviest pages. Continue query profiling if users report lag.

---

## 4. What Must Not Regress

1. No fake product created on signup
2. Launched products must not see pre-launch language, nav, or UX
3. Growth guidance must stay diagnosis-led — never generic startup advice
4. Metric entry must remain tied to configured metrics
5. AI must not speculate when evidence is weak
6. User-written product description remains central context for all AI calls
7. English is the master locale
8. Agent panel cards must create tasks — not send chat messages
9. Billing must not be presented as real Stripe commerce
10. `HIGH` priority means a true blocker only
11. Do not rewrite live email templates without intent
12. Do not regress the GROWING onboarding path back into a vague AARRR preview

---

## 5. Known Debt

- **Billing**: still fake/demo activation
- **Public root waitlist behavior**: `/{locale}` is intentionally waitlist-first. Do not treat the absence of a direct signup CTA there as a product bug. Use `/{locale}/yayinda` when evaluating the real landing surface.
- **i18n gaps**: major authenticated-surface leaks were cleaned up on 22 April, but treat locale consistency as an active regression area and recheck any newly touched screen
- **Roadmap integrations**: RevenueCat, App Store Connect, Google Play, ads connectors are UI-first only
- **`Product.launchGoals`**: legacy field — do not build new logic on it
- **Growth kickoff check-in**: `goalKey` from onboarding is already set, so the `growth_goal` question is skipped — but `acquisition_source` and similar questions still run even though some were asked during onboarding. Deduplication is pending.
- **Dashboard first impression**: sharp enough to not confuse, but not yet sharp enough to delight
- **Onboarding value moment**: product creation currently hands the user into another setup loop instead of a clear first payoff
- **AI/task bridge**: launch is stronger than overview/growth; surface consistency is still weak
- **Email delivery**: `RESEND_FROM_EMAIL` must be `Tiramisup <hello@tiramisup.app>` in Vercel env
- **Public repo secret history**: previously exposed credentials (Gemini, OpenAI keys) must still be treated as compromised
- **Notion release logging is now mandatory for every production version.** Update the canonical handoff page before release signoff: `https://www.notion.so/34ba251bad488125b83cd2dbc5d0a1c3`

---

## 6. First-Day Setup

```bash
git clone <repo-url> && cd Tiramisup
npm install
npx prisma generate
npx prisma db push
npm run dev   # runs on :3002
```

Verify:
```bash
npx tsc --noEmit
npx next build
QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run
```

Production E2E (real user journey):
```bash
E2E_BASE_URL="https://tiramisup.app" \
E2E_EMAIL="<verified-account>" \
E2E_PASSWORD="<password>" \
npx playwright test prod-real-user-journey --config playwright-prod.config.ts --headed
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

### Nav structure (stage-aware)

| Product status | Nav items shown |
|---|---|
| PRE_LAUNCH | Overview · Launch |
| LAUNCHED / GROWING | Overview · Metrics · Growth |
| No product | Overview only |

### Growth workspace modes

```
intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
```

### AI provider chain (must not change)

1. Qwen (`qwen-plus`)
2. DeepSeek (`deepseek-chat`)
3. Gemini (`gemini-2.0-flash`, `GEMINI_API_KEY`)
4. Gemini backup (`gemini-2.0-flash`, `GEMINI_API_KEY_2`)
5. Static fallback — no crash

---

## 9. Environment Variables

```bash
# AI
QWEN_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
GEMINI_API_KEY_2

# Auth
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
SUPABASE_SERVICE_ROLE_KEY

# OAuth
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
STRIPE_CLIENT_ID
STRIPE_SECRET_KEY
STRIPE_PUBLISHABLE_KEY
STRIPE_WEBHOOK_SECRET
STRIPE_REDIRECT_URI
```

---

## 10. Access Transfer Checklist

- GitHub repo access
- Vercel project access (`zerocekos-projects/tramisup`)
- Supabase project access (`ojecebxxcbxrofnbkaae`, eu-west-3)
- Google Cloud Console access (OAuth)
- Stripe Dashboard access
- Resend account access
- Domain / DNS access for `tiramisup.app`
- All Vercel production environment variables
