# Sprint Completion Prompts

Sprint bittiğinde AI agent'lara vereceğiniz prompt'lar.

---

## 📋 DEVELOPER TAMAMLADI → QA'YA GİDECEK

### Developer için Self-Test Prompt:

```
Sprint 1 development tamamlandı.

1. sprint-plans/sprint-1/QUICK_TEST.md dosyasını aç
2. "Critical Path Test" bölümünü kendin çalıştır
3. Tüm ✅ işaretler yeşil ise aşağıdaki checklist'i doldur

QA'ya göndermeden önce doğrula:
- [ ] 2 ürün oluşturabiliyorum
- [ ] Nav dropdown ile product switch yapabiliyorum
- [ ] Dashboard farklı ürünler için farklı data gösteriyor
- [ ] Console'da kırmızı error yok
- [ ] npm run build başarılı
- [ ] Visual Figma'ya benziyor (%80+)

Eğer hepsi ✅ ise:
- DEVELOPER_TASKS.md'deki tüm checkboxları [x] yap
- "Ready for QA" statusunu belirt
- Test sonuçlarını sprint-plans/sprint-1/SELF_TEST_RESULTS.md'ye yaz
```

---

## ✅ QA SMOKE TEST (HIZLI)

### QA için Quick Test Prompt:

```
Sprint 1 QA smoke test yapacağım.

1. sprint-plans/sprint-1/QUICK_TEST.md dosyasını aç ve sırayla uygula
2. Her test için Pass/Fail işaretle
3. Bug bulursan QUICK_TEST.md dosyasının sonuna ekle (BUG-XXX formatında)
4. Sonunda Pass/Fail kararı ver

Test süresi: ~40 dakika

Eğer PASS:
- QUICK_TEST.md'de "Result: PASS" yaz
- Tarih ve tester adını ekle
- Full regression'a geç (TEST_CASES.md)

Eğer FAIL:
- QUICK_TEST.md'de "Result: FAIL" yaz
- Bulunan bug'ları listele (priority ile)
- Developer'a geri gönder
```

---

## 🔬 QA FULL REGRESSION TEST

### QA için Full Test Prompt:

```
Sprint 1 full regression test yapacağım.

1. sprint-plans/sprint-1/TEST_CASES.md dosyasını aç
2. Test Suite 1'den başla, sırayla tüm test case'leri çalıştır
3. Her test için:
   - Steps'i takip et
   - Expected vs Actual karşılaştır
   - Pass/Fail checkbox'ını işaretle
   - Notes alanına bulguları yaz

4. Test Summary Report'u doldur:
   - Pass/Fail sayıları
   - Pass rate hesapla
   - Critical/High/Medium bug'ları listele

5. Acceptance Criteria kontrol et (en altta)

Test süresi: 2-3 saat

Sonuç:
- [ ] ACCEPTED (all critical ✅, high >90%)
- [ ] REJECTED (critical bugs var)

Sign-off:
- Tester adı, tarih
- Product Owner'a ilet
```

---

## 📊 SPRINT SUMMARY OLUŞTURMA

### Sprint Tamamlandığında Summary Prompt:

```
Sprint 1 tamamlandı ve QA sign-off alındı.

Sprint summary oluştur:

1. sprint-plans/sprint-1/ klasöründeki tüm dosyaları oku:
   - DEVELOPER_TASKS.md (ne yapıldı)
   - TEST_CASES.md (test sonuçları)
   - QUICK_TEST.md (smoke test)

2. Bu bilgilerle sprint-plans/sprint-1/SPRINT_SUMMARY.md oluştur:

**İçinde olmalı:**
- Sprint hedefi (Goal)
- Tamamlanan tasklar (Developer Tasks summary)
- Test sonuçları (Pass rate, bug count)
- Achievements (ne başarıldı)
- Challenges (ne zordu, neden)
- Lessons learned (ne öğrenildi)
- Technical debt (varsa)
- Metrics (build time, test coverage, bundle size)
- Screenshots (Before/After)
- Next sprint için notlar

Format: Markdown, professional, concise
```

---

## 📝 PROJEYI GÜNCELLEME (STATE/DOCS)

### Sprint Complete → Documentation Update Prompt:

```
Sprint 1 complete edildi. Proje dokümantasyonunu güncelle:

1. SPRINT_PLAN.md güncelle:
   - Sprint 1 taskları [x] işaretle
   - Verification checkboxları [x] işaretle
   - Sprint 1 status: ✅ Complete ekle

2. .gsd/STATE.md güncelle:
   - Current Focus: "Sprint 1 complete → Sprint 2 başlıyor"
   - What Exists Now: Sprint 1 özelliklerini ekle
   - Immediate Next Build Targets: Sprint 2 hedefleri

3. .gsd/PROJECT.md güncelle (eğer gerekli ise):
   - Product özellikleri listesine Sprint 1 features ekle
   - Tech stack güncelle (eğer değişiklik varsa)

4. .gsd/KNOWLEDGE.md güncelle (eğer yeni lesson öğrenildiyse):
   - Rules tablosuna ekle (K-XXX formatında)
   - Patterns tablosuna ekle (P-XXX formatında)
   - Lessons Learned tablosuna ekle (L-XXX formatında)

5. .gsd/DECISIONS.md güncelle (eğer architectural decision alındıysa):
   - Decision tablosuna ekle (D-XXX formatında)

Commit message: "docs: Sprint 1 complete - Product creation & design system"
```

---

## 🔄 GIT WORKFLOW

### Sprint Complete Git Commit Prompt:

```
Sprint 1 tamamlandı ve tüm testler geçti. Git commit hazırla:

1. Dosya durumunu kontrol et:
   git status
   
2. Sprint-specific dosyaları stage'le:
   git add sprint-plans/sprint-1/
   git add SPRINT_PLAN.md
   git add .gsd/STATE.md
   git add [sprint sırasında değişen source files]

3. Conventional commit message yaz:
   feat(sprint-1): Product creation wizard & multi-product context
   
   - ✅ 7-step onboarding wizard with Figma design
   - ✅ Product selector dropdown in nav
   - ✅ Active product context hook
   - ✅ Product-scoped queries (dashboard, metrics, growth, pre-launch)
   - ✅ Design system tokens aligned with Figma
   
   Tests: 44 test cases pass (100% critical, 95% high)
   QA Sign-off: [Name] on [Date]
   
   BREAKING CHANGE: None
   Closes: #[issue number if applicable]

4. Commit:
   git commit -m "[message above]"

5. Push:
   git push origin main
```

---

## 🎯 SPRINT TRANSITION

### Sprint X Complete → Sprint X+1 Planning Prompt:

```
Sprint 1 tamamlandı ve shipped. Sprint 2'ye geçiyoruz.

Sprint 2 planning hazırla:

1. Sprint 2 için klasör oluştur:
   mkdir -p sprint-plans/sprint-2

2. Template'leri kopyala:
   cp sprint-plans/sprint-template/TASKS.md sprint-plans/sprint-2/DEVELOPER_TASKS.md
   cp sprint-plans/sprint-template/TEST_CASES.md sprint-plans/sprint-2/TEST_CASES.md
   cp sprint-plans/sprint-template/QUICK_TEST.md sprint-plans/sprint-2/QUICK_TEST.md

3. SPRINT_PLAN.md'den Sprint 2 scope'unu oku:
   - Goal
   - Developer Tasks
   - Verification criteria

4. sprint-plans/sprint-2/DEVELOPER_TASKS.md'yi doldur:
   - Sprint 2'ye özel task'ları yaz
   - File path'leri ekle
   - Code snippet'ler hazırla
   - Figma referansları ekle

5. sprint-plans/sprint-2/TEST_CASES.md'yi doldur:
   - Sprint 2 features için test cases yaz
   - Critical path senaryoları
   - Edge case'ler

6. sprint-plans/sprint-2/QUICK_TEST.md'yi doldur:
   - Sprint 2 critical path test (~40 min)

7. Product Owner'a review için gönder

Delivery: 3 completed .md files in sprint-plans/sprint-2/
```

---

## 🐛 BUG FIX CYCLE

### Bug'lar Bulundu → Fix Prompt:

```
Sprint 1 QA'da bug'lar bulundu. Fix cycle başlat:

1. sprint-plans/sprint-1/TEST_CASES.md'deki "Critical Issues Found" bölümünü oku
2. Bug'ları priority'ye göre sırala (Critical → High → Medium → Low)
3. Her bug için:
   - Root cause analizi yap
   - Fix implementation planı yaz
   - Regression risk değerlendir

4. Critical ve High bug'ları fix et:
   - Code değişikliklerini yap
   - Test et (QUICK_TEST.md ile)
   - Commit: "fix(sprint-1): [bug description]"

5. QA'ya retest için gönder:
   - Fixed bug ID'lerini bildir
   - Değişen dosyaları listele
   - Regression test alanlarını belirt

Loop: QA retest → pass ise sprint complete, fail ise fix cycle tekrar
```

---

## 📸 SPRINT DEMO HAZIRLIĞI

### Sprint Review Meeting Hazırlık Prompt:

```
Sprint 1 review meeting için demo hazırlığı yap:

1. sprint-plans/sprint-1/SPRINT_SUMMARY.md oluştur (eğer yoksa)

2. Demo scenario yaz:
   - "Before Sprint 1" (nasıldı)
   - "After Sprint 1" (ne değişti)
   - Screenshots/video (Before/After)

3. Key achievements listele:
   - Feature 1 delivered ✅
   - Feature 2 delivered ✅
   - Design system aligned ✅
   - Test coverage: X%

4. Metrics hazırla:
   - Development time: X hours
   - Test pass rate: X%
   - Bug count: X (all fixed)
   - Code coverage: X%
   - Bundle size: before X KB → after Y KB

5. Live demo senaryosu:
   Step 1: [Show feature X]
   Step 2: [Show feature Y]
   Step 3: [Show feature Z]

6. Q&A hazırlığı:
   - Beklenebilecek sorular
   - Technical decisions rationale
   - Trade-offs made

Output: Sprint review presentation (Markdown or slides)
```

---

## 🎉 SPRINT CELEBRATION

### Team'e Sprint Complete Announcement Prompt:

```
Sprint 1 başarıyla tamamlandı! 🎉

Slack/email announcement hazırla:

---
🚀 Sprint 1 Complete: Product Creation & Understanding

Hey team! Sprint 1 shipped and tested. Here's what we delivered:

✅ **Features Shipped:**
- 7-step product onboarding wizard
- Multi-product support with context switching
- Product selector in navigation
- Figma-aligned design system

📊 **Metrics:**
- 44 test cases: 100% pass
- Build time: [X seconds]
- Bundle size: [X KB]
- Zero critical bugs

🎨 **Design:**
- Figma match: 90%+
- Turquoise + pink color system
- Responsive mobile support

🙏 **Shoutouts:**
- @Developer: Excellent implementation
- @Designer: Beautiful Figma specs
- @QA: Thorough testing

📝 **Sprint Summary:**
[Link to sprint-plans/sprint-1/SPRINT_SUMMARY.md]

🔜 **Next Up: Sprint 2 - Launch Operating System**
Starting next week!

---

Feel free to customize and send!
```

---

## 📁 PROMPT REFERANS TABLOSU

| Durum | Kimin İçin | Dosya | Prompt Adı |
|-------|-----------|-------|-----------|
| Dev tamamladı | Developer | QUICK_TEST.md | Self-Test Prompt |
| QA başlıyor | QA | QUICK_TEST.md | Quick Test Prompt |
| Smoke pass | QA | TEST_CASES.md | Full Regression Prompt |
| Tests complete | Product Owner | - | Sprint Summary Prompt |
| Sign-off alındı | Developer | .gsd/* | Documentation Update Prompt |
| Ready to merge | Developer | git | Git Commit Prompt |
| Sprint shipped | Team Lead | sprint-2/ | Sprint Transition Prompt |
| Bugs found | Developer | TEST_CASES.md | Bug Fix Cycle Prompt |
| Review meeting | Product Owner | SPRINT_SUMMARY.md | Demo Prep Prompt |
| All done | Team | Slack | Celebration Prompt |

---

## 💡 KULLANIM ÖRNEĞİ

**Sprint 1 bittiğinde sıra:**

1. **Developer:** "Self-Test Prompt" → QUICK_TEST.md → Pass ise "Ready for QA"
2. **QA:** "Quick Test Prompt" → 40 min → Pass ise "Full Regression"
3. **QA:** "Full Regression Prompt" → 2-3 saat → Sonuç: ACCEPT/REJECT
4. **If ACCEPT:**
   - PO: "Sprint Summary Prompt" → SPRINT_SUMMARY.md oluştur
   - Dev: "Documentation Update Prompt" → .gsd/* güncelle
   - Dev: "Git Commit Prompt" → Commit + push
   - Team Lead: "Sprint Transition Prompt" → Sprint 2 hazırla
   - Team Lead: "Celebration Prompt" → Team'e duyur 🎉
5. **If REJECT:**
   - Dev: "Bug Fix Cycle Prompt" → Fix → Retest → Loop

---

**Son Güncelleme:** 2026-03-20  
**Maintained By:** Product Team
