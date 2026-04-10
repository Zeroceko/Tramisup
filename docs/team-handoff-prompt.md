# New Team Handoff Prompt

Use the following prompt as the default kickoff brief for any new development and product team taking over Tiramisup.

---

```text
You are taking over the Tiramisup codebase and product.

Treat this as a live production system, not a prototype sandbox.

## Step 1: Read these files in order

1. HANDOFF.md — project overview, setup, architecture, completed work, remaining sprints, rules, access transfer
2. CLAUDE.md — detailed architecture, AI pipeline, design system, coding conventions, GSD skills
3. docs/production-stabilization-board.md — sprint board with remaining tasks
4. docs/ai-agent-system-playbook.md — AI agent architecture specification
5. docs/product-intake-question-playbook.md — onboarding question set and normalization rules
6. docs/internal-growth-rules.md — growth logic rules
7. docs/growth-tactics-layer.md — growth tactics design

## Step 2: Verify local setup works

Run these commands in order:
1. npm install
2. npx prisma generate
3. npx tsc --noEmit
4. npx next build
5. OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
6. npm run dev (opens on localhost:3002 — port matters for OAuth)

If Supabase is paused (free tier, 7 days inactivity), resume from supabase.com/dashboard first.

## Step 3: Walk through the product as a founder

Sign up and go through:
- Onboarding wizard (fill every field with realistic content — skipping weakens AI quality)
- Dashboard — should show the right next action for the product stage
- Pre-Launch — launch checklist with priorities and inline rationale
- Metrics — AARRR funnel setup, manual entry, trends
- Growth — diagnosis, tactics, goals (only visible for launched products)
- Settings — account, product, language, security

## Architecture you must understand

LAYOUT
- Two shells: AgentLayoutShell (360px agent panel left + content right) and PlainPageShell (full-width)
- Both enforce max-w-[1080px] to prevent content stretching
- AppShell provides gradient background + DashboardNav + overflow-hidden main

AI PIPELINE
- Onboarding → normalizeProductContext → buildEvidenceMap → getFounderCoachContext → evidence gate → AI prompt → sanitize → critic pass → output
- Provider chain (DO NOT change order): Qwen → DeepSeek → Gemini → Gemini backup → static fallback
- Low confidence = data_collection fallback, no AI call made
- Agent suggestions at /api/agent/suggestions are deterministic (no AI), pure product-state logic

TASK CASCADE
- lib/task-completion-effects.ts handles forward/reverse completion effects
- Completing a task can auto-complete linked checklist items
- Milestones trigger follow-up tasks (e.g., ALL_HIGH_BLOCKERS_CLEARED)

DATABASE
- DATABASE_URL = PgBouncer transaction mode (port 6543)
- DIRECT_URL = direct connection (port 5432, migrations only)
- This split is mandatory — without it Vercel hits MaxClientsInSessionMode errors

## Rules that must not break

1. No fake product on signup — product data starts after onboarding wizard
2. Launched products must never see pre-launch language or UI
3. Growth setup stays calm — one primary metric per AARRR category, not a giant form
4. Metric entry is tied to what the user selected in growth setup
5. AI must not speculate without evidence — no generic advice
6. User's product description is central context for all AI calls
7. English is master language, Turkish is secondary
8. HIGH priority = true launch blocker only (compliance, security, store-review risks)
9. Recommendation cards create tasks, not chat messages
10. No emojis in UI — all decorative elements use inline SVG
11. No Shadcn — Tiramisup has its own design system (see CLAUDE.md)
12. Agent system prompts are in English — user-facing output follows user locale
13. Growth tactics must be diagnosis-led, not generic startup tips
14. Dashboard must remain calm and stage-aware — answers "what should I do next?"

## What has already been completed

SPRINT 0 (Production Safety) — Done
- Post-deploy smoke flow for product creation
- Deploy verification script (npm run verify:deploy)
- Metrics hydration fix (#418)

SPRINT 1 (Founder Trust) — Done
- Static recommendation cards → context-driven cards from /api/agent/suggestions
- Founder summary deduplication via tasksAreNearDuplicate
- Checklist rationale visibility (Why / Done when / Next action inline hints)

UX AUDIT — Done
- Dashboard: stat cards reduced to 3, empty chart hidden when < 3 data points
- Metrics: trend chart requires >= 5 entries to show
- Growth: pre-launch state simplified, empty sections hidden when no data
- Agent panel: removed robotic greeting, shows skeleton → dynamic suggestions
- Site-wide: max-width constraint on both layout shells

## What is remaining

SPRINT 2 — Historical Product Repair (Todo)
- S2-1: Safe "regenerate plan" action for existing products
- S2-2: Admin repair path for broken historical products
- S2-3: Persist plan generation source metadata

SPRINT 3 — Quality Loop (Todo)
- S3-1: Minimum plan quality guard (reject thin plans)
- S3-2: Observability for plan quality and fallback rates
- S3-3: Routine founder walkthrough regression script

## Known debt to keep in mind

- Product.launchGoals is legacy — only holds { goalKey, growthGoal }, not source of truth for metrics
- Billing is fake — Stripe Checkout in demo mode, no real payments
- Some TR-first hardcoded copy remains in authenticated screens
- Roadmap integrations (RevenueCat, App Store Connect, etc.) are UI-visible but not functional
- external/streamlined-solutions is a nested repo, ignore its git status

## Before any production release

1. npx tsc --noEmit — must pass
2. npx next build — must succeed
3. OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run — all tests must pass
4. Manual smoke: /en, /tr, login, create product, check dashboard, metrics, growth
5. npm run verify:deploy — after pushing to production

## Critical warnings

- When adding Vercel env vars, confirm no trailing newlines — these silently break OAuth
- If Google OAuth shows verification warnings, check test user whitelist in Google Cloud, not code
- Do not ship from a dirty worktree — compare against deployed baseline
- Any Dashboard redesign must happen in preview first, not directly on production
- Forgot-password and waitlist emails depend on Resend being healthy and sender domain verified

When in doubt, bias toward preserving the current production baseline and documenting the tradeoff before changing it.
```
