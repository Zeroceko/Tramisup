# Wizard → Figma Alignment Plan

**Model:** Haiku 4.5 (async)  
**Başlangıç:** 2026-03-20 23:30  
**Status:** 🔄 In Progress

---

## 📋 İş Listesi

### Phase 1: Pill Navigation Component
- [ ] **T01:** Pill navigation component oluştur
  - 7 pill button (step indicator)
  - Active pill: teal filled
  - Completed pills: teal outline + tıklanabilir
  - Future pills: gray disabled
  - Click handler: geri dön (goToStep)

- [ ] **T02:** Pill'lere onClick handler ekle
  - Tıklanan pill'in step'ine git
  - Validation: Sadece completed step'lere dön
  - State update: setStep(selectedStep)

### Phase 2: Border Radius & Visual Polish
- [ ] **T03:** Border radius güncellemeleri
  - Card: 12px → 20px
  - Inputs: 12px → 20px (consistent)
  - Buttons: 12px → 20px
  - Pills: 12px → 16px (pill-like)

- [ ] **T04:** Placeholder metinleri iyileştir
  - Step 1 name: "örn. TaskFlow, Notey…" → "Hangi sorunu çözüyorsunuz?"
  - Step 1 desc: "Ürünün ne yapıyor? Tek cümleyle anlat." → "Ürün açıklaması (örn. AI-powered task manager)"

### Phase 3: Testing & Verification
- [ ] **T05:** Pill navigation test
  - Pill click → step change
  - Completed pills tıklanabilir
  - Future pills disabled
  - Step label güncelleniyor

- [ ] **T06:** Visual verification
  - Figma vs canlı karşılaştırması
  - Border radius consistency
  - Colors (#95dbda, #e8e8e8, etc.)

- [ ] **T07:** Edge cases
  - Step 1'den geri dönüş (disabled)
  - Last step'ten ileri (disabled)
  - Data loss check (geri dönüp düzenledikten sonra)

---

## 🔧 Technical Details

### Current State
- Progress bar (ince çizgi)
- "step / 7" sayacı
- Linear next/back buttons
- No pill navigation

### Target State (Figma)
- Pill navigation (7 buttons)
- Active pill: filled teal
- Completed pills: outline + clickable
- Future pills: disabled gray
- Same linear flow (step-by-step)
- Border radius: 20px

### Implementation Notes
- Pills sadece **visual indicator + navigation** (geri dön)
- Logic değişmez (aynı step-by-step validation)
- Active pill her zaman filled teal
- Geçmiş pill'ler outline + tıklanabilir
- Gelecek pill'ler disabled gray

---

## 📊 Progress

| Task | Status | Notes |
|------|--------|-------|
| T01 | ⏳ Pending | Pill component |
| T02 | ⏳ Pending | Click handler |
| T03 | ⏳ Pending | Border radius |
| T04 | ⏳ Pending | Placeholders |
| T05 | ⏳ Pending | Navigation test |
| T06 | ⏳ Pending | Visual check |
| T07 | ⏳ Pending | Edge cases |

---

## 🚀 Next Step
Start with T01: Pill navigation component
