# Sprint Plans - Quick Navigation

Hızlı erişim için ana dosyalar.

---

## 📚 ANA DOKÜMANTASYON

- **[Sprint Plans Overview](./README.md)** - Klasör yapısı, standart süreç, kullanım kılavuzu
- **[Sprint Completion Prompts](./SPRINT_COMPLETION_PROMPTS.md)** - Sprint bittiğinde kullanılacak AI agent prompt'ları

---

## 🎯 AKTİF SPRINT (Sprint 1)

### Developer
- **[Developer Tasks](./sprint-1/DEVELOPER_TASKS.md)** - ✅ Implementation guide (Phase 1 + 2)
  - Product list, selector, context
  - Design alignment
  - File paths + code snippets

### QA
- **[Quick Test](./sprint-1/QUICK_TEST.md)** - ⚡ 40-minute smoke test
  - Critical path verification
  - Visual QA
  - Pass/Fail criteria
  
- **[Test Cases](./sprint-1/TEST_CASES.md)** - 📋 44 comprehensive test cases
  - 8 test suites
  - Acceptance criteria
  - Sign-off template

---

## 📋 TEMPLATES (Yeni Sprint İçin)

- **[Task Template](./sprint-template/TASKS.md)** - Developer görevleri template
- **[Test Cases Template](./sprint-template/TEST_CASES.md)** - Test cases template
- **[Quick Test Template](./sprint-template/QUICK_TEST.md)** - Smoke test template

---

## 🚀 HIZLI BAŞLANGIÇ

### Yeni Sprint Başlatma:
```bash
mkdir -p sprint-plans/sprint-X
cp sprint-plans/sprint-template/*.md sprint-plans/sprint-X/
# Dosyaları doldur, Sprint X'e göre özelleştir
```

### Sprint Complete Workflow:
1. Developer → [Self-Test Prompt](./SPRINT_COMPLETION_PROMPTS.md#developer-tamamladi--qaya-gidecek)
2. QA → [Quick Test Prompt](./SPRINT_COMPLETION_PROMPTS.md#-qa-smoke-test-hizli)
3. QA → [Full Regression Prompt](./SPRINT_COMPLETION_PROMPTS.md#-qa-full-regression-test)
4. Sign-off → [Documentation Update Prompt](./SPRINT_COMPLETION_PROMPTS.md#-projeyi-guncelleme-statedocs)

---

## 📊 SPRINT STATUS

| Sprint | Status | Developer Tasks | Test Cases | Quick Test |
|--------|--------|----------------|-----------|-----------|
| Sprint 1 | 🔄 In Progress | [✅](./sprint-1/DEVELOPER_TASKS.md) | [✅](./sprint-1/TEST_CASES.md) | [✅](./sprint-1/QUICK_TEST.md) |
| Sprint 2 | 📝 Planning | TBD | TBD | TBD |
| Sprint 3 | ⏳ Pending | - | - | - |

---

## 🎯 SIK KULLANILAN PROMPT'LAR

### Developer Bitti → QA'ya Gönderme
```
sprint-plans/sprint-1/QUICK_TEST.md dosyasını aç ve self-test yap.
Pass ise "Ready for QA" statusunu belirt.
```

### QA Smoke Test
```
sprint-plans/sprint-1/QUICK_TEST.md dosyasını aç ve 40-dakikalık 
critical path test'i çalıştır. Pass/Fail karar ver.
```

### QA Full Regression
```
sprint-plans/sprint-1/TEST_CASES.md dosyasını aç ve tüm 44 test 
case'i çalıştır. Test summary report doldur, sign-off ver.
```

### Sprint Complete → Docs Update
```
Sprint 1 complete edildi. SPRINT_PLAN.md, .gsd/STATE.md, 
.gsd/PROJECT.md dosyalarını güncelle. Commit hazırla.
```

---

## 📞 YARDIM

Sorun mu var? Bu dosyaları kontrol et:

1. **[README.md](./README.md)** - Genel yapı ve kullanım
2. **[SPRINT_COMPLETION_PROMPTS.md](./SPRINT_COMPLETION_PROMPTS.md)** - Tüm prompt'lar
3. **Sprint 1 files** - Working examples

---

**Son Güncelleme:** 2026-03-20  
**Proje:** Tiramisup  
**Sprint Cycle:** 1-2 weeks
