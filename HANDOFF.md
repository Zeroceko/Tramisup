# Tiramisup - Handoff

**Last Updated:** 21 March 2026  
**Status:** Live MVP, onboarding path stabilized, deeper product hardening still in progress

---

## Executive summary

Tiramisup is now in a materially better state than the earlier "looks done but breaks on first use" phase.

The most important improvement is this:

- first-time users can move through the **public landing → waitlist / early-access signup → dashboard empty state → first product creation** path without immediately seeing fake seeded product data.

That was the right correction.

What is now true:
- landing page is live
- waitlist CTA is live
- early-access signup exists behind a static code
- signup no longer seeds fake product data automatically
- dashboard shows a safe empty state if the user has no product
- users can enter the product wizard from that empty state
- critical locale-aware route cleanup was applied to the main onboarding surfaces

What is not yet safely claimable:
- every inner product surface is polished enough for broad real-user use
- the entire post-wizard product lifecycle is fully hardened
- i18n is complete across all authenticated screens
- invite-code management is production-grade

---

## Current source-of-truth onboarding flow

### 1. Landing
Public localized landing page:
- `/tr`
- `/en`

Primary CTA opens waitlist modal.

### 2. Waitlist path
The waitlist modal allows:
- name
- email
- submit to `/api/waitlist/join`

The modal now also includes:
- **Erken erişim kodum var**

That link sends users to localized signup.

### 3. Early-access signup path
Route:
- `/{locale}/signup`

Current behavior:
- requires name, email, password, access code
- current static access code:

```txt
TT31623SEN
```

Signup endpoint:
- `/api/auth/signup`

Current behavior:
- validates code
- creates user
- **does not auto-create product**
- **does not auto-seed fake data**

This was a deliberate fix.

### 4. First authenticated dashboard state
Route:
- `/{locale}/dashboard`

If user has no product:
- clean empty state
- no fake metrics
- no fake tasks
- no fake readiness score
- CTA: **İlk ürününü oluştur**

### 5. Product creation
Entry:
- `/{locale}/products/new`

This is the main wizard for first real product setup.

---

## Most important architectural correction

### Removed behavior
Before this stabilization pass, signup did this:
- create user
- create default product
- seed checklist/tasks/metrics/goals/routines immediately

That produced a fake first-run experience.

### Current rule
Signup now:
- creates user only

Product data should start only after product creation.

This is the most important product-quality correction in the current state.

---

## Current production notes

Production URL:

```txt
https://tramisup.vercel.app
```

Vercel production deploys on pushes to `main`.

Recent stabilization work was pushed to `main` in multiple commits, including:
- fake signup seed removal
- early-access signup flow
- waitlist modal → signup link
- route gating / localized navigation stabilization
- empty dashboard state for users with no products

---

## Important project truths

### 1. Port behavior in local dev
In this machine, port `3000` may already be in use.
Next dev can auto-shift to `3001`.

Always inspect dev server output before running browser checks.

### 2. Next dev cache can lie
This project has already shown:
- stale chunks
- missing module errors inside `.next`
- broken dev runtime while `npm run build` still passes

If local dev behaves nonsensically:

```bash
rm -rf .next
npm run dev
```

Do this before chasing ghosts.

### 3. Docs historically drifted ahead of runtime
Do not trust old README/HANDOFF claims blindly.
Always verify with:
- build output
- local browser flow
- production browser flow
- actual routes in `app/[locale]`

---

## Files most relevant right now

### Public onboarding
- `app/[locale]/page.tsx`
- `components/WaitlistModal.tsx`
- `app/[locale]/signup/page.tsx`
- `app/api/waitlist/join/route.ts`
- `app/api/auth/signup/route.ts`

### Authenticated onboarding
- `app/[locale]/dashboard/page.tsx`
- `app/[locale]/products/new/page.tsx`
- `app/api/products/route.ts`

### Navigation / route safety
- `components/DashboardNav.tsx`
- `components/ProductSelector.tsx`
- `components/ChecklistSection.tsx`
- `app/[locale]/*/layout.tsx`

### Error fallback safety
- `app/global-error.tsx`
- `app/not-found.tsx`

---

## What was recently stabilized

### Route cleanup
Many links and redirects were still using non-locale paths like:
- `/dashboard`
- `/products/new`
- `/metrics`

Those were a major source of onboarding breakage after locale routing was introduced.

Critical route cleanup was applied across:
- dashboard entrypoints
- products page
- wizard redirects
- settings / metrics / growth / integrations / pre-launch layouts
- product selector
- checklist task links
- top nav gating logic

### Navigation gating
Top nav previously exposed inner surfaces even when the user had no product.
That led to broken or contextless flows.

Current approach:
- if no products exist, nav is reduced to safe surfaces
- user gets a direct first-product CTA instead of being encouraged into broken paths

---

## What still needs work

This is the real backlog, not the optimistic one.

### High priority
1. Verify production end-to-end onboarding again after each routing change
2. Harden post-wizard flow:
   - product creation
   - active product selection
   - dashboard after product exists
3. Replace static access code with proper invite-code management
4. Continue hiding or gating incomplete authenticated surfaces

### Medium priority
5. Expand i18n throughout authenticated app
6. Improve product selector / active product UX
7. Add stronger empty states to tasks, metrics, growth, integrations when product context is incomplete
8. Improve admin waitlist workflow

### Lower priority
9. SEO hardening
10. content polish
11. analytics / monitoring improvements

---

## Known compromises

### Static access code
The early-access flow currently uses a single static code:

```txt
TT31623SEN
```

This is acceptable as a temporary controlled-access mechanism.
It is not a proper invite system.

### Product readiness beyond onboarding
The first-run experience is much safer now, but not every authenticated area is product-polished yet.
The core rule should remain:
- prefer safe empty states and gated navigation
- do not show fake data to make screens look complete

---

## Recommended next working style

When continuing from here:

1. Start with `npm run build`
2. Start dev server and confirm actual port
3. Smoke test these routes in browser:
   - `/{locale}`
   - `/{locale}/signup`
   - `/{locale}/dashboard`
   - `/{locale}/products/new`
4. Only after the onboarding spine is green, continue deeper product work

Do not expand feature surface until the onboarding spine stays stable.

---

## Practical smoke checklist

### Public
- landing loads
- waitlist modal opens
- waitlist submit works
- waitlist thank-you works
- modal link to signup works

### Early access
- signup loads
- access code field visible
- `TT31623SEN` works
- login works

### First-time user
- dashboard empty state appears
- no fake seeded product data shown
- first product CTA works
- wizard opens

### After product creation
- localized redirect works
- active product context is set
- inner nav does not immediately break

---

## Bottom line

The project is no longer in the most dangerous state.
The onboarding path has been substantially stabilized.

But it still needs continued hardening before it deserves the label "fully product-ready."

The correct posture is:
- ship carefully
- verify constantly
- prefer safe states over fake completeness
- keep onboarding sacred
