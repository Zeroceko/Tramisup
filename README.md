# Tiramisup

Launch-to-growth dönemindeki startup ekipleri için sakin, aşamalı ve yönlendirici tek workspace.

**Status:** Live MVP, with the current sprint focused on first-login clarity, Growth vs Metrics separation, beginner-friendly metric language, metrics feedback loops, and task-surface clarity  
**Last Updated:** 23 March 2026

---

## Product thesis

Tiramisup kullanıcıya her şeyi aynı anda göstermez.

Ürünün şu anki yönü:
1. kullanıcı ürününü kendi cümleleriyle anlatır
2. Founder Coach buna göre ilk çalışma sistemini kurar
3. kullanıcı önce neyi takip edeceğini seçer
4. sonra yalnızca seçtiği metrikler için günlük veri girer
5. sonra neyin değiştiğini görür
6. ancak ondan sonra daha derin öneriler / hedefler / optimizasyonlar gelir

Bu sırayı bozmak ürün kalitesini hızla düşürür.

Bu sprintte ürün dili şu iki soruyu net ayırmalıdır:
- `Growth`: Neyi takip edeceğiz?
- `Metrics`: Bugün ne oldu ve ne değişti?

---

## What is live right now?

Tiramisup currently supports this focused MVP flow:

1. **Public landing page** (`/tr`, `/en`)
2. **Waitlist capture** from the landing page CTA
3. **Early-access signup** with access code (`TT31623SEN`)
4. **Authenticated dashboard** with a short welcome/profile onboarding when no product exists
5. **Product creation wizard** (`/{locale}/products/new`)
6. **Stage-aware product workspace** for launch and growth
7. **Growth metric setup** where one primary metric is chosen for each AARRR category
8. **Daily metric entry** based on the selected metric set
9. **Metrics feedback loop** with last-known value hints, save confirmation, and change vs previous entry
10. **Task work surface** that highlights one main job first instead of behaving like a passive backlog
11. **Stage-aware workspace navigation** that keeps launched products focused on overview, tasks, metrics, and growth while still preserving `Launch` as a lower-emphasis preview/history surface

---

## Current onboarding flow

### A. Waitlist user
- User clicks **Ücretsiz Başla / Start free** on landing page
- Waitlist modal opens
- User submits name + email
- User is redirected to thank-you page

### B. Early-access user
- User clicks **Ücretsiz Başla / Start free**
- Waitlist modal opens
- User clicks **Erken erişim kodum var**
- User is sent to `/{locale}/signup`
- User enters:
  - name
  - email
  - password
  - access code
- Current access code:

```txt
TT31623SEN
```

### C. First authenticated session
- If user has **no product**, dashboard shows a short welcome/profile onboarding
- No fake metrics, fake tasks, or fake checklist data are shown
- One primary CTA moves the user into the first product journey
- The page should feel like orientation, not a tiny overview dashboard

### D. Product creation wizard
Wizard now collects better product context:
- product name
- user-written product description
- **multi-select categories**
- **multi-select target audiences**
- `Diğer` free-text support for both
- business model
- stage
- optional website
- planned launch date for `Yakında yayında`

Current stage labels:
- `Geliştirme aşamasında`
- `Test kullanıcıları var`
- `Yakında yayında`
- `Yayında`
- `Büyüme aşamasında`

Removed for now:
- `Fikir aşamasında`

### E. Product creation result
- Product is created through `/api/products`
- AI plan generation seeds the initial structure
- `Yayında` and `Büyüme aşamasında` map to launched behavior

---

## Important behavior changes

### No fake seed on signup
Signup creates the user only.
Product data starts after product creation.

### Locale-aware routing
The app routes under locale prefixes:

```txt
/tr/...
/en/...
```

### Growth setup comes before growth complexity
For launched products, the system should first ask:
**What should we track?**

Not:
- full checklist
- full goals surface
- full routines surface
- full website analysis
- generic growth advice

all at once.

### Beginner-friendly metric language
Metric labels should not assume the user is fluent in raw analytics acronyms.

The product should prefer:
- plain Turkish explanations
- examples of what the number means
- helper copy that reduces fear of “entering the wrong thing”

---

## Current launched-product flow

For a launched product, the intended order is now:

1. **Choose one primary metric for each AARRR category**
   - Awareness
   - Acquisition
   - Activation
   - Retention
   - Referral
   - Revenue

2. **Save metric setup**

3. **Go to metrics page**

4. **Enter daily values only for the selected metrics**

5. **Review what changed / trend**

6. **Work through real tasks and mark them as yapılacak / yapılıyor / tamamlandı**

Only after this should heavier guidance and deeper optimization logic become prominent.

---

## Dashboard behavior

The dashboard should now answer one question:

> What is the next correct step for this product right now?

Examples:
- no product → welcome/profile onboarding, then create first product
- pre-launch product → continue launch preparation
- launched product with no metric setup → set up tracking first
- launched product with setup but no daily data → make first metric entry
- launched product with data → review current progress

### Dashboard should avoid
- multiple competing CTA blocks
- barren first-login screens with no orientation
- launched users feeling stuck in pre-launch language
- generic website-analysis noise too early
- heavy AI explanation walls

### First-run emphasis
The first authenticated screen should feel welcoming and staged.
It should clearly say:
- you are in the right place
- here is what happens next
- here is the one action to take now

### Navigation rule
For launched products, the primary navigation should stay focused on:
- `Overview`
- `Görevler`
- `Metrikler`
- `Büyüme`

`Launch` can remain visible for launched products, but it should be positioned as a lower-emphasis stage-preview / history surface rather than the main working destination.
`Integrations` should not compete with core daily work in the primary nav.

---

## Growth setup behavior

### Current rule
Each category gets **one primary metric**.

### Current UX rule
Selection happens **where the metric is shown**.
No giant explanation block first, then a long scroll, then selection.

### Current save rule
The save CTA should stay visible and near the action context.
After saving, the user moves into daily metric entry.

### Conceptual rule
Growth is the place to choose and manage tracking focus.
Metrics is the place to enter numbers and observe movement.

---

## Metrics page behavior

The metrics page is no longer supposed to be a giant generic form.

Correct behavior:
- show selected metric set
- show date
- show one input per chosen category metric
- show recent entries / simple progress
- make it obvious where the user will see what they entered
- show the last known value when possible
- highlight what changed compared with the previous entry

Wrong behavior:
- show unrelated fields the user never selected
- ask for technical jargon without enough explanation

### Metrics feedback loop
After the user saves numbers, the page should answer:
- what was saved
- where it appears
- how it compares with the previous entry

This rule is now product-critical.

---

## Tasks page behavior

The tasks page should no longer feel like a detached list view.

Correct behavior:
- surface one main task first
- tell the user whether it is the next logical task or the in-progress task
- let the user start or complete it quickly
- keep the rest as supporting context

---

## Founder Coach current role

Founder Coach is not meant to be a loud always-on chat widget.
Its current correct role is:
- planning support during product creation
- growth metric setup guidance
- skill-routed advisory help when product strategy / metrics / store readiness / legal context is relevant
- future evidence-based recommendation layer once real signals exist

Current implementation note:
- Founder Coach now has a lightweight agent-framework layer (`.gsd/FOUNDER_COACH_AGENT_FRAMEWORK.md`)
- routing currently supports store, analytics, product-strategy, and legal skills
- proposal modes (draft tasks / draft metrics / draft checklists) are still future work

### Important rule
Founder Coach should not default to speculative optimization advice.
Avoid default assumptions like:
- “SEO stratejisi kur”
- “Onboarding akışını optimize et”

unless the product has evidence or explicit context for them.

Preferred guidance style:
- define what to measure
- ask for the next concrete action
- respond to actual signals

---

## Technical stack

- **Framework:** Next.js 15
- **UI:** React 19 + Tailwind CSS
- **Language:** TypeScript
- **Auth:** NextAuth 4 (credentials)
- **DB:** Prisma + PostgreSQL
- **i18n:** next-intl
- **Tests:** Vitest + Playwright
- **Deploy:** Vercel

---

## Local development

### Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Important local note
Port `3000` may already be occupied in this environment.
Next dev may move to `3001`.

If dev becomes flaky, clear cache and restart:

```bash
rm -rf .next
npm run dev
```

---

## Production

Primary public URL:

```txt
https://tramisup.vercel.app
```

### Known production-sensitive notes
- Supabase free tier may pause after inactivity
- Invite/email flow still depends on correct env configuration
- Immediate post-wizard navigation can be sensitive to active-product cookie timing; if stale behavior returns, move to product-id-driven transitions instead of only cookie + client push

---

## Current architectural shortcut

To move quickly without a DB migration, selected metric setup and daily AARRR entries are currently stored as JSON in `Product.launchGoals`.

This is **not** the ideal long-term data model.
It is a temporary UX-protecting bridge.

Future cleanup should introduce explicit entities such as:
- `MetricSetup`
- `MetricEntry`
- maybe `MetricDefinition`

Do not build long-term complexity on top of the current shortcut unless intentionally migrating it.

---

## What must not regress

1. No fake product/workspace on signup
2. Launched products must not feel trapped in pre-launch UX
3. Growth setup must stay calm and staged
4. Metric entry must remain tied to selected setup
5. Founder Coach should not speculate without evidence
6. User-written product description must remain central context
7. The app should guide, not lecture

---

## Immediate next priorities

1. Replace temporary metric JSON storage with real DB entities
2. Make navigation fully stage-aware for launched vs pre-launch products
3. Improve metric trend visualization for selected AARRR metrics
4. Add a proper post-wizard product overview step if stale first navigation keeps appearing
5. Keep secondary surfaces (integrations, website analysis, heavy checklisting) from overwhelming first-run users
6. Continue design implementation from Figma using a client/runtime that already has working MCP auth if needed

---

## Do not assume

This repo has a history of docs getting ahead of runtime behavior.
Treat runtime behavior as source of truth and verify with:
- build output
- production smoke tests
- route-by-route checks
