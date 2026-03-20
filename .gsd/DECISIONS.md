# Decisions Register

<!-- Append-only. Never edit or remove existing rows.
     To reverse a decision, add a new row that supersedes it.
     Read this file at the start of any planning or research phase. -->

| # | When | Scope | Decision | Choice | Rationale | Revisable? |
|---|------|-------|----------|--------|-----------|------------|
| D001 | 2026-03 | product-architecture | Primary domain anchor | Model all core workspace data around `Product` instead of a single global project | The product roadmap requires multi-product support; centering relations on `productId` avoids repainting the domain later | Yes |
| D002 | 2026-03 | auth | Session strategy | Use NextAuth credentials provider with JWT sessions | Keeps the auth layer simple for MVP and compatible with serverless deployment targets | Yes |
| D003 | 2026-03 | onboarding | First-run state | Create a default product and seed demo data on signup | Avoids empty-state dead ends and shortens time-to-value for the first session | Yes |
| D004 | 2026-03 | prioritization | Product focus order | Prioritize operator workflows over landing-page polish | The user explicitly redirected focus to login, register, and real in-product functionality | Yes |
| D005 | 2026-03 | roadmap | Product strategy | Treat Tiramisup as a launch-to-growth operating system, not only a dashboard | The schema and current surfaces already support checklist, tasks, metrics, goals, routines, and integrations; the roadmap should deepen that system | Yes |
| D006 | 2026-03 | integrations | Integration maturity model | Ship integration façades first, then implement provider-specific sync once the manual operator loop is strong | Manual loops validate the product’s decision value before the team invests in costly integration work | Yes |
