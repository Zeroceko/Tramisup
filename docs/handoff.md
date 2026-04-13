# Engineering Handoff Notes

## Snapshot

- Production domain: `https://tiramisup.app`
- Current active main line: through `e40b9cab` (late 13 April agent chat fix + upgrade flow fix)
- Last docs refresh: `13 April 2026` (evening)
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
- Board is directly reachable from the authenticated header as a secondary CTA.
- Board/task rows and agent suggestion rows now use a shared preview-first interaction model.
- Overview / Launch / Growth keep the agent column fixed while the right content pane scrolls independently.
- Free-form agent chat is now working: the root cause (missing `AgentMessage` table in production DB) was fixed on 13 April. The route is also hardened so every non-critical DB operation is independently try/caught.
- Plan upgrade from product limit gate now returns the user to the product creation flow (not settings) via a `next` query param through pricing → checkout.
- Secret files are no longer tracked in git, and Gemini/OpenAI production env keys were rotated on 13 April 2026 after exposed secrets were found in the public repo.

### Recent shipped commits

- `e40b9cab` — harden agent/chat against missing AgentMessage table and DB timeouts
- `a49a57ce` — return to onboarding after upgrade from products/new limit gate
- `f87af053` — fix agent chat intermittent 500s by isolating non-critical DB writes
- `53b5e694` — security cleanup: stop tracking local secrets and remove hardcoded production DB URLs from seed scripts
- `72e598ba` — tighten free-form agent chat guidance and action defaults
- `e3e5f79c` — make Board access visible across app surfaces
- `beb5022e` — unify board task interactions with preview-first UX
- `21dcae07` — improve agent suggestion quality and actions
- `947d392c` — fix route boundary height in agent layouts
- `e6d1954f` — fix agent shell scroll and metrics flow regressions
- `5232e299` — fix agent layout content scrolling
- `0f9fc76a` — fix growth goals and routing follow-ups
- `9c3a1e58` — ship launch flow follow-up fixes
- `27dfd71d` — allow chef admin access
- `eded8530` — finish trust sprint 2 hardening and verification
- `f8f56491` — handoff/docs refresh on top of the current production baseline
- `eacecb50` — remove tagline from all logo instances (nav + all landing pages)
- `3138ac6e` — dead code removal: prompts.ts, lib/ds.ts, lib/ai-advice.ts, getActiveProduct
- `13ba0851` — fix overview agent: stage-aware context for launched/growing products
- `93c8a82f` — agent panel all-task, remove ask intent

---

## Local Workspace State

The app workspace is a **production repo with recent follow-up work already merged**. Earlier "three local fixes" are no longer pending; they shipped alongside later board, suggestion, and security work. `npx tsc --noEmit` has recently passed. The only local dirt seen at handoff time is outside app code:

- `external/streamlined-solutions` is a nested repo and intentionally ignored for app work
- `tmp/` contains local scratch artifacts and should not be committed

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

### 10. Growth follow-up fixes shipped

`app/[locale]/growth/page.tsx`, `components/GoalsSection.tsx`, `app/[locale]/growth/layout.tsx`, `app/[locale]/dashboard/layout.tsx`, `components/GrowthChecklistSection.tsx`, `components/today/MetricSparklinePanel.tsx`:
- `/growth#goals` now lands on a real goals section
- empty goals state opens directly into the goal form instead of a dead shell
- Growth got its own route remount boundary to reduce cross-route subtree reuse
- dashboard remount key was tightened again for route isolation
- trend delta now compares recent points instead of a misleading first-entry baseline
- creating a recommended growth task can complete the corresponding growth checklist item

### 11. Agent layout shell scroll fix shipped

`components/AgentLayoutShell.tsx`:
- added `min-h-0` through the flex chain so the right content pane scrolls correctly on Overview / Launch / Growth

---

## Current Open Findings From Founder Simulation

These are not theoretical risks. They came from using the live app with a real upgraded test account as if we were a founder.

### 1. ~~Free-form agent chat fails on user-written questions~~ FIXED

- Root cause: `AgentMessage` table was in the Prisma schema but had no migration and was never pushed to production DB. Every `listStoredAgentMessages` call threw "table does not exist".
- Fix: `prisma db push` run against production + route hardened with independent try/catch around every non-critical DB operation.
- Commits: `f87af053`, `e40b9cab`

### 2. Repeated browser-side `500` resource errors

- Observed while visiting `/products/new`, `/growth`, and `/dashboard`
- Seen in console during real founder simulation
- Root cause still unknown; next team should reproduce with network capture and trace the failing request

### 3. Onboarding does not close cleanly from the AARRR recommendation step

- The user flow repeatedly remained on the `Önerilen AARRR kurulumun` screen
- Even when the product became accessible later, the onboarding exit felt unfinished and confusing

### 4. Metrics setup and metrics entry feel merged together

- On the tested product, metric setup cards were absent
- Daily numeric entry inputs were already visible and savable
- This makes the user unsure whether setup is complete, skipped, or broken

### 5. First metric save does not fully propagate into Growth state

- After entering and saving metric values, Growth still showed the equivalent of "metrics selected but no data yet"
- This breaks the core loop of setup → first baseline → diagnosis

### 6. Agent recommendation cards did not reliably appear in the launched-product journey

- In the exercised path, the agent card count was `0`
- The intended bridge from diagnosis to task creation still needs true end-to-end validation on a fresh product

---

## Current Operational Risks

- **Billing is still fake.** Pricing UX is usable for testing, but real Stripe checkout is not wired.
- **i18n gaps.** Some screens still carry hardcoded strings.
- **Roadmap integrations.** Some integration surfaces are still UI-first placeholders.
- **`Product.launchGoals` is legacy.** Do not build new core logic on top of it.
- **Founder continuity still needs work.** The newly created launched-product journey has gaps between onboarding, metrics, growth, and agent surfaces.
- **Email delivery latency.** `RESEND_FROM_EMAIL` must be set in Vercel to `Tiramisup <hello@tiramisup.app>`. If unset, fallback is `onboarding@resend.dev` which causes spam filter delays. `tiramisup.app` is already verified in Resend.
- **Public repo secret history still matters.** Secret tracking has been stopped going forward, but previously exposed credentials must still be rotated outside the repo.

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
16. Real founder path: login with an upgraded account, create a fresh product, and finish onboarding end-to-end without getting stuck on the AARRR recommendation step
17. Fresh launched product: verify `/metrics` shows a coherent setup state before daily entry inputs appear
18. Save the first metric baseline and then open `/growth` — Growth must no longer say there is no data
19. In the same founder flow, confirm agent recommendation cards appear and can create tasks
20. Overview / Launch / Growth: confirm the right-side content pane scrolls independently of the left agent sidebar
21. Overview / Launch / Growth: ask a free-form question and confirm `/api/agent/chat` returns a contextual answer instead of the generic retry copy
