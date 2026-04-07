# Tasks & Growth Issues And Solutions

## Purpose

This document captures the current product/UX issues observed in the Tasks and Growth screens, along with solution directions and an implementation-oriented sprint frame.

It is intended to be read after `docs/handoff.md`, so the reader understands the current production context, recent changes, and the repo's active workstreams before evaluating these screen-level problems.

---

## Screen 1: Tasks

### Problem 1: Task overload on first view
- Too many tasks appear at once.
- The screen answers "what exists?" better than "what should I do now?"

Why this is a problem:
- Founders lose the sense of a clear next step.
- A long queue increases avoidance and perceived product complexity.

Likely root cause:
- Tasks are rendered too directly from generated/planned data.
- There is no strong default curation layer for "now vs later."

Solution direction:
- Default to a `Now / Later / Done` model.
- Show at most 3-5 tasks in `Now`.
- Collapse the rest behind a secondary section.

### Problem 2: Duplicate and near-duplicate tasks
- Similar tasks repeat with slightly different phrasing.
- Multiple generic task cards say almost the same thing.

Why this is a problem:
- Repetition erodes trust in the system's intelligence.
- Completion metrics become noisy and misleading.

Likely root cause:
- Weak dedupe logic in task generation and normalization.
- Similar recommendations from different sources are not merged.

Solution direction:
- Add dedupe and semantic merge rules at the generation layer.
- Enforce one canonical task per objective/outcome.

### Problem 3: Mixed language and low-quality phrasing
- Turkish and English appear together.
- Some tasks read like generic AI filler instead of concrete work items.

Why this is a problem:
- It breaks product credibility.
- Users cannot quickly parse intent or execution steps.

Likely root cause:
- Locale consistency is not enforced strongly enough upstream.
- Text cleanup is happening too late in the UI layer.

Solution direction:
- Enforce locale at task generation time.
- Remove generic phrasing and filler patterns from the source prompts/schema.
- Treat UI-side string normalization only as a short-term patch.

### Problem 4: Task cards explain status better than execution
- Users can see a title and a CTA, but not always the exact meaning of the task.
- "Start" without enough context feels procedural rather than helpful.

Why this is a problem:
- Users must interpret the task themselves.
- This increases hesitation and lowers completion confidence.

Likely root cause:
- Task schema is too shallow.
- Done criteria and execution guidance are not mandatory fields.

Solution direction:
- Require every task to have:
  - `title`
  - `whyItMatters`
  - `doneCriteria`
  - `nextAction`
  - `source`
- Make `View details` consistently visible.
- Use a detail modal to explain the task in plain language.

### Problem 5: Category architecture is weak
- "Other" grows too large.
- Categories do not feel like a trustworthy navigation model.

Why this is a problem:
- Filters stop helping once the fallback bucket becomes dominant.
- The user experiences the system as loosely organized.

Likely root cause:
- Categories are too permissive.
- Classification is not strict enough upstream.

Solution direction:
- Make category assignment stricter.
- Reduce or eliminate catch-all behavior.
- Do not generate tasks without a usable category.

---

## Screen 2: Growth

### Problem 1: No singular focus
- Too many modules compete at once: recommendation rail, status cards, focus card, tactics, checklist, goals, routines, timeline.

Why this is a problem:
- Users cannot tell what the primary action is.
- The page behaves like a broad dashboard instead of a directional workspace.

Likely root cause:
- Too many valid concepts are displayed at the same hierarchy level.
- There is limited progressive disclosure.

Solution direction:
- Reframe the page around 3 primary zones:
  - Today's focus
  - Recommended tactic
  - Execution checklist
- Demote the rest into collapsed or secondary sections.

### Problem 2: Redundant content across modules
- Recommendations appear in more than one place.
- Checklist summaries and checklist content overlap.

Why this is a problem:
- The page feels larger without becoming clearer.
- Users spend time comparing surfaces instead of acting.

Likely root cause:
- Recommendation, tactic, and checklist systems are not sharply separated.
- Information architecture favors display richness over task clarity.

Solution direction:
- Remove repeated recommendation surfaces.
- Keep one primary recommendation surface and one primary execution surface.
- Eliminate duplicate checklist summaries if the checklist itself is visible.

### Problem 3: Status metrics are not action-linked enough
- Cards such as selected signals or completed growth work are informative, but not strongly tied to the next decision.

Why this is a problem:
- Users see state, but not always consequence.
- Metrics compete with action instead of supporting it.

Likely root cause:
- Status cards are optimized for overview, not operational guidance.

Solution direction:
- Reduce the number of status cards.
- Each remaining card should answer:
  - what is the issue,
  - why it matters,
  - what to do next.

### Problem 4: Strategy and execution are blended together
- Growth tactics, operational checklist items, goals, and routines sit too close together.

Why this is a problem:
- The user has to mentally convert strategy into execution on the fly.
- This increases cognitive load and dilutes urgency.

Likely root cause:
- The page lacks a stronger distinction between:
  - what we believe,
  - what we should do,
  - what is already being tracked.

Solution direction:
- Separate strategy from execution in the UI.
- Tactic cards should answer "why this lever."
- Checklist/task cards should answer "what to do next."

---

## Product Principles

These principles should guide both screens:

1. The user must understand the next action within 3 seconds.
2. The system must not create recommendation inflation.
3. One objective should map to one canonical task.
4. Strategy and execution must not compete visually.
5. Locale consistency is mandatory, not best effort.
6. Every actionable item must include a clear done definition.
7. Secondary information should be collapsed by default.
8. The product should optimize for confidence, not density.

---

## Target State

### Tasks target state
- The screen opens with a tight list of the most relevant tasks.
- The user sees:
  - what matters now,
  - why it matters,
  - what done looks like.
- Secondary tasks are present, but visually de-emphasized.
- Duplicate and generic tasks are gone.

### Growth target state
- The page communicates a single growth focus.
- The user understands:
  - what the current weak point is,
  - which tactic is recommended,
  - which execution steps turn that tactic into work.
- Strategy modules support action instead of competing with it.

---

## Sprint Plan

### Sprint 1: Fast clarity wins

Goal:
- Reduce immediate cognitive overload with low-risk structural changes.

Work:
- Limit default visible tasks.
- Add stronger `Now / Later / Done` structure.
- Make detail actions consistent and visible.
- Collapse secondary Growth sections by default.
- Remove or hide duplicate recommendation surfaces where possible.

Expected user impact:
- Faster orientation.
- Less overwhelm.
- Stronger sense of momentum.

### Sprint 2: Information architecture and content quality

Goal:
- Improve hierarchy, remove repetition, and make both screens more trustworthy.

Work:
- Reorganize Growth into fewer primary blocks.
- Reduce repeated cards and summaries.
- Improve task schema so every task has meaning and a done state.
- Tighten categories and reduce "Other."
- Normalize output quality and tone for Turkish.

Expected user impact:
- Better comprehension.
- Fewer ambiguous tasks.
- More confidence in system recommendations.

### Sprint 3: Systemic generation quality and measurement

Goal:
- Fix the upstream causes of noisy screens.

Work:
- Add task generation rules for dedupe, locale, specificity, and count caps.
- Introduce stronger validation for task schema completeness.
- Instrument ignored tasks, opened detail modals, started tasks, and completed tasks.
- Measure whether users are acting on fewer but better tasks.

Expected user impact:
- Cleaner screens over time.
- More reliable personalization.
- Better recommendation quality at scale.

---

## Implementation Notes

- Prefer fixing content quality upstream rather than patching strings in the UI.
- Avoid introducing more dashboard cards as a solution to dashboard confusion.
- Avoid showing multiple recommendation systems in parallel unless each has a distinct role.
- Do not let "richness" justify duplicated or weakly differentiated modules.
