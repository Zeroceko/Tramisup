# Sprint 1 - Quick Test Run Guide

**For:** QA / Product Owner  
**Duration:** ~30-45 minutes  
**When:** After Sprint 1 development complete

---

## 🚀 QUICK START

```bash
# 1. Fresh environment
cd /Users/ozer/Desktop/Özer\ KOD\ YAZDIRIYOR/Tiramisup
npm run dev

# 2. Open browser
http://localhost:3001

# 3. Clear cookies (DevTools → Application → Cookies → Clear)
```

---

## ✅ CRITICAL PATH TEST (15 min)

### Test Senaryosu: İki Ürün Oluştur ve Aralarında Geçiş Yap

**1. Signup / Login**
- Navigate to `/signup`
- Create account: `test@example.com` / `password123`
- Should redirect to dashboard

**2. Create First Product (Product A)**
- Navigate to `/products/new`
- **Step 1:** Name: "SaaS Uygulamam", Description: "Proje yönetim aracı"
- **Step 2:** Category: SaaS
- **Step 3:** Audience: Developers
- **Step 4:** Model: Subscription
- **Step 5:** Goals: Select 2-3 goals
- **Step 6:** Website: https://example.com (or skip)
- **Step 7:** Review → Click "Ürünü Oluştur 🚀"
- ✅ Should redirect to dashboard
- ✅ Check: Dashboard shows data (goals, metrics, checklist)

**3. Create Second Product (Product B)**
- Navigate to `/products/new` again
- **Step 1:** Name: "E-Ticaret Mağazam", Description: "Online satış platformu"
- **Step 2:** Category: E-commerce
- **Step 3:** Audience: Small Business
- **Step 4:** Model: One-time
- **Step 5:** Goals: Different from Product A
- **Step 6:** Skip
- **Step 7:** Review → Click "Ürünü Oluştur 🚀"
- ✅ Should redirect to dashboard with Product B data

**4. Verify Product List**
- Navigate to `/products`
- ✅ Should see 2 product cards:
  - "SaaS Uygulamam"
  - "E-Ticaret Mağazam"
- ✅ Each card has status badge (PRE_LAUNCH)

**5. Product Switching via Nav Dropdown**
- Look at navigation bar
- ✅ Product selector dropdown visible
- ✅ Shows current product: "E-Ticaret Mağazam"
- Click dropdown
- ✅ Shows both products in list
- Select "SaaS Uygulamam"
- ✅ Page refreshes
- ✅ Nav now shows "SaaS Uygulamam"
- ✅ Dashboard content changes (different metrics/goals)

**6. Verify Product Context Switching**
- With "SaaS Uygulamam" active:
  - Go to `/metrics` → should show Product A metrics
  - Go to `/growth` → should show Product A goals
  - Go to `/pre-launch` → should show Product A checklist
- Switch to "E-Ticaret Mağazam" via nav dropdown
- Repeat:
  - Go to `/metrics` → should show Product B metrics
  - Go to `/growth` → should show Product B goals
  - ✅ **No data from Product A should appear**

---

## 🎨 VISUAL QA (10 min)

### Figma Comparison

**Open Figma:**
https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso

**Compare Wizard:**
1. Open wizard in browser + Figma side-by-side
2. Check:
   - ✅ Colors: Turquoise primary (#95dbda), Pink CTA (#ffd7ef)
   - ✅ Rounded corners: Cards 20px, Inputs 12px
   - ✅ Progress bar matches
   - ✅ Typography sizes/weights
   - ✅ Radio/checkbox styling
   - ✅ Overall feel: >85% match

**Compare Dashboard:**
1. Open dashboard in browser + Figma
2. Check:
   - ✅ Layout similar
   - ✅ Color scheme consistent
   - ✅ Cards have shadows
   - ✅ Buttons use pink (#ffd7ef)

**Screenshot Test:**
1. Take screenshot of wizard Step 1
2. Overlay with Figma export (using image editor or eyes)
3. ✅ Visual diff <15%

---

## 🐛 ERROR TESTING (5 min)

**Test 1: Validation**
- Start wizard
- On Step 1, leave name empty
- Try to click "Devam Et"
- ✅ Button should be disabled (gray)
- ✅ Error message shown

**Test 2: Back Navigation**
- Complete Step 1-2
- Click "Geri" on Step 2
- ✅ Returns to Step 1
- ✅ Previously entered data still there

**Test 3: Network Error (optional)**
- Fill wizard to Step 7
- Open DevTools → Network → Set to "Offline"
- Click "Ürünü Oluştur"
- ✅ Error message shown
- ✅ Not stuck on loading

---

## 📱 MOBILE TEST (5 min)

1. Resize browser to 375px width (iPhone SE)
2. Test wizard:
   - ✅ No horizontal scroll
   - ✅ All text readable
   - ✅ Buttons tappable (not too small)
   - ✅ Forms usable
3. Test product selector dropdown:
   - ✅ Opens correctly
   - ✅ Can select products

---

## 🔍 CONSOLE CHECK (2 min)

1. Open DevTools → Console
2. Navigate through app:
   - Dashboard
   - Wizard
   - Products list
   - Metrics
   - Growth
3. ✅ **No red errors**
4. Yellow warnings acceptable (document if critical)

---

## 🏗️ BUILD TEST (3 min)

```bash
npm run build
```

✅ Should complete without errors  
✅ No TypeScript errors  
✅ Check output for warnings

---

## ✅ PASS/FAIL CRITERIA

### ✅ PASS (Ship It!)
- [ ] Critical path works (2 products created, switched, data correct)
- [ ] Visual match to Figma >85%
- [ ] No console errors on happy path
- [ ] Build succeeds
- [ ] Mobile usable (basic test)
- [ ] Form validation works

### ❌ FAIL (Needs Fixes)
- [ ] Cannot create product (wizard broken)
- [ ] Product switching doesn't work
- [ ] Data shows from wrong product (data leakage)
- [ ] Build fails
- [ ] Critical console errors
- [ ] Visual mismatch >30%

---

## 📋 QUICK CHECKLIST

**Core Functionality:**
- [ ] Create first product via wizard
- [ ] Create second product via wizard
- [ ] View product list (both products shown)
- [ ] Nav dropdown shows products
- [ ] Switch product via dropdown
- [ ] Dashboard updates with correct data
- [ ] Metrics page filtered by product
- [ ] Growth page filtered by product
- [ ] Cookie `activeProductId` set correctly

**Design:**
- [ ] Colors match Figma (turquoise + pink)
- [ ] Typography acceptable
- [ ] Rounded corners (cards/inputs)
- [ ] Progress bar styling
- [ ] Overall visual quality >85%

**Quality:**
- [ ] No console errors
- [ ] Build passes
- [ ] Form validation works
- [ ] Mobile responsive (basic)

---

## 🚨 KNOWN ISSUES TO IGNORE

_(List any known non-critical issues here during development)_

- Landing page not updated (deferred)
- Team invites placeholder (Sprint 10)
- _______________

---

## 📝 REPORT BUGS HERE

**Format:**
```
BUG-XXX: [Title]
Steps: 1. ... 2. ... 3. ...
Expected: ...
Actual: ...
Priority: Critical / High / Medium / Low
Screenshot: [attach if visual]
```

**Example:**
```
BUG-001: Product switcher doesn't update metrics
Steps: 1. Create 2 products, 2. Switch via dropdown, 3. Go to /metrics
Expected: Metrics filtered by new product
Actual: Still shows old product metrics
Priority: Critical
```

---

## ⏱️ TIME ESTIMATE

- **Critical Path:** 15 min
- **Visual QA:** 10 min
- **Error Testing:** 5 min
- **Mobile Test:** 5 min
- **Console Check:** 2 min
- **Build Test:** 3 min
- **Total:** ~40 minutes

---

## 🎯 NEXT STEPS

**If PASS:**
1. Mark Sprint 1 as complete in `SPRINT_PLAN.md`
2. Update `.gsd/STATE.md`
3. Create Sprint 1 summary in `.gsd/milestones/M001/slices/S01/S01-SUMMARY.md`
4. Commit: "feat: Sprint 1 complete - Product creation & design system"
5. Deploy to staging (if applicable)
6. Move to Sprint 2

**If FAIL:**
1. Document all bugs in `SPRINT_1_TEST_CASES.md`
2. Prioritize fixes (Critical → High → Medium)
3. Developer fixes bugs
4. Retest after fixes
5. Repeat until PASS

---

**Tester:** _______________  
**Date:** _______________  
**Result:** [ ] PASS / [ ] FAIL  
**Notes:** _______________
