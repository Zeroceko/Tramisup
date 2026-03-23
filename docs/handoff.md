# Tiramisup Handoff Notes

**Last Updated:** 23 March 2026

## Current focus

First login is no longer meant to feel like an empty dashboard.

If the authenticated user has no product yet, the dashboard should now:
- show a short welcome/profile onboarding
- keep one obvious primary CTA into product creation
- preview the staged product journey in simple language
- avoid fake metrics, fake tasks, and fake checklist content

## Current implementation boundary

- Runtime entry point: `app/[locale]/dashboard/page.tsx`
- First-run UI component: `components/FirstRunOnboarding.tsx`
- Product creation flow still starts at `/{locale}/products/new`
- Existing calm/staged rules from `README.md`, `HANDOFF.md`, and `.gsd/KNOWLEDGE.md` remain in force

## Notes

- Figma MCP was not available in this terminal harness, so the first-run surface was implemented against the existing product system and documented constraints instead of a direct frame import.
- Keep the first-run state locale-aware and beginner-friendly.
- Do not regress to a generic empty state unless explicitly redesigning onboarding again.
