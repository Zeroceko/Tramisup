# Tiramisup

Launch-to-growth dönemindeki startup ekipleri için tek workspace.

**Status:** Live MVP, onboarding stabilized  
**Last Updated:** 21 March 2026

---

## What is live right now?

Tiramisup currently supports a focused MVP flow:

1. **Public landing page** (`/tr`, `/en`)
2. **Waitlist capture** from the landing page CTA
3. **Early-access signup** with access code (`TT31623SEN`)
4. **Authenticated dashboard** with a safe empty state when no product exists
5. **Product creation wizard** (`/{locale}/products/new`)
6. **Product-scoped surfaces** for pre-launch, tasks, metrics, growth, integrations, settings

This is not a fully polished SaaS yet. It is a working MVP with the critical onboarding path stabilized so first-time users do not fall into broken routes or fake seeded data immediately after signup.

---

## Current onboarding flow

### A. Waitlist user
- User clicks **Ücretsiz Başla / Start free** on landing page
- Waitlist modal opens
- User submits name + email
- User is redirected to thank-you page

### B. Early-access user
- User clicks **Ücretsiz Başla / Start free**
- Waitlist modal opens
- User clicks **Erken erişim kodum var**
- User is sent to `/{locale}/signup`
- User enters:
  - name
  - email
  - password
  - access code
- Current access code:

```txt
TT31623SEN
```

- If valid, account is created and user lands on dashboard

### C. First authenticated session
- If user has **no product**, dashboard shows a clean empty state
- No fake metrics, fake tasks, or fake checklist data are shown
- User is prompted to create first product
- Clicking **İlk ürününü oluştur** opens `/{locale}/products/new`

### D. Product creation
- Wizard collects product context across multiple steps
- Product is created through `/api/products`
- Initial product data can be created at product-creation time
- User is redirected back to localized dashboard

---

## Important behavior changes

### No fake seed on signup
Previously, signup automatically created a product and seeded demo-like data. That behavior was removed.

**Current rule:**
- signup creates the user only
- product data starts after product creation

This avoids embarrassing first-run experiences with fake tasks, fake metrics, and fake launch status.

### Locale-aware routing
The app is now routed under locale prefixes:

```txt
/tr/...
/en/...
```

Critical links and redirects were updated so onboarding no longer falls into broken non-locale routes.

---

## Tech stack

- **Framework:** Next.js 15
- **UI:** React 19 + Tailwind CSS
- **Language:** TypeScript
- **Auth:** NextAuth 4 (credentials)
- **DB:** Prisma 7 + PostgreSQL
- **i18n:** next-intl
- **Tests:** Vitest + Playwright
- **Deploy:** Vercel

---

## Key routes

### Public
- `/{locale}` — landing page
- `/{locale}/signup` — early-access signup with code
- `/{locale}/login` — login
- `/{locale}/waitlist/thank-you` — waitlist thank-you page

### Authenticated
- `/{locale}/dashboard`
- `/{locale}/products`
- `/{locale}/products/new`
- `/{locale}/pre-launch`
- `/{locale}/tasks`
- `/{locale}/metrics`
- `/{locale}/growth`
- `/{locale}/integrations`
- `/{locale}/settings`
- `/{locale}/admin/waitlist`

### API
- `/api/auth/signup`
- `/api/waitlist/join`
- `/api/waitlist/[id]`
- `/api/products`
- `/api/checklist/[id]`
- `/api/actions`
- `/api/metrics`
- `/api/integrations`

---

## Local development

### Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

### Important local note
In this environment, **port 3000 may already be occupied**.
Next dev may automatically move to **3001**.

So always check the dev server output before testing in browser.

---

## Verification commands

```bash
npm run build
npm run lint
```

If local dev starts behaving strangely after many edits, clear Next cache and restart:

```bash
rm -rf .next
npm run dev
```

This project has already shown cache corruption / stale chunk issues during iterative Next dev sessions.

---

## Production

Current production is deployed on Vercel.

Primary public URL:

```txt
https://tramisup.vercel.app
```

---

## What is considered stable right now?

### Stable enough
- landing page
- waitlist modal
- early-access signup with code
- empty dashboard for first-time users
- first product creation entrypoint
- locale-aware navigation cleanup for key onboarding surfaces

### Still needs continued hardening
- deeper authenticated flows after wizard completion
- broader i18n coverage across all app surfaces
- more end-to-end test coverage for localized flows
- replacing static early-access code with a proper invite-code system
- reducing drift between README/HANDOFF and actual runtime behavior

---

## Immediate next priorities

1. Finish production smoke testing across the full onboarding path
2. Harden wizard submit → product created → dashboard follow-up flow
3. Replace static access code with managed invite codes
4. Continue gating or polishing incomplete inner surfaces
5. Expand i18n beyond landing/login/signup into the whole product

---

## Do not assume

This repo has a history of docs getting ahead of the actual product.

Treat runtime behavior as source of truth.
Use:
- build output
- production smoke tests
- route-by-route verification

before claiming a surface is done.
