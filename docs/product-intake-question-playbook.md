# Tiramisup Product Intake Question Playbook — Final

This document defines how the product intake questions in Tiramisup should be designed.

Purpose:
- provide the AI agent system with the right context
- improve recommendation quality without creating a long, painful onboarding
- collect enough signal without leaving the agent blind
- reduce misclassification and irrelevant recommendations

This playbook answers:
- which questions are essential?
- which questions are optional?
- which questions are risky because they are too open or too ambiguous?
- which answers are actually useful for the recommendation engine?
- in what order should the questions appear?
- how should the answers be normalized before being passed to agents?

## 1. Purpose of the intake system

This flow does not exist only to create a project.
Its real job is to collect the **minimum but sufficient context** needed for:
- reliable checklist generation
- stage-aware task generation
- blocker detection
- metric suggestions
- launch and growth guidance

It should not:
- collect every possible detail
- become a business plan form
- ask for information the system can reasonably infer later
- overwhelm the user during the first session

## 2. Design principles

### 2.1 Every question must improve recommendation quality
If a question does not improve downstream AI output, do not ask it.

### 2.2 Separate raw answers from normalized context
Raw user answers should be stored.
Agents should not consume raw answers directly.
They should consume normalized context.

### 2.3 Use open text sparingly and strategically
Too much free text increases hallucination risk.
Too little reduces context quality.

### 2.4 Prioritize classification first
In V1, the intake flow’s main job is to classify:
- what kind of product this is
- who it is for
- how it makes money
- what stage it is in
- which platform it runs on
- what the user is trying to achieve now

### 2.5 Prefer structured choices in high-risk areas
For critical AI inputs, chips, radio buttons, and dropdowns are safer than free text.

### 2.6 Do not over-ask in the first session
Separate required vs optional fields clearly.

## 3. Assessment of the current question set

Current questions:
1. Product name
2. What does it do?
3. What category is it in?
4. Who do you sell to?
5. How do you make money?
6. What stage are you in?
7. If launching soon, what is the launch date?

### Strengths
- includes project identity
- includes product explanation
- includes category
- includes target audience
- includes business model
- includes stage
- includes launch date conditionally

This is a strong foundation.

### Gaps
For recommendation quality, likely missing:
- platform type
- primary current goal
- sales motion / acquisition motion
- web vs mobile vs multi-platform clarity
- structured follow-up around the free-text product description

### Risks
- “What does it do?” is high-value but high-risk if left unconstrained
- category options may be too broad in some cases
- audience and business model can blur together
- business model alone is not enough for revenue guidance

## 4. Recommended intake data model

### Required fields
- product_name
- product_description
- category
- target_audience
- business_model
- product_stage

### High-value fields for stronger recommendations
- platform_type
- primary_goal
- planned_launch_date
- monetization_status
- sales_motion

### Optional fields
- product_url
- secondary_audience
- secondary_category
- notable_constraints
- team_size

## 5. Recommended V1 question set

### Question 1 — What is your product’s name?
Purpose:
- project identity

Type:
- short text

Required:
- yes

Suggested copy:
**What is your product’s name?**
Helper text: We’ll use this across your dashboard and plans.

### Question 2 — What does your product do?
Purpose:
- understand the product’s value proposition and problem space

Type:
- short free text + optional URL

Required:
- yes

Agent value:
- very high

Risk:
- very high, because it is free text

Design note:
- this answer must never act as the sole source of truth for recommendations

Suggested copy:
**What does your product do?**
Helper text: In one sentence, explain what problem it solves and for whom.
Placeholder: “It helps freelancers manage proposals and payments in one place.”

Optional URL field:
- very useful
- examples: landing page, GitHub, demo, App Store link

### Question 3 — What category does it belong to?
Purpose:
- load templates, checklists, and metric defaults

Type:
- multi-select or primary + secondary category

Required:
- yes

Suggested primary categories:
- SaaS
- Mobile App
- Ecommerce
- Marketplace
- Content / Media
- Developer Tool / Platform
- AI Product
- Other

Note:
- avoid category labels that are too broad and ambiguous

### Question 4 — Which platform does it run on?
Purpose:
- platform-specific launch checklist and measurement setup

Type:
- multi-select

Required:
- yes

Suggested options:
- Web
- iOS
- Android
- Desktop
- API / Backend Product
- Multi-platform

Agent value:
- very high

### Question 5 — Who do you sell to?
Purpose:
- audience-aware checklist and growth guidance

Type:
- primary audience + optional secondary audience

Required:
- yes

Suggested options:
- Consumers
- Freelancers
- Developers
- Startup teams
- SMBs
- Enterprise teams
- Internal teams / ops
- Creators
- Education
- Other

Design note:
- if multiple segments are selected, the system should flag multi-segment complexity

### Question 6 — How do you make money?
Purpose:
- revenue metrics and monetization readiness

Type:
- single-select preferred for V1

Required:
- yes

Suggested options:
- Subscription
- Freemium + paid plans
- One-time payment
- Usage-based pricing
- Marketplace commission
- Enterprise / contract sales
- Advertising
- No monetization yet
- Other

Design note:
- “freemium” alone should not be treated as a complete monetization model

### Question 7 — What stage is your product in?
Purpose:
- the most important recommendation-gating field

Type:
- single-select

Required:
- yes

Suggested options:
- Idea / exploration
- In development
- Testing with early users
- Preparing to launch
- Live
- Early growth

Design note:
- the copy should clearly distinguish testing vs launch prep vs live

### Question 8 — What is your most important goal right now?
Purpose:
- improves recommendation ranking and next-step quality

Type:
- single-select

Required:
- yes

Suggested options:
- Prepare for launch
- Get first users
- Validate the product
- Reach first repeated usage
- Get first revenue
- Build a growth rhythm

Agent value:
- very high

### Question 9 — What is your planned launch date?
Purpose:
- readiness prioritization and urgency

Type:
- date picker

Required:
- conditionally required only when stage = Preparing to launch

Suggested copy:
**What is your planned launch date?**
Helper text: An approximate date is enough. It helps us prioritize launch readiness.

### Question 10 — How do users usually reach your product?
Purpose:
- acquisition-aware suggestions

Type:
- single-select or multi-select

Required:
- optional in V1, valuable in V1.5

Suggested options:
- Self-serve via website
- Sales conversations
- App Store / Play Store
- Community / content / organic
- Partner / distribution channel
- Not sure yet

## 6. Recommended order

Best sequence:
1. Product name
2. What does your product do?
3. Category
4. Platform
5. Audience
6. Business model
7. Stage
8. Primary goal
9. Planned launch date (conditional)
10. URL (either alongside description or as optional supporting input)

Why this order:
- identity first
- product explanation second
- classification next
- audience and monetization before stage-driven guidance
- urgency details later

## 7. Grouping into screens

### Group 1 — Describe the product
- product name
- product description
- optional URL

### Group 2 — Product type
- category
- platform

### Group 3 — Market and business model
- audience
- business model
- optional sales motion

### Group 4 — Stage and current objective
- stage
- primary goal
- conditional launch date

## 8. Required vs optional

### Required
- product_name
- product_description
- category
- target_audience
- business_model
- stage
- platform_type
- primary_goal

### Conditionally required
- planned_launch_date

### Optional but very useful
- product_url
- secondary_audience
- secondary_category
- sales_motion

## 9. Normalized context contract for agents

User answers should be stored raw, but agents should receive:

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
  "missing_fields": []
}
```

## 10. Safe use of free-text answers

The “What does your product do?” answer is high-value but risky.

Rules:
- do not let it directly drive checklist generation
- cross-check it against category, stage, audience, and business model
- use it as a supporting signal, not the sole source of truth
- if text conflicts with selected structured answers, create an ambiguity flag

Example:
If the description says “content automation for teams” but category is set to “ecommerce”, the system should flag a potential mismatch rather than silently choosing one.

## 11. How each field affects recommendation quality

- `product_description`: improves product understanding and refines templates slightly
- `category`: drives template loading, checklist base, and metric defaults
- `platform`: drives launch checklist, instrumentation guidance, and source recommendations
- `audience`: affects messaging, onboarding, acquisition, and launch suggestions
- `business_model`: affects revenue metrics, monetization readiness, and pricing-related items
- `stage`: controls recommendation gating, blocker strictness, and task sequencing
- `primary_goal`: affects next-best-action ranking and daily/weekly guidance tone
- `launch_date`: affects urgency and readiness prioritization

## 12. Bad question patterns to avoid

Avoid questions like:
- “Tell us about your product” with no structure
- “Who is your audience?” as free text only
- “What is your growth plan?” during onboarding
- “Which metrics do you want to track?” too early

Why these are bad:
- they tire the user
- they produce low-signal input
- they increase AI interpretation risk
- they encourage hallucinated recommendations

## 13. UX guidelines

- Prefer chips/cards for structured choices
- Add short “why we ask this” helper text
- Guide multi-select behavior with primary vs secondary selection
- Do not allow the continue button until the required answer is clear
- Use conditional follow-up questions when stage requires it

## 14. Suggested short V1 flow

Screen 1:
- Product name

Screen 2:
- What does your product do?
- Optional URL

Screen 3:
- Category

Screen 4:
- Platform

Screen 5:
- Audience

Screen 6:
- Business model

Screen 7:
- Stage

Screen 8:
- Primary goal

Screen 9:
- Planned launch date (conditional)

## 15. Minimum improvements to implement first

### P0
- add platform question
- add primary goal question
- fix business model options
- sharpen stage options
- improve product description guidance

### P1
- add primary vs secondary audience
- add category subtypes
- add sales motion question

### P2
- automatic ambiguity detection
- URL-assisted classification
- dynamic follow-up questions

## 16. Conclusion

Tiramisup’s onboarding is not just a project creation form.
It is the main context gateway that determines recommendation quality.

A good intake system should be:
- short but high-signal
- mostly structured and normalizable
- stage-aware
- careful with free-text interpretation
- directly useful for recommendation quality

The goal is not to ask more questions.
The goal is to collect the right minimum context for the AI system.
