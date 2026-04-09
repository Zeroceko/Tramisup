# Full-Stack Team Transfer Checklist

Last updated: 2026-04-09
Recommended audience: engineering lead, product lead, design lead, QA lead

## 1. Read this first

Read in this order:
1. `README.md`
2. `CLAUDE.md`
3. `docs/handoff.md`
4. `docs/team-handoff-prompt.md`
5. `docs/production-stabilization-board.md`
6. `PROJECT_SNAPSHOT.md`

## 2. Production truth

- Production domain: `https://tiramisup.app`
- Current live production release line: `6237204b`
- Current repo `main` handoff head: `acc151ed`
- Default locale: `en`
- Secondary locale: `tr`
- App is a live system. Do not treat it like a prototype sandbox.

Important distinction:
- `6237204b` is the currently deployed product behavior baseline.
- `acc151ed` adds stronger production smoke assertions and should be treated as repo handoff truth for release safety.

## 3. What the incoming team must get access to

### Code + delivery
- GitHub repository with push access
- Vercel project for `tramisup`
- Production domain / DNS ownership for `tiramisup.app`

### Data + auth
- Supabase project and database access
- Prisma-compatible `DATABASE_URL` and `DIRECT_URL`
- NextAuth secret rotation authority

### Email + comms
- Resend account access
- Verified sender domain access for `tiramisup.app`

### Analytics
- GA4 property access
- Microsoft Clarity project access

### OAuth / external providers
- Google Cloud Console OAuth credentials
- Stripe dashboard access

### AI providers
- Qwen / Alibaba MaaS access
- DeepSeek API access
- Gemini API access

## 4. Secrets to transfer

Transfer values securely; do not put real values in docs or tickets.

Minimum env set:
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `NEXT_PUBLIC_APP_URL`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`
- `RECAPTCHA_ENABLED`
- `NEXT_PUBLIC_RECAPTCHA_ENABLED`
- `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
- `RECAPTCHA_SECRET_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_CLIENT_ID`
- `STRIPE_SECRET_KEY`
- `OAUTH_CALLBACK_BASE_URL`
- `DEEPSEEK_API_KEY`
- `GEMINI_API_KEY`
- `QWEN_API_KEY`

Use `.env.example` as the sanitized reference file.

## 5. Day-1 local setup

```bash
npm install
npx prisma generate
npm run build
npm run dev
```

Default local URL:
- `http://localhost:3002`

## 6. Day-1 verification checklist

- `npm run build`
- `npm run test:unit`
- Open `/en`
- Open `/tr/login`
- Open `/tr/products/new`
- Verify app boots with locale routing and active product selection

## 7. Release checklist

Before any production release:
- Confirm working tree is intentional and clean enough to release
- Run `npm run build`
- Run founder smoke:
  - `npx playwright test --config playwright-prod.config.ts prod-founder-takeover --reporter=list`
- Confirm `tiramisup.app` actually serves the new deploy
- Save smoke screenshots / notes as artifacts

## 8. Current known live risks

- Dashboard / Launch / Growth left recommendation cards are still mostly static fallback copy.
- Historical shallow products still require explicit regenerate / repair work.
- Billing is still in temporary fake-checkout mode.
- This repo may contain local experimental drift; always separate deployed truth from local files.

## 9. Product rules the new team should not casually break

- Dashboard, Launch, Growth, Metrics, Settings roles must stay separate.
- Launched products must not feel trapped in launch language.
- Metrics is the measurement workspace, not a generic dashboard tab.
- AI output must stay stage-aware and product-aware.
- English remains the master language for prompts and default locale.

## 10. Recommended first sprint after takeover

Start with `Sprint 0` from `docs/production-stabilization-board.md`.

Current priority order:
1. deploy verification
2. context-driven recommendation cards
3. historical product repair tooling
4. observability for plan quality
