# Tiramisup - Team Handoff Document

**Date:** 12 April 2026
**Production:** `https://tiramisup.app`
**Repo:** GitHub (`main` auto-deploys to Vercel)
**Current live app release on `main`:** `93c8a82f`
**Status:** Live, stable, handoff-ready

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

---

## 2. Current Production Truth

As of **12 April 2026**, these are true in production:

- `tiramisup.app` is live and serving the current `main` line.
- Public landing is still **waitlist-first**.
- Signup no longer requires an early access code.
- Signup and waitlist both use **email verification**.
- Onboarding supports **file upload**, **Google Drive / URL context**, and **async plan generation**.
- Locale preference is persisted to both DB and cookie, and settings-side language switching redirects to the correct localized route.
- Billing is still **fake checkout / demo activation**, not real Stripe payments.
- AI guidance remains **stage-aware** and must not invent advice when evidence is weak.
- **Nav is now stage-aware**: pre-launch products see Overview + Launch; launched/growing products see Overview + Metrics + Growth.
- **Growth intake gate**: launched/growing products without a completed growth check-in are redirected to `/growth` before seeing the dashboard.
- **Growth diagnosis is data-driven**: includes actual metric values (current, baseline, rate) and is locale-aware (EN/TR).
- **Agent panel cards are all task-creation**: no more "ask"-intent cards that sent text to chat. Every card creates a task when clicked.

Recent shipped commits on the live line:
- `93c8a82f` — agent panel all-task fix, remove ask intent
- `470c1e58` — growth diagnosis data-driven + locale-aware, category labels translated
- `8defc50f` — stage-aware nav, Metrics as standalone nav item, growth intake gate on dashboard
- `80fbb9f5` — growth workflow hardening with intake-driven setup
- `7c8bf648` — locale switch fix from settings/account

---

## 3. First-Day Setup

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
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

**Local dev runs on port `3002`** — Google and Stripe OAuth redirect settings are aligned to this port.

---

## 4. Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| UI | React 19, Tailwind CSS 3 |
| Language | TypeScript (strict) |
| Database | PostgreSQL via Supabase |
| ORM | Prisma 6 |
| Auth | NextAuth 4 (Credentials + JWT) |
| i18n | next-intl (`en`, `tr`, default `en`) |
| AI | Qwen -> DeepSeek -> Gemini -> Gemini backup -> static fallback |
| Email | Resend |
| Storage | Supabase Storage |
| Hosting | Vercel |
| Testing | Vitest + Playwright |

---

## 5. Architecture Overview

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

### Growth intake gate

Launched/growing products that have not completed the growth check-in are redirected from `/dashboard` to `/growth`, which shows the intake form. The gate is in `app/[locale]/dashboard/page.tsx`.

### Growth workspace modes

```
intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
```

Intake answers stored in `Product.additionalContext.growthCheckin`.

### Growth diagnosis

`lib/funnel-health.ts` builds the funnel health summary:
- Locale-aware (EN/TR) — accepts `locale` parameter
- Data-driven: `nextFocus` text includes actual metric values, direction, and rate vs target
- Called from both `app/[locale]/growth/page.tsx` and `app/[locale]/dashboard/page.tsx`

### Agent panel (left sidebar)

`components/AgentChatPanel.tsx` — all suggestion cards use `createTaskFromSuggestion`:
- Clicking any card creates a task immediately via `POST /api/actions`
- No "ask"-intent cards remain — the panel is an "AI-suggested next actions" list
- Suggestion content is product-specific and generated deterministically in `app/api/agent/suggestions/route.ts`
- Chat input at the bottom is for free-form questions to the AI

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

## 6. Rules That Must Not Break

1. **No fake product on signup.** Product data begins only after onboarding.
2. **Launched products must not get pre-launch language or nav.**
3. **Growth must stay diagnosis-led, not generic startup advice.**
4. **Metric entry must stay tied to configured metrics.**
5. **AI must not speculate without evidence.**
6. **User-written product description remains central context.**
7. **English is the master locale.** Default is `en`.
8. **`HIGH` priority means a true blocker only.**
9. **Agent panel cards create tasks — they do not open chat.**
10. **Public landing remains waitlist-first unless explicitly decided otherwise.**
11. **Billing is not real payments. Do not present it as complete Stripe commerce.**

---

## 7. Known Debt

- **Billing**: still fake checkout / demo activation
- **i18n gaps**: some authenticated copy still has hardcoded strings
- **Roadmap integrations**: RevenueCat, App Store Connect, Google Play Console, ads connectors are UI-first only
- **`Product.launchGoals`**: legacy field, do not build new logic on it
- **"Launch to Growth" tagline**: shown in the logo/nav — misleading for users who already launched. Needs product decision.
- **Dashboard first impression**: what a user sees on first login after onboarding is still not sharp enough. Needs product work.

---

## 8. Database and Schema

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

## 9. Environment Variables

```bash
# AI
QWEN_API_KEY
DEEPSEEK_API_KEY
GEMINI_API_KEY
GEMINI_API_KEY_2

# Auth / app
NEXTAUTH_SECRET
NEXTAUTH_URL
NEXT_PUBLIC_APP_URL

# Database
DATABASE_URL        # PgBouncer — port 6543
DIRECT_URL          # Direct Postgres — port 5432

# Email
RESEND_API_KEY
RESEND_FROM_EMAIL

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

---

## 10. Pre-Release Smoke Checklist

Before shipping any meaningful change:

- [ ] `npx tsc --noEmit` passes
- [ ] `npx next build` passes
- [ ] `OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run` — all pass
- [ ] `/en` and `/tr` both load
- [ ] Signup → email verify → login flow works
- [ ] Waitlist join → email verify flow works
- [ ] Onboarding creates product, file upload works, async plan generates
- [ ] Pre-launch product sees Overview + Launch in nav (not Metrics/Growth)
- [ ] Launched/growing product sees Overview + Metrics + Growth in nav (not Launch)
- [ ] Launched product without growth check-in redirects from dashboard to `/growth`
- [ ] Settings/account language change moves to the correct locale route
- [ ] Non-mobile web products do not get App Store / Google Play guidance
- [ ] Agent panel cards create tasks when clicked — not chat messages

---

## 11. Access Transfer Checklist

- GitHub repo access
- Vercel project access (`zerocekos-projects/tramisup`)
- Supabase project access (`ojecebxxcbxrofnbkaae`, eu-west-3)
- Google Cloud Console access (OAuth)
- Stripe Dashboard access
- Resend account access
- Domain / DNS access for `tiramisup.app`
- All Vercel production environment variables
