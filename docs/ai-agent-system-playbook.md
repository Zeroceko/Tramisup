# Tiramisup AI Agent System Playbook — Final

This document defines the final design framework for the AI agent system inside Tiramisup that generates recommendations, tasks, checklist items, blocker detection, growth commentary, and next-step guidance.

This version includes:
- onboarding answers → normalized context mapping
- normalized context → evidence map flow
- evidence threshold matrix
- recommendation taxonomy
- fallback / reject / low-confidence rules
- critic veto system
- context model aligned with the intake question playbook

## 1. System purpose

The AI layer inside Tiramisup is not a chat assistant.
Its job is to:
- understand the user’s product context
- classify current data quality
- decide which recommendations can and cannot be made
- produce 1 primary recommendation and at most 2–3 supporting recommendations
- state uncertainty explicitly
- recommend data collection or setup completion when evidence is insufficient

The AI system should behave as:
**a disciplined recommendation engine inside a founder operating system**

It should not behave as:
- a generic startup mentor
- a motivational assistant
- a copy-paste growth hacker
- a fake expert speaking confidently without evidence

## 2. Core principles

### 2.1 Evidence-first
Every recommendation must be tied to a visible evidence chain.
No evidence, no strong recommendation.

### 2.2 Known / Inferred / Unknown separation
The agent must always classify information into:
- **Known**: explicitly available in the system
- **Inferred**: a plausible but non-certain interpretation of available data
- **Unknown**: missing or unverified information

### 2.3 Strong recommendation threshold
A strong recommendation requires a minimum evidence threshold.
If evidence is below threshold, the agent must:
- avoid strong recommendations
- label confidence appropriately
- recommend setup completion or information gathering first

### 2.4 Stage-appropriateness
Recommendations must match the user’s current stage.
Examples:
- do not give retention optimization advice to a development-stage product
- do not present metric interpretations with certainty when no trusted source exists
- do not recommend scale tactics before launch readiness is established

### 2.5 Prefer silence over nonsense
If there is not enough evidence, the system should say less.
No recommendation is better than a bad recommendation.

### 2.6 Short, ranked, actionable
The system should not generate long, messy lists.
Default output structure:
- 1 primary recommendation
- up to 3 supporting recommendations
- a short list of missing information needed for stronger guidance

### 2.7 No generic startup sludge
The system must filter out advice like:
- “do social media”
- “improve onboarding”
- “collect user feedback”
- “run growth experiments”
- “optimize your landing page”

These are only acceptable when tied to specific context, evidence, and timing.

## 3. System architecture

Recommended flow:

1. **Raw intake**
2. **Context normalization**
3. **Evidence building**
4. **Recommendation generation**
5. **Critic review**
6. **User-facing formatting**
7. **Learning / analytics loop**

Formula:
**Answers → Normalized Context → Evidence Map → Recommendation Candidates → Critic Filter → Final Guidance**

## 4. Agent team structure

Recommended agents:
1. Context Interpreter Agent
2. Evidence Builder Agent
3. Recommendation Engine Agent
4. Critic / Sanity Checker Agent
5. Response Formatter / Coach Agent

### 4.1 Context Interpreter Agent
Responsibilities:
- normalize onboarding and system data
- extract product type, audience, business model, stage, launch state, metric state, and source state
- flag missing fields
- flag contradictory inputs as ambiguity flags

Input:
- onboarding answers
- project metadata
- selected categories
- selected stage
- launch date
- URL signals if available

Output:
- structured project context
- missing fields
- ambiguity flags
- context confidence score

Must not:
- generate recommendations
- create tasks
- mark uncertain information as certain

### 4.2 Evidence Builder Agent
Responsibilities:
- determine what data is actually available in the system

Must collect:
- onboarding context
- checklist state
- task state
- selected metrics
- source connection state
- source validation state
- daily metric data availability
- recent deltas / trends
- prior recommendations
- user dismiss / accept history

Output:
- evidence map
- known facts
- inferred facts
- unknown facts
- recommendation readiness score

### 4.3 Recommendation Engine Agent
Responsibilities:
- generate recommendations only from the evidence map

Allowed recommendation types:
- launch blocker recommendation
- readiness next-step recommendation
- source setup recommendation
- metric selection recommendation
- daily action recommendation
- weak-link recommendation
- data collection recommendation
- weekly focus recommendation

Each recommendation must include:
- recommendation_title
- recommendation_type
- priority
- impact_area
- why_now
- supporting_evidence
- assumptions
- missing_data
- confidence
- expected_outcome
- user_action

Rules:
- 1 primary + max 3 supporting recommendations
- no duplicates
- no high-priority recommendation with weak evidence presented as strong
- high-confidence output requires threshold satisfaction

### 4.4 Critic / Sanity Checker Agent
Responsibilities:
- review the Recommendation Engine output

Checks:
- Is it stage-appropriate?
- Is it generic?
- Is it supported by available data?
- Is it repetitive?
- Is the confidence realistic?
- Does it use unknown data as known?
- Is it actionable?
- Would it create misleading certainty in the UI?

Output:
- approved
- revise
- reject

Reject reasons:
- insufficient evidence
- stage mismatch
- generic advice
- duplicate recommendation
- false confidence
- irrelevant action
- unsupported blocker claim

### 4.5 Response Formatter / Coach Agent
Responsibilities:
- turn approved recommendations into user-facing guidance

Rules:
- calm tone
- visible confidence
- clear separation between certainty and probability
- minimal jargon
- concise formatting

Output:
- primary recommendation
- supporting recommendations
- why this matters
- what is needed for stronger guidance

## 5. Product intake → normalized context spec

### 5.1 Raw intake fields
Recommended raw fields:
- product_name
- product_description
- product_url
- categories
- platforms
- primary_audience
- secondary_audience
- business_model
- sales_motion
- stage
- primary_goal
- planned_launch_date

### 5.2 Normalized context fields
Agents should not receive raw free text directly. Convert to:

```json
{
  "product_name": "",
  "product_summary": "",
  "product_url": "",
  "categories": [],
  "platforms": [],
  "primary_audience": "",
  "secondary_audience": [],
  "business_model": "",
  "sales_motion": "",
  "stage": "",
  "primary_goal": "",
  "planned_launch_date": "",
  "context_confidence": "high | medium | low",
  "missing_fields": [],
  "ambiguity_flags": []
}
```

### 5.3 Normalization rules
- `product_description`: store raw separately; derive problem-space and user-type signals, but never use it as the sole decision source
- `categories`: map to a controlled vocabulary
- `platforms`: normalize to web / iOS / Android / desktop / API / multi-platform
- `audience`: preserve primary vs secondary; flag multi-segment products
- `business_model`: normalize freemium as a monetization pattern, not a complete monetization model by itself
- `stage`: use enum: `idea`, `development`, `testing`, `launch_prep`, `live`, `early_growth`
- `primary_goal`: use enum: `prepare_launch`, `get_first_users`, `validate_product`, `reach_first_value_usage`, `get_first_revenue`, `build_growth_rhythm`

### 5.4 Ambiguity detection
Create ambiguity flags when:
- description conflicts with category
- audience conflicts with sales motion
- stage and primary goal produce an odd combination
- `launch_prep` is selected but platform is missing
- `live` is selected while monetization / sources / metrics are completely absent

## 6. Normalized context → evidence map spec

The Evidence Builder combines normalized context with:
- checklist state
- task state
- metric selection state
- metric data state
- source connection state
- source validation state
- launch state
- user interaction history

### 6.1 Evidence map shape

```json
{
  "known_facts": [],
  "inferred_facts": [],
  "unknown_facts": [],
  "checklist_state": {},
  "task_state": {},
  "source_state": {},
  "metric_state": {},
  "launch_state": {},
  "recommendation_readiness": {
    "launch": "low | medium | high",
    "metrics": "low | medium | high",
    "growth": "low | medium | high",
    "source_setup": "low | medium | high"
  }
}
```

### 6.2 Evidence priority
Evidence trust order:
1. validated source data
2. explicit structured user input
3. confirmed task/checklist state
4. normalized text inference
5. heuristic inference

The Critic must reject strong recommendations that rely primarily on lower-trust sources.

## 7. Recommendation taxonomy

- **Launch blocker recommendation**: identifies issues that directly threaten launch readiness
- **Readiness next-step recommendation**: identifies the highest-impact next move to improve readiness
- **Source setup recommendation**: improves measurement reliability
- **Metric selection recommendation**: guides metric selection or corrects weak setups
- **Data collection recommendation**: recommends collecting missing information before stronger guidance
- **Daily action recommendation**: identifies today’s best next move
- **Weak-link recommendation**: identifies the weakest step in a funnel or loop
- **Weekly focus recommendation**: proposes the best focus area for the next week

## 8. Evidence threshold matrix

### 8.1 Launch blocker recommendation
Minimum required:
- stage
- readiness checklist status
- task status
- category / product type
- launch date if available

High confidence also benefits from:
- platform
- source-setup impact
- explicitly unresolved critical items

If insufficient:
- label as **possible launch risk**, not blocker

### 8.2 Readiness next-step recommendation
Minimum required:
- stage
- checklist state
- task state
- category

High confidence also benefits from:
- launch date
- platform
- source state

If insufficient:
- do not generate generic next tasks; recommend setup clarification first

### 8.3 Source setup recommendation
Minimum required:
- platform
- selected metrics or primary goal
- source connection state

High confidence also benefits from:
- source validation state
- metric dependencies

If insufficient:
- output as a lower-confidence recommended setup

### 8.4 Metric selection recommendation
Minimum required:
- category
- audience
- business_model
- stage
- platform

High confidence also benefits from:
- primary goal
- source availability

If insufficient:
- output a starter metric set labeled low confidence

### 8.5 Daily action recommendation
Minimum required:
- selected metrics
- current stage
- source trust state
- some recent state

High confidence also benefits from:
- a few days of metric history
- recent task changes
- prior recommendations

If insufficient:
- return a data collection recommendation instead

### 8.6 Weak-link recommendation
Minimum required:
- tracked metrics set
- data across multiple periods
- funnel / loop context

If insufficient:
- do not diagnose weak links

### 8.7 Weekly focus recommendation
Minimum required:
- stage
- recent recommendations
- recent task or metric shifts

High confidence also benefits from:
- 7-day metric pattern
- checklist progression

If insufficient:
- return setup-completion guidance instead

## 9. Confidence system

Every recommendation must include confidence.

### High confidence
Usually requires:
- sufficient onboarding context
- trusted source data or validated manual input
- correct stage information
- relevant module data available
- low unknown count
- threshold exceeded for the recommendation type

### Medium confidence
- context mostly exists
- some data gaps remain
- recommendation is plausible but not fully verified

### Low confidence
- recommendation is default / starter / template-based
- system is working with missing context
- recommendation is directional only

Rule:
- a low-confidence recommendation must never be written with high-priority blocker language

## 10. Hallucination guardrails

- Never present unknown information as known
- Never imply data from an unconnected source
- Do not over-infer from user text
- Do not dump category-wide cliché checklists
- Do not make strong system-level judgments from one answer alone
- If no recommendation is justified, say so clearly
- Unknown fields must not be treated as completed
- Surface uncertainty in wording: confirmed / likely / possible / unknown

## 11. Checklist and task generation rules

### 11.1 Checklist generation
Checklist pipeline:
1. category template
2. business model filter
3. stage filter
4. platform filter
5. source availability filter
6. primary goal filter
7. critic pass

Each checklist item should include:
- title
- why_it_matters
- when_it_applies
- blocker_level
- linked_stage
- evidence_needed

### 11.2 Task generation
Tasks should derive from recommendations, not become a generic backlog.

Each task should include:
- task_title
- impact_area
- priority
- source_recommendation_id
- done_definition
- expected_effect
- linked_module

## 12. Critic veto and fallback system

### 12.1 Reject conditions
Reject when:
- evidence threshold is not met
- stage mismatch exists
- recommendation is generic
- recommendation duplicates another
- confidence is overstated
- recommendation is unrelated to the user goal
- unknown data is used as known

### 12.2 Revise conditions
Revise when:
- the recommendation is directionally right but overly certain
- wording is too long
- two actions are mixed into one
- supporting evidence is weakly presented

### 12.3 Fallback types
After rejection, the system should fall back to one of:
- insufficient_data_fallback
- clarify_context_fallback
- complete_setup_fallback
- select_metrics_fallback
- validate_source_fallback

## 13. Output contract

All recommendation-producing agents must use this structured output:

```json
{
  "primary_recommendation": {
    "title": "",
    "type": "",
    "priority": "high | medium | low",
    "impact_area": "launch | acquisition | activation | retention | revenue | measurement",
    "why_now": "",
    "supporting_evidence": [],
    "assumptions": [],
    "missing_data": [],
    "confidence": "high | medium | low",
    "expected_outcome": "",
    "user_action": ""
  },
  "supporting_recommendations": [],
  "missing_information_for_better_guidance": [],
  "critic_status": "approved | revised | fallback"
}
```

Why structured output:
- reduces free-form hallucinated prose
- simplifies critic review
- gives the UI a stable rendering contract
- makes recommendation quality measurable

## 14. UI presentation rules

Default presentation:
- 1 primary recommendation
- max 3 supporting recommendations
- confidence label
- “why now?”
- “what changes if you do this?”
- “what is missing for stronger guidance?”

Should not show:
- long internal assumptions dumps
- raw evidence dumps
- giant task piles

Example user-facing wording:
“The most important next step is to complete GA4 property selection. Without trusted traffic and activation data, further growth guidance will remain weak. Confidence: high.”

## 15. Recommendation ranking logic

Primary recommendation ranking should combine:
- urgency
- impact
- confidence
- stage relevance
- dependency unlock value
- user goal alignment

Simple scoring model:
**score = impact + urgency + goal_alignment + dependency_unlock + confidence - uncertainty_penalty**

Rule:
- a high-impact but low-confidence suggestion should not automatically outrank a medium-impact high-confidence one

## 16. Learning / analytics loop

Measure:
- recommendation accepted rate
- recommendation dismissed rate
- task completion after recommendation
- user correction frequency
- recommendation duplication rate
- low-confidence recommendation rate
- critic rejection rate
- fallback frequency

Red flags:
- users frequently dismiss or delete recommendations
- the same recommendations reappear repeatedly
- stage-inappropriate guidance appears
- low-confidence guidance is shown as high-priority
- fallback rate is extremely high, suggesting weak intake context

## 17. Failure modes

- false certainty with incomplete data
- generic category-based checklist spam
- metric interpretation without sources
- stage skipping
- too many recommendations
- duplicate recommendations in different wording
- over-reading raw descriptions

## 18. MVP agent system

Minimum implementation:
- Context Interpreter
- Evidence Builder
- Recommendation Engine
- Critic

The response formatting layer can initially be rule-based.

MVP non-negotiables:
- known / inferred / unknown separation
- confidence labels
- max 1 primary + 3 supporting recommendations
- critic reject path
- insufficient-data fallback
- normalized context requirement
- evidence threshold matrix enforcement

## 19. Safe insufficient-data fallback copy

Examples:
- “There isn’t enough data yet to make a strong recommendation.”
- “More context is needed before this can be marked as a blocker.”
- “The right next move is not more growth advice yet; first we need to complete source setup.”
- “This is a starter recommendation with low confidence.”
- “To improve recommendation quality, I need the following information first.”

## 20. Conclusion

The success of Tiramisup’s AI layer will be determined not by how much it says, but by how disciplined it is.

A final-quality system should:
- normalize intake answers
- turn context into an evidence map
- generate recommendations through thresholds
- filter weak output through a critic
- say less when data is weak
- say more clearly when data is strong
- tie every recommendation to evidence
- respect the user’s stage
- reject generic advice
- surface uncertainty honestly

The goal is not an AI that sounds smart.
The goal is an AI system that is controlled, reliable, and useful.
