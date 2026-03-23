# Founder Coach Runtime Plan

This document turns the founder-coach concept into an implementable product plan.

It defines where the user-facing AI should run, what context it needs, what should trigger it, and what the first safe version should do.

## Goal

Make founder-coach a real product capability inside Tiramisup, not just a prompt file in the repo.

The first version should:
- answer user questions from verified product state
- offer short proactive recommendations when context is clear enough
- use store submission skills when relevant
- avoid hallucinated context and noisy, low-value interruptions

---

## Product Principle

Founder-coach should operate from **verified product state**, not invented context.

Its first responsibility is to interpret known state and suggest the next best action.
Its first outputs should usually be:
- recommendation
- draft task suggestion
- draft metric recommendation
- summary

Not silent automatic mutations.

---

## Runtime Modes

### 1. Reactive Mode
Used when the user explicitly asks for guidance.

Examples:
- “What should I do next?”
- “What should I track?”
- “What still blocks launch?”
- “What do I need before App Store submission?”

**Behavior**
- assemble product context
- load relevant skills
- answer directly and specifically

### 2. Proactive Mode
Used when product state clearly implies a high-value recommendation.

Examples:
- user just marked product as launched
- user added iOS target + paywall but no review readiness info exists
- user launched but has no activation metric defined
- user is still pre-launch but checklist blockers remain high

**Behavior**
- show a short recommendation card
- explain why now
- avoid overwhelming the user

---

## Initial Surfaces

### Surface A — Dashboard card
This is the best first place.

**Why**
- dashboard already summarizes state
- users expect guidance there
- the card can stay short and contextual

**Suggested content structure**
- Suggested next step
- Why now
- What can wait
- Optional “show more” / “convert to task” later

### Surface B — Product creation completion state
After wizard completion, the user should get a founder-coach summary based on:
- product type
- target audience
- business model
- launch status
- website analysis (if any)

**Why**
This is a natural moment for “here’s your first operator plan.”

### Surface C — Growth / metrics surfaces
Later, founder-coach can appear here for:
- metric definition guidance
- interpreting what is missing
- avoiding over-tracking too early

### Surface D — Store readiness area
Later, if Tiramisup introduces a store-readiness or submission module, founder-coach should be the recommendation engine behind it.

---

## Trigger Events

Founder-coach should not run randomly. It should respond to high-value events.

### High-value initial triggers
- `PRODUCT_CREATED`
- `PRODUCT_LAUNCHED`
- `METRIC_ADDED`
- `URL_ADDED`
- `CHECKLIST_BLOCKER_REMAINS_HIGH`
- `NO_ACTIVATION_METRIC_AFTER_LAUNCH`
- explicit user question in coach/chat surface

### Good future triggers
- `PAYWALL_ENABLED`
- `IOS_TARGET_SET`
- `ANDROID_TARGET_SET`
- `REVIEW_READINESS_INCOMPLETE`
- `GROWTH_CHECKLIST_STARTED`
- `RETENTION_SIGNAL_DROPPING`

---

## Context Assembly Requirements

Before founder-coach runs, the app should assemble a compact verified context object.

### Minimum v1 context
- product identity
- product status (`PRE_LAUNCH` / `LAUNCHED`)
- checklist completion summary
- open task count
- goals/routines count
- latest metrics summary
- website exists or not
- recent triggering event

### Recommended v1.5 context
- platform target
- monetization model
- privacy/review readiness flags
- activation metric defined or not
- revenue metric defined or not
- retention metric defined or not

### Hard rule
If the context layer cannot verify something, founder-coach should not speak as if it knows it.

---

## Skill Loading Logic

### If platform/submission guidance is relevant
Load:
- `.gsd/skills/app-store-submission-advisor/SKILL.md`
- `.gsd/skills/play-store-submission-advisor/SKILL.md`

### If the user is asking general next-step questions
Use founder-coach base rules and context model first.

### If metric guidance is the main question
Prioritize stage + metrics context over store readiness skills.

The AI should load only the skills that are clearly relevant to the current advice request.

---

## Output Rules by Mode

### Reactive output
Can be a fuller answer with:
- top priorities
- blockers
- what to measure now
- what can wait

### Proactive output
Must be compact.

**Preferred format**
- Suggested next step
- Why now
- What can wait

### Draft generation output
If suggesting tasks or checklist items:
- clearly label them as suggested
- do not silently insert them into the workspace in v1

---

## Safety Rules

### Rule 1 — No invented context
Do not claim missing facts.

### Rule 2 — No noisy interruptions
A proactive recommendation must be clearly worth showing.

### Rule 3 — Suggest before mutating
AI can recommend tasks/checklist items/metrics before the system creates them.

### Rule 4 — One strong recommendation beats five weak ones
Short and high-confidence is better than broad and generic.

### Rule 5 — Stage-awareness over generic best practices
Advice should fit where the user actually is.

---

## What V1 Should Do

### Founder-coach V1
- one dashboard recommendation card
- one reactive advice endpoint or surface
- context assembled from verified product state
- store-readiness skills loaded when relevant
- no automatic task creation
- no hidden checklist mutations

### Founder-coach V1 should not do
- full autonomous workflow planning
- silent creation of tasks/checklist items
- rich stage model beyond current binary if product state does not support it yet
- pulse/performance interpretation from weak or missing data

---

## What V2 Can Add

### Founder-coach V2
- suggested tasks from events
- suggested metric templates after launch
- store-readiness recommendation cards when platform target is known
- richer stage model beyond binary status
- approval flow for AI-generated actions

---

## What V3 Can Add

### Founder-coach V3
- pulse/performance interpretation
- event-driven recommendations across more surfaces
- higher-confidence automatic drafts
- monitoring / steering guidance
- “how is the product doing?” operator summaries

---

## Acceptance Criteria for Runtime Integration

### V1 acceptance criteria
- founder-coach can answer a direct user question using verified product context
- dashboard can show a short proactive recommendation based on known state
- advice differs between `PRE_LAUNCH` and `LAUNCHED`
- advice does not hallucinate unsupported product facts
- store readiness questions trigger the correct store advisor skill
- output is useful without being noisy

### Anti-acceptance criteria
V1 is not done if:
- coach gives obviously generic startup advice
- coach invents product facts not present in state
- proactive cards appear too often or with weak relevance
- AI silently writes tasks/checklists with no user approval

---

## Recommended Implementation Order

1. context assembly helper/service
2. reactive founder-coach endpoint/surface
3. dashboard proactive suggestion card
4. store-readiness branch logic
5. draft task/metric suggestion system later

This order keeps the feature useful early while protecting trust.

---

## Final Product Intent

Founder-coach should eventually make Tiramisup feel like:
- the product understands what stage the user is in
- the product knows what matters now
- the product does not overwhelm the user
- the product can suggest the next strong move from real context

That is the target.
