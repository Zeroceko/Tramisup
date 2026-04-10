# Production Stabilization Board

Last updated: 2026-04-09
Owner: Founder takeover / production stabilization
Scope: Launch checklist quality, founder trust, metrics stability, deployment safety

## Current reality

- Production now serves the latest deploy.
- New pre-launch product creation is working again.
- New products now get `5` launch checklist items instead of the old shallow `2`-item fallback.
- Duplicate / cross-product task explosion is fixed for newly created products.
- Production founder smoke now asserts checklist quality and leak-free creation.
- Remaining live issues:
  - Left-side launch recommendation cards are still static / generic.
  - Older products still carry old shallow fallback data unless manually regenerated.
  - Founder summary still has duplication / generic feel in places.

## Board

| ID | Sprint | Item | Status | Priority | Acceptance |
| --- | --- | --- | --- | --- | --- |
| S0-1 | Sprint 0 | Add post-deploy production smoke flow for product creation | Done | P0 | New prod product can be created; launch checklist count is `>= 5`; no foreign product name leak |
| S0-2 | Sprint 0 | Add deployment verification step against `tiramisup.app` alias | Done | P0 | After deploy, alias commit is confirmed by live behavior, not just by local git state |
| S0-3 | Sprint 0 | Fix metrics hydration error `#418` | Done | P0 | `/tr/metrics` opens with no React hydration/pageerror in founder smoke test |
| S1-1 | Sprint 1 | Replace static launch recommendation cards with context-driven cards | Done | P0 | Launch left panel reflects active product, stage, and checklist context |
| S1-2 | Sprint 1 | Remove duplicate / thin founder summary focus areas | Done | P1 | Founder summary shows unique, product-specific focus areas |
| S1-3 | Sprint 1 | Make checklist rationale more visible in launch UI | Done | P1 | Founder can see `neden önemli / done criteria / next action` without hunting |
| S2-1 | Sprint 2 | Add safe “regenerate plan” action for an existing product | Todo | P1 | Old shallow products can be re-generated without affecting other products |
| S2-2 | Sprint 2 | Add one-off reseed/admin repair path for broken historical products | Todo | P1 | Specific product can be repaired with audit log / dry-run output |
| S2-3 | Sprint 2 | Persist plan generation source metadata | Todo | P1 | We can tell whether a product used AI, sanitized AI, or fallback |
| S3-1 | Sprint 3 | Add founder-facing plan quality guardrails | Todo | P1 | Too-thin plan fails closed and regenerates with minimum quality |
| S3-2 | Sprint 3 | Add observability for plan quality and launch readiness health | Todo | P2 | We can inspect launch item counts, fallback rate, and regeneration rate |
| S3-3 | Sprint 3 | Add routine production founder walkthrough regression | Todo | P2 | Scripted founder flow captures screenshots and notes after each release |

## Sprint 0

Goal: Stop hidden production regressions and remove the metrics hard failure.

### S0-1 Post-deploy production smoke flow

Files likely touched:
- `tests/e2e/prod-founder-takeover.spec.ts`
- `playwright-prod.config.ts`
- `package.json`
- CI/deploy hook files if present

Tasks:
- Reuse real founder journey with realistic onboarding answers.
- Assert:
  - product created successfully
  - correct active product is selected
  - launch checklist count is at least `5`
  - no duplicate titles
  - no leaked product names from other products
  - tasks are not auto-spammed
- Save screenshots + notes as release artifacts.

Acceptance:
- Smoke test fails if product creation works but launch quality regresses.

### S0-2 Deploy verification

Tasks:
- Add a lightweight verification step after prod deploy.
- Confirm `tiramisup.app` is serving the new alias/build.
- Record deployed URL, timestamp, and validation result.

Acceptance:
- We never again mistake “pushed to main” for “live in production.”

### S0-3 Metrics hydration fix

Files likely touched:
- `app/[locale]/metrics/page.tsx`
- related client components under `components/`
- any server/client boundary logic feeding metrics

Tasks:
- Reproduce `#418` locally and against prod flow.
- Identify server/client mismatch source.
- Fix hydration mismatch without weakening the page.

Acceptance:
- No `pageerror` on metrics during founder smoke run.

## Sprint 1

Goal: Make the launch experience feel trustworthy to a founder.

### S1-1 Context-driven launch side panel

Files likely touched:
- `components/AgentChatPanel.tsx`
- launch/growth/dashboard layout wiring
- relevant context builders in `lib/`

Tasks:
- Remove or replace static recommendation cards.
- Feed active product context, launch stage, checklist blockers, and gaps into card generation.
- Ensure launched and pre-launch products do not share the same generic card set.

Acceptance:
- Two different products with different stages show different cards.

### S1-2 Founder summary dedupe

Files likely touched:
- founder summary generation logic in `lib/`
- product creation / seed path

Tasks:
- Deduplicate `focusAreas`.
- Ensure summary uses current product context and not stale generic fallback phrasing.

Acceptance:
- No repeated focus area strings in new product records.

### S1-3 Checklist rationale visibility

Files likely touched:
- `components/ChecklistSection.tsx`

Tasks:
- Make `why it matters`, `done criteria`, and `next action` easier to inspect.
- Keep scanning fast; avoid clutter.

Acceptance:
- Founder can understand why an item exists without opening a different page.

## Sprint 2

Goal: Repair older products safely and make plan generation debuggable.

### S2-1 Product-level regenerate action

Files likely touched:
- product settings or admin actions
- seed/regeneration APIs in `app/api/`
- plan generation utilities in `lib/`

Tasks:
- Add a safe “regenerate launch plan” path for one product.
- Preserve ownership and active product context.
- Rebuild checklist without duplicating tasks.

Acceptance:
- Old shallow product can be repaired on demand.

### S2-2 Historical reseed / repair tool

Tasks:
- Add dry-run mode.
- Show before/after counts.
- Limit repair to explicitly targeted product IDs.

Acceptance:
- Historical cleanup is deliberate and reversible in process.

### S2-3 Plan source metadata

Tasks:
- Persist plan source: `ai`, `sanitized_ai`, `fallback`.
- Persist item counts and generation timestamp.

Acceptance:
- We can inspect why a product received a given plan.

## Sprint 3

Goal: Turn the current fixes into a sustainable production quality loop.

### S3-1 Minimum plan quality guard

Tasks:
- Reject too-thin launch plans.
- Enforce minimum category coverage for pre-launch products.
- Prefer regeneration or richer fallback over accepting weak output.

Acceptance:
- New pre-launch products cannot end up with the old 2-item weak pattern.

### S3-2 Observability

Tasks:
- Add internal counters for fallback rate, launch item counts, and repair usage.
- Surface these metrics in admin or logs.

Acceptance:
- We can see quality drift before founders report it.

### S3-3 Founder regression runbook

Tasks:
- Keep a stable founder walkthrough script.
- Record screenshots and notes for every release candidate.
- Make this part of release signoff.

Acceptance:
- Each production release has a founder-quality artifact.

## Recommended execution order

1. Sprint 0
2. Sprint 1
3. Sprint 2
4. Sprint 3

## Immediate next sprint

Start with Sprint 0.

Reason:
- It removes the highest-risk hidden regressions.
- It finishes the remaining release-safety gap after smoke and hydration fixes.
- It gives us a safety rail before we iterate on founder-facing quality again.
