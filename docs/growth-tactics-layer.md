# Tiramisup Growth Tactics Layer

This document defines how Tiramisup should introduce concrete growth tactics without drifting into generic startup advice.

## Core principle

Tiramisup should not lead with tactics.

It should work in this order:
1. diagnose the weak link
2. check evidence quality
3. confirm stage appropriateness
4. show a short ranked tactics list only when tactics are justified

Formula:

`Diagnosis -> Readiness -> Ranked tactics -> Success signal`

## What counts as a tactic

A tactic is a concrete execution move such as:
- run founder-led outreach
- respond in a relevant community
- ship a referral prompt
- test one paid channel with a tight budget
- shorten onboarding to the first-value action
- add a lifecycle email or reactivation loop

A tactic is not:
- "do growth"
- "improve onboarding"
- "use social media"
- "run ads"

## Eligibility rules

### Tactics should appear only when all of these are true
- the product is in `live` or `early_growth`
- the current weak link or operating bottleneck is identifiable
- the recommendation can be tied to product type, audience, or current data state

### Tactics should be suppressed or softened when any of these are true
- no product context
- pre-launch stage
- metrics are not selected yet
- data is too sparse for channel optimization claims
- the system cannot identify the problem area with enough confidence

## Surface placement

### 1. Onboarding
Role:
- build the tactic profile

Should do:
- collect product, audience, business model, platform, stage, and current top priority
- improve free-text understanding

Should not do:
- show tactical growth lists

### 2. Dashboard
Role:
- route the founder to the right surface

Should show:
- at most one tactical hint when the next action is already clear

Should not show:
- full channel lists
- mixed strategy panels

### 3. Metrics
Role:
- measurement readiness and operating rhythm

Should show:
- readiness guardrails for tactics
- examples:
  - "Before paid acquisition, track CAC and visitor-to-signup conversion"
  - "Before referral optimization, define invite/share events"

Should not show:
- channel-first advice as the main content

### 4. Growth
Role:
- primary home for tactics

Should show:
- weak link
- why now
- top 3 tactics
- success signal

This is the main tactics surface.

### 5. Settings
Role:
- capability management only

Should not show:
- growth tactics

## Tactic output contract

Each tactic should include:
- `title`
- `channel`
- `why_now`
- `how_to_start`
- `success_signal`
- `confidence`

## Safe mapping rules

### Awareness / Acquisition
- B2B SaaS:
  - founder-led LinkedIn outreach
  - warm introductions / partner distribution
  - focused content on the problem language
- Developer tools:
  - X posts with build/use-case proof
  - Reddit / Hacker News / GitHub discussions
  - docs / launch post distribution
- Mobile apps:
  - App Store / Play Store optimization
  - UGC-style social content
  - tightly capped paid creative tests
- Content / creator products:
  - consistent publishing cadence
  - audience conversation loops
  - creator cross-promotion

### Activation
- simplify onboarding
- reduce time to first value
- trigger manual founder follow-up for stuck early users

### Retention
- interview churned or inactive users
- add lifecycle nudges tied to value moments
- create repeat-use triggers before adding acquisition spend

### Referral
- add referral ask at the moment of value
- make sharing frictionless
- reward both sides only when value is already proven

### Revenue
- test paid conversion friction
- tighten pricing page or checkout clarity
- improve trial-to-paid or demo-to-close motion before scaling acquisition

## Guardrails

- Never recommend paid acquisition by default.
- Never recommend five channels at once.
- Never recommend community posting unless the audience plausibly lives there.
- Never recommend referral optimization before users reach value.
- Never recommend retention work as a channel tactic.
- Never present a tactic as certain when evidence is weak.

## First implementation scope

V1 should be:
- deterministic
- limited to Growth page
- maximum 3 tactics
- tied to stage, setup state, and weak-link state

V2 can extend to:
- dashboard tactical hint
- advisor integration
- tactic acceptance / dismissal feedback loop
