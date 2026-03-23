# Tiramisup — State Snapshot

**Date:** 23 March 2026
**Sprint:** First Run Clarity sprint in progress
**Source of truth:** `HANDOFF.md` + current verified code/runtime

---

## Production

| Property | Value |
|---|---|
| URL | https://tramisup.vercel.app |
| Status | Live MVP |
| Hosting | Vercel (auto-deploys from `main`) |
| DB | Supabase PostgreSQL |
| Product mode | Launch-to-growth workspace with staged onboarding and metric-first growth flow |

---

## Current product priority

This is not a marketing sprint.
This is a **product logic chain reset** around:

1. first-login onboarding
2. Growth vs Metrics separation
3. beginner-friendly metric language
4. metrics feedback loop
5. task-surface clarity
6. docs consistency

---

## Surfaces

| Route | Status | Notes |
|---|---|---|
| `/{locale}` (landing) | Working | Not the current sprint priority |
| `/{locale}/waitlist/thank-you` | Working | Thank-you screen after waitlist join |
| `/{locale}/signup` | Working | Early-access signup flow |
| `/{locale}/login` | Working | Credentials auth |
| `/{locale}/dashboard` | Working | No-product state shows welcome/profile onboarding and one primary CTA |
| `/{locale}/products/new` | Working | Product wizard with multi-select context, stage-aware inputs, and mobile platform capture |
| `/{locale}/products` | Working | Product list / selection surface |
| `/{locale}/pre-launch` | Working | Launch-prep surface; can remain relevant after launch for unfinished non-critical items |
| `/{locale}/tasks` | Working | Task surface now highlights one main task first before the broader list |
| `/{locale}/metrics` | Working | Selected-metric-only entry, trend chart, last-value hints, save feedback, and latest-vs-previous comparison |
| `/{locale}/growth` | Working | Growth setup and management surface; clearer distinction from Metrics |
| `/{locale}/admin/waitlist` | Working | Admin-only waitlist management |
| `/{locale}/integrations` | Partial | Lower-priority shell; not a core daily surface |
| `/{locale}/settings` | Exists | Not a current sprint focus |

---

## Verified current behavior

| Behavior | Status |
|---|---|
| ESLint | Passed on 23 March 2026 |
| Production build | Passed on 23 March 2026 |
| First-run dashboard copy reset | Implemented |
| Beginner-friendly metric copy reset | Implemented |
| Growth vs Metrics page framing | Implemented |
| Metrics feedback loop improvements | Implemented |
| Task spotlight surface | Implemented |

---

## Product chain (current)

### No product yet
- user signs up or logs in
- dashboard welcomes the user
- dashboard shows lightweight profile context
- one primary CTA sends the user to create their first product

### Pre-launch product
- dashboard points the user toward launch preparation
- Growth stays visible as the next stage
- Growth behaves like a preview/coming-next surface

### Launched product
- Growth asks: `Neyi takip edeceğiz?`
- user chooses one primary metric per AARRR category
- Metrics asks: `Bugün ne oldu ve ne değişti?`
- user enters daily values only for chosen metrics
- metrics cards/chart/history reflect the latest state
- tasks surface helps the user act on the next real job

---

## Known product truths

- No fake workspace should appear before the user creates a product
- No generic fake fallback launch/growth/task data should be generated if AI planning is unavailable
- Growth and Metrics must stay conceptually separate
- Metric jargon must stay beginner-friendly
- Tasks should feel like a work surface, not just a list
- Docs should trail verified code, not intent

---

## Open risks

| ID | Severity | Description |
|---|---|---|
| R-01 | Medium | Metric setup and metric entries still use temporary `Product.launchGoals` JSON storage |
| R-02 | Medium | Next-step orchestration across dashboard, growth, metrics, and tasks is better but not yet unified into one global progression model |
| R-03 | Medium | Founder Coach skill routing exists, but evidence-based recommendations still need deeper coupling to real user signals |
| R-04 | Low | Landing page work was intentionally deprioritized; public marketing surface may lag behind in-product quality |

---

## Near-term next steps

1. Replace temporary metric JSON storage with dedicated entities
2. Keep simplifying metric language where users still hesitate
3. Improve “what changed?” interpretation on metrics after more real data exists
4. Tighten cross-surface next-step logic
5. Continue updating docs as the logic reset lands
