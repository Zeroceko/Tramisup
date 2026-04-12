# Engineering Handoff Notes

## Snapshot

- Production domain: `https://tiramisup.app`
- Current live release: `27dfd71d`
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

- `27dfd71d` — allow chef admin access
- `eded8530` — finish trust sprint 2 hardening and verification
- `f8f56491` — handoff/docs refresh on top of the current production baseline
- `eacecb50` — remove tagline from all logo instances (nav + all landing pages)
- `3138ac6e` — dead code removal: prompts.ts, lib/ds.ts, lib/ai-advice.ts, getActiveProduct
- `13ba0851` — fix overview agent: stage-aware context for launched/growing products
- `93c8a82f` — agent panel all-task, remove ask intent

---

## Local Workspace State

The local workspace is a **clean, production-aligned state**. Trust Sprint 2 has been completed and verified (`eded8530`). `npx tsc --noEmit` passes clean.

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

### 6. Launch modal UX fix (Session 3 founder test)

`components/LaunchButton.tsx`:
- `reviewDone` is now computed outside `useMemo` so it can drive UI hints independently
- When all 3 review toggles are checked but `confirmLive` is still unchecked, the confirmation section pulses with a teal ring and the action area shows a directional hint: "↑ Confirm the final step above to enable launch."
- This resolves the P0 bug where users completed all toggles but the launch button stayed disabled with no visible cue

### 7. Route subtree isolation fix (Settings → Pre-launch regression)

`app/[locale]/pre-launch/layout.tsx`, `app/[locale]/settings/layout.tsx`:
- Added `key` props to `RouteScopedBoundary` in both layouts (`key="pre-launch"`, `key="settings"`)
- Guarantees React unmounts and remounts the boundary on route change, preventing Settings form from leaking into Pre-launch subtree

### 8. Agent panel suggestions auto-refresh on checklist change

`components/PreLaunchWorkspace.tsx`, `components/AgentChatPanel.tsx`:
- After a checklist item is toggled complete, `PreLaunchWorkspace` dispatches `CustomEvent('tiramisup:checklist-updated')`
- `AgentChatPanel` listens for this event and re-fetches suggestions from `/api/agent/suggestions`
- Fixes stale "PRODUCT is the weakest area (0%)" banner that persisted after category completion

### 9. Funnel consistency warning in metric entry (non-blocking)

`components/MetricEntryForm.tsx`:
- On submit, values are checked against `FUNNEL_ORDER` (Awareness → Acquisition → Activation → Retention → Referral → Revenue)
- If a downstream stage value exceeds its upstream stage, a yellow non-blocking warning card is shown before the save button
- Submit still proceeds — warning is informational only, not a gate

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
3. `QWEN_API_KEY=dummy DEEPSEEK_API_KEY=dummy GEMINI_API_KEY=dummy npx vitest run` — non-waitlist tests pass
4. Sign up → verify email → login
5. Create a product through onboarding with file upload and a context URL
6. Confirm plan generation completes
7. Verify nav shows the right items for the product stage
8. Confirm launched product without growth check-in redirects to `/growth`
9. Complete growth check-in and confirm dashboard loads
10. Click agent panel card — confirm task is created, not a chat message
11. Language switch from settings — confirm route changes
12. Pre-launch: open launch modal, check all 3 toggles → confirmation section should pulse + show hint; check confirmLive → button activates
13. Navigate Settings → Pre-launch — Settings form must NOT appear in pre-launch route
14. Pre-launch: complete a checklist item → agent panel "Launch Recommendations" banner should refresh within ~2s
15. Metrics daily entry: enter Retention value higher than Acquisition → yellow warning card should appear; save should still work
