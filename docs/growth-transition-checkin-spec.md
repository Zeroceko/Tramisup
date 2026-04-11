# Growth Transition Check-In Spec

Last updated: 2026-04-12
Status: v1 partially shipped, follow-on reference for future iterations

## Why this exists

Growth currently mixes four jobs in one place:

1. context collection
2. metric setup
3. weak-link diagnosis
4. execution / tactics

The goal is not to rebuild Tiramisup into a growth-only product.
The goal is to make the Growth surface behave like a clear module inside the founder operating system.

What is already live:
- `intake_needed`
- `metric_setup_needed`
- `baseline_needed`
- `diagnosis_ready`
- bounded question selection
- intake persistence inside `Product.additionalContext`
- metric setup copy personalization from intake context

What remains more directional than fully shipped:
- richer normalization of growth context
- deeper tactics coupling
- more adaptive question weighting

## Product intent

Launch should answer:
- "Are we ready to go live?"

Metrics should answer:
- "What are we actually tracking?"

Growth should answer:
- "Given what we track, what does it mean and what should we do next?"

That means Growth should not start by pretending diagnosis is already ready when setup context is still missing.

## Target model

Growth should have three modes:

1. `intake_needed`
2. `metric_setup_needed`
3. `diagnosis_ready`

The intended user flow is:

`Launch -> Growth Check-In -> Metric Setup Wizard -> Growth Workspace`

## Mode definitions

### 1. intake_needed

When true:
- the system still lacks product-specific growth context
- setup would be generic or weak without asking a few targeted questions

What the user sees:
- a short, bounded check-in
- 3-5 adaptive questions
- no open-ended freeform interview as the main flow

### 2. metric_setup_needed

When true:
- the user has enough context to choose a metric system
- but tracked signals are not yet clearly defined

What the user sees:
- a step-by-step metric setup flow
- onboarding-quality clarity
- agent support embedded into the flow, not floating outside it

### 3. diagnosis_ready

When true:
- growth context exists
- metric setup exists
- baseline data is present enough to support interpretation

What the user sees:
- one weak-link diagnosis
- why it matters
- related checklist / execution
- optional tactics
- optional task creation

The workspace should no longer ask setup questions at this stage.

## Agent role

The agent is not the product.

The agent should:
- read existing product context
- choose the most relevant questions from a bounded question pool
- explain why a metric or question matters when needed
- help convert guidance into tasks

The agent should not:
- invent a freeform interview from scratch
- replace the setup flow
- override the product spine
- generate high-confidence guidance from weak evidence

## Question selection model

The check-in should use a bounded adaptive questionnaire.

### Inputs to selection

- product category
- target audience
- business model
- launch stage / product status
- metric readiness
- connected integrations
- source trust / data confidence
- existing weak-link ambiguity

### Selection rules

- choose at most 3-5 questions
- avoid asking two questions that unlock the same decision
- prioritize questions that improve metric setup quality first
- next prioritize questions that improve diagnosis quality
- finally prioritize questions that improve tactics relevance

### Output shape

The agent should return:

```ts
type SelectedGrowthQuestion = {
  id: string;
  prompt: string;
  reasonCode:
    | "missing_growth_goal"
    | "missing_acquisition_source"
    | "missing_first_value_action"
    | "missing_retention_rhythm"
    | "missing_revenue_motion"
    | "missing_bottleneck_self_report"
    | "missing_source_confidence";
  priority: "high" | "medium";
};
```

## Question pool

Initial bounded pool:

- growth goal
- acquisition source
- first value action
- retention rhythm
- revenue motion
- bottleneck self-report
- source trust / data confidence

Example prompts:

- "What is the single most important growth outcome right now?"
- "Where do your first users mainly come from today?"
- "What exact action counts as first value for this product?"
- "What tells you a user is returning, not just visiting once?"
- "How does this product currently turn value into revenue?"
- "Which part of the loop feels weakest to you right now?"
- "How trustworthy is your current data source?"

## Metric setup wizard

Metric setup should be separate from the diagnosis workspace.

Suggested flow:

1. choose primary growth goal
2. choose the core metrics to track
3. connect or confirm data sources
4. confirm baseline readiness
5. finalize the metric system

The wizard should feel more like onboarding than like a settings form.

## Growth workspace rules

Once diagnosis is ready, the main Growth screen should only do these jobs:

- identify the weak link
- explain why it is the weak link
- show the execution checklist tied to that diagnosis
- show tactics only when justified
- let the founder turn guidance into tasks

The Growth workspace should not:

- ask setup questions
- bury metric setup inside the diagnosis surface
- show multiple competing growth stories at once

## Safe rollout plan

### P0
- clean up the current Growth workspace states
- separate setup-first vs diagnosis-ready visually
- harden the checklist experience

### P1
- add `intake_needed` state
- implement bounded question selection
- persist normalized growth context

### P2
- connect normalized growth context into diagnosis, checklist, and tactics
- make question selection more product-aware over time

## Success criteria

We know this worked when:

- Growth no longer feels like one mixed workspace
- users can tell whether they are setting up, measuring, or deciding
- the agent feels embedded into the system, not bolted onto the side
- diagnosis and tactics become more product-specific without turning generic
