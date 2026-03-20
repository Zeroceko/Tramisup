# Sprint Plans - Tiramisup

Her sprint için organize edilmiş dökümanlar, görevler ve test case'leri.

---

## 📁 KLASÖR YAPISI

```
sprint-plans/
├── README.md                    # Bu dosya
├── sprint-template/             # Yeni sprint için template
│   ├── TASKS.md                 # Developer görevleri template
│   ├── TEST_CASES.md            # Detaylı test cases template
│   └── QUICK_TEST.md            # Hızlı smoke test template
├── sprint-1/                    # Sprint 1: Product Creation & Understanding
│   ├── DEVELOPER_TASKS.md       # ✅ Developer implementation guide
│   ├── TEST_CASES.md            # ✅ 44 comprehensive test cases
│   └── QUICK_TEST.md            # ✅ 40-min critical path test
├── sprint-2/                    # Sprint 2: Launch Operating System (upcoming)
├── sprint-3/                    # Sprint 3: Growth Readiness (upcoming)
└── ...
```

---

## 🎯 HER SPRINT İÇİN STANDART DOSYALAR

### 1. **DEVELOPER_TASKS.md**
**Kimler Kullanır:** Developer, Tech Lead  
**İçerik:**
- Sprint hedefi
- Öncelik sıralı görevler (Critical → High → Medium)
- Her task için:
  - Tam dosya path'leri
  - Code snippet'ler
  - Implementation notları
- Verification checklist
- Done criteria

**Örnek:** `sprint-plans/sprint-1/DEVELOPER_TASKS.md`

---

### 2. **TEST_CASES.md**
**Kimler Kullanır:** QA, Product Owner  
**İçerik:**
- Pre-test checklist (environment setup)
- Test suites (gruplandırılmış)
- Her test case:
  - TC-XXX ID
  - Priority (Critical 🔥 / High / Medium / Low)
  - User story
  - Preconditions
  - Steps (numbered)
  - Expected results (checkboxes)
  - Actual results (blank)
  - Pass/Fail checkbox
  - Notes field
- Test summary report template
- Acceptance criteria
- Sign-off section

**Örnek:** `sprint-plans/sprint-1/TEST_CASES.md` (44 test cases)

---

### 3. **QUICK_TEST.md**
**Kimler Kullanır:** Developer (self-test), QA (smoke test)  
**İçerik:**
- Quick start (environment setup)
- Critical path test (~15 min)
- Visual QA (~10 min)
- Error testing (~5 min)
- Mobile test (~5 min)
- Console check (~2 min)
- Build test (~3 min)
- Pass/Fail criteria
- Quick checklist
- Bug reporting format

**Örnek:** `sprint-plans/sprint-1/QUICK_TEST.md` (40-min test)

---

## 🔄 YENİ SPRINT BAŞLATMA SÜRECİ

### Adım 1: Klasör Oluştur
```bash
mkdir -p sprint-plans/sprint-X
```

### Adım 2: Template'leri Kopyala
```bash
cp sprint-plans/sprint-template/*.md sprint-plans/sprint-X/
```

### Adım 3: Dosyaları Doldur
- `TASKS.md` → Developer görevleri yaz
- `TEST_CASES.md` → Test senaryoları yaz
- `QUICK_TEST.md` → Critical path test yaz

### Adım 4: `SPRINT_PLAN.md` Güncelle
```markdown
## Sprint X - [Title]
### Goal
...
### Documentation
- Developer Tasks: `sprint-plans/sprint-X/TASKS.md`
- Test Cases: `sprint-plans/sprint-X/TEST_CASES.md`
- Quick Test: `sprint-plans/sprint-X/QUICK_TEST.md`
```

---

## 📊 SPRINT STATUS TRACKING

### Sprint 1: Product Creation & Understanding ✅
**Status:** Ready for Development  
**Files:**
- [Developer Tasks](./sprint-1/DEVELOPER_TASKS.md) - ✅ Complete
- [Test Cases](./sprint-1/TEST_CASES.md) - ✅ 44 tests ready
- [Quick Test](./sprint-1/QUICK_TEST.md) - ✅ 40-min test ready

**Next Action:** Developer executes tasks → QA tests → Sign-off

---

### Sprint 2: Launch Operating System 📝
**Status:** Planning  
**Files:** TBD

---

### Sprint 3: Growth Readiness 📝
**Status:** Not Started  
**Files:** TBD

---

## 🎯 KULLANIM KILAVUZU

### Developer İçin:
1. Sprint başında: `sprint-plans/sprint-X/DEVELOPER_TASKS.md` aç
2. Görevleri sırayla yap (Critical → High → Medium)
3. Her task sonrası verification yap
4. Tamamlandığında: `QUICK_TEST.md` kendini test et
5. Pass ise: QA'ya bildir

### QA İçin:
1. Developer "ready for test" dediğinde: `QUICK_TEST.md` ile başla (40 dk)
2. Quick test pass ederse: `TEST_CASES.md` full regression (2-3 saat)
3. Bug bulursan: Raporla, priority belirle
4. Developer fix edince: Retest
5. Tüm testler pass: Sign-off ver

### Product Owner İçin:
1. Sprint başlamadan: `DEVELOPER_TASKS.md` review et
2. QA testing sırasında: `TEST_CASES.md` takip et
3. Test complete: Acceptance criteria check et
4. Son karar: Sign-off ver veya reject et

---

## 📋 TEMPLATE KULLANIMI

### Yeni Sprint İçin Template Oluştur:

```bash
# Örnek: Sprint 4 başlatıyoruz
mkdir -p sprint-plans/sprint-4
cp sprint-plans/sprint-template/TASKS.md sprint-plans/sprint-4/DEVELOPER_TASKS.md
cp sprint-plans/sprint-template/TEST_CASES.md sprint-plans/sprint-4/TEST_CASES.md
cp sprint-plans/sprint-template/QUICK_TEST.md sprint-plans/sprint-4/QUICK_TEST.md

# Sonra dosyaları doldur:
# - Sprint number/title değiştir
# - Görevleri ekle
# - Test case'leri yaz
```

---

## ✅ STANDART SÜREÇ

```
1. PLAN
   └─ DEVELOPER_TASKS.md yaz
   └─ TEST_CASES.md yaz
   └─ QUICK_TEST.md yaz

2. DEVELOP
   └─ Developer: DEVELOPER_TASKS.md uygula
   └─ Developer: QUICK_TEST.md self-test
   └─ Developer: "Ready for QA"

3. TEST
   └─ QA: QUICK_TEST.md smoke test (40 dk)
   └─ QA: TEST_CASES.md full regression (2-3 saat)
   └─ QA: Bug report or Sign-off

4. SIGN-OFF
   └─ Product Owner: Acceptance criteria check
   └─ Product Owner: Final approval
   └─ Sprint complete ✅
```

---

## 🔍 DOSYA REFERANSLARI

### Sprint 1 (Completed Templates)
- **Developer Tasks:** [sprint-1/DEVELOPER_TASKS.md](./sprint-1/DEVELOPER_TASKS.md)
  - Phase 1: Critical tasks (product context)
  - Phase 2: Design alignment
  - File paths + code snippets included
  
- **Test Cases:** [sprint-1/TEST_CASES.md](./sprint-1/TEST_CASES.md)
  - 44 test cases across 8 suites
  - Critical 🔥 / High / Medium / Low priorities
  - Pass/Fail tracking
  
- **Quick Test:** [sprint-1/QUICK_TEST.md](./sprint-1/QUICK_TEST.md)
  - 40-minute smoke test
  - Critical path verification
  - Bug reporting format

### Templates (For Future Sprints)
- [sprint-template/TASKS.md](./sprint-template/TASKS.md)
- [sprint-template/TEST_CASES.md](./sprint-template/TEST_CASES.md)
- [sprint-template/QUICK_TEST.md](./sprint-template/QUICK_TEST.md)

---

## 📝 SPRINT TAMAMLANDI MI?

### Sprint Complete Checklist:
- [ ] `DEVELOPER_TASKS.md` - Tüm tasklar complete
- [ ] `QUICK_TEST.md` - Pass
- [ ] `TEST_CASES.md` - Critical tests %100 pass, High tests >90% pass
- [ ] No critical bugs
- [ ] Build passes
- [ ] Product Owner sign-off
- [ ] `SPRINT_PLAN.md` updated with ✅ checkmarks
- [ ] `.gsd/STATE.md` updated

**Sprint tamamlandığında:**
```bash
# GSD state güncelle
# SPRINT_PLAN.md'de checkmark'ları işaretle
# Commit: "feat: Sprint X complete - [title]"
```

---

## 🚀 NEXT SPRINT

Sprint 2 için hazır olunca:
1. `mkdir -p sprint-plans/sprint-2`
2. Template'leri kopyala
3. Sprint 2 görevlerini/testlerini yaz
4. Developer'a ilet

---

**Last Updated:** 2026-03-20  
**Maintained By:** Product Team  
**Sprint Cycle:** 1-2 weeks per sprint
