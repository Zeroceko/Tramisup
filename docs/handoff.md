# Engineering Handoff Notes

## Snapshot

- Production domain: `https://tiramisup.app`
- Current live release: `f8f56491`
- Last docs refresh: `12 April 2026`
- Default locale: English
- Secondary locale: Turkish
- Public positioning: waitlist-first
- Canonical overview doc: `HANDOFF.md`
- Canonical takeover prompt: `docs/team-handoff-prompt.md`

---

## What Is True Right Now

### Production behavior

- `main` is live on Vercel, auto-deploys on push.
- Signup no longer uses an early access code.
- Signup and waitlist both require email verification.
- Credentials login blocks unverified users.
- Onboarding supports file uploads and richer source/context ingestion.
- Product creation is two-phase and async-plan based.
- Settings/account language switching redirects to the chosen locale route.
- Billing remains demo/fake checkout behavior.
- Nav is stage-aware: pre-launch shows Launch, launched/growing shows Metrics + Growth.
- Launched/growing products without a growth check-in are gated at the dashboard and redirected to `/growth`.
- Growth diagnosis includes actual metric values and is locale-aware.
- Agent panel cards all create tasks — no "ask" cards remain.

### Recent shipped commits

- `f8f56491` — handoff/docs refresh on top of the current production baseline
- `eacecb50` — remove tagline from all logo instances (nav + all landing pages)
- `3138ac6e` — dead code removal: prompts.ts, lib/ds.ts, lib/ai-advice.ts, getActiveProduct
- `13ba0851` — fix overview agent: stage-aware context for launched/growing products
- `93c8a82f` — agent panel all-task, remove ask intent
- `470c1e58` — growth diagnosis data-driven + locale-aware, TR category labels

---

## Local Workspace Warning

The current local workspace is **not** a clean production mirror. It contains a partial implementation of **Founder Trust Sprint 2** and should be treated as an unfinished branch state.

### Started locally but not completed

- Canonical launch stage migration
- Route-scoped remounting for `/dashboard`, `/pre-launch`, `/settings`
- Client-synced pre-launch checklist/task workspace
- Agent message persistence scaffold and `messageActions` contract

### Current compile blockers

As of **12 April 2026**, `npx tsc --noEmit` fails in the local workspace because of:

1. `app/api/agent/chat/route.ts` still returning the old `AgentResponse` shape without `messageActions`
2. `components/OnboardingWizard.tsx` still referencing removed stage helper names
3. `components/OnboardingWizard.tsx` still carrying one `string` → `LaunchStageKey | ""` typing mismatch
4. `lib/agent-messages.ts` using the unfinished `AgentMessage` Prisma model before Prisma client regeneration / final typing cleanup

### First resume steps for the next team

1. Finish or back out the incomplete `AgentMessage` / agent history path
2. Finish the `OnboardingWizard` canonical stage migration
3. Run `npx prisma generate`
4. Run `npx tsc --noEmit`
5. Only then continue the remaining Trust Sprint 2 scope

---

## Key Changes Since Previous Handoff

### 1. Stage-aware navigation

`components/DashboardNav.tsx`:
- Pre-launch products: Overview + Launch
- Launched/growing products: Overview + Metrics + Growth
- Metrics is now a standalone nav item, not grouped under Growth

### 2. Growth intake gate on dashboard

`app/[locale]/dashboard/page.tsx`:
- If product is LAUNCHED or GROWING and `!hasGrowthCheckin` → `redirect(/${locale}/growth)`
- `justLaunched=1` query param bypasses the gate (for the launch moment flow)

### 3. Data-driven growth diagnosis

`lib/funnel-health.ts`:
- Accepts `locale` parameter (EN/TR)
- Turkish text now has correct diacritics throughout
- `nextFocus` includes actual metric values: current, baseline, growth rate vs target
- Stage labels are locale-aware (`STAGE_LABELS_EN` / `STAGE_LABELS_TR`)

### 4. Localized checklist categories

`components/GrowthChecklistSection.tsx`:
- `CATEGORY_META_EN` and `CATEGORY_META_TR` replace single hardcoded English object
- Turkish users see "Edinim & Dağıtım", "Aktivasyon & İlk Değer", etc.

### 5. Agent panel cards are all task-creation

`components/AgentChatPanel.tsx` + `app/api/agent/suggestions/route.ts`:
- All `intent: "ask"` cards removed
- Every card is `intent: "create_task"` with an action-oriented label and payload
- Clicking any card calls `createTaskFromSuggestion` → `POST /api/actions` → task created
- Declining metric cards carry actual before/after numbers in the task title

---

## Current Operational Risks

- **Billing is still fake.** Pricing UX is usable for testing, but real Stripe checkout is not wired.
- **i18n gaps.** Some screens still carry hardcoded strings.
- **Roadmap integrations.** Some integration surfaces are still UI-first placeholders.
- **`Product.launchGoals` is legacy.** Do not build new core logic on top of it.
- **Dashboard first impression needs product work.** What a newly onboarded user sees first is not sharp enough. Known issue, not a bug.
- **Email delivery latency.** `RESEND_FROM_EMAIL` must be set in Vercel to `Tiramisup <hello@tiramisup.app>`. If unset, fallback is `onboarding@resend.dev` which causes spam filter delays. `tiramisup.app` is already verified in Resend.

---

## Environment / Infra Notes

- Local dev must run on `:3002`
- `DATABASE_URL` must be PgBouncer (port 6543)
- `DIRECT_URL` must be direct Postgres (port 5432)
- `SUPABASE_SERVICE_ROLE_KEY` required for upload flow
- The production DB is already aligned with the current code
- `external/streamlined-solutions` is a nested repo — ignore for app work

---

## What To Read First

1. `HANDOFF.md`
2. `CLAUDE.md`
3. `docs/team-handoff-prompt.md`
4. `docs/ai-agent-system-playbook.md`
5. `docs/product-intake-question-playbook.md`
6. `docs/internal-growth-rules.md`
7. `docs/growth-tactics-layer.md`
8. `docs/growth-transition-checkin-spec.md`

---

## What To Test First

1. Local setup: `npm install && npx prisma generate && npx prisma db push`
2. `npx tsc --noEmit` and `npx next build` pass clean
3. `OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run` — all 70 pass
4. Sign up → verify email → login
5. Create a product through onboarding with file upload and a context URL
6. Confirm plan generation completes
7. Verify nav shows the right items for the product stage
8. Confirm launched product without growth check-in redirects to `/growth`
9. Complete growth check-in and confirm dashboard loads
10. Click agent panel card — confirm task is created, not a chat message
11. Language switch from settings — confirm route changes
