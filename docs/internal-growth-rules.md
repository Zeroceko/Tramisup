# Tiramisup Internal Growth Rules

This document converts broad startup growth advice into Tiramisup-safe internal rules.

It is not a public user playbook.
It is a product decision aid for:
- onboarding refinement
- recommendation guardrails
- stage-aware growth logic
- critic / veto logic inside the AI layer

This document complements:
- `docs/ai-agent-system-playbook.md`
- `docs/product-intake-question-playbook.md`

If this document conflicts with either playbook, the playbooks win.

## 1. Core intent

Tiramisup should not turn broad growth content into generic user-facing advice.

Instead, it should translate useful principles into:
- better intake questions
- stronger evidence thresholds
- tighter stage gating
- safer recommendation filters

The goal is not to teach every founder the same 7-step growth system.
The goal is to prevent low-signal, mistimed, and overly generic recommendations.

## 2. Rules

### Rule 1: Narrow audience clarity beats broad ambition
If the target audience is too broad or ambiguous, the system should lower confidence and avoid strong channel recommendations.

Implications:
- onboarding should prefer a clear primary audience
- multi-segment products should carry an ambiguity flag
- recommendation logic should avoid confident acquisition advice when audience clarity is weak

### Rule 2: Human pain signal matters before feature expansion
For `idea`, `development`, and `testing` stages, recommendations should prioritize pain validation over feature expansion.

Allowed emphasis:
- problem clarity
- founder conversations
- early demand signal collection
- first-value definition

Avoid:
- detailed scale tactics
- advanced acquisition systems
- broad optimization language

### Rule 3: Do not treat free-text product description as enough proof
A strong founder description is useful context, but it is not sufficient evidence for a strong recommendation.

Implications:
- product description can inform interpretation
- product description alone cannot justify high-confidence advice
- critic logic should reject recommendations that rely only on description text

### Rule 4: Manual learning loops are valid in early stages
Before a product has reliable source data or repeat usage data, manual learning loops are acceptable and often preferable.

Examples:
- founder conversations
- onboarding observations
- churn reasons
- first-user friction notes

Implications:
- early-stage guidance may recommend structured learning or setup completion
- this must still be specific, not vague “talk to users” sludge

### Rule 5: Retention gates growth escalation
If users do not reach value or do not return, Tiramisup should not jump to scale tactics.

Implications:
- if activation or retention signals are weak, prefer fixing first-value flow over acquisition expansion
- if retention evidence is absent, growth recommendations should be framed as tentative
- critic logic should reject “scale” advice when retention readiness is weak

### Rule 6: Paid acquisition requires measurement confidence
Do not recommend ads, spend scaling, or aggressive paid testing unless measurement quality is high enough.

Minimum conditions for stronger paid guidance:
- metric setup exists
- meaningful baseline data exists
- source or attribution quality is trusted enough
- the product is beyond early pre-launch ambiguity

If these are missing:
- recommend setup
- recommend baseline collection
- recommend interpreting current weak-link data first

### Rule 7: Channel advice must be context-bound
Never output channel advice as a universal prescription.

Do not say:
- “post every day on X”
- “use Reddit”
- “start LinkedIn outreach”
- “open a Discord”

unless the recommendation is explicitly supported by:
- audience type
- product type
- stage
- evidence of fit
- source availability

### Rule 8: Referral and community are not default early answers
Referral systems, community layers, and partner loops can be powerful, but they are not default recommendations for every product.

Implications:
- do not surface referral as a primary next step unless there is evidence of repeated value or sharing behavior
- do not recommend community building just because it sounds strategic
- referral/community suggestions should usually appear after activation and early retention are visible

### Rule 9: One weak link first
The product should surface one growth constraint at a time whenever possible.

Priority order should usually be:
1. missing setup
2. missing baseline data
3. weak activation / first-value signal
4. weak retention signal
5. acquisition expansion
6. referral / leverage systems
7. paid scale

This prevents sprawling, mixed recommendations.

### Rule 10: Strong claims need operational evidence
Tiramisup should not confidently say things like:
- “you need ads now”
- “your onboarding is broken”
- “your referral loop is the key”
- “community is your moat”

unless there is clear evidence in the system supporting that conclusion.

Otherwise:
- lower confidence
- state assumptions
- ask for setup or evidence completion first

## 3. Onboarding applications

This rule set should improve onboarding in the following ways:

### 3.1 Clarify audience sharpness
The system should capture not only who the product is for, but whether the founder is targeting one clear segment or several.

Useful downstream effect:
- lower ambiguity in acquisition guidance

### 3.2 Preserve current top priority as a first-class signal
The founder’s current number-one priority should flow into normalized context without being lost or replaced by stage defaults.

Useful downstream effect:
- better recommendation ranking
- fewer mismatched next-step suggestions

### 3.3 Encourage first-value clarity
When possible, the onboarding or later product setup should help define the product’s earliest meaningful user win.

Useful downstream effect:
- stronger activation recommendations
- safer retention interpretation

### 3.4 Avoid over-asking channel strategy too early
Do not overload first onboarding with tactical channel questions unless they materially improve recommendation quality.

Useful downstream effect:
- calmer onboarding
- less fake precision

## 4. Recommendation guardrails

The AI layer should incorporate the following guardrails:

### 4.1 For `idea`, `development`, `testing`
Prefer:
- validation next-step recommendations
- first-value clarification
- launch readiness blockers when relevant
- measurement preparation only when it is stage-appropriate

Avoid:
- scale tactics
- paid acquisition guidance
- retention interpretation stated as fact without usage data

### 4.2 For `launch_prep`
Prefer:
- readiness blockers
- launch-critical setup
- first measurement structure
- source setup only if it unblocks launch-readiness understanding

Avoid:
- mature growth optimization language
- broad post-launch scaling tactics

### 4.3 For `live`
Prefer:
- metric setup completion
- baseline collection
- activation / retention weak-link analysis
- first goal definition

Avoid:
- strong paid guidance without measurement trust
- generic expansion advice without clear weak-link evidence

### 4.4 For `early_growth`
Prefer:
- weak-link diagnosis
- focused weekly execution
- activation, retention, revenue, or acquisition recommendations tied to evidence

Allow only with sufficient evidence:
- paid channel expansion
- referral acceleration
- partnership layering

## 5. Critic veto triggers

The critic layer should reject or downgrade recommendations that:
- prescribe a channel without product/audience/stage evidence
- recommend scale before retention or first-value clarity
- recommend paid acquisition without measurement trust
- recommend referral/community as default strategy
- use product description as if it were proof
- output broad “growth system” advice not tied to current weak link

## 6. Product copy guidance

If these ideas appear in user-facing UI copy, they should be translated into short principles, not long tactical playbooks.

Good:
- “Fix the weak link before scaling traffic.”
- “Do not spend before the measurement baseline is trustworthy.”
- “If users do not reach value, acquisition alone will not help.”

Bad:
- “Post 5 times per week on X and LinkedIn.”
- “Open a Discord and recruit affiliates.”
- “Run ads once you reach a certain user count.”

## 7. Final note

The useful part of broad growth advice is usually not the tactic.
It is the sequencing logic underneath it.

For Tiramisup, the sequence that matters is:
- clarify context
- verify evidence
- identify the weak link
- recommend the next correct step
- avoid generic scale advice until the product has earned it
