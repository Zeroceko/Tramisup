# Tiramisup - Handoff

**Last Updated:** 22 March 2026  
**Status:** Live MVP; onboarding, stage-aware navigation, and growth metric setup are now product-critical. The system is moving from “many surfaces” toward a calmer, step-by-step founder workflow.

---

## Executive Summary

Tiramisup is now a real launch-to-growth workspace with an opinionated first-run path:

1. User signs up through waitlist / early-access flow
2. User creates a product through the wizard
3. Founder Coach turns that product context into initial launch/growth structure
4. If the product is already **Yayında**, the product should move the user toward:
   - choosing one primary metric for each AARRR category
   - entering daily values for those selected metrics
   - viewing early progress without being flooded by secondary surfaces

The core product direction is now clearer:
- **Do not dump everything on the user at once**
- **Do not default to generic growth advice without evidence**
- **Do not treat pre-launch and launched products the same**
- **Do not show metric forms unrelated to the metrics the user chose**

This is the most important current product memory.

---

## Current Product Behavior

### Stable user flow
A real user can now:
1. Discover the landing page
2. Join waitlist or use early-access signup
3. Reach a clean empty dashboard when no product exists
4. Create a product through the wizard
5. Have product context seed the initial plan/checklist structure
6. If launched, enter a growth setup flow where the system asks: **what should we track first?**
7. Save one selected metric per AARRR category
8. Enter daily values only for those selected metrics

### Founder Coach current role
Founder Coach is no longer intended to be a loud always-on chat widget.
It is now being positioned as:
- a **planning layer** during product setup
- a **metric-setup guide** during growth preparation
- a future **evidence-based recommendation layer** once real signals exist

This is important. The product should not regress back into “big dark AI card with generic advice.”

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
- pre-launch product → finish launch preparation
- launched product with no metric setup → set up tracking first
- launched product with tracking chosen but no entries → make first daily metric entry
- launched product with entries → review current performance

### What the dashboard should avoid
- multiple competing CTA blocks
- website analysis noise too early in the flow
- showing launched users mostly pre-launch language
- generic “growth” directions before metric setup exists

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

### Secondary content rule
Before setup is completed, avoid dumping:
- growth checklist
n- goals
- routines
- timeline

These should only appear after the primary setup step is done.

---

## Metrics State (Current)

### Critical direction
The metrics page must reflect the user’s selected setup.
If the user chose six primary AARRR metrics, the daily input form should show only those six.

Bad behavior:
- generic giant metric form with unrelated inputs

Correct behavior:
- selected metric set
- date
- one input per chosen category metric
- recent entries / simple progress view

### Current implementation note
To move quickly without a DB migration, selected metric setup and daily AARRR entries are currently being stored in `Product.launchGoals` as JSON payload.

This is a pragmatic short-term choice, not the long-term domain model.
Future cleanup should split this into explicit entities such as:
- `MetricSetup`
- `MetricEntry`
- maybe `MetricDefinition`

Do **not** treat the current `launchGoals` storage as the ideal architecture. Treat it as a temporary bridge that protects UX momentum.

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
3. **Growth setup must stay calm and single-purpose**
4. **Metric entry must stay tied to selected setup**
5. **Advice/checklists must not assume problems without evidence**
6. **Project context from user-written description must remain central**
7. **The product should guide, not lecture**

---

## Near-Term Work Still Worth Doing

### High priority
1. Replace temporary `launchGoals` JSON storage with real metric setup / entry tables
2. Make nav fully stage-aware and reduce top-level noise for launched users
3. Improve metrics trend visualization for selected AARRR metrics
4. Add a proper product overview / post-wizard summary step if stale first-load behavior returns

### Medium priority
5. Make Founder Coach progressively smarter once actual metric history exists
6. Reintroduce website / SEO / onboarding advice only when triggered by context or explicit user path
7. Refine multi-product switching UX

---

## Final Product Read

The important shift is not just “more features.”
It is that Tiramisup is learning to behave like a calm operator system:
- first define what matters
- then track it
- then interpret it
- then suggest what changes

That ordering matters more than adding more surfaces.
