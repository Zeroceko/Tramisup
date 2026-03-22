# Tiramisup - Handoff

**Last Updated:** 22 March 2026 (session 3 — Sprint 3 + 4)
**Status:** MVP operator loop complete, production live and functional

---

## Executive Summary

Tiramisup is stable locally and in production. All tests pass, build is clean, and the full onboarding spine works end-to-end including AI plan generation on product creation.

What is now true:
- Public landing → waitlist → early-access signup → dashboard → product creation flow works end-to-end in production
- Product creation triggers AI plan (DeepSeek primary, Gemini fallback, static seed final fallback)
- URL scraping: wizard accepts optional URL, AI analyzes landing page / GitHub / App Store content
- `launchStatus` maps to `product.status` (LAUNCHED vs PRE_LAUNCH) on product creation
- Pre-launch page has "Ürünümü launch ettim →" button — PATCH /api/products/[id] updates status
- Dashboard adapts content for PRE_LAUNCH (launch checklist) vs LAUNCHED (growth checklist)
- Dashboard AI insights card ("Sitende ne eksik?") appears for products with URL — on-demand analysis
- Growth page has interactive GrowthChecklistSection with toggle
- All authenticated inner surfaces (pre-launch, tasks, metrics, growth) redirect to login if unauthenticated
- Metrics form validates empty submit; ownership checks on metrics + task APIs
- Admin panel exists at `/{locale}/admin/waitlist` with auth (admin@tiramisup only)
- DB-backed invite codes: admin approve → unique code generated → stored on Waitlist row
- Signup accepts DB invite codes OR static fallback `TT31623SEN`
- Email sending: `lib/email.ts` + `sendInviteEmail` wired and triggered on approval — needs `RESEND_API_KEY` in Vercel to actually send (currently logs to console)
- All internal links are locale-prefixed (`/{locale}/...`) — no broken `/products` etc.
- 58 unit tests pass locally; build is clean
- No fake seed data on signup
- Supabase is active (was temporarily paused — now resumed)

---

## Current Onboarding Flow

### 1. Landing
- `/tr` or `/en`
- Primary CTA opens WaitlistModal

### 2. Waitlist
- Modal: name + email → POST `/api/waitlist/join` → redirect to `/{locale}/waitlist/thank-you`
- Modal also has **"Erken erişim kodum var"** link → goes to signup

### 3. Early-Access Signup
- Route: `/{locale}/signup`
- Requires: name, email, password, access code
- **Current static access code: `TT31623SEN`**
- Creates user only — no auto-product, no fake seed data

### 4. Dashboard (first-time user)
- Route: `/{locale}/dashboard`
- If no product: clean empty state with "İlk ürününü oluştur" CTA
- If has product: normal dashboard

### 5. Product Creation
- `/{locale}/products/new` — full wizard

---

## Production

**URL:** https://tramisup.vercel.app

**Status: Live and functional** (Supabase active, all env vars clean)

**Supabase:**
- Project ID: `ojecebxxcbxrofnbkaae`, region: `eu-west-3`
- Free tier pauses after 7 days inactivity → if production returns 500s mysteriously, check Supabase dashboard first and resume
- After resuming, no code changes needed — env vars are already correct

**Admin account:**
- Email: `admin@tiramisup`, password: `t1ram1sup`
- If account doesn't exist on production: signup at `/tr/signup` with code `TT31623SEN`
- Admin panel: `https://tramisup.vercel.app/tr/admin/waitlist`

**Vercel env vars (all clean — no trailing `\n`):**
- `DATABASE_URL` — Session Pooler, port 5432, no `?pgbouncer=true`
- `DEEPSEEK_API_KEY` — primary AI provider
- `GEMINI_API_KEY` — fallback AI provider
- ⚠️ When updating env vars via CLI, use `printf 'value' | vercel env add KEY production` — NOT `echo` (adds trailing newline that silently corrupts keys and DB connection)

**Vercel:**
- Auto-deploys from `main` branch

---

## Admin Panel

Route: `/{locale}/admin/waitlist`

- Requires login as `admin@tiramisup` (any email can login; only this one gets admin access)
- Shows all waitlist entries with approve/reject controls
- Unauthenticated → redirect to login with callbackUrl
- Non-admin → "Yetkisiz Erişim" message

API routes protected:
- `PATCH /api/waitlist/[id]` — approve/reject
- `DELETE /api/waitlist/[id]` — delete entry

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS 3 |
| Auth | NextAuth 4 (Credentials + JWT) |
| ORM | Prisma 7 |
| DB | PostgreSQL (Supabase) |
| i18n | next-intl, locales: `tr` (default), `en` |
| Testing | Vitest (unit) + Playwright (E2E) |
| Hosting | Vercel |

---

## Key Architecture Notes

### i18n Routing
All routes under `app/[locale]/`. Locale prefix is **always required** in links:
```typescript
// CORRECT
href={`/${locale}/dashboard`}
href={`/${locale}/products/new`}

// WRONG (causes 404)
href="/dashboard"
href="//products"
```
Default locale: `tr`. Auth signIn path must be locale-prefixed: `/tr/login`.

### Auth Flow
- `lib/auth.ts` → NextAuth with Credentials provider
- `authOptions.pages.signIn = '/tr/login'`
- `getServerSession(authOptions)` in server components
- JWT strategy (no DB sessions table)

### Access Code Logic
- Defined in `app/api/auth/signup/route.ts`
- Primary: DB lookup via `waitlist.inviteCode` (generated when admin approves an entry)
- Fallback: env var `EARLY_ACCESS_CODE` → defaults to `TT31623SEN`
- On successful use, `inviteCodeUsedAt` is set on the Waitlist row
- Admin can see invite codes in the admin panel table (APPROVED/INVITED entries)

### DB Schema Key Models
- `User` — app users
- `Product` — user's products (created post-signup via wizard)
- `Waitlist` — email collection (status: PENDING | APPROVED | INVITED | REJECTED)

---

## Dev Setup

```bash
npm install
npm run dev        # starts on :3000 (or :3001 if busy)
```

If dev server behaves nonsensically (500 errors, missing modules):
```bash
rm -rf .next
npm run dev
```

Local DB: uses `.env.local` → `DATABASE_URL` pointing to Supabase (or local Postgres).

---

## Running Tests

```bash
# Unit tests (58 tests)
npx vitest run

# E2E tests (16 tests) — dev server must be on :3000
npm run dev   # in one terminal
npx playwright test --config=playwright-waitlist.config.ts  # in another

# Full suite
npm test
```

All 74 tests should pass. If E2E fails with timeouts → restart dev server with `rm -rf .next && npm run dev`.

---

## Recent Commits (last session)

```
6dbf686 feat: sprint 4 S1-S3 — auth guards + metric/task security
677f375 feat: sprint 3 S4 — dashboard AI insights card
33f9c7e feat: sprint 3 — operator loop closure (S1-S5)
6b89ed7 feat: add URL analysis to wizard — AI reads landing page/GitHub/App Store content
df148c9 docs: update HANDOFF for 22 March 2026 state
```

---

## What Still Needs Work

### High Priority
1. **Production smoke test** — PRE_LAUNCH → LaunchButton → LAUNCHED → growth checklist full flow needs browser verification in production
2. **`RESEND_API_KEY` Vercel env** — `printf 'key' | vercel env add RESEND_API_KEY production` → approve a waitlist entry → confirm email arrives

### Medium Priority
3. AI insights caching — currently re-scrapes on every "Analiz et" click; expensive for frequently visited dashboards
4. Multi-product switcher UI (schema ready, UX not built — M004)

### Lower Priority
5. Şifre sıfırlama / email doğrulama
6. SEO, analytics, content polish
7. Real integrations / Stripe (M005)

---

## Important Project Truths

1. **Supabase free tier pauses** — if production breaks mysteriously after a week of inactivity, unpause DB first before debugging anything else.

2. **`.next` cache can corrupt** — `rm -rf .next && npm run dev` before chasing runtime ghosts.

3. **Locale prefix required everywhere** — any link without `/${locale}/` prefix will 404 or break auth redirects.

4. **DATABASE_URL trailing newline** — Vercel env var was fixed. Do not copy-paste the value with trailing `\n` when updating.

5. **Docs can drift ahead of code** — always verify with `npm run build` + browser flow, not just reading docs.

---

## Smoke Test Checklist

### Before shipping any change:
```
[ ] npm run build — passes
[ ] npx vitest run — all pass
[ ] E2E: landing → waitlist modal → submit → thank-you
[ ] E2E: signup with TT31623SEN → login → dashboard empty state
[ ] E2E: /tr/admin/waitlist → shows login redirect (if not authed)
```

### Production smoke test:
```
[ ] https://tramisup.vercel.app/tr loads
[ ] Waitlist form submits
[ ] Signup with TT31623SEN works
[ ] Login works
[ ] Dashboard empty state → product wizard → product created → dashboard with data
[ ] Dashboard shows AI insights card for product with URL
[ ] Pre-launch page shows "Ürünümü launch ettim →" button
[ ] Launch button → status LAUNCHED → dashboard shows growth content
[ ] /tr/growth shows GrowthChecklistSection with toggle
[ ] Unauthenticated /tr/pre-launch → redirect to /tr/login
[ ] /tr/admin/waitlist accessible with admin@tiramisup
[ ] Admin approve entry → invite code appears in table
```
