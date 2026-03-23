# Tiramisup - Handoff

**Last Updated:** 22 March 2026  
**Status:** MVP operator loop is live; user-facing advisory layer has started, but guided coaching/pulse logic is still a next-phase capability.

---

## Executive Summary

Tiramisup is now beyond simple onboarding stabilization. The product has a working launch-to-growth transition: users can sign up, create a product, mark it as launched, and see the workspace adapt from launch-oriented content to growth-oriented content.

What is now true:
- Public landing → waitlist / early-access signup → dashboard → product creation works as a real flow
- Signup does **not** create fake product data; first meaningful workspace context begins after product creation
- `launchStatus` from the wizard maps into `product.status` (`PRE_LAUNCH` vs `LAUNCHED`)
- Pre-launch page includes a launch transition action (`Ürünümü launch ettim →`)
- Dashboard adapts based on product status
- Growth page includes an interactive growth checklist grouped by category
- AI plan generation and URL-based product analysis exist and are part of the product experience
- Admin waitlist flow exists, generates invite codes, and supports approve/reject workflows
- Production is live and functional

What is not yet true:
- Tiramisup does **not yet** behave like a fully stage-aware operator coach
- The product is status-aware, not deeply stage-aware
- It does not yet systematically tell users what to measure next, what to ignore, or how to interpret how their product is going
- A proper “pulse / performance / monitoring” layer is still future work

This is an important distinction: the product has entered an AI-assisted operator mode, but not yet a fully guided operator-coach mode.

---

## Current Product State

### User-facing product loop
A real user can now do the following:
1. Discover the product from landing page
2. Join waitlist or use an access code
3. Create an account
4. Land in a safe empty dashboard if no product exists
5. Create a product through the wizard
6. Receive AI-generated plan/input from the wizard flow
7. Enter a pre-launch workspace
8. Mark the product as launched
9. See dashboard and growth surfaces change accordingly

### AI capability that exists now
AI is not only decorative anymore.
It currently helps in these ways:
- product plan generation during product creation
- URL/site/app context analysis
- dashboard insights card for products with URLs

### AI capability that does **not** fully exist yet
The system does not yet reliably function as a proactive founder coach that:
- infers user stage deeply
- recommends stage-based metrics consistently
- introduces post-launch question sets automatically
- gives pulse-based “how is my product doing?” guidance
- adapts guidance beyond the current `PRE_LAUNCH` / `LAUNCHED` split

---

## Current Onboarding and Product Flow

### 1. Landing
- `/tr` or `/en`
- Primary CTA opens waitlist modal

### 2. Waitlist
- Name + email → `POST /api/waitlist/join`
- Redirect to `/{locale}/waitlist/thank-you`
- Modal also includes “Erken erişim kodum var” path to signup

### 3. Early-Access Signup
- Route: `/{locale}/signup`
- Inputs: name, email, password, access code
- Access code logic:
  - primary: invite codes stored on waitlist rows
  - fallback: `TT31623SEN`
- Signup creates user only
- No fake auto-product, no fake seeded dashboard

### 4. First Dashboard State
- `/{locale}/dashboard`
- If no product exists:
  - clear empty state
  - CTA to create first product
- If product exists:
  - dashboard content loads based on product context/status

### 5. Product Creation
- `/{locale}/products/new`
- Full wizard
- Accepts optional URL
- AI plan generation and scraping/analysis are part of the flow
- `launchStatus` maps to `product.status`

### 6. Pre-Launch → Launch Transition
- Pre-launch page exposes launch action for `PRE_LAUNCH` products
- Launch action updates product status and changes downstream workspace behavior

### 7. Growth Surface
- Growth page includes category-based growth checklist
- Interactive toggles and optimistic updates are implemented

---

## Production

**URL:** https://tramisup.vercel.app

**Current status:** Live and usable

### Known production-sensitive notes
- Supabase free tier may pause after inactivity; if production returns unexplained 500s, check and resume Supabase first
- Locale-prefixed routing remains mandatory everywhere
- Invite-code and auth flow are live
- Email sending for invite approval is wired, but still depends on `RESEND_API_KEY` being correctly set

### Admin access
- Admin panel: `/{locale}/admin/waitlist`
- Admin account pattern currently depends on `admin@tiramisup`
- Non-admins are blocked from the admin surface

---

## Important Architecture / Product Notes

### 1. Status-aware, not fully stage-aware
The current operator adaptation is built on `product.status`:
- `PRE_LAUNCH`
- `LAUNCHED`

This is useful and real, but it is still simpler than the longer-term product direction.
Future work may introduce a richer stage model (for example: pre-launch, just launched, early traction, etc.).

### 2. No fake signup seed
This is a hard product rule now.
A new account should not be padded with fake tasks, fake metrics, or fake launch progress.

### 3. Broken or incomplete surfaces should be gated
If something is not ready, the product should narrow the path rather than expose a broken route.

### 4. Locale-aware routing is a non-negotiable constraint
All user-visible navigation must continue to use `/${locale}/...`.

### 5. User-facing advisory knowledge now exists in project skills
Two project skills were added specifically for **recommendations Tiramisup gives its users about their own apps**, not primarily for Tiramisup’s internal release process:
- `.gsd/skills/app-store-submission-advisor/SKILL.md`
- `.gsd/skills/play-store-submission-advisor/SKILL.md`

These should be used by the user-facing advisory model, not treated as internal engineering checklists.

### 6. Founder Coach agent added
A new project-local agent exists:
- `.gsd/agents/founder-coach.md`

Its role is to act as a user-facing guidance model for Tiramisup users. It is designed to:
- give stage-aware recommendations
- provide launch/growth/store-readiness guidance
- proactively suggest next steps when user context is clear enough
- use the store-submission advisor skills when relevant
- reason from verified product state instead of invented context
- prefer suggested next actions/drafts over silent automatic mutations

This is the correct home for customer-facing “what should I do next?” intelligence.

---

## Development Team / Agent Structure

Project-local agents now include:
- `fullstack-developer`
- `qa-tester`
- `principal-pm`
- `product-designer`
- `docs-updater`
- `first-time-user`
- `sprint-planner`
- `founder-coach`

### Role split that matters
- `principal-pm` sets scope and priority direction
- `sprint-planner` translates that into the next sprint structure
- `founder-coach` is not an internal dev helper; it is the user-facing advisory model
- store-submission advisor skills are for user guidance, not mainly for internal release work

---

## Tests / Verification State

Current signals from the repo and handoff history:
- build is clean
- unit tests are passing
- major onboarding and operator-loop pieces have been implemented and deployed

Still important to keep doing:
- browser-level production smoke checks on the full user journey
- verification of status transition (`PRE_LAUNCH` → `LAUNCHED`) in production
- validation that growth checklist and AI insight surfaces behave correctly with real user data

---

## What Still Needs Work

### Highest-priority future product gaps
1. **Guided metrics setup** — the product should help users define what to measure now
2. **Post-launch coaching** — the system should introduce better next-step guidance after launch
3. **Pulse / performance layer** — users should be able to understand how their product is actually doing, not only what setup/checklist items remain
4. **Richer stage model** — eventually move beyond a simple binary `PRE_LAUNCH` / `LAUNCHED`

### Important but not immediate blockers
5. Multi-product switching UX
6. Real integrations (Stripe / analytics sources)
7. Broader i18n coverage
8. Invite email delivery verification in production

### Explicitly okay to defer
It is acceptable that the full guided operator-coach layer comes later.
The current state is already good enough to ship and build on, as long as everyone remains honest about what is complete and what is still only foundation.

---

## Final Read on Current State

Tiramisup is no longer just a collection of startup surfaces. It now has the beginning of a real operator loop and the first signs of user-facing AI assistance.

The right mental model is:
- **current:** AI-assisted, status-aware operator workspace
- **next phase:** stage-aware founder coaching, metric recommendation, and pulse-based guidance

That means the product is in a good shipping state for this phase, but the next wave of work should focus less on adding more surfaces and more on making the system smarter about what the user should do next.
