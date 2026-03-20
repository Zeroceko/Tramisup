# Sprint X - Quick Test Run Guide

**For:** QA / Product Owner  
**Duration:** ~30-45 minutes  
**When:** After Sprint X development complete

---

## 🚀 QUICK START

```bash
# 1. Fresh environment
cd /path/to/project
npm run dev

# 2. Open browser
http://localhost:3001

# 3. Clear cookies (DevTools → Application → Cookies → Clear)
```

---

## ✅ CRITICAL PATH TEST (15 min)

### Test Senaryosu: [Main User Journey]

**1. [Step 1 Title]**
- Action 1
- Action 2
- ✅ Expected outcome

**2. [Step 2 Title]**
- Action 1
- Action 2
- ✅ Expected outcome

**3. [Step 3 Title]**
- Action 1
- Action 2
- ✅ Expected outcome

**4. [Step 4 Title - Verification]**
- Verify X
- Verify Y
- ✅ Verify Z

---

## 🎨 VISUAL QA (10 min)

### Figma Comparison

**Open Figma:**
[Insert Figma URL]

**Compare [Feature]:**
1. Open feature in browser + Figma side-by-side
2. Check:
   - ✅ Colors match design system
   - ✅ Typography sizes/weights
   - ✅ Spacing consistent
   - ✅ Rounded corners correct
   - ✅ Overall feel: >85% match

**Screenshot Test:**
1. Take screenshot of [feature]
2. Compare with Figma
3. ✅ Visual diff <15%

---

## 🐛 ERROR TESTING (5 min)

**Test 1: [Error Scenario 1]**
- Trigger error condition
- ✅ Error message shown
- ✅ User can recover

**Test 2: [Error Scenario 2]**
- Step 1
- Step 2
- ✅ Expected behavior

**Test 3: Network Error (optional)**
- Action with network offline
- ✅ Error handling works
- ✅ Not stuck on loading

---

## 📱 MOBILE TEST (5 min)

1. Resize browser to 375px width (iPhone SE)
2. Test [feature]:
   - ✅ No horizontal scroll
   - ✅ All text readable
   - ✅ Buttons tappable
   - ✅ Forms usable

---

## 🔍 CONSOLE CHECK (2 min)

1. Open DevTools → Console
2. Navigate through app:
   - [Page 1]
   - [Page 2]
   - [Page 3]
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
- [ ] Critical path works
- [ ] Visual match to design >85%
- [ ] No console errors on happy path
- [ ] Build succeeds
- [ ] Mobile usable (basic test)
- [ ] Error handling works

### ❌ FAIL (Needs Fixes)
- [ ] Core feature broken
- [ ] Critical console errors
- [ ] Build fails
- [ ] Visual mismatch >30%
- [ ] [Sprint-specific critical failure]

---

## 📋 QUICK CHECKLIST

**Core Functionality:**
- [ ] [Feature 1] works
- [ ] [Feature 2] works
- [ ] [Feature 3] works
- [ ] [Integration] works

**Design:**
- [ ] Colors match design system
- [ ] Typography acceptable
- [ ] Overall visual quality >85%

**Quality:**
- [ ] No console errors
- [ ] Build passes
- [ ] Mobile responsive (basic)

---

## 🚨 KNOWN ISSUES TO IGNORE

_(List any known non-critical issues during development)_

- Issue 1 (deferred to Sprint X+1)
- Issue 2 (planned for future)

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
1. Mark Sprint X as complete
2. Update project status docs
3. Create sprint summary
4. Commit: "feat: Sprint X complete - [title]"
5. Move to Sprint X+1

**If FAIL:**
1. Document all bugs
2. Prioritize fixes
3. Developer fixes bugs
4. Retest after fixes
5. Repeat until PASS

---

**Tester:** _______________  
**Date:** _______________  
**Result:** [ ] PASS / [ ] FAIL  
**Notes:** _______________
