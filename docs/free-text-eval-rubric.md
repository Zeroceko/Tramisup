# Free-Text Interpretation Eval Rubric

This rubric defines what "world-class" means for onboarding free-text interpretation in Tiramisup.

## Goal

Turn a founder's free-text onboarding answer into a normalized, recommendation-safe context that:
- preserves what the founder explicitly said
- separates inferred signals from unknowns
- surfaces ambiguity instead of hiding it
- improves recommendation quality without introducing generic AI drift

## Scoring dimensions

Score each sample from `0` to `4` on every dimension.

### 1. Product understanding
- `0`: misreads what the product does
- `1`: captures only a vague category
- `2`: identifies the product motion but misses the core use case
- `3`: correctly captures what the product does and the main use case
- `4`: precisely captures product motion, use case, and first-value direction

### 2. Audience understanding
- `0`: wrong audience
- `1`: broad generic audience only
- `2`: partially right audience, missing specificity
- `3`: correct primary audience
- `4`: correct primary audience plus useful secondary audience or sales-motion nuance

### 3. Problem understanding
- `0`: misses the pain or invents one
- `1`: generic "saves time / helps growth" reading only
- `2`: identifies a rough problem area
- `3`: correctly captures the real pain point
- `4`: correctly captures the pain point in founder language or near-founder language

### 4. Signal extraction quality
- `0`: no usable extracted signals
- `1`: noisy or weak signals
- `2`: some usable signals but incomplete
- `3`: useful signals across user, pain, value, and use-case
- `4`: strong signals with low noise and good evidence phrases

### 5. Structured alignment
- `0`: ignores structured onboarding fields
- `1`: major conflicts left unresolved
- `2`: partial alignment with unresolved contradictions
- `3`: aligns well with structured fields and flags contradictions
- `4`: aligns well, flags contradictions clearly, and preserves uncertainty correctly

### 6. Ambiguity handling
- `0`: presents guesses as facts
- `1`: vague uncertainty with no actionable flagging
- `2`: catches some ambiguity
- `3`: clearly marks unknown vs inferred vs known
- `4`: ambiguity handling is precise, minimal, and recommendation-safe

### 7. Recommendation readiness
- `0`: extraction would clearly mislead downstream recommendations
- `1`: weak and unsafe for recommendation generation
- `2`: usable only with heavy guardrails
- `3`: safe for deterministic guardrails and AI prompts
- `4`: high-quality input for recommendation logic with minimal drift risk

## Passing thresholds

- `24-28`: world-class candidate
- `19-23`: strong and safe
- `13-18`: usable but needs iteration
- `0-12`: not safe for production recommendation logic

## Required evaluator outputs

For every evaluated onboarding sample, store:
- `overall_score`
- per-dimension scores
- `major_failures`
- `ambiguous_fields`
- `recommended_follow_up_question`
- `notes_for_rule_update`

## Failure modes to track explicitly

- wrong audience despite clear founder wording
- generic "SaaS growth" reading from a specific workflow tool
- category overfitting from structured fields while ignoring description
- false certainty on monetization or channel strategy
- missing marketplace / B2B / internal-tool nuance
- recommendation drift caused by weak or noisy interpretation
