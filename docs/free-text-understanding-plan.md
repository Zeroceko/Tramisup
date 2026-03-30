# Tiramisup Free-Text Understanding Plan

This document defines how Tiramisup should interpret the founder-written free-text product description.

It exists because recommendation quality will not reach a high-confidence level unless the system can extract useful structure from the founder's own words without over-trusting them.

This document complements:
- `docs/product-intake-question-playbook.md`
- `docs/ai-agent-system-playbook.md`
- `docs/internal-growth-rules.md`

## 1. Goal

The free-text field should help the system understand:
- what the product actually does
- who it is for
- what pain it solves
- what the first-value moment likely is

But it must not become:
- the sole source of truth
- a hallucination trap
- an excuse for overly confident recommendations

## 2. Product requirement

The founder-facing copy around the field should clearly signal:
- this answer is important
- honest, concrete language is better than vague marketing copy
- the system will use it to build a more product-specific plan

The best prompt shape is:
- who it is for
- what problem it solves
- how it solves it today

## 3. Extraction model

The system should extract the following description-derived signals:

```json
{
  "problem_summary": "",
  "user_type_signals": [],
  "value_action_candidates": [],
  "use_case_signals": [],
  "channel_signals": [],
  "monetization_signals": [],
  "confidence": "high | medium | low"
}
```

### 3.1 `problem_summary`
One short normalized summary of the pain/problem being solved.

### 3.2 `user_type_signals`
Inferred user groups from the description text.

Examples:
- freelancers
- developers
- startup teams
- SMB operators

### 3.3 `value_action_candidates`
The earliest meaningful actions that suggest a user reached value.

Examples:
- first invoice sent
- first proposal created
- first campaign launched
- first report shared

### 3.4 `use_case_signals`
What the product is mainly used for.

Examples:
- team collaboration
- finance ops
- content workflow
- ecommerce conversion

### 3.5 `channel_signals`
Only lightweight hints, not final prescriptions.

Examples:
- community-driven
- creator-led
- product-led
- sales-assisted

### 3.6 `monetization_signals`
Hints that may reinforce or challenge selected business model inputs.

## 4. Known / Inferred / Unknown policy

The free-text field should mostly populate the `inferred` layer.

### Known
Only when the founder states something directly and clearly.

### Inferred
When the wording strongly suggests a meaning but does not prove it.

### Unknown
When the description is too broad, too polished, too vague, or too contradictory.

This means:
- a strong description improves interpretation
- a strong description does not automatically justify a strong recommendation

## 5. Cross-check rules

The extracted signals should be compared against structured onboarding fields.

### 5.1 Category check
If the founder writes something that sounds like a marketplace, but selects SaaS, create an ambiguity flag.

### 5.2 Audience check
If the description sounds enterprise or B2B but the selected audience is consumer, create an ambiguity flag.

### 5.3 Business model check
If the description strongly implies service work, commission, or contract selling but selected monetization says otherwise, reduce confidence.

### 5.4 Stage check
If the founder claims live traction in the description but selects an early stage, create an ambiguity flag.

## 6. Recommendation use

The free-text field should influence:
- interpretation
- ranking
- wording
- value-moment inference

It should not directly control:
- high-confidence growth claims
- paid acquisition recommendations
- channel prescriptions
- retention judgments without behavioral data

## 7. Clarification policy

If the system cannot confidently extract enough meaning, it should prefer one short clarification over pretending to understand.

The clarification should be narrow.

Good clarification prompts:
- "Who is the main user for this product?"
- "What is the first useful action a new user completes?"
- "Is this product mainly self-serve or sold through conversations?"

Bad clarification prompts:
- broad business-plan questions
- open-ended strategy essays

## 8. Suggested implementation order

### Phase 1
Improve founder-facing field copy so answers become more concrete.

### Phase 2
Add deterministic signal extraction helpers for:
- user type
- problem words
- value action candidates
- monetization hints

### Phase 3
Feed extracted signals into `normalizeProductContext` as:
- ambiguity flags
- confidence adjustments
- optional derived metadata

### Phase 4
Use extracted first-value candidates to improve:
- activation metric suggestions
- retention guardrails
- weak-link wording

### Phase 5
If needed later, add a bounded AI interpretation step that produces structured output only, never direct recommendations.

## 9. Success criteria

We should consider this working when:
- fewer onboarding descriptions are vague or slogan-like
- normalized context more often preserves the founder's real intent
- ambiguity flags catch obvious contradictions
- recommendations feel more product-specific without becoming overconfident

## 10. Final principle

The free-text field should increase understanding, not increase improvisation.

The system should read closely, extract carefully, compare against structure, and stay humble when meaning is still unclear.
