# Free-Text Normalize Pipeline

This is the recommended interpretation pipeline for onboarding free text inside Tiramisup.

## Pipeline order

1. Ingest founder free text and structured onboarding fields together.
2. Extract deterministic signals from free text:
   - audience hints
   - pain-point hints
   - value-prop hints
   - use-case hints
   - acquisition channel hints
   - monetization hints
3. Generate a compact `problem_summary`.
4. Cross-check extracted signals against structured onboarding selections.
5. Classify each field as:
   - `Known`
   - `Inferred`
   - `Unknown`
6. Create `ambiguity_flags` where structured and inferred signals conflict.
7. Compute context confidence from:
   - missing fields
   - free-text source quality
   - ambiguity count
8. Expose only normalized context to downstream agents and recommendation systems.

## V1 implementation rule

V1 should stay deterministic and transparent.

That means:
- no hidden LLM extraction inside normalization
- regex / rules / enum mapping are acceptable
- evidence phrases should come from founder text
- uncertainty should be explicit

## V2 upgrade path

After a real dataset exists:
- add eval harness scoring
- compare deterministic extraction against a model-assisted extractor
- keep model-assisted extraction only if it outperforms deterministic V1 on real eval data

## Recommendation safety rules

- Never treat inferred audience or monetization as certain when source quality is low.
- Never override structured onboarding with free-text inference silently.
- Use ambiguity flags to down-rank confidence, not to invent a "best guess."
- If the product is launched or growing, misreading the problem or audience should reduce growth recommendation confidence immediately.
