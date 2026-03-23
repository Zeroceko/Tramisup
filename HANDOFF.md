# Tiramisup - Handoff

**Last Updated:** 23 March 2026  
**Status:** Live MVP; the current sprint is a product-logic reset focused on first-login onboarding, a clearer Growth vs Metrics split, beginner-friendly metric language, stronger metrics feedback loops, and a more action-oriented task surface.

---

## Executive Summary

Tiramisup is now a real launch-to-growth workspace with an opinionated first-run path:

1. User signs up through waitlist / early-access flow
2. User creates a product through the wizard
3. Founder Coach turns that product context into initial launch/growth structure
4. If the product is already **Yayında**, the product should move the user toward:
   - choosing one primary metric for each AARRR category
   - entering daily values for those selected metrics
   - seeing a real trend chart, not only a table
   - viewing early progress without being flooded by secondary surfaces
5. If the product is still pre-launch, `Growth` should remain visible as the next stage, but the page should act like a locked/preview surface instead of a full working workspace

The core product direction is now clearer:
- **Do not dump everything on the user at once**
- **Do not default to generic growth advice without evidence**
- **Do not treat pre-launch and launched products the same**
- **Do not show metric forms unrelated to the metrics the user chose**
- **Do not fabricate fallback workspace data when AI is unavailable**
- **Do explain Growth and Metrics in plain language**
- **Do make the metrics page answer “I entered numbers, now what changed?”**

This is the most important current product memory.

---

## Current Product Behavior

### Stable user flow
A real user can now:
1. Discover the landing page
2. Join waitlist or use early-access signup
3. Reach a short welcome/profile onboarding dashboard when no product exists
4. Create a product through the wizard
5. Have product context seed the initial plan/checklist structure
6. If the product is already **Yayında**, the top navigation now shifts away from `Pre-Launch` and keeps the working surface focused on:
   - Genel Bakış
   - Görevler
   - Metrikler
   - Büyüme
7. Launched products move toward a growth setup flow where the system asks: **what should we track first?**
8. User saves one selected metric per AARRR category
9. User enters daily values only for those selected metrics
10. User sees a real trend chart on the metrics page once enough entries exist
11. Tasks now have their own shell under the locale route, so the work surface stays consistent
12. Founder Coach now runs as a lightweight skill-routed decision engine rather than a single prompt-only helper
13. `Launch` stays visible even after launch so non-critical items can still be reviewed and completed
14. Mobile app products must capture platform selection and surface App Store / Google Play readiness guidance during setup
15. ASO now has its own skill boundary so listing optimization stays separate from compliance/review guidance
16. Launch readiness and analytics instrumentation now also have dedicated skills so blocker logic and measurement design stay separate
17. A project-level `skill-gateway` skill now exists to route ambiguous or multi-domain skill requests

### Founder Coach current role
Founder Coach is no longer intended to be a loud always-on chat widget.
It is now being positioned as:
- a **planning layer** during product setup
- a **metric-setup guide** during growth preparation
- a **skill-routed decision engine** that can load project advisory knowledge when needed
- a future **evidence-based recommendation layer** once real signals exist
- a store-readiness guide for mobile products when iOS / Android distribution is relevant
- an ASO-aware listing optimization layer when store metadata and screenshots need tightening
- a launch-readiness layer for blocker-first release sequencing
- an analytics instrumentation layer for event schema / tracking plan design

This is important. The product should not regress back into “big dark AI card with generic advice.”

---

## Current Sprint Priority

This sprint should be treated as a **product logic chain reset**, not as a visual polish sprint.

The priority stack is:
1. **First-login onboarding**
2. **Growth vs Metrics separation**
3. **Beginner-friendly metric language**
4. **Metrics feedback loop**
5. **Tasks as the daily work surface**
6. **Docs consistency**

### What shipped in this reset
- First-run onboarding copy is warmer and more clearly welcome-oriented instead of feeling like a generic empty dashboard
- Growth now explains that it is the place to choose and manage **which numbers matter**
- Metrics now explains that it is the place to **enter today’s numbers and see what changed**
- Metric naming and explanations were rewritten in simpler Turkish so early-stage founders are not forced into raw analytics jargon immediately
- The metrics entry form now confirms where saved numbers will show up
- The metrics overview cards now compare the latest entry against the previous one when possible
- Tasks now surface one main task first so the page behaves more like a work surface than a passive list

---

## Current UX/Product Principles

### 1. Calm, staged progression
The product should feel progressive, not overwhelming.

Correct pattern:
- one main decision per screen
- one obvious next step
- secondary systems only after the primary setup is done

Wrong pattern:
- checklist + metrics + goals + routines + AI explanations + integrations all at once

### 2. Stage-aware product navigation
Navigation should adapt to product state.

For launched products, the main top-level mental model is:
- Genel Bakış
- Görevler
- Metrikler
- Büyüme

`Pre-Launch` should not dominate the nav for a launched product.
`Integrations` should not be a first-class top-level destination for daily use; it belongs lower-priority / under setup.

### 3. Evidence-first recommendations
The system must not assume a problem exists unless it has supporting context.

Examples of bad default guidance:
- “SEO stratejisi kur”
- “Onboarding akışını optimize et”

Unless Tiramisup knows SEO is the chosen growth lever or onboarding activation is actually weak, these are speculative and should not be default checklist output.

Preferred guidance style:
- “Önce acquisition için hangi metriği takip edeceğini seç.”
- “Henüz aktivasyon metriği tanımlı değil.”
- “Önce günlük veri girişini başlat.”

### 4. Setup before optimization
For launched products, the order should be:
1. choose tracking metrics
2. enter daily values
3. view trend/progress
4. then set targets / follow-up suggestions / optimization work

Not the reverse.

---

## Wizard State (Current)

### Product creation wizard now supports
- product described in the user’s own words
- **multi-select categories**
- **multi-select target audiences**
- `Diğer` option that opens a free-text field for AI-readable context
- launch stage language updated to more natural Turkish

Current stage labels:
- `Geliştirme aşamasında`
- `Test kullanıcıları var`
- `Yakında yayında`
- `Yayında`
- `Büyüme aşamasında`

Removed for now:
- `Fikir aşamasında`

### Important behavior
If `Yakında yayında` is selected:
- launch date is chosen from a date picker
- not free-form month/year text

### Important current caveat
Wizard currently redirects to dashboard after creation. There has been evidence of first navigation state lagging until refresh, especially around active-product/cookie synchronization.
If this reappears, prefer product-id-driven transitions or explicit overview steps over relying only on client-set cookie + push.

---

## Dashboard State (Current)

### What the dashboard should now do
The dashboard should answer only one question:
**What is the next correct step for this product right now?**

Examples:
- no product yet → quick welcome/profile onboarding, then create first product
- pre-launch product → finish launch preparation
- launched product with no metric setup → set up tracking first
- launched product with tracking chosen but no entries → make first daily metric entry
- launched product with entries → review current performance

### What the dashboard should avoid
- multiple competing CTA blocks
- a barren first-login empty state with no orientation
- website analysis noise too early in the flow
- showing launched users mostly pre-launch language
- generic “growth” directions before metric setup exists

### First-run no-product behavior
When the user has no product yet, the dashboard should now show:
- a short welcome surface
- a lightweight profile snapshot (name, email, locale context)
- one primary CTA into product creation
- a simple staged preview of what happens after the first product is created

This should still avoid fake metrics, fake tasks, or fake checklist data.

---

## Growth Setup State (Current)

### Current intended behavior
Growth page should now be calmer and more focused.
Primary task:
- choose **one primary metric** for each AARRR category:
  - Awareness
  - Acquisition
  - Activation
  - Retention
  - Referral
  - Revenue

### Important UX rule
The user should make the choice **where they see the metric**, not after reading a giant explanation block above and then scrolling down.

### Save behavior
- save CTA must be visible near the current action context
- after save, user should be taken to the metrics input flow

### Pre-launch behavior
For pre-launch products, Growth should stay visible as the next stage, but the page should explain that it is coming next and point back to launch readiness.
Do not hide the section completely unless the stage model changes again.

### Secondary content rule
Before setup is completed, avoid dumping:
- growth checklist
- goals
- routines
- timeline

These should only appear after the primary setup step is done.

### Important framing rule
Growth is now the answer to:
- **“Neyi takip edeceğiz?”**

Metrics is now the answer to:
- **“Bugün ne oldu ve ne değişti?”**

This distinction should stay visible in:
- page headers
- helper copy
- save confirmations
- next-step CTA logic

---

## Metrics State (Current)

### Critical direction
The metrics page must reflect the user’s selected setup.
If the user chose six primary AARRR metrics, the daily input form should show only those six.

Bad behavior:
- generic giant metric form with unrelated inputs
- unexplained jargon
- no visible feedback after save

Correct behavior:
- selected metric set
- date
- one input per chosen category metric
- recent entries / simple progress view
- trend chart once enough entries exist
- visible comparison against the prior entry when available
- clear guidance about where the saved data appears

### Beginner-friendly language rule
Metric labels and descriptions should reduce analytics jargon where possible.

Examples:
- explain acquisition cost in plain Turkish instead of relying only on `CAC`
- explain retention as users coming back later
- explain activation as reaching the first real value moment
- explain revenue metrics as recurring income, not only acronyms

### Current implementation note
To move quickly without a DB migration, selected metric setup and daily AARRR entries are currently being stored in `Product.launchGoals` as JSON payload.

This is a pragmatic short-term choice, not the long-term domain model.
Future cleanup should split this into explicit entities such as:
- `MetricSetup`
- `MetricEntry`
- maybe `MetricDefinition`

Do **not** treat the current `launchGoals` storage as the ideal architecture. Treat it as a temporary bridge that protects UX momentum.

### Feedback loop rule
After metric entry, the product should help the user answer:
- what did I just save?
- where can I see it?
- how is today different from the last entry?

The current UI direction now includes:
- a simple explainer section at the top of Metrics
- last-known-value hints inside the form
- a success message after save
- summary cards that compare the latest value with the previous entry

---

## Tasks Surface State (Current)

### Critical direction
Tasks should feel like the user’s **daily work surface**, not a backlog dump.

### Current implementation direction
- surface one clear main task at the top
- show whether that task is the next logical step or the current in-progress item
- make it easy to start or complete that task directly
- keep remaining tasks underneath as supporting context

---

## Production Notes

**URL:** https://tramisup.vercel.app

### Known product-sensitive realities
- Supabase pause can still create confusing 500s
- Locale-prefixed routing remains mandatory
- Signup still uses early-access / invite structure
- Active product selection still relies on cookie-based behavior and can be sensitive during immediate post-create navigation

---

## What Must Not Regress

1. **No fake workspace on signup**
2. **Launched products must not feel trapped in pre-launch UX**
3. **Growth must stay staged: preview for pre-launch, workspace for launched**
4. **Metric entry must stay tied to selected setup**
5. **Advice/checklists must not assume problems without evidence**
6. **Project context from user-written description must remain central**
7. **The product should guide, not lecture**

---

## Near-Term Work Still Worth Doing

### High priority
1. Replace temporary `launchGoals` JSON storage with real metric setup / entry tables
2. Strengthen next-step orchestration across dashboard, tasks, growth, and metrics so the whole product answers one question consistently
3. Improve metrics trend visualization and drill-down so users can read what changed, not only that something changed
4. Convert pre-launch Growth preview into a cleaner launch-readiness gate if future feedback says the mixed stage is still confusing
5. Keep the no-fake-data rule strict: only AI-generated or user-created records should appear in the workspace
6. Continue the current design pass using Figma references from VS Code / Codex if needed; this terminal agent could not use Figma MCP because the MCP auth context did not carry over here

### Medium priority
1. Make Founder Coach progressively smarter once actual metric history exists
2. Reintroduce website / SEO / onboarding advice only when triggered by context or explicit user path
3. Refine multi-product switching UX
4. Expand Founder Coach proposal modes (draft tasks / draft metrics / draft checklists) without allowing silent automatic mutations

---

## Final Product Read

The important shift is not just “more features.”
It is that Tiramisup is learning to behave like a calm operator system:
- first define what matters
- then track it
- then interpret it
- then suggest what changes

That ordering matters more than adding more surfaces.
