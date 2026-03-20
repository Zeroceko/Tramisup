# Wizard Implementation Analizi

**Tarih:** 2026-03-20  
**Commit:** f116486  
**Dosya:** `app/products/new/page.tsx` (411 satır)

---

## 🔍 MEVCUT WIZARD YAPISI

### 7 Adım (STEPS)
```typescript
const STEPS = [
  "Ürünü Anlat",        // Step 1: name, description
  "Tipi & Kanallar",    // Step 2: category (SaaS, E-commerce, etc.)
  "Ürün Profili",       // Step 3: targetAudience, businessModel
  "Veri & İzinler",     // Step 4: (boş içerik - placeholder)
  "Launch Hazırlık",    // Step 5: (boş içerik - placeholder)
  "Growth Setup",       // Step 6: (boş içerik - placeholder)
  "Diğerleri",          // Step 7: website, launchGoals
];
```

### Gerçek Veri Toplanan Alanlar
```typescript
type WizardData = {
  name: string;              // ✅ Step 1
  description: string;       // ✅ Step 1
  category: string;          // ✅ Step 2
  targetAudience: string;    // ✅ Step 3
  businessModel: string;     // ✅ Step 3
  website: string;           // ✅ Step 7
  launchGoals: string[];     // ✅ Step 7
};
```

### Boş Adımlar (Placeholder)
- **Step 4:** "Veri & İzinler" → İçerik yok
- **Step 5:** "Launch Hazırlık" → İçerik yok
- **Step 6:** "Growth Setup" → İçerik yok

**Render mantığı:**
```tsx
{step === 4 && (
  <p className="text-[13px] text-[#666d80]">
    Bu adım şu an kullanılmıyor. İlerle'ye tıkla.
  </p>
)}
```

---

## 🎨 UI BİLEŞENLERİ

### OptionButton (Radio)
```tsx
<OptionButton selected={...} onClick={...}>
  {option}
</OptionButton>
```
- Yuvarlak seçici (radio)
- Tıklandığında tek seçim
- Kullanıldığı yerler: category, targetAudience, businessModel

### CheckButton (Checkbox)
```tsx
<CheckButton selected={...} onClick={...}>
  {goal}
</CheckButton>
```
- Kare seçici (checkbox)
- Çoklu seçim
- Kullanıldığı yer: launchGoals

### Progress Bar
```tsx
<div className="w-full bg-[#e8e8e8] rounded-full h-[6px]">
  <div
    className="bg-[#95dbda] h-[6px] rounded-full transition-all duration-300"
    style={{ width: `${(step / STEPS.length) * 100}%` }}
  />
</div>
```

### Navigasyon
- **Geri:** Her adımda (step > 1)
- **İleri:** Zorunlu alanlar dolduysa aktif
- **Tamamla:** Son adımda

---

## 🚨 OLASI SORUNLAR

### 1. **Figma'da Farklı Adım Sayısı?**
Eğer Figma'da:
- **3-4 adım** varsa → Canlıda 7 adım (4 tanesi boş)
- **Farklı başlıklar** varsa → Başlıklar TR: "Ürünü Anlat", "Tipi & Kanallar", vb.

### 2. **Farklı Soru Sırası?**
Canlıdaki sıra:
1. Ad + Açıklama
2. Kategori
3. Hedef Kitle + İş Modeli
4-6. (Boş)
7. Website + Launch Goals

Figma farklı sırada veya gruplandırmışsa tutarsızlık olabilir.

### 3. **Farklı UI Stili?**
Canlıda:
- **Border radius:** 12px
- **Renkler:** `#95dbda` (teal), `#e8e8e8` (border)
- **Font:** 13-14px, medium weight
- **Spacing:** gap-3, py-3, px-4

Figma'da daha yuvarlak köşeler, farklı renkler veya spacing varsa görsel fark olur.

### 4. **Placeholder Adımlar**
Step 4-5-6 boş. Figma'da bu adımlar tam içerikli tasarlanmışsa, canlıda "skip" olarak implement edilmiş.

---

## 🔧 FARKLAR NASIL BULUNUR?

### Yöntem 1: Screenshot Karşılaştırma
```bash
# Canlıyı aç
open http://localhost:3001/products/new

# Screenshot al
# Figma'yı aç, wizard frame'ini screenshot al
# Yan yana koy
```

### Yöntem 2: Figma Inspect
Figma'da wizard frame'i seç → Inspect (Code tab):
- Width/height değerleri
- Border radius
- Colors (hex)
- Font size/weight
- Spacing (padding, gap)

Canlıdaki Tailwind class'larıyla karşılaştır:
```tsx
rounded-[12px]     → Figma: 12px mi?
border-[#e8e8e8]   → Figma: #E8E8E8 mi?
text-[14px]        → Figma: 14px mi?
gap-3              → Figma: 12px mi? (gap-3 = 12px)
```

### Yöntem 3: Dev Tools Overlay
```bash
# Canlıda wizard'ı aç
# Dev tools → Elements
# Figma'yı %50 opacity yap, browser üstüne overlay et
# Piksel karşılaştırması
```

---

## 📋 SONRAKİ ADIMLAR

### Seçenek A: Figma'yı Referans Al
```
1. Figma wizard tasarımını incele
2. Canlıdaki farkları listele
3. Sprint 2.5 veya Sprint 3'te düzeltme planı
```

### Seçenek B: Canlıyı İyileştir
```
1. Boş adımları (4-5-6) kaldır veya doldur
2. UI polish (spacing, colors, transitions)
3. Figma'yı güncelle (as-built)
```

### Seçenek C: Hybrid
```
1. Figma'dan iyi parçaları al
2. Canlıdaki çalışan logic'i koru
3. Sprint 3'te wizard v2 olarak ship et
```

---

## 💡 HIZLI FIX İÇİN

Eğer Figma'daki sadece **3-4 adım** varsa:

```tsx
// app/products/new/page.tsx
const STEPS = [
  "Ürünü Anlat",
  "Hedef Kitle",
  "Launch Hazırlık",
]; // 7 yerine 3 adım

// Step 4-5-6 logic'ini kaldır
```

Eğer **UI stili** farklıysa:

```tsx
// Tailwind değerlerini Figma'ya göre ayarla
className="rounded-[16px]"  // 12px → 16px
className="border-[#d0d0d0]" // #e8e8e8 → #d0d0d0
className="text-[16px]"     // 14px → 16px
```

---

## 🎯 SONUÇ

**Wizard canlıda çalışıyor ama:**
- 7 adım var (4 tanesi boş placeholder)
- UI detayları Figma'dan farklı olabilir
- Adım başlıkları Türkçe

**Figma'yı görmeden kesin analiz zor.**

Öneri: Figma linkini veya screenshot'ı paylaş, kesin farkları bulalım. 👀
