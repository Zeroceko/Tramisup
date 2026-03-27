# Tiramisup Handoff Notes

**Last Updated:** 27 March 2026

## Current focus

This sprint is a product-logic reset, not a visual-polish sprint.

Current reset themes:
- first-login onboarding
- Growth vs Metrics separation
- beginner-friendly metric language
- metrics feedback loop
- task surface clarity
- docs consistency

First login is no longer meant to feel like an empty dashboard.

If the authenticated user has no product yet, the dashboard should now:
- show a short welcome/profile onboarding
- keep one obvious primary CTA into product creation
- preview the staged product journey in simple language
- avoid fake metrics, fake tasks, and fake checklist content

Current product surfaces also include:
- a pre-launch Growth preview that stays visible as the next stage instead of disappearing
- a launch review surface that still shows remaining non-critical items after launch
- a real metrics trend chart once enough daily entries exist
- a clearer metrics feedback loop with last-known-value hints, save feedback, and latest-vs-previous comparison
- a clearer Growth page framing that explains Growth as metric-selection/setup and Metrics as daily entry + change review
- a dedicated tasks shell so task work keeps the same app framing as the other workspace pages
- a task spotlight surface that brings one main job to the top of the page
- mobile product setup now asks for iOS / Android platform selection so store requirements can be surfaced early
- ASO now has its own skill boundary for store-page conversion guidance
- launch readiness and analytics instrumentation now have dedicated skill boundaries too
- a project-level skill gateway now routes ambiguous or multi-domain skill requests

## Current implementation boundary

- Runtime entry point: `app/[locale]/dashboard/page.tsx`
- First-run UI component: `components/FirstRunOnboarding.tsx`
- Growth framing: `app/[locale]/growth/page.tsx`, `components/MetricSetupSelector.tsx`
- Metrics loop: `app/[locale]/metrics/page.tsx`, `components/MetricEntryForm.tsx`
- Task work surface: `components/TasksList.tsx`
- Product creation flow still starts at `/{locale}/products/new`
- Existing calm/staged rules from `README.md`, `HANDOFF.md`, and `.gsd/KNOWLEDGE.md` remain in force
- The workspace should not fabricate fallback checklist/task data when AI is unavailable
- App Store / Google Play submission guidance should be pulled into AI output when the product is a mobile app
- ASO questions should route separately from policy/compliance questions
- launch blocker questions should route to launch readiness, and tracking-plan questions should route to analytics instrumentation
- skill-routing questions should route to the new gateway skill

## March 27 — Today Screen Redesign

Dashboard replaced with a phase-adaptive "Today" command center.

### Architecture decisions
- `GROWING` and `LAUNCHED` are merged at the UI level. GROWING is only cosmetic (purple badge). All post-launch behavior is identical. Wizard still writes GROWING to DB for "Büyüme aşamasında" selections.
- `PhaseKey` is now `"pre-launch" | "launched"` — two operating modes only.
- Pre-launch and post-launch render completely different primary actions, decision strips, and blocker surfaces.

### New components (`components/today/`)
| Component | Purpose |
|-----------|---------|
| `TodayHero` | Greeting + product name + phase badge + one-line status |
| `PrimaryAction` | Single dominant action card with progress bar. Phase-adaptive. |
| `DecisionStrip` | 4 compact health indicators (readiness/growth, tasks, metrics, sources) |
| `BlockerAlert` | Conditional — only renders when HIGH priority checklist items or ERROR integrations exist |
| `TodayTasks` | Top 3 priority tasks with quick-complete (PATCH `/api/actions/[id]`) |
| `SourceHealth` | Today's entry status, manual vs automated metric breakdown, integration health |
| `CoachInsight` | Opt-in AI coach (collapsed by default). Prompt always sent in English, response forced to user locale. |

### Data fetching
`app/[locale]/dashboard/page.tsx` now fetches in a single parallel `Promise.all`:
- `LaunchChecklist` HIGH+incomplete items (blockers)
- `Task` top 3 by priority (not DONE)
- `Task` grouped by status (counts)
- `Integration` ERROR status
- `MetricEntry` for today's date
- `Goal` count
- `MetricSetup` (AARRR selections + founder summary)

### CoachInsight language fix
Prompts are always sent in English for better AI reasoning. A `You MUST respond in Turkish` instruction is appended when `locale === "tr"`. This prevents the model from defaulting to English regardless of prompt language.

## March 28 — Launch Readiness Screen Redesign

Launch Readiness reframed as a "launch control system" with gate logic, weighted scoring, and severity hierarchy.

### Gate model
Three gate states derived at page level:
- `HARD_BLOCKED` — any active HIGH-priority incomplete checklist item. Button locked.
- `WARNING` — no active blockers, but ignored blockers or non-critical items remain. Button enabled with risk acknowledgment.
- `CLEAR` — zero blockers, zero ignored. Full green light.

### Weighted score
`HIGH=3, MEDIUM=2, LOW=1`. Score = completedWeight / totalWeight × 100. Simple % was misleading (9/10 with 1 critical LEGAL = 90% — wrong).

### New and updated components
| Component | Change |
|-----------|--------|
| `components/launch/LaunchGateStatus.tsx` | New hero. Weighted score (large display), gate state badge, 4 confidence indicators (Product/Tech/Legal/Marketing), anchor to #blockers when hard blocked. |
| `components/ChecklistSection.tsx` | Risk label per category, RED border on HIGH items, red counter badge, expandable description, "Göreve ekle" CTA. |
| `components/BlockerSummary.tsx` | CRITICAL (LEGAL/TECH) vs IMPORTANT (PRODUCT/MARKETING) severity. Sorted by severity. "Riski kabul et, geç" replaces "Yoksay". |
| `components/LaunchButton.tsx` | `gateOpen` prop — lock icon when blocked. Ignored blocker warning in modal. Risk acknowledgment checkbox required when ignored blockers exist. |

### Page (`app/[locale]/pre-launch/page.tsx`)
Computes weighted score, gate state, and 4 confidence indicators. Passes `gateOpen`, `ignoredBlockers`, `nonCriticalRemaining`, and `locale` to all components. `LaunchReviewSummary` removed — replaced by `LaunchGateStatus`.

---

## March 28 — Tasks Screen Redesign

Tasks reframed as a founder execution queue with impact-based prioritization and linked system effects.

### Section model
Tasks are sorted into four execution lanes (derived, not stored in DB):
- **Şimdi yap / Do now** — `IN_PROGRESS` tasks + `HIGH` priority tasks that are overdue or due today. Shown as prominent focus cards with a large CTA.
- **Sırada / Up next** — `HIGH` and `MEDIUM` priority `TODO` tasks not in the focus lane.
- **Bekleyen / Backlog** — `LOW` priority `TODO` tasks. Collapsed by default.
- **Tamamlandı / Done** — `DONE` tasks. Collapsed by default.

### Linked system effect
When a task is marked DONE via `PATCH /api/actions/[id]`, the API now also auto-completes the linked `LaunchChecklist` item (if one exists and is not already completed). This means completing a task from the launch checklist on the Tasks screen is reflected immediately in Launch Readiness — no manual double-update needed.

### Card metadata surface
- Priority shown as impact label (`Yüksek etki / High impact`) with colored dot
- Linked checklist category badge (LEGAL / TECH / PRODUCT / MARKETING) — shows which launch gate this task affects
- Overdue / due today / in-progress state badges
- Expandable description (collapse toggle button)
- Inline "Başla / Start" button to move task → IN_PROGRESS

### Momentum bar
Completion progress bar at the top: `doneTasks.length / tasks.length × 100`. Thin green bar, always visible when tasks exist.

### Task creation
Inline add form with title, description (new), due date, priority. Uses `POST /api/actions`. Description field was always in the DB but never exposed in the UI until now.

### Updated files
| File | Change |
|------|--------|
| `app/api/actions/[id]/route.ts` | PATCH now includes `launchChecklistItem` in the query and auto-completes it when task → DONE |
| `app/[locale]/tasks/page.tsx` | Fetches tasks with `include: { launchChecklistItem }`, removed next-intl dependency (hardcoded bilingual), passes `locale` to TasksList |
| `components/TasksList.tsx` | Full rewrite — 4-lane execution queue, focus cards, momentum bar, collapsible backlog/done, bilingual |

## Notes

- Figma MCP was not available in this terminal harness, so the first-run surface was implemented against the existing product system and documented constraints instead of a direct frame import.
- Keep the first-run state locale-aware and beginner-friendly.
- Do not regress to a generic empty state unless explicitly redesigning onboarding again.
