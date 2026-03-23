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
| K005 | recommendations | Store-readiness guidance shown to users must include legal pages, paywall/subscription disclosure, review-account readiness, privacy/SDK disclosures, accessibility checks, ASO metadata, and IAP/subscription completeness | Prevents shallow or incomplete App Store preparation advice in user-facing recommendations | 2026-03 |
| K006 | ai-guidance | User-facing AI must reason from verified product state, not invented context, and should prefer suggested next actions over silent automatic mutations | Prevents irrelevant or hallucinated guidance that breaks trust | 2026-03 |
| K007 | ux-flow | For launched products, force a calm order: metric setup → daily metric entry → progress view; do not dump checklist/goals/routines/integrations before tracking is configured | Prevents overwhelming first-run growth users and keeps the product action-oriented | 2026-03 |
| K008 | navigation | For launched products, remove `Pre-Launch` from the primary top nav and keep the main working surface focused on overview, tasks, metrics, and growth | Prevents launched users from feeling trapped in the wrong stage model | 2026-03 |
| K009 | founder-coach | Founder Coach is now a lightweight skill-routed decision engine, not just a single prompt; keep routing context-driven and avoid turning it into a generic autonomous agent loop | Preserves product usefulness without overbuilding AI infrastructure | 2026-03 |

## Patterns

| # | Pattern | Where | Notes |
|---|---------|-------|-------|
| P001 | Authenticated page shell | `AppShell`, `DashboardNav`, route layouts under `app/*/layout.tsx` | Protected pages use session check + shared shell |
| P002 | Product-scoped data access | Most app pages and API routes query by `productId` or first product for user | UX still assumes one active product, but data model is multi-product |
| P003 | Product creation triggers first real workspace data | `app/api/products/route.ts`, `lib/seed.ts`, `app/[locale]/dashboard/page.tsx` | Signup no longer seeds a fake workspace; first product creation is the moment seeded starter data may appear |
| P004 | Progressive interactivity | Server page fetches data, client component mutates via API then `router.refresh()` | Used in checklist, tasks, goals, routines, integrations |
| P005 | Selected-metric-first growth flow | `app/[locale]/growth/page.tsx`, `components/MetricSetupSelector.tsx`, `app/[locale]/metrics/page.tsx` | Launched products first choose one primary metric per AARRR category, then enter daily values only for those selected metrics |
| P006 | Task work surface | `app/[locale]/tasks/page.tsx`, `components/TasksList.tsx`, `app/api/actions/[id]/route.ts` | Tasks should be actively moved through yapılacak / yapılıyor / tamamlandı, not shown as a passive list |

## Lessons Learned

| # | What Happened | Root Cause | Fix | Scope |
|---|--------------|------------|-----|-------|
| L001 | Dev server produced stale manifest / missing chunk errors even when build was green | Corrupt `.next` cache during iterative Next.js dev sessions | Kill dev server, remove `.next`, restart cleanly | local development |
| L002 | Product documentation overstated completed functionality | Docs were updated ahead of actual runtime/product behavior | Rebuild docs from route/code inventory, not from intent | product documentation |
| L003 | Schema evolved faster than UX | Multi-product, growth checklist, and task board models were added before full user flows were shipped | Roadmap should prioritize turning existing models into user-visible flows before adding more surface area | roadmap planning |
| L004 | Generic growth advice felt untrustworthy in-product | Checklist/coach copy assumed SEO, onboarding, or growth issues without enough evidence | Product guidance must start from setup and observed signals, not default optimization slogans | growth coaching |
| L005 | Users got overwhelmed when multiple growth surfaces appeared at once | Growth setup, checklist, goals, routines, timeline, and analysis were shown before the primary tracking decision was made | Keep one main decision per screen; reveal secondary systems only after the primary setup step is completed | product UX |
