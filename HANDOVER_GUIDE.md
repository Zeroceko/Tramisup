# Tiramisup Project Handover Guide (v1.0) 🍦🚀🛡️

Tiramisup is a "Launch Operating System" for SaaS founders and product teams. It bridges the gap between chaos (Idea/Development phase) and growth (Scale-up) by providing a single, AI-driven platform for tracking readiness and metrics.

---

## 🏗️ Technical Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL) + Prisma ORM
- **Authentication:** NextAuth.js (Credentials Provider / PasswordHash with bcryptjs)
- **AI Core:** Vercel AI SDK (@ai-sdk/google, @ai-sdk/openai)
- **Styling:** Vanilla CSS + Tailwind CSS (for some layouts) + Radix UI (Shadcn components)
- **Analytics/Revenue:** Planned integration with GA4 and Stripe (APIs are partially scaffolded).

---

## 🚀 Key Modules & Features

### 1. Multi-Step Product Wizard (`/products/new`)
- **Automated Scraping:** Uses `scrapeUrl` to pull context from a landing page or project description.
- **AI Strategy Generation:** Calls `generateAiPlan` to create a 3-month launch roadmap, including product, marketing, legal, and tech tasks.
- **Initial Metrics:** Allows founders to opt-in for a "Mock Data" seed to see the platform's potential immediately.

### 2. Launch Readiness Tracker (LR-Score)
- **Dynamic Scoring:** Calculates a readiness score (0-100) based on `LaunchChecklist` completion.
- **Category-Based Planning:** Tasks are categorized (Legal, Marketing, Tech, Product) and prioritized.
- **Task Interaction:** Support for checklist-to-task linking (Prisma relations).

### 3. Weekly Metric Rhythm (Dashboard)
- **Visual Analytics:** Uses `recharts` to show DAU (Daily Active Users) and MRR (Monthly Recurring Revenue) trends.
- **Trend Analysis:** Automated calculation of "Up/Down/Stable" trends based on historical `Metric` snapshots.
- **Manual Data Entry:** A dedicated flow for founders to log their weekly stats without needing complex integrations on day one.

### 4. AI Resilience Layer (The "Armor")
- **File:** `BrandLib/ai-client.ts`
- **Logic:** Hybrid orchestration.
- **Primary:** Gemini 1.5 Flash (via Vercel AI SDK).
- **Secondary (Bulletproof):** Qwen-Plus via **Raw OpenAI SDK**.
- **Why?** Bypasses parsing/connection issues inherent in some Vercel AI SDK wrappers for compatible providers.
- **Components:** `TiramisupAdviceCard`, `orchestrator.ts`, and AI agents (Growth, Execution).

---

## 🛠️ Configuration & Environment Variables

Make sure the following `.env` or Vercel Environment variables are present:

```bash
# Database (IMPORTANT: Use port 6543 with ?pgbouncer=true for Vercel/Serverless)
DATABASE_URL="postgresql://postgres.[ProjectRef]:[Password]@aws-1-eu-west-3.pooler.supabase.com:6543/postgres?pgbouncer=true"

# Authentication
NEXTAUTH_SECRET="your-random-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# AI API Keys
GOOGLE_GENERATIVE_AI_API_KEY="your-gemini-key" # Required for Vercel AI SDK
QWEN_API_KEY="your-qwen-key"                 # Required for backup & raw fallback

# Public Supabase (Frontend)
NEXT_PUBLIC_SUPABASE_URL="https://[ProjectRef].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

---

## 💎 Important Technical Decisions (Read This!)

1. **Database Connection Pooling:** 
   - ALWAYS use the **Transaction Pooler (Port 6543)** in the `DATABASE_URL` for Vercel deployments. 
   - For local seeding/migrations that require heavy direct connections, use the **Direct** connection (port 5432) or **Session Pooler** (port 5432) on `aws-1-eu-west-3.pooler.supabase.com` with `connection_limit=1`.

2. **AI Fallback Pattern:**
   - Use `generateTextFallback` and `generateStructuredFallback` from `@/BrandLib/ai-client` instead of direct AI SDK calls. This ensures high availability.

3. **Dashboard Hardening:**
   - The `/dashboard` route is heavily guarded against `NaN` and `null` values from a fresh/empty database state. Always use `?.` and fallback values in Server Components when pulling Prisma counts.

---

## 🧹 Cleanup & Maintenance

- **Seeding:** To create a full staging account, research the `scripts/seed-user-product.ts` script. It demonstrates how to populate a multi-dimensional user profile.
- **Local Dev:** `npm run dev` (starts on port 3002 as per `package.json`).
- **Build/Prisma:** Always check `npx prisma generate` after schema changes.

**Current State:** Fully functional, stable, and data-rich.
**Next Milestone:** Sprint 3 (Advanced Automations & PostHog/Google Ads Integration).

---
**Handover Date:** March 26, 2026
**Prepared by:** Antigravity AI
