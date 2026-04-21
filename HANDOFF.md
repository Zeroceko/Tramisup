# Tiramisup - Team Handoff Document

**Date:** 21 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (`main` auto-deploys to Vercel)
**Current active `main` line:** includes all commits through `0ec4162f`
**Status:** Production is live. The April 16 reCAPTCHA blocker is now resolved — fresh signup works end-to-end and was confirmed by automated testing on 21 April. The current active line includes security hardening, onboarding polish, and a simplified growth kickoff.

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

As of **21 April 2026**, these are true in production:

- `tiramisup.app` is live on the current `main` line.
- Public landing is **waitlist-first** — "Join waitlist" is an inline email capture form, not a link to the signup page. A new user who wants to create an account must navigate directly to `/en/signup`. This is a known UX gap.
- Signup requires email verification. No early access code is required.
- Fresh signup confirmed working (21 April): name + product type + email (step 1) → password (step 2) → `/verify-email` screen → email link → auto-login into app.
- **Email verification auto-logs the user in**: clicking the link verifies the account and signs the user in without re-entering credentials.
- Billing is still **fake/demo checkout** — not real Stripe commerce.
- AI guidance remains **stage-aware** and must not invent advice when evidence is weak.
- **Nav is stage-aware**: pre-launch → Overview + Launch; launched/growing → Overview + Metrics + Growth.
- **AARRR metrics step in onboarding** is shown for LIVE and GROWING stages (not just GROWING). This was tightened on 21 April.
- **Growth kickoff (`/growth?onboarding=1`) is now a single-focus screen**: only the check-in form is shown. The "tamamlananlar" banner, AARRR signal grid, progress tracker, and coach card are all hidden when `?onboarding=1` is present.
- **Empty dashboard state is clean**: when no product exists, the settings gear, product selector, and "Add product" link are hidden. First-run screen no longer shows a "No fake data" trust note.
- **Onboarding step transitions are animated**: directional slide-fade (forward/backward) when navigating between steps.
- **Auth security is hardened**: bcrypt cost factor is 8 (was 10, caused 5–10s signup latency on Vercel), rate limiting on signup (5/15min per IP) and forgot-password (3/15min per IP), NEXTAUTH_SECRET fallback removed (throws instead of silently using empty string), error messages sanitized.
- **Agent panel cards are all task-creation**: every card creates a task when clicked. No "ask"-intent cards remain.
- **Growth diagnosis is data-driven**: includes actual metric values and is locale-aware (EN/TR).
- **Admin ops panel is live** under `/{locale}/admin/*` — overview, users, products, billing, AI usage, waitlist. Allowlist-protected and excluded from indexing.
- **Free-form agent chat is live** and hardened after the 13 April AgentMessage table fix.
- **Transactional email templates are live** — do not rewrite them without deliberate intent.

Recent shipped commits:
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

These remain unanswered as of 21 April:

- **Does the AI actually help real founders?** Recommendations have not been tested with real non-founder users on real products. This is the most important open question.
- **Is the core loop sticky?** Create product → enter metrics → receive diagnosis → create tasks → repeat. Whether users return after the first session is unknown.
- **Does onboarding-to-value work?** Fresh user → onboarding → Growth diagnosis has been improved but not cleanly validated with a real first-time user.

### 2. Signup works, but the path from landing is broken

Fresh signup itself is functional. The problem is discovery:
- Landing "Join waitlist" doesn't go to `/signup` — it's an inline email form that stays on the landing page.
- There is no nav link to `/signup` from the public landing.
- A new user who wants to sign up must know the URL or find it from a shared link. This is a high-friction acquisition gap.

### 3. Growth kickoff check-in form selector needs tuning

Automated testing shows the check-in form text matcher (`acquisition|check.in|değerlendirme|how did|nasıl`) doesn't reliably detect the form. The form likely renders, but the test selector needs updating to match the actual copy in `GrowthTransitionCheckin`.

### 4. Nav links only appear once a product exists

This is intentional behavior. The test confirmed: with no product, nav shows only "Overview". Growth, Metrics, Tasks, Pre-launch links appear only after a product is created. A new user's first session is essentially one-path: create product → onboarding.

### 5. Dashboard and tasks remain the slowest authenticated surfaces

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
- **Landing → signup path**: no direct link; acquisition is invisible
- **i18n gaps**: some authenticated copy still has hardcoded strings
- **Roadmap integrations**: RevenueCat, App Store Connect, Google Play, ads connectors are UI-first only
- **`Product.launchGoals`**: legacy field — do not build new logic on it
- **Growth kickoff check-in**: `goalKey` from onboarding is already set, so the `growth_goal` question is skipped — but `acquisition_source` and similar questions still run even though some were asked during onboarding. Deduplication is pending.
- **Dashboard first impression**: sharp enough to not confuse, but not yet sharp enough to delight
- **Email delivery**: `RESEND_FROM_EMAIL` must be `Tiramisup <hello@tiramisup.app>` in Vercel env
- **Public repo secret history**: previously exposed credentials (Gemini, OpenAI keys) must still be treated as compromised

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
