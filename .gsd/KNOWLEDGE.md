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
| K010 | figma-workflow | If Figma MCP works in VS Code/Codex but not in this terminal harness, continue design implementation there and use README/HANDOFF as the handoff boundary | Prevents wasting time on runtime-specific MCP auth mismatches | 2026-03 |
| K011 | first-run | When the user has no product yet, the dashboard should show a short welcome/profile onboarding plus a single “start product journey” CTA instead of a barren empty state | Keeps first login calm, staged, and beginner-friendly without fake data | 2026-03 |
| K012 | growth-preview | For pre-launch products, Growth should stay visible as the next stage but render as a preview/locked surface that points back to launch readiness | Preserves stage awareness without pretending growth work is already the main workspace | 2026-03 |
| K013 | no-fallback-seed | If AI plan generation is unavailable, do not fabricate fallback launch/growth/tasks data; an honest blank state is better than generic fake workspace content | Prevents fake data from leaking into the product and confusing users | 2026-03 |
| K014 | metrics-chart | When enough daily metric entries exist, the metrics page should show a real trend chart alongside the recent entries table | Helps users see what changed instead of only reading raw inputs | 2026-03 |
| K015 | tasks-shell | The tasks page needs its own locale-aware shell layout so header/navigation stay consistent with the rest of the workspace | Prevents the tasks route from feeling disconnected or broken | 2026-03 |
| K016 | mobile-store | Mobile app onboarding must ask for iOS / Android platform selection and feed App Store / Google Play readiness guidance into AI output | Ensures store-specific requirements are surfaced instead of being lost in generic launch advice | 2026-03 |
| K017 | aso-skill | ASO questions should route to a dedicated listing optimization skill separate from compliance/review skills | Keeps store-page conversion guidance distinct from policy and submission advice | 2026-03 |
| K018 | launch-skill | Launch blocker questions should route to a dedicated launch-readiness skill | Keeps release sequencing separate from strategy and analytics advice | 2026-03 |
| K019 | analytics-skill | Tracking-plan and event-schema questions should route to a dedicated analytics instrumentation skill | Keeps measurement design separate from metric interpretation and launch guidance | 2026-03 |
| K020 | gateway-skill | Ambiguous or multi-domain skill requests should route through a project-level skill gateway first | Keeps the skill system scalable as more advisory domains are added | 2026-03 |
| K021 | growth-vs-metrics | Growth must answer “what should we track?” while Metrics must answer “what happened today and what changed?” | Prevents setup, data entry, and interpretation from collapsing into one confusing surface | 2026-03 |
| K022 | metric-language | User-facing metric labels and helper text should prefer plain Turkish over unexplained analytics acronyms | Keeps early founders from bouncing off the product because the language feels too technical | 2026-03 |
| K023 | metrics-feedback-loop | After metric entry, the UI must clearly show where the saved value appears and how it compares with the previous entry when possible | Prevents the metrics page from feeling like a dead-end form | 2026-03 |
| K024 | task-surface | Tasks should surface one main job first and behave like a daily work surface, not a passive backlog list | Helps the product answer “what should I do now?” more directly | 2026-03 |
| K025 | docs-consistency | Sprint docs should be updated only after code verification, especially during product-logic resets | Prevents README/HANDOFF from drifting away from the actual product chain | 2026-03 |
| K026 | figma-reference | Use Figma as a design-system/component reference for spacing, cards, nav rhythm, and CTA treatment; do not treat it as a literal screen-copy requirement for in-product surfaces | Preserves product logic while still improving visual/system consistency | 2026-03 |
| K027 | launch-preview-nav | For launched products, keep `Launch` accessible as a lower-emphasis stage-preview/history surface instead of removing it entirely or letting it dominate the main working nav | Preserves stage continuity without confusing the daily work model | 2026-03 |
| K028 | mobile-hybrid-checklist | For iOS / Android products, seed a deterministic store-readiness launch baseline from our own library, then let AI personalize and extend the rest of the checklist | Keeps critical submission items reliable without losing product-specific AI value | 2026-03 |

## Patterns

| # | Pattern | Where | Notes |
|---|---------|-------|-------|
| P001 | Authenticated page shell | `AppShell`, `DashboardNav`, route layouts under `app/*/layout.tsx` | Protected pages use session check + shared shell |
| P002 | Product-scoped data access | Most app pages and API routes query by `productId` or first product for user | UX still assumes one active product, but data model is multi-product |
| P003 | Product creation triggers first real workspace data | `app/api/products/route.ts`, `lib/seed.ts`, `app/[locale]/dashboard/page.tsx` | Signup no longer seeds a fake workspace; first product creation is the moment seeded starter data may appear |
| P004 | Progressive interactivity | Server page fetches data, client component mutates via API then `router.refresh()` | Used in checklist, tasks, goals, routines, integrations |
| P005 | Selected-metric-first growth flow | `app/[locale]/growth/page.tsx`, `components/MetricSetupSelector.tsx`, `app/[locale]/metrics/page.tsx` | Launched products first choose one primary metric per AARRR category, then enter daily values only for those selected metrics |
| P006 | Task work surface | `app/[locale]/tasks/page.tsx`, `components/TasksList.tsx`, `app/api/actions/[id]/route.ts` | Tasks should be actively moved through yapılacak / yapılıyor / tamamlandı, not shown as a passive list |
| P007 | First-run onboarding dashboard | `app/[locale]/dashboard/page.tsx`, `components/FirstRunOnboarding.tsx` | No-product users now see welcome/profile context, staged journey steps, and one primary CTA into product creation |
| P008 | Growth stage preview | `app/[locale]/growth/page.tsx`, `components/DashboardNav.tsx` | Pre-launch products keep Growth visible as the next stage, but the page explains the stage and routes users back to launch readiness |
| P009 | No fake fallback data | `lib/seed.ts`, `app/api/products/route.ts` | If AI plan generation fails, the app should not fill the workspace with generic fake tasks/checklists |
| P010 | Metrics trend view | `app/[locale]/metrics/page.tsx`, `components/MetricsTrendChart.tsx` | Daily metric entries should surface as a trend chart once enough data exists |
| P011 | Mobile store readiness | `app/[locale]/products/new/page.tsx`, `lib/ai-plan.ts`, `lib/founder-coach-context.ts` | Mobile products should capture platform selection early and let AI/advice include App Store and Google Play requirements |
| P012 | ASO routing | `lib/project-skill-loader.ts`, `.gsd/skills/aso-advisor/SKILL.md` | Listing optimization questions should load the ASO skill instead of mixing conversion advice into compliance guidance |
| P013 | Launch routing | `lib/project-skill-loader.ts`, `.gsd/skills/launch-readiness-advisor/SKILL.md` | Launch blocker questions should load the launch-readiness skill so release sequencing stays separate from strategy |
| P014 | Analytics instrumentation routing | `lib/project-skill-loader.ts`, `.gsd/skills/analytics-instrumentation-advisor/SKILL.md` | Event schema and tracking-plan questions should load the instrumentation skill so measurement design stays structured |
| P015 | Skill gateway routing | `lib/project-skill-loader.ts`, `.gsd/skills/skill-gateway/SKILL.md` | Ambiguous skill selection should route through the gateway layer first |
| P016 | Beginner-friendly metrics copy | `lib/growth-metric-recommendations.ts`, `components/MetricSetupSelector.tsx` | Metric names, explanations, and “when to use” text should reduce jargon and explain the decision in plain language |
| P017 | Metrics feedback loop UI | `components/MetricEntryForm.tsx`, `app/[locale]/metrics/page.tsx` | Metrics should show last-known values, save confirmation, and latest-vs-previous comparisons so users can see what changed |
| P018 | Task spotlight surface | `components/TasksList.tsx` | Tasks page should spotlight one main task first and provide a direct action before the full list |
| P019 | Welcome-first first run | `components/FirstRunOnboarding.tsx` | No-product dashboard should lead with welcome/orientation language before previewing later surfaces |
| P020 | Mobile launch baseline merge | `lib/mobile-launch-baseline.ts`, `lib/ai-plan.ts` | Mobile store-readiness uses a deterministic baseline merged into the AI-generated launch checklist so required iOS / Android items survive provider variability |

## Lessons Learned

| # | What Happened | Root Cause | Fix | Scope |
|---|--------------|------------|-----|-------|
| L001 | Dev server produced stale manifest / missing chunk errors even when build was green | Corrupt `.next` cache during iterative Next.js dev sessions | Kill dev server, remove `.next`, restart cleanly | local development |
| L002 | Product documentation overstated completed functionality | Docs were updated ahead of actual runtime/product behavior | Rebuild docs from route/code inventory, not from intent | product documentation |
| L003 | Schema evolved faster than UX | Multi-product, growth checklist, and task board models were added before full user flows were shipped | Roadmap should prioritize turning existing models into user-visible flows before adding more surface area | roadmap planning |
| L004 | Generic growth advice felt untrustworthy in-product | Checklist/coach copy assumed SEO, onboarding, or growth issues without enough evidence | Product guidance must start from setup and observed signals, not default optimization slogans | growth coaching |
| L005 | Users got overwhelmed when multiple growth surfaces appeared at once | Growth setup, checklist, goals, routines, timeline, and analysis were shown before the primary tracking decision was made | Keep one main decision per screen; reveal secondary systems only after the primary setup step is completed | product UX |
| L006 | Metrics felt like data entry with no payoff | Users could save values without a strong “what changed?” loop or enough plain-language framing | Surface last values, save feedback, and comparison against the previous entry to make the loop feel alive | metrics UX |
| L007 | Task pages can still feel passive even when technically functional | A list alone does not tell the user what to do next | Spotlight one current/next task before showing the broader backlog | task UX |
