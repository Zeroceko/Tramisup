# Tiramisup Handover Guide

Last updated: 29 March 2026

---

## What Is Live

- Locale-first app (`/en`, `/tr`), default locale is English.
- Product onboarding flow at `/{locale}/onboarding`.
- Integrations (GA4, Stripe) with setup wizard and sync.
- Growth setup + Metrics daily entry loop.
- Source-aware growth metric selection behavior.

---

## High-Confidence Operational Rules

1. Do not reintroduce fake workspace data on signup.
2. Keep launched users out of pre-launch-heavy UX.
3. Keep Growth ("what to track") separate from Metrics ("what changed today").
4. Keep metrics source of truth in `MetricSetup` and `MetricEntry`.
5. Preserve evidence-first AI behavior.

---

## Onboarding + Integrations Handoff

- Onboarding includes optional source intent (`GA4`, `Stripe`, etc.).
- If source intent includes GA4/Stripe, after product creation user is redirected to Integrations with auto-open setup intent.
- Integrations workspace consumes query params:
  - `onboarding=1`
  - `connect=GA4|STRIPE`
  - `queued=...` (optional)

---

## Data Sync Notes

- GA4 and Stripe sync write legacy `Metric` rows.
- Bridge layer propagates sync data into `MetricEntry`:
  - `lib/sync-to-metric-entry.ts`
- GA4 sync mode options:
  - `overwrite`
  - `missing_dates`

---

## Environment Essentials

- `DATABASE_URL`, `DIRECT_URL`
- `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- `ACCESS_CODE`
- `QWEN_API_KEY`, `DEEPSEEK_API_KEY`, `GEMINI_API_KEY`, `GEMINI_API_KEY_2`
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`, `STRIPE_CLIENT_ID`, `STRIPE_WEBHOOK_SECRET`

---

## Recommended Verification

```bash
npm install
npx prisma generate
npx prisma db push
npm run build
OPENAI_API_KEY=dummy QWEN_API_KEY=dummy npx vitest run
```

---

## Canonical Docs

Use these as current references:
- `HANDOFF.md`
- `CLAUDE.md`
- `README.md`
- `PROJECT_SNAPSHOT.md`

