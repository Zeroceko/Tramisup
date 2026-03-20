# Sprint 2 - Quick Test Run Guide

**For:** QA / Product Owner  
**Duration:** ~40 minutes  
**When:** After Sprint 2 development complete

---

## 🚀 QUICK START

```bash
# 1. Fresh environment
cd /path/to/project
npm run dev

# 2. Open browser
http://localhost:3001

# 3. Login with test user
# 4. Make sure test product has checklist items (mix of complete/incomplete)
```

---

## ✅ CRITICAL PATH TEST (20 min)

### Test Senaryosu: Launch Readiness → Task Creation Flow

**1. View Launch Readiness**
- Navigate to `/pre-launch`
- ✅ Overall launch score displays (percentage 0-100%)
- ✅ "Ready to Launch" status shows (YES/NO)
- ✅ 4 category scorecards display (Product, Marketing, Technical, Legal)

**2. Identify Blockers**
- Scroll to blocker summary section
- ✅ Blocker summary component shows
- ✅ Incomplete high-priority items listed
- ✅ Severity indicators visible (red/orange/yellow)
- ✅ Blocker count matches reality

**3. Create Task from Checklist Item**
- Find an incomplete checklist item
- Click "Create Task" button
- ✅ Task created (page refreshes)
- ✅ Button changes to "→ View Task"
- ✅ No console errors

**4. View Linked Task**
- Click "→ View Task" link
- ✅ Navigates to `/tasks` page
- ✅ Task appears in list
- ✅ Task has correct title (matches checklist item)
- ✅ Task has correct priority

**5. Verify Task Priority/Overdue**
- Create new task with due date = yesterday
- Refresh `/tasks` page
- ✅ Overdue task shows "OVERDUE" badge (red)
- ✅ Overdue task appears at top of list
- ✅ Task has colored left border (priority-based)

**6. Verify Launch Review Summary**
- Return to `/pre-launch`
- Check top section
- ✅ Launch Review Summary displays
- ✅ Overall score matches category scores
- ✅ Category breakdown shows progress bars
- ✅ Recommendations/Next Steps display (if not 100%)

---

## 🎨 VISUAL QA (10 min)

### Design Match Check

**Colors:**
- ✅ Primary turquoise: #95dbda (scorecard, progress bars)
- ✅ Pink CTA: #ffd7ef (if any buttons)
- ✅ Critical red: #ff4d4f (overdue, critical blockers)
- ✅ Warning orange: #ffa940 (high priority)
- ✅ Yellow: #fee74e (medium priority)

**Typography:**
- ✅ Launch score number: Large (48-60px), bold
- ✅ Headings: 20-28px, font-bold
- ✅ Body text: 13-15px, readable
- ✅ Labels: 11-12px, uppercase/tracking

**Layout:**
- ✅ Launch Review Summary at top (prominent)
- ✅ Category scorecards below (grid or stack)
- ✅ Blocker summary visible (not buried)
- ✅ Spacing consistent (16-24px gaps)
- ✅ Cards: 20px border-radius, shadow

**Compare with Figma (if available):**
- Open Figma design + browser side-by-side
- ✅ Overall match: >85%

---

## 🐛 ERROR TESTING (5 min)

**Test 1: Empty Checklist**
- Create new product (no checklist items)
- Go to `/pre-launch`
- ✅ Doesn't crash
- ✅ Shows 0% or empty state message
- ✅ No console errors

**Test 2: All Complete**
- Mark all checklist items complete
- Refresh `/pre-launch`
- ✅ Shows 100% score
- ✅ "Ready to Launch!" message
- ✅ Blocker summary shows 0 blockers

**Test 3: Task Creation Retry**
- Click "Create Task" twice rapidly
- ✅ Only one task created (no duplicates)
- ✅ Button disabled during creation or handles gracefully

---

## 📱 MOBILE TEST (3 min)

1. Resize browser to 375px width (iPhone SE)
2. Test `/pre-launch` page:
   - ✅ Launch score readable
   - ✅ Category scorecards stack vertically
   - ✅ Blocker summary readable
   - ✅ "Create Task" buttons accessible
   - ✅ No horizontal scroll

---

## 🔍 CONSOLE CHECK (2 min)

1. Open DevTools → Console
2. Navigate through app:
   - `/pre-launch`
   - Create task from checklist
   - `/tasks`
   - Back to `/pre-launch`
3. ✅ **No red errors**
4. Yellow warnings acceptable (note if critical)

---

## 🏗️ BUILD TEST (3 min)

```bash
npm run build
```

✅ Should complete without errors  
✅ No TypeScript errors  
✅ Check output for warnings  
✅ All routes compile

---

## ✅ PASS/FAIL CRITERIA

### ✅ PASS (Ship It!)
- [ ] Launch readiness score works
- [ ] Category scorecards display
- [ ] Blocker summary works
- [ ] Task creation from checklist works
- [ ] Task linkage displays ("→ View Task")
- [ ] Overdue tasks highlighted
- [ ] Launch review summary displays
- [ ] No critical console errors
- [ ] Build succeeds
- [ ] Mobile usable (basic)

### ❌ FAIL (Needs Fixes)
- [ ] Launch score doesn't calculate
- [ ] Can't create task from checklist
- [ ] Overdue tasks not visible
- [ ] Critical console errors
- [ ] Build fails
- [ ] Launch review summary missing

---

## 📋 QUICK CHECKLIST

**Core Functionality:**
- [ ] Launch score displays correctly
- [ ] 4 category scorecards work
- [ ] Blocker summary shows incomplete high-priority items
- [ ] "Create Task" button works
- [ ] Task linkage works ("→ View Task")
- [ ] Overdue tasks have OVERDUE badge
- [ ] Launch review summary displays

**Design:**
- [ ] Colors match design tokens
- [ ] Typography acceptable
- [ ] Overall visual quality >85%
- [ ] Mobile responsive (basic)

**Quality:**
- [ ] No console errors on critical path
- [ ] Build passes
- [ ] No obvious bugs

---

## 🚨 KNOWN ISSUES TO IGNORE

_(List any known non-critical issues during development)_

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

---

## ⏱️ TIME ESTIMATE

- **Critical Path:** 20 min
- **Visual QA:** 10 min
- **Error Testing:** 5 min
- **Mobile Test:** 3 min
- **Console Check:** 2 min
- **Build Test:** 3 min
- **Total:** ~43 minutes

---

## 🎯 NEXT STEPS

**If PASS:**
1. Mark Sprint 2 as complete
2. Update project status docs
3. Create sprint summary
4. Commit: "feat: Sprint 2 complete - Launch Operating System"
5. Move to Sprint 3 planning

**If FAIL:**
1. Document all bugs in TEST_CASES.md
2. Prioritize fixes
3. Developer fixes bugs
4. Retest after fixes
5. Repeat until PASS

---

**Tester:** _______________  
**Date:** _______________  
**Result:** [ ] PASS / [ ] FAIL  
**Notes:** _______________
