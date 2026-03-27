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

## Notes

- Figma MCP was not available in this terminal harness, so the first-run surface was implemented against the existing product system and documented constraints instead of a direct frame import.
- Keep the first-run state locale-aware and beginner-friendly.
- Do not regress to a generic empty state unless explicitly redesigning onboarding again.
