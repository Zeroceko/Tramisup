# AI Context Model for Tiramisup

This document defines the **verified context contract** that must be supplied to user-facing AI features in Tiramisup.

Its purpose is to make AI helpful without letting it invent product state, random tasks, or irrelevant advice. The model should reason from known product data, recent user actions, and explicitly stored state.

## Core Principle

User-facing AI in Tiramisup must behave like a **context-aware operator**, not a speculative chatbot.

That means:
- it should reason from verified product state
- it should use known stage/status and recent user actions
- it should prefer **suggested next actions** over unsupported assertions
- it should not invent hidden context
- when context is incomplete, it should either ask, state assumptions, or give split guidance

---

## Context Layers

The full AI context is made of 7 layers.

### 1. Product Identity Context
Defines what the product is.

**Fields**
- `product.id`
- `product.name`
- `product.description`
- `product.category`
- `product.targetAudience`
- `product.businessModel`
- `product.website`
- `product.launchStatus` (from wizard phrasing)
- `product.status` (`PRE_LAUNCH` / `LAUNCHED`)
- `product.createdAt`

**Why it matters**
Without this layer, AI cannot distinguish between:
- SaaS vs content app
- B2B vs B2C
- monetized vs free
- launch prep vs growth optimization

---

### 2. Stage / Status Context
Defines where the user is in the operator journey.

## Current implemented state
Today the product reliably has:
- `PRE_LAUNCH`
- `LAUNCHED`

## Future stage direction
Later, this can expand into a richer stage model such as:
- pre-launch
- just launched
- early traction
- growth optimization
- monitoring / steering

For now, AI should treat `status` as the authoritative stage proxy unless a richer model is introduced.

**Derived guidance examples**
- `PRE_LAUNCH` → focus on blockers, readiness, instrumentation, store submission prep, activation definition
- `LAUNCHED` → focus on first user behavior, activation, retention, conversion, metrics, feedback loops

---

### 3. Execution State Context
Defines what the user has already done inside the workspace.

**Fields**
- pre-launch checklist counts
  - total
  - completed
  - blocker/high-priority open count
- growth checklist counts
  - total
  - completed
  - category completion by acquisition / activation / retention / revenue
- open task count
- done task count
- recent tasks completed
- connected integrations count
- goals count
- active routines count

**Why it matters**
This is the main way AI avoids random recommendations.
Examples:
- if legal checklist items are still open, don’t recommend advanced launch experiments first
- if activation items are incomplete, don’t jump straight to retention optimization
- if growth checklist is mostly empty, focus on setup before interpretation

---

### 4. Metrics Context
Defines what the user is measuring and what is still undefined.

**Current known metric entities**
- DAU
- MRR
- activation funnel data
- retention cohorts
- manually entered metrics

**Fields AI should receive**
- which core metrics are already defined
- latest metric entries
- last update timestamps
- trend direction if available
- whether the user has defined:
  - activation metric
  - conversion metric
  - revenue metric
  - retention metric

**Missing-metric flags**
The AI should be able to reason from booleans like:
- `hasActivationMetric`
- `hasRevenueMetric`
- `hasRetentionMetric`
- `hasAnyRecentMetricEntry`

**Why it matters**
This lets AI say useful things like:
- “you launched, but you haven’t defined activation yet”
- “you have MRR but no clear activation measure”
- “you’re tracking too much manually; focus on one metric first”

---

### 5. Launch / Store Readiness Context
Defines whether store-submission and review advice is relevant.

**Fields AI should receive when available**
- target platform(s): iOS / Android / web / SaaS
- app store intent known or not
- login required or not
- social login present or not
- paywall/subscription present or not
- privacy policy exists or not
- terms exist or not
- review/test account prepared or not
- screenshots prepared or not
- icon / metadata readiness known or not
- IAP/subscription setup known or not

**Why it matters**
Without this layer, AI will either:
- skip store-readiness advice when it matters
- or hallucinate store-readiness advice when it is irrelevant

This is the layer that should trigger the use of:
- `.gsd/skills/app-store-submission-advisor/SKILL.md`
- `.gsd/skills/play-store-submission-advisor/SKILL.md`

---

### 6. User Event Context
Defines what the user just did.

This is the most important layer for proactive AI.

**High-value events**
- wizard completed
- product created
- product URL added or changed
- launch marked complete
- checklist item toggled
- growth checklist item toggled
- metric added
- goal added
- routine completed
- task completed
- integration connected
- store target selected
- monetization/paywall info provided

**Why it matters**
A user event can change what AI should recommend immediately.
Examples:
- user marks product as launched → stop focusing on launch blockers, start focusing on activation and first metrics
- user adds iOS target + paywall → surface store-review and subscription guidance
- user adds first metrics → switch from “define metrics” to “interpret early results”

---

### 7. AI Interaction Context
Defines how AI is being used right now.

**Fields**
- `mode`: `reactive` or `proactive`
- `trigger`: user question, launch event, metric event, dashboard card, etc.
- `confidence`: low / medium / high
- `loadedSkills`: which skills were explicitly loaded
- `allowedActionType`: suggest / draft / explain / summarize

**Why it matters**
AI should not behave the same way in every surface.
A proactive dashboard card should be short and high-confidence.
A reactive chat answer can be fuller and more explanatory.

---

## Required Context by Use Case

### A. Reactive founder question
Example: “What should I do next?”

**Minimum required context**
- product identity
- product status/stage
- execution state summary
- metric summary
- user question

**Nice to have**
- recent events
- platform target
- monetization model

---

### B. Proactive dashboard suggestion
Example: “Suggested next step” card

**Minimum required context**
- product status/stage
- execution state summary
- latest relevant user event
- metric readiness flags

**Rule**
Only show when the suggestion is high-confidence and clearly useful.

---

### C. Store submission advice
Example: “What still blocks App Store submission?”

**Minimum required context**
- target platform
- login required?
- paywall/subscription present?
- privacy/legal readiness flags
- screenshots / metadata readiness if known
- relevant store advisor skill loaded

---

### D. Metric recommendation guidance
Example: “What should I track first?”

**Minimum required context**
- product stage/status
- business model
- target audience/product type
- known metrics already defined
- recent launch state

**Rule**
Do not recommend a giant analytics stack if activation and conversion definitions are still missing.

---

## Context Completeness Rules

### If context is sufficient
AI may:
- recommend next steps
- propose draft tasks/checklist items/metrics
- proactively surface short guidance

### If context is partial
AI should:
- label assumptions
- give split advice where useful
- avoid overconfident conclusions

### If context is weak
AI should:
- ask for the missing information
- or stay narrow and generic on purpose
- not hallucinate specific product claims

---

## Action Policy

User-facing AI should **not** immediately mutate the workspace based on its own output.

### Default policy
AI output should be:
- suggestion
- draft task
- draft checklist item
- draft metric recommendation
- explanation
- prioritization note

### Not default
AI should not silently:
- create tasks
- add checklist items
- change product stage
- alter metrics
- modify goals

### Later evolution
After enough trust and evaluation, the product may allow:
- user-approved task creation from AI suggestions
- user-approved checklist additions
- user-approved metric setup templates

But the starting rule is suggestion-first, mutation-later.

---

## Recommended Context Payload Shape

A practical payload to the founder-coach layer could look like this:

```json
{
  "product": {
    "id": "...",
    "name": "...",
    "description": "...",
    "category": "...",
    "targetAudience": "...",
    "businessModel": "...",
    "website": "...",
    "launchStatus": "...",
    "status": "PRE_LAUNCH"
  },
  "execution": {
    "launchChecklist": { "total": 12, "completed": 7, "blockers": 2 },
    "growthChecklist": { "total": 10, "completed": 1 },
    "tasks": { "open": 5, "done": 9 },
    "goals": 1,
    "routines": 2,
    "integrationsConnected": 0
  },
  "metrics": {
    "hasActivationMetric": false,
    "hasRevenueMetric": true,
    "hasRetentionMetric": false,
    "latest": { "dau": 21, "mrr": 49 },
    "lastUpdatedAt": "..."
  },
  "storeReadiness": {
    "platforms": ["iOS"],
    "loginRequired": true,
    "socialLogin": false,
    "hasSubscription": true,
    "hasPrivacyPolicy": false,
    "hasTerms": false,
    "hasReviewAccount": false
  },
  "recentEvent": {
    "type": "PRODUCT_LAUNCHED",
    "at": "..."
  },
  "ai": {
    "mode": "proactive",
    "trigger": "dashboard",
    "allowedActionType": "suggest"
  }
}
```

This is only an example. The important thing is structured verified context, not this exact schema.

---

## Product Guidance by Phase

### What exists now
- binary transition: pre-launch vs launched
- AI plan generation
- AI insights card
- founder-coach rules
- store advisor skills

### What should come next
1. founder-coach runtime integration
2. reliable context assembly layer
3. reactive founder-coach answers in product
4. proactive “suggested next step” cards
5. draft task / draft metric recommendations
6. richer stage model later

---

## Success Condition

The AI context model is successful when:
- AI advice feels specific to the user’s product
- AI does not hallucinate irrelevant recommendations
- launch and post-launch guidance clearly differ
- metric guidance matches the user’s stage
- store-readiness advice appears only when relevant
- AI behaves like a disciplined operator assistant rather than a generic chatbot
