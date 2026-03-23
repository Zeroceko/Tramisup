# Founder Coach Agent Framework

**Status:** Active architecture direction  
**Last Updated:** 22 March 2026

---

## Why this exists

Founder Coach is no longer just a prompt wrapper.
It now needs to behave like a lightweight user-facing decision engine inside Tiramisup.

The product requirement is not “generic AI chat.”
The requirement is:
- use verified product state
- route to the right advisory knowledge
- choose the right response mode
- keep output calm, stage-aware, and actionable
- prefer proposals over silent mutations

This document defines that framework.

---

## Framework goal

Founder Coach should answer four questions reliably:

1. What matters right now?
2. What should the user do next?
3. What can wait?
4. Which advisory knowledge is relevant for this situation?

---

## Non-goals

This is **not** a full autonomous agent loop.

Founder Coach should not:
- silently create tasks/checklists/metrics by default
- mutate product state without an explicit proposal/approval model
- behave like a generic chatbot disconnected from product state
- spawn many sub-agents or an overbuilt orchestration system

This is a **skill-routed, context-driven decision engine**.

---

## Core layers

### 1. Context Assembly Layer
Source of truth for verified state.

Inputs include:
- product identity
- launch status / stage
- execution state
- metrics state
- store readiness hints
- recent event

Output:
- `FounderCoachContext`

Current implementation:
- `lib/founder-coach-context.ts`

### 2. Skill Routing Layer
Determines which project knowledge should be loaded.

Examples:
- store submission → store advisor skill
- metric confusion / analytics interpretation → data-analyst
- prioritization / sequencing → product-strategist
- compliance / privacy / terms → legal-advisor

Current implementation:
- `lib/project-skill-loader.ts`

### 3. Decision Policy Layer
Decides what kind of answer should be produced.

Response modes:
- `REACTIVE_ANSWER`
- `PROACTIVE_SUGGESTION`
- later: `TASK_PROPOSAL`, `METRIC_PROPOSAL`, `CHECKLIST_PROPOSAL`

Current implementation:
- `lib/founder-coach-agent.ts`

### 4. Output Composer Layer
Forces outputs into stable user-facing shapes.

Current shapes:
- reactive answer JSON
- proactive suggestion JSON

Rules:
- concise
- Turkish
- tied to known context
- no generic startup fluff

### 5. Proposal Layer (future)
Will generate draft actions, not silent state changes.

Examples:
- draft tasks
- draft metric recommendations
- draft checklist sections

This should remain opt-in.

---

## Current response policy

### Reactive mode
Use when the user explicitly asks a question.

Framework behavior:
1. assemble verified context
2. route relevant skills
3. compose a focused answer
4. return priorities + what can wait

### Proactive mode
Use when the system needs to show one next-step suggestion.

Framework behavior:
1. assemble verified context
2. choose highest-confidence next step
3. keep it short
4. avoid broad checklists

---

## Current skill routing set

Founder Coach can currently route to:
- `app-store-submission-advisor`
- `play-store-submission-advisor`
- `data-analyst`
- `product-strategist`
- `legal-advisor`

This is enough for the current product direction.

Future routing may include:
- research synthesis
- UI/UX recommendations
- optimization guidance

Only add routing when the user-facing need is real.

---

## Product rules the framework must preserve

1. Verified context only
2. Stage-aware guidance
3. Suggestion-first, not silent automation
4. One strong next step beats many weak ones
5. Beginner-friendly language beats internal jargon
6. Calm product behavior beats clever agent behavior

---

## Next framework expansions

### Near-term
- add proposal modes for tasks / metrics / checklists
- add confidence/cooldown policy for proactive surfaces
- add stronger beginner-safe metric phrasing policy

### Later
- event-specific response templates
- suppression of repetitive advice
- proposal approval lifecycle in UI

---

## Implementation note

This framework should stay small.
If it starts looking like a generic multi-agent system, it is probably going in the wrong direction.

Tiramisup needs a reliable founder coach, not an AI research project.
