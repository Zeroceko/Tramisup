# Free-Text Eval Dataset Schema

Use this schema to build the real onboarding interpretation dataset.

## File format

- Preferred: `JSONL`
- One onboarding sample per line
- Real founder data should be anonymized before entering the dataset

## Sample schema

```json
{
  "sample_id": "onb_001",
  "locale": "tr",
  "source": "production_onboarding",
  "raw_input": {
    "name": "FocusFlow",
    "description": "Freelancerlar için teklif, fatura ve ödeme takibini tek yerden yöneten bir operasyon aracı.",
    "category": ["SaaS"],
    "platforms": ["Web"],
    "target_audience": ["Freelancerlar"],
    "business_model": ["Abonelik"],
    "launch_status": "Yayında",
    "goal_key": "get_first_revenue"
  },
  "gold_normalized_context": {
    "product_summary": "Freelancerlar için teklif, fatura ve ödeme takibini tek yerden yöneten operasyon aracı.",
    "primary_audience": "Freelancerlar",
    "secondary_audience": [],
    "stage": "live",
    "primary_goal": "get_first_revenue",
    "description_understanding": {
      "source_quality": "high",
      "problem_summary": "Freelancerlar teklif, fatura ve ödeme takibini dağınık yürütüyor.",
      "user_segments": ["freelancers"],
      "pain_points": ["manual_work", "billing_complexity"],
      "value_props": ["automation", "payments"],
      "use_cases": ["sales_ops"],
      "acquisition_channels": [],
      "monetization_hints": ["subscription"],
      "evidence_phrases": [
        "Freelancerlar için teklif, fatura ve ödeme takibini tek yerden yöneten bir operasyon aracı"
      ]
    },
    "ambiguity_flags": []
  },
  "expected_eval": {
    "clarification_needed": false,
    "high_risk_if_misread": ["audience", "problem", "monetization"]
  },
  "notes": "Should not be interpreted as generic finance software."
}
```

## Field definitions

### Metadata
- `sample_id`: stable identifier
- `locale`: `en` or `tr`
- `source`: `production_onboarding`, `support_transcript`, `synthetic_edge_case`, etc.

### Raw input
- `name`
- `description`
- `category`
- `platforms`
- `target_audience`
- `business_model`
- `launch_status`
- `goal_key`

### Gold normalized context
- what the system should produce after normalization
- must distinguish known information from inferred signals
- should include `ambiguity_flags` when uncertainty is real

### Expected eval
- whether a follow-up clarification should be triggered
- which fields would create the most recommendation damage if misread

## Dataset composition target

A strong first dataset should include at least:
- `10` clear B2B workflow tools
- `10` B2C / consumer products
- `10` mobile-first apps
- `10` ambiguous or low-quality founder descriptions
- `10` tricky edge cases:
  - internal tools
  - marketplaces
  - creator products
  - AI wrappers vs real workflow tools
  - multi-sided products

## Annotation rules

- Preserve founder wording where possible.
- Do not convert weak descriptions into overconfident gold labels.
- Mark uncertainty in the gold output if a strong reader would still be unsure.
- Use the same normalized enums the production system uses.
