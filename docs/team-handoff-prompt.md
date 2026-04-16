# New Team Handoff Prompt

Use the prompt below as the default kickoff brief for any new engineering or product team taking over Tiramisup.

---

```text
You are taking over the Tiramisup codebase and product from the founding team.

Treat this as a live production system, not a prototype sandbox. Real users are already in the system or waiting to enter it. The job is to preserve the production baseline, validate the product with real users, and move the company toward paid usage.

---

FIRST: Read these documents in order before touching any code.

1. HANDOFF.md
2. CLAUDE.md
3. docs/handoff.md
4. docs/tiramisup-manifesto.md
5. docs/ai-agent-system-playbook.md
6. docs/product-intake-question-playbook.md
7. docs/internal-growth-rules.md
8. docs/growth-tactics-layer.md
9. docs/growth-transition-checkin-spec.md

---

PRODUCTION STATE (as of 16 April 2026)

- Production domain: https://tiramisup.app
- Current active main line includes all commits through 2dc2f428
- main auto-deploys to Vercel
- Public landing remains waitlist-first unless explicitly changed by product decision
- Signup requires email verification, but no early access code
- Waitlist join also requires email verification
- Verification links now auto-log the user into the app after successful verification
- Billing is still fake/demo checkout — not real Stripe commerce
- Default locale is English; Turkish is secondary
- Nav is stage-aware:
    PRE_LAUNCH → Overview + Launch
    LAUNCHED / GROWING → Overview + Metrics + Growth
- Launched/growing products without a growth check-in are redirected from dashboard to /growth
- Growth diagnosis is data-driven and locale-aware
- Agent panel cards all create tasks; no "ask" cards remain
- Board is reachable directly from the authenticated header
- Admin ops panel is live under /{locale}/admin/* and is allowlist-protected
- Admin routes are excluded from indexing
- Task lifecycle timestamps are now canonical on Task.startedAt / Task.completedAt
- Products page has been redesigned, and the product selector routes "View all products" to /{locale}/products
- Authenticated app performance work has shipped: request-level caching, fewer refreshes, lazy/closed initial agent panel, lighter app surfaces, loading skeletons, and DB indexes
- Transactional email templates were redesigned on 14 April and are already live
- GROWING-stage onboarding now includes a real inline AARRR setup instead of a lightweight preview
- After a GROWING onboarding, the founder lands in a richer Growth kickoff instead of a generic overview
- If onboarding selected GA4/Stripe for a GROWING founder, the integrations detour now returns to Growth kickoff
- Pre-launch checklist locale/task-creation fixes are live
- Agent suggestion preview hardening and the agent-panel refetch-loop fix are live

---

LOCAL WORKSPACE STATE

Treat the current workspace as:
  - production code with the latest critical bug fixes already merged
  - a live repo where secret files must not be recommitted
  - a codebase ready for product validation and controlled live improvements

Non-app dirt may exist locally:
  - external/streamlined-solutions is a nested repo and should be ignored
  - .claude/worktrees/ contains local workspace artifacts and should not be committed
  - tmp/ contains scratch artifacts and should not be committed

Before doing feature work, run:
  npx tsc --noEmit
  npx next build

Note:
  8 tests in __tests__/api/waitlist/admin.test.ts fail with 401. This is a pre-existing auth mock issue, not the current work.

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
  - Local dev must run on port 3002
  - DATABASE_URL must point to PgBouncer (port 6543)
  - DIRECT_URL must point to direct Postgres (port 5432)
  - SUPABASE_SERVICE_ROLE_KEY is required for uploads
  - If `npx tsc --noEmit` complains about missing `.next/types/*`, regenerate `.next` with `npx next build --no-lint` or clear `.next` and rerun

---

ARCHITECTURE TRUTHS

- AgentLayoutShell: left agent panel + right content — used for Dashboard, Pre-Launch, Growth
- PlainPageShell: full-width — used for Settings, Metrics, Integrations
- Product creation is two-phase:
    POST /api/products
    POST /api/products/[id]/generate-plan
    poll /api/products/[id]/plan-status
- Growth workspace modes:
    intake_needed → metric_setup_needed → baseline_needed → diagnosis_ready
- Growth intake answers live in Product.additionalContext.growthCheckin
- For GROWING onboarding specifically, metric setup now happens inline before the workspace opens
- lib/funnel-health.ts builds data-driven diagnosis and accepts locale
- Agent suggestion cards are all intent: "create_task"
- AI provider chain must not change:
    Qwen → DeepSeek → Gemini → Gemini backup → static fallback
- MetricSetup and MetricEntry are database tables; Product.launchGoals is legacy
- Task.startedAt / Task.completedAt are canonical lifecycle fields

---

OPEN PRODUCT / ENGINEERING QUESTIONS

1. Does the AI actually help real founders?
   The product still needs validation with real non-founder users. This is the most important product question.

2. Is the onboarding → metrics → growth loop truly clean now?
   Several fixes shipped on 14–16 April, including a new GROWING-stage onboarding path. The loop still needs a fresh-account end-to-end validation.

3. Are dashboard and tasks now fast enough for daily use?
   Performance is materially better, but those remain the heaviest authenticated surfaces and need continued profiling if users still feel lag.

4. What caused the browser-side 500 resource errors seen in founder simulation?
   This still needs reproduction with network capture and tracing.

5. Is async plan generation reliable enough in production?
   Earlier founder simulation attempts saw /api/products/[id]/generate-plan time out around 50 seconds. Reproduce and isolate if it still happens.

---

RECOMMENDED FIRST SPRINT FOR THE NEW TEAM

1. Re-run the full fresh-account founder path, especially the new GROWING onboarding flow
2. Validate async plan generation reliability in production
3. Re-validate the onboarding → metrics → growth path on a fresh launched/growing product
4. If lag is still reported, profile /dashboard and /tasks first
5. Wire real Stripe billing
6. Run 5 external users through the product and observe silently
7. Decide whether the AI quality is good enough to charge for

---

KNOWN DEBT

- Billing is still fake/demo checkout
- Some authenticated strings are still hardcoded
- Product.launchGoals is legacy — do not build new logic on it
- Some integration surfaces are still UI-first placeholders
- Dashboard first impression still needs product polish
- RESEND_FROM_EMAIL must be set to: Tiramisup <hello@tiramisup.app>
- Email templates were redesigned; preserve the current structure in:
    lib/email.ts
    lib/email-verification.ts
    lib/password-reset.ts
- Public repo secret history still matters; previously exposed credentials must still be treated as compromised outside the repo

---

RULES THAT MUST NOT REGRESS

1. No fake product created on signup
2. Launched products must not see pre-launch language, nav, or UX
3. Growth guidance must stay diagnosis-led, not generic startup advice
4. Metric entry must remain tied to configured metrics
5. AI must not speculate when evidence is weak
6. User-written product description remains central context for AI
7. English is the master locale
8. Agent panel cards must create tasks, not send chat messages
9. Billing must not be presented as complete Stripe commerce
10. HIGH priority means a true blocker only
11. Do not casually rewrite the live email templates
12. Do not regress the new GROWING onboarding path back into a vague AARRR preview

---

ACCESS TRANSFER CHECKLIST

- GitHub repo access
- Vercel project access
- Supabase project access
- Google Cloud Console access
- Stripe Dashboard access
- Resend account access
- Domain / DNS access for tiramisup.app
- All Vercel production environment variables
- Explicit awareness that Vercel env is the production source of truth

---

When in doubt: preserve production baseline, document the tradeoff, and change one surface at a time.
```
