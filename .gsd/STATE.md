# Tiramisup — State Snapshot

**Date:** 22 March 2026
**Sprint:** 4 complete
**Source of truth:** HANDOFF.md + S5_SMOKE_TEST.md

---

## Production

| Property | Value |
|---|---|
| URL | https://tramisup.vercel.app |
| Status | Live and functional |
| Hosting | Vercel (auto-deploys from `main`) |
| DB | Supabase PostgreSQL — project `ojecebxxcbxrofnbkaae`, region `eu-west-3` |
| DB note | Free tier pauses after 7 days inactivity — unpause in Supabase dashboard before debugging 500s |

**Vercel env vars (all set and clean):**
- `DATABASE_URL` — Session Pooler, port 5432, no `?pgbouncer=true`
- `DEEPSEEK_API_KEY` — primary AI provider
- `GEMINI_API_KEY` — fallback AI provider
- `RESEND_API_KEY` — NOT set in Vercel production; email sending falls back to console log

---

## Surfaces

| Route | Status | Notes |
|---|---|---|
| `/{locale}` (landing) | Working | CTA opens WaitlistModal; refreshed messaging and layout as of Sprint 4 |
| `/{locale}/waitlist/thank-you` | Working | Redirect destination after waitlist submission |
| `/{locale}/signup` | Working | Requires access code — static `TT31623SEN` or DB-generated invite code |
| `/{locale}/login` | Working | Credentials auth; shows "E-posta veya şifre hatalı" on bad credentials |
| `/{locale}/dashboard` | Working | Adapts content for PRE_LAUNCH (launch checklist) vs LAUNCHED (growth checklist); AI insights card for products with URL |
| `/{locale}/products/new` | Working | 6-step wizard; optional URL scrape; AI plan generation (DeepSeek → Gemini → static seed fallback) |
| `/{locale}/products` | Working | Product listing; session-guarded |
| `/{locale}/pre-launch` | Working | Launch checklist + score + LaunchButton; session-guarded (redirect to login if unauthenticated) |
| `/{locale}/tasks` | Working | Task list + status toggle; session-guarded; ownership check on PATCH |
| `/{locale}/metrics` | Working | Metric entry form + chart; session-guarded; form validates empty submit; ownership check on POST |
| `/{locale}/growth` | Working | GrowthChecklistSection with toggle (optimistic update + DB persist); goals + routines present; session-guarded |
| `/{locale}/admin/waitlist` | Working | Admin-only (admin@tiramisup); lists waitlist entries; approve → generates invite code; unauthenticated → login redirect; non-admin → "Yetkisiz Erişim" |
| `/{locale}/integrations` | Partial | UI shell present with v1 banner; no real data sync |
| `/{locale}/settings` | Unknown | Page exists; contents not verified in Sprint 3 or 4 |

---

## Key Flows

### Verified end-to-end (local dev, Sprint 4 S5 smoke test — 8/8 passed):

| Flow | Result |
|---|---|
| Unauthenticated `/tr/pre-launch` → redirect to `/tr/login` | Passed |
| Unauthenticated `/tr/tasks` → redirect to `/tr/login` | Passed |
| Unauthenticated `/tr/metrics` → redirect to `/tr/login` | Passed |
| Unauthenticated `/tr/growth` → redirect to `/tr/login` | Passed |
| PRE_LAUNCH product → pre-launch page shows "Ürünümü launch ettim →" button | Passed |
| LaunchButton click → PATCH `/api/products/[id]` → status LAUNCHED → dashboard switches to growth mode | Passed |
| `/tr/growth` renders GrowthChecklistSection; toggle flips UI state + persists via PATCH | Passed |

### Verified in production (manual, HANDOFF.md):
- Landing → waitlist modal → submit → thank-you redirect
- Signup with `TT31623SEN` → login → dashboard empty state → product wizard → product created → dashboard with data
- Admin panel: login as admin, view waitlist, approve entry → invite code generated and shown in table

### Not yet verified in production:
- Full PRE_LAUNCH → LaunchButton → LAUNCHED → growth content flow (production browser smoke test pending)
- Email delivery (RESEND_API_KEY not set in Vercel)

---

## Known Issues

| ID | Severity | Description | Status |
|---|---|---|---|
| BUG-01 | Env-level | Stale Next.js dev server returns HTTP 500 for all routes — kill and restart resolves it | Documented; `rm -rf .next && npm run dev` is the fix |
| BUG-02 | Medium | `admin@tiramisup` password `t1ram1sup` does not match local DB hash — works in production Supabase only | Documented; use e2e test fixture user for local smoke tests |
| MISSING-01 | Medium | `RESEND_API_KEY` not set in Vercel production — email sending is wired in code but falls back to console.log | Needs Vercel env var addition + Resend domain verification |
| DEFERRED-01 | Low | AI insights re-scrapes URL on every "Analiz et" click — no caching | Deferred to future sprint |
| DEFERRED-02 | Low | Multi-product switcher UI not built — schema supports multiple products but UX does not expose switching | Deferred to M004 |
| DEFERRED-03 | Low | Password reset and email verification not implemented | Deferred; not critical for early-access phase |
| DEFERRED-04 | Low | `/{locale}/settings` page content not verified | Needs review |
| DEFERRED-05 | Low | Kanban board experience not implemented — task status toggle works but no board view | Deferred to M003/S04 |

---

## AI / External Services

| Service | Purpose | Status |
|---|---|---|
| DeepSeek | Primary AI provider — product plan generation + URL analysis | Wired; API key set in Vercel |
| Gemini | Fallback AI provider — used if DeepSeek fails | Wired; API key set in Vercel |
| Static seed | Final fallback — hardcoded plan template if both AI providers fail | Wired; no key needed |
| Resend | Transactional email — invite code delivery on waitlist approval | Code wired (`lib/email.ts`, `sendInviteEmail`); API key NOT set in Vercel; emails log to console only |

---

## Test Coverage

| Suite | Count | Status |
|---|---|---|
| Vitest unit tests | 58 | All passing |
| Playwright E2E (waitlist config) | 16 | All passing |
| Playwright E2E (S5 smoke — Sprint 4) | 8 | All passing |
| **Total** | **82** | **All passing** |
