# New Team Handoff Prompt

Use the following prompt as the default kickoff brief for any new development and product team taking over Tiramisup.

```text
You are taking over the Tiramisup codebase and product.

Treat this as a live production system, not a prototype sandbox.

First, read these files in order:
1. CLAUDE.md
2. docs/handoff.md
3. docs/tiramisup-manifesto.md
4. docs/ai-agent-system-playbook.md
5. docs/product-intake-question-playbook.md
6. docs/internal-growth-rules.md
7. docs/free-text-understanding-plan.md
8. docs/free-text-eval-rubric.md
9. docs/free-text-dataset-schema.md
10. docs/free-text-normalize-pipeline.md
11. docs/growth-tactics-layer.md

Then inspect these implementation areas first:
- components/AppShell.tsx                    ← top-level layout wrapper
- components/AgentLayoutShell.tsx            ← split-panel: agent left, content right
- components/PlainPageShell.tsx              ← non-agent pages wrapper
- components/DashboardNav.tsx                ← nav: pill group, section-aware colors
- components/AgentChatPanel.tsx              ← agent panel: recommendations + chat
- app/[locale]/dashboard/page.tsx            ← Overview: stat cards, primary action
- app/[locale]/pre-launch/page.tsx           ← Launch: stat cards, checklist
- app/[locale]/metrics/page.tsx              ← Metrics: stat cards, entry, trend
- app/[locale]/settings/page.tsx             ← Settings: tab-based
- components/OnboardingWizard.tsx            ← product creation wizard
- lib/agent-prompts.ts                       ← agent system prompts (English only)
- lib/agent-context.ts                       ← agent context builder (includes locale)
- app/api/agent/chat/route.ts                ← agent chat API endpoint
- lib/ai-plan.ts                             ← AI-generated launch/growth plan
- lib/normalize-product-context.ts
- lib/build-evidence-map.ts
- lib/founder-coach.ts
- lib/launch-checklist-priority.ts           ← runtime priority normalization
- lib/app-urls.ts                            ← public vs OAuth callback URL helpers

These production constraints are mandatory:
- Production is live at https://tiramisup.app
- Trusted production baseline commit: 626543d9
- Current release line: eecbf6a9
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
- Dashboard (Overview) = "What is the next correct step for this product right now?"
- Launch (pre-launch) = "What is blocking launch and what must be done first?"
- Growth = "Where is the weak link and what should we focus on next?"
- Metrics = "What do we measure, how does data arrive, and what changed?"
- Settings = product, source, tracking, and security management
- Sources must not return to top nav
- Launch must not appear in top nav for launched/growing products

Layout rules that must not regress:
- Full viewport split-panel layout: left agent panel (360px fixed) + right scrollable content
- AgentLayoutShell wraps Overview, Launch, Growth page layouts
- PlainPageShell wraps Settings, Account, Integrations, Metrics page layouts
- AppShell provides gradient background + DashboardNav + overflow-hidden main
- All main pages (Dashboard, Launch, Metrics) open with prominent stat cards before any text
- Agent panel: recommendation cards above chat, never mixed into one interaction pattern

Agent language rules that must not regress:
- All agent system prompts (lib/agent-prompts.ts) are written in English
- The AI model receives English instructions — always
- User-visible AI output (message, suggestion labels) is written in the user's configured locale
- locale is passed from AgentChatPanel → POST /api/agent/chat → buildAgentContext → system prompt
- Never hardcode a language name in a system prompt — derive from ctx.locale

AI plan priority rules that must not regress:
- HIGH checklist priority = only true launch blockers (legal, compliance, security, store rejection)
- Maximum 2–3 HIGH items per generated plan
- MEDIUM = important but product can launch without it
- LOW = nice-to-have, polish, future improvement
- Runtime normalization in lib/launch-checklist-priority.ts corrects existing products

Important production behaviors already in place:
- Waitlist-first homepage is live
- Preserved /yayinda landing is live
- Public analytics are consent-aware
- Public funnel events include waitlist_cta_click, waitlist_signup, thank_you_view
- Invisible reCAPTCHA is production-only on waitlist join, signup, and login
- Forgot password and reset password are live (stateless, no reset-token table)
- Onboarding supports multi-select for category, audience, and business model
- Selecting Other opens clarification
- Free-text onboarding description feeds normalized product context and AI plan
- Growth includes a deterministic, diagnosis-led tactics layer
- Metrics manual entry allows integers by default, decimals only for revenue metrics (mrr, arpu)
- Recommended source suggestions in Metrics are collapsible by default
- Google OAuth requires GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, OAUTH_CALLBACK_BASE_URL in Vercel env — no trailing newlines
- Callback URL registered in Google Cloud Console: https://tiramisup.app/api/integrations/google/callback

Critical warnings before you touch anything:
- The repo may contain local modified/untracked files that are not the trusted production baseline
- Do not assume local worktree state is canonical just because files exist
- Compare proposed changes against the trusted production baseline and current production behavior
- Do not ship from a dirty worktree without explicitly separating release truth from local experiments
- Any Dashboard redesign must happen in preview first, not directly in production
- When adding Vercel env vars via copy-paste, confirm there are no trailing newlines — these silently break OAuth

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
- Agent prompts stay in English; user-facing output respects user locale

Before any risky release, run or verify these smoke paths:
- /en -> accept cookies -> waitlist signup -> thank-you page
- /en/signup
- /en/login
- /en/forgot-password
- /en/dashboard — confirm stat cards, agent panel separated from chat
- /en/pre-launch — confirm stat cards, checklist, no PageHeader
- /en/metrics — confirm stat cards, no PageHeader
- /en/settings
- one launched product flow with missing metrics setup
- GA4 OAuth connect flow (confirm no invalid_client error)
- agent response in English when locale=en, Turkish when locale=tr

Success means:
- no regression on live routes
- no regression on auth, email, analytics, reCAPTCHA, or OAuth
- no accidental rollback of waitlist-first homepage
- no accidental reintroduction of rejected Ask Tiramisup experiments
- no blurring of Dashboard, Growth, Metrics, and Settings roles
- no shipping from local, unreviewed worktree drift
- agent prompts remain in English; user-facing output in correct user locale
- HIGH checklist priority reserved for true launch blockers only

When in doubt, bias toward preserving the current production baseline and documenting the tradeoff before changing it.
```
