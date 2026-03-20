# Tiramisup Sprint Development Skill

**When to use:** Sprint planning, task breakdown, test case writing, sprint execution

---

## Overview

Tiramisup Sprint sistemi 3-aşamalı structured development cycle kullanır:
1. **Planning** - Sprint scope definition, task breakdown
2. **Development** - Phase-based implementation
3. **Testing** - QA verification + sign-off

---

## Sprint Structure

```
sprint-plans/
  sprint-X/
    ├── DEVELOPER_TASKS.md    # Developer implementation guide
    ├── TEST_CASES.md         # QA test suite (20+ test cases)
    └── QUICK_TEST.md         # 40-min critical path smoke test
```

---

## Sprint Workflow

### 1. Sprint Planning

**When:** Previous sprint complete, ready to start new work

**Steps:**
1. Review `SPRINT_PLAN.md` for next sprint scope
2. Create sprint folder: `sprint-plans/sprint-X/`
3. Copy templates from `sprint-plans/sprint-template/`
4. Fill in DEVELOPER_TASKS.md (from SPRINT_PLAN.md scope)
5. Fill in TEST_CASES.md (based on new features)
6. Fill in QUICK_TEST.md (critical path)

**AI Prompt:**
```
Sprint X planning complete, dosyaları doldur:

1. SPRINT_PLAN.md'den Sprint X scope'unu oku
2. sprint-plans/sprint-X/DEVELOPER_TASKS.md doldur (tasks + verification)
3. sprint-plans/sprint-X/TEST_CASES.md doldur (comprehensive test cases)
4. sprint-plans/sprint-X/QUICK_TEST.md doldur (critical path)

Template'leri kullan ama Sprint X'e özel yaz.
```

---

### 2. Development Phase

**When:** Sprint planned, tasks ready

**Developer Tasks Structure:**
- **Phase 1 (Critical):** Must-have features, priority order
- **Phase 2 (Optional):** Nice-to-have enhancements
- **Verification:** Self-test criteria after Phase 1

**Execution Order:**
1. Read documentation (SPRINT_PLAN.md, existing code)
2. Implement Phase 1 tasks (in order)
3. Self-test (QUICK_TEST.md)
4. Fix bugs
5. Phase 2 (if time allows)
6. Final test
7. Send to QA

**Code Patterns:**
- File paths specified for each task
- Code snippets provided
- Figma references included
- Verification criteria clear

---

### 3. QA Testing Phase

**When:** Development complete, self-tested

**QA Workflow:**
1. Run QUICK_TEST.md (40 min smoke test)
2. If pass → Run TEST_CASES.md (2-3 hours full suite)
3. If fail → Bug report, back to developer

**Test Case Format:**
```markdown
### TC-XXX: Test Name
**Priority:** Critical/High/Medium

**Steps:**
1. ...
2. ...

**Expected Results:**
- ✅ ...
- ✅ ...

**Actual Results:**
- [ ] Pass / [ ] Fail
**Notes:** ___
```

**Sign-Off Criteria:**
- [ ] All Critical tests pass (100%)
- [ ] High priority tests pass (>90%)
- [ ] No critical bugs
- [ ] Build passes
- [ ] Product Owner approves

---

## Templates

### DEVELOPER_TASKS.md Template:
```markdown
# Sprint X - [Sprint Name]

## 📁 ÖNCE BU DOSYALARI OKU
- SPRINT_PLAN.md
- [existing relevant files]

## 🔥 PHASE 1: CRITICAL TASKS

### Task 1: [Task Name]
**Dosya:** `path/to/file.tsx`
**İşlem:** [What to do]
**Code:** [Code snippet or reference]
**Verification:** [How to verify it works]

## ✅ VERIFICATION (Phase 1 Complete)
**Test Senaryosu:**
1. ...
2. ...

**Checklist:**
- [ ] Feature X works
- [ ] Build passes
- [ ] No console errors

## 📐 PHASE 2: OPTIONAL ENHANCEMENTS
[Nice-to-have features]
```

---

### TEST_CASES.md Template:
```markdown
# Sprint X - Test Cases

## 🎯 SPRINT X OBJECTIVES
- ✅ Objective 1
- ✅ Objective 2

## 📋 PRE-TEST CHECKLIST
- [ ] Database seeded
- [ ] Dev server running
- [ ] Build passes

## 🧪 TEST SUITE 1: [Suite Name]

### TC-XXX: [Test Name]
**Priority:** Critical/High/Medium
**User Story:** As a user, I want to...

**Steps:**
1. ...

**Expected Results:**
- ✅ ...

**Actual Results:**
- [ ] Pass / [ ] Fail
**Notes:** ___

## 📊 TEST SUMMARY REPORT
| Suite | Total | Pass | Fail | Pass Rate |
|-------|-------|------|------|-----------|
| 1. ... | X | ___ | ___ | __% |

## ✅ ACCEPTANCE CRITERIA
- [ ] All Critical tests pass
- [ ] Build passes
- [ ] Product Owner approves
```

---

### QUICK_TEST.md Template:
```markdown
# Sprint X - Quick Test Run Guide

**Duration:** ~40 minutes

## ✅ CRITICAL PATH TEST (20 min)
### Test Senaryosu: [Main User Flow]

**1. [Step 1]**
- ✅ [Check 1]
- ✅ [Check 2]

**2. [Step 2]**
- ✅ [Check 1]

## 🎨 VISUAL QA (10 min)
**Colors:**
- ✅ Primary: #95dbda
- ✅ Critical: #ff4d4f

## 🐛 ERROR TESTING (5 min)
**Test 1:** [Edge case]
- ✅ Doesn't crash

## 📱 MOBILE TEST (3 min)
- ✅ No horizontal scroll

## ✅ PASS/FAIL CRITERIA
- [ ] Critical path works
- [ ] Build succeeds
```

---

## Best Practices

### Planning Phase:
- ✅ Read SPRINT_PLAN.md scope carefully
- ✅ Break tasks into 1-2 hour chunks
- ✅ Include verification criteria for each task
- ✅ Write test cases BEFORE development starts
- ✅ Get Product Owner sign-off on scope

### Development Phase:
- ✅ Follow task order (dependencies matter)
- ✅ Self-test after Phase 1
- ✅ Fix bugs before moving to Phase 2
- ✅ Commit after each task
- ✅ Update docs if needed

### Testing Phase:
- ✅ Run QUICK_TEST first (smoke test)
- ✅ Document bugs clearly (steps to reproduce)
- ✅ Re-test after fixes
- ✅ Get Product Owner sign-off

---

## Common Pitfalls

### ❌ DON'T:
- Skip QUICK_TEST before full test suite
- Write vague test cases ("test feature X")
- Mark sprint complete without sign-off
- Move to Sprint X+1 with failing Sprint X tests
- Skip documentation updates

### ✅ DO:
- Keep tasks focused and small
- Include Figma references
- Write clear verification criteria
- Test on mobile
- Check console for errors

---

## Sprint States

### Planning:
```
sprint-plans/sprint-X/ created
Templates copied
DEVELOPER_TASKS.md filled
TEST_CASES.md filled
QUICK_TEST.md filled
```

### In Development:
```
Developer working on tasks
Phase 1 complete + self-tested
OR Phase 2 in progress
```

### In QA:
```
QUICK_TEST passed
TEST_CASES in progress
Bugs documented
```

### Complete:
```
All tests passed
Product Owner signed off
Docs updated
Ready for next sprint
```

---

## Example Sprint Flow

### Sprint 2 Example:

**Planning:**
```
1. Read SPRINT_PLAN.md Sprint 2 section
2. Create sprint-plans/sprint-2/
3. Fill DEVELOPER_TASKS.md (5 critical tasks)
4. Fill TEST_CASES.md (20 test cases, 7 suites)
5. Fill QUICK_TEST.md (43-min critical path)
```

**Development:**
```
1. Read SPRINT_PLAN.md + existing code
2. Task 1: Pre-launch page redesign → commit
3. Task 2: Blocker summary → commit
4. Task 3: Task linkage → commit
5. Task 4: Priority indicators → commit
6. Task 5: Launch review → commit
7. QUICK_TEST → fix bugs → re-test
8. Send to QA
```

**Testing:**
```
1. QA runs QUICK_TEST (43 min)
2. Pass → Full test suite (2-3 hours)
3. 2 bugs found → back to developer
4. Developer fixes → re-test
5. All pass → Product Owner sign-off
6. Sprint 2 complete!
```

---

## Resources

- Master plan: `SPRINT_PLAN.md`
- Templates: `sprint-plans/sprint-template/`
- Current sprint: `sprint-plans/sprint-X/`
- E2E tests: `tests/e2e/`

---

**Last Updated:** 2026-03-20
