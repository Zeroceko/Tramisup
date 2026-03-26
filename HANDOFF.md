# Tiramisup - Handoff

**Last Updated:** 26 March 2026
**Status:** **MetricSetup/MetricEntry migration complete. Data-Driven AI Mentorship live. Integrations layer (GA4 + Stripe) operational.**

---

## Executive Summary

Tiramisup is a data-aware founder co-pilot for startup teams in their launch-to-growth phase. The system guides founders through a calm, staged progression: define what to track, enter daily data, observe trends, then optimize.

### What shipped in the latest sprint cycle (26 March 2026)

**Sprint 1 — DB Migration (Critical tech debt resolved)**
- Replaced `Product.launchGoals` JSON blob with proper `MetricSetup` and `MetricEntry` Prisma models
- All API routes, pages, and lib files migrated to use new DB entities
- Migration script available at `scripts/migrate-launch-goals.ts`
- Legacy `parseSavedMetricSetup()` kept for backward compatibility but no longer used by active code

**Sprint 2 — Metric Trend Visualization + Navigation**
- `MetricsTrendChart` upgraded: area charts with gradient fills, per-stage sparkline cards with trend percentages
- `DashboardNav` improved: pre-launch products now see Tasks in nav, Growth shown as preview
- Post-wizard product overview page (`/products/[id]/overview`) — clear orientation after product creation

**Sprint 3 — Smart Coach + Unified Orchestration**
- Founder Coach now receives AARRR funnel data + integration metrics in AI prompts
- `lib/next-step.ts` — unified next-step orchestration across all pages
- Enhanced fallback responses with metric-aware logic (DAU < 10 → acquisition focus, no integrations → suggest connection)

**Settings & Integrations UX Fix**
- Settings page restructured as a hub: Entegrasyonlar (with live status), Growth Tracking, Profil
- Users can now discover and navigate to Integrations from Settings

**Bug Fixes**
- Signup route no longer leaks error details in 500 responses
- Vitest config excludes `Landing Page/` directory (was causing false test failures)
- Advisor route updated to check `MetricSetup` table instead of legacy `launchGoals` field

---

## Architecture Overview

### Database Models (Prisma + PostgreSQL)

**Core:**
- `User` — Auth (email + passwordHash, credentials + JWT)
- `Product` — Main workspace entity (status: PRE_LAUNCH | LAUNCHED | GROWING)

**Metric System (NEW — replaces launchGoals JSON):**
- `MetricSetup` — One per product. Stores AARRR metric selections (JSON), platforms, ignoredChecklistIds, founderSummary
- `MetricEntry` — One per product+date. Stores user-entered AARRR funnel values (JSON)
- `Metric` — Integration-synced daily data (DAU, MAU, MRR, churn, etc.) from GA4/Stripe

**Growth Infrastructure:**
- `LaunchChecklist` — Pre-launch blockers (PRODUCT/MARKETING/LEGAL/TECH)
- `GrowthChecklist` — Growth execution items (ACQUISITION/ACTIVATION/RETENTION/REVENUE)
- `Task` — Standalone tasks linked to checklist items
- `Goal` — Numeric targets with progress tracking
- `GrowthRoutine` — Recurring weekly/monthly tasks

**Integrations:**
- `Integration` — OAuth config per provider per product (status: DISCONNECTED | CONNECTED | ERROR)
- `SyncJob` — Job logs for each sync run

**Other:**
- `Waitlist` — Pre-launch signups with invite codes
- `RetentionCohort`, `ActivationFunnel`, `TimelineEvent`

### Key Library Files

| File | Purpose |
|------|---------|
| `lib/metric-setup.ts` | DB-backed CRUD for MetricSetup/MetricEntry + legacy JSON parser |
| `lib/next-step.ts` | Unified next-step orchestration across all pages |
| `lib/metric-context.ts` | Builds metric snapshot + Turkish context string for AI prompts |
| `lib/founder-coach.ts` | Turkish-first mentorship engine (Qwen → DeepSeek → Gemini fallback) |
| `lib/founder-coach-context.ts` | Aggregates product state for Founder Coach |
| `lib/founder-coach-agent.ts` | Skill-loading decision maker for advisory routing |
| `lib/founder-summary.ts` | Builds data-driven founder summary during product creation |
| `lib/funnel-health.ts` | Computes AARRR funnel health status per stage |
| `lib/growth-workspace-step.ts` | Growth page step logic (SETUP → ENTER → GOAL → CHECKLIST → COACH) |
| `lib/integration-recommendations.ts` | Maps metric keys to recommended providers |
| `lib/integrations-catalog.ts` | Integration definitions + metadata |
| `lib/ga4-admin.ts` | Google Analytics Admin API helpers |

### AI Provider Chain

All AI calls fall through this provider chain in order:
1. **Qwen** (`qwen-plus` via Alibaba Cloud MaaS) — fastest, cheapest
2. **DeepSeek** (`deepseek-chat`) — fallback
3. **Gemini** (`gemini-2.0-flash`, `GEMINI_API_KEY`) — second fallback
4. **Gemini backup** (`gemini-2.0-flash`, `GEMINI_API_KEY_2`) — last resort

If all fail, static hardcoded fallback responses are returned (no crash).

### Integration Roadmap

| Priority | Providers | Status |
|----------|-----------|--------|
| **P0** | GA4, Stripe | Operational — OAuth + sync workers live |
| **P1** | RevenueCat, App Store Connect, Google Play, Meta Ads | Enum ready, sync workers not built |
| **P2** | Google Ads, TikTok Ads, AppsFlyer | Enum ready, placeholder only |

---

## Current UX/Product Principles

### 1. Calm, staged progression
- One main decision per screen
- One obvious next step
- Secondary systems only after primary setup is done

### 2. Stage-aware navigation
For **launched** products: Overview → Tasks → Metrics → Growth (Launch as preview)
For **pre-launch** products: Overview → Launch → Tasks (Growth as preview)
Settings → Integrations accessible via Settings hub

### 3. Evidence-first recommendations
The system must not assume problems without supporting context. Founder Coach uses real metric data from `MetricSetup`/`MetricEntry` tables and `Metric` integration data.

### 4. Setup before optimization
1. Choose tracking metrics → 2. Enter daily values → 3. View trends → 4. Set targets → 5. Optimize

### 5. Growth vs Metrics distinction
- **Growth** = "Neyi takip edeceğiz?" (What to track)
- **Metrics** = "Bugün ne oldu ve ne değişti?" (What happened today)

---

## Page-by-Page State

### Dashboard (`/[locale]/dashboard`)
- Shows next-step card based on product state (unified via `lib/next-step.ts`)
- Displays founderSummary from `MetricSetup.founderSummary`
- Quick links to all sections with live counts
- First-run: welcome onboarding with no fake data

### Growth (`/[locale]/growth`)
- Pre-launch: preview card explaining Growth is the next stage
- Launched: AARRR metric selection (MetricSetupSelector), growth checklist, goals, routines
- Integration recommendations based on selected metrics
- Advisor card with stage-aware guidance

### Metrics (`/[locale]/metrics`)
- Shows only user-selected metrics (from `MetricSetup.selections`)
- Funnel health analysis with AT_RISK / ON_TRACK / AHEAD status per stage
- Trend chart (area + sparklines) for last 14 entries
- Daily entry form with last-known value hints
- Recent entries table with delta comparison

### Tasks (`/[locale]/tasks`)
- Surfaces one main task first
- Quick start/complete actions
- Supporting task list underneath

### Pre-launch (`/[locale]/pre-launch`)
- Category-based checklist (Product, Marketing, Legal, Tech)
- Ignored items stored in `MetricSetup.ignoredChecklistIds`
- Launch button when ready

### Settings (`/[locale]/settings`)
- **Integrations hub** — connected provider status badges, last sync time, link to `/integrations`
- **Growth tracking** — link to metric setup
- **Profile** — name, project name, launch date, status

### Integrations (`/[locale]/integrations`)
- Dark mode marketplace UI
- Live integrations with property picker (GA4) and sync controls
- Roadmap section for P1/P2 providers

### Post-wizard Overview (`/[locale]/products/[id]/overview`)
- Shown after product creation
- Product summary, what Tiramisup prepared, clear next-step CTA

---

## Environment Variables

```bash
# AI Providers
QWEN_API_KEY="..."
DEEPSEEK_API_KEY="..."
GEMINI_API_KEY="..."
GEMINI_API_KEY_2="..."

# Auth
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="..."

# App
NEXT_PUBLIC_APP_URL="http://localhost:3002"

# Database
DATABASE_URL="postgresql://..."

# Google OAuth (GA4)
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

---

## Local Development

```bash
npm install
npx prisma generate
npx prisma db push        # sync schema to local DB
npm run dev                # starts on port 3002
```

Access code for signup: `TT31623SEN`

If dev becomes flaky:
```bash
rm -rf .next && npm run dev
```

---

## Production

**URL:** https://tramisup.vercel.app
**Hosting:** Vercel (`zerocekos-projects/tramisup`)
**DB:** Supabase PostgreSQL (free tier — pauses after inactivity)

---

## First thing to do when you take over

1. `npm install && npx prisma generate`
2. Copy `.env.example` to `.env.local`, fill in keys
3. `npx prisma db push` — sync schema
4. `npm run dev` — verify on http://localhost:3002
5. Create test user via `/tr/signup` with code `TT31623SEN`
6. `npm test` — verify all 65 tests pass

---

## What is NOT done yet

### High Priority
1. **P1 Integration sync workers** — RevenueCat, App Store Connect, Google Play, Meta Ads (enums exist, OAuth + sync code not built)
2. **Email notification flow** — waitlist approval, onboarding emails
3. **Multi-product switching UX** — basic product selector exists but could be smoother
4. **Remove `Product.launchGoals` column** — field still in schema but no longer used by any code. Can be dropped in a future migration.

### Medium Priority
1. Expand Founder Coach proposal modes (draft tasks / draft metrics / draft checklists)
2. Reintroduce website / SEO analysis only when triggered by context
3. Add proper retention cohort visualization
4. Implement activation funnel drill-down

### Low Priority
1. Figma design system alignment pass
2. PWA / mobile optimization
3. Team/collaboration features

---

## What Must Not Regress

1. No fake workspace data on signup
2. Launched products must not feel trapped in pre-launch UX
3. Growth must stay staged: preview for pre-launch, workspace for launched
4. Metric entry must stay tied to selected setup (from `MetricSetup` table)
5. Advice must not assume problems without evidence
6. User-written product description must remain central context
7. The product should guide, not lecture
8. `MetricSetup`/`MetricEntry` tables are the source of truth — never revert to `launchGoals` JSON

---

## Test Coverage

**Unit tests:** 7 files, 65 tests
- `__tests__/api/auth/signup.test.ts` — 12 assertions
- `__tests__/api/waitlist/join.test.ts` — 11 assertions
- `__tests__/api/waitlist/check.test.ts`
- `__tests__/api/waitlist/admin.test.ts`
- `__tests__/lib/auth.test.ts`
- `__tests__/lib/metric-context.test.ts` — 7 test cases

**E2E tests:** 5 Playwright files (not part of `npm test`, run via `npm run test:e2e`)

---

## Technical Stack

- **Framework:** Next.js 15 (App Router)
- **UI:** React 19 + Tailwind CSS 3
- **Language:** TypeScript 5
- **Auth:** NextAuth 4 (Credentials + JWT)
- **DB:** Prisma 6 + PostgreSQL (Supabase)
- **AI:** Qwen + DeepSeek + Gemini (fallback chain)
- **Charts:** Recharts
- **i18n:** next-intl
- **Tests:** Vitest + Playwright
- **Deploy:** Vercel

---

## Changelog

### v0.2.0 — 26 March 2026

**DB Migrasyonu (Teknik Borc Temizligi)**
- `Product.launchGoals` JSON blob kaldirildi, yerine `MetricSetup` ve `MetricEntry` Prisma modelleri geldi
- 15+ dosya yeni DB entity'lerine tasirildi
- Mevcut veriyi tasimak icin migration scripti hazir (`scripts/migrate-launch-goals.ts`)

**Veri Odakli AI Mentorluk**
- Founder Coach artik gercek AARRR funnel verisini + entegrasyon metriklerini prompt'a enjekte ediyor
- DAU < 10 ise acquisition odagi, entegrasyon yoksa baglanti onerisi gibi akilli fallback'ler
- Advisor route duzeltildi: artik `MetricSetup` tablosunu kontrol ediyor

**Unified Next-Step Sistemi**
- Yeni `lib/next-step.ts`: tum sayfalarda tek bir "siradaki adim" mantigi
- Akis: Urun olustur → Launch checklist → Metrik kur → Ilk veri gir → Hedef koy → Checklist ilerlet → Gunluk metrik

**Metrik Trend Gorsellestirme**
- `MetricsTrendChart` yeniden yazildi: AreaChart + gradient dolgular
- Her AARRR asamasi icin sparkline kartlari + trend yuzdesi

**Navigasyon Iyilestirmeleri**
- Pre-launch urunler artik nav'da Tasks goruyor, Growth "preview" olarak isaretli
- Post-wizard overview sayfasi eklendi (`/products/[id]/overview`)
- Urun olusturma sonrasi artik overview'a yonleniyor

**Settings Hub**
- Settings sayfasi 3 bolumlu hub oldu: Entegrasyonlar (durum + sync), Growth Tracking, Profil
- Kullanicilar artik entegrasyonlari Settings'ten bulabiliyor

**Entegrasyon Altyapisi**
- Entegrasyon oneri sistemi: secilen metriklere gore provider onerisi
- GA4 property picker + sync kontrolleri
- P0 (GA4, Stripe) operasyonel, P1/P2 roadmap'te

**Guvenlik & Stabilite**
- Signup route artik 500 hatalarinda detay sizdirmiyor
- Vitest config `Landing Page/` dizinini disliyor
- Advisor route'taki eski `launchGoals` referansi duzeltildi

### v0.1.0 — Initial Release
- Core product creation wizard
- Pre-launch checklist system
- Basic metric tracking with launchGoals JSON
- AI mentorship with Qwen/DeepSeek/Gemini fallback chain
- GA4 + Stripe integration OAuth flows
- Waitlist system with invite codes
