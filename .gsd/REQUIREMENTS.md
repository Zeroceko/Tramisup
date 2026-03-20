# Requirements

This file is the explicit capability and coverage contract for the project.

Use it to track what is actively in scope, what has been validated by completed work, what is intentionally deferred, and what is explicitly out of scope.

Guidelines:
- Keep requirements capability-oriented, not a giant feature wishlist.
- Requirements should be atomic, testable, and stated in plain language.
- Every **Active** requirement should be mapped to a slice, deferred, blocked with reason, or moved out of scope.
- Each requirement should have one accountable primary owner and may have supporting slices.
- Research may suggest requirements, but research does not silently make them binding.
- Validation means the requirement was actually proven by completed work and verification, not just discussed.

## Active

### R001 — Founder account and authenticated workspace access
- Class: core-capability
- Status: active
- Description: A founder must be able to sign up, sign in, and access a protected workspace.
- Why it matters: No product loop exists without reliable entry and session continuity.
- Source: user
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: partial
- Notes: Core auth flow exists, but password reset and email verification are not present.

### R002 — Product-centered workspace initialization
- Class: primary-user-loop
- Status: active
- Description: A new user must land in a meaningful product workspace instead of an empty shell.
- Why it matters: First-run value is essential; blank dashboards create churn.
- Source: inferred
- Primary owning slice: M002/S01
- Supporting slices: M001/S01
- Validation: partial
- Notes: Default product + seed exist; explicit product creation wizard and active product selection are still missing.

### R003 — Launch readiness management
- Class: primary-user-loop
- Status: active
- Description: Users must be able to evaluate launch readiness through structured checklist progress and linked execution tasks.
- Why it matters: This is the core pre-launch value surface.
- Source: user
- Primary owning slice: M002/S02
- Supporting slices: M003/S01
- Validation: partial
- Notes: Checklist and tasks exist; blocker/risk and launch review experience are incomplete.

### R004 — Metrics tracking and health visibility
- Class: primary-user-loop
- Status: active
- Description: Users must be able to record and review core growth metrics for a product.
- Why it matters: The product must support recurring health review, not just static planning.
- Source: user
- Primary owning slice: M002/S03
- Supporting slices: M003/S02
- Validation: partial
- Notes: Manual metrics flow exists; provider-backed metrics and KPI configuration are still missing.

### R005 — Goals and routine-driven growth management
- Class: primary-user-loop
- Status: active
- Description: Users must be able to define goals, update progress, and maintain recurring growth routines.
- Why it matters: This is the post-launch operating rhythm layer.
- Source: user
- Primary owning slice: M002/S04
- Supporting slices: M003/S03
- Validation: partial
- Notes: Goals and routines work; growth-readiness checklist workflow is not exposed yet.

### R006 — Multi-product portfolio support
- Class: differentiator
- Status: active
- Description: A user must be able to manage more than one product in one account and switch context safely.
- Why it matters: The schema already assumes this and the roadmap depends on it becoming real UX.
- Source: execution
- Primary owning slice: M004/S01
- Supporting slices: M002/S01, M003/S04
- Validation: mapped
- Notes: Data model supports this; product list, selector, and context switching UX are not yet implemented.

### R007 — Execution layer via task system
- Class: primary-user-loop
- Status: active
- Description: The workspace must support task creation, prioritization, and status progression as an execution layer.
- Why it matters: Checklists and goals need a concrete action system.
- Source: inferred
- Primary owning slice: M002/S02
- Supporting slices: M005/S01
- Validation: partial
- Notes: Task list works; full board/kanban experience is still missing.

### R008 — Real integration-backed data ingestion
- Class: integration
- Status: active
- Description: The system must ingest at least one revenue source and one product analytics source automatically.
- Why it matters: Manual entry is enough for MVP, but sustained value requires passive data collection.
- Source: user
- Primary owning slice: M005/S01
- Supporting slices: M005/S02
- Validation: unmapped
- Notes: Integration shell exists, but real sync is not implemented.

### R009 — Team-readable operating documentation
- Class: operability
- Status: active
- Description: The repo must contain clear product, requirement, decision, and roadmap documents that the team can code against.
- Why it matters: Execution quality collapses when docs drift ahead of reality.
- Source: user
- Primary owning slice: M001/S02
- Supporting slices: none
- Validation: partial
- Notes: This GSD documentation pass addresses the gap, but it should stay current over time.

## Validated

### R010 — Protected authenticated routes
- Class: continuity
- Status: validated
- Description: Authenticated pages are protected behind session checks and redirect unauthorized users to login.
- Why it matters: Users should not access workspace pages anonymously.
- Source: execution
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: validated
- Notes: Dashboard, pre-launch, metrics, growth, integrations, and settings layouts use `getServerSession` and redirect.

### R011 — Seeded first-run demo state
- Class: launchability
- Status: validated
- Description: Signup creates a default product and seeds demo data so the first workspace is populated.
- Why it matters: This shortens time-to-value and makes the product explorable.
- Source: execution
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: validated
- Notes: Implemented in `app/api/auth/signup/route.ts` via `seedProductData(product.id)`.

### R012 — Buildable application baseline
- Class: quality-attribute
- Status: validated
- Description: The application must build successfully in production mode.
- Why it matters: No roadmap matters if the app cannot be compiled and shipped.
- Source: execution
- Primary owning slice: M001/S01
- Supporting slices: none
- Validation: validated
- Notes: `next build` passes.

## Deferred

### R020 — Collaboration and team roles
- Class: admin/support
- Status: deferred
- Description: Multi-user collaboration, invites, and roles.
- Why it matters: Useful for team adoption, but not required before single-user value is proven.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Defer until after real multi-product and integration value are in place.

### R021 — Reporting/export surfaces
- Class: admin/support
- Status: deferred
- Description: Investor update mode, CSV/PDF export, and shareable views.
- Why it matters: Valuable later, but not on the critical path to operator-loop validation.
- Source: inferred
- Primary owning slice: none
- Supporting slices: none
- Validation: unmapped
- Notes: Should follow after weekly review and data quality are mature.

## Out of Scope

### R030 — Pixel-perfect marketing-first development
- Class: anti-feature
- Status: out-of-scope
- Description: Prioritizing landing-page polish and perfect marketing surfaces ahead of core product workflows.
- Why it matters: Prevents scope confusion and protects core product execution.
- Source: user
- Primary owning slice: none
- Supporting slices: none
- Validation: n/a
- Notes: Marketing work can continue later, but not at the expense of launch/growth operator flows.

## Traceability

| ID | Class | Status | Primary owner | Supporting | Proof |
|---|---|---|---|---|---|
| R001 | core-capability | active | M001/S01 | none | partial |
| R002 | primary-user-loop | active | M002/S01 | M001/S01 | partial |
| R003 | primary-user-loop | active | M002/S02 | M003/S01 | partial |
| R004 | primary-user-loop | active | M002/S03 | M003/S02 | partial |
| R005 | primary-user-loop | active | M002/S04 | M003/S03 | partial |
| R006 | differentiator | active | M004/S01 | M002/S01, M003/S04 | mapped |
| R007 | primary-user-loop | active | M002/S02 | M005/S01 | partial |
| R008 | integration | active | M005/S01 | M005/S02 | unmapped |
| R009 | operability | active | M001/S02 | none | partial |
| R010 | continuity | validated | M001/S01 | none | validated |
| R011 | launchability | validated | M001/S01 | none | validated |
| R012 | quality-attribute | validated | M001/S01 | none | validated |
| R020 | admin/support | deferred | none | none | unmapped |
| R021 | admin/support | deferred | none | none | unmapped |
| R030 | anti-feature | out-of-scope | none | none | n/a |

## Coverage Summary

- Active requirements: 9
- Mapped to slices: 9
- Validated: 3
- Unmapped active requirements: 0
