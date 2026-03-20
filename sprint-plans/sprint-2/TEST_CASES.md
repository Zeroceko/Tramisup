# Sprint 2 - Test Cases & Acceptance Criteria

**Sprint:** Launch Operating System  
**Test Date:** TBD (Sprint 2 tamamlandıktan sonra)  
**Tester:** QA / Product Owner  
**Environment:** `http://localhost:3001`

---

## 🎯 SPRINT 2 OBJECTIVES

- ✅ Launch readiness'i category-based scorecard sistemine dönüştürmek
- ✅ Blocker'ları extract edip visibility artırmak
- ✅ Checklist item'lardan task oluşturabilmek
- ✅ Task priority ve overdue durumunu görünür kılmak
- ✅ Launch review summary eklemek

---

## 📋 PRE-TEST CHECKLIST

### Environment Setup
- [ ] Database seeded with test product + checklist items
- [ ] Dev server running on `http://localhost:3001`
- [ ] Build passes (`npm run build`)
- [ ] No TypeScript errors
- [ ] Browser: Chrome/Safari (latest)
- [ ] Clear cookies before starting
- [ ] Login with test user

### Test Data
- [ ] Test product with incomplete checklist items
- [ ] At least 2 high-priority incomplete items (blockers)
- [ ] Mix of completed/incomplete items across categories
- [ ] At least one task with overdue date

---

## 🧪 TEST SUITE 1: LAUNCH READINESS SCORECARD

### TC-001: Overall Launch Score Displays
**Priority:** Critical 🔥  
**User Story:** As a user, I want to see my overall launch readiness score.

**Preconditions:**
- User logged in
- Product with checklist items exists

**Steps:**
1. Navigate to `/pre-launch`
2. Observe overall score card at top

**Expected Results:**
- ✅ Overall score displays as percentage (0-100%)
- ✅ Score is calculated correctly (completed / total items)
- ✅ "Ready to Launch" status shows (YES if 100%, NO otherwise)
- ✅ Visual design matches Figma (large number, turquoise color)

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-002: Category Scorecards Render
**Priority:** Critical 🔥

**Steps:**
1. On `/pre-launch` page
2. Scroll down to category sections

**Expected Results:**
- ✅ 4 categories display: Product, Marketing, Technical, Legal
- ✅ Each category shows: completed/total count, percentage
- ✅ Each category has status: READY/IN_PROGRESS/BLOCKED
- ✅ Checklist items grouped under correct category

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-003: Category Score Calculation
**Priority:** High

**Preconditions:**
- Product category: 2/5 items complete
- Marketing category: 0/3 items complete

**Steps:**
1. View category scorecards
2. Verify percentages

**Expected Results:**
- ✅ Product: 40% (2/5)
- ✅ Marketing: 0% (0/3)
- ✅ Overall score reflects all categories

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Calculated Scores:** Product: ___%, Marketing: ___%  
**Notes:** _______________

---

## 🧪 TEST SUITE 2: BLOCKER EXTRACTION & VISIBILITY

### TC-010: Blocker Summary Displays
**Priority:** Critical 🔥  
**User Story:** As a user, I want to see what's blocking my launch.

**Preconditions:**
- At least 2 incomplete HIGH priority checklist items

**Steps:**
1. Navigate to `/pre-launch`
2. Find "Blockers" section

**Expected Results:**
- ✅ Blocker summary component renders
- ✅ Shows incomplete + high-priority items
- ✅ Each blocker shows: title, category, severity
- ✅ Critical blockers appear first (sorted by severity)

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Blocker Count:** ___  
**Notes:** _______________

---

### TC-011: Blocker Severity Visual
**Priority:** High

**Preconditions:**
- Mix of CRITICAL, HIGH, MEDIUM blockers

**Steps:**
1. View blocker summary
2. Observe visual indicators

**Expected Results:**
- ✅ CRITICAL: Red border/background (#ff4d4f)
- ✅ HIGH: Orange/pink border (#ffd7ef)
- ✅ MEDIUM: Yellow border (#fee74e)
- ✅ Visual hierarchy clear

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

## 🧪 TEST SUITE 3: TASK LINKAGE (CHECKLIST → TASK)

### TC-020: Create Task from Checklist Item
**Priority:** Critical 🔥  
**User Story:** As a user, I want to create a task from an incomplete checklist item.

**Preconditions:**
- Incomplete checklist item with no linked task

**Steps:**
1. On `/pre-launch` page
2. Find incomplete checklist item
3. Click "Create Task" button
4. Wait for action to complete

**Expected Results:**
- ✅ "Create Task" button visible on incomplete items
- ✅ Task created successfully
- ✅ Page refreshes/revalidates
- ✅ Button changes to "→ View Task" link

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Task ID:** _______________  
**Notes:** _______________

---

### TC-021: View Linked Task
**Priority:** High

**Preconditions:**
- Checklist item with linked task

**Steps:**
1. Find checklist item with "→ View Task" link
2. Click link

**Expected Results:**
- ✅ Navigates to `/tasks` page
- ✅ Linked task is highlighted/scrolled into view
- ✅ Task title matches checklist item title

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-022: Task Properties from Checklist
**Priority:** High

**Preconditions:**
- Create task from checklist item

**Steps:**
1. Create task from high-priority Product category item
2. Navigate to `/tasks`
3. Find created task
4. Verify properties

**Expected Results:**
- ✅ Task title = checklist item title
- ✅ Task category = "PRE_LAUNCH"
- ✅ Task priority = checklist item priority
- ✅ Task status = "TODO"
- ✅ Task description includes checklist reference

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Task Properties:** _______________  
**Notes:** _______________

---

## 🧪 TEST SUITE 4: TASK PRIORITY & OVERDUE VISIBILITY

### TC-030: Task Priority Visual Indicators
**Priority:** High  
**User Story:** As a user, I want to quickly identify high-priority tasks.

**Preconditions:**
- Tasks with different priorities: CRITICAL, HIGH, MEDIUM, LOW

**Steps:**
1. Navigate to `/tasks` page
2. Observe task cards

**Expected Results:**
- ✅ CRITICAL: Red left border (#ff4d4f)
- ✅ HIGH: Orange left border (#ff7a45)
- ✅ MEDIUM: Yellow left border (#ffa940)
- ✅ LOW: Gray left border (#d9d9d9)
- ✅ Background color matches priority

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-031: Overdue Task Indicator
**Priority:** Critical 🔥

**Preconditions:**
- Create task with due date in the past (yesterday)

**Steps:**
1. Create task: title "Test Overdue", due date = yesterday
2. Navigate to `/tasks`
3. Find task

**Expected Results:**
- ✅ "OVERDUE" badge displays (red background)
- ✅ Due date text is red
- ✅ Task appears at top of list (sorted)

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Badge Displayed:** Yes / No  
**Notes:** _______________

---

### TC-032: Task Sorting Order
**Priority:** High

**Preconditions:**
- Mix of overdue/not overdue, different priorities

**Steps:**
1. View `/tasks` page
2. Observe task order

**Expected Results:**
- ✅ Order: Overdue+Critical → Overdue+High → Critical → High → Medium → Low
- ✅ Overdue tasks always appear first within priority

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Observed Order:** _______________  
**Notes:** _______________

---

## 🧪 TEST SUITE 5: LAUNCH REVIEW SUMMARY

### TC-040: Launch Review Summary Displays
**Priority:** Critical 🔥  
**User Story:** As a user, I want a summary view of my launch readiness.

**Preconditions:**
- Product with partial checklist completion

**Steps:**
1. Navigate to `/pre-launch`
2. Find "Launch Review" summary at top

**Expected Results:**
- ✅ Overall score percentage displays (large, bold)
- ✅ "Ready to Launch" status: YES/NO
- ✅ Blocker count shows
- ✅ Category breakdown displays (4 categories with percentages)

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Overall Score:** ___%  
**Ready to Launch:** Yes / No  
**Notes:** _______________

---

### TC-041: Category Breakdown in Review
**Priority:** High

**Steps:**
1. View Launch Review Summary
2. Observe category breakdown section

**Expected Results:**
- ✅ Each category shows progress bar
- ✅ Progress bar color: turquoise (#95dbda)
- ✅ Progress bar width matches percentage
- ✅ Percentage label displays next to bar

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-042: Launch Recommendations
**Priority:** Medium

**Preconditions:**
- Incomplete checklist items

**Steps:**
1. View Launch Review Summary
2. Find "Next Steps" section

**Expected Results:**
- ✅ Recommendations display if not 100% ready
- ✅ Recommendations are actionable (e.g. "Complete Product category items")
- ✅ Maximum 3-5 recommendations shown

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Recommendations:** _______________  
**Notes:** _______________

---

## 🧪 TEST SUITE 6: ERROR HANDLING & EDGE CASES

### TC-050: Empty Checklist State
**Priority:** Medium

**Preconditions:**
- Product with no checklist items

**Steps:**
1. Navigate to `/pre-launch`

**Expected Results:**
- ✅ Overall score: 0% or "No checklist items"
- ✅ Empty state message displays
- ✅ Prompts user to create checklist items
- ✅ No console errors

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-051: All Items Complete
**Priority:** High

**Preconditions:**
- All checklist items marked complete

**Steps:**
1. Navigate to `/pre-launch`

**Expected Results:**
- ✅ Overall score: 100%
- ✅ "Ready to Launch!" message
- ✅ All categories: READY status
- ✅ Blocker summary shows 0 blockers
- ✅ Celebration UI (confetti/checkmark)

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Notes:** _______________

---

### TC-052: Task Creation Error Handling
**Priority:** High

**Preconditions:**
- Simulate error (e.g., database down)

**Steps:**
1. Try creating task from checklist item
2. Observe error handling

**Expected Results:**
- ✅ Error message displays to user
- ✅ Button doesn't disappear (can retry)
- ✅ No duplicate tasks created
- ✅ Error logged to console

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Error Message:** _______________  
**Notes:** _______________

---

## 🧪 TEST SUITE 7: PERFORMANCE & BUILD

### TC-060: Build Succeeds
**Priority:** Critical 🔥

**Steps:**
1. Run `npm run build`

**Expected Results:**
- ✅ Build completes without errors
- ✅ No TypeScript errors
- ✅ All pages compile successfully
- ✅ Bundle size reasonable

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Build Time:** _____ seconds  
**Errors:** _______________  
**Notes:** _______________

---

### TC-061: No Console Errors
**Priority:** High

**Steps:**
1. Navigate through app: /pre-launch, /tasks, /products
2. Create task from checklist
3. Check browser console

**Expected Results:**
- ✅ No red console errors on any page
- ✅ No React hydration errors
- ✅ No missing key warnings

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Console Errors:** _______________

---

### TC-062: Page Load Performance
**Priority:** Medium

**Steps:**
1. Open `/pre-launch` with 20+ checklist items
2. Measure load time

**Expected Results:**
- ✅ Initial render <2 seconds
- ✅ Smooth scrolling
- ✅ No layout shifts

**Actual Results:**
- [ ] Pass / [ ] Fail  
**Load Time:** _____ seconds  
**Notes:** _______________

---

## 📊 TEST SUMMARY REPORT

### Test Execution Summary

| Suite | Total | Pass | Fail | Skip | Pass Rate |
|-------|-------|------|------|------|-----------|
| 1. Launch Scorecard | 3 | ___ | ___ | ___ | __% |
| 2. Blocker Summary | 2 | ___ | ___ | ___ | __% |
| 3. Task Linkage | 3 | ___ | ___ | ___ | __% |
| 4. Priority/Overdue | 3 | ___ | ___ | ___ | __% |
| 5. Launch Review | 3 | ___ | ___ | ___ | __% |
| 6. Error Handling | 3 | ___ | ___ | ___ | __% |
| 7. Performance | 3 | ___ | ___ | ___ | __% |
| **TOTAL** | **20** | ___ | ___ | ___ | __% |

### Critical Issues Found
_(List any critical bugs that block release)_

1. _______________
2. _______________

### High Priority Issues
_(List high-priority bugs)_

1. _______________
2. _______________

### Medium/Low Priority Issues
_(List non-blocking issues)_

1. _______________
2. _______________

---

## ✅ ACCEPTANCE CRITERIA (Sprint 2 Sign-Off)

Sprint 2 is **ACCEPTED** when:

- [ ] All Critical tests (🔥) pass (100%)
- [ ] High priority tests pass (>90%)
- [ ] No critical bugs blocking release
- [ ] Build passes without errors
- [ ] User can see launch readiness score
- [ ] User can identify blockers
- [ ] User can create task from checklist item
- [ ] User can see overdue tasks
- [ ] Launch review summary works
- [ ] Product Owner approves

**Sprint 2 Status:** [ ] ACCEPTED / [ ] REJECTED

**Tested By:** _______________  
**Date:** _______________  
**Sign-Off:** _______________

---

## 📝 TESTING NOTES

### Environment Info
- **OS:** _______________
- **Browser:** _______________
- **Screen Resolution:** _______________

### Known Issues (Not Blockers)
- _______________

### Recommendations for Next Sprint
- _______________

---

## 🔄 RETEST AFTER FIXES

- [ ] All failed test cases re-executed
- [ ] Regression testing on related features
- [ ] Build/deployment tested
- [ ] Final sign-off obtained

---

**Last Updated:** [Date]  
**Document Version:** 1.0  
**Sprint:** Sprint 2 - Launch Operating System
