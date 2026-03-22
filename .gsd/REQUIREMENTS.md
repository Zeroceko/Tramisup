# Tiramisup — Requirements

**Last updated:** 22 March 2026
**Sprint:** 4 complete

Status legend:
- Done: implemented and verified by test or browser smoke test
- Partial: implemented but not fully validated or has known gaps
- Not started: not yet built

---

## R001 — Authentication & Access

The product must allow early-access users to sign up with an access code, sign in, and access a protected workspace. Unauthenticated users must be redirected to login.

| Sub-requirement | Status | Notes |
|---|---|---|
| Signup with access code (static `TT31623SEN`) | Done | Verified in production |
| Signup with DB-generated invite code (from admin approval) | Done | Code path verified; code generated on approval and checked at signup |
| Login with email + password (Credentials provider) | Done | JWT session; error message shown on bad credentials |
| All inner surfaces redirect unauthenticated users to `/{locale}/login` | Done | Pre-launch, tasks, metrics, growth all redirect server-side (Sprint 4 S1, verified by S5 smoke test) |
| Admin panel restricted to `admin@tiramisup` | Done | Non-admin sees "Yetkisiz Erişim"; unauthenticated redirected to login with callbackUrl |
| Password reset | Not started | Deferred; not critical for early-access phase |
| Email verification on signup | Not started | Deferred |

---

## R002 — Product Creation

Users must be able to create a product through a guided wizard. The wizard must accept an optional URL, generate an AI plan, and record the correct launch status.

| Sub-requirement | Status | Notes |
|---|---|---|
| 6-step product creation wizard | Done | `/{locale}/products/new` |
| Optional URL field — wizard accepts landing page, GitHub, App Store URLs | Done | URL stored as `product.website` |
| AI analysis of URL content for plan generation | Done | DeepSeek primary; Gemini fallback; static seed as final fallback |
| `launchStatus` → `product.status` mapping on creation | Done | "Launch oldu" / "Büyüme aşamasında" → LAUNCHED; all others → PRE_LAUNCH |
| No auto-seeded fake data on signup | Done | Clean empty state until user explicitly creates a product |
| Multi-product switcher UI | Not started | Schema supports multiple products; switching UX is M004 (deferred) |

---

## R003 — Launch Readiness

Users in PRE_LAUNCH state must be able to assess launch readiness via a structured checklist and manually transition to LAUNCHED status.

| Sub-requirement | Status | Notes |
|---|---|---|
| Pre-launch checklist with score | Done | `/{locale}/pre-launch` renders checklist + readiness score |
| "Ürünümü launch ettim →" LaunchButton on pre-launch page | Done | Visible when `product.status === PRE_LAUNCH` |
| LaunchButton → PATCH `/api/products/[id]` → status LAUNCHED | Done | Verified by S5 smoke test (operator loop OL-02) |
| Dashboard switches content after launch (launch checklist → growth checklist) | Done | Verified by S5 smoke test (OL-02) |
| Task system accessible from pre-launch surface | Done | `/{locale}/tasks` with status toggle (TODO → IN_PROGRESS → DONE); ownership check enforced |
| Ownership check on task PATCH (cannot modify another user's tasks) | Done | Sprint 4 S3 |
| Kanban board view | Not started | Deferred to M003/S04 |
| Production browser smoke test of full PRE_LAUNCH → LAUNCHED flow | Not started | Pending manual verification on https://tramisup.vercel.app |

---

## R004 — Metrics

Users must be able to manually record growth metrics and view them in the dashboard.

| Sub-requirement | Status | Notes |
|---|---|---|
| Metric entry form on `/{locale}/metrics` | Done | Form renders |
| POST `/api/metrics` writes metric to DB | Done | Sprint 4 S2 |
| Form validates empty submit with error message | Done | Sprint 4 S2 |
| Page updates after submit without full reload | Done | `revalidatePath` or `router.refresh` confirmed |
| Ownership check on metric POST | Done | Sprint 4 S2 |
| Metric chart/visualization on metrics page | Done | Chart renders existing data |
| Provider-backed automatic metric ingestion (Stripe, analytics) | Not started | M005 — deferred until after core loop is stable |

---

## R005 — Growth

Users in LAUNCHED state must be able to manage a growth checklist, goals, and routines in a dedicated surface.

| Sub-requirement | Status | Notes |
|---|---|---|
| Growth checklist with toggle on `/{locale}/growth` | Done | `GrowthChecklistSection` — 12 items; optimistic UI update confirmed |
| Toggle persists via PATCH `/api/growth-checklist/[id]` | Done | Verified by S5 smoke test (OL-03) |
| Goals section on growth page | Done | Present in `/{locale}/growth` |
| Routines section on growth page | Done | Present in `/{locale}/growth` |
| Dashboard AI insights card ("Sitende ne eksik?") | Done | Appears for products with `product.website`; on-demand analysis via `GET /api/products/[id]/insights` |
| AI insights caching (avoid re-scrape on every click) | Not started | Deferred; currently re-scrapes on each "Analiz et" click |
| Growth-readiness summary visible in dashboard after checklist activity | Done | Dashboard quick-actions update after launch status changes |

---

## R006 — Admin & Ops

The product must have an admin surface for managing the waitlist and generating invite codes.

| Sub-requirement | Status | Notes |
|---|---|---|
| Admin panel at `/{locale}/admin/waitlist` | Done | Lists all waitlist entries |
| Waitlist entries show status (PENDING, APPROVED, INVITED, REJECTED) | Done | |
| Approve → generates unique invite code → stored on Waitlist row | Done | |
| Invite code visible in admin table for APPROVED/INVITED entries | Done | |
| Reject waitlist entry | Done | |
| Delete waitlist entry | Done | DELETE `/api/waitlist/[id]` |
| Email invite code to user on approval | Partial | `sendInviteEmail` is called on approval; `RESEND_API_KEY` not set in Vercel production — emails log to console only |
| `RESEND_API_KEY` set in Vercel + delivery verified | Not started | Requires Vercel env var addition + Resend domain verification for tiramisup.com |
| `inviteCodeUsedAt` set on Waitlist row when code is used at signup | Done | |
| Fallback to console.log when `RESEND_API_KEY` absent | Done | Behavior preserved |

---

## Coverage Summary

| Requirement | Overall Status |
|---|---|
| R001 — Authentication & Access | Partial (password reset / email verification missing) |
| R002 — Product Creation | Partial (multi-product switcher UX not built) |
| R003 — Launch Readiness | Partial (kanban deferred; production smoke test pending) |
| R004 — Metrics | Partial (provider-backed ingestion not built) |
| R005 — Growth | Partial (AI insights caching not built) |
| R006 — Admin & Ops | Partial (email delivery not live — RESEND_API_KEY missing in production) |

**Core operator loop (signup → product creation → pre-launch → launch → growth) is fully implemented and verified locally. Production browser verification of the full loop is the primary outstanding item.**
