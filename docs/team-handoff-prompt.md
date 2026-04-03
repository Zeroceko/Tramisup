# New Team Handoff Prompt

Use the following prompt as the default kickoff brief for any new development and product team taking over Tiramisup.

```text
You are taking over the Tiramisup codebase and product.

Treat this as a live production system, not a prototype.

First, read these files in order:
1. README.md
2. HANDOFF.md
3. docs/handoff.md
4. docs/tiramisup-manifesto.md
5. docs/team-handoff-prompt.md
6. docs/ai-agent-system-playbook.md
7. docs/product-intake-question-playbook.md
8. docs/internal-growth-rules.md
9. docs/free-text-understanding-plan.md
10. docs/free-text-eval-rubric.md
11. docs/free-text-dataset-schema.md
12. docs/free-text-normalize-pipeline.md
13. docs/growth-tactics-layer.md

Then inspect these implementation areas first:
- app/[locale]/dashboard/page.tsx
- app/[locale]/pre-launch/page.tsx
- app/[locale]/growth/page.tsx
- app/[locale]/metrics/page.tsx
- app/[locale]/settings/page.tsx
- components/DashboardNav.tsx
- components/OnboardingWizard.tsx
- components/today/CoachInsight.tsx
- lib/ai-plan.ts
- lib/normalize-product-context.ts
- lib/build-evidence-map.ts
- lib/founder-coach.ts
- lib/growth-tactics.ts
- lib/analytics.ts
- lib/recaptcha.ts

These production constraints are mandatory:
- Production is live at https://tiramisup.app
- Trusted production baseline commit is 626543d9
- English is the master language and default locale
- Turkish is secondary
- Keep / as the simplified waitlist-first landing page
- Keep /yayinda as the preserved fuller landing page
- Do not break Clarity, GA4, Resend, invisible reCAPTCHA, password reset, or OAuth flows
- Do not move product logic outside the boundaries defined in the playbooks
- Do not introduce generic AI features that are not grounded in the playbooks

These manifesto constraints are also mandatory:
- Tiramisup is an AI-native execution workspace, not a dashboard with chat added on top
- The primary product value is reducing the distance from user intent to structured action
- AI features must stay grounded in product context, stage, evidence, and current execution state
- AI output should become operational whenever possible: task, checklist item, routine, decision, or next step
- Navigation remains a support layer; it must not become the only path to action again
- Do not ship AI surfaces that end at generic text when they could end in execution
- Do not turn Tiramisup into a thin wrapper around a general-purpose model

Current product structure to preserve:
- Dashboard = “What is the next correct step right now?”
- Growth = “Where is the weak link and what should we do next?”
- Metrics = “What do we measure, how does data arrive, and what changed?”
- Settings = product, source, tracking, and security management
- Sources must not return to top nav
- Launch must not appear in top nav for launched/growing products
- Ask Tiramisup on Dashboard is currently the restored simple right-side card; launcher/blob experiments were rejected and rolled back

Important production behaviors already in place:
- Waitlist-first homepage is live
- Preserved /yayinda landing is live
- Public analytics are consent-aware
- Public funnel events include waitlist_cta_click, waitlist_signup, thank_you_view
- Invisible reCAPTCHA is production-only on waitlist join, signup, and login
- Forgot password and reset password are live
- Onboarding supports multi-select for category, audience, and business model
- Selecting Other opens clarification
- Onboarding asks current top priority after stage selection
- Free-text onboarding description feeds normalized product context
- Growth includes a deterministic, diagnosis-led tactics layer
- Metrics manual entry allows integers by default, with decimals only for revenue-style metrics such as mrr and arpu
- Recommended source suggestions in Metrics are collapsible by default

Critical warnings before you touch anything:
- The repo may contain local modified/untracked files that are not the trusted production baseline
- Do not assume local worktree state is canonical just because files exist
- Compare proposed changes against the trusted production baseline and current production behavior
- Do not ship from a dirty worktree without explicitly separating release truth from local experiments
- Any Dashboard/Ask Tiramisup redesign must happen in preview first, not directly in production

Your first task is not to redesign. Your first task is to stabilize understanding.

Do this in order:
1. Audit the current committed architecture against the docs and playbooks
2. Confirm production behavior still matches the documented baseline
3. Identify any local worktree drift that should not be shipped by accident
4. Identify locale inconsistencies, especially Turkish-first hardcoded product copy
5. Identify any launch/growth/metrics/settings boundary drift
6. Identify the highest-risk regression points before changing UI or flows
7. Propose a safe execution plan before editing major surfaces

When reviewing or changing the product, preserve these decision rules:
- Growth tactics must stay diagnosis-led, not generic startup tips
- Metrics must remain the measurement workspace, not collapse back into Growth
- Dashboard must remain calm and stage-aware
- Free-text understanding must remain a first-class product input, not decorative copy
- Product recommendations must remain evidence-aware and stage-appropriate
- New AI surfaces should be intent-first and action-oriented
- Prefer question -> grounded answer -> selectable action over question -> long text only
- Preserve classic surfaces as review and control layers even as intent-first entry points expand

Before any risky release, run or verify these smoke paths:
- /en -> accept cookies -> waitlist signup -> thank-you page
- /en/signup
- /en/login
- /en/forgot-password
- /en/dashboard
- /en/pre-launch
- /en/growth
- /en/metrics
- /en/settings
- one launched product flow with missing metrics setup

Success means:
- no regression on live routes
- no regression on auth, email, analytics, reCAPTCHA, or OAuth
- no accidental rollback of waitlist-first homepage
- no accidental reintroduction of rejected Ask Tiramisup experiments
- no blurring of Dashboard, Growth, Metrics, and Settings roles
- no shipping from local, unreviewed worktree drift

When in doubt, bias toward preserving the current production baseline and documenting the tradeoff before changing it.
```
