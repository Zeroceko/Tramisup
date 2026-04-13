# New Team Handoff Prompt

Use the prompt below as the default kickoff brief for any new engineering or product team taking over Tiramisup.

---

```text
You are taking over the Tiramisup codebase and product from the founding team.

Treat this as a live production system, not a prototype sandbox. Real users are waiting on the waitlist. The goal for the new team is to move from the current state to paying users and/or acquisition.

---

FIRST: Read these documents in order before touching any code.

1. HANDOFF.md                                   — full product + workspace state
2. CLAUDE.md                                    — codebase rules, architecture, AI system, design system
3. docs/handoff.md                              — engineering-level findings and open issues
4. docs/tiramisup-manifesto.md                  — product vision and decision filter
5. docs/ai-agent-system-playbook.md             — AI agent architecture (non-negotiable)
6. docs/product-intake-question-playbook.md     — intake question set and normalization rules
7. docs/internal-growth-rules.md                — growth guidance rules
8. docs/growth-tactics-layer.md                 — growth tactics system
9. docs/growth-transition-checkin-spec.md       — growth check-in spec

---

PRODUCTION STATE (as of 13 April 2026)

- Production domain: https://tiramisup.app
- Current active main line includes: 53b5e694, 72e598ba, e3e5f79c, beb5022e, 21dcae07, 947d392c, e6d1954f, 5232e299
- main auto-deploys to Vercel
- Public landing: waitlist-first (intentional — do not change without explicit product decision)
- Signup: no access code required, email verification required
- Billing: fake/demo checkout — not real Stripe payments
- Default locale: English. Turkish is secondary.
- Board is directly reachable from the authenticated header as a secondary CTA.
- Board rows and agent suggestion rows now use a shared preview-first UX.
- Free-form agent chat is currently unstable in production: user-written questions can fail with generic retry copy because `/api/agent/chat` is intermittently returning 500.
- Secret files were removed from git tracking on 13 April 2026, and Gemini/OpenAI Vercel env keys were rotated after exposed secrets were found in the public repo.

---

LOCAL WORKSPACE STATE

The local workspace is no longer "ahead by three uncommitted fixes". Those fixes already shipped, together with later board, suggestion, navigation, and security changes.

Treat the current workspace as:
  - production code with recent follow-up UX changes already merged
  - a live repo where local secret files must not be recommitted
  - a codebase whose top unresolved bug is free-form agent chat failing in production

Before doing new feature work, run:
  npx tsc --noEmit
  npx next build

Note: 8 tests in __tests__/api/waitlist/admin.test.ts fail with 401 — this is a pre-existing auth mock issue, not caused by the above fixes.

---

LOCAL SETUP

  git clone <repo-url> && cd Tiramisup
  npm install
  npx prisma generate
  npx prisma db push
  npm run dev               # runs on :3002

Verify:
  npx tsc --noEmit
  npx next build
  QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run

Important:
  - Local dev must run on port 3002 — Google and Stripe OAuth redirects are configured for this port
  - DATABASE_URL must point to PgBouncer (port 6543)
  - DIRECT_URL must point to direct Postgres (port 5432)
  - SUPABASE_SERVICE_ROLE_KEY is required for the file upload flow

---

ARCHITECTURE TRUTHS

- AgentLayoutShell: left agent panel + right content — used for Dashboard, Pre-Launch, Growth
- PlainPageShell: full-width — used for Settings, Metrics, Integrations
- Nav is stage-aware (components/DashboardNav.tsx):
    PRE_LAUNCH → Overview + Launch
    LAUNCHED / GROWING → Overview + Metrics + Growth
- Product creation is two-phase: POST /api/products → POST /api/products/[id]/generate-plan → poll plan-status
- Growth intake gate lives in app/[locale]/dashboard/page.tsx
- Growth workspace modes: intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
- Growth intake answers stored in Product.additionalContext.growthCheckin
- lib/funnel-health.ts builds data-driven diagnosis — accepts locale parameter
- Agent suggestion cards: all intent: "create_task" — generated in app/api/agent/suggestions/route.ts
- AI provider chain (must not change): Qwen → DeepSeek → Gemini → Gemini backup → static fallback
- MetricSetup and MetricEntry are DB tables — not JSON columns. Product.launchGoals is legacy.
- FunnelMetricSelection shape: { stage: FunnelStageKey; selectedMetricKeys: string[] }

---

OPEN PRODUCT ISSUES (from founder simulation)

These are not hypothetical. They came from using the live app as a real founder with an upgraded account.

1. Free-form agent chat is failing
   - User-written questions in Overview / Launch / Growth can show the generic retry copy
   - This is masking a server-side failure in /api/agent/chat
   - Suggestion cards and task creation still work; the break is specifically in free-form chat
   - First action for the new team: inspect Vercel logs for /api/agent/chat and stop hiding the true server error in the client

2. AARRR onboarding exit feels broken
   - Wizard can remain on "Önerilen AARRR kurulumun" step after submission
   - The race-condition fix shipped, but the full exit flow still needs end-to-end validation
   - File: components/OnboardingWizard.tsx

3. Metrics setup vs daily entry state is confusing
   - On /metrics, setup cards can be absent while daily entry inputs are already visible
   - User cannot tell if setup is complete, skipped, or broken
   - File: app/[locale]/metrics/page.tsx, components/MetricSetupSelector.tsx

4. First metric save does not propagate cleanly into Growth state
   - After entering and saving metric values, Growth can still show "no data"
   - Related routing/setup fixes shipped, but full propagation still needs validation
   - Files: components/MetricEntryForm.tsx, app/[locale]/growth/page.tsx

5. Agent recommendation cards did not reliably appear in the launched-product journey
   - In the exercised path, agent card count was 0
   - Related setup-state fixes shipped, but this still needs end-to-end re-validation
   - Files: lib/agent-context.ts, app/api/agent/suggestions/route.ts

6. Repeated browser-side 500 resource errors
   - Observed on /products/new, /growth, /dashboard during production founder simulation
   - Root cause not isolated — next team should reproduce with network capture
   - Likely: transient DB errors or race on first load of newly created product

---

UNVALIDATED PRODUCT RISKS (from founding team, honest assessment)

These are the things the founding team does not yet know:

1. Does the AI actually help?
   The agent recommendations have not been tested with a real founder on a real product. It is unknown whether the output is meaningfully better than generic startup advice. This is the highest-priority product question.

2. Is the core loop sticky?
   The intended loop is: create product → enter metrics → receive diagnosis → create tasks → repeat.
   This loop has never been tested with a non-founder user. Whether users return after the first session is unknown.

3. Does the onboarding-to-value path work end-to-end?
   A fresh user creating a product → finishing onboarding → reaching a useful Growth diagnosis has not been validated cleanly. Several breakpoints exist between these steps.

The new team should treat product validation as the first sprint, not the second.

---

RECOMMENDED FIRST SPRINT FOR NEW TEAM

1. Commit the three local fixes and deploy to production
2. Do a full founder simulation with a fresh account — document every point of confusion
3. Fix the onboarding exit and the metrics setup/entry state confusion
4. Re-run the simulation and validate: onboarding exits cleanly → metrics setup state is clear → first save propagates to Growth → agent cards appear
5. Wire real Stripe billing (fake checkout is the only thing blocking paid users)
6. Run 5 external users through the product — observe, do not explain
7. Decide: is the AI recommendation quality good enough to charge for?

---

KNOWN DEBT

- Billing: fake checkout / demo activation — not real Stripe
- i18n: some authenticated screens still have hardcoded strings
- Product.launchGoals: legacy field — do not build new logic on it
- Roadmap integrations: RevenueCat, App Store Connect, Google Play, ads connectors are UI-first only
- Dashboard first impression: what a user sees on first login after onboarding is not sharp enough
- Email: RESEND_FROM_EMAIL must be set in Vercel to Tiramisup <hello@tiramisup.app> — if unset, fallback is onboarding@resend.dev and emails land in spam
- Public repo secret history: local secret tracking is stopped going forward, but previously exposed credentials must still be treated as compromised and rotated

---

RULES THAT MUST NOT REGRESS

1. No fake product created on signup — product data begins only after the onboarding wizard
2. Launched products must not see pre-launch language, nav, or UX
3. Growth guidance must stay diagnosis-led — not generic startup advice
4. Metric entry must remain tied to configured metrics
5. AI must not speculate when evidence is weak — context_confidence low → data_collection fallback
6. User-written product description is central context for all AI calls — do not discard it
7. English is the master locale — do not make Turkish the default
8. Agent panel cards must create tasks — not send chat messages
9. Billing must not be presented as complete Stripe commerce
10. HIGH priority means a true blocker only

---

ACCESS TRANSFER CHECKLIST

- GitHub repo (main branch, auto-deploy to Vercel)
- Vercel project: zerocekos-projects/tramisup
- Supabase project: ojecebxxcbxrofnbkaae (eu-west-3)
- Google Cloud Console (OAuth for GA4 integration)
- Stripe Dashboard (Connect + webhook secret)
- Resend account (tiramisup.app domain already verified)
- Domain / DNS for tiramisup.app
- All Vercel production environment variables (see HANDOFF.md section 9)
- Explicit awareness that `.env.prod` is no longer tracked and Vercel env is the source of truth for production secrets

---

When in doubt: preserve production baseline, document the tradeoff, change one surface at a time.
```
