# App Store Submission Advisor

**Primary use:** Tiramisup should use this skill to generate user-facing App Store submission guidance, launch-readiness recommendations, and store-review checklists for users preparing **their own apps** for release.

Use this skill when recommending how users should prepare their product for App Store review, App Store Optimization, subscription/paywall approval, or release-readiness work for iOS apps. This skill is for **user-facing recommendations and advisory output**, not for our own project deployment checklist.

## Use This For

Apply this skill when the task involves any of the following:
- advising users on App Store submission readiness
- preparing customer-facing launch guidance for iOS apps
- building recommendation flows, prompts, or checklists for founders shipping an app
- reviewing whether an app looks ready for App Review
- producing “before you submit” guidance inside Tiramisup
- generating product advice around subscriptions, paywalls, legal pages, screenshots, review notes, or ASO

## Do Not Use This For

- internal engineering deployment checklists for Tiramisup itself
- Android / Play Store guidance unless the task explicitly asks for cross-store comparison
- legal certainty or country-specific legal advice beyond product-readiness guidance

## Core Principle

When advising users, optimize for **review safety, clarity, completeness, and faster approval**, not just “minimum viable submission.” Recommendations should reduce the chance of rejection and reduce reviewer confusion.

## Required Recommendation Areas

When creating App Store readiness guidance for users, make sure recommendations cover these groups.

### 1. Review-Blocking Essentials

Always check whether the user has:
- privacy policy
- terms and conditions
- EULA note (Apple standard EULA link is acceptable if appropriate)
- a clear disclosure if the app requires a subscription or paywall to function
- mostly real screenshots that show the actual app
- a review/test account if login is required
- Sign in with Apple if the app uses Google/Facebook/social login in a way that triggers parity requirements
- age rating answers completed
- encryption/export compliance answers completed
- privacy disclosures that match real SDK/data usage
- crash tracking / analytics disclosures where relevant
- user identifier disclosures if identifiers are collected

### 2. Store Listing Readiness

Always check whether the user has:
- ASO-informed app name
- subtitle / promotional text where relevant
- description / localized copy where relevant
- keywords
- icon
- screenshots that reflect the current shipped experience
- localized pricing and localized IAP/subscription copy if the product supports multiple markets

### 2.5 Visual Asset Readiness

Always check whether the user has:
- a readable app icon at small size
- a screenshot set that tells a clear story from first to last frame
- screenshots that show the real shipped UI, not only polished mockups
- optional preview video only if it helps explain the product faster
- localized screenshot sets where the app serves multiple markets
- iPhone/iPad visual assets aligned with the devices the app actually supports

### 3. Subscription / IAP Readiness

If the app uses subscriptions or in-app purchases, always check whether the user has:
- IAPs/subscriptions created and attached to the binary/release flow where required
- clear subscription naming and descriptions
- localization for IAP/subscription text where relevant
- paywall links to privacy policy and terms
- subscription disclosure language that makes pricing and renewal behavior understandable

### 4. Accessibility and Trust

Do not forget to recommend:
- basic accessibility support (VoiceOver, dynamic type, readable tap targets, contrast)
- clear legal/privacy links in settings and paywall surfaces
- clear account / support / restore purchase paths where relevant
- reviewer-facing notes if a flow could confuse App Review

## Output Style

When you use this skill for user-facing guidance:
- group recommendations by priority
- separate **must-have before submission** from **should-have for stronger approval odds**
- explain *why* an item matters in one sentence
- keep the checklist practical and non-legalistic
- call out items that commonly trigger rejection or delay

## Preferred Priority Structure

Use this structure when helpful:

### Critical Before Submission
Items that can directly cause rejection, delay, or reviewer confusion.

### Strongly Recommended
Items that improve approval odds, conversion, or credibility.

### Nice to Improve
Items that are not blockers but strengthen the listing or review experience.

## Common Review-Risk Heuristics

Flag these as high-risk when advising users:
- hidden subscription requirement
- login required but no review account provided
- screenshots that look mocked/fake or do not represent the current app
- visual assets that do not match the current in-app flow or device support
- privacy policy missing or inconsistent with actual SDK usage
- social login present without Sign in with Apple where parity is expected
- app store metadata that sounds generic, misleading, or copied
- missing restore purchase path for subscription apps
- legal links missing from settings/paywall where users expect them

## How Tiramisup Should Use This Skill

If Tiramisup is generating guidance for users, prefer outputs like:
- submission-readiness checklist
- “what still blocks App Store submission” summary
- paywall/legal review checklist
- ASO readiness checklist
- reviewer-note preparation checklist

Do not present this as guaranteed legal or App Review approval advice. Present it as practical submission-readiness guidance.
