# Tiramisup Handoff Notes

**Last Updated:** 23 March 2026

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

## Notes

- Figma MCP was not available in this terminal harness, so the first-run surface was implemented against the existing product system and documented constraints instead of a direct frame import.
- Keep the first-run state locale-aware and beginner-friendly.
- Do not regress to a generic empty state unless explicitly redesigning onboarding again.
