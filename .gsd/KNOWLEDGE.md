# Project Knowledge

Append-only register of project-specific rules, patterns, and lessons learned.
Agents read this before every unit. Add entries when you discover something worth remembering.

## Rules

| # | Scope | Rule | Why | Added |
|---|-------|------|-----|-------|
| K001 | dev-server | Use port `3001` for local development | Port 3000 is occupied by another local app in this environment | 2026-03 |
| K002 | prioritization | Product workflows beat marketing polish | The user explicitly wants login/register/in-product functionality ahead of landing-page work | 2026-03 |
| K003 | docs | Treat README/HANDOFF claims as suspect until checked against code | Project docs have drifted ahead of implementation before | 2026-03 |
| K004 | auth | If `NEXTAUTH_SECRET` changes, expect stale cookie/JWT issues and clear browser session state before debugging deeper | Prevents wasting time on false auth regressions | 2026-03 |

## Patterns

| # | Pattern | Where | Notes |
|---|---------|-------|-------|
| P001 | Authenticated page shell | `AppShell`, `DashboardNav`, route layouts under `app/*/layout.tsx` | Protected pages use session check + shared shell |
| P002 | Product-scoped data access | Most app pages and API routes query by `productId` or first product for user | UX still assumes one active product, but data model is multi-product |
| P003 | Seeded demo workspace | `lib/seed.ts`, `app/api/auth/signup/route.ts`, `app/api/seed/route.ts` | First-run experience depends on seeded data for visibility |
| P004 | Progressive interactivity | Server page fetches data, client component mutates via API then `router.refresh()` | Used in checklist, tasks, goals, routines, integrations |

## Lessons Learned

| # | What Happened | Root Cause | Fix | Scope |
|---|--------------|------------|-----|-------|
| L001 | Dev server produced stale manifest / missing chunk errors even when build was green | Corrupt `.next` cache during iterative Next.js dev sessions | Kill dev server, remove `.next`, restart cleanly | local development |
| L002 | Product documentation overstated completed functionality | Docs were updated ahead of actual runtime/product behavior | Rebuild docs from route/code inventory, not from intent | product documentation |
| L003 | Schema evolved faster than UX | Multi-product, growth checklist, and task board models were added before full user flows were shipped | Roadmap should prioritize turning existing models into user-visible flows before adding more surface area | roadmap planning |
