# Play Store Submission Advisor

**Primary use:** Tiramisup should use this skill to generate user-facing Google Play submission guidance, launch-readiness recommendations, and store-review checklists for users preparing **their own apps** for release.

Use this skill when recommending how users should prepare their product for Google Play review, Play Store listing quality, subscription/paywall clarity, privacy disclosures, or release-readiness work for Android apps. This skill is for **user-facing recommendations and advisory output**, not for Tiramisup’s own deployment checklist.

## Use This For

Apply this skill when the task involves:
- advising users on Google Play submission readiness
- generating Android store-launch checklists for founders
- reviewing whether an app looks ready for Play review
- preparing user-facing guidance around subscriptions, disclosures, screenshots, data safety, or store assets
- creating recommendation flows inside Tiramisup for Play Store readiness

## Do Not Use This For

- internal Tiramisup engineering release work
- iOS / App Store specific review guidance unless the task explicitly asks for store comparison
- legal certainty or jurisdiction-specific legal advice beyond practical submission readiness guidance

## Core Principle

When advising users, optimize for **policy compliance, clarity, metadata quality, trust, and review readiness**. The goal is not only “can this be uploaded?” but “does this reduce rejection, delay, and user confusion?”

## Required Recommendation Areas

### 1. Review-Blocking Essentials

Always check whether the user has:
- privacy policy
- terms / legal pages where appropriate
- clear disclosure if subscription or payment is required for core app use
- a working review/test account if login is required
- real screenshots that reflect the current Android app experience
- age/content rating answers completed
- app category and policy declarations completed accurately
- Data safety form filled to match real SDK/data usage
- disclosure of analytics, crash reporting, identifiers, ad SDKs, and tracking behaviors where relevant
- account deletion flow readiness if user accounts are created and policy requires it

### 2. Store Listing Readiness

Always check whether the user has:
- ASO-informed app title
- short description
- full description
- icon
- feature graphic if relevant
- screenshots that show real app flows and not mostly marketing mockups
- localized listing copy where the product targets multiple markets
- clear explanation of the app’s core user value in the first lines of the listing

### 3. Subscription / IAP Readiness

If the app uses subscriptions or billing, always check whether the user has:
- subscription products configured correctly
- subscription naming and descriptions that are clear and non-misleading
- pricing visibility inside the app and/or on the paywall
- links to privacy policy and terms where users expect them
- subscription explanation and cancellation clarity
- localization for pricing text and billing copy where relevant

### 4. Trust, Policy, and UX Safety

Do not forget to recommend:
- permission requests only when needed and with clear justification
- in-app disclosures matching what the app actually does
- support/contact path
- restore/access recovery flows where relevant
- accessibility basics (text scaling, readable contrast, tap targets, screen-reader compatibility where applicable)
- consistency between Play listing claims and actual app functionality

## Output Style

When using this skill for user-facing guidance:
- group recommendations by priority
- clearly separate **must-fix before submission** from **should-improve before launch**
- explain *why* each recommendation matters in one sentence
- keep the checklist practical and founder-friendly
- explicitly call out items that commonly trigger review delay or policy trouble

## Preferred Priority Structure

### Critical Before Submission
Items likely to cause rejection, policy conflict, or reviewer confusion.

### Strongly Recommended
Items that improve conversion, trust, and review confidence.

### Nice to Improve
Items that are not blockers but strengthen the listing and first impression.

## Common Play Review Risk Heuristics

Flag these as high-risk when advising users:
- privacy policy missing or inconsistent with real SDK/data behavior
- Data safety form not matching actual data collection or SDK usage
- screenshots that do not reflect the real app
- subscription requirement hidden or unclear
- misleading listing text or unsupported claims
- permissions requested too early or without clear user benefit
- login required but no reviewer/test account provided
- account deletion/support requirements ignored

## How Tiramisup Should Use This Skill

If Tiramisup is generating guidance for users, prefer outputs like:
- Google Play submission-readiness checklist
- “what still blocks Play submission” summary
- data safety / disclosure checklist
- Android paywall and billing readiness checklist
- listing quality / ASO readiness checklist

Do not present this as guaranteed legal or policy approval advice. Present it as practical Play Store submission-readiness guidance.
