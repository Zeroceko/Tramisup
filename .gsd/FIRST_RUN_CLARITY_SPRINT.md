# Sprint X — First-Run Clarity & Product Logic Reset

**Status:** Proposed next priority  
**Created:** 22 March 2026

---

## Why this sprint is now first

Tiramisup no longer has a pure feature problem.
It has a **logic chain / first-run clarity** problem.

The current risk is not “missing capability.”
The current risk is:
- the user does not immediately understand what the product wants them to do
- first login feels too empty / cold
- Growth vs Metrics still feels partially ambiguous
- some metric language is too expert-oriented for beginner founders
- tasks still risk feeling like a side module instead of the operating surface

This sprint should move to the **front of the sprint queue**.

---

## Sprint goal

Make the product feel like one calm, staged founder workflow from first signup through launched-product operating rhythm.

The user should feel this chain clearly:

1. signup
2. short welcome / profile onboarding
3. “Ürün yolculuğuna başla”
4. product wizard
5. stage-aware workspace
6. if launched:
   - choose what to track
   - enter today’s numbers
   - see how things are going
   - work through the next tasks

---

## What this sprint must fix

### 1. First login is too empty
Current issue:
- first login can still feel like “empty dashboard” instead of guided onboarding

Target:
- replace empty first-run feeling with a short welcome/profile step
- collect lightweight user context such as:
  - name / how to address them
  - team role
  - solo vs team
  - optional company/team name
- end with a clear CTA:
  - **Ürün yolculuğuna başla**

### 2. Growth vs Metrics is still not fully intuitive
Current issue:
- users can still wonder:
  - “Did I already choose metrics?”
  - “Do I pick them again here?”
  - “What is Growth for vs Metrics?”

Target:
- **Growth** = setup / choose what to track / manage selected tracking focus
- **Metrics** = enter today’s values / see trend / review recent entries
- this must be obvious in copy and layout

### 3. Metric language is too advanced in places
Current issue:
- terms like retention / WAU / MAU / activation rate are too early or too unclear for beginner founders

Target:
- prefer beginner-safe, manually enterable metrics
- examples:
  - new signups
  - users who completed onboarding
  - returning users this week
  - invite-driven users
  - paying users
  - monthly revenue
- reduce jargon unless context strongly justifies it

### 4. Metrics loop is not visible enough
Current issue:
- user can still think: “I entered numbers — where do I actually see them?”

Target:
- metrics page should visibly combine:
  - selected metric cards
  - daily input
  - mini trend / chart
  - recent history
  - “today vs previous” style clarity where appropriate

### 5. Tasks need to feel like the real work surface
Current issue:
- tasks improved, but may still feel like a list rather than the operating layer

Target:
- connect tasks more tightly to dashboard and next-step logic
- make completion feel meaningful
- make “what should I do next?” easier to answer from task state

### 6. Launched vs pre-launch consistency still needs an audit
Current issue:
- some surfaces improved, but the whole product does not yet feel perfectly stage-consistent

Target:
- audit these surfaces together:
  - dashboard
  - growth
  - metrics
  - tasks
  - settings / secondary nav if relevant
- make copy, CTA logic, and emphasis consistent with stage

### 7. Documentation drift must be cleaned up
Current issue:
- some project state documents still describe older product behavior

Known stale/risky docs:
- `.gsd/PROJECT.md`
- `.gsd/STATE.md`

Target:
- refresh docs so the next agent does not start from outdated product assumptions

---

## Proposed work tracks

### Track A — First-run onboarding
- replace no-product empty dashboard feeling with welcome/profile onboarding
- define minimal profile fields
- connect signup → onboarding → product wizard
- add a clear “Ürün yolculuğuna başla” handoff step

### Track B — Growth / Metrics information architecture
- rewrite growth page hierarchy around setup / manage tracking focus
- rewrite metrics page hierarchy around input + feedback loop
- remove or soften repeated selection confusion
- improve beginner-safe copy

### Track C — Metrics language + trend visibility
- reduce jargon
- replace advanced metric language where needed
- add stronger chart/trend visibility
- make “what I entered” immediately visible

### Track D — Task operating surface
- connect tasks to dashboard next-step logic
- add stronger task summary / focus surfaces if needed
- make completion flow feel central, not peripheral

### Track E — Stage consistency + docs
- run launched vs pre-launch consistency pass
- refresh stale docs
- keep `HANDOFF.md`, `README.md`, `.gsd/KNOWLEDGE.md`, `.gsd/PROJECT.md`, `.gsd/STATE.md` aligned

---

## Success criteria

This sprint is successful when:

### First-run
- a new user does not land in a cold empty dashboard
- first action is obvious
- onboarding feels intentional and calm

### Launched workflow clarity
- user understands:
  - where metrics are chosen
  - where daily values are entered
  - where progress is seen
- no repeated “am I selecting this again?” confusion

### Metrics clarity
- user can enter values and immediately see where they appear
- metric language is understandable for non-experts

### Tasks
- tasks feel like the real action surface, not a side list

### Product cohesion
- launched and pre-launch paths feel clearly different
- product feels like one system, not several stitched modules

---

## Explicit next priorities after this sprint

Only after this sprint should the project prioritize more of:
- richer proposal modes for Founder Coach
- deeper automation
- broader analytics sophistication
- more integrations
- additional growth surfaces

Because the user-facing logic chain needs to be trusted first.

---

## Notes for Codex / next implementer

If you are taking over this sprint:
- read `HANDOFF.md`, `README.md`, and `.gsd/KNOWLEDGE.md` first
- treat this sprint as a **product-logic reset**, not a cosmetic UI pass
- do not reintroduce generic chat-heavy AI surfaces
- do not add fake data
- do not increase complexity before clarifying the user journey
- if Figma MCP works in your runtime (for example VS Code/Codex), use it there and keep docs updated after implementation

This sprint is the current front-of-queue product priority.
