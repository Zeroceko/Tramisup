# 🔍 Figma vs Canlı Wizard Karşılaştırması

**Tarih:** 2026-03-20  
**Figma:** https://www.figma.com/design/KZsrlwxIe2ecth1GLSwAmB/Tiramiso?node-id=48278-1569  
**Canlı:** http://localhost:3001/products/new

---

## 🎯 ANA FARKLAR

### 1. **MODAL vs FULL PAGE**

| Figma | Canlı |
|-------|-------|
| ✅ **Modal/Dialog** | ❌ **Full page** |
| Dashboard üzerinde açılır | Ayrı route (`/products/new`) |
| Dashboard context korunur | Dashboard'dan tamamen ayrı |
| Overlay + Modal kutusu | Centered card, gri background |

**🚨 BÜYÜK FARK #1:** Figma'da wizard bir modal, canlıda full page!

---

**🚨 BÜYÜK FARK #2:** Figma'da pill navigation (görsel stepper), canlıda progress bar!

**ÖNEMLİ:** Her ikisi de **linear wizard** (aynı logic). Sadece görsel fark var:
- Figma: 7 pill button (görsel zengin, pill'e tıklayarak geri dön)
- Canlı: İnce progress bar + "1/7" sayı (minimal, sadece back button)

---

### 2. **ADIM GÖSTERGELERİ (KRİTİK FARK!)**

#### Figma — Pill Navigation = GÖRSEL STEP İNDİKATÖRÜ:
```
[Ürünü Anlat] [Tip&Kanallar] [Ürün Profili] [Veri & İzinler] [Launch Hazırlık] [Growth Setup] [Öncelikler]
```
- **7 pill = 7 adım kategorisi** (görsel stepper)
- Pills **görsel indicator** görevi görüyor (hangi adımdasın?)
- Aktif adım: Teal filled
- Geçmiş adımlar: Tıklanabilir (geri dön)
- Gelecek adımlar: Gray outline (henüz ulaşılmamış)

**"Ürünü Anlat" pill'i altında:**
- Soru 1: Ürünün adı nedir?
- Soru 2: Kısa açıklama
- Soru 3: Hangi sorunu çözüyor?
- **"Devam Et"** → Tüm sorular cevaplandı → "Tip & Kanallar" pill'ine ilerle

**"Tip & Kanallar" pill'i altında:**
- Soru 1: Kategori? (SaaS, E-commerce...)
- Soru 2: Hedef kitle?
- Soru 3: Distribution channels?
- **"Devam Et"** → "Ürün Profili" pill'ine ilerle

**Nasıl çalışıyor:**
- Linear ilerliyor (Next/Back buttons)
- Pill'ler **sadece görsel** (hangi kategoridesin?)
- Doldurmuş olduğun pill'e tıklayarak geri dönebilirsin
- İleriye atlayamazsın (gelecek pill'ler disabled)

#### Canlı — Minimal Progress Bar:
```
← Geri dön                1/7
[Progress bar: ▓▓░░░░░]
```
- **Progress bar** (ince çizgi) + sayı
- Pill buttons YOK
- Adım isimleri card içinde: "ADIM 1 — ÜRÜNÜ ANLAT"
- Linear flow (aynı mantık ama görsel farklı)

**🎯 FARK:**
- **Figma:** Pill navigation (görsel zenginlik, hangi adımdasın açıkça belli)
- **Canlı:** Progress bar + sayı (minimal, aynı logic)

---

### 3. **LAYOUT & SPACING**

#### Figma Modal:
- **Width:** ~1440 x 1024px (tam ekran modal)
- **Padding:** Geniş boşluklar
- **Content alignment:** Ortada, yan taraflarda boşluk
- **Başlık:** "Yeni Ürün Oluştur" (merkez, büyük)
- **Alt kısım:** 3 bölüm (Dosya Yükle | URL Tanımla | Boş Başla)

#### Canlı Full Page:
- **Width:** Centered card (~600px max-width)
- **Padding:** Standard padding
- **Background:** Light gray (#f5f5f5?)
- **Başlık:** "ADIM 1 — ÜRÜNÜ ANLAT" (badge style)
- **Alt kısım:** Sadece form + "Devam Et" button

**FARK:** Figma geniş modal, canlı dar centered card.

---

### 4. **İÇERİK & ALANLAR**

#### Figma - İlk Adım:
```
Başlık: "Ürününüzü Kısaca Anlatın"
Alt başlık: "Hangi sorunu çözüyorsunuz, hedef kitleniz kim..."

[Ürününüzün ismi nedir?]
    [Text input: "Ürününüzü kısaca anlatın"]

Alt kısımda:
- 📁 Dosya Yükle
- 🔗 URL Tanımla  
- ➕ Lorem Ipsum (boş başla)
```

#### Canlı - İlk Adım:
```
Badge: "ADIM 1 — ÜRÜNÜ ANLAT"

Ürünün adı *
[örn. TaskFlow, Notey…]

Kısa açıklama
[Ürünün ne yapıyor? Tek cümleyle anlat.]

[Devam Et] button (bottom)
```

**FARKLAR:**
- Figma: Tek text area + 3 seçenek (dosya/URL/boş)
- Canlı: 2 ayrı input (name + description)
- Figma: Daha açıklayıcı placeholder text
- Canlı: Daha minimal, direct

---

### 5. **GÖRSEL STİL**

#### Figma:
- **Border radius:** Büyük (~24px?), yumuşak köşeler
- **Button style:** Pill shape, outline veya filled
- **Colors:** 
  - Teal: `#95DBDA` (aktif)
  - Gray: Soft gray outline
- **Typography:** 
  - Başlık: Bold, büyük
  - Body: Regular, açıklayıcı
- **Icons:** Emoji kullanımı (📁 🔗 ➕)

#### Canlı:
- **Border radius:** 12px (orta)
- **Button style:** Rounded rectangles
- **Colors:**
  - Teal: `#95dbda` (aynı)
  - Gray: `#e8e8e8` (border)
- **Typography:**
  - Başlık: 13px semibold
  - Body: 14px regular
- **Icons:** Yok

**FARK:** Figma daha "playful" (emoji, büyük radius), canlı daha "clean/minimal".

---

### 6. **NAVİGASYON**

#### Figma — Linear Flow + Görsel Pill Indicator:
- **Linear flow:** Next/Back buttons ile adım adım
- **Pill navigation:** Görsel step indicator (hangi adımdasın?)
- Doldurduğun pill'lere tıklayarak **geri dönebilirsin**
- İleriye atlayamazsın (henüz doldurmadığın adımlar disabled)
- **Örnek akış:**
  1. "Ürünü Anlat" pill active → Sorularını doldur → "Devam Et"
  2. "Tip & Kanallar" pill active olur → Sorularını doldur → "Devam Et"
  3. "Ürün Profili" pill active...
  4. İstersen "Ürünü Anlat" pill'ine tıkla, geri dön, düzelt
- **Pill'ler hem indicator hem navigation** (geri dönüş için)
- Modal kapatma (X button sağ üst)

#### Canlı — Linear Flow + Minimal Progress:
- **Sadece "← Geri dön"** (sol üst)
- **"Devam Et"** button (bottom)
- Progress bar + sayı (1/7, 2/7...)
- Geri dönebilirsin ama **pill tıklaması yok**
- İleriye atlama YOK
- Modal değil → Browser back ile çıkış

**🎯 TEMEL FARK:**
- **Figma:** Linear flow + pill visual indicator + pill click navigation (geri dönüş)
- **Canlı:** Linear flow + progress bar + sadece back button

**İkisi de linear ilerliyor ama:**
- Figma pill'ler ile geri dönüş daha kolay/görsel
- Canlıda sadece "← Geri" button var

---

### 7. **KULLANICI AKIŞI**

#### Figma Önerisi:
```
1. Modal açılır
2. 3 seçenekten biri seçilir:
   - Dosya yükle → Import flow
   - URL tanımla → URL input
   - Boş başla → Wizard devam eder
3. Pill navigation ile adımlar arası geçiş
4. Son adımda "Tamamla"
5. Modal kapanır, dashboard güncellenir
```

#### Canlı Uygulama:
```
1. Full page açılır
2. Direkt form doldurma başlar
3. "Devam Et" ile linear akış (1→2→3...)
4. Son adımda "Tamamla"
5. Full page redirect → Dashboard
```

**FARK:** Figma flexible navigation, canlı linear flow.

---

## 📊 DETAYLI KARŞILAŞTIRMA

| Özellik | Figma | Canlı | Durum |
|---------|-------|-------|-------|
| **Format** | Modal dialog | Full page | ❌ Farklı |
| **Width** | ~1440px | ~600px card | ❌ Farklı |
| **Adım navigasyonu** | Pill buttons (7 adım) | Progress bar + sayı | ❌ Farklı |
| **İlk adım içeriği** | 1 text area + 3 seçenek | 2 input (name + desc) | ❌ Farklı |
| **Border radius** | ~24px | 12px | ⚠️ Küçük fark |
| **Renk paleti** | Teal + soft gray | Teal + gray | ✅ Aynı |
| **Typography** | Bold titles, açıklayıcı | Semibold, minimal | ⚠️ Küçük fark |
| **Icons/Emoji** | Var (📁 🔗 ➕) | Yok | ❌ Farklı |
| **Atlama** | Pill'lere tıklayarak | Sadece ileri/geri | ❌ Farklı |
| **Placeholder text** | Uzun açıklamalar | Kısa örnekler | ⚠️ Farklı |
| **Boş adımlar** | Tasarımda tamamlanmış? | Step 4-5-6 boş | ⚠️ Belirsiz |

---

## 🎭 DAVRANIŞSAL FARKLAR

### Figma UX Intent:
- Dashboard context korunur (modal)
- Esnek navigasyon (ileri/geri atlama)
- Başlangıç seçenekleri (import vs scratch)
- Görsel zenginlik (emoji, icons)

### Canlı UX Reality:
- Full page isolation
- Linear flow (sadece next/back)
- Direkt form doldurma
- Minimal, functional

---

## 🤔 NEDEN FARKLI IMPLEMENT EDİLDİ?

### Olası Nedenler:

1. **Pill Navigation → Progress Bar Simplification**
   - Figma: 7 pill buttons (görsel zengin stepper)
   - Canlı: Progress bar + sayı (daha minimal)
   - Pill'ler için UI component gerekir (button states, hover, active, disabled)
   - Progress bar daha az kod, hızlı ship

2. **Modal → Full Page Trade-off**
   - Modal state management zordu
   - Dashboard re-render sorunları
   - Full page daha kolay isolate et
   - Hızlı ship için full page tercih edildi

3. **Pill Click Navigation Ertelendi**
   - Figma: Pill'e tıklayarak geri dön
   - Canlı: Sadece "← Geri" button
   - Pill click için state management (hangi adıma dönülüyor?)
   - Linear back button daha basit

4. **Import Feature Ertelendi**
   - Figma'daki "Dosya Yükle / URL" özelliği Sprint 1'e sığmadı
   - Direkt form input ile başlandı

5. **Design Simplification**
   - Visual stepper → Minimal progress bar
   - Emoji/icon'lar için icon library gerekirdi
   - Minimal versiyon tercih edildi

**🎯 ANA NEDEN:** Pill navigation UI component'i vs minimal progress bar (hız için basitleştirme)

---

## 💡 ÖNERİLER

### Seçenek A: Figma'ya Yaklaştır (İdeal)

**Sprint 3 hedefleri:**

1. **Modal'a Çevir**
   ```tsx
   // Modal component
   // Dashboard üzerinde açılır
   // Overlay + Dialog
   ```

2. **Tab-Based Navigation Ekle** 🎯
   ```tsx
   // 7 soru kategorisi pill buttons
   // Her pill tıklandığında o kategorinin soruları gösterilir
   // Kategoriler arası geçiş serbest (non-linear)
   // Validation: Kategori bazlı
   ```

3. **Soru Kategorilerini Grupla**
   ```tsx
   // "Ürünü Anlat" kategorisi:
   //   - Ürünün adı
   //   - Kısa açıklama  
   //   - Hangi sorunu çözüyor?
   
   // "Tip & Kanallar" kategorisi:
   //   - Kategori (SaaS, E-commerce...)
   //   - Hedef kitle
   //   - Distribution channels
   ```

4. **İlk Adım Seçenekleri (Opsiyonel)**
   ```tsx
   // [ ] Dosya Yükle
   // [ ] URL Tanımla
   // [ ] Boş Başla → Mevcut wizard
   ```

5. **Visual Polish**
   ```tsx
   // Border radius: 24px
   // Emoji ekle (eğer tasarımda varsa)
   // Placeholder metinleri uzat
   ```

**Effort:** Large (~1.5 sprint)  
**Value:** Figma'ya tam alignment, flexible UX

---

### Seçenek B: Hybrid (Pragmatik)

**Sprint 2.5 quick wins:**

1. **Pill Navigation Ekle** ✅ (En görünür fark)
   ```tsx
   // Üstte 7 pill göster (görsel stepper)
   // Aktif pill: filled teal
   // Geçmiş pill'ler: tıklanabilir (geri dön)
   // Gelecek pill'ler: disabled gray
   // Logic: Linear flow (aynı), UI: pill navigation
   ```

2. **Border Radius Artır** ✅ (Kolay)
   ```tsx
   rounded-[12px] → rounded-[20px]
   ```

3. **Placeholder İyileştir** ✅ (Kolay)
   ```
   "örn. TaskFlow" → "Hangi sorunu çözüyorsunuz? Ürününüzü kısaca anlatın"
   ```

4. **Modal'ı Ertele** ⏸️
   - Full page şimdilik kalsın
   - Modal Sprint 3'te

**Effort:** Small (~2-3 gün)  
**Value:** Görsel olarak Figma'ya yakın, logic değişmez

---

### Seçenek C: As-Is (Şimdilik)

**Sprint 2'de değişiklik YOK:**

- Wizard çalışıyor
- Sprint 3'te Figma alignment yapılır
- Şimdi product features öncelikli

**Effort:** Zero

---

## 🎯 TAVSİYE

**Sprint 2 = Seçenek C (As-is)**
- Wizard functional, büyük sorun yok
- Sprint 2 product feature'larına odaklan

**Sprint 3 = Seçenek B (Hybrid)**
- Pill navigation ekle (görsel alignment)
- Border radius + placeholder polish
- Modal'ı Sprint 4'e ertele

**Sprint 4 = Seçenek A (Full Alignment)**
- Modal'a çevir
- Import feature ekle
- Tam Figma alignment

---

## 📸 SCREENSHOT KANITLARI

### Figma:
- Modal format ✅
- Pill navigation (7 adım) ✅
- "Yeni Ürün Oluştur" başlık ✅
- 3 seçenek altta (📁 🔗 ➕) ✅

### Canlı:
- Full page format ✅
- Progress bar + "1/7" ✅
- "ADIM 1 — ÜRÜNÜ ANLAT" badge ✅
- Sadece form inputs ✅

---

## 🚀 AKSIYONLAR

**Hemen yapılabilir (Sprint 2 sonu):**
```
1. Pill navigation ekle (görsel only, non-interactive)
2. Border radius artır (12px → 20px)
3. Placeholder metinleri Figma'ya göre güncelle
```

**Sprint 3 backlog:**
```
1. Modal'a çevir
2. Interactive pill navigation
3. Import feature (dosya yükle / URL)
```

**Karar ver:**
- Sprint 2'de değişiklik yapılsın mı?
- Yoksa Sprint 3'e mi ertelensin?

---

**Özet:** 

**TEMEL FARK:** Figma'da pill navigation (görsel stepper), canlıda progress bar.

**Her ikisi de linear wizard** (adım adım ilerliyor) ama:
- Figma: Pill buttons ile geri dönüş kolay, görsel zengin
- Canlı: Progress bar + back button, minimal

**Diğer farklar:** Modal vs full page, border radius, placeholder metinleri.

**Her ikisi de functional ve aynı logic.** Sadece UI/görsel fark var.

**Tavsiye:** Sprint 2.5'te pill navigation ekle (2-3 gün effort), Figma'ya görsel alignment sağlanır.
