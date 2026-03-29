# Project Snapshot - 29 March 2026

**Purpose:** Fast, accurate snapshot for handoff and deployment checks.

---

## Current Product State

- EN/TR locale support is live; default locale is English.
- Onboarding is a modal-style multi-phase wizard at `/{locale}/onboarding`.
- Onboarding can hand off directly to Integrations when source intent includes `GA4` or `Stripe`.
- Growth setup is source-aware: connected providers influence selectable/auto-supported metric options.
- Metrics system source of truth is `MetricSetup` + `MetricEntry` (not `Product.launchGoals`).

---

## Build & Tests

- `npm run build`: passing (latest local run).
- Unit tests: expected baseline is 68 passing (Vitest, with dummy AI keys).
- Known lint warnings: existing `<img>` warnings in:
  - `app/[locale]/waitlist/thank-you/page.tsx`
  - `components/DashboardNav.tsx`

---

## Key Runtime Flows

1. Signup (`/{locale}/signup`) with access code `TT31623SEN`
2. Onboarding (`/{locale}/onboarding`) collects product context
3. Product created via `POST /api/products`
4. Optional onboarding source handoff:
   - redirect to `/{locale}/integrations?onboarding=1&connect=...`
5. Integrations setup wizard (GA4/Stripe)
6. Growth metric setup (`/{locale}/growth`)
7. Daily entries + trends (`/{locale}/metrics`)

---

## Integration + Sync Notes

- Providers live now: `GA4`, `STRIPE`.
- GA4 sync supports explicit modes:
  - `overwrite`
  - `missing_dates`
- Synced data bridges from legacy `Metric` rows into `MetricEntry` via `lib/sync-to-metric-entry.ts`.

---

## Docs Source of Truth

For operational handoff details, use:
- `HANDOFF.md` (execution-focused, current state)
- `CLAUDE.md` (project rules, architecture, runbook)
- `README.md` (product + flow overview)

