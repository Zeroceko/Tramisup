# Tiramisup - Handoff

**Last Updated:** 25 March 2026  
**Status:** **Data-Driven AI Mentorship Phase Complete.** The project has transitioned from static AI advice to real-time metric injection. The "Connectors Store" is functional for GA4 and Stripe, and the AI agents (Growth/Orchestrator) now see live MRR, DAU, and churn data before responding.

---

## Executive Summary

Tiramisup is now a data-aware founder co-pilot:

1. **OAuth 2.0 Integration:** Google Analytics 4 and Stripe Connect flows are ready.
2. **Metric Injection Engine:** A new layer (`lib/metric-context.ts`) queries Prisma and formats a structured "Data Snapshot" + Turkish context string for AI prompts.
3. **Data-Driven Mentorship:** The AI (Founder Coach) no longer gives generic advice. It detects trends (e.g., "MRR is down by 8%") and prioritizes tasks accordingly.
4. **Connectors Store:** A premium Dark Mode UI manages integrations based on a P0/P1/P2 roadmap.

---

## Major Milestone: Data-Driven AI (Shipped 25 March)

### 1. The Metric Context Layer (`lib/metric-context.ts`)
- **Purpose:** Bridges the gap between raw Prisma `Metric` rows and the AI model.
- **Features:** 7-day trend analysis, up/down/stable detection, integration status monitoring.
- **Usage:** Used by `founder-summary.ts`, `growthAgent.ts`, and `orchestrator.ts`.

### 2. Async Product Context
- `buildFounderSummary` is now `async`. 
- It fetches live metrics to generate data-driven headlines (e.g., "MRR is stable, focus on acquisition").
- **Crucial:** Always `await` this function in route handlers.

### 3. Integration Roadmap (P0/P1/P2)
We have aligned the Prisma `IntegrationProvider` enum and the UI to this roadmap:
- **P0 (Operational):** GA4, Stripe.
- **P1 (Next Dev Cycle):** RevenueCat, App Store Connect, Google Play, Meta Ads.
- **P2 (Scale):** Google Ads, TikTok Ads, AppsFlyer.

### 4. AI Agent Prompt Updates
- `GROWTH_AGENT_PROMPT` and `SYSTEM_ARCHITECT_PROMPT` now have strict rules to prioritize "📊 GERÇEK METRİK VERİSİ" over generic patterns.

---

## Technical Requirements for the Next Developer

### 1. Environment Variables (`.env` & Vercel Dashboard)
The following MUST be configured for the system to work:
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: From GCP Console (Analytics Data/Admin APIs enabled).
- `STRIPE_CLIENT_ID` / `STRIPE_SECRET_KEY`: From Stripe Dashboard (Connect enabled).
- `NEXT_PUBLIC_APP_URL`: Must match the environment (localhost:3002 or production URL) for OAuth redirects.

### 2. Sync Workers
- The background sync logic for GA4 (`BrandLib/sync/ga4.ts`) and Stripe (`BrandLib/sync/stripe.ts`) is ready and handles `upsert` into the `Metric` table.
- **Next Task:** Implement sync workers for P1 providers (RevenueCat etc.).

---

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

`Launch` should not dominate the nav for a launched product.
It can remain visible, but it should read as a preview/history surface rather than the primary daily work area.
`Integrations` should not be a first-class top-level destination for daily use; it belongs lower-priority / under setup.

Figma note:
- The current implementation used the Figma file as a component/system reference for nav pills, card rhythm, spacing, and CTA treatment.
- It was not used as a screen-copy instruction set.

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
Wizard now uses server-set active-product cookies and redirects more safely after creation, but AI preparation can still take a few seconds under provider variability.
The product-creation UI should prefer a calm foreground loading state over raw backend/provider errors.

New-user caveat:
- New signup should land in product creation, not bounce straight into a DB-heavy dashboard path.
- The authenticated shell now fails softer if product-list queries hit temporary pool pressure.

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

### Current sequencing rule
For launched products, Growth should now behave like a staged operating system:
1. metric setup
2. first metrics entry
3. first explicit goal
4. growth checklist execution
5. Founder Coach prioritization

The whole surface should keep reinforcing that order instead of mixing all layers equally.

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

### Coach rule
Founder Coach on the Growth page should not behave like a generic motivational card.
It should read:
- whether metric setup exists
- whether real metric entries exist
- whether goals exist
- whether launch blockers are actually active or were intentionally ignored

The fallback recommendation should match current workspace maturity, not only raw product status.

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
6. Continue the current design pass using Figma as a component/system reference, not as a pixel-copy source

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
