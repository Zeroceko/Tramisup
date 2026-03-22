# S5 Smoke Test Results

**Date:** 2026-03-22
**Environment:** Local dev (localhost:3000)
**Tester:** QA automation (Playwright)
**Test file:** `tests/e2e/s5-smoke.spec.ts`
**Config:** `playwright-s5.config.ts`
**Result:** 8/8 passed

---

## Auth Guards

✅ Pre-launch redirect — `/tr/pre-launch` unauthenticated → redirects to `/tr/login` (HTTP server-side redirect confirmed)
✅ Tasks redirect — `/tr/tasks` unauthenticated → redirects to `/tr/login`
✅ Metrics redirect — `/tr/metrics` unauthenticated → redirects to `/tr/login`
✅ Growth redirect — `/tr/growth` unauthenticated → redirects to `/tr/login`

---

## Operator Loop

✅ LaunchButton visible on pre-launch — product with `status=PRE_LAUNCH` renders "Ürünümü launch ettim →" button, enabled
✅ LaunchButton click → status updates → dashboard growth mode — clicking button calls `PATCH /api/products/[id]`, redirects to `/tr/dashboard`, dashboard shows "Growth checklist" in quick actions (not "Launch checklist")
✅ Growth checklist visible and toggleable — `/tr/growth` renders `GrowthChecklistSection` with 12 items; clicking a toggle item flips the `line-through` class (optimistic update confirmed) and the circle indicator changes from `border-[#d9d9d9]` to `border-[#75fc96] bg-[#75fc96]`

---

## Bugs Found

### BUG-01 — Stale dev server returns HTTP 500 for all routes (CRITICAL, environment-level)

**Severity:** Critical (blocks all E2E testing)
**Symptom:** The Next.js process (PID 73099) that was running before this test session was returning `HTTP 500 Internal Server Error` for every route including `/tr/login`. All pages returned `Internal Server Error` as body with no stack trace.
**Root cause:** The process was a stale `next-server (v15.5.14)` that had been running since Saturday (2026-03-20). It had likely crashed or lost DB connection internally while remaining bound to port 3000.
**Resolution:** `kill -9 73099`, restart with `npm run dev`. All routes returned to normal (200/302).
**Impact on S5:** Would have caused all 8 tests to fail with false negatives. Tests were run against the fresh server.

---

### BUG-02 — `admin@tiramisup` password `t1ram1sup` does NOT work in local DB (MEDIUM)

**Severity:** Medium (credential mismatch between environments)
**Symptom:** Login with `admin@tiramisup` / `t1ram1sup` returns 401 in local dev. The user row exists in the local DB but `bcrypt.compare('t1ram1sup', hash)` returns `false`.
**Root cause:** The local DB (`localhost:5432/tramisu`) has a different password hash for `admin@tiramisup` than what the Sprint 4 brief specifies. The account was likely created with a different password locally, and the `t1ram1sup` credentials apply to the production Supabase DB.
**Workaround used:** Tests ran as `e2e-shared@tiramisup.test` / `password123` (existing test fixture user with verified local hash and PRE_LAUNCH products).
**Impact:** Anyone trying to test locally with `admin@tiramisup` / `t1ram1sup` will fail login silently (redirected back to `/tr/login` with no error beyond the 401 in network tab). The login page does show "E-posta veya şifre hatalı" error correctly, so error display is fine.

---

## Notes

- Auth guards use `getServerSession` + `redirect(/${locale}/login)` — server-side, no client-side round-trip. Redirects happen before page content renders.
- The `GrowthChecklistSection` toggle uses optimistic update (state updates immediately on click) + `PATCH /api/growth-checklist/[id]` for persistence. Both layers confirmed working.
- After OL-02 ran, the product status was changed to `LAUNCHED`. DB was reset to `PRE_LAUNCH` for idempotency of this test run.
- The `admin@tiramisup` user exists in local DB (created 2026-03-20) but with unknown password. The e2e test user is the correct fixture for local smoke tests.
