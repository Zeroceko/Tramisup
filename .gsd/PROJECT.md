# Tramisu - Startup Growth Command Center

A single-panel dashboard for startup/app owners to manage the full growth journey from pre-launch to scale.

## Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript 5, Tailwind CSS
- **Backend:** Next.js API routes, NextAuth.js (credentials provider)
- **Database:** PostgreSQL + Prisma ORM
- **Charts:** Recharts
- **Testing:** Vitest
- **Deployment:** Docker + Vercel ready

## Current State

**Working features:**
- Authentication (signup/login with NextAuth)
- Pre-launch management (checklist, action items, readiness score)
- Metrics dashboard (DAU, MAU, MRR with trend charts)
- Retention cohort analysis (heatmap visualization)
- Activation funnel tracking
- Manual metric entry form
- Goals & OKRs with progress tracking
- Growth routines (weekly/monthly playbooks)
- Timeline activity feed
- Integration architecture (connection management, status tracking)
- Demo data seeding via API endpoint

**Architecture decisions:**
- App Router structure with route groups for public/authenticated pages
- Server components by default, client components for interactivity
- API routes under `/api/*` for all CRUD operations
- Prisma client singleton pattern via `lib/prisma.ts`
- NextAuth with JWT sessions

**Database schema:**
Core tables: User, Project, PreLaunchChecklist, PreLaunchAction, Metric, RetentionCohort, ActivationFunnel, Goal, GrowthRoutine, TimelineEvent, Integration, SyncJob

**Known technical debt:**
- Integration tokens stored as plain JSON (needs encryption)
- No input validation layer (Zod not yet added)
- Manual metric entry only (real integrations stubbed)
- No rate limiting on auth endpoints
- No automated tests beyond stub structure

## Project Structure

```
app/
  (public)/ - Landing, login, signup
  dashboard/ - Main dashboard
  pre-launch/ - Checklist & actions
  metrics/ - Charts & analytics
  growth/ - Goals & routines
  integrations/ - Integration hub
  settings/ - User settings
  api/ - All backend routes

components/ - React components
lib/ - Prisma client, auth config
prisma/ - Schema & migrations
types/ - TypeScript definitions
```

## Development Status

- Development server runs on port 3000
- PostgreSQL via Docker Compose on port 5432
- Migrations applied and schema generated
- Demo data seeder functional
- Docker production build configuration present
- Vercel deployment documented

## Next Priorities

Based on roadmap in README:
1. Real integrations (Stripe, GA4, Mixpanel)
2. Scheduled sync jobs
3. Token encryption for security
4. Input validation with Zod
5. Team collaboration features
