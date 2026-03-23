# Skill Gateway

**Primary use:** Tiramisup should use this skill as the first routing layer for skill-related, workflow, or ambiguous task requests.

Use this skill when the request is broad, unclear, or could map to multiple project skills. The gateway should decide the most relevant downstream skill, keep routing invisible, and avoid making the user think about the skill system.

## Use This For

Apply this skill when the task involves any of the following:
- choosing which skill should handle a request
- routing a task to app-store, ASO, launch, analytics, or strategy guidance
- vague or multi-domain requests
- discovering whether a skill already exists
- deciding whether to search for a skill, create a skill, or combine skills

## Do Not Use This For

- direct domain work when the needed skill is already obvious
- generic conversation that does not require task routing
- replacing the downstream skill’s actual instructions

## Core Principle

The gateway is **invisible routing, not extra work**. Assess quickly, choose the right skill, and continue as if that skill had been triggered directly.

## Routing Rules

### 1. Prefer a direct match

If a clear downstream skill exists, load it and proceed.

### 2. Resolve ambiguity minimally

If the request is ambiguous, ask one short clarifying question only when needed.

### 3. Combine skills when appropriate

If the request spans multiple domains, load the smallest useful set of skills.

### 4. Fall back intelligently

If no good skill exists:
- suggest a workaround
- or create a new skill with `skill-creator`

## High-Level Skill Map

- store readiness and review guidance: `app-store-submission-advisor`, `play-store-submission-advisor`
- listing optimization: `aso-advisor`
- launch blockers and stage transitions: `launch-readiness-advisor`
- measurement design: `analytics-instrumentation-advisor`
- marketing / planning / prioritization: `product-strategist`
- legal / compliance: `legal-advisor`

## Output Style

When using this skill:
- keep routing invisible to the user
- do not overexplain the gateway decision
- mention downstream skills only if the user explicitly asks
- keep the first response short and action-oriented

## Common Gateway Heuristics

Flag these as high-risk when routing:
- a single request clearly needs two or more skills
- the user asks for “the right skill”
- the user is unsure what to do next
- the request mixes strategy, compliance, and metrics

## How Tiramisup Should Use This Skill

If Tiramisup is generating guidance for users or for internal routing, prefer outputs like:
- “This should go to ASO + App Store readiness”
- “This is a launch-readiness question”
- “This needs analytics instrumentation, not metric interpretation”
- “No matching skill exists; create one”

Do not present this as user-facing product advice. It is the routing layer behind the advice.
