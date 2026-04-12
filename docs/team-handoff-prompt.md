# New Team Handoff Prompt

Use the prompt below as the default kickoff brief for any new engineering or product team taking over Tiramisup.

---

```text
You are taking over the Tiramisup codebase and product.

Treat this as a live production system, not a prototype sandbox.

First read, in order:
1. HANDOFF.md
2. CLAUDE.md
3. docs/handoff.md
4. docs/ai-agent-system-playbook.md
5. docs/product-intake-question-playbook.md
6. docs/internal-growth-rules.md
7. docs/growth-tactics-layer.md
8. docs/growth-transition-checkin-spec.md

What is true right now:
- Production domain is https://tiramisup.app
- Current live app release on main is eacecb50
- main auto-deploys to Vercel
- Public landing is waitlist-first
- Signup no longer uses an early access code
- Signup and waitlist both use email verification
- Unverified users are blocked at login
- Onboarding supports file upload, richer URL context, and async plan generation
- Nav is stage-aware: pre-launch products see Overview + Launch; launched/growing products see Overview + Metrics + Growth
- Launched/growing products without a completed growth check-in are redirected from dashboard to /growth
- Growth workspace is staged: intake -> metric setup -> baseline -> diagnosis
- Growth diagnosis is data-driven: includes actual metric values, direction, and rate vs target
- Growth diagnosis and checklist categories are locale-aware (EN/TR)
- Agent panel cards all create tasks when clicked — no "ask" intent remains
- Billing is still demo / fake checkout behavior
- English is the source-of-truth locale, Turkish is secondary

Local setup:
1. npm install
2. npx prisma generate
3. npx prisma db push
4. npx tsc --noEmit
5. npx next build
6. OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
7. npm run dev

Important local rules:
- Local dev runs on port 3002
- DATABASE_URL must be PgBouncer (port 6543)
- DIRECT_URL must be direct Postgres (port 5432)
- SUPABASE_SERVICE_ROLE_KEY is required for upload flow

Before changing anything, walk the product:
1. signup
2. verify email
3. login
4. onboarding with a realistic fake product
5. file upload + at least one context link
6. confirm async plan generation completes
7. review Dashboard / Pre-Launch / Metrics / Growth / Settings / Integrations
8. check nav items match the product stage
9. confirm a launched product without growth check-in redirects to /growth
10. click an agent panel card and confirm it creates a task (not a chat message)
11. change account language and confirm route really switches locale
12. test waitlist join + email verification

Architecture truths:
- AgentLayoutShell is used for Dashboard / Launch / Growth
- PlainPageShell is used for Settings / Metrics / Integrations / account-style screens
- Nav items are computed per product status in components/DashboardNav.tsx
- Product creation is two-phase: create product -> generate plan -> poll status
- Growth intake gate lives in app/[locale]/dashboard/page.tsx
- Growth intake answers are stored in Product.additionalContext
- lib/funnel-health.ts builds the data-driven diagnosis — accepts locale parameter
- Agent panel suggestion cards are all create_task intent — generated in app/api/agent/suggestions/route.ts
- AI provider order must stay: Qwen -> DeepSeek -> Gemini -> Gemini backup -> static fallback
- AI must not speculate when evidence is weak

Rules that must not regress:
- No fake product on signup
- Launched products must not see pre-launch UX or nav
- Growth guidance must stay diagnosis-led, not generic startup advice
- Metric entry must remain tied to configured metrics
- AI must not invent guidance when evidence is weak
- English remains the master locale
- Billing must not be presented as complete real checkout
- Agent panel cards must create tasks — not send chat messages

Known debt:
- Billing is still fake checkout / demo activation
- Some authenticated copy is still not fully next-intl clean
- Product.launchGoals is legacy
- Some roadmap integrations are still UI-first
- Dashboard first impression after onboarding needs product work
- RESEND_FROM_EMAIL must be set in Vercel to `Tiramisup <hello@tiramisup.app>` — if unset, fallback is onboarding@resend.dev which causes email delivery delays

When in doubt, preserve the current production baseline, document the tradeoff, and change one surface at a time.
```
