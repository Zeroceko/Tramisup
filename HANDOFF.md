# Tiramisup - Handoff

**Last Updated:** 22 March 2026 (session 2)
**Status:** MVP stabilized, production live and functional

---

## Executive Summary

Tiramisup is stable locally and in production. All tests pass, build is clean, and the full onboarding spine works end-to-end including AI plan generation on product creation.

What is now true:
- Public landing → waitlist → early-access signup → dashboard → product creation flow works end-to-end in production
- Product creation triggers AI plan (DeepSeek primary, Gemini fallback, static seed final fallback)
- Admin panel exists at `/{locale}/admin/waitlist` with auth (admin@tiramisup only)
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
- `VALID_ACCESS_CODE = 'TT31623SEN'` (uppercase, case-insensitive check)
- No `lib/accessCode.ts` — that file was deleted (was dead code)

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
8687ce6 feat: refresh landing page messaging and layout
5864d9d fix: improve admin panel auth UX and login callbackUrl support
c5f936e fix: locale-prefix all internal links across dashboard and thank-you page
2a53129 feat: add admin auth + align tests with access-code signup flow
c939547 fix: stabilize onboarding routes and navigation gating
```

---

## What Still Needs Work

### High Priority
1. Harden post-product-creation flow (wizard → active product → inner surfaces need real-data verification)
2. Verify every authenticated route works correctly with a real newly created product

### Medium Priority
3. DB-backed invite codes (currently static `TT31623SEN` — schema has `inviteCode` field but admin UI codegen not wired)
4. Email sending on waitlist approval (Resend installed, `lib/email.ts` exists, not triggered yet)

### Lower Priority
5. Admin auth hardening (`ADMIN_EMAIL` env var exists but not set on Vercel — falls back to `admin@tiramisup`)
6. SEO, analytics, content polish

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
[ ] /tr/admin/waitlist accessible with admin@tiramisup
```
