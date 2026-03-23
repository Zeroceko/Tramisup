# Analytics Instrumentation Advisor

**Primary use:** Tiramisup should use this skill to generate user-facing measurement design guidance for events, funnels, dashboards, and analytics setup.

Use this skill when recommending what to track, how to name events, which properties matter, and how product telemetry should support launch and growth decisions. This skill is for **instrumentation and measurement design**, not for data analysis summaries or dashboard interpretation.

## Use This For

Apply this skill when the task involves any of the following:
- tracking plan creation
- event naming and taxonomy
- funnel instrumentation
- product analytics setup
- telemetry / measurement layer design
- dashboard input design
- agentic data workflow setup

## Do Not Use This For

- metric interpretation or trend analysis already captured by data-analyst
- launch compliance or store submission advice
- generic “track everything” advice without a concrete schema

## Core Principle

Measurement should start from the **user journey and product decisions**. Track only what helps the founder understand activation, retention, revenue, and launch progress.

## Required Recommendation Areas

When creating analytics guidance for users, make sure recommendations cover these groups.

### 1. Event Taxonomy

Always define:
- the key product events
- a consistent naming scheme
- the difference between action events, lifecycle events, and revenue events

### 2. Properties and Context

Always check whether the user is capturing:
- product id / workspace context
- locale and platform
- stage or plan type
- source / campaign / referrer where relevant
- outcome properties that explain the event

### 3. Funnel Coverage

Always connect events to:
- activation
- retention
- revenue
- launch progress
- growth experiments

### 4. Validation and Data Quality

Do not forget to recommend:
- schema validation
- duplicate event prevention
- timezone/date consistency
- source-of-truth clarity
- test events before trusting the dashboard

### 5. Agentic Data Workflow

When the product uses AI or multi-step workflows:
- prefer verified events over guessed signals
- treat missing telemetry as a setup gap, not a growth insight
- make downstream advice depend on recorded evidence

## Output Style

When using this skill for user-facing guidance:
- group recommendations by priority
- separate **must-track now** from **track later**
- explain *why* each event or property matters
- keep the schema practical and founder-friendly

## Preferred Priority Structure

### Must-Track Now
Events without which the founder cannot see the funnel.

### Strongly Recommended
Events that improve decision quality or attribution.

### Nice to Add
Events that sharpen the dataset but are not urgent.

## Common Instrumentation Heuristics

Flag these as high-risk when advising users:
- ambiguous event names
- missing context properties
- no clear owner for the tracking plan
- instrumentation that cannot support a funnel or decision
- dashboards built before events are trustworthy

## How Tiramisup Should Use This Skill

If Tiramisup is generating guidance for users, prefer outputs like:
- tracking plan
- event schema checklist
- funnel instrumentation checklist
- analytics setup summary
- data quality review for product telemetry

Do not present this as a data-science verdict. Present it as practical instrumentation guidance for product decisions.
